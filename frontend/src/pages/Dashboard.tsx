import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { DailyQuests } from '../components/DailyQuests';
import { getLevel, getLevelProgress, LEVELS } from '../types';
import type { ModuleMeta } from '../types';

export function Dashboard() {
  const { user, token, updateUser } = useAuth();
  const { ui, lang } = useLang();
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

  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const nextLevel = LEVELS.find(l => l.level === level.level + 1);
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

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10" style={{ zIndex: 1 }}>

        {/* ── Greeting ── */}
        <div className="mb-8 animate-fade-up">
          <p className="text-sm font-medium mb-1 uppercase tracking-widest"
            style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Welcome back' : 'Добре дошъл'}
          </p>
          <h1 className="text-3xl font-extrabold" style={{ color: 'hsl(var(--c-fg))' }}>
            {user?.name} <span style={{ opacity: 0.85 }}>👋</span>
          </h1>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
          {[
            { icon: '⚡', label: ui.total_xp,          value: xp.toLocaleString(),                   color: 'hsl(var(--c-primary))' },
            { icon: '🔥', label: ui.current_streak,    value: streak.toString(),                      color: 'hsl(var(--c-orange))' },
            { icon: '🏆', label: ui.level,             value: `${level.level} — ${level.label[lang]}`, color: 'hsl(var(--c-green))' },
            { icon: '📚', label: ui.lessons_completed, value: `${completedLessons}/${totalLessons}`,  color: 'hsl(var(--c-purple))' },
          ].map(({ icon, label, value, color }, i) => (
            <div key={label}
              className={`glass-card rounded-2xl p-4 animate-fade-up delay-${i * 100}`}>
              <div className="flex items-center gap-2 mb-2.5">
                <span className="text-base leading-none">{icon}</span>
                <span className="text-xs font-medium uppercase tracking-wide"
                  style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</span>
              </div>
              <p className="mono text-2xl font-semibold leading-none" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* ── Level progress ── */}
        <div className="glass-card rounded-2xl p-5 mb-5 animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>
                {level.label[lang]}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                <span className="mono">{xp.toLocaleString()}</span> XP
                {nextLevel
                  ? <> · <span className="mono">{(nextLevel.minXp - xp).toLocaleString()}</span> {lang === 'en' ? 'to level up' : 'до следващо ниво'}</>
                  : <> · {lang === 'en' ? 'Max level!' : 'Максимално ниво!'}</>}
              </p>
            </div>
            <div className="mono text-3xl font-bold" style={{ color: 'hsl(var(--c-primary))' }}>
              Lv.{level.level}
            </div>
          </div>
          <div className="progress-bar-track" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* ── Continue learning CTA ── */}
        {nextLesson && (
          <div className="glass-card rounded-2xl p-5 mb-5 animate-fade-up delay-300"
            style={{ borderColor: 'hsl(var(--c-green)/0.28)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                  style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
                  {nextLesson.lesson.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold mb-0.5 uppercase tracking-wide"
                    style={{ color: 'hsl(var(--c-green))' }}>
                    {ui.continue_learning}
                  </p>
                  <h3 className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
                    {nextLesson.lesson.title[lang]}
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {nextLesson.module.title[lang]}
                    <span className="mono ml-1.5" style={{ color: 'hsl(var(--c-green))' }}>
                      +{nextLesson.lesson.xpReward} XP
                    </span>
                  </p>
                </div>
              </div>
              <Link to={`/lesson/${nextLesson.module.id}/${nextLesson.lesson.id}`}>
                <button className="btn-green text-sm px-6 py-2.5">{ui.continue} →</button>
              </Link>
            </div>
          </div>
        )}

        {/* ── Daily quests ── */}
        <div className="animate-fade-up delay-400">
          <DailyQuests completedLessons={completedLessons} streak={streak} xp={xp} />
        </div>

        {/* ── Module progress ── */}
        <div className="mt-8 animate-fade-up delay-500">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Your Modules' : 'Твоите модули'}
            </h2>
            <Link to="/modules">
              <button className="btn-ghost text-sm py-1.5 px-4">
                {lang === 'en' ? 'View all →' : 'Виж всички →'}
              </button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {modules.map(mod => {
              const done  = mod.lessons.filter(l => l.completed).length;
              const total = mod.lessons.length;
              const pct   = total > 0 ? (done / total) * 100 : 0;
              return (
                <div key={mod.id} className="glass-card glass-card-hover rounded-xl p-4 cursor-default">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                      style={{ background: `${mod.color}18`, border: `1px solid ${mod.color}30` }}>
                      {mod.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm truncate" style={{ color: 'hsl(var(--c-fg))' }}>
                        {mod.title[lang]}
                      </h4>
                      <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                        <span className="mono">{done}/{total}</span> {ui.lessons}
                      </p>
                    </div>
                    {done === total && total > 0 && (
                      <span className="text-lg">✅</span>
                    )}
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
