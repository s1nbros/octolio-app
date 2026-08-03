import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../lib/ui';
import { colors, radius, spacing } from '../lib/theme';
import { Aurora } from '../components/Aurora';
import { FadeScaleIn } from '../lib/anim';
import { DAILY_OPTIONS, DIAGNOSTIC, GOALS, LEVEL_LABEL, scoreToLevel, type Level } from '../lib/onboarding';

type Phase = 'goal' | 'diagnostic' | 'daily' | 'plan';
const TOTAL_STEPS = 1 + DIAGNOSTIC.length + 1 + 1;

export default function Onboarding() {
  const { token, refreshUser, markOnboarded } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [phase, setPhase] = useState<Phase>('goal');
  const [goal, setGoal] = useState<string | null>(null);
  const [diagIndex, setDiagIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [minutes, setMinutes] = useState<number | null>(null);
  const [busy, setBusy] = useState(false);

  const level: Level = scoreToLevel(correct);
  const stepNo = phase === 'goal' ? 1 : phase === 'diagnostic' ? 2 + diagIndex : phase === 'daily' ? 2 + DIAGNOSTIC.length : TOTAL_STEPS;

  const pickGoal = (id: string) => { setGoal(id); setPhase('diagnostic'); };
  const answerDiag = (i: number) => {
    const isCorrect = i === DIAGNOSTIC[diagIndex].correctIndex;
    const nextCorrect = correct + (isCorrect ? 1 : 0);
    setCorrect(nextCorrect);
    if (diagIndex + 1 >= DIAGNOSTIC.length) setPhase('daily');
    else setDiagIndex(diagIndex + 1);
  };
  const pickDaily = (m: number) => { setMinutes(m); setPhase('plan'); };

  const finish = async () => {
    if (busy || !token) return;
    setBusy(true);
    // Mark done locally FIRST so the survey never re-appears, even if the
    // network is flaky — then persist to the server best-effort and move on.
    await markOnboarded();
    api('/api/auth/onboarding-profile', { method: 'POST', token, body: { goal, experienceLevel: level, dailyGoalMin: minutes ?? 5 } }).catch(() => {});
    api('/api/auth/onboarding', { method: 'POST', token })
      .then(() => refreshUser())
      .catch(() => {});
    router.replace('/(tabs)');
  };

  const goalObj = GOALS.find((g) => g.id === goal);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      {/* Progress */}
      <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.md }}>
        <View style={{ height: 8, backgroundColor: colors.glass, borderRadius: 4, overflow: 'hidden' }}>
          <View style={{ height: 8, width: `${(stepNo / TOTAL_STEPS) * 100}%`, backgroundColor: colors.primary, borderRadius: 4 }} />
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        <FadeScaleIn>
          {phase === 'goal' && (
            <View>
              <Text style={title}>What brings you to Octolio?</Text>
              <Text style={sub}>We'll tailor your path to this.</Text>
              {GOALS.map((g) => (
                <Pressable key={g.id} onPress={() => pickGoal(g.id)} style={optionCard}>
                  <Text style={{ fontSize: 26, marginRight: spacing.sm }}>{g.emoji}</Text>
                  <Text style={{ color: colors.fg, fontSize: 16, fontWeight: '600', flex: 1 }}>{g.label}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {phase === 'diagnostic' && (
            <View key={diagIndex}>
              <Text style={sub}>Quick check · {diagIndex + 1} of {DIAGNOSTIC.length}</Text>
              <Text style={title}>{DIAGNOSTIC[diagIndex].question}</Text>
              {DIAGNOSTIC[diagIndex].options.map((o, i) => (
                <Pressable key={i} onPress={() => answerDiag(i)} style={optionCard}>
                  <Text style={{ color: colors.fg, fontSize: 15, flex: 1 }}>{o}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {phase === 'daily' && (
            <View>
              <Text style={title}>How much time per day?</Text>
              <Text style={sub}>You can change this anytime.</Text>
              {DAILY_OPTIONS.map((d) => (
                <Pressable key={d.minutes} onPress={() => pickDaily(d.minutes)} style={[optionCard, d.recommended ? { borderColor: colors.primary } : null]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.fg, fontSize: 16, fontWeight: '700' }}>{d.label}{d.recommended ? '  ⭐' : ''}</Text>
                    <Text style={{ color: colors.fgMuted, fontSize: 13 }}>{d.sub}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          )}

          {phase === 'plan' && (
            <View>
              <Text style={{ fontSize: 44, textAlign: 'center' }}>{goalObj?.emoji ?? '🎯'}</Text>
              <Text style={[title, { textAlign: 'center' }]}>Your Money Plan</Text>
              <View style={{ backgroundColor: colors.card, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginTop: spacing.md, gap: spacing.md }}>
                <Row label="Goal" value={goalObj?.label ?? ''} />
                <Row label="Your level" value={LEVEL_LABEL[level]} />
                <Row label="Daily commitment" value={DAILY_OPTIONS.find((d) => d.minutes === minutes)?.sub ?? '5 min / day'} />
              </View>
              <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: spacing.md, marginBottom: spacing.lg }}>
                We'll start with the basics and build up. Let's go! 🐙
              </Text>
              <Button title="Start learning →" onPress={finish} loading={busy} />
            </View>
          )}
        </FadeScaleIn>
      </ScrollView>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Text style={{ color: colors.fgSubtle }}>{label}</Text>
      <Text style={{ color: colors.fg, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: spacing.md }}>{value}</Text>
    </View>
  );
}

const title = { color: colors.fg, fontSize: 24, fontWeight: '800' as const, marginBottom: 6, marginTop: spacing.sm };
const sub = { color: colors.fgMuted, fontSize: 14, marginBottom: spacing.md };
const optionCard = { flexDirection: 'row' as const, alignItems: 'center' as const, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1.5, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm };
