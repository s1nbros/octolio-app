import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

interface Quest {
  id: string;
  icon: string;
  label: { en: string; bg: string };
  description: { en: string; bg: string };
  xp: number;
  link?: string;
  completed: boolean;
}

interface Props {
  completedLessons: number;
  streak: number;
  xp: number;
}

export function DailyQuests({ completedLessons, streak, xp }: Props) {
  const { lang } = useLang();

  const quests: Quest[] = useMemo(() => {
    const day = new Date().getDay(); // rotate quests by day
    return [
      {
        id: 'complete-lesson',
        icon: '📚',
        label: { en: 'Daily Scholar', bg: 'Дневен учен' },
        description: { en: 'Complete 1 lesson today', bg: 'Завърши 1 урок днес' },
        xp: 25,
        link: '/modules',
        completed: completedLessons > 0,
      },
      {
        id: 'streak-keep',
        icon: '🔥',
        label: { en: 'Streak Keeper', bg: 'Пазач на стрийк' },
        description: { en: 'Log in and keep your streak alive', bg: 'Влез и запази стрийка си жив' },
        xp: 10,
        completed: streak > 0,
      },
      {
        id: 'xp-earn',
        icon: '⚡',
        label: { en: 'XP Hunter', bg: 'Ловец на XP' },
        description: { en: 'Earn 50 XP today', bg: 'Спечели 50 XP днес' },
        xp: 20,
        link: '/modules',
        completed: xp % 100 >= 50, // rough check
      },
      {
        id: 'theory',
        icon: '🧠',
        label: { en: (day % 2 === 0 ? 'Budget Master' : 'Invest Like a Pro'), bg: (day % 2 === 0 ? 'Майстор бюджет' : 'Инвестирай като про') },
        description: { en: (day % 2 === 0 ? 'Complete a budgeting lesson' : 'Complete an investing lesson'), bg: (day % 2 === 0 ? 'Завърши урок по бюджетиране' : 'Завърши урок по инвестиране') },
        xp: 30,
        link: day % 2 === 0 ? '/modules' : '/modules',
        completed: false,
      },
    ];
  }, [completedLessons, streak, xp]);

  const doneCount = quests.filter(q => q.completed).length;
  const progress = Math.round((doneCount / quests.length) * 100);

  return (
    <div className="glass-card rounded-2xl p-5 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? '🗓️ Daily Quests' : '🗓️ Дневни куестове'}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {doneCount}/{quests.length} {lang === 'en' ? 'completed' : 'завършени'}
          </p>
        </div>
        <span className="text-sm font-bold px-3 py-1 rounded-full"
          style={{ background: 'hsl(var(--c-gold)/0.12)', color: 'hsl(var(--c-gold))', border: '1px solid hsl(var(--c-gold)/0.25)' }}>
          {quests.filter(q => !q.completed).reduce((s, q) => s + q.xp, 0)} XP left
        </span>
      </div>

      {/* Progress bar */}
      <div className="progress-bar-track mb-4">
        <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
      </div>

      {/* Quest list */}
      <div className="space-y-2">
        {quests.map((q) => {
          const inner = (
            <div className="flex items-center gap-3 p-3 rounded-xl transition-all"
              style={{
                background: q.completed ? 'hsl(var(--c-green)/0.06)' : 'var(--c-glass)',
                border: `1px solid ${q.completed ? 'hsl(var(--c-green)/0.2)' : 'var(--c-border)'}`,
                opacity: q.completed ? 0.75 : 1,
                cursor: q.link && !q.completed ? 'pointer' : 'default',
              }}>
              <span className="text-xl">{q.completed ? '✅' : q.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{
                  color: 'hsl(var(--c-fg))',
                  textDecoration: q.completed ? 'line-through' : 'none',
                }}>
                  {q.label[lang]}
                </p>
                <p className="text-xs truncate" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {q.description[lang]}
                </p>
              </div>
              <span className="text-xs font-bold flex-shrink-0"
                style={{ color: q.completed ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-gold))' }}>
                +{q.xp} XP
              </span>
            </div>
          );

          return q.link && !q.completed
            ? <Link key={q.id} to={q.link}>{inner}</Link>
            : <div key={q.id}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
