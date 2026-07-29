import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from 'react-native';
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

export default function Shop() {
  const { token, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Catalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const equippedEmoji = (slot: 'hat' | 'face' | 'body') => data?.items.find((i) => i.slot === slot && i.equipped)?.emoji ?? null;

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

        <Text style={{ color: colors.fgSubtle, fontSize: 12, textAlign: 'center' }}>Earn coins by trading XP on the web, or from chests.</Text>
      </ScrollView>
    </View>
  );
}
