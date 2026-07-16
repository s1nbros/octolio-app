import { Alert, Linking, ScrollView, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { Button, Card } from '../../lib/ui';
import { colors, radius, spacing } from '../../lib/theme';
import { PRIVACY_URL, SHOW_PRO_UPGRADE, TERMS_URL, WEB_APP_URL } from '../../lib/config';

const LEVELS = [
  { label: 'Apprentice', minXp: 0 }, { label: 'Saver', minXp: 300 }, { label: 'Analyst', minXp: 700 },
  { label: 'Investor', minXp: 1400 }, { label: 'Wealth Builder', minXp: 2500 },
];
const levelOf = (xp: number) => [...LEVELS].reverse().find((l) => xp >= l.minXp) ?? LEVELS[0];

export default function Profile() {
  const { user, logout, deleteAccount } = useAuth();
  const insets = useSafeAreaInsets();
  if (!user) return null;

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all your progress, streak, and coins. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try { await deleteAccount(); }
            catch { Alert.alert('Could not delete account', 'Please try again in a moment.'); }
          },
        },
      ],
    );
  };

  return (
    <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}>
      {/* Identity */}
      <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
        <View style={{ width: 84, height: 84, borderRadius: 42, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm }}>
          <Text style={{ fontSize: 40 }}>🐙</Text>
        </View>
        <Text style={{ color: colors.fg, fontSize: 22, fontWeight: '800' }}>{user.name}</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 14 }}>{levelOf(user.xp).label}{user.is_pro ? ' · ✦ Pro' : ''}</Text>
      </View>

      {/* Stats */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
        <StatCard label="XP" value={user.xp.toLocaleString()} color={colors.primary} />
        <StatCard label="Streak" value={`🔥 ${user.streak}`} color={colors.orange} />
        <StatCard label="Coins" value={`${user.coins ?? 0}`} color={colors.green} />
      </View>

      {/* Pro upsell — sends to the web to subscribe. Hidden on iOS by default
          (see SHOW_PRO_UPGRADE in lib/config.ts for the store-rules reasoning). */}
      {SHOW_PRO_UPGRADE && !user.is_pro && (
        <Card style={{ marginBottom: spacing.lg }}>
          <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 16, marginBottom: 4 }}>✦ Octolio Pro</Text>
          <Text style={{ color: colors.fgMuted, marginBottom: spacing.md }}>
            Unlock all modules, the AI coach and unlimited energy.
          </Text>
          <Button title="Upgrade on the web" onPress={() => WebBrowser.openBrowserAsync(WEB_APP_URL)} />
        </Card>
      )}

      {/* Account actions */}
      <View style={{ gap: spacing.sm, marginBottom: spacing.xl }}>
        <Button title="Log out" variant="ghost" onPress={logout} />
        <Button title="Delete account" variant="danger" onPress={confirmDelete} />
      </View>

      {/* Legal */}
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
        <Text style={{ color: colors.fgSubtle }} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy</Text>
        <Text style={{ color: colors.fgSubtle }}>·</Text>
        <Text style={{ color: colors.fgSubtle }} onPress={() => Linking.openURL(TERMS_URL)}>Terms</Text>
      </View>
    </ScrollView>
  );
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' }}>
      <Text style={{ color, fontSize: 18, fontWeight: '800' }}>{value}</Text>
      <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 2 }}>{label}</Text>
    </View>
  );
}
