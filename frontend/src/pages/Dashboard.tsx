import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { DailyQuests } from '../components/DailyQuests';
import { getLevel, getLevelProgress, LEVELS } from '../types';
import type { ModuleMeta } from '../types';

/* ─── Circular level ring (SVG) ─── */
function LevelRing({ level, pct }: { level: number; pct: number }) {
  const R = 52;
  const circ = 2 * Math.PI * R;
  const dash  = (pct / 100) * circ;
  return (
    <svg width="130" height="130" viewBox="0 0 130 130" className="flex-shrink-0">
      {/* Track */}
      <circle cx="65" cy="65" r={R} fill="none"
        stroke="rgba(255,255,255,0.07)" strokeWidth="9" />
      {/* Fill */}
      <circle cx="65" cy="65" r={R} fill="none"
        stroke="hsl(var(--c-green))" strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`}
        transform="rotate(-90 65 65)"
        style={{ transition: 'stroke-dasharray 0.6s cubic-bezier(0.34,1.56,0.64,1)' }}
      />
      <text x="65" y="60" textAnchor="middle" fontSize="34" fontWeight="800"
        fill="white" fontFamily="'JetBrains Mono',monospace">
        {level}
      </text>
      <text x="65" y="78" textAnchor="middle" fontSize="9" fill="rgba(255,255,255,0.45)"
        letterSpacing="4" fontFamily="Inter,sans-serif" fontWeight="600">
        LEVEL
      </text>
    </svg>
  );
}

/* ─── Sidebar: Streak widget ─── */
function StreakWidget({ streak }: { streak: number }) {
  const days = ['M','T','W','T','F','S','S'];
  const today = (new Date().getDay() + 6) % 7; // Mon=0
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <div className="mono text-3xl font-bold" style={{ color: 'hsl(var(--c-orange))' }}>{streak}</div>
          <div className="text-xs uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            Day Streak
          </div>
        </div>
        <span className="text-xs font-bold px-2 py-1 rounded"
          style={{ background: 'hsl(var(--c-orange)/0.12)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.25)', letterSpacing: '0.05em' }}>
          SAVED TIL MIDNIGHT
        </span>
      </div>

      {/* Weekly grid */}
      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((d, i) => {
          const active = i <= today && streak > (today - i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm"
                style={{
                  background: active ? 'hsl(var(--c-orange)/0.2)' : 'var(--c-glass)',
                  border: `1px solid ${active ? 'hsl(var(--c-orange)/0.35)' : 'var(--c-border)'}`,
                }}>
                {active ? '🔥' : <span style={{ opacity: 0.3 }}>🔔</span>}
              </div>
              <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{d}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        1 lesson today keeps your streak. Hit{' '}
        <span style={{ color: 'hsl(var(--c-orange))', fontWeight: 600 }}>7 days</span>
        {' '}to earn a{' '}
        <span style={{ color: 'hsl(var(--c-primary))', fontWeight: 600 }}>Streak Freeze</span>.
      </p>
    </div>
  );
}

/* ─── Sidebar: Pro ad ─── */
function ProWidget() {
  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(var(--c-bg-elevated)), hsl(var(--c-primary)/0.08))', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
      {/* Glow */}
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'hsl(var(--c-orange)/0.12)', filter: 'blur(20px)' }} />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-primary)/0.2)', color: 'hsl(var(--c-primary))' }}>
          OCTOLIO PRO
        </span>
        <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>LIMITED · 50% OFF</span>
      </div>

      <p className="font-extrabold text-lg leading-tight mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
        Unlock every module.
      </p>
      <p className="font-extrabold text-lg leading-tight mb-3" style={{ color: 'hsl(var(--c-green))' }}>
        Level up 2× faster.
      </p>

      <ul className="space-y-1.5 mb-4 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {['Unlimited hearts — no waiting', 'All premium modules instantly', '2× XP on every lesson', 'Personal money coach AI'].map(f => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'hsl(var(--c-green))' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="mono font-extrabold text-2xl" style={{ color: 'hsl(var(--c-fg))' }}>$4.99</span>
        <span className="text-sm line-through" style={{ color: 'hsl(var(--c-fg-subtle))' }}>$9.99</span>
        <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>/month</span>
      </div>

      <button className="btn-green w-full text-sm py-2.5">⚡ Try Pro free for 7 days</button>
      <p className="text-center text-xs mt-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        CANCEL ANYTIME · OFFER ENDS IN 2D 14H
      </p>
    </div>
  );
}

/* ─── Sidebar: League ─── */
function LeagueWidget({ userName }: { userName: string }) {
  const leaderboard = [
    { name: 'Marta K.', xp: 1240 },
    { name: 'Devon A.', xp: 980 },
    { name: userName, xp: 0, isYou: true },
    { name: 'Priya R.', xp: 80 },
    { name: 'Leo V.',   xp: 60 },
  ];

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-gold)/0.15)', color: 'hsl(var(--c-gold))' }}>
          🏅 GOLD LEAGUE
        </span>
      </div>
      <h3 className="font-extrabold text-xl mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
        Weekly race
      </h3>
      <p className="text-xs mb-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        Top 3 promote · ends in 3d 14h
      </p>

      <div className="space-y-2">
        {leaderboard.map((u, i) => (
          <div key={i} className="flex items-center gap-3 py-1.5 px-2 rounded-xl"
            style={{
              background: u.isYou ? 'hsl(var(--c-primary)/0.1)' : 'transparent',
              border: u.isYou ? '1px solid hsl(var(--c-primary)/0.2)' : '1px solid transparent',
            }}>
            <span className="mono text-sm w-4 text-center flex-shrink-0"
              style={{ color: i < 3 ? 'hsl(var(--c-gold))' : 'hsl(var(--c-fg-subtle))' }}>
              {i + 1}
            </span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{
                background: u.isYou ? 'hsl(var(--c-primary)/0.25)' : 'hsl(var(--c-fg-subtle)/0.15)',
                color: u.isYou ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
              }}>
              {u.name[0]}
            </div>
            <span className="flex-1 text-sm font-medium" style={{ color: u.isYou ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-muted))' }}>
              {u.name}{u.isYou && <span style={{ color: 'hsl(var(--c-fg-subtle))' }}> · you</span>}
            </span>
            <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {u.xp} XP
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar: Money fact ─── */
const FACTS = [
  { fact: 'Saving $5/day from 25 to 65 at 7% grows to about $666,000.', tag: 'Compound interest · the 8th wonder' },
  { fact: 'The average millionaire has 7 income streams.', tag: 'Wealth building · diversification' },
  { fact: '50-30-20: spend 50% on needs, 30% on wants, 20% on savings.', tag: 'Budgeting · the classic rule' },
  { fact: 'Index funds beat 90% of active managers over 15 years.', tag: 'Investing · evidence-based' },
];

function MoneyFactWidget() {
  const fact = FACTS[new Date().getDate() % FACTS.length];
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-3">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))' }}>
          + MONEY FACT
        </span>
      </div>
      <p className="text-base font-bold leading-snug mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
        {fact.fact}
      </p>
      <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{fact.tag}</p>
    </div>
  );
}

/* ─── Main ─── */
export function Dashboard() {
  const { user, token, updateUser } = useAuth();
  const { lang } = useLang();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [xp, setXp] = useState(user?.xp ?? 0);
  const [streak, setStreak] = useState(user?.streak ?? 0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/modules',  { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([modsData, progData]) => {
      setModules(modsData.modules ?? []);
      setXp(progData.xp ?? user?.xp ?? 0);
      setStreak(progData.streak ?? user?.streak ?? 0);
      updateUser({ xp: progData.xp, streak: progData.streak });
    }).finally(() => setLoading(false));
  }, [token]);

  const level      = getLevel(xp);
  const levelPct   = getLevelProgress(xp);
  const nextLevel  = LEVELS.find(l => l.level === level.level + 1);
  const totalLessons     = modules.reduce((s, m) => s + m.lessons.length, 0);
  const completedLessons = modules.reduce((s, m) => s + m.lessons.filter(l => l.completed).length, 0);

  const nextLesson = (() => {
    for (const mod of modules) {
      const lesson = mod.lessons.find(l => !l.completed);
      if (lesson) return { module: mod, lesson };
    }
    return null;
  })();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
        style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
    </div>
  );

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-6" style={{ zIndex: 1 }}>

        {/* ── Hero card ── */}
        <div className="glass-card rounded-2xl p-6 mb-5 animate-fade-up"
          style={{ background: 'linear-gradient(135deg, hsl(var(--c-bg-card)), hsl(var(--c-primary)/0.06))' }}>
          <div className="flex items-center gap-6 flex-wrap">
            {/* Ring */}
            <LevelRing level={level.level} pct={levelPct} />

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold uppercase tracking-widest mb-1"
                style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Welcome back' : 'Добре дошъл'}
              </p>
              <h1 className="text-3xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
                {user?.name} <span style={{ opacity: 0.85 }}>👋</span>
              </h1>
              <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                <span className="mono font-bold" style={{ color: 'hsl(var(--c-primary))' }}>{xp.toLocaleString()}</span>
                {' / '}
                <span className="mono font-bold" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {nextLevel ? nextLevel.minXp.toLocaleString() : '∞'}
                </span>
                {' XP toward '}
                <span className="font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                  {nextLevel ? nextLevel.label[lang] : level.label[lang]}
                </span>.
              </p>
            </div>

            {/* CTA */}
            {nextLesson && (
              <Link to={`/lesson/${nextLesson.module.id}/${nextLesson.lesson.id}`} className="flex-shrink-0">
                <button className="btn-green px-6 py-3 text-base">
                  {lang === 'en' ? 'Continue' : 'Продължи'} →
                </button>
              </Link>
            )}
          </div>
        </div>

        {/* ── Two-column layout ── */}
        <div className="flex gap-5">

          {/* ── Main column ── */}
          <div className="flex-1 min-w-0 space-y-5">

            {/* Stats row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-up delay-100">
              {[
                { icon: '⚡', label: lang === 'en' ? 'Total XP'       : 'Общо XP',    value: xp.toLocaleString(),                    accent: 'var(--c-primary)' },
                { icon: '🔔', label: lang === 'en' ? 'Day streak'     : 'Поред',       value: streak.toString(),                      accent: 'var(--c-orange)'  },
                { icon: '🏆', label: lang === 'en' ? 'Level'          : 'Ниво',        value: `${level.level} · ${level.label[lang]}`, accent: 'var(--c-green)'   },
                { icon: '□',  label: lang === 'en' ? 'Lessons done'   : 'Уроци',       value: `${completedLessons}/${totalLessons}`,   accent: 'var(--c-gold)'    },
              ].map(s => (
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
                  <p className="mono text-2xl font-bold leading-none" style={{ color: `hsl(${s.accent})` }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Daily quests */}
            <div className="animate-fade-up delay-200">
              <DailyQuests completedLessons={completedLessons} streak={streak} xp={xp} />
            </div>

            {/* Modules */}
            <div className="animate-fade-up delay-300">
              <div className="flex items-end justify-between mb-3">
                <div>
                  <h2 className="font-extrabold text-xl" style={{ color: 'hsl(var(--c-fg))' }}>
                    {lang === 'en' ? 'Your modules' : 'Твоите модули'}
                  </h2>
                  <p className="text-sm mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {modules.length} {lang === 'en' ? 'tracks · unlock new ones by leveling up' : 'теми · отключи нови с ниво'}
                  </p>
                </div>
                <Link to="/modules">
                  <button className="btn-ghost text-sm py-1.5 px-4">
                    {lang === 'en' ? 'View all' : 'Виж всички'} →
                  </button>
                </Link>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                {modules.map(mod => {
                  const done  = mod.lessons.filter(l => l.completed).length;
                  const total = mod.lessons.length;
                  const pct   = total > 0 ? Math.round((done / total) * 100) : 0;
                  const nextL = mod.lessons.find(l => !l.completed);
                  const color = mod.color ?? '#6c6fef';

                  return (
                    <div key={mod.id} className="rounded-2xl p-4 relative overflow-hidden group"
                      style={{
                        background: 'hsl(var(--c-bg-card))',
                        border: '1px solid var(--c-border)',
                        minHeight: '180px',
                      }}>
                      {/* Colour glow bottom-left */}
                      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full pointer-events-none"
                        style={{ background: `${color}22`, filter: 'blur(24px)', transform: 'translate(-25%, 25%)' }} />

                      {/* Top row: icon + progress % */}
                      <div className="flex items-start justify-between mb-3 relative">
                        <div className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl"
                          style={{ background: `${color}25` }}>
                          {mod.icon}
                        </div>
                        <span className="mono text-xs font-semibold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                          {pct}%
                        </span>
                      </div>

                      {/* Name + desc */}
                      <h3 className="font-bold text-base mb-0.5 relative" style={{ color: 'hsl(var(--c-fg))' }}>
                        {mod.title[lang]}
                      </h3>
                      <p className="text-xs mb-4 relative leading-snug" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                        {mod.description[lang]}
                      </p>

                      {/* Bottom row */}
                      <div className="flex items-center justify-between relative">
                        <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                          <span className="mono">{done}/{total}</span> {lang === 'en' ? 'lessons' : 'урока'}
                        </span>
                        {nextL ? (
                          <Link to={`/lesson/${mod.id}/${nextL.id}`}>
                            <button className="text-xs font-bold px-3 py-1.5 rounded-lg transition-all hover:brightness-110"
                              style={{
                                background: done > 0 ? `${color}30` : `${color}20`,
                                color: color,
                                border: `1px solid ${color}40`,
                              }}>
                              {done > 0 ? (lang === 'en' ? 'Continue' : 'Продължи') : (lang === 'en' ? 'Start' : 'Започни')} →
                            </button>
                          </Link>
                        ) : (
                          <span className="text-xs font-bold px-3 py-1.5 rounded-lg"
                            style={{ background: 'hsl(var(--c-green)/0.1)', color: 'hsl(var(--c-green))' }}>
                            ✓ {lang === 'en' ? 'Done' : 'Готово'}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* ── Right sidebar ── */}
          <div className="w-72 flex-shrink-0 space-y-4 hidden lg:block animate-fade-up delay-200">
            <StreakWidget streak={streak} />
            <ProWidget />
            <LeagueWidget userName={user?.name ?? 'You'} />
            <MoneyFactWidget />
          </div>

        </div>
      </div>
    </div>
  );
}
