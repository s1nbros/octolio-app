import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { Aurora } from '../components/Aurora';

interface Note { id: number; type: string; title: string; body?: string | null; read: boolean; created_at: string; }

const ago = (iso: string) => {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};

export default function Notifications() {
  const { token } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try { const d = await api<{ notifications: Note[] }>('/api/notifications', { token }); setNotes(d.notifications ?? []); }
    finally { setLoading(false); }
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const readAll = async () => { setNotes((n) => n.map((x) => ({ ...x, read: true }))); await api('/api/notifications/read-all', { method: 'POST', token }).catch(() => {}); };
  const tapNote = async (id: number) => { setNotes((n) => n.map((x) => (x.id === id ? { ...x, read: true } : x))); await api(`/api/notifications/${id}/read`, { method: 'POST', token }).catch(() => {}); };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.fg} /></Pressable>
        <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', flex: 1, marginLeft: 4 }}>Notifications</Text>
        {notes.some((n) => !n.read) && <Pressable onPress={readAll}><Text style={{ color: colors.primary, fontWeight: '700' }}>Mark all read</Text></Pressable>}
      </View>

      <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: spacing.xl }}>
        {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} /> :
          notes.length === 0 ? <Text style={{ color: colors.fgSubtle, textAlign: 'center', paddingVertical: spacing.xl }}>No notifications yet.</Text> :
          notes.map((n) => (
            <Pressable key={n.id} onPress={() => tapNote(n.id)}
              style={{ flexDirection: 'row', gap: spacing.sm, backgroundColor: n.read ? colors.card : colors.primarySoft, borderRadius: radius.md, borderWidth: 1, borderColor: n.read ? colors.border : colors.primary, padding: spacing.md, marginBottom: spacing.sm }}>
              {!n.read && <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary, marginTop: 6 }} />}
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.fg, fontWeight: '700' }}>{n.title}</Text>
                {n.body ? <Text style={{ color: colors.fgMuted, fontSize: 13, marginTop: 2 }}>{n.body}</Text> : null}
              </View>
              <Text style={{ color: colors.fgSubtle, fontSize: 11 }}>{ago(n.created_at)}</Text>
            </Pressable>
          ))}
      </ScrollView>
    </View>
  );
}
