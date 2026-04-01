import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { getLevel, getLevelProgress, LEVELS } from '../types';
import type { ModuleMeta } from '../types';

interface ProgressData {
  progress: { lesson_id: string; module_id: string; xp_earned: number; completed_at: string }[];
  xp: number;
  streak: number;
}

export function Dashboard() {
  const { user, token, updateUser } = useAuth();
  const { ui, lang } = useLang();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [progressData, setProgressData] = useState<ProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;

    Promise.all([
      fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ]).then(([modsData, progData]) => {
      setModules(modsData.modules ?? []);
      setProgressData(progData);
      if (user && (progData.xp !== user.xp || progData.streak !== user.streak)) {
        updateUser({ xp: progData.xp, streak: progData.streak });
      }
    }).finally(() => setLoading(false));
  }, [token]);

  const xp = progressData?.xp ?? user?.xp ?? 0;
  const streak = progressData?.streak ?? user?.streak ?? 0;
  const level = getLevel(xp);
  const levelProgress = getLevelProgress(xp);
  const nextLevel = LEVELS.find((l) => l.level === level.level + 1);

  const totalLessons = modules.reduce((sum, m) => sum + m.lessons.length, 0);
  const completedLessons = modules.reduce((sum, m) => sum + m.lessons.filter((l) => l.completed).length, 0);

  // Find next incomplete lesson
  const nextLesson = (() => {
    for (const mod of modules) {
      const lesson = mod.lessons.find((l) => !l.completed);
      if (lesson) return { module: mod, lesson };
    }
    return null;
  })();

  const greetings = {
    en: ['Great to see you', 'Welcome back', 'Ready to learn'],
    bg: ['Приятно е да те видим', 'Добре дошъл', 'Готов за учене'],
  };
  const greeting = greetings[lang][Math.floor(Date.now() / 1000) % 3];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'hsl(239, 84%, 67%)', borderTopColor: 'transparent' }} />
          <p style={{ color: 'hsl(215, 20%, 55%)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-10" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-sm font-medium mb-1" style={{ color: 'hsl(215, 20%, 55%)' }}>{greeting},</p>
          <h1 className="text-3xl font-bold" style={{ color: 'hsl(210, 40%, 96%)' }}>
            {user?.name} 👋
          </h1>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            icon="⭐"
            label={ui.total_xp}
            value={xp.toLocaleString()}
            color="hsl(239, 84%, 67%)"
            delay="0"
          />
          <StatCard
            icon="🔥"
            label={ui.current_streak}
            value={`${streak}`}
            color="hsl(28, 85%, 60%)"
            delay="100"
          />
          <StatCard
            icon="🏆"
            label={ui.level}
            value={`${level.level} — ${level.label[lang]}`}
            color="hsl(160, 55%, 55%)"
            delay="200"
          />
          <StatCard
            icon="📚"
            label={ui.lessons_completed}
            value={`${completedLessons}/${totalLessons}`}
            color="hsl(280, 70%, 65%)"
            delay="300"
          />
        </div>

        {/* Level progress */}
        <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-up delay-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold" style={{ color: 'hsl(210, 40%, 96%)' }}>
                {level.label[lang]} — {ui.level} {level.level}
              </h3>
              <p className="text-sm mt-0.5" style={{ color: 'hsl(215, 20%, 55%)' }}>
                {xp} XP{nextLevel ? ` / ${nextLevel.minXp} XP` : ''}
                {nextLevel ? ` — ${nextLevel.minXp - xp} XP ${lang === 'en' ? 'to next level' : 'до следващо ниво'}` : ` — ${lang === 'en' ? 'Max level!' : 'Максимално ниво!'}`}
              </p>
            </div>
            <div className="text-2xl font-black" style={{ color: 'hsl(239, 84%, 67%)' }}>
              Lv.{level.level}
            </div>
          </div>
          <div className="progress-bar-track" style={{ height: '10px' }}>
            <div className="progress-bar-fill" style={{ width: `${levelProgress}%` }} />
          </div>
        </div>

        {/* Continue learning */}
        {nextLesson && (
          <div className="glass-card rounded-2xl p-6 mb-8 animate-fade-up delay-300"
            style={{ border: '1px solid hsl(160, 55%, 55%, 0.25)' }}>
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{nextLesson.lesson.icon}</div>
                <div>
                  <p className="text-xs font-medium mb-0.5" style={{ color: 'hsl(160, 55%, 60%)' }}>
                    {ui.continue_learning}
                  </p>
                  <h3 className="font-bold text-base" style={{ color: 'hsl(210, 40%, 96%)' }}>
                    {nextLesson.lesson.title[lang]}
                  </h3>
                  <p className="text-sm" style={{ color: 'hsl(215, 20%, 55%)' }}>
                    {nextLesson.module.title[lang]} · +{nextLesson.lesson.xpReward} XP
                  </p>
                </div>
              </div>
              <Link to={`/lesson/${nextLesson.module.id}/${nextLesson.lesson.id}`}>
                <button className="btn-green text-sm px-6 py-2.5">
                  {ui.continue} →
                </button>
              </Link>
            </div>
          </div>
        )}

        {/* Module overview */}
        <div className="animate-fade-up delay-400">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-lg" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {lang === 'en' ? 'Your Modules' : 'Твоите модули'}
            </h2>
            <Link to="/modules">
              <button className="btn-ghost text-sm py-1.5 px-4">
                {lang === 'en' ? 'View all' : 'Виж всички'} →
              </button>
            </Link>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {modules.map((mod) => {
              const done = mod.lessons.filter((l) => l.completed).length;
              const total = mod.lessons.length;
              return (
                <div key={mod.id} className="glass-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl">{mod.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm" style={{ color: 'hsl(210, 40%, 96%)' }}>
                        {mod.title[lang]}
                      </h4>
                      <p className="text-xs" style={{ color: 'hsl(215, 20%, 55%)' }}>
                        {done}/{total} {ui.lessons}
                      </p>
                    </div>
                    {done === total && <span className="text-lg">✅</span>}
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

function StatCard({ icon, label, value, color, delay }: {
  icon: string;
  label: string;
  value: string;
  color: string;
  delay: string;
}) {
  return (
    <div
      className={`glass-card rounded-2xl p-4 animate-fade-up delay-${delay}`}
      style={{ borderColor: `${color}22` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-xs" style={{ color: 'hsl(215, 20%, 55%)' }}>{label}</span>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value}</p>
    </div>
  );
}
