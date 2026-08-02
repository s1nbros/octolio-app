import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, Text, View, useWindowDimensions } from 'react-native';
import Svg, { G, Path, Text as SvgText } from 'react-native-svg';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { Button } from '../lib/ui';
import { colors, radius, spacing } from '../lib/theme';

interface Slot { id: string; type: string; label: { en: string; emoji: string }; }
interface SpinResp { slotIndex: number; slot: Slot; reward: { xpDelta?: number }; }

const SLICE_COLORS = ['#8b7ff0', '#4fd1a0', '#f0a35a', '#5fb0f0', '#e07a9e', '#6cc6e0', '#c58bf0', '#7fd68a', '#f0c04e', '#9b8bf0'];
const N = 10;
const SLICE = 360 / N;

/** One-time welcome Wheel of Luck. Self-gates on /api/wheel/info (canSpin). */
export function WheelOfLuck() {
  const { token, refreshUser, updateUser, user } = useAuth();
  const { width } = useWindowDimensions();
  const [slots, setSlots] = useState<Slot[]>([]);
  const [visible, setVisible] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<SpinResp | null>(null);
  const deg = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!token) return;
    api<{ canSpin: boolean; slots: Slot[] }>('/api/wheel/info', { token })
      .then((d) => { if (d.canSpin) { setSlots(d.slots ?? []); setVisible(true); } })
      .catch(() => {});
  }, [token]);

  if (!visible || slots.length !== N) return null;

  const size = Math.min(width - spacing.lg * 2, 320);

  const spin = async () => {
    if (spinning || !token) return;
    setSpinning(true);
    try {
      const r = await api<SpinResp>('/api/wheel/spin', { method: 'POST', token });
      const final = 360 * 6 - r.slotIndex * SLICE; // land slice slotIndex under the top pointer
      Animated.timing(deg, { toValue: final, duration: 4800, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start(() => {
        setResult(r);
        if (r.reward?.xpDelta) updateUser({ xp: (user?.xp ?? 0) + r.reward.xpDelta });
        refreshUser();
      });
    } catch { setSpinning(false); }
  };

  const rotate = deg.interpolate({ inputRange: [0, 360], outputRange: ['0deg', '360deg'] });

  return (
    <Modal transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(5,4,12,0.9)', alignItems: 'center', justifyContent: 'center', padding: spacing.lg }}>
        <Text style={{ color: colors.fg, fontSize: 26, fontWeight: '900', marginBottom: 4 }}>🎉 Welcome gift!</Text>
        <Text style={{ color: colors.fgMuted, marginBottom: spacing.lg }}>Spin the wheel — one free spin, ever.</Text>

        <View style={{ width: size, height: size + 20, alignItems: 'center' }}>
          {/* pointer */}
          <View style={{ position: 'absolute', top: 0, zIndex: 3, width: 0, height: 0, borderLeftWidth: 12, borderRightWidth: 12, borderTopWidth: 18, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: colors.white }} />
          <Animated.View style={{ marginTop: 14, transform: [{ rotate }] }}>
            <Svg width={size} height={size} viewBox="0 0 200 200">
              <G>
                {slots.map((s, i) => {
                  const a0 = (-90 + i * SLICE - SLICE / 2) * Math.PI / 180;
                  const a1 = (-90 + i * SLICE + SLICE / 2) * Math.PI / 180;
                  const x0 = 100 + 92 * Math.cos(a0), y0 = 100 + 92 * Math.sin(a0);
                  const x1 = 100 + 92 * Math.cos(a1), y1 = 100 + 92 * Math.sin(a1);
                  const mid = (-90 + i * SLICE) * Math.PI / 180;
                  const mx = 100 + 60 * Math.cos(mid), my = 100 + 60 * Math.sin(mid);
                  return (
                    <G key={i}>
                      <Path d={`M100 100 L ${x0} ${y0} A 92 92 0 0 1 ${x1} ${y1} Z`} fill={SLICE_COLORS[i % SLICE_COLORS.length]} stroke="rgba(0,0,0,0.25)" strokeWidth={0.5} />
                      <SvgText x={mx} y={my + 6} fontSize={20} textAnchor="middle">{s.label.emoji}</SvgText>
                    </G>
                  );
                })}
              </G>
            </Svg>
          </Animated.View>
        </View>

        <View style={{ width: '100%', maxWidth: 320, marginTop: spacing.lg }}>
          {result ? (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ fontSize: 44 }}>{result.slot.label.emoji}</Text>
              <Text style={{ color: colors.green, fontWeight: '900', fontSize: 20, marginVertical: spacing.sm }}>You won: {result.slot.label.en}!</Text>
              <View style={{ width: '100%' }}><Button title="Claim & start" onPress={() => setVisible(false)} /></View>
            </View>
          ) : (
            <Button title={spinning ? 'Spinning…' : 'Spin!'} onPress={spin} loading={spinning} />
          )}
        </View>
      </View>
    </Modal>
  );
}
