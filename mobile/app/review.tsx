import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../lib/ui';
import { colors, radius, spacing } from '../lib/theme';
import { Aurora } from '../components/Aurora';
import { ExerciseView, type Exercise } from '../components/ExerciseView';
import { FadeScaleIn } from '../lib/anim';

interface Card { id: number; exercise: Exercise; }

export default function Review() {
  const { token, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [cards, setCards] = useState<Card[]>([]);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [phase, setPhase] = useState<'loading' | 'active' | 'done'>('loading');

  useEffect(() => {
    api<{ cards: Card[] }>('/api/review/due', { token })
      .then((d) => { setCards(d.cards ?? []); setPhase((d.cards ?? []).length ? 'active' : 'done'); })
      .catch(() => setPhase('done'));
  }, [token]);

  const onAnswer = useCallback((correct: boolean) => {
    const card = cards[index];
    if (card) api('/api/review/done', { method: 'POST', token, body: { cardId: card.id, correct } }).catch(() => {});
    if (correct) setCorrectCount((c) => c + 1);
    const next = index + 1;
    if (next >= cards.length) { refreshUser(); setPhase('done'); }
    else setIndex(next);
  }, [cards, index, token, refreshUser]);

  if (phase === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><Aurora /><ActivityIndicator color={colors.primary} /></View>;
  }

  if (phase === 'done') {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Aurora />
        <FadeScaleIn style={{ width: '100%', alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>{cards.length ? '🧠' : '✨'}</Text>
          <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800', marginTop: spacing.sm, textAlign: 'center' }}>
            {cards.length ? 'Review complete!' : 'Nothing to review'}
          </Text>
          <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: 6 }}>
            {cards.length ? `You got ${correctCount}/${cards.length} right. Spaced repetition locks it in.` : "You're all caught up — come back when cards are due."}
          </Text>
          <View style={{ height: spacing.lg }} />
          <View style={{ width: '100%' }}><Button title="Done" onPress={() => router.back()} /></View>
        </FadeScaleIn>
      </View>
    );
  }

  const card = cards[index];
  const progress = (index / cards.length) * 100;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="close" size={24} color={colors.fgMuted} /></Pressable>
        <View style={{ flex: 1, height: 10, backgroundColor: colors.glass, borderRadius: 5, overflow: 'hidden' }}>
          <View style={{ height: 10, width: `${progress}%`, backgroundColor: colors.primary, borderRadius: 5 }} />
        </View>
        <Text style={{ color: colors.fgMuted, fontWeight: '700' }}>🧠 {index + 1}/{cards.length}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }} key={index} keyboardShouldPersistTaps="handled">
        <FadeScaleIn>
          <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
            <ExerciseView exercise={card.exercise} onAnswer={(correct) => onAnswer(correct)} />
          </View>
        </FadeScaleIn>
      </ScrollView>
    </View>
  );
}
