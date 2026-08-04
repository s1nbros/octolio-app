import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, radius, spacing } from '../lib/theme';

/** Dashboard entry card → the Daily Quests page. Shows a live reset countdown. */
export function QuestsCard() {
  const router = useRouter();
  const [t, setT] = useState({ h: 0, m: 0 });
  useEffect(() => {
    const calc = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const ms = midnight.getTime() - now.getTime();
      setT({ h: Math.floor(ms / 3_600_000), m: Math.floor((ms % 3_600_000) / 60_000) });
    };
    calc();
    const id = setInterval(calc, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Pressable onPress={() => router.push('/quests')}
      style={{ marginBottom: spacing.lg, backgroundColor: colors.orangeSoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>◎</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.fg, fontWeight: '800' }}>Daily Quests</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 12 }}>Earn bonus XP · resets in {t.h}h {t.m}m</Text>
      </View>
      <View style={{ backgroundColor: colors.orange, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md }}><Text style={{ color: colors.bg, fontWeight: '800' }}>View</Text></View>
    </Pressable>
  );
}
