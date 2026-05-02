import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import type { ModuleMeta, LessonMeta } from '../types';

/* Color palette per module color key */
const COLORS: Record<string, { main: string; deep: string; soft: string }> = {
  green:  { main: 'hsl(160, 55%, 55%)', deep: 'hsl(160, 60%, 35%)', soft: 'hsl(160, 55%, 70%)' },
  blue:   { main: 'hsl(239, 84%, 67%)', deep: 'hsl(239, 70%, 45%)', soft: 'hsl(239, 84%, 78%)' },
  purple: { main: 'hsl(280, 70%, 65%)', deep: 'hsl(280, 55%, 42%)', soft: 'hsl(280, 70%, 78%)' },
  orange: { main: 'hsl(28, 85%, 60%)',  deep: 'hsl(28, 80%, 40%)',  soft: 'hsl(28, 85%, 72%)' },
};
const LOCKED = { main: 'hsl(228, 12%, 30%)', deep: 'hsl(228, 14%, 18%)', soft: 'hsl(228, 12%, 40%)' };
const PRO_COLOR = { main: 'hsl(280, 70%, 65%)', deep: 'hsl(280, 55%, 42%)', soft: 'hsl(280, 70%, 78%)' };

export function Modules() {
  const { token, user } = useAuth();
  const { ui, lang } = useLang();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModule, setOpenModule] = useState<ModuleMeta | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setModules(data.modules ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const isPro = user?.is_pro ?? false;

  const isLocked = (index: number) => {
    if (isPro || index === 0) return false;
    const prev = modules[index - 1];
    if (!prev) return false;
    if (prev.proOnly) return false;
    const prevDone = prev.lessons.filter((l) => l.completed).length;
    return prevDone < 2;
  };
  const isProLocked = (mod: ModuleMeta) => mod.proOnly && !isPro;

  // First unlocked, not-fully-completed module → that's where the octopus sits
  const currentIdx = useMemo(() => {
    for (let i = 0; i < modules.length; i++) {
      if (isLocked(i) || isProLocked(modules[i])) continue;
      const done = modules[i].lessons.filter((l) => l.completed).length;
      if (done < modules[i].lessons.length) return i;
    }
    return modules.length > 0 ? 0 : -1;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, isPro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div
          className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }}
        />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-24 sm:pb-12 overflow-hidden">
      <FloatingOrbs />

      <div className="relative max-w-md md:max-w-lg mx-auto px-4 sm:px-6 md:px-8 py-6 sm:py-10 md:py-14" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-16 sm:mb-20 md:mb-24 text-center animate-fade-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {ui.modules_title}
          </h1>
          <p className="text-sm md:text-base leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.modules_sub}
          </p>
        </div>

        {/* Path of nodes */}
        <div className="relative flex flex-col items-center gap-12 sm:gap-14 md:gap-16">
          {modules.map((mod, i) => {
            const locked = isLocked(i);
            const proLocked = isProLocked(mod);
            const done = mod.lessons.filter((l) => l.completed).length;
            const total = mod.lessons.length;
            const isCurrent = i === currentIdx;
            // Zig-zag offset (5-step sine for a soft snake path)
            const positions = [0, 60, 80, 60, 0, -60, -80, -60];
            const xPx = locked ? positions[i % positions.length] : positions[i % positions.length];

            return (
              <ModuleNode
                key={mod.id}
                mod={mod}
                locked={locked}
                proLocked={proLocked}
                isCurrent={isCurrent}
                done={done}
                total={total}
                xOffsetPx={xPx}
                lang={lang}
                onClick={() => {
                  if (locked) return;
                  if (proLocked) {
                    navigate('/profile');
                    return;
                  }
                  setOpenModule(mod);
                }}
              />
            );
          })}
        </div>
      </div>

      {openModule && (
        <LessonPopup
          mod={openModule}
          lang={lang}
          pickLabel={ui.pick_lesson}
          onClose={() => setOpenModule(null)}
          onPick={(lesson) => {
            navigate(`/lesson/${openModule.id}/${lesson.id}`);
          }}
        />
      )}
    </div>
  );
}

/* ───────── A single node on the path ───────── */
function ModuleNode({
  mod,
  locked,
  proLocked,
  isCurrent,
  done,
  total,
  xOffsetPx,
  lang,
  onClick,
}: {
  mod: ModuleMeta;
  locked: boolean;
  proLocked: boolean;
  isCurrent: boolean;
  done: number;
  total: number;
  xOffsetPx: number;
  lang: 'en' | 'bg';
  onClick: () => void;
}) {
  const blocked = locked || proLocked;
  const allDone = done === total && total > 0;
  const hasStarted = done > 0;
  const palette = blocked ? LOCKED : proLocked ? PRO_COLOR : (COLORS[mod.color] ?? COLORS.blue);
  const progress = total > 0 ? done / total : 0;

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ transform: `translateX(${xOffsetPx}px)` }}
    >
      {/* START / CONTINUE bubble — only on current */}
      {isCurrent && !blocked && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-lg font-extrabold text-xs tracking-widest animate-fade-in"
          style={{
            background: 'hsl(228, 24%, 10%)',
            color: palette.main,
            border: `2px solid ${palette.main}`,
            boxShadow: `0 0 16px ${palette.main}55`,
            whiteSpace: 'nowrap',
          }}
        >
          {hasStarted ? (lang === 'en' ? 'CONTINUE' : 'ПРОДЪЛЖИ') : (lang === 'en' ? 'START' : 'СТАРТ')}
          {/* Pointer */}
          <span
            className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-2.5 h-2.5 rotate-45"
            style={{
              background: 'hsl(228, 24%, 10%)',
              borderRight: `2px solid ${palette.main}`,
              borderBottom: `2px solid ${palette.main}`,
            }}
          />
        </div>
      )}

      {/* Button + progress ring wrapper */}
      <div className="relative">
        {/* Progress ring around the node — shown on every unlocked module */}
        {!blocked && total > 0 && (
          <svg
            className="absolute -inset-2 pointer-events-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
          >
            {/* Dark track groove */}
            <circle
              cx="50"
              cy="50"
              r="46"
              fill="none"
              stroke="hsl(228, 30%, 8%)"
              strokeWidth="6"
              style={{ filter: 'drop-shadow(0 0 1px hsla(0,0%,0%,0.8))' }}
            />
            {/* Progress arc */}
            {progress > 0 && (
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke={palette.main}
                strokeWidth="6"
                strokeDasharray={`${progress * 289} 289`}
                strokeLinecap="round"
                transform="rotate(-90 50 50)"
                style={{ transition: 'stroke-dasharray 0.6s ease-out', filter: `drop-shadow(0 0 8px ${palette.main}99)` }}
              />
            )}
          </svg>
        )}

        {/* The 3D button */}
        <button
          onClick={onClick}
          disabled={locked}
          className="relative w-24 h-24 md:w-28 md:h-28 rounded-full flex items-center justify-center transition-transform active:translate-y-[3px] active:[box-shadow:inset_0_-2px_0_hsla(0,0%,0%,0.3)]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${palette.soft} 0%, ${palette.main} 60%)`,
            boxShadow: `inset 0 -7px 0 ${palette.deep}, 0 8px 16px hsla(0,0%,0%,0.45)`,
            opacity: locked ? 0.7 : 1,
            cursor: locked ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Module icon */}
          <span
            className="text-3xl md:text-4xl select-none"
            style={{
              filter: blocked ? 'grayscale(0.6) opacity(0.8)' : 'drop-shadow(0 1px 2px hsla(0,0%,0%,0.35))',
            }}
          >
            {locked ? '🔒' : proLocked ? '✦' : mod.icon}
          </span>

          {/* Pro badge */}
          {mod.proOnly && (
            <span
              className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-full text-[9px] font-extrabold tracking-wider"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
                color: '#fff',
                boxShadow: '0 0 10px hsla(280,70%,65%,0.6)',
                border: '1px solid hsla(0,0%,100%,0.4)',
              }}
            >
              ✦ PRO
            </span>
          )}

          {/* Done check */}
          {allDone && !blocked && (
            <span
              className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center text-xs font-extrabold"
              style={{
                background: 'hsl(var(--c-green))',
                color: '#fff',
                boxShadow: '0 3px 8px hsla(0,0%,0%,0.45)',
                border: '2px solid hsl(228, 24%, 10%)',
              }}
            >
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Label */}
      <p
        className="mt-3 text-xs sm:text-sm md:text-base font-semibold text-center max-w-[160px] md:max-w-[200px]"
        style={{
          color: blocked ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-fg))',
        }}
      >
        {mod.title[lang]}
      </p>
      <p
        className="text-[11px] mt-0.5"
        style={{ color: 'hsl(var(--c-fg-subtle))' }}
      >
        {locked
          ? lang === 'en' ? 'Locked' : 'Заключен'
          : proLocked
            ? lang === 'en' ? 'Unlock with Pro' : 'Отключи с Pro'
            : `${done}/${total}`}
      </p>
    </div>
  );
}

/* ───────── Lesson popup ───────── */
function LessonPopup({
  mod,
  lang,
  pickLabel,
  onClose,
  onPick,
}: {
  mod: ModuleMeta;
  lang: 'en' | 'bg';
  pickLabel: string;
  onClose: () => void;
  onPick: (lesson: LessonMeta) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'hsla(228,40%,3%,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      <div
        className="relative max-w-md w-full glass-card rounded-3xl p-5 sm:p-7 animate-scale-in max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center text-base transition-all"
          style={{ background: 'var(--c-glass)', color: 'hsl(var(--c-fg-muted))', border: '1px solid var(--c-border)' }}
          aria-label="Close"
        >
          ✕
        </button>

        <div className="text-center mb-5">
          <div className="text-5xl mb-3">{mod.icon}</div>
          <h2 className="text-xl sm:text-2xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {mod.title[lang]}
          </h2>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {mod.description[lang]}
          </p>
        </div>

        <p className="text-xs uppercase tracking-wider font-bold mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {pickLabel}
        </p>

        <div className="space-y-2">
          {mod.lessons.map((lesson) => (
            <button
              key={lesson.id}
              onClick={() => onPick(lesson)}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
              style={{
                background: lesson.completed ? 'hsl(var(--c-green)/0.10)' : 'var(--c-glass)',
                border: `1px solid ${lesson.completed ? 'hsl(var(--c-green)/0.3)' : 'var(--c-border)'}`,
              }}
            >
              <span className="text-xl flex-shrink-0">{lesson.completed ? '✅' : lesson.icon}</span>
              <span
                className="flex-1 text-left text-sm font-semibold truncate"
                style={{
                  color: lesson.completed ? 'hsl(var(--c-fg-subtle))' : 'hsl(var(--c-fg))',
                }}
              >
                {lesson.title[lang]}
              </span>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0"
                style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))' }}
              >
                +{lesson.xpReward}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
