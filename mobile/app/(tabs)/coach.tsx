import { useRef, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';
import { colors, radius, spacing } from '../../lib/theme';
import { Aurora } from '../../components/Aurora';
import { Markdown } from '../../lib/markdown';
import { Button } from '../../lib/ui';
import { WEB_APP_URL } from '../../lib/config';

interface Msg { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS = [
  'How do I start an emergency fund?',
  'Explain the 50/30/20 budgeting rule',
  'Should I pay off debt or invest first?',
  'How much should I save for retirement?',
];

export default function Coach() {
  const { user, token } = useAuth();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<ScrollView>(null);

  // ── Free users: Pro upsell ──
  if (!user?.is_pro) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Aurora />
        <View style={{ width: '100%', maxWidth: 380, alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
          <Text style={{ fontSize: 52 }}>🐙</Text>
          <View style={{ backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 12, paddingVertical: 4, marginTop: spacing.sm }}>
            <Text style={{ color: colors.white, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>✦ PRO ONLY</Text>
          </View>
          <Text style={{ color: colors.fg, fontSize: 22, fontWeight: '800', marginTop: spacing.md, textAlign: 'center' }}>The AI Money Coach is a Pro feature</Text>
          <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: 8, marginBottom: spacing.lg, lineHeight: 21 }}>
            Ask anything about budgeting, investing, debt or taxes and get clear, practical answers — with Octolio Pro.
          </Text>
          <View style={{ width: '100%' }}>
            <Button title="✦ Go Pro" onPress={() => WebBrowser.openBrowserAsync(WEB_APP_URL)} />
          </View>
          <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 10, textAlign: 'center' }}>Opens octolio.me to subscribe.</Text>
        </View>
      </View>
    );
  }

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !token) return;
    const next: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next); setInput(''); setError(''); setLoading(true);
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    try {
      const data = await api<{ text: string }>('/api/ai/chat', { method: 'POST', token, body: { messages: next } });
      if (!data.text) throw new Error('empty');
      setMessages((m) => [...m, { role: 'assistant', content: data.text }]);
    } catch (e) {
      const c = e instanceof ApiError ? e.data?.error : '';
      setError(c === 'rate_limited' ? 'The coach is busy — wait a minute and try again.'
        : c === 'overloaded' ? 'The AI is briefly overloaded — try again in a moment.'
        : 'Something went wrong — try again.');
    } finally {
      setLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md, paddingBottom: spacing.sm }}>
        <Text style={{ fontSize: 26 }}>🐙</Text>
        <View>
          <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 18 }}>AI Money Coach</Text>
          <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>Your personal finance guide</Text>
        </View>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }} keyboardVerticalOffset={insets.top + 44}>
        <ScrollView ref={scrollRef} contentContainerStyle={{ padding: spacing.md, gap: spacing.sm }} keyboardShouldPersistTaps="handled">
          {messages.length === 0 && !loading && (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.sm }}>
              <Text style={{ color: colors.fgMuted, marginBottom: 4 }}>👋 Ask me anything, or start with one of these:</Text>
              {SUGGESTIONS.map((s) => (
                <Pressable key={s} onPress={() => send(s)} style={{ backgroundColor: colors.primarySoft, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm }}>
                  <Text style={{ color: colors.fg }}>{s}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {messages.map((m, i) => (
            <View key={i} style={{ alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start', maxWidth: '88%' }}>
              <View style={{ borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
                backgroundColor: m.role === 'user' ? colors.primary : colors.bgCard,
                borderWidth: m.role === 'user' ? 0 : 1, borderColor: colors.border }}>
                {m.role === 'user'
                  ? <Text style={{ color: colors.white, fontSize: 15, lineHeight: 21 }}>{m.content}</Text>
                  : <Markdown text={m.content} />}
              </View>
            </View>
          ))}

          {loading && <View style={{ alignSelf: 'flex-start', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}><ActivityIndicator color={colors.fgMuted} /></View>}
          {error ? <Text style={{ color: colors.red, textAlign: 'center', fontSize: 12 }}>{error}</Text> : null}
        </ScrollView>

        <View style={{ flexDirection: 'row', gap: spacing.sm, padding: spacing.md, paddingBottom: insets.bottom + spacing.sm, borderTopWidth: 1, borderTopColor: colors.border }}>
          <TextInput value={input} onChangeText={setInput} placeholder="Ask about money…" placeholderTextColor={colors.fgSubtle}
            onSubmitEditing={() => send(input)} returnKeyType="send"
            style={{ flex: 1, height: 48, borderRadius: radius.md, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 15 }} />
          <Pressable onPress={() => send(input)} disabled={loading || !input.trim()}
            style={{ paddingHorizontal: 18, justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primary, opacity: !input.trim() || loading ? 0.5 : 1 }}>
            <Text style={{ color: colors.white, fontWeight: '800' }}>Send</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
