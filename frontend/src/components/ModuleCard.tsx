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
  index: number;
}

export function ModuleCard({ module, isLocked, index }: Props) {
  const { t, ui } = useLang();
  const colors = COLOR_MAP[module.color] ?? COLOR_MAP.blue;
  const completedCount = module.lessons.filter((l) => l.completed).length;
  const totalLessons = module.lessons.length;
  const progress = totalLessons > 0 ? (completedCount / totalLessons) * 100 : 0;
  const isFullyDone = completedCount === totalLessons;

  const nextLesson = module.lessons.find((l) => !l.completed) ?? module.lessons[0];

  return (
    <div
      className={`glass-card rounded-2xl p-6 transition-all duration-300 animate-fade-up delay-${Math.min(index * 100, 400)}`}
      style={{
        borderColor: isLocked ? 'rgba(255,255,255,0.05)' : colors.border,
        opacity: isLocked ? 0.55 : 1,
        background: isLocked ? 'rgba(255,255,255,0.02)' : undefined,
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
            style={{ background: isLocked ? 'rgba(255,255,255,0.05)' : colors.bg }}
          >
            {isLocked ? '🔒' : module.icon}
          </div>
          <div>
            <h3 className="font-bold text-base" style={{ color: isLocked ? 'hsl(215, 20%, 45%)' : 'hsl(210, 40%, 96%)' }}>
              {t(module.title)}
            </h3>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(215, 20%, 50%)' }}>
              {completedCount}/{totalLessons} {ui.lessons}
            </p>
          </div>
        </div>

        {isFullyDone && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
            style={{ background: colors.bg, color: colors.badge, border: `1px solid ${colors.border}` }}>
            ✓ {ui.completed}
          </span>
        )}
        {isLocked && (
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'hsl(215, 20%, 45%)', border: '1px solid rgba(255,255,255,0.06)' }}>
            🔒 {ui.locked}
          </span>
        )}
      </div>

      {/* Description */}
      <p className="text-sm mb-4" style={{ color: 'hsl(215, 20%, 60%)' }}>
        {t(module.description)}
      </p>

      {/* Progress bar */}
      <div className="mb-4">
        <div className="progress-bar-track">
          <div
            className="progress-bar-fill"
            style={{
              width: `${progress}%`,
              background: isLocked
                ? 'rgba(255,255,255,0.1)'
                : `linear-gradient(90deg, ${colors.badge}, ${colors.badge})`,
            }}
          />
        </div>
      </div>

      {/* Lessons list */}
      <div className="space-y-2 mb-5">
        {module.lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="flex items-center gap-2.5 px-3 py-2 rounded-lg"
            style={{ background: 'rgba(255,255,255,0.03)' }}
          >
            <span className="text-sm">{lesson.completed ? '✅' : lesson.icon}</span>
            <span className="text-sm flex-1 truncate" style={{
              color: lesson.completed ? 'hsl(215, 20%, 55%)' : 'hsl(210, 40%, 90%)',
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

      {/* CTA */}
      {!isLocked && (
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
    </div>
  );
}
