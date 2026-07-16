import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { colors, radius, spacing } from '../../lib/theme';

interface LessonMeta { id: string; title: { en: string; bg: string }; icon?: string; xpReward: number; exerciseCount: number; completed: boolean; }
interface ModuleMeta { id: string; title: { en: string; bg: string }; icon: string; proOnly: boolean; lessons: LessonMeta[]; }

export default function Learn() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const isPro = !!user?.is_pro;

  const load = useCallback(async () => {
    try {
      const data = await api<{ modules: ModuleMeta[] }>('/api/modules', { token });
      setModules(data.modules ?? []);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); refreshUser(); }, [load, refreshUser]));

  const moduleLocked = (idx: number) => {
    if (isPro || idx === 0) return false;
    const prev = modules[idx - 1];
    if (!prev || prev.proOnly) return false;
    return prev.lessons.filter((l) => l.completed).length < 2;
  };

  if (loading) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;
  }

  return (
    <ScrollView
      contentContainerStyle={{ padding: spacing.md, paddingTop: insets.top + spacing.md, paddingBottom: spacing.xl }}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
    >
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg }}>
        <View>
          <Text style={{ color: colors.fgMuted, fontSize: 14 }}>Welcome back</Text>
          <Text style={{ color: colors.fg, fontSize: 24, fontWeight: '800' }}>{user?.name}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: spacing.md }}>
          <Stat icon="flame" color={colors.orange} value={user?.streak ?? 0} />
          <Stat icon="flash" color={colors.primary} value={isPro ? '∞' : `${user?.energy ?? 0}`} />
        </View>
      </View>

      {modules.map((mod, mi) => {
        const locked = moduleLocked(mi);
        const proLocked = mod.proOnly && !isPro;
        const blocked = locked || proLocked;
        const done = mod.lessons.filter((l) => l.completed).length;
        return (
          <View key={mod.id} style={{ marginBottom: spacing.lg, opacity: blocked ? 0.55 : 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
              <Text style={{ fontSize: 26, marginRight: spacing.sm }}>{blocked ? (proLocked ? '✦' : '🔒') : mod.icon}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '800' }}>{mod.title.en}</Text>
                <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>{done}/{mod.lessons.length} lessons{proLocked ? ' · PRO' : ''}</Text>
              </View>
            </View>

            {mod.lessons.map((lesson, li) => {
              const lessonLocked = blocked || (li > 0 && !mod.lessons[li - 1].completed && !lesson.completed);
              return (
                <Pressable
                  key={lesson.id}
                  disabled={lessonLocked}
                  onPress={() => router.push(`/lesson/${mod.id}/${lesson.id}`)}
                  style={({ pressed }) => ({
                    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
                    backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border,
                    padding: spacing.md, marginBottom: spacing.xs, opacity: pressed ? 0.8 : 1,
                  })}
                >
                  <Text style={{ fontSize: 22 }}>{lesson.completed ? '⭐' : lessonLocked ? '🔒' : (lesson.icon || '📘')}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.fg, fontSize: 15, fontWeight: '600' }}>{lesson.title.en}</Text>
                    <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>+{lesson.xpReward} XP · {lesson.exerciseCount} exercises</Text>
                  </View>
                  {!lessonLocked && <Ionicons name="chevron-forward" size={18} color={colors.fgSubtle} />}
                </Pressable>
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
}

function Stat({ icon, color, value }: { icon: any; color: string; value: number | string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.bgElevated, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={{ color: colors.fg, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}
