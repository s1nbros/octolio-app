import { Fragment, useEffect, useMemo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ChestModal } from '../components/ChestModal';
import { ChestIcon } from '../components/ChestIcon';
import { TodayPanel } from '../components/TodayPanel';
import { getGoal } from '../shared/onboardingData';
import type { ModuleMeta, LessonMeta } from '../types';

/* Color palette per module color key */
const COLORS: Record<string, { main: string; deep: string; soft: string }> = {
  green:  { main: 'hsl(160, 55%, 55%)', deep: 'hsl(160, 60%, 35%)', soft: 'hsl(160, 55%, 70%)' },
  blue:   { main: 'hsl(239, 84%, 67%)', deep: 'hsl(239, 70%, 45%)', soft: 'hsl(239, 84%, 78%)' },
  purple: { main: 'hsl(280, 70%, 65%)', deep: 'hsl(280, 55%, 42%)', soft: 'hsl(280, 70%, 78%)' },
  orange: { main: 'hsl(28, 85%, 60%)',  deep: 'hsl(28, 80%, 40%)',  soft: 'hsl(28, 85%, 72%)' },
};
const LOCKED = { main: 'hsl(228, 12%, 30%)', deep: 'hsl(228, 14%, 18%)', soft: 'hsl(228, 12%, 40%)' };

type Palette = { main: string; deep: string; soft: string };

interface CurrentPosition { moduleIdx: number; lessonIdx: number; }

interface ChestState {
  moduleId: string;
  position: 'mid' | 'end';
  afterLessonIdx: number;
  status: 'locked' | 'available' | 'opened';
}

export function Modules() {
  const { token, user } = useAuth();
  const { ui, lang } = useLang();
  const navigate = useNavigate();
  const [modules, setModules] = useState<ModuleMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [chestStates, setChestStates] = useState<ChestState[]>([]);
  const [chestTarget, setChestTarget] = useState<{ moduleId: string; position: 'mid' | 'end' } | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch('/api/modules', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setModules(data.modules ?? []))
      .finally(() => setLoading(false));
  }, [token]);

  const loadChestInfo = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/chests/info', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setChestStates(d.chests ?? []);
    } catch {}
  }, [token]);

  useEffect(() => { loadChestInfo(); }, [loadChestInfo]);

  // Look up chest states per (module, afterLessonIdx) — used to slot the
  // chest button right after the lesson that unlocks it.
  const chestByModuleAndIdx = useMemo(() => {
    const m = new Map<string, ChestState>();
    for (const c of chestStates) m.set(`${c.moduleId}:${c.afterLessonIdx}`, c);
    return m;
  }, [chestStates]);

  const isPro = user?.is_pro ?? false;

  const isModuleLocked = (idx: number): boolean => {
    if (isPro || idx === 0) return false;
    const prev = modules[idx - 1];
    if (!prev) return false;
    if (prev.proOnly) return false;
    const prevDone = prev.lessons.filter((l) => l.completed).length;
    return prevDone < 2;
  };
  const isModuleProLocked = (m: ModuleMeta) => m.proOnly && !isPro;

  /* Current = first unlocked, not-completed lesson across all modules */
  const currentPos = useMemo<CurrentPosition | null>(() => {
    for (let mi = 0; mi < modules.length; mi++) {
      if (isModuleLocked(mi) || isModuleProLocked(modules[mi])) continue;
      const lessons = modules[mi].lessons;
      for (let li = 0; li < lessons.length; li++) {
        if (!lessons[li].completed) return { moduleIdx: mi, lessonIdx: li };
      }
    }
    return null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modules, isPro]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  return (
    <div className="relative pb-12 overflow-hidden">
      <div className="md:hidden"><FloatingOrbs /></div>

      <div className="relative max-w-md md:max-w-2xl mx-auto px-4 sm:px-6 md:px-0 py-2 sm:py-4 md:py-2" style={{ zIndex: 1 }}>
        {/* Today panel — daily goal + Daily Money Workout */}
        <TodayPanel />

        {/* Continue hero — the single obvious "what do I do next".
            Continue scrolls the learning path to the current lesson node
            (in context) rather than opening the lesson runner directly. */}
        <ContinueHero
          modules={modules}
          currentPos={currentPos}
          user={user}
          lang={lang}
          onContinue={() => {
            const el = document.getElementById('current-lesson-node');
            if (!el) return;
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // A little bounce so the eye lands on it after the scroll settles.
            try {
              const base = el.style.transform || '';
              el.animate(
                [
                  { transform: `${base} scale(1)` },
                  { transform: `${base} scale(1.12)` },
                  { transform: `${base} scale(1)` },
                ],
                { duration: 600, delay: 350, easing: 'ease-in-out' }
              );
            } catch { /* Web Animations API unsupported — scroll is enough */ }
          }}
        />

        {/* Page header */}
        <div className="mb-4 md:mb-6 text-center md:text-left animate-fade-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {ui.modules_title}
          </h1>
          <p className="text-sm md:text-base" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {ui.modules_sub}
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-10 md:space-y-14">
          {modules.map((mod, mi) => {
            const moduleLocked = isModuleLocked(mi);
            const moduleProLocked = isModuleProLocked(mod);
            const moduleBlocked = moduleLocked || moduleProLocked;
            const palette: Palette = moduleBlocked ? LOCKED : (COLORS[mod.color] ?? COLORS.blue);

            return (
              <section key={mod.id} className="animate-fade-up">
                <SectionBanner
                  mod={mod}
                  idx={mi}
                  palette={palette}
                  blocked={moduleBlocked}
                  proLocked={moduleProLocked}
                  locked={moduleLocked}
                  lang={lang}
                />

                {/* Lesson + chest nodes path */}
                <div className="relative flex flex-col items-center gap-8 md:gap-10 mt-8 md:mt-10">
                  {mod.lessons.map((lesson, li) => {
                    // Within an unlocked module, lessons unlock sequentially
                    const lessonLocked =
                      moduleBlocked ||
                      (li > 0 && !mod.lessons[li - 1].completed && !lesson.completed);
                    const isLessonCurrent =
                      currentPos !== null &&
                      currentPos.moduleIdx === mi &&
                      currentPos.lessonIdx === li;
                    // Snake-pattern offset
                    const positions = [0, 60, 80, 60, 0, -60, -80, -60];
                    const xPx = positions[li % positions.length];

                    // Is there a chest that unlocks RIGHT after this lesson?
                    const chestAfter = chestByModuleAndIdx.get(`${mod.id}:${li}`);

                    return (
                      <Fragment key={lesson.id}>
                        <LessonNode
                          lesson={lesson}
                          locked={lessonLocked}
                          proLocked={moduleProLocked}
                          isCurrent={isLessonCurrent}
                          nodeId={isLessonCurrent ? 'current-lesson-node' : undefined}
                          xOffsetPx={xPx}
                          palette={palette}
                          lang={lang}
                          onClick={() => {
                            if (lessonLocked) return;
                            if (moduleProLocked) { navigate('/profile'); return; }
                            navigate(`/lesson/${mod.id}/${lesson.id}`);
                          }}
                        />
                        {chestAfter && !moduleBlocked && (
                          <ChestNode
                            state={chestAfter}
                            xOffsetPx={0}
                            lang={lang}
                            onClick={() => {
                              if (chestAfter.status !== 'available') return;
                              setChestTarget({ moduleId: chestAfter.moduleId, position: chestAfter.position });
                            }}
                          />
                        )}
                      </Fragment>
                    );
                  })}
                </div>
              </section>
            );
          })}
        </div>
      </div>

      <ChestModal
        target={chestTarget}
        onClose={() => setChestTarget(null)}
        onOpened={() => loadChestInfo()}
      />
    </div>
  );
}

/* ───────── Continue hero — the single focal "next action" ───────── */
function ContinueHero({
  modules,
  currentPos,
  user,
  lang,
  onContinue,
}: {
  modules: ModuleMeta[];
  currentPos: CurrentPosition | null;
  user: ReturnType<typeof useAuth>['user'];
  lang: 'en' | 'bg';
  onContinue: () => void;
}) {
  const goal = getGoal(user?.goal);
  const streak = user?.streak ?? 0;

  // All caught up — no incomplete lesson anywhere.
  if (!currentPos) {
    return (
      <div className="mb-6 md:mb-8 animate-fade-up">
        <div className="glass-card rounded-2xl p-5 sm:p-6 text-center"
          style={{ border: '1px solid hsl(var(--c-green)/0.3)' }}>
          <div className="text-4xl mb-2">🎉</div>
          <h2 className="font-extrabold text-lg sm:text-xl mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? "You're all caught up!" : 'Завърши всичко!'}
          </h2>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Review past lessons to lock in what you learned, or explore a new module below.'
              : 'Прегледай минали уроци, за да затвърдиш наученото, или разгледай нов модул долу.'}
          </p>
        </div>
      </div>
    );
  }

  const mod = modules[currentPos.moduleIdx];
  const lesson = mod?.lessons[currentPos.lessonIdx];
  if (!mod || !lesson) return null;

  // Has the user started (any completed lesson)? Tunes the CTA wording.
  const anyCompleted = modules.some((m) => m.lessons.some((l) => l.completed));

  return (
    <div className="mb-6 md:mb-8 animate-fade-up">
      {/* Goal + streak context line */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {goal
            ? (lang === 'en' ? `On your way to: ${goal.label.en.replace(/^./, c => c.toLowerCase())}` : `На път към: ${goal.label.bg}`)
            : (lang === 'en' ? 'Pick up where you left off' : 'Продължи откъдето спря')}
        </p>
        {streak > 0 && (
          <span className="flex items-center gap-1 text-sm font-bold flex-shrink-0" style={{ color: 'hsl(var(--c-orange))' }}>
            🔥 {streak}
          </span>
        )}
      </div>

      {/* The card */}
      <div
        className="rounded-2xl p-5 sm:p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, hsl(var(--c-primary)/0.16), hsl(var(--c-green)/0.10))',
          border: '1px solid hsl(var(--c-primary)/0.3)',
        }}
      >
        <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, hsl(var(--c-primary)/0.20), transparent 70%)', filter: 'blur(24px)' }} />

        <div className="relative flex items-center gap-4">
          <div className="flex-shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center text-3xl"
            style={{ background: 'hsl(var(--c-bg-elevated, var(--c-bg)))', border: '1px solid hsl(var(--c-fg)/0.08)' }}>
            {lesson.icon || mod.icon || '📘'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-widest mb-0.5" style={{ color: 'hsl(var(--c-primary))' }}>
              {mod.title[lang]}
            </p>
            <p className="font-extrabold text-lg sm:text-xl leading-tight truncate" style={{ color: 'hsl(var(--c-fg))' }}>
              {lesson.title[lang]}
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              +{lesson.xpReward} XP · {lesson.exerciseCount} {lang === 'en' ? 'exercises' : 'упражнения'}
            </p>
          </div>
        </div>

        <button
          onClick={onContinue}
          className="btn-green w-full mt-4 py-3 font-bold text-base"
        >
          {anyCompleted
            ? (lang === 'en' ? 'Continue →' : 'Продължи →')
            : (lang === 'en' ? 'Start your first lesson →' : 'Започни първия си урок →')}
        </button>
      </div>
    </div>
  );
}

/* ───────── Chest node — drops into the lesson path like LessonNode ───────── */
function ChestNode({
  state, xOffsetPx, lang, onClick,
}: {
  state: ChestState;
  xOffsetPx: number;
  lang: 'en' | 'bg';
  onClick: () => void;
}) {
  const { status, position } = state;
  const isAvailable = status === 'available';
  const isOpened = status === 'opened';

  // Color palette by state
  const palette = isAvailable
    ? { main: 'hsl(45, 95%, 55%)', deep: 'hsl(35, 90%, 38%)', soft: 'hsl(45, 95%, 70%)' }
    : isOpened
      ? { main: 'hsl(140, 35%, 45%)', deep: 'hsl(140, 35%, 30%)', soft: 'hsl(140, 30%, 60%)' }
      : { main: 'hsl(228, 12%, 30%)', deep: 'hsl(228, 14%, 18%)', soft: 'hsl(228, 12%, 40%)' };

  const label = isAvailable
    ? (lang === 'en' ? 'CHEST' : 'САНДЪК')
    : isOpened
      ? (lang === 'en' ? 'opened' : 'отворен')
      : (lang === 'en' ? 'locked' : 'заключен');

  const positionLabel = position === 'end'
    ? (lang === 'en' ? 'Module reward' : 'Награда за модул')
    : (lang === 'en' ? 'Mid-module reward' : 'Награда по средата');

  return (
    <div
      className="relative flex flex-col items-center transition-transform"
      style={{ transform: `translateX(${xOffsetPx}px)` }}
    >
      <div className="relative">
        {isAvailable && (
          <span
            className="absolute inset-0 rounded-full animate-pulse-soft pointer-events-none"
            style={{ background: `${palette.main}33`, transform: 'scale(1.18)' }}
            aria-hidden="true"
          />
        )}
        <button
          onClick={onClick}
          disabled={!isAvailable}
          aria-label={label}
          className="relative w-20 h-20 md:w-24 md:h-24 rounded-2xl flex items-center justify-center transition-transform active:translate-y-[3px]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${palette.soft} 0%, ${palette.main} 60%)`,
            boxShadow: isAvailable
              ? `inset 0 -6px 0 ${palette.deep}, 0 6px 18px ${palette.main}55, 0 0 24px ${palette.main}66`
              : `inset 0 -5px 0 ${palette.deep}, 0 4px 10px hsla(0,0%,0%,0.4)`,
            opacity: !isAvailable ? 0.7 : 1,
            cursor: isAvailable ? 'pointer' : 'not-allowed',
          }}
        >
          {isOpened ? (
            <span className="text-3xl md:text-4xl select-none font-black"
              style={{ color: '#fff', filter: 'drop-shadow(0 2px 4px hsla(0,0%,0%,0.45))' }}>
              ✓
            </span>
          ) : (
            <span style={{ filter: isAvailable ? 'drop-shadow(0 3px 5px hsla(0,0%,0%,0.5))' : 'opacity(0.85)' }}>
              <ChestIcon size={42} status={isAvailable ? 'available' : 'locked'} />
            </span>
          )}
        </button>
      </div>

      <p
        className="mt-2 text-[11px] md:text-xs font-extrabold tracking-wider uppercase"
        style={{ color: isAvailable ? palette.main : 'hsl(var(--c-fg-subtle))' }}
      >
        {label}
      </p>
      <p className="text-[10px] mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {positionLabel}
      </p>
    </div>
  );
}

/* ───────── Section banner (the pink-style heading from Duolingo) ───────── */
function SectionBanner({
  mod,
  idx,
  palette,
  blocked,
  locked,
  proLocked,
  lang,
}: {
  mod: ModuleMeta;
  idx: number;
  palette: Palette;
  blocked: boolean;
  locked: boolean;
  proLocked: boolean;
  lang: 'en' | 'bg';
}) {
  const done = mod.lessons.filter((l) => l.completed).length;
  const total = mod.lessons.length;
  const allDone = done === total && total > 0;

  return (
    <div
      className="relative rounded-2xl px-5 py-4 md:px-6 md:py-5 overflow-hidden"
      style={{
        background: blocked
          ? 'linear-gradient(135deg, hsl(228, 14%, 16%), hsl(228, 14%, 12%))'
          : `linear-gradient(135deg, ${palette.main}, ${palette.deep})`,
        boxShadow: blocked
          ? 'inset 0 -3px 0 hsla(0,0%,0%,0.4), 0 4px 12px hsla(0,0%,0%,0.3)'
          : `inset 0 -4px 0 ${palette.deep}, 0 8px 20px hsla(0,0%,0%,0.4)`,
        border: '1px solid ' + (blocked ? 'var(--c-border)' : 'hsla(0,0%,100%,0.18)'),
      }}
    >
      <div className="flex items-center gap-3">
        <span
          className="text-3xl md:text-4xl flex-shrink-0"
          style={{
            filter: blocked
              ? 'grayscale(0.6) opacity(0.85)'
              : 'drop-shadow(0 2px 4px hsla(0,0%,0%,0.45))',
          }}
        >
          {locked ? '🔒' : proLocked ? '✦' : mod.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p
            className="text-[10px] md:text-xs font-bold uppercase tracking-widest mb-0.5"
            style={{ color: blocked ? 'hsl(var(--c-fg-subtle))' : 'hsla(0,0%,100%,0.75)' }}
          >
            {lang === 'en' ? `Section ${idx + 1}` : `Раздел ${idx + 1}`}
            {proLocked && ' · ✦ PRO'}
          </p>
          <h2
            className="font-extrabold text-base md:text-lg leading-tight truncate"
            style={{
              color: blocked ? 'hsl(var(--c-fg-subtle))' : '#fff',
              textShadow: blocked ? 'none' : '0 1px 2px hsla(0,0%,0%,0.4)',
            }}
          >
            {mod.title[lang]}
          </h2>
        </div>
        {!blocked && (
          <div className="flex-shrink-0 text-right">
            <p className="mono text-base md:text-lg font-extrabold" style={{ color: '#fff' }}>
              {done}/{total}
            </p>
            <p className="text-[10px] uppercase tracking-wider" style={{ color: 'hsla(0,0%,100%,0.7)' }}>
              {lang === 'en' ? 'lessons' : 'урока'}
            </p>
          </div>
        )}
        {allDone && !blocked && <span className="text-xl ml-2">✓</span>}
      </div>
    </div>
  );
}

/* ───────── Single lesson node on the path ───────── */
function LessonNode({
  lesson,
  locked,
  proLocked,
  isCurrent,
  xOffsetPx,
  palette,
  lang,
  onClick,
  nodeId,
}: {
  lesson: LessonMeta;
  locked: boolean;
  proLocked: boolean;
  isCurrent: boolean;
  xOffsetPx: number;
  palette: Palette;
  lang: 'en' | 'bg';
  onClick: () => void;
  nodeId?: string;
}) {
  const completed = lesson.completed;
  const nodePalette: Palette = locked ? LOCKED : palette;

  return (
    <div
      id={nodeId}
      className={`relative flex flex-col items-center transition-transform ${isCurrent && !locked ? 'mt-6' : ''}`}
      style={{ transform: `translateX(${xOffsetPx}px)`, scrollMarginTop: '96px' }}
    >
      {/* START bubble — only on current lesson */}
      {isCurrent && !locked && (
        <div
          className="absolute -top-12 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-xl font-extrabold text-sm tracking-widest animate-fade-in"
          style={{
            background: 'hsl(228, 24%, 10%)',
            color: nodePalette.main,
            border: `2px solid ${nodePalette.main}`,
            boxShadow: `0 0 20px ${nodePalette.main}66, 0 4px 12px hsla(0,0%,0%,0.4)`,
            whiteSpace: 'nowrap',
          }}
        >
          {lang === 'en' ? 'START' : 'СТАРТ'}
          <span
            className="absolute left-1/2 -bottom-[7px] -translate-x-1/2 w-3 h-3 rotate-45"
            style={{
              background: 'hsl(228, 24%, 10%)',
              borderRight: `2px solid ${nodePalette.main}`,
              borderBottom: `2px solid ${nodePalette.main}`,
            }}
          />
        </div>
      )}

      {/* Button + ring wrapper */}
      <div className="relative">
        {/* Dark groove ring around current lesson */}
        {isCurrent && !locked && (
          <svg
            className="absolute pointer-events-none"
            viewBox="0 0 100 100"
            style={{
              width: 'calc(100% + 18px)',
              height: 'calc(100% + 18px)',
              top: '-9px',
              left: '-9px',
            }}
          >
            <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(228, 30%, 8%)" strokeWidth="5" />
          </svg>
        )}

        {/* The 3D button */}
        <button
          onClick={onClick}
          disabled={locked}
          className="relative w-24 h-24 md:w-24 md:h-24 rounded-full flex items-center justify-center transition-transform active:translate-y-[3px]"
          style={{
            background: `radial-gradient(circle at 35% 30%, ${nodePalette.soft} 0%, ${nodePalette.main} 60%)`,
            boxShadow: locked
              ? `inset 0 -5px 0 ${LOCKED.deep}, 0 4px 10px hsla(0,0%,0%,0.4)`
              : `inset 0 -6px 0 ${nodePalette.deep}, 0 6px 14px hsla(0,0%,0%,0.45)`,
            opacity: locked ? 0.65 : 1,
            cursor: locked ? 'not-allowed' : 'pointer',
          }}
        >
          {/* Lesson icon */}
          <span
            className="text-3xl md:text-3xl select-none"
            style={{
              filter: locked
                ? 'grayscale(0.8) opacity(0.85)'
                : 'drop-shadow(0 1px 2px hsla(0,0%,0%,0.35))',
            }}
          >
            {locked ? (proLocked ? '✦' : '🔒') : completed ? '⭐' : lesson.icon}
          </span>

          {/* Done check on completed lessons */}
          {completed && !locked && (
            <span
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-extrabold"
              style={{
                background: 'hsl(var(--c-green))',
                color: '#fff',
                boxShadow: '0 2px 6px hsla(0,0%,0%,0.5)',
                border: '2px solid hsl(228, 24%, 10%)',
              }}
            >
              ✓
            </span>
          )}
        </button>
      </div>

      {/* Lesson title */}
      <p
        className="mt-2 text-xs md:text-sm font-semibold text-center max-w-[150px] leading-tight"
        style={{
          color: locked ? 'hsl(var(--c-fg-subtle))' : completed ? 'hsl(var(--c-fg-muted))' : 'hsl(var(--c-fg))',
        }}
      >
        {lesson.title[lang]}
      </p>
      {/* XP reward */}
      <p
        className="text-[10px] md:text-xs mt-0.5 mono font-semibold"
        style={{ color: locked ? 'hsl(var(--c-fg-subtle))' : nodePalette.main }}
      >
        +{lesson.xpReward} XP
      </p>
    </div>
  );
}
