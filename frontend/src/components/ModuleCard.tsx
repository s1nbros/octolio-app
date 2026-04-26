import { useState } from 'react';
import { Link } from 'react-router-dom';
import type { ModuleMeta } from '../types';
import { useLang } from '../contexts/LanguageContext';

const COLOR_MAP: Record<string, { border: string; glow: string; badge: string; bg: string }> = {
  green: {
    border: 'hsl(160, 55%, 55%, 0.3)',
    glow: 'hsl(160, 55%, 55%, 0.15)',
    badge: 'hsl(160, 55%, 55%)',
    bg: 'hsl(160, 55%, 55%, 0.06)',
  },
  blue: {
    border: 'hsl(239, 84%, 67%, 0.3)',
    glow: 'hsl(239, 84%, 67%, 0.15)',
    badge: 'hsl(239, 84%, 67%)',
    bg: 'hsl(239, 84%, 67%, 0.06)',
  },
  purple: {
    border: 'hsl(280, 70%, 65%, 0.3)',
    glow: 'hsl(280, 70%, 65%, 0.15)',
    badge: 'hsl(280, 70%, 65%)',
    bg: 'hsl(280, 70%, 65%, 0.06)',
  },
  orange: {
    border: 'hsl(28, 85%, 60%, 0.3)',
    glow: 'hsl(28, 85%, 60%, 0.15)',
    badge: 'hsl(28, 85%, 60%)',
    bg: 'hsl(28, 85%, 60%, 0.06)',
  },
};

interface Props {
  module: ModuleMeta;
  isLocked: boolean;
  isProLocked: boolean;
  index: number;
}

export function ModuleCard({ module, isLocked, isProLocked, index }: Props) {
  const { t, ui, lang } = useLang();
  const [hovered, setHovered] = useState(false);
  const colors = COLOR_MAP[module.color] ?? COLOR_MAP.blue;
  const completedCount = module.lessons.filter((l) => l.completed).length;
  const totalLessons = module.lessons.length;
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const isFullyDone = completedCount === totalLessons && totalLessons > 0;

  // Pro users see pro modules unlocked but with a PRO label. Free users see them locked.
  const hardBlocked = isLocked || isProLocked;

  const nextLesson = module.lessons.find((l) => !l.completed) ?? module.lessons[0];

  return (
    <div
      className={`glass-card rounded-2xl p-4 sm:p-6 transition-all duration-300 animate-fade-up delay-${Math.min(index * 100, 400)}`}
      style={{
        borderColor: hardBlocked
          ? (isProLocked ? 'hsl(var(--c-primary)/0.35)' : 'var(--c-border)')
          : hovered
            ? colors.badge
            : colors.border,
        boxShadow: !hardBlocked && hovered
          ? `0 0 0 1px ${colors.badge}, 0 8px 32px ${colors.glow}`
          : isProLocked ? '0 0 24px hsl(var(--c-primary)/0.08)' : undefined,
        opacity: isLocked ? 0.55 : 1,
        cursor: hardBlocked ? 'default' : 'pointer',
        transform: !hardBlocked && hovered ? 'translateY(-2px)' : undefined,
      }}
      onMouseEnter={() => !hardBlocked && setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3 sm:mb-4 gap-2">
        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
          <div
            className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
            style={{ background: hardBlocked ? 'var(--c-glass)' : colors.bg }}
          >
            {isProLocked ? '✦' : isLocked ? '🔒' : module.icon}
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-sm sm:text-base truncate" style={{ color: hardBlocked ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-fg))' }}>
              {t(module.title)}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {isProLocked
                ? (lang === 'en' ? 'Pro exclusive' : 'Само за Pro')
                : `${completedCount}/${totalLessons} ${ui.lessons}`}
            </p>
          </div>
        </div>

        {isFullyDone && !hardBlocked && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: colors.bg, color: colors.badge, border: `1px solid ${colors.border}` }}>
            ✓ {ui.completed}
          </span>
        )}
        {/* Pro badge — shown on locked (free user) AND unlocked (pro user) pro modules */}
        {module.proOnly && (
          <span className="text-xs font-bold px-2.5 py-1 rounded-full"
            style={{
              background: isProLocked ? 'hsl(var(--c-primary)/0.15)' : 'hsl(var(--c-primary)/0.08)',
              color: 'hsl(var(--c-primary))',
              border: `1px solid ${isProLocked ? 'hsl(var(--c-primary)/0.35)' : 'hsl(var(--c-primary)/0.2)'}`,
            }}>
            ✦ PRO
          </span>
        )}
        {isLocked && !isProLocked && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'var(--c-glass)', color: 'hsl(var(--c-fg-subtle))', border: '1px solid var(--c-border)' }}>
            🔒 {ui.locked}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm mb-4" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {t(module.description)}
      </p>

      {/* Progress bar */}
      {!isProLocked && (
        <div className="mb-4">
          <div className="progress-bar-track">
            <div
              className="progress-bar-fill"
              style={{
                width: `${progress}%`,
                background: isLocked
                  ? 'var(--c-border)'
                  : `linear-gradient(90deg, ${colors.badge}, ${colors.badge})`,
              }}
            />
          </div>
        </div>
      )}

      {/* Lessons list */}
      {!isProLocked && (
        <div className="space-y-2 mb-5">
          {module.lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
              style={{ background: 'var(--c-glass)' }}
            >
              <span className="text-sm">{lesson.completed ? '✅' : lesson.icon}</span>
              <span className="text-sm flex-1 truncate" style={{
                color: lesson.completed ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-fg))',
                textDecoration: lesson.completed ? 'line-through' : 'none',
              }}>
                {t(lesson.title)}
              </span>
              <span className="text-xs font-medium" style={{ color: colors.badge }}>
                +{lesson.xpReward} XP
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Pro locked — teaser for free users */}
      {isProLocked && (
        <div className="mb-5 p-3 rounded-xl text-center"
          style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en'
              ? `${totalLessons} lessons — unlock with Pro`
              : `${totalLessons} урока — отключи с Pro`}
          </p>
        </div>
      )}

      {/* CTA */}
      {!hardBlocked && (
        <Link to={`/lesson/${module.id}/${nextLesson.id}`}>
          <button
            className="w-full py-2.5 rounded-xl font-semibold text-sm transition-all"
            style={{
              background: isFullyDone ? colors.bg : colors.badge,
              color: isFullyDone ? colors.badge : (module.color === 'green' ? 'hsl(228, 24%, 8%)' : 'white'),
              border: isFullyDone ? `1px solid ${colors.border}` : 'none',
            }}
          >
            {isFullyDone ? `↻ ${ui.continue}` : completedCount > 0 ? `▶ ${ui.continue}` : `→ ${ui.start}`}
          </button>
        </Link>
      )}

      {isProLocked && (
        <a href="/profile">
          <button className="w-full py-2.5 rounded-xl font-bold text-sm transition-all"
            style={{
              background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
              color: '#fff',
              border: 'none',
            }}>
            ✦ {lang === 'en' ? 'Unlock with Pro' : 'Отключи с Pro'}
          </button>
        </a>
      )}
    </div>
  );
}
