import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { DailyQuests } from '../components/DailyQuests';
import { getLevel, getLevelProgress, LEVELS } from '../types';
import type { ModuleMeta } from '../types';

/* Compact circular level ring */
function LevelRing({ level, pct, size = 110 }: { level: number; pct: number; size?: number }) {
  const r = size * 0.4;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="flex-shrink-0">
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="8" />
      <circle
        cx={cx}
        cy={cx}
        r={r}
        fill="none"
        stroke="hsl(var(--c-green))"
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform={`rotate(-90 ${cx} ${cx})`}
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x={cx} y={cx - 4} textAnchor="middle" fontSize={size * 0.26} fontWeight="800"
        fill="white" fontFamily="'JetBrains Mono', monospace">
        {level}
      </text>
      <text x={cx} y={cx + 14} textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.5)"
        letterSpacing="3" fontFamily="Inter, sans-serif" fontWeight="600">
        LEVEL
      </text>
    </svg>
  );
}

export function Quests() {
  const { user, token, updateUser } = useAuth();
  const { lang } = useLang();
  const [xp, setXp] = useState(user?.xp ?? 0);
  const [streak, setStreak] = useState(user?.streak ?? 0);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([modsData, progData]) => {
        const modules: ModuleMeta[] = modsData.modules ?? [];
        setTotalLessons(modules.reduce((s, m) => s + m.lessons.length, 0));
        setCompletedLessons(modules.reduce((s, m) => s + m.lessons.filter((l) => l.completed).length, 0));
        setXp(progData.xp ?? user?.xp ?? 0);
        setStreak(progData.streak ?? user?.streak ?? 0);
        updateUser({ xp: progData.xp, streak: progData.streak });
      })
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const level = getLevel(xp);
  const levelPct = getLevelProgress(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative pb-12">
      <div className="md:hidden"><FloatingOrbs /></div>

      <div className="relative max-w-3xl mx-auto px-4 sm:px-6 md:px-0 py-2 sm:py-4 md:py-2" style={{ zIndex: 1 }}>
        {/* Page header */}
        <div className="mb-6 md:mb-8 animate-fade-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Daily Quests' : 'Дневни куестове'}
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Complete quests every day to earn bonus XP and keep your streak.'
              : 'Завършвай куестове всеки ден, за да печелиш бонус XP и да пазиш стрийка си.'}
          </p>
        </div>

        {/* Hero card with level ring + welcome */}
        <div
          className="glass-card rounded-2xl p-5 md:p-6 mb-5 md:mb-6 animate-fade-up overflow-hidden"
          style={{ background: 'linear-gradient(135deg, hsl(var(--c-bg-card)), hsl(var(--c-primary)/0.06))' }}
        >
          <div className="flex items-center gap-5">
            <LevelRing level={level.level} pct={levelPct} size={110} />

            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Welcome back' : 'Добре дошъл'}
              </p>
              <h2 className="text-xl md:text-2xl font-extrabold truncate mb-1.5" style={{ color: 'hsl(var(--c-fg))' }}>
                {user?.name} 👋
              </h2>
              <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                <span className="mono font-bold" style={{ color: 'hsl(var(--c-primary))' }}>{xp.toLocaleString()}</span>
                {' / '}
                <span className="mono font-bold">{nextLevel ? nextLevel.minXp.toLocaleString() : '∞'}</span>
                {' XP — '}
                <span className="font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                  {nextLevel ? nextLevel.label[lang] : level.label[lang]}
                </span>
              </p>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5 md:mb-6 animate-fade-up delay-100">
          {[
            { icon: '✨', label: lang === 'en' ? 'Total XP' : 'Общо XP', value: xp.toLocaleString(), accent: 'var(--c-primary)' },
            { icon: '🔥', label: lang === 'en' ? 'Day streak' : 'Поред', value: streak.toString(), accent: 'var(--c-orange)' },
            { icon: '🏆', label: lang === 'en' ? 'Level' : 'Ниво', value: `${level.level}`, accent: 'var(--c-green)' },
            { icon: '✅', label: lang === 'en' ? 'Lessons' : 'Уроци', value: `${completedLessons}/${totalLessons}`, accent: 'var(--c-gold)' },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl p-4 relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, hsl(${s.accent}/0.12) 0%, transparent 70%)`,
                border: `1px solid hsl(${s.accent}/0.18)`,
                backdropFilter: 'blur(16px)',
              }}>
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-base" style={{ color: `hsl(${s.accent})` }}>{s.icon}</span>
                <span className="text-xs font-medium" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{s.label}</span>
              </div>
              <p className="mono text-xl md:text-2xl font-bold leading-none" style={{ color: `hsl(${s.accent})` }}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Daily quests */}
        <div className="animate-fade-up delay-200">
          <DailyQuests completedLessons={completedLessons} streak={streak} xp={xp} />
        </div>
      </div>
    </div>
  );
}
