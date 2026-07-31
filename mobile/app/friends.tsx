import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { Aurora } from '../components/Aurora';

interface Friend { id: number; name: string; xp: number; streak: number; friend_streak?: number; }
interface PendingRow { request_id: number; id: number; name: string; xp: number; }
interface SearchResult { id: number; name: string; xp: number; status: 'none' | 'pending_out' | 'pending_in' | 'friends'; }
interface Quest { friendId: number; friendName: string; goal: number; combined: number; yourContribution: number; friendContribution: number; claimed: boolean; claimable: boolean; rewardXp: number; rewardCoins: number; }

type Tab = 'friends' | 'requests' | 'add';

function Avatar({ name, size = 40 }: { name: string; size?: number }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
      <Text style={{ color: colors.primary, fontWeight: '800', fontSize: size * 0.4 }}>{name?.[0]?.toUpperCase() ?? '?'}</Text>
    </View>
  );
}

export default function Friends() {
  const { token, user, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState<Tab>('friends');
  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<PendingRow[]>([]);
  const [outgoing, setOutgoing] = useState<PendingRow[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [a, b, c] = await Promise.all([
        api<{ friends: Friend[] }>('/api/friends/list', { token }),
        api<{ incoming: PendingRow[]; outgoing: PendingRow[] }>('/api/friends/pending', { token }),
        api<{ quests: Quest[] }>('/api/friends/quests', { token }).catch(() => ({ quests: [] })),
      ]);
      setFriends(a.friends ?? []); setIncoming(b.incoming ?? []); setOutgoing(b.outgoing ?? []); setQuests(c.quests ?? []);
    } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!token || q.trim().length < 2) { setResults([]); return; }
    const h = setTimeout(() => {
      api<{ results: SearchResult[] }>(`/api/friends/search?q=${encodeURIComponent(q.trim())}`, { token })
        .then((d) => setResults(d.results ?? [])).catch(() => setResults([]));
    }, 300);
    return () => clearTimeout(h);
  }, [q, token]);

  const act = async (path: string, body: any) => { try { await api(path, { method: 'POST', token, body }); await load(); } catch {} };
  const claim = async (friendId: number) => {
    try {
      const r = await api<{ xp: number; coins: number }>('/api/friends/quests/claim', { method: 'POST', token, body: { friendId } });
      if (typeof r.xp === 'number') updateUser({ xp: r.xp, coins: r.coins });
      await load();
    } catch {}
  };

  const pendingCount = incoming.length + outgoing.length;
  const myXp = user?.xp ?? 0;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.fg} /></Pressable>
        <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', marginLeft: 4 }}>Friends</Text>
      </View>

      {/* Sub-tabs */}
      <View style={{ flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.md, marginBottom: spacing.sm }}>
        {(['friends', 'requests', 'add'] as Tab[]).map((t) => {
          const active = tab === t;
          const badge = t === 'friends' ? friends.length : t === 'requests' ? pendingCount : 0;
          return (
            <Pressable key={t} onPress={() => setTab(t)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: radius.md, alignItems: 'center', flexDirection: 'row', justifyContent: 'center', gap: 6,
                backgroundColor: active ? colors.primarySoft : colors.glass, borderWidth: 1.5, borderColor: active ? colors.primary : colors.border }}>
              <Text style={{ color: active ? colors.primary : colors.fgMuted, fontWeight: '800' }}>
                {t === 'friends' ? 'Friends' : t === 'requests' ? 'Requests' : 'Add'}
              </Text>
              {badge > 0 && <View style={{ backgroundColor: active ? colors.primary : colors.fgSubtle, borderRadius: 10, paddingHorizontal: 6, minWidth: 18, alignItems: 'center' }}><Text style={{ color: '#fff', fontSize: 10, fontWeight: '900' }}>{badge}</Text></View>}
            </Pressable>
          );
        })}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} /> : (
          <>
            {tab === 'friends' && (
              <>
                {quests.filter((qu) => qu.combined > 0 || qu.claimable).length > 0 && (
                  <View style={{ marginBottom: spacing.lg, backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
                    <Text style={{ color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1, marginBottom: spacing.sm }}>🤝 WEEKLY CO-OP QUESTS</Text>
                    {quests.filter((qu) => qu.combined > 0 || qu.claimable).map((qu) => {
                      const pct = Math.min(100, Math.round((qu.combined / qu.goal) * 100));
                      return (
                        <View key={qu.friendId} style={{ backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.sm, marginBottom: spacing.sm }}>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
                            <Text style={{ color: colors.fg, fontWeight: '700' }}>You + {qu.friendName}</Text>
                            <Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{qu.combined}/{qu.goal} XP</Text>
                          </View>
                          <View style={{ height: 7, backgroundColor: colors.glass, borderRadius: 4, overflow: 'hidden', marginBottom: 8 }}><View style={{ height: 7, width: `${pct}%`, backgroundColor: colors.green, borderRadius: 4 }} /></View>
                          {qu.claimed ? <Text style={{ color: colors.green, fontWeight: '700', fontSize: 12 }}>✓ Claimed</Text>
                            : qu.claimable ? <Pressable onPress={() => claim(qu.friendId)} style={{ alignSelf: 'flex-start', backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: colors.bg, fontWeight: '800', fontSize: 12 }}>Claim +{qu.rewardXp} XP · +{qu.rewardCoins} 🪙</Text></Pressable>
                            : <Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{qu.goal - qu.combined} XP to go</Text>}
                        </View>
                      );
                    })}
                  </View>
                )}

                {friends.length === 0 ? <Empty text="No friends yet — add someone in the Add tab." /> :
                  friends.map((f) => {
                    const diff = f.xp - myXp;
                    return (
                      <View key={f.id} style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm }}>
                        <Avatar name={f.name} />
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={{ color: colors.fg, fontWeight: '700' }} numberOfLines={1}>{f.name}</Text>
                            {(f.friend_streak ?? 0) > 0 && <Text style={{ color: colors.orange, fontWeight: '800', fontSize: 11 }}>🤝🔥{f.friend_streak}</Text>}
                          </View>
                          <Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{f.xp.toLocaleString()} XP · 🔥{f.streak} · {diff > 0 ? `+${diff} ahead` : diff < 0 ? `${diff} behind` : 'tied'}</Text>
                        </View>
                        <Pressable onPress={() => act('/api/friends/remove', { friendUserId: f.id })} hitSlop={8}><Ionicons name="person-remove-outline" size={18} color={colors.fgSubtle} /></Pressable>
                      </View>
                    );
                  })}
              </>
            )}

            {tab === 'requests' && (
              <>
                <SectionLabel text={`Incoming (${incoming.length})`} />
                {incoming.length === 0 ? <Empty text="No incoming requests." /> : incoming.map((r) => (
                  <View key={r.request_id} style={rowStyle}>
                    <Avatar name={r.name} />
                    <View style={{ flex: 1 }}><Text style={{ color: colors.fg, fontWeight: '700' }}>{r.name}</Text><Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{r.xp.toLocaleString()} XP</Text></View>
                    <Pressable onPress={() => act('/api/friends/accept', { requestId: r.request_id })} style={{ backgroundColor: colors.green, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6, marginRight: 6 }}><Text style={{ color: colors.bg, fontWeight: '800', fontSize: 12 }}>Accept</Text></Pressable>
                    <Pressable onPress={() => act('/api/friends/decline', { requestId: r.request_id })} hitSlop={8}><Ionicons name="close" size={20} color={colors.fgSubtle} /></Pressable>
                  </View>
                ))}
                <View style={{ height: spacing.md }} />
                <SectionLabel text={`Sent (${outgoing.length})`} />
                {outgoing.length === 0 ? <Empty text="No outgoing requests." /> : outgoing.map((r) => (
                  <View key={r.request_id} style={rowStyle}>
                    <Avatar name={r.name} />
                    <View style={{ flex: 1 }}><Text style={{ color: colors.fg, fontWeight: '700' }}>{r.name}</Text><Text style={{ color: colors.fgSubtle, fontSize: 11 }}>Awaiting reply…</Text></View>
                    <Pressable onPress={() => act('/api/friends/cancel', { requestId: r.request_id })} style={{ paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: colors.fgMuted, fontWeight: '700', fontSize: 12 }}>Cancel</Text></Pressable>
                  </View>
                ))}
              </>
            )}

            {tab === 'add' && (
              <>
                <TextInput value={q} onChangeText={setQ} placeholder="Search by nickname (min 2 letters)" placeholderTextColor={colors.fgSubtle} autoCapitalize="none"
                  style={{ height: 48, borderRadius: radius.md, backgroundColor: colors.bgElevated, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 15, marginBottom: spacing.md }} />
                {q.trim().length < 2 ? <Empty text="Type at least 2 letters to search." /> :
                  results.length === 0 ? <Empty text="No users found." /> :
                  results.map((r) => (
                    <View key={r.id} style={rowStyle}>
                      <Avatar name={r.name} />
                      <View style={{ flex: 1 }}><Text style={{ color: colors.fg, fontWeight: '700' }}>{r.name}</Text><Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{r.xp.toLocaleString()} XP</Text></View>
                      {r.status === 'friends' ? <Text style={{ color: colors.green, fontWeight: '700', fontSize: 12 }}>✓ Friends</Text>
                        : r.status === 'pending_out' ? <Text style={{ color: colors.fgMuted, fontSize: 12 }}>Sent</Text>
                        : <Pressable onPress={() => act('/api/friends/request', { targetUserId: r.id })} style={{ backgroundColor: colors.primary, borderRadius: radius.sm, paddingHorizontal: 12, paddingVertical: 6 }}><Text style={{ color: colors.white, fontWeight: '800', fontSize: 12 }}>+ Add</Text></Pressable>}
                    </View>
                  ))}
              </>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const rowStyle = { flexDirection: 'row' as const, alignItems: 'center' as const, gap: spacing.sm, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.sm };
const SectionLabel = ({ text }: { text: string }) => <Text style={{ color: colors.fgSubtle, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm }}>{text}</Text>;
const Empty = ({ text }: { text: string }) => <Text style={{ color: colors.fgSubtle, textAlign: 'center', paddingVertical: spacing.lg }}>{text}</Text>;
