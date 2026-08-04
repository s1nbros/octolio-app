import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, Animated, Easing, Pressable, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../lib/auth';
import { api, ApiError } from '../../../lib/api';
import { Button } from '../../../lib/ui';
import { colors, radius, spacing } from '../../../lib/theme';
import { Aurora } from '../../../components/Aurora';
import { ExerciseView, en, type Exercise } from '../../../components/ExerciseView';
import { FadeScaleIn, Pop, useShake, XpPop } from '../../../lib/anim';

type Phase = 'loading' | 'intro' | 'exercise' | 'noenergy' | 'complete' | 'error';
interface Lesson { id: string; title: { en: string }; description?: { en: string }; icon?: string; xpReward: number; exercises: Exercise[]; }

export default function LessonRunner() {
  const { moduleId, lessonId } = useLocalSearchParams<{ moduleId: string; lessonId: string }>();
  const { token, updateUser, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  // Gently scale hero elements down on smaller phones (baseline ≈ iPhone 12/13/14 width).
  const s = Math.max(0.82, Math.min(1, width / 390));

  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [phase, setPhase] = useState<Phase>('loading');
  const [index, setIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [xpPop, setXpPop] = useState({ amount: 0, trigger: 0 });
  const progress = useRef(new Animated.Value(0)).current;
  const heart = useShake();

  useEffect(() => {
    if (!lesson) return;
    Animated.timing(progress, { toValue: index / lesson.exercises.length, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();
  }, [index, lesson, progress]);

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
    if (correct) {
      setXpEarned(nextXp);
      if (xp > 0) setXpPop((p) => ({ amount: xp, trigger: p.trigger + 1 }));
    }
    if (!correct) {
      heart.shake();
      const left = hearts - 1;
      setHearts(left);
      if (left <= 0) { setIndex(0); setHearts(3); setXpEarned(0); return; }
    }
    const next = index + 1;
    if (lesson && next >= lesson.exercises.length) complete(nextXp);
    else setIndex(next);
  };

  // Guard the mid-lesson exit — tapping ✕ shouldn't silently discard progress + spent energy.
  const confirmExit = () => {
    Alert.alert(
      'End lesson?',
      "Your progress in this lesson won't be saved, and the energy you spent won't be refunded.",
      [
        { text: 'Keep going', style: 'cancel' },
        { text: 'End lesson', style: 'destructive', onPress: () => router.back() },
      ],
    );
  };

  if (phase === 'loading') return <Center><ActivityIndicator color={colors.primary} /></Center>;
  if (phase === 'error' || !lesson) return <Center><Text style={{ color: colors.red }}>Couldn't load this lesson.</Text><Button title="Back" variant="ghost" onPress={() => router.back()} /></Center>;

  if (phase === 'intro') {
    return (
      <Center>
        <Text style={{ fontSize: 56 * s }}>{lesson.icon || '📘'}</Text>
        <Text style={{ color: colors.fg, fontSize: 24 * s, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' }}>{en(lesson.title)}</Text>
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
        <Pop><Text style={{ fontSize: 56 * s }}>🎉</Text></Pop>
        <Text style={{ color: colors.fg, fontSize: 24 * s, fontWeight: '800', marginTop: spacing.sm }}>Lesson complete!</Text>
        <Text style={{ color: colors.green, fontWeight: '700', marginTop: 6 }}>+{xpEarned || lesson.xpReward} XP</Text>
        <View style={{ height: spacing.lg }} />
        <Button title="Continue" onPress={() => router.back()} />
      </Center>
    );
  }

  const exercise = lesson.exercises[index];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={confirmExit} hitSlop={12}><Ionicons name="close" size={24} color={colors.fgMuted} /></Pressable>
        <View style={{ flex: 1, height: 10, backgroundColor: colors.glass, borderRadius: 5, overflow: 'hidden' }}>
          <Animated.View style={{ height: 10, backgroundColor: colors.green, borderRadius: 5, width: progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] }) }} />
        </View>
        <Animated.View style={heart.style}><Text style={{ fontSize: 16 }}>{'❤️'.repeat(hearts)}{'🤍'.repeat(3 - hearts)}</Text></Animated.View>
      </View>
      <View><XpPop amount={xpPop.amount} trigger={xpPop.trigger} /></View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl, alignItems: 'center' }} key={index} keyboardShouldPersistTaps="handled">
        <FadeScaleIn style={{ width: '100%', maxWidth: 560 }}>
          <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
            <ExerciseView exercise={exercise} onAnswer={onAnswer} />
          </View>
        </FadeScaleIn>
      </ScrollView>
    </View>
  );
}

function Center({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
      <Aurora />
      <FadeScaleIn style={{ width: '100%', alignItems: 'center' }}>{children}</FadeScaleIn>
    </View>
  );
}
