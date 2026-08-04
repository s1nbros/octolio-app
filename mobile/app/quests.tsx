import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle, G } from 'react-native-svg';
import { useAuth } from '../lib/auth';
import { api } from '../lib/api';
import { colors, radius, spacing } from '../lib/theme';
import { Aurora } from '../components/Aurora';

/* Level tiers — mirror of frontend/src/types/index.ts (English). */
const LEVELS = [
  { level: 1, label: 'Apprentice', minXp: 0, maxXp: 300 },
  { level: 2, label: 'Saver', minXp: 300, maxXp: 700 },
  { level: 3, label: 'Analyst', minXp: 700, maxXp: 1400 },
  { level: 4, label: 'Investor', minXp: 1400, maxXp: 2500 },
  { level: 5, label: 'Wealth Builder', minXp: 2500, maxXp: Infinity },
];
const getLevel = (xp: number) => [...LEVELS].reverse().find((l) => xp >= l.minXp) ?? LEVELS[0];
const getLevelProgress = (xp: number) => {
  const l = getLevel(xp);
  if (l.maxXp === Infinity) return 100;
  return Math.min(100, Math.round(((xp - l.minXp) / (l.maxXp - l.minXp)) * 100));
};

interface Lesson { completed?: boolean }
interface ModuleMeta { lessons: Lesson[] }

/* Circular level ring (react-native-svg). */
function LevelRing({ level, pct, size = 104 }: { level: number; pct: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  return (
    <Svg width={size} height={size}>
      <Circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={8} />
      <G rotation={-90} originX={cx} originY={cx}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke={colors.green} strokeWidth={8} strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`} />
      </G>
    </Svg>
  );
}

function useTimeToMidnight() {
  const calc = () => {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    const ms = midnight.getTime() - now.getTime();
    return { h: Math.floor(ms / 3_600_000), m: Math.floor((ms % 3_600_000) / 60_000) };
  };
  const [t, setT] = useState(calc);
  useEffect(() => {
    const id = setInterval(() => setT(calc()), 30_000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const GOLD = '#e8b64a';

export default function Quests() {
  const { user, token, updateUser } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { h, m } = useTimeToMidnight();

  const [xp, setXp] = useState(user?.xp ?? 0);
  const [streak, setStreak] = useState(user?.streak ?? 0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const [modsData, progData] = await Promise.all([
        api<{ modules: ModuleMeta[] }>('/api/modules', { token }),
        api<{ xp: number; streak: number }>('/api/progress', { token }),
      ]);
      const modules = modsData.modules ?? [];
      setTotalLessons(modules.reduce((s, mod) => s + mod.lessons.length, 0));
      setCompletedLessons(modules.reduce((s, mod) => s + mod.lessons.filter((l) => l.completed).length, 0));
      setXp(progData.xp ?? user?.xp ?? 0);
      setStreak(progData.streak ?? user?.streak ?? 0);
      updateUser({ xp: progData.xp, streak: progData.streak });
    } catch {} finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  useEffect(() => { load(); }, [load]);

  const level = getLevel(xp);
  const levelPct = getLevelProgress(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);
  const day = new Date().getDay();

  const quests = [
    { id: 'complete-lesson', color: colors.primary, icon: '📚', label: 'Daily Scholar', desc: 'Complete 1 lesson today', xp: 25, link: true, current: completedLessons > 0 ? 1 : 0, total: 1 },
    { id: 'streak-keep', color: colors.green, icon: '🔥', label: 'Streak Keeper', desc: 'Log in and keep your streak alive', xp: 10, link: false, current: streak > 0 ? 1 : 0, total: 1 },
    { id: 'xp-earn', color: colors.orange, icon: '⚡', label: 'XP Hunter', desc: 'Earn 50 XP today', xp: 20, link: true, current: Math.min(xp % 100, 50), total: 50 },
    { id: 'theory', color: GOLD, icon: '🏆', label: day % 2 === 0 ? 'Budget Master' : 'Invest Like a Pro', desc: day % 2 === 0 ? 'Complete a budgeting lesson' : 'Complete an investing lesson', xp: 30, link: true, current: 0, total: 1 },
  ];
  const doneCount = quests.filter((q) => q.current >= q.total).length;
  const xpLeft = quests.filter((q) => q.current < q.total).reduce((s, q) => s + q.xp, 0);

  const stats = [
    { icon: '✨', label: 'Total XP', value: xp.toLocaleString(), color: colors.primary },
    { icon: '🔥', label: 'Day streak', value: `${streak}`, color: colors.orange },
    { icon: '🏆', label: 'Level', value: `${level.level}`, color: colors.green },
    { icon: '✅', label: 'Lessons', value: `${completedLessons}/${totalLessons}`, color: GOLD },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}>
      <Aurora />
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
        <Pressable onPress={() => router.back()} hitSlop={12}><Ionicons name="chevron-back" size={26} color={colors.fg} /></Pressable>
        <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', flex: 1, marginLeft: 4 }}>Daily Quests</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: spacing.md, paddingBottom: insets.bottom + spacing.xl }}>
          <Text style={{ color: colors.fgMuted, fontSize: 14, marginBottom: spacing.md }}>Complete quests every day to earn bonus XP and keep your streak.</Text>

          {/* Hero: level ring + welcome */}
          <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }}>
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <LevelRing level={level.level} pct={levelPct} />
              <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ color: colors.fg, fontSize: 26, fontWeight: '900' }}>{level.level}</Text>
                <Text style={{ color: colors.fgSubtle, fontSize: 9, fontWeight: '700', letterSpacing: 2 }}>LEVEL</Text>
              </View>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.fgSubtle, fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1 }}>Welcome back</Text>
              <Text style={{ color: colors.fg, fontSize: 20, fontWeight: '800', marginBottom: 4 }} numberOfLines={1}>{user?.name} 👋</Text>
              <Text style={{ color: colors.fgMuted, fontSize: 13 }}>
                <Text style={{ color: colors.primary, fontWeight: '800' }}>{xp.toLocaleString()}</Text>
                {' / '}
                <Text style={{ fontWeight: '800' }}>{nextLevel ? nextLevel.minXp.toLocaleString() : '∞'}</Text>
                {' XP — '}
                <Text style={{ color: colors.green, fontWeight: '800' }}>{nextLevel ? nextLevel.label : level.label}</Text>
              </Text>
            </View>
          </View>

          {/* Stats row */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.md }}>
            {stats.map((s) => (
              <View key={s.label} style={{ width: '47.5%', flexGrow: 1, backgroundColor: colors.glass, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <Text style={{ fontSize: 14 }}>{s.icon}</Text>
                  <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>{s.label}</Text>
                </View>
                <Text style={{ color: s.color, fontSize: 22, fontWeight: '900' }}>{s.value}</Text>
              </View>
            ))}
          </View>

          {/* Daily quests card */}
          <View style={{ backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: spacing.sm }}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ color: colors.orange, fontSize: 14 }}>◎</Text>
                  <Text style={{ color: colors.fg, fontSize: 15, fontWeight: '800' }}>Daily Quests</Text>
                </View>
                <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 2 }}>{doneCount}/{quests.length} completed · resets in {h}h {m}m</Text>
              </View>
              <View style={{ backgroundColor: colors.primarySoft, borderWidth: 1, borderColor: colors.border, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5 }}>
                <Text style={{ color: colors.primary, fontSize: 12, fontWeight: '800' }}>✨ {xpLeft} XP left</Text>
              </View>
            </View>

            {/* Segmented top bar */}
            <View style={{ flexDirection: 'row', gap: 4, marginBottom: spacing.md }}>
              {quests.map((q) => (
                <View key={q.id} style={{ flex: 1, height: 6, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                  <View style={{ height: 6, width: `${Math.round((q.current / q.total) * 100)}%`, backgroundColor: q.color }} />
                </View>
              ))}
            </View>

            {/* Quest list */}
            {quests.map((q) => {
              const done = q.current >= q.total;
              const pct = Math.round((q.current / q.total) * 100);
              const inner = (
                <View style={{ padding: spacing.md, borderRadius: radius.md, backgroundColor: done ? colors.greenSoft : colors.glass, borderWidth: 1, borderColor: done ? colors.green : colors.border, marginBottom: spacing.sm }}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
                    <View style={{ width: 36, height: 36, borderRadius: radius.md, backgroundColor: done ? colors.greenSoft : colors.bgElevated, alignItems: 'center', justifyContent: 'center' }}>
                      <Text style={{ fontSize: 18, color: done ? colors.green : q.color }}>{done ? '✓' : q.icon}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: colors.fg, fontSize: 14, fontWeight: '700', textDecorationLine: done ? 'line-through' : 'none', opacity: done ? 0.55 : 1 }}>{q.label}</Text>
                      <Text style={{ color: colors.fgSubtle, fontSize: 12, marginTop: 1 }}>{q.desc}</Text>
                    </View>
                    <View style={{ backgroundColor: done ? colors.greenSoft : colors.primarySoft, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
                      <Text style={{ color: done ? colors.green : colors.primary, fontSize: 12, fontWeight: '800' }}>✨ +{q.xp} XP</Text>
                    </View>
                  </View>
                  {!done ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.sm }}>
                      <View style={{ flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border, overflow: 'hidden' }}>
                        <View style={{ height: 5, width: `${pct}%`, backgroundColor: q.color }} />
                      </View>
                      <Text style={{ color: colors.fgSubtle, fontSize: 12 }}>{q.current}/{q.total}</Text>
                    </View>
                  ) : null}
                </View>
              );
              return q.link && !done
                ? <Pressable key={q.id} onPress={() => router.push('/(tabs)')}>{inner}</Pressable>
                : <View key={q.id}>{inner}</View>;
            })}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
