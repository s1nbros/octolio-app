import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Pressable, Text, View, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../lib/ui';
import { colors, radius, spacing } from '../lib/theme';

const TILE_W = 84;
const TILE_GAP = 6;
const REEL_COUNT = 60;
const WINNING_INDEX = 52;
const SPIN_MS = 5000;

interface Tile { emoji: string; label: string; rarity: string; }

function rarityColor(r: string) {
  switch (r) {
    case 'common': return 'hsl(220, 6%, 60%)';
    case 'rare': return 'hsl(220, 80%, 65%)';
    case 'epic': return 'hsl(280, 70%, 65%)';
    case 'legendary': return 'hsl(40, 95%, 60%)';
    default: return colors.fgMuted;
  }
}
const xpRarity = (a: number) => (a >= 1000 ? 'legendary' : a >= 500 ? 'epic' : a >= 200 ? 'rare' : 'common');
const DECOY_AMOUNTS = [25, 50, 100, 200, 500, 1000, 2500];
const decoy = (): Tile => { const a = DECOY_AMOUNTS[Math.floor(Math.random() * DECOY_AMOUNTS.length)]; return { emoji: '✨', label: `${a} XP`, rarity: xpRarity(a) }; };

export function ChestReelModal({ target, onClose, onOpened }: {
  target: { moduleId: string; position: 'mid' | 'end' } | null;
  onClose: () => void;
  onOpened?: () => void;
}) {
  const { token, updateUser, user } = useAuth();
  const { width } = useWindowDimensions();
  const [phase, setPhase] = useState<'spinning' | 'revealed' | 'error'>('spinning');
  const [tiles, setTiles] = useState<Tile[]>([]);
  const [win, setWin] = useState<Tile | null>(null);
  const x = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!target || !token) return;
    setPhase('spinning'); setWin(null); x.setValue(0);
    (async () => {
      try {
        const data = await api<{ reward: any; xpDelta: number }>('/api/chests/open', { method: 'POST', token, body: target });
        const amount = data.reward?.amount ?? data.xpDelta ?? 0;
        const winning: Tile = { emoji: '✨', label: `${amount} XP`, rarity: xpRarity(amount) };
        const reel = Array.from({ length: REEL_COUNT }, (_, i) => (i === WINNING_INDEX ? winning : decoy()));
        setTiles(reel);
        setWin(winning);

        const viewport = width - spacing.md * 2;
        const jitter = (Math.random() - 0.5) * (TILE_W * 0.4);
        const endPx = -(WINNING_INDEX * (TILE_W + TILE_GAP) - (viewport / 2 - TILE_W / 2) + jitter);
        Animated.timing(x, { toValue: endPx, duration: SPIN_MS, easing: Easing.bezier(0.05, 0.7, 0.15, 1), useNativeDriver: true }).start();

        setTimeout(() => {
          setPhase('revealed');
          if (amount) updateUser({ xp: (user?.xp ?? 0) + amount });
          onOpened?.();
        }, SPIN_MS + 250);
      } catch {
        setPhase('error');
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target?.moduleId, target?.position]);

  if (!target) return null;
  const viewport = width - spacing.md * 2;

  return (
    <Modal transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(5,4,12,0.85)', alignItems: 'center', justifyContent: 'center', padding: spacing.md }}>
        <View style={{ width: '100%', backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center' }}>
          <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 20, marginBottom: spacing.md }}>
            {phase === 'revealed' ? 'You won!' : phase === 'error' ? 'Something went wrong' : 'Opening chest…'}
          </Text>

          {phase === 'error' ? (
            <Button title="Close" variant="ghost" onPress={onClose} />
          ) : phase === 'revealed' && win ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color: rarityColor(win.rarity), fontSize: 11, fontWeight: '800', letterSpacing: 2, textTransform: 'uppercase', marginBottom: spacing.sm }}>{win.rarity}</Text>
              <LinearGradient colors={[`${rarityColor(win.rarity)}22`, `${rarityColor(win.rarity)}55`]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                style={{ width: 130, height: 130, borderRadius: radius.lg, borderWidth: 2, borderColor: rarityColor(win.rarity), alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md }}>
                <Text style={{ fontSize: 44 }}>{win.emoji}</Text>
              </LinearGradient>
              <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 22, marginBottom: spacing.lg }}>{win.label}</Text>
              <Button title="Claim" onPress={onClose} />
            </View>
          ) : (
            <View style={{ width: viewport, alignItems: 'center' }}>
              {/* center pointer */}
              <View style={{ position: 'absolute', top: -6, zIndex: 2, width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 10, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.primary }} />
              <View style={{ width: viewport, height: TILE_W + 16, overflow: 'hidden', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, justifyContent: 'center' }}>
                <Animated.View style={{ flexDirection: 'row', gap: TILE_GAP, transform: [{ translateX: x }], paddingVertical: 8 }}>
                  {tiles.map((t, i) => (
                    <LinearGradient key={i} colors={[`${rarityColor(t.rarity)}22`, `${rarityColor(t.rarity)}44`]} start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      style={{ width: TILE_W, height: TILE_W, borderRadius: radius.md, borderWidth: 2, borderColor: rarityColor(t.rarity), alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 30 }}>{t.emoji}</Text>
                      <Text style={{ color: colors.fgMuted, fontSize: 10, fontWeight: '700', marginTop: 2 }}>{t.label}</Text>
                    </LinearGradient>
                  ))}
                </Animated.View>
              </View>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
}
