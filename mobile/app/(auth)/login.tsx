import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, useWindowDimensions, View } from 'react-native';
import { Link } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { Button, Field } from '../../lib/ui';
import { colors, radius, spacing } from '../../lib/theme';
import { ApiError } from '../../lib/api';
import { Aurora } from '../../components/Aurora';
import { OctolioLogo } from '../../components/OctolioLogo';

export default function Login() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const logoSize = Math.max(96, Math.min(width * 0.34, 150));
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
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Aurora />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: spacing.lg, paddingTop: insets.top + spacing.lg }} keyboardShouldPersistTaps="handled">
          <View style={{ width: '100%', maxWidth: 460, alignSelf: 'center' }}>
            {/* Brand */}
            <View style={{ alignItems: 'center', marginBottom: spacing.xl }}>
              <OctolioLogo size={logoSize} />
              <Text style={{ fontSize: 32, fontWeight: '900', color: colors.fg, marginTop: spacing.sm, letterSpacing: 0.5 }}>Octolio</Text>
              <Text style={{ fontSize: 15, color: colors.fgMuted, marginTop: 2 }}>Learn money the fun way.</Text>
            </View>

            {/* Card */}
            <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg }}>
              <Text style={{ fontSize: 20, fontWeight: '800', color: colors.fg, marginBottom: spacing.md }}>Welcome back 👋</Text>
              <Field label="Email" value={email} onChangeText={setEmail} autoCapitalize="none"
                keyboardType="email-address" placeholder="you@example.com" autoComplete="email" />
              <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry
                placeholder="••••••••" autoComplete="password" />
              {error ? <Text style={{ color: colors.red, marginBottom: spacing.md }}>{error}</Text> : null}
              <Button title="Log in" onPress={submit} loading={busy} disabled={!email.trim() || !password} />
            </View>

            <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: spacing.lg }}>
              <Text style={{ color: colors.fgMuted }}>New here? </Text>
              <Link href="/(auth)/register" style={{ color: colors.primary, fontWeight: '700' }}>Create an account</Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
