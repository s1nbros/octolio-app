import { useEffect, useMemo, useRef, useState } from 'react';
import { LayoutChangeEvent, Pressable, Text, View } from 'react-native';
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
