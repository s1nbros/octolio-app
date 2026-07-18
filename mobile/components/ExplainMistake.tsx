import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useAuth } from '../lib/auth';
import { api, ApiError } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { Markdown } from '../lib/markdown';
import { SHOW_PRO_UPGRADE, WEB_APP_URL } from '../lib/config';

/** After a wrong answer: a 🐙 button that asks the AI (Gemini) why it was wrong.
 *  Free users get a small daily quota (user.ai_explains_remaining); Pro is unlimited. */
export function ExplainMistake({ exercise, userAnswer }: { exercise: any; userAnswer?: string }) {
  const { token, user, updateUser } = useAuth();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [text, setText] = useState('');

  const isPro = !!user?.is_pro;
  const remaining = user?.ai_explains_remaining;
  const locked = !isPro && typeof remaining === 'number' && remaining <= 0 && state !== 'done';

  const explain = async () => {
    if (!token || state === 'loading') return;
    setState('loading');
    try {
      const data = await api<{ text: string; remaining: number | null }>('/api/ai/explain', {
        method: 'POST', token, body: { context: buildContext(exercise), userAnswer },
      });
      setText(data.text);
      setState('done');
      if (!isPro && typeof data.remaining === 'number') updateUser({ ai_explains_remaining: data.remaining });
    } catch (e) {
      if (e instanceof ApiError && e.data?.error === 'daily_limit') { updateUser({ ai_explains_remaining: 0 }); setState('idle'); return; }
      setState('error');
    }
  };

  if (locked) {
    return (
      <Pressable onPress={() => SHOW_PRO_UPGRADE && WebBrowser.openBrowserAsync(WEB_APP_URL)}
        style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.sm, marginBottom: spacing.sm, alignItems: 'center' }}>
        <Text style={{ color: colors.primary, fontWeight: '700' }}>🐙 Out of free explanations — go Pro ✦</Text>
      </Pressable>
    );
  }

  if (state === 'done') {
    return (
      <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.md, marginBottom: spacing.sm }}>
        <Text style={{ color: colors.primary, fontWeight: '800', marginBottom: 4 }}>🐙 Octolio explains</Text>
        <Markdown text={text} />
      </View>
    );
  }

  return (
    <View style={{ marginBottom: spacing.sm }}>
      <Pressable onPress={explain} disabled={state === 'loading'}
        style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.primarySoft, padding: spacing.sm, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
        {state === 'loading' ? <ActivityIndicator color={colors.primary} /> : (
          <Text style={{ color: colors.primary, fontWeight: '700' }}>
            🐙 Why was this wrong?{!isPro && typeof remaining === 'number' ? `  (${remaining} left today)` : ''}
          </Text>
        )}
      </Pressable>
      {state === 'error' && <Text style={{ color: colors.red, fontSize: 12, textAlign: 'center', marginTop: 4 }}>Couldn't load — try again.</Text>}
    </View>
  );
}

const en = (v: any): string => (v && typeof v === 'object' ? v.en ?? '' : v ?? '');

/** Flatten an exercise into a compact description for the AI (English). */
function buildContext(ex: any): string {
  const lines: string[] = [];
  if (ex.question) lines.push(`Question: ${en(ex.question)}`);
  if (ex.statement) lines.push(`Statement: ${en(ex.statement)}`);
  if (ex.decisionScenario) lines.push(`Scenario: ${en(ex.decisionScenario)}`);
  if (ex.fillNumberScenario) lines.push(`Scenario: ${en(ex.fillNumberScenario)}`);
  if (Array.isArray(ex.options) && ex.options.length) {
    lines.push('Options:');
    ex.options.forEach((o: any, i: number) => lines.push(`  ${['A', 'B', 'C', 'D'][i] ?? i + 1}. ${en(o)}${i === ex.correctIndex ? '  (correct)' : ''}`));
  }
  if (Array.isArray(ex.decisionChoices)) {
    lines.push('Choices:');
    ex.decisionChoices.forEach((c: any) => lines.push(`  - ${en(c.label)}${c.isBest ? '  (best)' : ''}`));
  }
  if (typeof ex.correctAnswer === 'number') lines.push(`Correct answer: ${ex.correctAnswer}${ex.answerUnit ?? ''}`);
  if (typeof ex.fillNumberAnswer === 'number') lines.push(`Correct answer: ${ex.fillNumberUnit ?? ''}${ex.fillNumberAnswer}`);
  if (typeof ex.isTrue === 'boolean') lines.push(`Correct answer: ${ex.isTrue ? 'True' : 'False'}`);
  if (ex.explanation) lines.push(`Official explanation: ${en(ex.explanation)}`);
  if (!lines.length) lines.push(`Exercise type: ${ex.type}`);
  return lines.join('\n');
}
