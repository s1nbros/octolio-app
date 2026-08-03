import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, TextInput, View } from 'react-native';
import Slider from '@react-native-community/slider';
import Svg, { Circle, Defs, LinearGradient, Line as SvgLine, Path, Stop } from 'react-native-svg';
import { Button } from '../lib/ui';
import { ExplainMistake } from './ExplainMistake';
import { colors, radius, spacing } from '../lib/theme';

const en = (v: any): string => (v && typeof v === 'object' ? v.en ?? '' : v ?? '');
type Answer = (correct: boolean, xp: number) => void;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function Prompt({ text }: { text: string }) {
  return <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: spacing.md }}>{text}</Text>;
}
function ResultBar({ correct, onContinue }: { correct: boolean; onContinue: () => void }) {
  if (correct) return <Text style={{ color: colors.green, fontWeight: '800', textAlign: 'center', marginTop: spacing.sm }}>✓ Correct!</Text>;
  return (
    <View style={{ marginTop: spacing.sm }}>
      <Text style={{ color: colors.red, fontWeight: '800', textAlign: 'center', marginBottom: spacing.sm }}>✗ Not quite</Text>
      <Button title="Continue" onPress={onContinue} />
    </View>
  );
}

/* ── sort_items: Assets vs Liabilities ─────────────────────── */
export function SortItems({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const items: any[] = exercise.sortItems ?? [];
  const [pick, setPick] = useState<Record<number, boolean>>({});
  const [checked, setChecked] = useState<null | boolean>(null);
  const allPicked = Object.keys(pick).length === items.length;

  const check = () => {
    const correct = items.every((it, i) => pick[i] === it.isAsset);
    setChecked(correct);
    if (correct) setTimeout(() => onAnswer(true, exercise.xp), 800);
  };

  return (
    <View>
      <Prompt text={en(exercise.question) || 'Sort each item: asset or liability?'} />
      {items.map((it, i) => (
        <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 20 }}>{it.emoji}</Text>
          <Text style={{ color: colors.fg, flex: 1 }}>{en(it.label)}</Text>
          {[{ v: true, t: 'Asset' }, { v: false, t: 'Liability' }].map(({ v, t }) => {
            const sel = pick[i] === v;
            const showRight = checked !== null && it.isAsset === v;
            return (
              <Pressable key={t} disabled={checked !== null} onPress={() => setPick((p) => ({ ...p, [i]: v }))}
                style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.sm, borderWidth: 1.5,
                  borderColor: showRight ? colors.green : sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.card }}>
                <Text style={{ color: colors.fg, fontSize: 12, fontWeight: '700' }}>{t}</Text>
              </Pressable>
            );
          })}
        </View>
      ))}
      {checked === null ? <Button title="Check" onPress={check} disabled={!allPicked} /> : <ResultBar correct={checked} onContinue={() => onAnswer(false, 0)} />}
    </View>
  );
}

/* ── match_terms: tap term then its definition ─────────────── */
export function MatchTerms({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const pairs: any[] = exercise.matchPairs ?? [];
  const defs = useMemo(() => shuffle(pairs.map((p, i) => ({ text: p.definition, orig: i }))), [exercise.id]);
  const [sel, setSel] = useState<number | null>(null);
  const [match, setMatch] = useState<Record<number, number>>({});
  const [checked, setChecked] = useState<null | boolean>(null);
  const used = new Set(Object.values(match));

  const tapDef = (orig: number) => {
    if (checked !== null || sel === null || used.has(orig)) return;
    const next = { ...match, [sel]: orig };
    setMatch(next); setSel(null);
    if (Object.keys(next).length === pairs.length) {
      const correct = pairs.every((_, i) => next[i] === i);
      setChecked(correct);
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 800);
    }
  };

  return (
    <View>
      <Prompt text={en(exercise.question) || 'Match each term to its definition.'} />
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <View style={{ flex: 1, gap: spacing.sm }}>
          {pairs.map((p, i) => {
            const matched = match[i] !== undefined;
            return (
              <Pressable key={i} disabled={checked !== null || matched} onPress={() => setSel(i)}
                style={{ padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1.5, borderColor: sel === i ? colors.primary : matched ? colors.green : colors.border, backgroundColor: colors.card, opacity: matched ? 0.6 : 1 }}>
                <Text style={{ color: colors.fg, fontSize: 13 }}>{en(p.term)}</Text>
              </Pressable>
            );
          })}
        </View>
        <View style={{ flex: 1.3, gap: spacing.sm }}>
          {defs.map((d) => (
            <Pressable key={d.orig} disabled={checked !== null || used.has(d.orig)} onPress={() => tapDef(d.orig)}
              style={{ padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1.5, borderColor: used.has(d.orig) ? colors.green : colors.border, backgroundColor: colors.bgElevated, opacity: used.has(d.orig) ? 0.6 : 1 }}>
              <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{en(d.text)}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      {checked === false && <ResultBar correct={false} onContinue={() => onAnswer(false, 0)} />}
      {checked === true && <ResultBar correct onContinue={() => {}} />}
    </View>
  );
}

/* ── order_items: tap to build the sequence ────────────────── */
export function OrderItems({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const items: any[] = exercise.orderItems ?? [];
  const correctOrder: number[] = exercise.correctOrder ?? items.map((_, i) => i);
  const [seq, setSeq] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  const add = (i: number) => { if (checked === null && !seq.includes(i)) setSeq((s) => [...s, i]); };
  const remove = (i: number) => { if (checked === null) setSeq((s) => s.filter((x) => x !== i)); };
  const check = () => {
    const correct = seq.length === correctOrder.length && seq.every((v, idx) => v === correctOrder[idx]);
    setChecked(correct);
    if (correct) setTimeout(() => onAnswer(true, exercise.xp), 800);
  };

  return (
    <View>
      <Prompt text={en(exercise.orderInstruction) || en(exercise.question) || 'Put these in the correct order.'} />
      <View style={{ marginBottom: spacing.md, gap: spacing.sm }}>
        {seq.map((i, pos) => (
          <Pressable key={i} onPress={() => remove(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1.5, borderColor: colors.primary, backgroundColor: colors.primarySoft }}>
            <Text style={{ color: colors.primary, fontWeight: '800' }}>{pos + 1}.</Text>
            <Text style={{ fontSize: 18 }}>{items[i].emoji}</Text>
            <Text style={{ color: colors.fg, flex: 1 }}>{en(items[i].label)}</Text>
          </Pressable>
        ))}
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {items.map((it, i) => seq.includes(i) ? null : (
          <Pressable key={i} onPress={() => add(i)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.sm, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }}>
            <Text style={{ fontSize: 16 }}>{it.emoji}</Text><Text style={{ color: colors.fg, fontSize: 13 }}>{en(it.label)}</Text>
          </Pressable>
        ))}
      </View>
      {checked === null ? <Button title="Check" onPress={check} disabled={seq.length !== items.length} /> : <ResultBar correct={checked} onContinue={() => onAnswer(false, 0)} />}
    </View>
  );
}

/* ── swipe_sort: binary sort, one card at a time ───────────── */
export function SwipeSort({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.swipeSort ?? {};
  const cards: any[] = cfg.cards ?? [];
  const [idx, setIdx] = useState(0);
  const [mistakes, setMistakes] = useState(0);
  const [flash, setFlash] = useState<null | boolean>(null);
  const done = idx >= cards.length;

  const choose = (right: boolean) => {
    if (flash !== null) return;
    const card = cards[idx];
    const ok = right === card.isRight;
    if (!ok) setMistakes((m) => m + 1);
    setFlash(ok);
    setTimeout(() => { setFlash(null); setIdx((i) => i + 1); }, 600);
  };

  if (done) {
    const pass = mistakes <= 1;
    return (
      <View>
        <Text style={{ color: pass ? colors.green : colors.red, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md }}>
          {pass ? `✓ Nice — ${cards.length - mistakes}/${cards.length}` : `${cards.length - mistakes}/${cards.length} correct`}
        </Text>
        <Button title="Continue" onPress={() => onAnswer(pass, pass ? exercise.xp : 0)} />
      </View>
    );
  }

  const card = cards[idx];
  return (
    <View>
      <Prompt text={en(cfg.prompt)} />
      <View style={{ backgroundColor: flash === true ? colors.greenSoft : flash === false ? 'rgba(224,87,95,0.15)' : colors.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md }}>
        {card.emoji ? <Text style={{ fontSize: 44, marginBottom: spacing.sm }}>{card.emoji}</Text> : null}
        <Text style={{ color: colors.fg, fontSize: 17, fontWeight: '700', textAlign: 'center' }}>{en(card.label)}</Text>
      </View>
      <Text style={{ color: colors.fgSubtle, textAlign: 'center', fontSize: 12, marginBottom: spacing.sm }}>{idx + 1} / {cards.length}</Text>
      <View style={{ flexDirection: 'row', gap: spacing.sm }}>
        <Pressable onPress={() => choose(false)} disabled={flash !== null} style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' }}><Text style={{ color: colors.fg, fontWeight: '800' }}>← {en(cfg.leftLabel)}</Text></Pressable>
        <Pressable onPress={() => choose(true)} disabled={flash !== null} style={{ flex: 1, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, alignItems: 'center' }}><Text style={{ color: colors.fg, fontWeight: '800' }}>{en(cfg.rightLabel)} →</Text></Pressable>
      </View>
    </View>
  );
}

/* ── speed_round: timed rapid-fire ─────────────────────────── */
export function SpeedRound({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.speedRound ?? {};
  const questions: any[] = cfg.questions ?? [];
  const perQ = cfg.secondsPerQuestion ?? 8;
  const passScore = cfg.passScore ?? 0.6;
  const [idx, setIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(perQ);
  const [locked, setLocked] = useState(false);
  const done = idx >= questions.length;
  const timer = useRef<any>(null);

  useEffect(() => {
    if (done || locked) return;
    setTime(perQ);
    timer.current = setInterval(() => setTime((t: number) => {
      if (t <= 1) { clearInterval(timer.current); advance(false); return perQ; }
      return t - 1;
    }), 1000);
    return () => clearInterval(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, done]);

  const advance = (correct: boolean) => {
    if (locked) return;
    setLocked(true);
    clearInterval(timer.current);
    if (correct) setScore((s) => s + 1);
    setTimeout(() => { setLocked(false); setIdx((i) => i + 1); }, 350);
  };

  if (done) {
    const pass = score / Math.max(1, questions.length) >= passScore;
    return (
      <View>
        <Text style={{ color: pass ? colors.green : colors.red, fontSize: 18, fontWeight: '800', textAlign: 'center', marginBottom: spacing.md }}>{pass ? '✓' : '✗'} {score}/{questions.length}</Text>
        <Button title="Continue" onPress={() => onAnswer(pass, pass ? exercise.xp : 0)} />
      </View>
    );
  }

  const q = questions[idx];
  return (
    <View>
      <Prompt text={en(cfg.prompt) || 'Speed round!'} />
      <View style={{ height: 6, backgroundColor: colors.glass, borderRadius: 3, overflow: 'hidden', marginBottom: spacing.md }}>
        <View style={{ height: 6, width: `${(time / perQ) * 100}%`, backgroundColor: time <= 3 ? colors.red : colors.primary, borderRadius: 3 }} />
      </View>
      <Text style={{ color: colors.fg, fontSize: 16, fontWeight: '700', marginBottom: spacing.md }}>{idx + 1}. {en(q.q)}</Text>
      {(q.options ?? []).map((o: any, i: number) => (
        <Pressable key={i} disabled={locked} onPress={() => advance(i === q.correctIndex)}
          style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.card, marginBottom: spacing.sm }}>
          <Text style={{ color: colors.fg }}>{en(o)}</Text>
        </Pressable>
      ))}
    </View>
  );
}

/* ── rpg_scenario: branching-story financial decision ──────── */
export function RpgScenario({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const choices: any[] = exercise.choices ?? [];
  const [chosen, setChosen] = useState<number | null>(null);
  const selected = chosen !== null ? choices[chosen] : null;

  const pick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    if (choices[i]?.isGood) setTimeout(() => onAnswer(true, exercise.xp), 2000);
  };

  return (
    <View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ fontSize: 30 }}>{exercise.avatar ?? '🧑'}</Text>
        <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22, flex: 1 }}>{en(exercise.scenario)}</Text>
      </View>
      <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm }}>What do you do?</Text>
      {choices.map((c, i) => {
        const isPicked = chosen === i;
        const border = isPicked ? (c.isGood ? colors.green : colors.red) : colors.border;
        return (
          <Pressable key={i} disabled={chosen !== null} onPress={() => pick(i)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: isPicked ? (c.isGood ? colors.greenSoft : colors.redSoft) : colors.card, opacity: chosen !== null && !isPicked ? 0.4 : 1, marginBottom: spacing.sm }}>
            <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
            <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600', flex: 1 }}>{en(c.label)}</Text>
            {isPicked ? <Text style={{ fontSize: 18 }}>{c.isGood ? '✅' : '❌'}</Text> : null}
          </Pressable>
        );
      })}
      {selected ? (
        <View style={{ backgroundColor: selected.isGood ? colors.greenSoft : colors.redSoft, borderRadius: radius.md, borderWidth: 1, borderColor: selected.isGood ? colors.green : colors.red, padding: spacing.md, marginTop: spacing.xs }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
            <Text style={{ fontSize: 16, marginRight: 6 }}>{selected.isGood ? '💡' : '⚠️'}</Text>
            <Text style={{ color: selected.isGood ? colors.green : colors.red, fontWeight: '800', fontSize: 14 }}>{selected.isGood ? 'Good move!' : 'Ouch...'}</Text>
            {selected.cashFlowChange ? (
              <Text style={{ marginLeft: 'auto', fontWeight: '800', color: selected.cashFlowChange > 0 ? colors.green : colors.red }}>
                {selected.cashFlowChange > 0 ? '+' : ''}€{Math.abs(selected.cashFlowChange)}
              </Text>
            ) : null}
          </View>
          <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(selected.consequence)}</Text>
        </View>
      ) : null}
      {selected && !selected.isGood ? (
        <View style={{ marginTop: spacing.md }}>
          <ExplainMistake exercise={exercise} userAnswer={en(selected.label)} />
          <Button title="Continue" onPress={() => onAnswer(false, 0)} />
        </View>
      ) : null}
    </View>
  );
}

/* ── boss_battle: module capstone duel ─────────────────────── */
const PLAYER_HP = 3;
export function BossBattle({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.bossBattle ?? {};
  const questions: any[] = cfg.questions ?? [];
  const bossMaxHp = Math.max(1, questions.length - 2);
  const [phase, setPhase] = useState<'intro' | 'battle' | 'won' | 'lost'>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [hearts, setHearts] = useState(PLAYER_HP);

  const reset = () => { setPhase('battle'); setQIdx(0); setPicked(null); setBossHp(bossMaxHp); setHearts(PLAYER_HP); };
  const q = questions[qIdx];

  const advance = () => {
    setPicked(null);
    if (qIdx + 1 >= questions.length) setPhase(bossHp <= 0 ? 'won' : 'lost');
    else setQIdx((n) => n + 1);
  };

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === q.correctIndex) {
      const nextBoss = bossHp - 1;
      setBossHp(nextBoss);
      setTimeout(() => { if (nextBoss <= 0) setPhase('won'); else advance(); }, 800);
    } else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      if (nextHearts <= 0) setTimeout(() => setPhase('lost'), 900);
    }
  };

  if (phase === 'intro') {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ color: colors.red, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: spacing.sm }}>⚔️ Boss Battle</Text>
        <Text style={{ fontSize: 64, marginBottom: spacing.sm }}>{cfg.boss?.emoji}</Text>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '900', marginBottom: spacing.sm, textAlign: 'center' }}>{en(cfg.boss?.name)}</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21, textAlign: 'center', marginBottom: spacing.lg }}>{en(cfg.intro)}</Text>
        <View style={{ alignSelf: 'stretch' }}><Button title="Begin battle ⚔️" onPress={() => setPhase('battle')} /></View>
      </View>
    );
  }
  if (phase === 'won') {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 56, marginBottom: spacing.sm }}>{cfg.badge?.emoji}</Text>
        <Text style={{ color: colors.green, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 4 }}>Victory · badge earned</Text>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '900', marginBottom: spacing.sm, textAlign: 'center' }}>{en(cfg.badge?.label)}</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' }}>You defeated {en(cfg.boss?.name)}!</Text>
        <View style={{ alignSelf: 'stretch' }}><Button title="Claim reward →" onPress={() => onAnswer(true, exercise.xp)} /></View>
      </View>
    );
  }
  if (phase === 'lost') {
    return (
      <View style={{ alignItems: 'center' }}>
        <Text style={{ fontSize: 56, marginBottom: spacing.sm, opacity: 0.6 }}>{cfg.boss?.emoji}</Text>
        <Text style={{ color: colors.red, fontSize: 20, fontWeight: '800', marginBottom: 4 }}>The boss got you!</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 14, marginBottom: spacing.lg, textAlign: 'center' }}>Shake it off and try again — you know this.</Text>
        <View style={{ alignSelf: 'stretch' }}><Button title="↻ Try again" onPress={reset} /></View>
      </View>
    );
  }

  const revealed = picked !== null;
  const wasWrong = revealed && picked !== q.correctIndex;
  const bossPct = (bossHp / bossMaxHp) * 100;
  return (
    <View>
      <View style={{ backgroundColor: colors.redSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.red, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 28 }}>{cfg.boss?.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 14 }} numberOfLines={1}>{en(cfg.boss?.name)}</Text>
            <View style={{ height: 9, borderRadius: 5, marginTop: 4, backgroundColor: colors.glass, overflow: 'hidden' }}>
              <View style={{ height: 9, width: `${bossPct}%`, backgroundColor: colors.red, borderRadius: 5 }} />
            </View>
          </View>
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 3 }}>
          {Array.from({ length: PLAYER_HP }).map((_, i) => (
            <Text key={i} style={{ fontSize: 16, opacity: i < hearts ? 1 : 0.25 }}>❤️</Text>
          ))}
        </View>
      </View>
      <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>Hit {qIdx + 1}</Text>
      <Text style={{ color: colors.fg, fontSize: 16, fontWeight: '700', lineHeight: 23, marginBottom: spacing.md }}>{en(q?.q)}</Text>
      {(q?.options ?? []).map((opt: any, i: number) => {
        const isCorrect = revealed && i === q.correctIndex;
        const isWrongPick = revealed && i === picked && picked !== q.correctIndex;
        const border = isCorrect ? colors.green : isWrongPick ? colors.red : colors.border;
        return (
          <Pressable key={i} disabled={revealed} onPress={() => pick(i)}
            style={{ flexDirection: 'row', alignItems: 'center', padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: isCorrect ? colors.greenSoft : isWrongPick ? colors.redSoft : colors.card, marginBottom: spacing.sm }}>
            <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600', flex: 1 }}>{en(opt)}</Text>
            {isCorrect ? <Text>✓</Text> : isWrongPick ? <Text>✗</Text> : null}
          </Pressable>
        );
      })}
      {wasWrong && hearts > 0 ? (
        <View>
          {q.explanation ? (
            <View style={{ backgroundColor: colors.redSoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.red, padding: spacing.md, marginTop: spacing.xs, marginBottom: spacing.md }}>
              <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(q.explanation)}</Text>
            </View>
          ) : null}
          <Button title="Continue →" onPress={advance} />
        </View>
      ) : null}
    </View>
  );
}

/* ── stock_chart: tap-the-point / identify-pattern price chart ─ */
export function StockChart({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.stockChart ?? {};
  const prices: number[] = cfg.prices ?? [];
  const labels: string[] = cfg.labels ?? prices.map((_, i) => `${i + 1}`);
  const mode = cfg.mode;
  const [pointIdx, setPointIdx] = useState<number | null>(null);
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [chartW, setChartW] = useState(0);

  const min = useMemo(() => Math.min(...prices), [prices]);
  const max = useMemo(() => Math.max(...prices), [prices]);
  const range = max - min || 1;
  const H = 200;
  const padX = 10;
  const padY = 12;
  const xAt = (i: number) => padX + (i / Math.max(1, prices.length - 1)) * (chartW - padX * 2);
  const yAt = (v: number) => H - padY - ((v - min) / range) * (H - padY * 2);
  const path = prices.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ');
  const areaPath = chartW ? `${path} L${xAt(prices.length - 1).toFixed(1)} ${H} L${xAt(0).toFixed(1)} ${H} Z` : '';
  const trendUp = prices[prices.length - 1] > prices[0];
  const trendColor = trendUp ? colors.green : colors.red;

  const isCorrect = mode === 'identify_point'
    ? pointIdx !== null && Math.abs(pointIdx - (cfg.correctPointIndex ?? 0)) <= (cfg.pointTolerance ?? 1)
    : optionIdx === cfg.correctPatternIndex;

  const submit = () => {
    if (mode === 'identify_point' ? pointIdx === null : optionIdx === null) return;
    setSubmitted(true);
    const ok = mode === 'identify_point'
      ? pointIdx !== null && Math.abs(pointIdx - (cfg.correctPointIndex ?? 0)) <= (cfg.pointTolerance ?? 1)
      : optionIdx === cfg.correctPatternIndex;
    if (ok) setTimeout(() => onAnswer(true, exercise.xp), 1600);
  };

  const tapChart = (evt: any) => {
    if (submitted || mode !== 'identify_point' || !chartW) return;
    const x = evt.nativeEvent.locationX;
    let nearest = 0, best = Infinity;
    for (let i = 0; i < prices.length; i++) { const d = Math.abs(xAt(i) - x); if (d < best) { best = d; nearest = i; } }
    setPointIdx(nearest);
  };

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <Prompt text={en(cfg.question)} />
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.md }}>
        <Pressable onPress={tapChart} onLayout={(e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width)}>
          {chartW > 0 ? (
            <Svg width={chartW} height={H}>
              <Defs>
                <LinearGradient id="scGrad" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor={trendColor} stopOpacity={0.3} />
                  <Stop offset="1" stopColor={trendColor} stopOpacity={0} />
                </LinearGradient>
              </Defs>
              {[0.25, 0.5, 0.75].map((p) => (
                <SvgLine key={p} x1={padX} y1={H * p} x2={chartW - padX} y2={H * p} stroke={colors.fgSubtle} strokeWidth={0.5} strokeDasharray="3 3" opacity={0.4} />
              ))}
              <Path d={areaPath} fill="url(#scGrad)" />
              <Path d={path} fill="none" stroke={trendColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
              {pointIdx !== null ? (
                <>
                  <SvgLine x1={xAt(pointIdx)} y1={padY} x2={xAt(pointIdx)} y2={H - padY} stroke={colors.primary} strokeWidth={1.2} strokeDasharray="4 4" />
                  <Circle cx={xAt(pointIdx)} cy={yAt(prices[pointIdx])} r={5} fill={colors.primary} stroke="#fff" strokeWidth={1.5} />
                </>
              ) : null}
              {submitted && mode === 'identify_point' && cfg.correctPointIndex !== undefined ? (
                <Circle cx={xAt(cfg.correctPointIndex)} cy={yAt(prices[cfg.correctPointIndex])} r={6} fill="none" stroke={colors.green} strokeWidth={2} />
              ) : null}
            </Svg>
          ) : <View style={{ height: H }} />}
        </Pressable>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
          <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{labels[0]}</Text>
          {pointIdx !== null ? <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>{labels[pointIdx]} · €{prices[pointIdx].toLocaleString()}</Text> : null}
          <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{labels[labels.length - 1]}</Text>
        </View>
      </View>
      {mode === 'identify_point' && !submitted && pointIdx === null && cfg.pointPrompt ? (
        <Text style={{ color: colors.fgSubtle, fontSize: 12, textAlign: 'center', marginBottom: spacing.sm }}>💡 {en(cfg.pointPrompt)}</Text>
      ) : null}
      {mode === 'identify_pattern' ? (
        <View style={{ marginBottom: spacing.sm }}>
          {(cfg.patternOptions ?? []).map((opt: any, i: number) => {
            const sel = optionIdx === i;
            const isCorrectOpt = submitted && i === cfg.correctPatternIndex;
            const isWrongOpt = submitted && sel && i !== cfg.correctPatternIndex;
            const border = isCorrectOpt ? colors.green : isWrongOpt ? colors.red : sel ? colors.primary : colors.border;
            return (
              <Pressable key={i} disabled={submitted} onPress={() => setOptionIdx(i)}
                style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: isCorrectOpt ? colors.greenSoft : isWrongOpt ? colors.redSoft : sel ? colors.primarySoft : colors.card, marginBottom: spacing.sm }}>
                <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600' }}>{en(opt)}</Text>
              </Pressable>
            );
          })}
        </View>
      ) : null}
      {submitted ? (
        <View style={{ backgroundColor: isCorrect ? colors.greenSoft : colors.redSoft, borderRadius: radius.md, borderWidth: 1, borderColor: isCorrect ? colors.green : colors.red, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: isCorrect ? colors.green : colors.red, fontWeight: '800', fontSize: 14, marginBottom: exercise.explanation ? 4 : 0 }}>{isCorrect ? '✓ Sharp eye!' : '✗ Not quite'}</Text>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </View>
      ) : null}
      {!submitted ? (
        <Button title="Check →" onPress={submit} disabled={mode === 'identify_point' ? pointIdx === null : optionIdx === null} />
      ) : !isCorrect ? (
        <>
          <ExplainMistake exercise={exercise} />
          <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
        </>
      ) : null}
    </View>
  );
}

/* ── shared: a themed slider row ───────────────────────────── */
function Track({ min, max, step, value, onChange, color, disabled }: { min: number; max: number; step: number; value: number; onChange: (v: number) => void; color: string; disabled?: boolean }) {
  return (
    <Slider style={{ width: '100%', height: 40 }} minimumValue={min} maximumValue={max} step={step} value={value}
      onValueChange={onChange} minimumTrackTintColor={color} maximumTrackTintColor={colors.border} thumbTintColor={color} disabled={disabled} />
  );
}
function ResultBox({ good, title, children }: { good: boolean; title: string; children?: any }) {
  return (
    <View style={{ backgroundColor: good ? colors.greenSoft : colors.redSoft, borderRadius: radius.md, borderWidth: 1, borderColor: good ? colors.green : colors.red, padding: spacing.md, marginBottom: spacing.md }}>
      <Text style={{ color: good ? colors.green : colors.red, fontWeight: '800', fontSize: 14, marginBottom: children ? 4 : 0 }}>{title}</Text>
      {children}
    </View>
  );
}
const numInputStyle = { height: 52, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 18, flex: 1 } as const;

/* ── budget_slider: allocate income across categories ──────── */
export function BudgetSlider({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const income = exercise.income ?? 3000;
  const cats: any[] = exercise.categories ?? [];
  const [values, setValues] = useState<number[]>(() => cats.map((c) => {
    const span = c.max - c.min;
    const minAbsDiff = Math.abs(c.min - c.ideal) / Math.max(1, c.ideal);
    if (minAbsDiff >= 0.25) return c.min;
    return Math.min(c.max, Math.round((c.min + span * 0.8) / 50) * 50);
  }));
  const [submitted, setSubmitted] = useState(false);

  const total = values.reduce((a, b) => a + b, 0);
  const remaining = income - total;
  const overBudget = remaining < 0;
  let score = 0;
  cats.forEach((c, i) => { const abs = Math.abs(values[i] - c.ideal) / c.ideal; if (abs < 0.1) score += 2; else if (abs < 0.25) score += 1; });
  const maxScore = cats.length * 2;
  const scorePct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const isGood = score >= maxScore * 0.7;
  const scoreColor = scorePct >= 70 ? colors.green : scorePct >= 40 ? colors.orange : colors.red;
  const headEmoji = scorePct >= 90 ? '🤩' : scorePct >= 70 ? '🎯' : scorePct >= 40 ? '🤔' : '😬';

  const setAt = (i: number, v: number) => setValues((cur) => cur.map((x, idx) => (idx === i ? v : x)));

  return (
    <View>
      <View style={{ backgroundColor: colors.greenSoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.green, padding: spacing.md, marginBottom: spacing.md, alignItems: 'center' }}>
        <Text style={{ color: colors.green, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 }}>Monthly Income</Text>
        <Text style={{ color: colors.fg, fontSize: 28, fontWeight: '900' }}>€{income.toLocaleString()}</Text>
      </View>
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{headEmoji} Budget Health</Text>
          <Text style={{ color: scoreColor, fontSize: 14, fontWeight: '900' }}>{score}/{maxScore}</Text>
        </View>
        <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgElevated, overflow: 'hidden' }}>
          <View style={{ height: 8, width: `${scorePct}%`, backgroundColor: scoreColor }} />
        </View>
      </View>
      {cats.map((cat, i) => {
        const pct = Math.round((values[i] / income) * 100);
        const abs = Math.abs(values[i] - cat.ideal) / cat.ideal;
        const c = abs < 0.1 ? colors.green : abs < 0.25 ? colors.orange : colors.red;
        return (
          <View key={i} style={{ marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600' }}>{cat.emoji} {en(cat.label)}</Text>
              <Text style={{ color: c, fontSize: 14, fontWeight: '800' }}>€{values[i]} <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>({pct}%)</Text></Text>
            </View>
            <Track min={cat.min} max={cat.max} step={50} value={values[i]} onChange={(v) => setAt(i, v)} color={c} disabled={submitted} />
            {submitted ? <Text style={{ color: colors.fgSubtle, fontSize: 12, textAlign: 'right' }}>Ideal: €{cat.ideal}</Text> : null}
          </View>
        );
      })}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: overBudget ? colors.redSoft : remaining > 0 ? colors.orangeSoft : colors.greenSoft, borderRadius: radius.md, borderWidth: 1, borderColor: overBudget ? colors.red : remaining > 0 ? colors.orange : colors.green, padding: spacing.md, marginVertical: spacing.md }}>
        <Text style={{ color: colors.fgMuted, fontSize: 14, fontWeight: '600' }}>{overBudget ? '🚨 Over budget' : remaining > 0 ? '💸 Unspent' : '✅ All allocated'}</Text>
        <Text style={{ color: overBudget ? colors.red : remaining > 0 ? colors.orange : colors.green, fontSize: 18, fontWeight: '900' }}>{overBudget ? '-' : ''}€{Math.abs(remaining)}</Text>
      </View>
      {submitted ? (
        <ResultBox good={isGood} title={isGood ? `🎯 Great budget — +${exercise.xp} XP!` : '📊 Almost — check the ideals above'}>
          <Text style={{ color: colors.fgMuted, fontSize: 12 }}>Tip: the 50/30/20 rule is a guide, not a law — adjust to your life.</Text>
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Lock in Budget 🔒" onPress={() => setSubmitted(true)} disabled={overBudget} />
      ) : (
        <Button title="Continue →" onPress={() => onAnswer(isGood, isGood ? exercise.xp : 0)} />
      )}
    </View>
  );
}

/* ── portfolio_pie: allocate % across assets, live pie ─────── */
export function PortfolioPie({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.portfolioPie ?? {};
  const assets: any[] = cfg.assets ?? [];
  const tolerance = cfg.tolerance ?? 10;
  const [values, setValues] = useState<number[]>(() => {
    const init = assets.map(() => Math.round(100 / Math.max(1, assets.length)));
    init[init.length - 1] += 100 - init.reduce((a, b) => a + b, 0);
    return init;
  });
  const [submitted, setSubmitted] = useState(false);
  const total = values.reduce((a, b) => a + b, 0);

  const update = (idx: number, raw: number) => {
    if (submitted) return;
    const newVal = Math.max(0, Math.min(100, Math.round(raw)));
    const others = values.reduce((s, v, i) => (i === idx ? s : s + v), 0);
    const next = values.slice();
    next[idx] = newVal;
    if (others + newVal > 100) {
      let excess = others + newVal - 100;
      const otherIdxs = values.map((_, i) => i).filter((i) => i !== idx);
      for (let i = otherIdxs.length - 1; i >= 0; i--) {
        const oi = otherIdxs[i];
        const reduce = Math.min(next[oi], Math.ceil(excess / (i + 1)));
        next[oi] -= reduce; excess -= reduce;
        if (excess <= 0) break;
      }
    }
    setValues(next);
  };

  const isCorrect = assets.every((a, i) => Math.abs(values[i] - a.ideal) <= tolerance);

  // Pie geometry (viewBox 0 0 100 100)
  const cx = 50, cy = 50, r = 35;
  let cumulative = 0;
  const slices = values.map((v, i) => {
    const start = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += v;
    const end = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
    const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
    const large = v > 50 ? 1 : 0;
    const path = v <= 0 ? '' : v >= 100
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { path, color: assets[i].color };
  });

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      {cfg.question ? <Prompt text={en(cfg.question)} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <Svg width={110} height={110} viewBox="0 0 100 100">
          {slices.map((s, i) => (s.path ? <Path key={i} d={s.path} fill={s.color} stroke={colors.bg} strokeWidth={0.6} /> : null))}
          <Circle cx={cx} cy={cy} r={r * 0.45} fill={colors.bg} />
        </Svg>
        <View style={{ flex: 1, gap: 4 }}>
          {assets.map((a, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View style={{ width: 11, height: 11, borderRadius: 3, backgroundColor: a.color }} />
              <Text style={{ color: colors.fg, fontSize: 12, fontWeight: '600', flex: 1 }} numberOfLines={1}>{a.emoji} {en(a.label)}</Text>
              <Text style={{ color: a.color, fontSize: 12, fontWeight: '800' }}>{values[i]}%</Text>
            </View>
          ))}
        </View>
      </View>
      {assets.map((a, i) => (
        <View key={i} style={{ marginBottom: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600' }}>{a.emoji} {en(a.label)}</Text>
            <Text style={{ color: a.color, fontSize: 14, fontWeight: '800' }}>{values[i]}%</Text>
          </View>
          <Track min={0} max={100} step={1} value={values[i]} onChange={(v) => update(i, v)} color={a.color} disabled={submitted} />
        </View>
      ))}
      {total !== 100 && !submitted ? (
        <Text style={{ color: colors.orange, fontSize: 12, textAlign: 'center', marginBottom: spacing.sm }}>⚠️ Total must equal 100% (currently {total}%)</Text>
      ) : null}
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? '✓ Solid allocation!' : '✗ Off target'}>
          <Text style={{ color: colors.fgMuted, fontSize: 12, fontWeight: '700', marginBottom: 2 }}>Recommended:</Text>
          {assets.map((a, i) => (
            <Text key={i} style={{ color: colors.fgMuted, fontSize: 12 }}><Text style={{ color: a.color }}>●</Text> {en(a.label)}: {a.ideal}% (you: {values[i]}%)</Text>
          ))}
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21, marginTop: 6 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Submit Allocation →" onPress={() => { if (total === 100) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1600); } }} disabled={total !== 100} />
      ) : !isCorrect ? (
        <>
          <ExplainMistake exercise={exercise} />
          <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
        </>
      ) : null}
    </View>
  );
}

/* ── coverage_calc: tune premium / deductible / coverage ───── */
export function CoverageCalc({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.coverageCalc ?? {};
  const [premium, setPremium] = useState<number>(cfg.correctPremium ?? 0);
  const [dedIdx, setDedIdx] = useState(Math.max(0, (cfg.deductibleOptions ?? []).indexOf(cfg.correctDeductible)));
  const [covIdx, setCovIdx] = useState(Math.max(0, (cfg.coverageLimitOptions ?? []).indexOf(cfg.correctCoverageLimit)));
  const [submitted, setSubmitted] = useState(false);

  const deductible = (cfg.deductibleOptions ?? [])[dedIdx] ?? 0;
  const coverageLimit = (cfg.coverageLimitOptions ?? [])[covIdx] ?? 0;
  const claimable = Math.max(0, Math.min((cfg.expectedLoss ?? 0) - deductible, coverageLimit));
  const ev = (cfg.claimProbability ?? 0) * claimable - premium;
  const worstCase = premium + deductible + Math.max(0, (cfg.expectedLoss ?? 0) - coverageLimit - deductible);
  const isCorrect = Math.abs(premium - (cfg.correctPremium ?? 0)) <= (cfg.tolerance ?? 0) && deductible === cfg.correctDeductible && coverageLimit === cfg.correctCoverageLimit;

  const Chip = ({ label, sel, color, onPress }: { label: string; sel: boolean; color: string; onPress: () => void }) => (
    <Pressable disabled={submitted} onPress={onPress} style={{ paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: sel ? color : colors.border, backgroundColor: sel ? colors.glass : 'transparent' }}>
      <Text style={{ color: sel ? color : colors.fgMuted, fontSize: 13, fontWeight: '800' }}>{label}</Text>
    </Pressable>
  );

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <Prompt text={en(cfg.question)} />
      <View style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        {[{ l: 'Claim odds', v: `${((cfg.claimProbability ?? 0) * 100).toFixed(1)}%`, c: colors.orange }, { l: 'Possible loss', v: `€${(cfg.expectedLoss ?? 0).toLocaleString()}`, c: colors.red }, { l: 'Worst case', v: `€${Math.round(worstCase).toLocaleString()}`, c: colors.purple }].map((s, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ color: colors.fgSubtle, fontSize: 10, textTransform: 'uppercase', textAlign: 'center' }}>{s.l}</Text>
            <Text style={{ color: s.c, fontSize: 14, fontWeight: '900' }}>{s.v}</Text>
          </View>
        ))}
      </View>
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '700' }}>💸 Annual premium</Text>
          <Text style={{ color: colors.primary, fontSize: 14, fontWeight: '800' }}>€{premium}/yr</Text>
        </View>
        <Track min={cfg.premiumMin ?? 0} max={cfg.premiumMax ?? 1000} step={cfg.premiumStep ?? 10} value={premium} onChange={(v) => setPremium(Math.round(v))} color={colors.primary} disabled={submitted} />
        <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '700', marginTop: spacing.sm, marginBottom: 6 }}>🧾 Deductible</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(cfg.deductibleOptions ?? []).map((d: number, i: number) => <Chip key={i} label={`€${d}`} sel={i === dedIdx} color={colors.orange} onPress={() => setDedIdx(i)} />)}
        </View>
        <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '700', marginTop: spacing.sm, marginBottom: 6 }}>🛡️ Coverage limit</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {(cfg.coverageLimitOptions ?? []).map((c: number, i: number) => <Chip key={i} label={`€${c.toLocaleString()}`} sel={i === covIdx} color={colors.green} onPress={() => setCovIdx(i)} />)}
        </View>
      </View>
      <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ color: colors.fgSubtle, fontSize: 10, textTransform: 'uppercase', marginBottom: 2 }}>Expected value (per year)</Text>
        <Text style={{ color: colors.fg, fontSize: 13 }}>({((cfg.claimProbability ?? 0) * 100).toFixed(1)}% × €{claimable.toLocaleString()}) − €{premium} = <Text style={{ color: ev >= 0 ? colors.green : colors.red, fontWeight: '800' }}>{ev >= 0 ? '+' : '−'}€{Math.abs(ev).toFixed(0)}</Text></Text>
        <Text style={{ color: colors.fgMuted, fontSize: 11, marginTop: 4 }}>Insurance is rarely +EV — you pay for peace of mind. Cover the catastrophic, accept the small.</Text>
      </View>
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? '✓ Smart coverage!' : `✗ Sweet spot: €${cfg.correctPremium}/yr · €${cfg.correctDeductible} deductible · €${(cfg.correctCoverageLimit ?? 0).toLocaleString()} coverage`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Lock in policy →" onPress={() => { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1800); }} />
      ) : !isCorrect ? (
        <>
          <ExplainMistake exercise={exercise} />
          <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
        </>
      ) : null}
    </View>
  );
}

/* ── tax_brackets: progressive brackets, effective vs marginal ─ */
function calcTax(income: number, brackets: any[]): { taxOwed: number; fills: number[] } {
  let remaining = income, prev = 0, taxOwed = 0;
  const fills: number[] = [];
  for (const b of brackets) {
    const range = b.upTo >= 100000000 ? Infinity : b.upTo - prev;
    const taxedHere = Math.min(remaining, range);
    fills.push(Math.max(0, taxedHere));
    taxOwed += taxedHere * (b.rate / 100);
    remaining -= taxedHere;
    if (b.upTo >= 100000000) break;
    prev = b.upTo;
    if (remaining <= 0) break;
  }
  while (fills.length < brackets.length) fills.push(0);
  return { taxOwed, fills };
}
export function TaxBrackets({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.taxBrackets ?? {};
  const brackets: any[] = cfg.brackets ?? [];
  const [income, setIncome] = useState<number>(cfg.testIncome ?? 0);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { taxOwed, fills } = calcTax(income, brackets);
  const effectiveRate = income > 0 ? (taxOwed / income) * 100 : 0;
  let marginalRate = brackets.length ? brackets[brackets.length - 1].rate : 0;
  for (const b of brackets) { if (income <= b.upTo) { marginalRate = b.rate; break; } }
  const parsed = parseFloat(answer.replace(/[^0-9.\-]/g, ''));
  const isCorrect = !isNaN(parsed) && Math.abs(parsed - (cfg.correctAnswer ?? 0)) <= (cfg.tolerance ?? 0);
  const barColors = [colors.green, colors.primary, colors.purple, colors.orange, colors.red];

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>Annual Income</Text>
          <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '900' }}>€{income.toLocaleString()}</Text>
        </View>
        {cfg.adjustable ? <Track min={cfg.incomeMin ?? 10000} max={cfg.incomeMax ?? 200000} step={1000} value={income} onChange={(v) => setIncome(Math.round(v))} color={colors.primary} disabled={submitted} /> : null}
      </View>
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', marginBottom: spacing.sm }}>Tax Brackets</Text>
        {brackets.map((b, i) => {
          const prev = i === 0 ? 0 : brackets[i - 1].upTo;
          const fill = fills[i];
          const range = b.upTo >= 100000000 ? income - prev : b.upTo - prev;
          const fillPct = range > 0 ? (fill / range) * 100 : 0;
          const c = barColors[i % barColors.length];
          return (
            <View key={i} style={{ marginBottom: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
                <Text style={{ color: colors.fgMuted, fontSize: 11 }}>€{prev.toLocaleString()}{b.upTo >= 100000000 ? '+' : `–€${b.upTo.toLocaleString()}`} @ {b.rate}%</Text>
                <Text style={{ color: fill > 0 ? c : colors.fgSubtle, fontSize: 11, fontWeight: '800' }}>{fill > 0 ? `€${Math.round(fill * (b.rate / 100)).toLocaleString()}` : '—'}</Text>
              </View>
              <View style={{ height: 10, borderRadius: 5, backgroundColor: colors.bgElevated, overflow: 'hidden' }}>
                <View style={{ height: 10, width: `${Math.min(100, fillPct)}%`, backgroundColor: c }} />
              </View>
            </View>
          );
        })}
        <View style={{ flexDirection: 'row', marginTop: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
          {[{ l: 'Tax owed', v: `€${Math.round(taxOwed).toLocaleString()}`, c: colors.red }, { l: 'Effective', v: `${effectiveRate.toFixed(1)}%`, c: colors.orange }, { l: 'Marginal', v: `${marginalRate}%`, c: colors.purple }].map((s, i) => (
            <View key={i} style={{ flex: 1, alignItems: 'center' }}>
              <Text style={{ color: colors.fgSubtle, fontSize: 10, textTransform: 'uppercase' }}>{s.l}</Text>
              <Text style={{ color: s.c, fontSize: 14, fontWeight: '900' }}>{s.v}</Text>
            </View>
          ))}
        </View>
      </View>
      <Prompt text={en(cfg.question)} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
        <TextInput value={answer} onChangeText={setAnswer} keyboardType="numeric" editable={!submitted} placeholder="Your answer" placeholderTextColor={colors.fgSubtle}
          style={[numInputStyle, submitted ? { borderColor: isCorrect ? colors.green : colors.red } : null]} />
        {cfg.unit ? <Text style={{ color: colors.primary, fontSize: 20, fontWeight: '800' }}>{cfg.unit}</Text> : null}
      </View>
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? '✓ Correct!' : `✗ Answer: ${cfg.correctAnswer}${cfg.unit ?? ''}`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Check Answer →" onPress={() => { if (!isNaN(parsed)) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1600); } }} disabled={!answer.trim()} />
      ) : !isCorrect ? (
        <>
          <ExplainMistake exercise={exercise} userAnswer={answer || undefined} />
          <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
        </>
      ) : null}
    </View>
  );
}

/* ── debt_payoff: pick snowball / avalanche / even ─────────── */
type DebtStrategy = 'snowball' | 'avalanche' | 'even';
function simulateDebt(debts: any[], extraPayment: number, strategy: DebtStrategy): { months: number; totalInterest: number } {
  const ds = debts.map((d) => ({ ...d }));
  let totalInterest = 0, months = 0;
  const MAX_MONTHS = 600;
  while (ds.some((d) => d.balance > 0.01) && months < MAX_MONTHS) {
    months++;
    for (const d of ds) { if (d.balance > 0) { const interest = d.balance * (d.apr / 100 / 12); d.balance += interest; totalInterest += interest; } }
    let availableExtra = extraPayment;
    for (const d of ds) { if (d.balance > 0) d.balance -= Math.min(d.balance, d.minPayment); }
    if (availableExtra > 0) {
      let order = ds.map((_, i) => i).filter((i) => ds[i].balance > 0.01);
      if (strategy === 'snowball') order.sort((a, b) => ds[a].balance - ds[b].balance);
      else if (strategy === 'avalanche') order.sort((a, b) => ds[b].apr - ds[a].apr);
      if (strategy === 'even') {
        const active = order.length;
        if (active > 0) { const each = availableExtra / active; for (const i of order) ds[i].balance -= Math.min(ds[i].balance, each); }
      } else {
        for (const i of order) { if (availableExtra <= 0) break; const pay = Math.min(ds[i].balance, availableExtra); ds[i].balance -= pay; availableExtra -= pay; }
      }
    }
  }
  return { months, totalInterest: Math.round(totalInterest) };
}
const DEBT_STRATS: Record<DebtStrategy, { label: string; emoji: string; desc: string }> = {
  snowball: { label: 'Snowball', emoji: '⛄', desc: 'Pay smallest balance first — quick wins for motivation' },
  avalanche: { label: 'Avalanche', emoji: '🏔️', desc: 'Pay highest APR first — saves the most interest' },
  even: { label: 'Split evenly', emoji: '⚖️', desc: 'Spread extra payment across all debts' },
};
export function DebtPayoff({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.debtPayoff ?? {};
  const debts: any[] = cfg.debts ?? [];
  const [strategy, setStrategy] = useState<DebtStrategy | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const results = useMemo(() => ({
    snowball: simulateDebt(debts, cfg.extraPayment ?? 0, 'snowball'),
    avalanche: simulateDebt(debts, cfg.extraPayment ?? 0, 'avalanche'),
    even: simulateDebt(debts, cfg.extraPayment ?? 0, 'even'),
  }), [cfg]);
  const totalDebt = debts.reduce((s, d) => s + d.balance, 0);
  const isCorrect = strategy === cfg.correctStrategy;

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.orangeSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.orange, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
          <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>Your Debts</Text>
          <Text style={{ color: colors.red, fontSize: 11, fontWeight: '800' }}>Total: €{totalDebt.toLocaleString()}</Text>
        </View>
        {debts.map((d, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 5 }}>
            <Text style={{ fontSize: 18 }}>{d.emoji}</Text>
            <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600', flex: 1 }}>{en(d.label)}</Text>
            <Text style={{ color: colors.fgMuted, fontSize: 12 }}>€{d.balance.toLocaleString()} · {d.apr}%</Text>
          </View>
        ))}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 6, paddingTop: 6, borderTopWidth: 1, borderTopColor: colors.border }}>
          <Text style={{ fontSize: 18 }}>💪</Text>
          <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600', flex: 1 }}>Extra payment available</Text>
          <Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>+€{cfg.extraPayment}/mo</Text>
        </View>
      </View>
      <Prompt text={en(cfg.question)} />
      {(['snowball', 'avalanche', 'even'] as DebtStrategy[]).map((s) => {
        const info = DEBT_STRATS[s];
        const sel = strategy === s;
        const isCorrectS = submitted && s === cfg.correctStrategy;
        const isWrongS = submitted && sel && s !== cfg.correctStrategy;
        const border = isCorrectS ? colors.green : isWrongS ? colors.red : sel ? colors.primary : colors.border;
        const r = results[s];
        return (
          <Pressable key={s} disabled={submitted} onPress={() => setStrategy(s)}
            style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: isCorrectS ? colors.greenSoft : isWrongS ? colors.redSoft : sel ? colors.primarySoft : colors.card, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Text style={{ fontSize: 20 }}>{info.emoji}</Text>
              <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '800', flex: 1 }}>{info.label}</Text>
              {submitted ? <Text style={{ color: colors.fgMuted, fontSize: 11, fontWeight: '700' }}>{Math.floor(r.months / 12)}y {r.months % 12}m · €{r.totalInterest.toLocaleString()}</Text> : null}
            </View>
            <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{info.desc}</Text>
          </Pressable>
        );
      })}
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? `✓ ${DEBT_STRATS[cfg.correctStrategy as DebtStrategy].label} wins!` : `✗ The optimal choice was: ${DEBT_STRATS[cfg.correctStrategy as DebtStrategy].label}`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Run Simulation →" onPress={() => { if (strategy) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1800); } }} disabled={strategy === null} />
      ) : !isCorrect ? (
        <>
          <ExplainMistake exercise={exercise} userAnswer={strategy ? DEBT_STRATS[strategy].label : undefined} />
          <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
        </>
      ) : null}
    </View>
  );
}

/* ── compound_sim: explore compound interest ───────────────── */
function calcFV(principal: number, monthly: number, rate: number, years: number): number {
  const r = rate / 100 / 12, n = years * 12;
  if (r === 0) return principal + monthly * n;
  return principal * Math.pow(1 + r, n) + monthly * ((Math.pow(1 + r, n) - 1) / r);
}
export function CompoundSim({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.compoundConfig ?? {};
  const [principal, setPrincipal] = useState<number>(cfg.defaultPrincipal ?? 1000);
  const [monthly, setMonthly] = useState<number>(cfg.defaultMonthly ?? 100);
  const [rate, setRate] = useState<number>(cfg.defaultRate ?? 7);
  const [years, setYears] = useState<number>(cfg.defaultYears ?? 20);
  const [revealed, setRevealed] = useState(false);
  const [chartW, setChartW] = useState(0);

  const fv = calcFV(principal, monthly, rate, years);
  const totalContrib = principal + monthly * years * 12;
  const totalGrowth = fv - totalContrib;
  const growthPct = totalContrib > 0 ? Math.round((fv / totalContrib - 1) * 100) : 0;
  const pts = useMemo(() => { const a: number[] = []; for (let y = 0; y <= years; y++) a.push(calcFV(principal, monthly, rate, y)); return a; }, [principal, monthly, rate, years]);
  const maxVal = pts[pts.length - 1] || 1;
  const H = 70;
  const xAt = (i: number) => (i / Math.max(1, pts.length - 1)) * chartW;
  const yAt = (v: number) => H - (v / maxVal) * (H - 5);
  const path = chartW ? pts.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(1)} ${yAt(v).toFixed(1)}`).join(' ') : '';
  const area = chartW ? `${path} L${xAt(pts.length - 1).toFixed(1)} ${H} L0 ${H} Z` : '';

  const sliders = [
    { label: 'Starting amount', value: principal, set: setPrincipal, min: 0, max: 50000, step: 500, money: true, color: colors.primary },
    { label: 'Monthly investment', value: monthly, set: setMonthly, min: 0, max: 2000, step: 50, money: true, color: colors.green },
    { label: 'Annual return', value: rate, set: setRate, min: 1, max: 15, step: 0.5, money: false, unit: '%', color: colors.purple },
    { label: 'Time horizon', value: years, set: setYears, min: 1, max: 50, step: 1, money: false, unit: 'yrs', color: colors.orange },
  ];

  return (
    <View>
      <Text style={{ color: colors.fgMuted, fontSize: 14, textAlign: 'center', marginBottom: spacing.md }}>🔮 Adjust the sliders to see the power of compound interest!</Text>
      {sliders.map((s) => (
        <View key={s.label} style={{ marginBottom: spacing.xs }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '600' }}>{s.label}</Text>
            <Text style={{ color: s.color, fontSize: 14, fontWeight: '800' }}>{s.money ? `€${s.value.toLocaleString()}` : `${s.value} ${s.unit}`}</Text>
          </View>
          <Track min={s.min} max={s.max} step={s.step} value={s.value} onChange={(v) => s.set(v)} color={s.color} />
        </View>
      ))}
      <View onLayout={(e: LayoutChangeEvent) => setChartW(e.nativeEvent.layout.width)} style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.md }}>
        {chartW > 0 ? (
          <Svg width={chartW} height={H}>
            <Defs>
              <LinearGradient id="cmpGrad" x1="0" y1="0" x2="0" y2="1">
                <Stop offset="0" stopColor={colors.green} stopOpacity={0.3} />
                <Stop offset="1" stopColor={colors.green} stopOpacity={0} />
              </LinearGradient>
            </Defs>
            <Path d={area} fill="url(#cmpGrad)" />
            <Path d={path} fill="none" stroke={colors.green} strokeWidth={2} strokeLinejoin="round" />
          </Svg>
        ) : <View style={{ height: H }} />}
      </View>
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
        {[{ l: 'You invest', v: totalContrib, c: colors.fgMuted }, { l: 'Market adds', v: totalGrowth, c: colors.purple }, { l: 'Final value', v: fv, c: colors.green }].map((t) => (
          <View key={t.l} style={{ flex: 1, alignItems: 'center', backgroundColor: colors.glass, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm }}>
            <Text style={{ color: colors.fgSubtle, fontSize: 11, textAlign: 'center', marginBottom: 2 }}>{t.l}</Text>
            <Text style={{ color: t.c, fontSize: 15, fontWeight: '900' }}>€{Math.round(t.v).toLocaleString()}</Text>
          </View>
        ))}
      </View>
      {growthPct > 0 ? (
        <View style={{ backgroundColor: colors.greenSoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.green, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.green, fontSize: 14, fontWeight: '700', textAlign: 'center' }}>🚀 Your money grows {growthPct}% — compound interest did {Math.round((totalGrowth / fv) * 100)}% of the work!</Text>
        </View>
      ) : null}
      {!revealed ? (
        <Button title="✓ I understand compound interest!" onPress={() => { setRevealed(true); setTimeout(() => onAnswer(true, exercise.xp), 600); }} />
      ) : (
        <Text style={{ color: colors.green, fontWeight: '700', textAlign: 'center' }}>✓ Great! Moving on...</Text>
      )}
    </View>
  );
}

/* ── income_streams: pick a mix that hits the target ───────── */
export function IncomeStreams({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.incomeStreams ?? {};
  const streams: any[] = cfg.streams ?? [];
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const totalIncome = selected.reduce((s, i) => s + streams[i].hoursPerWeek * streams[i].eurPerHour * 4, 0);
  const totalHours = selected.reduce((s, i) => s + streams[i].hoursPerWeek, 0);
  const incomePct = Math.min(100, (totalIncome / (cfg.targetIncome || 1)) * 100);
  const hoursPct = Math.min(100, (totalHours / (cfg.maxHoursPerWeek || 1)) * 100);
  const meetsTarget = totalIncome >= cfg.targetIncome;
  const fitsHours = totalHours <= cfg.maxHoursPerWeek;
  const correctCount = selected.length >= cfg.minPicks && selected.length <= cfg.maxPicks;
  const isCorrect = meetsTarget && fitsHours && correctCount;
  const toggle = (i: number) => { if (submitted) return; setSelected((p) => p.includes(i) ? p.filter((x) => x !== i) : p.length < cfg.maxPicks ? [...p, i] : p); };

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <Prompt text={en(cfg.question)} />
      <View style={{ flexDirection: 'row', gap: spacing.md, backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>Income / mo</Text>
            <Text style={{ color: meetsTarget ? colors.green : colors.fg, fontSize: 12, fontWeight: '800' }}>€{Math.round(totalIncome)} / €{cfg.targetIncome}</Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgElevated, overflow: 'hidden' }}><View style={{ height: 8, width: `${incomePct}%`, backgroundColor: meetsTarget ? colors.green : colors.primary }} /></View>
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
            <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>Hours / wk</Text>
            <Text style={{ color: fitsHours ? colors.fg : colors.red, fontSize: 12, fontWeight: '800' }}>{totalHours}h / {cfg.maxHoursPerWeek}h</Text>
          </View>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgElevated, overflow: 'hidden' }}><View style={{ height: 8, width: `${hoursPct}%`, backgroundColor: fitsHours ? colors.orange : colors.red }} /></View>
        </View>
      </View>
      <Text style={{ color: colors.fgSubtle, fontSize: 12, marginBottom: spacing.sm }}>Pick {cfg.minPicks}–{cfg.maxPicks} streams that hit the target without busting your hour budget.</Text>
      {streams.map((s, i) => {
        const sel = selected.includes(i);
        const monthly = s.hoursPerWeek * s.eurPerHour * 4;
        return (
          <Pressable key={i} disabled={submitted} onPress={() => toggle(i)}
            style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.card, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 }}>
              <Text style={{ fontSize: 20 }}>{s.emoji}</Text>
              <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '800', flex: 1 }}>{en(s.label)}</Text>
              <Text style={{ color: colors.green, fontSize: 12, fontWeight: '800' }}>€{monthly}/mo</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ color: colors.fgMuted, fontSize: 11 }}>{s.hoursPerWeek}h/wk · €{s.eurPerHour}/h</Text>
              <Text style={{ color: colors.orange, fontSize: 11 }}>{'★'.repeat(s.scalability)}{'☆'.repeat(5 - s.scalability)}</Text>
            </View>
            {s.note ? <Text style={{ color: colors.fgSubtle, fontSize: 11, marginTop: 2 }}>{en(s.note)}</Text> : null}
          </Pressable>
        );
      })}
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? '✓ Solid mix!' : !meetsTarget ? `✗ Income too low: €${Math.round(totalIncome)} of €${cfg.targetIncome}` : !fitsHours ? `✗ Too many hours: ${totalHours}h of ${cfg.maxHoursPerWeek}h max` : `✗ Pick ${cfg.minPicks}–${cfg.maxPicks} streams`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Lock in mix →" onPress={() => { if (selected.length) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1800); } }} disabled={selected.length === 0} />
      ) : !isCorrect ? (
        <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
      ) : null}
    </View>
  );
}

/* ── unit_price: pick the best price-per-unit ──────────────── */
export function UnitPrice({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.unitPrice ?? {};
  const options: any[] = cfg.options ?? [];
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const perUnit = options.map((o) => o.price / o.quantity);
  let cheapestIdx = 0;
  for (let i = 1; i < perUnit.length; i++) if (perUnit[i] < perUnit[cheapestIdx]) cheapestIdx = i;
  const isCorrect = picked === cheapestIdx;
  const maxPerUnit = Math.max(...perUnit, 0.0001);
  const fmt = (v: number) => (v < 1 ? `€${v.toFixed(3)}` : `€${v.toFixed(2)}`);

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <Prompt text={en(cfg.question)} />
      {options.map((o, i) => {
        const sel = picked === i;
        const isCheapest = submitted && i === cheapestIdx;
        const isWrong = submitted && sel && !isCorrect;
        const border = isCheapest ? colors.green : isWrong ? colors.red : sel ? colors.primary : colors.border;
        const pct = (perUnit[i] / maxPerUnit) * 100;
        return (
          <Pressable key={i} disabled={submitted} onPress={() => setPicked(i)}
            style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: isCheapest ? colors.greenSoft : isWrong ? colors.redSoft : sel ? colors.primarySoft : colors.card, marginBottom: spacing.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Text style={{ fontSize: 20 }}>{o.emoji}</Text>
              <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '800', flex: 1 }}>{en(o.label)}</Text>
              <Text style={{ color: colors.fgMuted, fontSize: 12 }}>€{o.price.toFixed(2)} / {o.quantity}{cfg.unit}</Text>
            </View>
            {submitted ? (
              <>
                <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.bgElevated, overflow: 'hidden', marginTop: 6 }}>
                  <View style={{ height: 8, width: `${pct}%`, backgroundColor: i === cheapestIdx ? colors.green : colors.orange }} />
                </View>
                <Text style={{ color: i === cheapestIdx ? colors.green : colors.fgMuted, fontSize: 11, fontWeight: '700', marginTop: 3 }}>{fmt(perUnit[i])}/{cfg.unit}{i === cheapestIdx ? ' · best deal' : ''}</Text>
              </>
            ) : null}
            {o.note ? <Text style={{ color: colors.fgSubtle, fontSize: 11, marginTop: 2 }}>{en(o.note)}</Text> : null}
          </Pressable>
        );
      })}
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? `✓ Best deal: ${fmt(perUnit[cheapestIdx])}/${cfg.unit}` : `✗ Best deal: ${en(options[cheapestIdx].label)} (${fmt(perUnit[cheapestIdx])}/${cfg.unit})`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title="Pick the best deal →" onPress={() => { if (picked !== null) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1600); } }} disabled={picked === null} />
      ) : !isCorrect ? (
        <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
      ) : null}
    </View>
  );
}

/* ── risk_matrix: sort risks into a 2×2 impact/likelihood grid ─ */
const RISK_QUADRANTS = [
  { strategy: 'Accept', label: 'Low impact · Low chance', emoji: '🤷', color: colors.green },
  { strategy: 'Mitigate', label: 'Low impact · High chance', emoji: '🛠️', color: colors.orange },
  { strategy: 'Transfer (insure)', label: 'High impact · Low chance', emoji: '📜', color: colors.primary },
  { strategy: 'Avoid', label: 'High impact · High chance', emoji: '🚫', color: colors.red },
];
export function RiskMatrix({ exercise, onAnswer }: { exercise: any; onAnswer: Answer }) {
  const cfg = exercise.riskMatrix ?? {};
  const risks: any[] = cfg.risks ?? [];
  const [placements, setPlacements] = useState<number[]>(() => risks.map(() => -1));
  const [activeRisk, setActiveRisk] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const allPlaced = placements.every((p) => p !== -1);
  const correctCount = placements.filter((p, i) => p === risks[i].correctQuadrant).length;
  const isCorrect = correctCount === risks.length;
  const unplaced = risks.map((_, i) => i).filter((i) => placements[i] === -1);
  const place = (riskIdx: number, q: number) => { if (submitted) return; setPlacements((prev) => { const n = prev.slice(); n[riskIdx] = q; return n; }); setActiveRisk(null); };

  return (
    <View>
      {cfg.scenario ? (
        <View style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 15, lineHeight: 22 }}>{en(cfg.scenario)}</Text>
        </View>
      ) : null}
      <Prompt text={en(cfg.question)} />
      {unplaced.length > 0 ? (
        <View style={{ backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md }}>
          <Text style={{ color: colors.fgSubtle, fontSize: 11, textTransform: 'uppercase', marginBottom: 8 }}>Tap a risk, then tap a quadrant</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
            {unplaced.map((i) => {
              const sel = activeRisk === i;
              return (
                <Pressable key={i} disabled={submitted} onPress={() => setActiveRisk(sel ? null : i)}
                  style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: radius.pill, borderWidth: 1.5, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.bgElevated }}>
                  <Text style={{ color: sel ? colors.primary : colors.fg, fontSize: 12, fontWeight: '800' }}>{risks[i].emoji} {en(risks[i].label)}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
        {[0, 1, 2, 3].map((q) => {
          const info = RISK_QUADRANTS[q];
          const placed = risks.map((_, i) => i).filter((i) => placements[i] === q);
          const canDrop = activeRisk !== null && !submitted;
          return (
            <Pressable key={q} disabled={submitted || activeRisk === null} onPress={() => { if (activeRisk !== null) place(activeRisk, q); }}
              style={{ width: '48%', minHeight: 108, borderRadius: radius.lg, borderWidth: 1.5, borderStyle: canDrop ? 'dashed' : 'solid', borderColor: canDrop ? info.color : colors.border, backgroundColor: colors.glass, padding: spacing.sm }}>
              <Text style={{ color: info.color, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' }}>{info.emoji} {info.strategy}</Text>
              <Text style={{ color: colors.fgSubtle, fontSize: 10, marginBottom: 6 }}>{info.label}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
                {placed.map((i) => {
                  const ok = submitted ? placements[i] === risks[i].correctQuadrant : null;
                  return (
                    <View key={i} style={{ paddingHorizontal: 6, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, borderColor: submitted ? (ok ? colors.green : colors.red) : colors.border, backgroundColor: colors.bgElevated }}>
                      <Text style={{ color: submitted ? (ok ? colors.green : colors.red) : colors.fg, fontSize: 10, fontWeight: '700' }}>{risks[i].emoji} {en(risks[i].label)}{submitted && !ok ? ` → ${RISK_QUADRANTS[risks[i].correctQuadrant].emoji}` : ''}</Text>
                    </View>
                  );
                })}
              </View>
            </Pressable>
          );
        })}
      </View>
      {submitted ? (
        <ResultBox good={isCorrect} title={isCorrect ? '✓ All risks placed correctly!' : `✗ ${correctCount} of ${risks.length} placed correctly`}>
          {exercise.explanation ? <Text style={{ color: colors.fgMuted, fontSize: 14, lineHeight: 21 }}>{en(exercise.explanation)}</Text> : null}
        </ResultBox>
      ) : null}
      {!submitted ? (
        <Button title={allPlaced ? 'Check matrix →' : `Place all risks (${unplaced.length} left)`} onPress={() => { if (allPlaced) { setSubmitted(true); if (isCorrect) setTimeout(() => onAnswer(true, exercise.xp), 1800); } }} disabled={!allPlaced} />
      ) : !isCorrect ? (
        <Button title="Continue →" onPress={() => onAnswer(false, 0)} />
      ) : null}
    </View>
  );
}
