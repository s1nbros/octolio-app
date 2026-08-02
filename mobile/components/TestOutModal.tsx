import { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../lib/ui';
import { colors, radius, spacing } from '../lib/theme';

interface Q { exerciseId: string; prompt: { en: string }; options: { en: string }[]; }
interface Quiz { eligible: boolean; reason?: string; title?: { en: string }; total?: number; passNeeded?: number; rewardXp?: number; questions?: Q[]; }
interface Result { passed: boolean; score: number; total: number; passNeeded: number; xpAwarded?: number; totalXp?: number; streak?: number; }

const en = (v: any) => (v && typeof v === 'object' ? v.en : v);

/** "Test out of a module" — a short quiz; passing marks the whole module complete. */
export function TestOutModal({ moduleId, onClose, onPassed }: { moduleId: string | null; onClose: () => void; onPassed: () => void }) {
  const { token, updateUser } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'quiz' | 'result'>('loading');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!moduleId || !token) return;
    setPhase('loading'); setIdx(0); setAnswers({}); setResult(null);
    api<Quiz>(`/api/testout/${moduleId}`, { token })
      .then((d) => { setQuiz(d); setPhase(d.eligible ? 'intro' : 'result'); })
      .catch(() => { setQuiz({ eligible: false, reason: 'error' }); setPhase('result'); });
  }, [moduleId, token]);

  if (!moduleId) return null;
  const questions = quiz?.questions ?? [];
  const q = questions[idx];

  const next = async () => {
    if (idx < questions.length - 1) { setIdx(idx + 1); return; }
    if (!token) return;
    setBusy(true);
    try {
      const data = await api<Result>(`/api/testout/${moduleId}`, { method: 'POST', token, body: { answers } });
      setResult(data); setPhase('result');
      if (data.passed) { if (typeof data.totalXp === 'number') updateUser({ xp: data.totalXp }); if (typeof data.streak === 'number') updateUser({ streak: data.streak }); }
    } catch { setResult({ passed: false, score: 0, total: questions.length, passNeeded: quiz?.passNeeded ?? 0 }); setPhase('result'); }
    setBusy(false);
  };

  const close = () => { const passed = result?.passed; onClose(); if (passed) onPassed(); };

  const reasonText = (r?: string) => r === 'completed' ? "You've already completed this module." : r === 'no_quiz' ? 'This module has no quiz to test out of.' : r === 'locked' ? 'Finish the earlier modules first.' : r === 'pro_required' ? 'This module is Pro-only.' : 'Test-out is not available here.';

  return (
    <Modal transparent animationType="fade" onRequestClose={close}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,4,12,0.85)', alignItems: 'center', justifyContent: 'center', padding: spacing.md }}>
        <View style={{ width: '100%', maxWidth: 420, backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
          {phase === 'loading' && <ActivityIndicator color={colors.primary} style={{ marginVertical: spacing.xl }} />}

          {phase === 'intro' && quiz?.eligible && (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 44 }}>⚡</Text>
              <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', marginVertical: spacing.sm }}>Test out</Text>
              <Text style={{ color: colors.fgMuted, textAlign: 'center', marginBottom: spacing.lg }}>
                Answer {quiz.total} quick questions from {en(quiz.title)}. Get {quiz.passNeeded}+ right to skip the whole module and earn +{quiz.rewardXp} XP.
              </Text>
              <View style={{ width: '100%' }}><Button title="Start test →" onPress={() => setPhase('quiz')} /></View>
            </View>
          )}

          {phase === 'quiz' && q && (
            <View>
              <Text style={{ color: colors.primary, fontWeight: '800', marginBottom: spacing.sm }}>{idx + 1} / {questions.length}</Text>
              <ScrollView style={{ maxHeight: 360 }}>
                <Text style={{ color: colors.fg, fontSize: 16, fontWeight: '700', lineHeight: 23, marginBottom: spacing.md }}>{en(q.prompt)}</Text>
                {q.options.map((o, i) => {
                  const sel = answers[q.exerciseId] === i;
                  return (
                    <Pressable key={i} onPress={() => setAnswers((a) => ({ ...a, [q.exerciseId]: i }))}
                      style={{ padding: spacing.md, borderRadius: radius.md, borderWidth: 1.5, borderColor: sel ? colors.primary : colors.border, backgroundColor: sel ? colors.primarySoft : colors.card, marginBottom: spacing.sm }}>
                      <Text style={{ color: colors.fg }}>{en(o)}</Text>
                    </Pressable>
                  );
                })}
              </ScrollView>
              <Button title={idx < questions.length - 1 ? 'Next →' : 'Submit'} onPress={next} disabled={answers[q.exerciseId] === undefined || busy} loading={busy} />
            </View>
          )}

          {phase === 'result' && (
            <View style={{ alignItems: 'center' }}>
              {!quiz?.eligible ? (
                <><Text style={{ fontSize: 40 }}>🚫</Text><Text style={{ color: colors.fgMuted, textAlign: 'center', marginVertical: spacing.md }}>{reasonText(quiz?.reason)}</Text><View style={{ width: '100%' }}><Button title="Close" variant="ghost" onPress={close} /></View></>
              ) : result?.passed ? (
                <><Text style={{ fontSize: 52 }}>🎉</Text><Text style={{ color: colors.green, fontSize: 20, fontWeight: '800', marginVertical: 4 }}>Tested out!</Text><Text style={{ color: colors.fgMuted }}>Scored {result.score}/{result.total}.</Text><Text style={{ color: colors.green, fontWeight: '700', marginVertical: spacing.sm }}>Module complete · +{result.xpAwarded} XP</Text><View style={{ width: '100%' }}><Button title="Nice!" onPress={close} /></View></>
              ) : (
                <><Text style={{ fontSize: 52 }}>📚</Text><Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', marginVertical: 4 }}>Not this time</Text><Text style={{ color: colors.fgMuted, textAlign: 'center', marginBottom: spacing.md }}>You got {result?.score}/{result?.total} (needed {result?.passNeeded}). Work through the lessons and you'll nail it.</Text><View style={{ width: '100%' }}><Button title="Go to lessons" onPress={close} /></View></>
              )}
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
