import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';

/** Dashboard card that surfaces due spaced-repetition cards; hidden when none are due. */
export function ReviewCard() {
  const { token } = useAuth();
  const router = useRouter();
  const [due, setDue] = useState(0);

  const load = useCallback(() => {
    if (!token) return;
    api<{ due: number }>('/api/review/stats', { token }).then((d) => setDue(d.due ?? 0)).catch(() => {});
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  if (due <= 0) return null;

  return (
    <Pressable onPress={() => router.push('/review')}
      style={{ marginBottom: spacing.lg, backgroundColor: colors.primarySoft, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
      <View style={{ width: 42, height: 42, borderRadius: radius.md, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}><Text style={{ fontSize: 20 }}>🧠</Text></View>
      <View style={{ flex: 1 }}>
        <Text style={{ color: colors.fg, fontWeight: '800' }}>Review time</Text>
        <Text style={{ color: colors.fgMuted, fontSize: 12 }}>{due} card{due === 1 ? '' : 's'} due — lock in what you learned</Text>
      </View>
      <View style={{ backgroundColor: colors.primary, paddingHorizontal: 14, paddingVertical: 8, borderRadius: radius.md }}><Text style={{ color: colors.white, fontWeight: '800' }}>Review</Text></View>
    </Pressable>
  );
}
