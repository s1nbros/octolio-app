import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { Button, Field } from '../../lib/ui';
import { colors, spacing } from '../../lib/theme';
import { ApiError } from '../../lib/api';

export default function Register() {
  const { register } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const valid = name.trim().length >= 2 && email.trim().includes('@') && password.length >= 8;

  const submit = async () => {
    if (!valid) return;
    setBusy(true); setError('');
    try {
      const { devCode } = await register(name.trim(), email.trim(), password);
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim(), devCode: devCode ?? '' } });
    } catch (e) {
      setError(e instanceof ApiError ? (e.data?.error ?? 'Could not register.') : 'Could not register.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingTop: insets.top + spacing.lg }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.fg, marginBottom: spacing.xl }}>Create your account</Text>

        <Field label="Nickname" value={name} onChangeText={setName} autoCapitalize="none" placeholder="octonaut" />
        <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none"
          keyboardType="email-address" placeholder="you@example.com" />
        <Field label="Password (min 8 chars)" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

        {error ? <Text style={{ color: colors.red, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Continue" onPress={submit} loading={busy} disabled={!valid} />

        <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
          <Text style={{ color: colors.fgMuted }}>Already have an account? </Text>
          <Link href="/(auth)/login" style={{ color: colors.primary, fontWeight: '700' }}>Log in</Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
