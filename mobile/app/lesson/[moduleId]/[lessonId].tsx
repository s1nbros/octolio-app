import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth';
import { api, ApiError } from '../../../lib/api';
import { Button } from '../../../lib/ui';
import { colors, radius, spacing } from '../../../lib/theme';

type Phase = 'loading' | 'intro' | 'exercise' | 'noenergy' | 'complete' | 'error';
interface Exercise { id: string; type: string; xp: number; [k: string]: any; }
interface Lesson { id: string; title: { en: string }; description?: { en: string }; icon?: string; xpReward: number; exercises: Exercise[]; }

const en = (v: any): string => (v && typeof v === 'object' ? v.en ?? '' : v ?? '');

export default function LessonRunner() {
  const { moduleId, lessonId } = useLocalSearchParams<{ moduleId: string; lessonId: string }>();
  const { token, updateUser, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);

  useEffect(() => {
    api<{ lesson: Lesson }>(`/api/modules/${moduleId}/lessons/${lessonId}`, { token })
      .then((d) => { setLesson(d.lesson); setPhase('intro'); })
      .catch(() => setPhase('error'));
  }, [moduleId, lessonId, token]);

  const start = async () => {
    try {
      const r = await api<{ energy: number }>('/api/progress/energy/use', { method: 'POST', token, body: { lessonId, moduleId } });
      if (typeof r.energy === 'number') updateUser({ energy: r.energy });
    } catch (e) {
      if (e instanceof ApiError && e.status === 402) { setPhase('noenergy'); return; }
    }
    setPhase('exercise');
  };

  const complete = useCallback(async (finalXp: number) => {
    try {
      const d = await api<{ totalXp: number; streak: number }>('/api/progress/complete', { method: 'POST', token, body: { lessonId, moduleId } });
      updateUser({ xp: d.totalXp, streak: d.streak });
      refreshUser();
    } catch { /* keep going */ }
    setPhase('complete');
  }, [token, lessonId, moduleId, updateUser, refreshUser]);

  const onAnswer = (correct: boolean, xp: number) => {
    const nextXp = correct ? xpEarned + xp : xpEarned;
    if (correct) setXpEarned(nextXp);
    if (!correct) {
      const left = hearts - 1;
      setHearts(left);
      if (left <= 0) { setIndex(0); setHearts(3); setXpEarned(0); return; }
    }
    const next = index + 1;
    if (lesson && next >= lesson.exercises.length) complete(nextXp);
    else setIndex(next);
  };

  if (phase === 'loading') return <Center><ActivityIndicator color={colors.primary} /></Center>;
  if (phase === 'error' || !lesson) return <Center><Text style={{ color: colors.red }}>Couldn't load this lesson.</Text><Button title="Back" variant="ghost" onPress={() => router.back()} /></Center>;

  if (phase === 'intro') {
    return (
      <Center>
        <Text style={{ fontSize: 56 }}>{lesson.icon || '📘'}</Text>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' }}>{en(lesson.title)}</Text>
        {lesson.description ? <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: 6 }}>{en(lesson.description)}</Text> : null}
        <Text style={{ color: colors.fgSubtle, marginTop: spacing.md }}>{lesson.exercises.length} exercises · +{lesson.xpReward} XP · ❤❤❤</Text>
        <View style={{ height: spacing.lg }} />
        <View style={{ width: '100%' }}>
          <Button title="Start lesson" onPress={start} />
          <View style={{ height: spacing.sm }} />
          <Button title="Back" variant="ghost" onPress={() => router.back()} />
        </View>
      </Center>
    );
  }

  if (phase === 'noenergy') {
    return (
      <Center>
        <Text style={{ fontSize: 48 }}>⚡</Text>
        <Text style={{ color: colors.fg, fontSize: 22, fontWeight: '800', marginTop: spacing.sm }}>Out of energy</Text>
        <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: 6 }}>Energy refills over time. Come back soon, or go Pro for unlimited.</Text>
        <View style={{ height: spacing.lg }} />
        <Button title="Back to lessons" onPress={() => router.back()} />
      </Center>
    );
  }

  if (phase === 'complete') {
    return (
      <Center>
        <Text style={{ fontSize: 56 }}>🎉</Text>
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800', marginTop: spacing.sm }}>Lesson complete!</Text>
        <Text style={{ color: colors.green, fontWeight: '700', marginTop: 6 }}>+{xpEarned || lesson.xpReward} XP</Text>
        <View style={{ height: spacing.lg }} />
        <Button title="Continue" onPress={() => router.back()} />
      </Center>
    );
  }

  const exercise = lesson.exercises[index];
  const progress = (index / lesson.exercises.length) * 100;

  return (
    <View style={{ flex: 1, paddingTop: insets.top }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md }}>
        <Pressable onPress={() => router.back()}><Ionicons name="close" size={24} color={colors.fgMuted} /></Pressable>
        <View style={{ flex: 1, height: 8, backgroundColor: colors.border, borderRadius: 4 }}>
          <View style={{ width: `${progress}%`, height: 8, backgroundColor: colors.green, borderRadius: 4 }} />
        </View>
        <Text style={{ color: colors.red, fontSize: 16 }}>{'❤'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} key={index}>
        <ExerciseView exercise={exercise} onAnswer={onAnswer} />
      </ScrollView>
    </View>
  );
}

function ExerciseView({ exercise, onAnswer }: { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void }) {
  const [sel, setSel] = useState<number | null>(null);
  const [val, setVal] = useState('');
  const [state, setState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const checked = state !== 'idle';

  // Theory — swipeable-ish: show all slides stacked, then continue with 0 XP.
  if (exercise.type === 'theory') {
    return (
      <View>
        {(exercise.slides ?? []).map((s: any, i: number) => (
          <View key={i} style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.md }}>
            {s.emoji || s.icon ? <Text style={{ fontSize: 36, marginBottom: spacing.sm }}>{s.emoji || s.icon}</Text> : null}
            {s.title ? <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '800', marginBottom: 6 }}>{en(s.title)}</Text> : null}
            <Text style={{ color: colors.fgMuted, fontSize: 15, lineHeight: 22 }}>{en(s.body ?? s.content ?? s.text)}</Text>
          </View>
        ))}
        <Button title="Continue" onPress={() => onAnswer(true, 0)} />
      </View>
    );
  }

  // Choice
  if (exercise.type === 'choice') {
    const check = () => {
      if (sel === null) return;
      const correct = sel === exercise.correctIndex;
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.question)} />
        {(exercise.options ?? []).map((o: any, i: number) => (
          <OptionRow key={i} label={en(o)} selected={sel === i}
            state={checked ? (i === exercise.correctIndex ? 'correct' : i === sel ? 'wrong' : 'idle') : 'idle'}
            disabled={checked} onPress={() => setSel(i)} />
        ))}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {!checked ? <Button title="Check" onPress={check} disabled={sel === null} />
          : state === 'wrong' ? <Button title="Continue" onPress={() => onAnswer(false, 0)} /> : null}
      </View>
    );
  }

  // True / False
  if (exercise.type === 'true_false') {
    const pick = (v: boolean) => {
      const correct = v === exercise.isTrue;
      setSel(v ? 0 : 1);
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.statement)} />
        <View style={{ flexDirection: 'row', gap: spacing.sm }}>
          {[{ v: true, t: 'True' }, { v: false, t: 'False' }].map(({ v, t }) => (
            <Pressable key={t} disabled={checked} onPress={() => pick(v)}
              style={{ flex: 1, padding: spacing.lg, borderRadius: radius.md, borderWidth: 1.5, alignItems: 'center',
                borderColor: checked && v === exercise.isTrue ? colors.green : colors.border, backgroundColor: colors.card }}>
              <Text style={{ color: colors.fg, fontWeight: '800' }}>{t}</Text>
            </Pressable>
          ))}
        </View>
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {checked && state === 'wrong' ? <Button title="Continue" onPress={() => onAnswer(false, 0)} /> : null}
      </View>
    );
  }

  // Fill blank (numeric)
  if (exercise.type === 'fill_blank') {
    const check = () => {
      const n = parseFloat(val.replace(/[^0-9.]/g, ''));
      if (isNaN(n)) return;
      const min = exercise.answerMin ?? (exercise.correctAnswer - 0.01);
      const max = exercise.answerMax ?? (exercise.correctAnswer + 0.01);
      const correct = n >= min && n <= max;
      setState(correct ? 'correct' : 'wrong');
      if (correct) setTimeout(() => onAnswer(true, exercise.xp), 900);
    };
    return (
      <View>
        <Prompt text={en(exercise.question)} />
        <TextInput value={val} onChangeText={setVal} keyboardType="numeric" editable={!checked} placeholder="Your answer"
          placeholderTextColor={colors.fgSubtle}
          style={{ height: 52, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 18, marginBottom: spacing.md }} />
        {checked && state === 'wrong' ? <Text style={{ color: colors.red, marginBottom: spacing.sm }}>Correct answer: {exercise.correctAnswer}{exercise.answerUnit ?? ''}</Text> : null}
        <Explanation checked={checked} state={state} text={en(exercise.explanation)} />
        {!checked ? <Button title="Check" onPress={check} disabled={!val.trim()} />
          : state === 'wrong' ? <Button title="Continue" onPress={() => onAnswer(false, 0)} /> : null}
      </View>
    );
  }

  // Fallback — richer interactive types are best on the web for now.
  return (
    <View>
      <Prompt text={en(exercise.question) || en(exercise.statement) || 'Interactive exercise'} />
      <Text style={{ color: colors.fgMuted, marginBottom: spacing.lg }}>
        This exercise type isn't available on mobile yet — it's on the web app. Tap continue to keep going.
      </Text>
      <Button title="Continue" onPress={() => onAnswer(true, exercise.xp)} />
    </View>
  );
}

function Prompt({ text }: { text: string }) {
  return <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '700', lineHeight: 26, marginBottom: spacing.md }}>{text}</Text>;
}
function OptionRow({ label, selected, state, disabled, onPress }: { label: string; selected: boolean; state: 'idle' | 'correct' | 'wrong'; disabled: boolean; onPress: () => void }) {
  const border = state === 'correct' ? colors.green : state === 'wrong' ? colors.red : selected ? colors.primary : colors.border;
  return (
    <Pressable disabled={disabled} onPress={onPress}
      style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: colors.card, marginBottom: spacing.sm }}>
      <Text style={{ color: colors.fg, fontSize: 15 }}>{label}</Text>
    </Pressable>
  );
}
function Explanation({ checked, state, text }: { checked: boolean; state: string; text: string }) {
  if (!checked || !text) return null;
  const good = state === 'correct';
  return (
    <View style={{ backgroundColor: good ? colors.greenSoft : 'rgba(224,87,95,0.12)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md }}>
      <Text style={{ color: good ? colors.green : colors.red, fontWeight: '700', marginBottom: 4 }}>{good ? '✓ Correct' : '✗ Not quite'}</Text>
      <Text style={{ color: colors.fgMuted, lineHeight: 21 }}>{text}</Text>
    </View>
  );
}
function Center({ children }: { children: React.ReactNode }) {
  return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>{children}</View>;
}
