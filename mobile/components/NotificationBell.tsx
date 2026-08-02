import { useCallback, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors } from '../lib/theme';

/** Bell with an unread badge; taps through to the notifications feed. */
export function NotificationBell() {
  const { token } = useAuth();
  const router = useRouter();
  const [count, setCount] = useState(0);

  const load = useCallback(() => {
    if (!token) return;
    api<{ count: number }>('/api/notifications/unread-count', { token }).then((d) => setCount(d.count ?? 0)).catch(() => {});
  }, [token]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  return (
    <Pressable onPress={() => router.push('/notifications')} hitSlop={8} style={{ padding: 4 }}>
      <Ionicons name="notifications-outline" size={22} color={colors.fgMuted} />
      {count > 0 && (
        <View style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.red, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 }}>
          <Text style={{ color: '#fff', fontSize: 9, fontWeight: '900' }}>{count > 9 ? '9+' : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
