import { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../lib/auth';
import { api } from '../../lib/api';
import { colors, modulePalettes, LOCKED_PALETTE, radius, spacing } from '../../lib/theme';
import { Aurora } from '../../components/Aurora';
import { ChestReelModal } from '../../components/ChestReelModal';
import { TodayWorkout } from '../../components/TodayWorkout';
import { ReviewCard } from '../../components/ReviewCard';
import { WheelOfLuck } from '../../components/WheelOfLuck';
import { TestOutModal } from '../../components/TestOutModal';
import { NotificationBell } from '../../components/NotificationBell';

interface LessonMeta { id: string; title: { en: string }; icon?: string; xpReward: number; exerciseCount: number; completed: boolean; }
interface ModuleMeta { id: string; title: { en: string }; icon: string; color: string; proOnly: boolean; lessons: LessonMeta[]; }
interface ChestState { moduleId: string; position: 'mid' | 'end'; afterLessonIdx: number; status: 'locked' | 'available' | 'opened'; }
type Pal = { main: string; deep: string; soft: string };

const SNAKE = [0, 55, 74, 55, 0, -55, -74, -55];

export default function Learn() {
  const { user, token, refreshUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [chests, setChests] = useState<ChestState[]>([]);
  const [loading, setLoading] = useState(true);
  const [chestTarget, setChestTarget] = useState<{ moduleId: string; position: 'mid' | 'end' } | null>(null);
  const [testOutModuleId, setTestOutModuleId] = useState<string | null>(null);
  const isPro = !!user?.is_pro;

  const load = useCallback(async () => {
    try {
      const [m, c] = await Promise.all([
        api<{ modules: ModuleMeta[] }>('/api/modules', { token }),
        api<{ chests: ChestState[] }>('/api/chests/info', { token }).catch(() => ({ chests: [] })),
      ]);
      setModules(m.modules ?? []);
      setChests(c.chests ?? []);
    } finally { setLoading(false); }
  }, [token]);

  useFocusEffect(useCallback(() => { load(); refreshUser(); }, [load, refreshUser]));

  const chestByPos = useMemo(() => {
    const map = new Map<string, ChestState>();
    for (const c of chests) map.set(`${c.moduleId}:${c.afterLessonIdx}`, c);
    return map;
  }, [chests]);

  const moduleLocked = useCallback((idx: number) => {
    if (isPro || idx === 0) return false;
    const prev = modules[idx - 1];
    if (!prev || prev.proOnly) return false;
    return prev.lessons.filter((l) => l.completed).length < 2;
  }, [isPro, modules]);

  const current = useMemo(() => {
    for (let mi = 0; mi < modules.length; mi++) {
      if (moduleLocked(mi) || (modules[mi].proOnly && !isPro)) continue;
      const ls = modules[mi].lessons;
      for (let li = 0; li < ls.length; li++) if (!ls[li].completed) return { mi, li };
    }
    return null;
  }, [modules, moduleLocked, isPro]);

  if (loading) return <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <Aurora />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.md, paddingTop: insets.top + spacing.sm, paddingBottom: spacing.xl }}
        refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md }}>
          <Text style={{ color: colors.fg, fontSize: 22, fontWeight: '800' }}>Learn</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm }}>
            <Chip icon="flame" color={colors.orange} value={`${user?.streak ?? 0}`} />
            <Chip icon="flash" color={colors.primary} value={isPro ? '∞' : `${user?.energy ?? 0}`} />
            <NotificationBell />
          </View>
        </View>

        {/* Daily Money Workout + due reviews */}
        <TodayWorkout />
        <ReviewCard />

        {/* Continue hero */}
        <ContinueHero modules={modules} current={current} streak={user?.streak ?? 0}
          onContinue={() => current && router.push(`/lesson/${modules[current.mi].id}/${modules[current.mi].lessons[current.li].id}`)} />

        {/* Sections */}
        {modules.map((mod, mi) => {
          const locked = moduleLocked(mi);
          const proLocked = mod.proOnly && !isPro;
          const blocked = locked || proLocked;
          const pal: Pal = blocked ? LOCKED_PALETTE : (modulePalettes[mod.color] ?? modulePalettes.blue);
          const done = mod.lessons.filter((l) => l.completed).length;

          return (
            <View key={mod.id} style={{ marginBottom: spacing.xl }}>
              <SectionBanner mod={mod} idx={mi} pal={pal} blocked={blocked} proLocked={proLocked} locked={locked} done={done} />
              {!blocked && done < mod.lessons.length && (
                <Pressable onPress={() => setTestOutModuleId(mod.id)} style={{ alignSelf: 'flex-end', marginTop: spacing.sm, backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 14, paddingVertical: 6 }}>
                  <Text style={{ color: colors.fg, fontWeight: '700', fontSize: 12 }}>⚡ Test out to skip</Text>
                </Pressable>
              )}
              <View style={{ alignItems: 'center', marginTop: spacing.lg, gap: spacing.lg }}>
                {mod.lessons.map((lesson, li) => {
                  const lessonLocked = blocked || (li > 0 && !mod.lessons[li - 1].completed && !lesson.completed);
                  const isCurrent = !!current && current.mi === mi && current.li === li;
                  const chest = chestByPos.get(`${mod.id}:${li}`);
                  return (
                    <View key={lesson.id} style={{ alignItems: 'center', width: '100%' }}>
                      <LessonNode lesson={lesson} pal={pal} locked={lessonLocked} proLocked={proLocked} isCurrent={isCurrent}
                        offset={SNAKE[li % SNAKE.length]}
                        onPress={() => { if (lessonLocked) return; proLocked ? router.push('/(tabs)/profile') : router.push(`/lesson/${mod.id}/${lesson.id}`); }} />
                      {chest && !blocked && (
                        <View style={{ marginTop: spacing.lg }}>
                          <ChestNode state={chest} onPress={() => chest.status === 'available' && setChestTarget({ moduleId: chest.moduleId, position: chest.position })} />
                        </View>
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}
      </ScrollView>

      <ChestReelModal target={chestTarget} onClose={() => setChestTarget(null)} onOpened={load} />
      <TestOutModal moduleId={testOutModuleId} onClose={() => setTestOutModuleId(null)} onPassed={load} />
      <WheelOfLuck />
    </View>
  );
}

function Chip({ icon, color, value }: { icon: any; color: string; value: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.glass, paddingHorizontal: 12, paddingVertical: 6, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border }}>
      <Ionicons name={icon} size={15} color={color} />
      <Text style={{ color: colors.fg, fontWeight: '800' }}>{value}</Text>
    </View>
  );
}

function ContinueHero({ modules, current, streak, onContinue }: { modules: ModuleMeta[]; current: { mi: number; li: number } | null; streak: number; onContinue: () => void }) {
  if (!current) {
    return (
      <View style={{ marginBottom: spacing.lg, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.greenSoft, backgroundColor: colors.card, padding: spacing.lg, alignItems: 'center' }}>
        <Text style={{ fontSize: 32, marginBottom: 4 }}>🎉</Text>
        <Text style={{ color: colors.fg, fontWeight: '800', fontSize: 18 }}>You're all caught up!</Text>
        <Text style={{ color: colors.fgMuted, textAlign: 'center', marginTop: 4 }}>Review past lessons or explore a new module below.</Text>
      </View>
    );
  }
  const mod = modules[current.mi];
  const lesson = mod.lessons[current.li];
  return (
    <View style={{ marginBottom: spacing.lg }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm, paddingHorizontal: 4 }}>
        <Text style={{ color: colors.fgMuted, fontWeight: '600' }}>Pick up where you left off</Text>
        {streak > 0 && <Text style={{ color: colors.orange, fontWeight: '800' }}>🔥 {streak}</Text>}
      </View>
      <LinearGradient colors={['hsla(258,65%,68%,0.16)', 'hsla(162,52%,62%,0.10)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius.lg, borderWidth: 1, borderColor: 'hsla(258,65%,68%,0.3)', padding: spacing.lg }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginBottom: spacing.md }}>
          <View style={{ width: 58, height: 58, borderRadius: radius.md, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border }}>
            <Text style={{ fontSize: 30 }}>{lesson.icon || mod.icon || '📘'}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>{mod.title.en.toUpperCase()}</Text>
            <Text style={{ color: colors.fg, fontSize: 18, fontWeight: '800' }} numberOfLines={1}>{lesson.title.en}</Text>
            <Text style={{ color: colors.fgMuted, fontSize: 12, marginTop: 2 }}>+{lesson.xpReward} XP · {lesson.exerciseCount} exercises</Text>
          </View>
        </View>
        <Pressable onPress={onContinue} style={({ pressed }) => ({ backgroundColor: colors.green, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', opacity: pressed ? 0.9 : 1 })}>
          <Text style={{ color: colors.bg, fontWeight: '800', fontSize: 16 }}>Continue →</Text>
        </Pressable>
      </LinearGradient>
    </View>
  );
}

function SectionBanner({ mod, idx, pal, blocked, proLocked, locked, done }: { mod: ModuleMeta; idx: number; pal: Pal; blocked: boolean; proLocked: boolean; locked: boolean; done: number }) {
  return (
    <LinearGradient colors={blocked ? ['hsl(228,14%,16%)', 'hsl(228,14%,12%)'] : [pal.main, pal.deep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
      style={{ borderRadius: radius.lg, paddingHorizontal: spacing.md, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: blocked ? colors.border : 'rgba(255,255,255,0.18)' }}>
      <Text style={{ fontSize: 30, marginRight: spacing.sm }}>{locked ? '🔒' : proLocked ? '✦' : mod.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={{ color: blocked ? colors.fgSubtle : 'rgba(255,255,255,0.78)', fontSize: 10, fontWeight: '800', letterSpacing: 1 }}>
          SECTION {idx + 1}{proLocked ? ' · ✦ PRO' : ''}
        </Text>
        <Text style={{ color: blocked ? colors.fgSubtle : '#fff', fontSize: 17, fontWeight: '800' }} numberOfLines={1}>{mod.title.en}</Text>
      </View>
      {!blocked && (
        <View style={{ alignItems: 'flex-end' }}>
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '800' }}>{done}/{mod.lessons.length}</Text>
          <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, letterSpacing: 1 }}>LESSONS</Text>
        </View>
      )}
    </LinearGradient>
  );
}

function LessonNode({ lesson, pal, locked, proLocked, isCurrent, offset, onPress }: { lesson: LessonMeta; pal: Pal; locked: boolean; proLocked: boolean; isCurrent: boolean; offset: number; onPress: () => void }) {
  const p = locked ? LOCKED_PALETTE : pal;
  const completed = lesson.completed;
  return (
    <View style={{ alignItems: 'center', transform: [{ translateX: offset }] }}>
      {isCurrent && !locked && (
        <View style={{ marginBottom: 8, paddingHorizontal: 14, paddingVertical: 5, borderRadius: radius.sm, backgroundColor: colors.bg, borderWidth: 2, borderColor: p.main }}>
          <Text style={{ color: p.main, fontWeight: '900', letterSpacing: 2, fontSize: 12 }}>START</Text>
        </View>
      )}
      <Pressable onPress={onPress} disabled={locked}
        style={{ width: 90, height: 90, borderRadius: 45, backgroundColor: p.deep, alignItems: 'center', justifyContent: 'flex-start',
          shadowColor: '#000', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.45, shadowRadius: 8, elevation: 8, opacity: locked ? 0.65 : 1 }}>
        <LinearGradient colors={[p.soft, p.main]} start={{ x: 0.3, y: 0.15 }} end={{ x: 0.75, y: 1 }}
          style={{ width: 86, height: 86, borderRadius: 43, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30 }}>{locked ? (proLocked ? '✦' : '🔒') : completed ? '⭐' : (lesson.icon || '📘')}</Text>
        </LinearGradient>
        {completed && !locked && (
          <View style={{ position: 'absolute', bottom: -2, right: -2, width: 26, height: 26, borderRadius: 13, backgroundColor: colors.green, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg }}>
            <Text style={{ color: colors.bg, fontWeight: '900', fontSize: 12 }}>✓</Text>
          </View>
        )}
      </Pressable>
      <Text style={{ color: locked ? colors.fgSubtle : completed ? colors.fgMuted : colors.fg, fontSize: 13, fontWeight: '700', textAlign: 'center', maxWidth: 150, marginTop: 8 }}>{lesson.title.en}</Text>
      <Text style={{ color: locked ? colors.fgSubtle : p.main, fontSize: 11, fontWeight: '700', marginTop: 2 }}>+{lesson.xpReward} XP</Text>
    </View>
  );
}

function ChestNode({ state, onPress }: { state: ChestState; onPress: () => void }) {
  const available = state.status === 'available';
  const opened = state.status === 'opened';
  const pal: Pal = available ? { main: 'hsl(45,95%,55%)', deep: 'hsl(35,90%,38%)', soft: 'hsl(45,95%,70%)' }
    : opened ? { main: 'hsl(140,35%,45%)', deep: 'hsl(140,35%,30%)', soft: 'hsl(140,30%,60%)' }
    : LOCKED_PALETTE;
  return (
    <View style={{ alignItems: 'center' }}>
      <Pressable onPress={onPress} disabled={!available}
        style={{ width: 78, height: 78, borderRadius: radius.lg, backgroundColor: pal.deep, alignItems: 'center', justifyContent: 'flex-start',
          shadowColor: '#000', shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.4, shadowRadius: 7, elevation: 7, opacity: available ? 1 : 0.7 }}>
        <LinearGradient colors={[pal.soft, pal.main]} start={{ x: 0.3, y: 0.15 }} end={{ x: 0.75, y: 1 }}
          style={{ width: 74, height: 74, borderRadius: radius.lg, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 30 }}>{opened ? '✓' : available ? '🎁' : '🔒'}</Text>
        </LinearGradient>
      </Pressable>
      <Text style={{ color: available ? pal.main : colors.fgSubtle, fontSize: 10, fontWeight: '800', letterSpacing: 1, marginTop: 6 }}>
        {available ? 'CHEST' : opened ? 'OPENED' : 'LOCKED'}
      </Text>
    </View>
  );
}
