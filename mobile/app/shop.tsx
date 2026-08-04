import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { api, ApiError } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { rarityColor } from '../lib/cosmetics';
import { Aurora } from '../components/Aurora';
import { OctopusAvatar } from '../components/OctopusAvatar';

interface Item { id: string; name: { en: string }; emoji: string; slot: 'hat' | 'face' | 'body'; rarity: string; price: number; owned: boolean; equipped: boolean; }
interface Catalog { coins: number; equipped: { hat: string | null; face: string | null; body: string | null }; items: Item[]; }

const SLOTS: ('hat' | 'face' | 'body')[] = ['hat', 'face', 'body'];
const en = (v: any) => (v && typeof v === 'object' ? v.en : v);

const XP_PER_COIN = 2;   // 2 XP = 1 coin (mirror of backend catalog.ts)
const MIN_XP = 100;      // floor on a single exchange

export default function Shop() {
  const { token, refreshUser, user, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [xpInput, setXpInput] = useState('');
  const equippedEmoji = (slot: 'hat' | 'face' | 'body') => data?.items.find((i) => i.slot === slot && i.equipped)?.emoji ?? null;

  const userXp = user?.xp ?? 0;
  const xpNum = parseInt(xpInput.replace(/[^0-9]/g, ''), 10) || 0;
  const coinsOut = Math.floor(xpNum / XP_PER_COIN);
  const canExchange = xpNum >= MIN_XP && xpNum <= userXp && !busy;
  const maxExchangeable = Math.floor(userXp / XP_PER_COIN) * XP_PER_COIN; // largest even ≤ xp

  const exchange = async () => {
    if (!canExchange) return;
    setBusy('exchange');
    try {
      const r = await api<{ xp: number; coins: number }>('/api/shop/exchange', { method: 'POST', token, body: { xpAmount: xpNum } });
      updateUser({ xp: r.xp, coins: r.coins });
      setXpInput('');
      await load();
    } catch (e) {
      const c = e instanceof ApiError ? e.data?.error : '';
      Alert.alert('Could not exchange', c === 'insufficient_xp' ? 'You don’t have that much XP.' : c === 'invalid_amount' ? `Minimum is ${MIN_XP} XP.` : 'Try again in a moment.');
    } finally { setBusy(null); }
  };

  const load = useCallback(async () => {
    if (!token) return;
    try { setData(await api<Catalog>('/api/shop/catalog', { token })); } finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const act = async (path: string, body: any, key: string) => {
    if (busy) return;
    setBusy(key);
    try {
      await api(path, { method: 'POST', token, body });
      await load();
      refreshUser();
    } catch (e) {
      const c = e instanceof ApiError ? e.data?.error : '';
      Alert.alert('Could not complete', c === 'insufficient_coins' || c === 'not_enough_coins' ? 'Not enough coins.' : 'Try again in a moment.');
    } finally { setBusy(null); }
  };

  if (loading || !data) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><Aurora /><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.fg} /></Pressable>
        <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', flex: 1, marginLeft: 4 }}>Shop</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.glass, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
          <Text>🪙</Text><Text style={{ color: colors.fg, fontWeight: '800' }}>{data.coins}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        {/* Mascot preview */}
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <OctopusAvatar size={150} hatEmoji={equippedEmoji('hat')} faceEmoji={equippedEmoji('face')} bodyEmoji={equippedEmoji('body')} />
        </View>

        {SLOTS.map((slot) => (
          <View key={slot} style={{ marginBottom: spacing.lg }}>
            <Text style={{ color: colors.fgSubtle, fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.sm }}>{slot}</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
              {data.items.filter((i) => i.slot === slot).map((item) => {
                const rc = rarityColor(item.rarity);
                return (
                  <View key={item.id} style={{ width: '48%', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1.5, borderColor: item.equipped ? colors.green : colors.border, padding: spacing.md }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <Text style={{ fontSize: 26 }}>{item.emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.fg, fontWeight: '700', fontSize: 13 }} numberOfLines={1}>{en(item.name)}</Text>
                        <Text style={{ color: rc, fontSize: 10, fontWeight: '700', textTransform: 'uppercase' }}>{item.rarity}</Text>
                      </View>
                    </View>
                    {!item.owned ? (
                      <Pressable onPress={() => act('/api/shop/buy', { itemId: item.id }, item.id)} disabled={busy === item.id || data.coins < item.price}
                        style={{ backgroundColor: colors.primary, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center', opacity: data.coins < item.price ? 0.5 : 1 }}>
                        <Text style={{ color: colors.white, fontWeight: '800', fontSize: 13 }}>🪙 {item.price}</Text>
                      </Pressable>
                    ) : item.equipped ? (
                      <Pressable onPress={() => act('/api/shop/unequip', { slot }, item.id)} disabled={busy === item.id}
                        style={{ backgroundColor: colors.greenSoft, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.green }}>
                        <Text style={{ color: colors.green, fontWeight: '800', fontSize: 13 }}>✓ Equipped</Text>
                      </Pressable>
                    ) : (
                      <Pressable onPress={() => act('/api/shop/equip', { itemId: item.id }, item.id)} disabled={busy === item.id}
                        style={{ backgroundColor: colors.bgElevated, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
                        <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 13 }}>Equip</Text>
                      </Pressable>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        ))}

        {/* Trade XP → coins */}
        <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginTop: spacing.sm }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 15 }}>💱 Trade XP for coins</Text>
            <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>{userXp.toLocaleString()} XP</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgElevated, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md }}>
              <TextInput value={xpInput} onChangeText={(t) => setXpInput(t.replace(/[^0-9]/g, ''))} keyboardType="numeric"
                placeholder={`${MIN_XP}+`} placeholderTextColor={colors.fgSubtle}
                style={{ flex: 1, color: colors.fg, fontSize: 16, paddingVertical: 12 }} />
              <Pressable onPress={() => setXpInput(String(maxExchangeable))} disabled={maxExchangeable < MIN_XP} hitSlop={8}>
                <Text style={{ color: maxExchangeable < MIN_XP ? colors.fgSubtle : colors.primary, fontWeight: '800', fontSize: 12 }}>MAX</Text>
              </Pressable>
            </View>
            <View style={{ alignItems: 'center', minWidth: 56 }}>
              <Text style={{ color: colors.green, fontWeight: '900', fontSize: 16 }}>🪙 {coinsOut}</Text>
            </View>
          </View>
          <Pressable onPress={exchange} disabled={!canExchange}
            style={{ backgroundColor: colors.primary, borderRadius: radius.md, paddingVertical: 13, alignItems: 'center', marginTop: spacing.sm, opacity: canExchange ? 1 : 0.5 }}>
            {busy === 'exchange' ? <ActivityIndicator color={colors.white} /> : <Text style={{ color: colors.white, fontWeight: '800' }}>Exchange</Text>}
          </Pressable>
          <Text style={{ color: colors.fgSubtle, fontSize: 11, textAlign: 'center', marginTop: 8 }}>{XP_PER_COIN} XP = 1 🪙 · min {MIN_XP} XP · you can also earn coins from chests</Text>
        </View>
      </ScrollView>
    </View>
  );
}
