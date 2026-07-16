import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { Button, Field } from '../../lib/ui';
import { colors, spacing } from '../../lib/theme';

export default function Verify() {
  const { verifyEmail } = useAuth();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ email?: string; devCode?: string }>();
  const email = params.email ?? '';
  const [code, setCode] = useState(params.devCode ?? '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (code.trim().length < 4) return;
    setBusy(true); setError('');
    try {
      await verifyEmail(email, code.trim());
    } catch {
      setError('That code is invalid or expired.');
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingTop: insets.top + spacing.lg }}>
        <Text style={{ fontSize: 30, fontWeight: '800', color: colors.fg, marginBottom: 8 }}>Check your inbox</Text>
        <Text style={{ fontSize: 15, color: colors.fgMuted, marginBottom: spacing.xl }}>
          We sent a 6-digit code to {email}. Enter it below to finish.
        </Text>

        <Field label="Verification code" value={code} onChangeText={setCode} keyboardType="number-pad"
          placeholder="123456" maxLength={6} />

        {error ? <Text style={{ color: colors.red, marginBottom: spacing.md }}>{error}</Text> : null}

        <Button title="Verify & start" onPress={submit} loading={busy} disabled={code.trim().length < 4} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
