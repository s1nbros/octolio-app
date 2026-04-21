import { useMemo, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

interface Quest {
  id: string;
  color: string;
  icon: string;
  label: { en: string; bg: string };
  description: { en: string; bg: string };
  xp: number;
  current: number;
  total: number;
  link?: string;
}

interface Props {
  completedLessons: number;
  streak: number;
  xp: number;
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

export function DailyQuests({ completedLessons, streak, xp }: Props) {
  const { lang } = useLang();
  const { h, m } = useTimeToMidnight();
  const day = new Date().getDay();

  const quests: Quest[] = useMemo(() => [
    {
      id: 'complete-lesson',
      color: 'hsl(var(--c-primary))',
      icon: '📚',
      label:       { en: 'Daily Scholar',       bg: 'Дневен учен' },
      description: { en: 'Complete 1 lesson today', bg: 'Завърши 1 урок днес' },
      xp: 25, link: '/modules',
      current: Math.min(completedLessons > 0 ? 1 : 0, 1),
      total: 1,
    },
    {
      id: 'streak-keep',
      color: 'hsl(var(--c-green))',
      icon: '🔥',
      label:       { en: 'Streak Keeper',       bg: 'Пазач на стрийк' },
      description: { en: 'Log in and keep your streak alive', bg: 'Влез и запази стрийка' },
      xp: 10,
      current: streak > 0 ? 1 : 0,
      total: 1,
    },
    {
      id: 'xp-earn',
      color: 'hsl(var(--c-orange))',
      icon: '⚡',
      label:       { en: 'XP Hunter',           bg: 'Ловец на XP' },
      description: { en: 'Earn 50 XP today',    bg: 'Спечели 50 XP днес' },
      xp: 20, link: '/modules',
      current: Math.min(xp % 100, 50),
      total: 50,
    },
    {
      id: 'theory',
      color: 'hsl(var(--c-gold))',
      icon: '🏆',
      label:       { en: day % 2 === 0 ? 'Budget Master' : 'Invest Like a Pro', bg: day % 2 === 0 ? 'Майстор бюджет' : 'Инвестирай като про' },
      description: { en: day % 2 === 0 ? 'Complete a budgeting lesson' : 'Complete an investing lesson', bg: day % 2 === 0 ? 'Завърши урок по бюджетиране' : 'Завърши урок по инвестиране' },
      xp: 30, link: '/modules',
      current: 0,
      total: 1,
    },
  ], [completedLessons, streak, xp, day]);

  const doneCount = quests.filter(q => q.current >= q.total).length;
  const xpLeft    = quests.filter(q => q.current < q.total).reduce((s, q) => s + q.xp, 0);

  return (
    <div className="glass-card rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-1">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-base" style={{ color: 'hsl(var(--c-orange))' }}>◎</span>
            <h3 className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Daily Quests' : 'Дневни куестове'}
            </h3>
            <span className="mono text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? `resets in ${h}h ${m}m` : `нулира се след ${h}ч ${m}м`}
            </span>
          </div>
          <p className="text-xs mt-0.5 ml-6" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {doneCount}/{quests.length} {lang === 'en' ? 'completed · keep going' : 'завършени · продължавай'}
          </p>
        </div>
        <span className="flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          ⚡ {xpLeft} XP left
        </span>
      </div>

      {/* Segmented progress bar */}
      <div className="flex gap-1 mb-4 mt-3">
        {quests.map((q, i) => (
          <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--c-border)' }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.round((q.current / q.total) * 100)}%`,
                background: q.color,
              }} />
          </div>
        ))}
      </div>

      {/* Quest list */}
      <div className="space-y-2">
        {quests.map(q => {
          const done = q.current >= q.total;
          const pct  = Math.round((q.current / q.total) * 100);

          const inner = (
            <div className="p-3 rounded-xl transition-all"
              style={{
                background: done ? 'hsl(var(--c-green)/0.06)' : 'var(--c-glass)',
                border: `1px solid ${done ? 'hsl(var(--c-green)/0.18)' : 'var(--c-border)'}`,
                cursor: q.link && !done ? 'pointer' : 'default',
              }}>

              {/* Top row: icon · title+desc · xp pill — all items-start so nothing stretches */}
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 text-lg mt-0.5"
                  style={{ background: done ? 'hsl(var(--c-green)/0.18)' : `${q.color}22` }}>
                  {done ? '✓' : q.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-tight"
                    style={{
                      color: 'hsl(var(--c-fg))',
                      textDecoration: done ? 'line-through' : 'none',
                      opacity: done ? 0.55 : 1,
                    }}>
                    {q.label[lang]}
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {q.description[lang]}
                  </p>
                </div>

                <span className="flex items-center gap-0.5 text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: done ? 'hsl(var(--c-green)/0.15)' : 'hsl(var(--c-primary)/0.14)',
                    color: done ? 'hsl(var(--c-green))' : 'hsl(var(--c-primary))',
                  }}>
                  ⚡ +{q.xp} XP
                </span>
              </div>

              {/* Progress bar — full width below the row, only when not done */}
              {!done && (
                <div className="flex items-center gap-2 mt-2.5">
                  <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--c-border)' }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, background: q.color }} />
                  </div>
                  <span className="mono text-xs flex-shrink-0" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {q.current}/{q.total}
                  </span>
                </div>
              )}
            </div>
          );

          return q.link && !done
            ? <Link key={q.id} to={q.link} className="block">{inner}</Link>
            : <div key={q.id}>{inner}</div>;
        })}
      </div>
    </div>
  );
}
