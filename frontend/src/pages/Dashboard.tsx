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
      fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
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
  const totalLessons = modules.reduce((s, m) => s + m.lessons.length, 0);
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

        {/* Greeting */}
        <div className="mb-8 animate-fade-up">
          <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Welcome back,' : 'Добре дошъл,'}
          </p>
          <h1 className="text-3xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
            {user?.name} 👋
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { icon: '⚡', label: ui.total_xp, value: xp.toLocaleString(), color: 'hsl(var(--c-primary))' },
            { icon: '🔥', label: ui.current_streak, value: `${streak}`, color: 'hsl(var(--c-orange))' },
            { icon: '🏆', label: ui.level, value: `${level.level} — ${level.label[lang]}`, color: 'hsl(var(--c-green))' },
            { icon: '📚', label: ui.lessons_completed, value: `${completedLessons}/${totalLessons}`, color: 'hsl(var(--c-purple))' },
          ].map(({ icon, label, value, color }, i) => (
            <div key={label} className={`glass-card rounded-2xl p-4 animate-fade-up delay-${i * 100}`}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-base">{icon}</span>
                <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</span>
              </div>
              <p className="text-xl font-bold" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Level progress */}
        <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
                {level.label[lang]} — {lang === 'en' ? 'Level' : 'Ниво'} {level.level}
              </h3>
              <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {xp} XP{nextLevel ? ` · ${nextLevel.minXp - xp} ${lang === 'en' ? 'to level up' : 'до следващо ниво'}` : ` · ${lang === 'en' ? 'Max level!' : 'Максимално ниво!'}`}
              </p>
            </div>
            <div className="text-2xl font-black" style={{ color: 'hsl(var(--c-primary))' }}>Lv.{level.level}</div>
          </div>
          <div className="progress-bar-track" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Continue learning CTA */}
        {nextLesson && (
          <div className="glass-card rounded-2xl p-5 mb-6 animate-fade-up delay-300"
            style={{ borderColor: 'hsl(var(--c-green)/0.25)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{nextLesson.lesson.icon}</div>
                <div>
                  <p className="text-xs font-semibold mb-0.5" style={{ color: 'hsl(var(--c-green))' }}>
                    {ui.continue_learning}
                  </p>
                  <h3 className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
                    {nextLesson.lesson.title[lang]}
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {nextLesson.module.title[lang]} · +{nextLesson.lesson.xpReward} XP
                  </p>
                </div>
              </div>
              <Link to={`/lesson/${nextLesson.module.id}/${nextLesson.lesson.id}`}>
                <button className="btn-green text-sm px-6 py-2.5">{ui.continue} →</button>
              </Link>
            </div>
          </div>
        )}

        {/* Daily quests */}
        <div className="animate-fade-up delay-400">
          <DailyQuests completedLessons={completedLessons} streak={streak} xp={xp} />
        </div>

        {/* Module progress overview */}
        <div className="animate-fade-up delay-500">
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
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map(mod => {
              const done = mod.lessons.filter(l => l.completed).length;
              const total = mod.lessons.length;
              return (
                <div key={mod.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{mod.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>
                        {mod.title[lang]}
                      </h4>
                      <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                        {done}/{total} {ui.lessons}
                      </p>
                    </div>
                    {done === total && <span>✅</span>}
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${total > 0 ? (done / total) * 100 : 0}%` }} />
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
