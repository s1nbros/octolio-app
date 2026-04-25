// ───────────────────────────────────────────────────────────────
// lessonGenerator.ts
// Generates a fresh Duolingo-style finance lesson on any topic.
//
// Flow:
//   1. fetchTheorySeed(topic)       – pulls a short factual seed from
//                                      Wikipedia (finance articles)
//   2. authorLesson(topic, seed)    – asks Claude to turn that seed
//                                      into 1 theory block + ≥7 varied
//                                      interactive exercises matching
//                                      the existing Lesson schema
//   3. dedupe(lesson)               – rejects exercises whose fingerprint
//                                      has been seen before (no repeats
//                                      across generations)
//   4. returns a fully-typed Lesson ready for the frontend
// ───────────────────────────────────────────────────────────────

import Anthropic from '@anthropic-ai/sdk';
import crypto from 'crypto';
import type { Lesson, Exercise, LocalizedText, Module } from '../data/lessons';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Persistent fingerprint memory so exercises don't repeat across calls.
// Swap to Redis/Postgres if you need it shared across instances.
const seenFingerprints = new Set<string>();

const EXERCISE_TYPES: Exercise['type'][] = [
  'theory', 'choice', 'fill_blank',
  'budget_slider', 'rpg_scenario',
  'rat_race', 'compound_sim', 'sort_items',
];

// ─────────────────── 1. THEORY SEED ───────────────────
// Free, keyless, covers finance topics well.
async function fetchTheorySeed(topic: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(topic)}`;
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Octolio/1.0' } });
    if (!r.ok) return '';
    const j = (await r.json()) as { extract?: string };
    return (j.extract ?? '').slice(0, 1800);
  } catch {
    return '';
  }
}

// ─────────────────── 2. AUTHOR VIA CLAUDE ───────────────────
function buildPrompt(topic: string, seed: string, avoid: string[]): string {
  return `You are a lesson designer for "Octolio", a Duolingo-style finance-learning app.
Produce ONE lesson on the topic: "${topic}".

The lesson must match this TypeScript type exactly (return JSON only, no prose):

type LocalizedText = { en: string; bg: string };
type TheorySlide   = { title: LocalizedText; body: LocalizedText; emoji?: string; highlight?: LocalizedText };
type Exercise = {
  id: string;
  type: 'theory'|'choice'|'fill_blank'|'budget_slider'|'rpg_scenario'|'rat_race'|'compound_sim'|'sort_items';
  xp: number;
  slides?: TheorySlide[];                       // theory
  question?: LocalizedText;                     // choice / fill_blank
  options?: LocalizedText[];
  correctIndex?: number;
  correctAnswer?: number; answerMin?: number; answerMax?: number; answerUnit?: string;
  explanation?: LocalizedText;
  income?: number;                              // budget_slider
  categories?: { label: LocalizedText; emoji: string; min: number; max: number; ideal: number }[];
  scenario?: LocalizedText; avatar?: string;    // rpg_scenario
  choices?: { label: LocalizedText; emoji: string; consequence: LocalizedText; cashFlowChange: number; isGood: boolean }[];
  ratRaceProfile?: {
    name: LocalizedText; job: LocalizedText; avatar: string; monthlyIncome: number;
    expenses: { label: LocalizedText; emoji: string; amount: number }[];
    opportunities: { label: LocalizedText; emoji: string; cost: number; monthlyPassive: number; isGood: boolean }[];
  };
  compoundConfig?: { defaultPrincipal: number; defaultRate: number; defaultYears: number; defaultMonthly: number };
  sortItems?: { label: LocalizedText; emoji: string; isAsset: boolean }[];
};
type Lesson = {
  id: string; moduleId: string;
  title: LocalizedText; description: LocalizedText;
  icon: string; xpReward: number; order: number;
  exercises: Exercise[];
};

HARD REQUIREMENTS:
• The FIRST exercise MUST be type:'theory' with 2–3 rich TheorySlide entries
  grounded in this factual seed: """${seed || '(no seed — use reliable finance knowledge)'}"""
• Then at LEAST 7 more interactive exercises — mix at least 4 different non-theory types
  drawn from: choice, fill_blank, budget_slider, rpg_scenario, rat_race, compound_sim, sort_items.
• Every exercise must be PLAYFUL, specific to "${topic}", and teach a concrete idea.
• Every LocalizedText must have both en AND bg (Bulgarian) filled in.
• xpReward = sum of all exercise xp. Typical xp: theory 0, choice/fill_blank 15, sort 20, slider 25, rpg 25, rat_race 30, compound 30.
• id format: kebab-case slug derived from topic + short suffix. moduleId = '${slugify(topic)}'.
• icon = a single emoji.
• DO NOT reuse any of these previously-generated prompts/scenarios: ${JSON.stringify(avoid).slice(0, 1500)}

Return ONLY valid JSON for the Lesson object — no markdown fences, no commentary.`;
}

async function authorLesson(topic: string, seed: string, avoid: string[]): Promise<Lesson> {
  const msg = await anthropic.messages.create({
    model: 'claude-opus-4-7',
    max_tokens: 8000,
    messages: [{ role: 'user', content: buildPrompt(topic, seed, avoid) }],
  });
  const text = msg.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map(b => b.text).join('');
  const json = text.replace(/^```(?:json)?\s*|\s*```$/g, '').trim();
  return JSON.parse(json) as Lesson;
}

// ─────────────────── 3. DEDUPE ───────────────────
function fingerprint(ex: Exercise): string {
  const salient =
    (ex.question && ex.question.en) ||
    (ex.scenario && ex.scenario.en) ||
    (ex.slides && ex.slides.map(s => s.title.en).join('|')) ||
    (ex.sortItems && ex.sortItems.map(s => s.label.en).join('|')) ||
    JSON.stringify(ex).slice(0, 200);
  return crypto.createHash('sha1').update(`${ex.type}:${salient}`).digest('hex');
}

function dedupe(lesson: Lesson): Lesson {
  const kept: Exercise[] = [];
  for (const ex of lesson.exercises) {
    const fp = fingerprint(ex);
    if (seenFingerprints.has(fp)) continue;
    seenFingerprints.add(fp);
    kept.push(ex);
  }
  return { ...lesson, exercises: kept };
}

// ─────────────────── 4. VALIDATE ───────────────────
function validate(lesson: Lesson): void {
  if (!lesson.exercises?.length) throw new Error('No exercises produced');
  if (lesson.exercises[0].type !== 'theory') throw new Error('First exercise must be theory');
  const nonTheory = lesson.exercises.filter(e => e.type !== 'theory');
  if (nonTheory.length < 7) throw new Error(`Need ≥7 interactive exercises, got ${nonTheory.length}`);
  const kinds = new Set(nonTheory.map(e => e.type));
  if (kinds.size < 4) throw new Error('Need at least 4 distinct non-theory exercise types');
  for (const e of lesson.exercises) {
    if (!EXERCISE_TYPES.includes(e.type)) throw new Error(`Unknown type: ${e.type}`);
  }
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 40);
}

// ─────────────────── PUBLIC ENTRYPOINT ───────────────────
export async function generateLesson(topic: string): Promise<Lesson> {
  const seed = await fetchTheorySeed(topic);

  // Give Claude a short list of prior prompts to avoid repeating.
  const avoid = [...seenFingerprints].slice(-40);

  // Up to 2 attempts — if dedupe strips too many, regenerate once.
  for (let attempt = 0; attempt < 2; attempt++) {
    const raw = await authorLesson(topic, seed, avoid);
    const clean = dedupe(raw);
    try {
      validate(clean);
      return clean;
    } catch (err) {
      if (attempt === 1) throw err;
    }
  }
  throw new Error('unreachable');
}

export function clearSeenFingerprints() { seenFingerprints.clear(); }

// ─────────────────── MODULE GENERATION ───────────────────
// Meta the caller provides; lessons are generated from the topic list.
export interface ModuleSpec {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  color: string;
  order: number;
  proOnly?: boolean;
  lessonTopics: string[];      // one lesson per topic (≥ 2 recommended)
  lessonIcons?: string[];      // optional emoji per lesson
}

export async function generateModule(spec: ModuleSpec): Promise<Module> {
  const lessons: Lesson[] = [];
  for (let i = 0; i < spec.lessonTopics.length; i++) {
    const topic = spec.lessonTopics[i];
    const lesson = await generateLesson(topic);
    // Force lesson fields to align with the module spec
    lesson.moduleId = spec.id;
    lesson.order = i + 1;
    if (spec.lessonIcons?.[i]) lesson.icon = spec.lessonIcons[i];
    lessons.push(lesson);
  }
  return {
    id: spec.id,
    title: spec.title,
    description: spec.description,
    icon: spec.icon,
    color: spec.color,
    order: spec.order,
    proOnly: spec.proOnly ?? false,
    lessons,
  };
}
