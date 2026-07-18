import { useCallback, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { api, ApiError } from '../../lib/api';
import { Button } from '../../lib/ui';
import { colors, radius, spacing } from '../../lib/theme';

interface MarketAsset { id: string; symbol: string; name: string; emoji: string; category: string; price: number; changePct: number; spark?: number[]; }
interface Holding { assetId: string; symbol: string; name: string; emoji: string; shares: number; avgCost: number; price: number; value: number; plPct: number; }
interface Data { cash: number; startingCash: number; holdingsValue: number; totalValue: number; totalReturnPct: number; holdings: Holding[]; market: MarketAsset[]; }

const eur = (n: number) => '€' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctColor = (p: number) => (p > 0 ? colors.green : p < 0 ? colors.red : colors.fgMuted);
const pctText = (p: number) => (p > 0 ? '+' : '') + p.toFixed(2) + '%';

/** Dependency-free mini sparkline drawn with thin bars. */
function Sparkline({ data, width = 66, height = 26 }: { data?: number[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return <View style={{ width, height }} />;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const up = data[data.length - 1] >= data[0];
  const barW = Math.max(1.5, width / data.length - 1);
  return (
    <View style={{ width, height, flexDirection: 'row', alignItems: 'flex-end', gap: 1 }}>
      {data.map((v, i) => (
        <View key={i} style={{ width: barW, height: Math.max(2, ((v - min) / range) * height), backgroundColor: up ? colors.green : colors.red, borderRadius: 1, opacity: 0.85 }} />
      ))}
    </View>
  );
}

export default function PortfolioScreen() {
  const { token } = useAuth();
  const insets = useSafeAreaInsets();
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState<{ asset: MarketAsset; held: number } | null>(null);

  const load = useCallback(async () => {
    try { setData(await api<Data>('/api/portfolio', { token })); }
    finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (loading) return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  if (!data) return null;

  const sparkByAsset = new Map(data.market.map((m) => [m.id, m.spark]));
  const heldByAsset = new Map(data.holdings.map((h) => [h.assetId, h.shares]));
  const up = data.totalReturnPct >= 0;

  return (
    <>
      <ScrollView
        contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800', marginBottom: 2 }}>📈 Portfolio</Text>
        <Text style={{ color: colors.fgSubtle, fontSize: 13, marginBottom: spacing.lg }}>Practice investing with €10,000 play money</Text>

        {/* Summary */}
        <View style={{ backgroundColor: up ? colors.greenSoft : 'rgba(224,87,95,0.12)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, marginBottom: spacing.lg }}>
          <Text style={{ color: colors.fgSubtle, fontSize: 12, fontWeight: '700', letterSpacing: 1 }}>TOTAL VALUE</Text>
          <Text style={{ color: colors.fg, fontSize: 32, fontWeight: '800' }}>{eur(data.totalValue)}</Text>
          <Text style={{ color: pctColor(data.totalReturnPct), fontWeight: '700', marginTop: 2 }}>
            {up ? '▲' : '▼'} {pctText(data.totalReturnPct)} · Cash {eur(data.cash)}
          </Text>
        </View>

        {/* Holdings */}
        {data.holdings.length > 0 && (
          <>
            <Text style={styles.section}>YOUR HOLDINGS</Text>
            <View style={{ borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden', marginBottom: spacing.lg }}>
              {data.holdings.map((h, i) => (
                <Pressable key={h.assetId}
                  onPress={() => setTrade({ asset: data.market.find((m) => m.id === h.assetId)!, held: h.shares })}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md, backgroundColor: colors.card, borderTopWidth: i ? 1 : 0, borderTopColor: colors.border }}>
                  <Text style={{ fontSize: 22 }}>{h.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.fg, fontWeight: '700' }}>{h.symbol}</Text>
                    <Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{h.shares} @ {eur(h.avgCost)}</Text>
                  </View>
                  <Sparkline data={sparkByAsset.get(h.assetId)} />
                  <View style={{ width: 84, alignItems: 'flex-end' }}>
                    <Text style={{ color: colors.fg, fontWeight: '700' }}>{eur(h.value)}</Text>
                    <Text style={{ color: pctColor(h.plPct), fontSize: 11, fontWeight: '600' }}>{pctText(h.plPct)}</Text>
                  </View>
                </Pressable>
              ))}
            </View>
          </>
        )}

        {/* Market */}
        <Text style={styles.section}>MARKET</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm }}>
          {data.market.map((m) => {
            const held = heldByAsset.get(m.id) ?? 0;
            return (
              <Pressable key={m.id} onPress={() => setTrade({ asset: m, held })}
                style={{ width: '48%', backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <Text style={{ fontSize: 18 }}>{m.emoji}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.fg, fontWeight: '700' }}>{m.symbol}</Text>
                    <Text style={{ color: colors.fgSubtle, fontSize: 10 }} numberOfLines={1}>{m.name}</Text>
                  </View>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                  <View>
                    <Text style={{ color: colors.fg, fontWeight: '700', fontSize: 13 }}>{eur(m.price)}</Text>
                    <Text style={{ color: pctColor(m.changePct), fontSize: 11, fontWeight: '600' }}>{pctText(m.changePct)}</Text>
                  </View>
                  <Sparkline data={m.spark} width={64} height={28} />
                </View>
                {held > 0 && <Text style={{ color: colors.primary, fontSize: 10, marginTop: 4 }}>Holding {held}</Text>}
              </Pressable>
            );
          })}
        </View>

        <Text style={{ color: colors.fgSubtle, fontSize: 10, textAlign: 'center', marginTop: spacing.lg }}>
          Simulated market for learning only — prices aren't real and update daily.
        </Text>
      </ScrollView>

      {trade && <TradeModal asset={trade.asset} held={trade.held} cash={data.cash} onClose={() => setTrade(null)} onDone={() => { setTrade(null); load(); }} />}
    </>
  );
}

function TradeModal({ asset, held, cash, onClose, onDone }: { asset: MarketAsset; held: number; cash: number; onClose: () => void; onDone: () => void }) {
  const { token } = useAuth();
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [qtyStr, setQtyStr] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const qty = parseFloat(qtyStr) || 0;
  const amount = qty * asset.price;
  const maxBuy = Math.floor((cash / asset.price) * 10000) / 10000;
  const valid = qty > 0 && (side === 'buy' ? amount <= cash + 1e-6 : qty <= held + 1e-6);

  const submit = async () => {
    if (!valid || busy) return;
    setBusy(true); setError('');
    try {
      await api('/api/portfolio/trade', { method: 'POST', token, body: { assetId: asset.id, side, shares: qty } });
      onDone();
    } catch (e) {
      const c = e instanceof ApiError ? e.data?.error : '';
      setError(c === 'insufficient_funds' ? 'Not enough cash.' : c === 'insufficient_shares' ? "You don't hold that many." : 'Trade failed.');
      setBusy(false);
    }
  };

  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(5,8,20,0.7)', justifyContent: 'flex-end' }}>
        <Pressable onPress={(e) => e.stopPropagation()} style={{ backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.xl, borderTopRightRadius: radius.xl, padding: spacing.lg, paddingBottom: spacing.xl }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md }}>
            <Text style={{ fontSize: 28 }}>{asset.emoji}</Text>
            <View>
              <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 18 }}>{asset.symbol}</Text>
              <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{eur(asset.price)} · <Text style={{ color: pctColor(asset.changePct) }}>{pctText(asset.changePct)}</Text></Text>
            </View>
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.md }}>
            {(['buy', 'sell'] as const).map((s) => (
              <Pressable key={s} disabled={s === 'sell' && held <= 0} onPress={() => { setSide(s); setError(''); }}
                style={{ flex: 1, paddingVertical: 12, borderRadius: radius.md, alignItems: 'center',
                  backgroundColor: side === s ? (s === 'buy' ? colors.green : colors.red) : colors.card,
                  borderWidth: 1, borderColor: colors.border, opacity: s === 'sell' && held <= 0 ? 0.4 : 1 }}>
                <Text style={{ color: side === s ? colors.white : colors.fgMuted, fontWeight: '800' }}>{s === 'buy' ? 'Buy' : 'Sell'}</Text>
              </Pressable>
            ))}
          </View>

          <View style={{ flexDirection: 'row', gap: spacing.sm, marginBottom: 8 }}>
            <TextInput value={qtyStr} onChangeText={(t) => setQtyStr(t.replace(/[^0-9.]/g, ''))} keyboardType="decimal-pad" placeholder="Shares"
              placeholderTextColor={colors.fgSubtle}
              style={{ flex: 1, height: 50, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, color: colors.fg, paddingHorizontal: spacing.md, fontSize: 16 }} />
            <Pressable onPress={() => setQtyStr(String(side === 'buy' ? maxBuy : held))} style={{ paddingHorizontal: 16, justifyContent: 'center', borderRadius: radius.md, backgroundColor: colors.primarySoft }}>
              <Text style={{ color: colors.primary, fontWeight: '800' }}>MAX</Text>
            </Pressable>
          </View>
          <Text style={{ color: colors.fgSubtle, fontSize: 12, marginBottom: spacing.md }}>
            {side === 'buy' ? `Cost: ${eur(amount)} · Cash: ${eur(cash)}` : `Proceeds: ${eur(amount)} · You hold ${held}`}
          </Text>

          {error ? <Text style={{ color: colors.red, textAlign: 'center', marginBottom: spacing.sm }}>{error}</Text> : null}
          <Button title={side === 'buy' ? `Buy ${qty || ''}` : `Sell ${qty || ''}`} onPress={submit} disabled={!valid} loading={busy} variant={side === 'sell' ? 'danger' : 'primary'} />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = { section: { color: colors.fgSubtle, fontSize: 12, fontWeight: '700' as const, letterSpacing: 1, marginBottom: spacing.sm } };
