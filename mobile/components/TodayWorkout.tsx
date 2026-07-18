import { useCallback, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { Button } from '../lib/ui';

interface Today {
  alreadyDone: boolean;
  rewardXp: number;
  rewardCoins: number;
  question: { id: string; question: { en: string }; options: { en: string }[] };
}
interface AnswerResp { correct: boolean; correctIndex: number; explanation: { en: string }; xpAwarded: number; coinsAwarded: number; totalXp: number; coins: number; streak: number; }

const en = (v: any): string => (v && typeof v === 'object' ? v.en ?? '' : v ?? '');

/** The Daily Money Workout — a 60-second, once-a-day question that keeps the streak alive. */
export function TodayWorkout() {
  const { token, updateUser } = useAuth();
  const [today, setToday] = useState<Today | null>(null);
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResp | null>(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    if (!token) return;
    api<Today>('/api/workout/today', { token }).then(setToday).catch(() => {});
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (!today) return null;

  const answer = async (choice: number) => {
    if (busy || !token) return;
    setPicked(choice); setBusy(true);
    try {
      const r = await api<AnswerResp>('/api/workout/answer', { method: 'POST', token, body: { choice } });
      setResult(r);
      updateUser({ xp: r.totalXp, coins: r.coins, streak: r.streak });
    } catch {} finally { setBusy(false); }
  };

  const close = () => { setOpen(false); setPicked(null); setResult(null); load(); };

  return (
    <>
      {today.alreadyDone ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.lg, backgroundColor: colors.greenSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
          <Text style={{ fontSize: 22 }}>✅</Text>
          <Text style={{ color: colors.fg, fontWeight: '700', flex: 1 }}>Daily workout done — streak safe!</Text>
        </View>
      ) : (
        <Pressable onPress={() => setOpen(true)}
          style={{ marginBottom: spacing.lg, backgroundColor: colors.orangeSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
          <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>🧠</Text></View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.fg, fontWeight: '800' }}>Daily Money Workout</Text>
            <Text style={{ color: colors.fgMuted, fontSize: 12 }}>60 seconds · +{today.rewardXp} XP · keeps your streak</Text>
          </View>
          <View style={{ backgroundColor: colors.green, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md }}><Text style={{ color: colors.bg, fontWeight: '800' }}>Start</Text></View>
        </Pressable>
      )}

      <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
        <Pressable onPress={close} style={{ flex: 1, backgroundColor: 'rgba(5,4,12,0.8)', justifyContent: 'flex-end' }}>
          <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.bgCard, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl }}>
            <Text style={{ color: colors.orange, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: spacing.sm }}>🧠 DAILY WORKOUT</Text>
            <Text style={{ color: colors.fg, fontSize: 17, fontWeight: '700', lineHeight: 24, marginBottom: spacing.md }}>{en(today.question.question)}</Text>

            {today.question.options.map((o, i) => {
              const isCorrect = result && i === result.correctIndex;
              const isWrongPick = result && i === picked && !result.correct;
              const border = isCorrect ? colors.green : isWrongPick ? colors.red : picked === i ? colors.primary : colors.border;
              return (
                <Pressable key={i} disabled={!!result || busy} onPress={() => answer(i)}
                  style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: border, backgroundColor: colors.bgElevated, marginBottom: spacing.sm }}>
                  <Text style={{ color: colors.fg }}>{en(o)}</Text>
                </Pressable>
              );
            })}

            {result && (
              <View style={{ marginTop: spacing.sm }}>
                <Text style={{ color: result.correct ? colors.green : colors.red, fontWeight: '800', marginBottom: 4 }}>
                  {result.correct ? `✓ Correct · +${result.xpAwarded} XP · +${result.coinsAwarded} 🪙` : '✗ Not quite'}
                </Text>
                <Text style={{ color: colors.fgMuted, lineHeight: 21, marginBottom: spacing.md }}>{en(result.explanation)}</Text>
                <Button title="Done" onPress={close} />
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
