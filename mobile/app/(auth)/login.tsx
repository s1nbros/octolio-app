import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { Button, Field } from '../../lib/ui';
import { colors, spacing } from '../../lib/theme';
import { ApiError } from '../../lib/api';

export default function Login() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!email.trim() || !password) return;
    setBusy(true); setError('');
    try {
      await login(email.trim(), password);
    } catch (e) {
      const msg = e instanceof ApiError && e.data?.emailNotVerified
        ? 'Please verify your email first.'
        : 'Wrong email or password.';
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingTop: insets.top + spacing.lg }}>
        <Text style={{ fontSize: 34, fontWeight: '800', color: colors.fg, marginBottom: 4 }}>🐙 Octolio</Text>
        <Text style={{ fontSize: 16, color: colors.fgMuted, marginBottom: spacing.xl }}>Learn money the fun way.</Text>

        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" placeholder="you@example.com" autoComplete="email" />
        <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry
          placeholder="••••••••" autoComplete="password" />

        {error ? <Text style={{ color: colors.red, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Log in" onPress={submit} loading={busy} disabled={!email.trim() || !password} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.fgMuted }}>New here? </Text>
          <Link href="/(auth)/register" style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
