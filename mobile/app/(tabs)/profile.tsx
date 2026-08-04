import { Alert, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/auth';
import { colors, radius, spacing } from '../../lib/theme';
import { Aurora } from '../../components/Aurora';
import { OctopusAvatar } from '../../components/OctopusAvatar';
import { emojiFor } from '../../lib/cosmetics';
import { PRIVACY_URL, SHOW_PRO_UPGRADE, TERMS_URL, WEB_APP_URL } from '../../lib/config';

const LEVELS = [
  { label: 'Apprentice', minXp: 0 }, { label: 'Saver', minXp: 300 }, { label: 'Analyst', minXp: 700 },
  { label: 'Investor', minXp: 1400 }, { label: 'Wealth Builder', minXp: 2500 },
];

export default function Profile() {
  const { user, logout, deleteAccount } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  if (!user) return null;

  const idx = Math.max(0, LEVELS.map((l) => user.xp >= l.minXp).lastIndexOf(true));
  const cur = LEVELS[idx];
  const next = LEVELS[idx + 1];
  const pct = next ? Math.min(100, Math.round(((user.xp - cur.minXp) / (next.minXp - cur.minXp)) * 100)) : 100;

  const confirmDelete = () => {
    Alert.alert(
      'Delete account?',
      'This permanently deletes your account and all your progress, streak, and coins. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete', style: 'destructive',
          onPress: async () => {
            try { await deleteAccount(); }
            catch { Alert.alert('Could not delete account', 'Please try again in a moment.'); }
          },
        },
      ],
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Aurora />
      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}>
        {/* Hero */}
        <LinearGradient colors={[colors.primarySoft, colors.bgCard]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
          style={{ borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center', marginBottom: spacing.lg }}>
          <OctopusAvatar size={128} hatEmoji={emojiFor(user.equipped_hat)} faceEmoji={emojiFor(user.equipped_face)} bodyEmoji={emojiFor(user.equipped_body)} />
          <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '900', marginTop: spacing.sm }}>{user.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 }}>
            <Text style={{ color: colors.fgMuted, fontSize: 14 }}>Lv {idx + 1} · {cur.label}</Text>
            {user.is_pro ? (
              <View style={{ backgroundColor: colors.primary, borderRadius: radius.pill, paddingHorizontal: 8, paddingVertical: 2 }}>
                <Text style={{ color: colors.white, fontSize: 11, fontWeight: '800' }}>✦ PRO</Text>
              </View>
            ) : null}
          </View>

          {/* Level progress */}
          <View style={{ width: '100%', marginTop: spacing.md }}>
            <View style={{ height: 8, borderRadius: 4, backgroundColor: colors.glass, overflow: 'hidden' }}>
              <View style={{ height: 8, width: `${pct}%`, backgroundColor: colors.green, borderRadius: 4 }} />
            </View>
            <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 6, textAlign: 'center' }}>
              {next ? `${user.xp.toLocaleString()} XP · ${(next.minXp - user.xp).toLocaleString()} to ${next.label}` : `${user.xp.toLocaleString()} XP · max level reached 🏆`}
            </Text>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg }}>
          <StatCard icon="✨" label="Total XP" value={user.xp.toLocaleString()} color={colors.primary} />
          <StatCard icon="🔥" label="Streak" value={`${user.streak}`} color={colors.orange} />
          <StatCard icon="🪙" label="Coins" value={`${user.coins ?? 0}`} color={colors.green} />
        </View>

        {/* Pro upsell — sends to the web to subscribe. Hidden on iOS by default
            (see SHOW_PRO_UPGRADE in lib/config.ts for the store-rules reasoning). */}
        {SHOW_PRO_UPGRADE && !user.is_pro ? (
          <Pressable onPress={() => WebBrowser.openBrowserAsync(WEB_APP_URL)}
            style={{ backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.primary, padding: spacing.md, marginBottom: spacing.lg }}>
            <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 16, marginBottom: 2 }}>✦ Octolio Pro</Text>
            <Text style={{ color: colors.fgMuted, fontSize: 13 }}>Unlock all modules, the AI coach and unlimited energy.</Text>
          </Pressable>
        ) : null}

        {/* Menu */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.lg }}>
          <Row icon="people" iconColor={colors.primary} label="Friends" sub="Requests, co-op quests & streaks" onPress={() => router.push('/friends')} />
          <Divider />
          <Row icon="shirt" iconColor={colors.green} label="Shop" sub="Dress up your octopus" onPress={() => router.push('/shop')} />
          <Divider />
          <Row icon="ribbon" iconColor={colors.orange} label="Daily Quests" sub="Earn bonus XP" onPress={() => router.push('/quests')} />
        </View>

        {/* Account */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.lg }}>
          <Row icon="log-out-outline" iconColor={colors.fgMuted} label="Log out" onPress={logout} chevron={false} />
          <Divider />
          <Row icon="trash-outline" iconColor={colors.red} label="Delete account" labelColor={colors.red} onPress={confirmDelete} chevron={false} />
        </View>

        {/* Legal */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: spacing.md }}>
          <Text style={{ color: colors.fgSubtle }} onPress={() => Linking.openURL(PRIVACY_URL)}>Privacy</Text>
          <Text style={{ color: colors.fgSubtle }}>·</Text>
          <Text style={{ color: colors.fgSubtle }} onPress={() => Linking.openURL(TERMS_URL)}>Terms</Text>
        </View>
      </ScrollView>
    </View>
  );
}

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, alignItems: 'center' }}>
      <Text style={{ fontSize: 16 }}>{icon}</Text>
      <Text style={{ color, fontSize: 20, fontWeight: '900', marginTop: 2 }}>{value}</Text>
      <Text style={{ color: colors.fgSubtle, fontSize: 11, marginTop: 1 }}>{label}</Text>
    </View>
  );
}

function Row({ icon, iconColor, label, labelColor, sub, onPress, chevron = true }: {
  icon: any; iconColor: string; label: string; labelColor?: string; sub?: string; onPress: () => void; chevron?: boolean;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md, backgroundColor: pressed ? colors.glass : 'transparent' })}>
      <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={19} color={iconColor} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: labelColor ?? colors.fg, fontSize: 15, fontWeight: '700' }}>{label}</Text>
        {sub ? <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 1 }}>{sub}</Text> : null}
      </View>
      {chevron ? <Ionicons name="chevron-forward" size={18} color={colors.fgSubtle} /> : null}
    </Pressable>
  );
}

function Divider() {
  return <View style={{ height: 1, backgroundColor: colors.border, marginLeft: spacing.md + 36 + spacing.md }} />;
}
