import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Button } from '../lib/ui';
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
