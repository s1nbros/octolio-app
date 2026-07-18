import { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { colors, radius, spacing } from '../../lib/theme';
import { Aurora } from '../../components/Aurora';

interface Row { rank: number; id: number; name: string; xp: number; avatar: string | null; isYou: boolean; }

const medal = (rank: number) => (rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `${rank}`);

export default function League() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const d = await api<{ leaderboard: Row[] }>('/api/auth/league', { token });
      setRows(d.leaderboard ?? []);
    } finally { setLoading(false); }
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Aurora />
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800', marginBottom: 2 }}>🏆 League</Text>
        <Text style={{ color: colors.fgSubtle, fontSize: 13, marginBottom: spacing.lg }}>Top learners by XP</Text>

        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} /> : (
          <View style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' }}>
            {rows.map((r, i) => (
              <View key={`${r.id}-${r.rank}`}
                style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, padding: spacing.md,
                  backgroundColor: r.isYou ? colors.primarySoft : colors.card,
                  borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
                <Text style={{ width: 34, textAlign: 'center', fontSize: r.rank <= 3 ? 20 : 15, fontWeight: '800', color: colors.fgMuted }}>{medal(r.rank)}</Text>
                <View style={{ width: 36, height: 36, borderRadius: 18, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
                  <Text style={{ color: colors.primary, fontWeight: '800' }}>{r.name?.[0]?.toUpperCase() ?? '?'}</Text>
                </View>
                <Text style={{ flex: 1, color: colors.fg, fontWeight: r.isYou ? '800' : '600' }} numberOfLines={1}>
                  {r.name}{r.isYou ? '  (you)' : ''}
                </Text>
                <Text style={{ color: colors.fg, fontWeight: '800' }}>{r.xp.toLocaleString()} XP</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
