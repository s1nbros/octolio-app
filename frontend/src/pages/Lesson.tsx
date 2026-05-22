import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ExerciseRenderer } from '../components/ExerciseRenderer';
import type { Lesson as LessonType } from '../types';

type LessonState = 'loading' | 'intro' | 'exercise' | 'complete' | 'error' | 'no_energy';

export function Lesson() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const { token, updateUser, user, refreshUser } = useAuth();
  const { ui, lang } = useLang();
  const navigate = useNavigate();

  const [lesson, setLesson] = useState<LessonType | null>(null);
  const [state, setState] = useState<LessonState>('loading');
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [hearts, setHearts] = useState(3);
  const [xpEarned, setXpEarned] = useState(0);
  const [totalXpAfter, setTotalXpAfter] = useState(0);
  const [alreadyCompleted, setAlreadyCompleted] = useState(false);
  const [xpPopVisible, setXpPopVisible] = useState(false);
  const [lastXp, setLastXp] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [energyRefillAt, setEnergyRefillAt] = useState<string | null>(null);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  useEffect(() => {
    if (!token || !moduleId || !lessonId) return;
    fetch(`/api/modules/${moduleId}/lessons/${lessonId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) { setErrorMsg(data.error); setState('error'); return; }
        setLesson(data.lesson);
        setAlreadyCompleted(data.completed);
        setState('intro');
      })
      .catch(() => { setErrorMsg('Failed to load lesson'); setState('error'); });
  }, [token, moduleId, lessonId]);

  const handleAnswer = (correct: boolean, xp: number) => {
    if (correct) {
      setXpEarned((prev) => prev + xp);
      if (xp > 0) {
        setLastXp(xp);
        setXpPopVisible(true);
        setTimeout(() => setXpPopVisible(false), 1200);
      }
    } else {
      setHearts((h) => Math.max(0, h - 1));
      // Record miss for spaced repetition (fire-and-forget — don't block UX).
      const ex = lesson?.exercises[currentExerciseIndex];
      if (ex && ex.type !== 'theory' && token && moduleId && lessonId) {
        fetch('/api/review/missed', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
          body: JSON.stringify({ moduleId, lessonId, exerciseId: ex.id }),
        }).catch(() => {});
      }
    }

    const next = currentExerciseIndex + 1;
    if (!lesson) return;

    // Out of hearts — restart from beginning
    if (!correct && hearts - 1 <= 0) {
      setTimeout(() => {
        setCurrentExerciseIndex(0);
        setHearts(3);
        setXpEarned(0);
        setState('exercise');
      }, 800);
      return;
    }

    if (next >= lesson.exercises.length) {
      // All exercises done
      completeLesson(xpEarned + xp);
    } else {
      setTimeout(() => {
        setCurrentExerciseIndex(next);
        // Re-render exercise component with new key
      }, correct ? 1000 : 1400);
    }
  };

  const completeLesson = async (finalXp: number) => {
    if (!token || !moduleId || !lessonId) return;

    try {
      const res = await fetch('/api/progress/complete', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lessonId, moduleId }),
      });
      const data = await res.json();
      setTotalXpAfter(data.totalXp);
      updateUser({
        xp: data.totalXp,
        streak: data.streak,
        ...(typeof data.streak_freezes === 'number' ? { streak_freezes: data.streak_freezes } : {}),
      });
      // Refresh full user to sync energy from server
      refreshUser().catch(() => {});
    } catch {
      setTotalXpAfter((user?.xp ?? 0) + finalXp);
    }
    setState('complete');
  };

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(239, 84%, 67%)', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <p style={{ color: 'hsl(0, 72%, 65%)' }}>⚠ {errorMsg}</p>
        <Link to="/modules"><button className="btn-ghost">{ui.back_to_modules}</button></Link>
      </div>
    );
  }

  if (!lesson) return null;

  // Intro screen
  if (state === 'intro') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingOrbs />
        <div className="relative max-w-lg w-full animate-scale-in" style={{ zIndex: 1 }}>
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-6xl mb-4">{lesson.icon}</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {lesson.title[lang]}
            </h1>
            <p className="mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lesson.description[lang]}
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--c-primary))' }}>
                  {lesson.exercises.length}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {lang === 'en' ? 'exercises' : 'упражнения'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                  +{lesson.xpReward}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--c-orange))' }}>
                  {'❤'.repeat(3)}
                </div>
                <div className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {lang === 'en' ? 'lives' : 'животи'}
                </div>
              </div>
            </div>

            {alreadyCompleted && (
              <p className="text-sm mb-4 px-4 py-2 rounded-lg"
                style={{ background: 'hsl(var(--c-green)/0.1)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.2)' }}>
                ✓ {lang === 'en' ? 'You already completed this lesson!' : 'Вече завърши този урок!'} {lang === 'en' ? 'Practice again?' : 'Практикувай отново?'}
              </p>
            )}

            <button className="btn-primary w-full" onClick={async () => {
              if (!token || !moduleId || !lessonId) return;
              try {
                const res = await fetch('/api/progress/energy/use', {
                  method: 'POST',
                  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
                  body: JSON.stringify({ lessonId, moduleId }),
                });
                const data = await res.json();
                if (res.status === 402 && data.error === 'no_energy') {
                  setEnergyRefillAt(data.refillAt);
                  setState('no_energy');
                  return;
                }
                if (res.ok && typeof data.energy === 'number') {
                  updateUser({ energy: data.energy });
                }
              } catch { /* continue anyway */ }
              setState('exercise');
            }}>
              {lang === 'en' ? 'Start Lesson' : 'Започни урока'} →
            </button>
            <Link to="/modules">
              <button className="btn-ghost w-full mt-3">{ui.back_to_modules}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // No energy screen
  if (state === 'no_energy') {
    const minsUntilNext = energyRefillAt
      ? Math.max(1, Math.ceil((900000 - ((Date.now() - new Date(energyRefillAt).getTime()) % 900000)) / 60000))
      : 15;
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingOrbs />
        <div className="relative max-w-sm w-full animate-scale-in" style={{ zIndex: 1 }}>
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">⚡</div>
            <h2 className="font-black text-2xl mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Out of Energy' : 'Нямаш енергия'}
            </h2>
            <p className="text-sm mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en'
                ? `Each lesson costs 3 energy. Energy refills +1 every 15 minutes — fully restored in 3 hours. Next +1 in ~${minsUntilNext}min. Or upgrade to Pro for unlimited energy.`
                : `Всеки урок струва 3 енергия. Енергията се възстановява с +1 на всеки 15 минути — напълно за 3 часа. Следващо +1 след ~${minsUntilNext}мин. Или надгради до Pro за неограничена енергия.`}
            </p>
            <p className="mono text-sm font-semibold mb-6" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? `Current energy: ${user?.energy ?? 0}/12` : `Текуща енергия: ${user?.energy ?? 0}/12`}
            </p>
            <button className="btn-primary w-full mb-3" onClick={async () => {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>
              ✦ {lang === 'en' ? 'Upgrade to Pro' : 'Надгради до Pro'}
            </button>
            <Link to="/modules">
              <button className="btn-ghost w-full">{ui.back_to_modules}</button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Exercise screen
  if (state === 'exercise' && lesson.exercises[currentExerciseIndex]) {
    const exercise = lesson.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex) / lesson.exercises.length) * 100;

    return (
      <div className="relative min-h-screen">
        <FloatingOrbs />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 md:px-8 py-8 md:py-10" style={{ zIndex: 1 }}>
          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
            {/* Back — opens exit confirm modal */}
            <button
              className="text-sm p-2 rounded-lg transition-all"
              style={{ color: 'hsl(var(--c-fg-muted))', background: 'var(--c-glass)' }}
              onClick={() => setShowExitConfirm(true)}
            >
              ✕
            </button>

            {/* Progress bar */}
            <div className="flex-1 progress-bar-track" style={{ height: '10px' }}>
              <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
            </div>

            {/* Hearts */}
            <div className="flex gap-0.5">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-xl transition-all ${i >= hearts ? 'grayscale opacity-30' : ''}`}>
                  ❤️
                </span>
              ))}
            </div>

            {/* XP */}
            <div className="px-3 py-1 rounded-full text-sm font-semibold relative"
              style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
              {xpEarned} XP
              {xpPopVisible && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold animate-xp-pop whitespace-nowrap"
                  style={{ color: 'hsl(var(--c-green))' }}>
                  +{lastXp} XP!
                </span>
              )}
            </div>
          </div>

          {/* Exercise card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8 md:p-10">
            <ExerciseRenderer
              key={`${currentExerciseIndex}-${exercise.id}`}
              exercise={exercise}
              onAnswer={handleAnswer}
              questionNumber={currentExerciseIndex + 1}
              totalQuestions={lesson.exercises.length}
            />
          </div>
        </div>

        {/* Exit confirmation modal */}
        {showExitConfirm && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
            style={{ background: 'hsla(220,60%,5%,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowExitConfirm(false)}
          >
            <div
              className="relative max-w-sm w-full glass-card rounded-3xl p-6 sm:p-7 animate-scale-in text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-3">⚠️</div>
              <h2 className="text-lg sm:text-xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
                {ui.exit_confirm_title}
              </h2>
              <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {ui.exit_confirm_body}
              </p>
              <div className="flex flex-col-reverse sm:flex-row gap-2.5">
                <button
                  className="btn-ghost flex-1 py-2.5"
                  onClick={() => navigate('/modules')}
                >
                  {ui.exit_confirm_leave}
                </button>
                <button
                  className="btn-primary flex-1 py-2.5"
                  onClick={() => setShowExitConfirm(false)}
                >
                  {ui.exit_confirm_stay}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Complete screen
  if (state === 'complete') {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingOrbs />
        <div className="relative max-w-lg w-full animate-scale-in" style={{ zIndex: 1 }}>
          <div className="glass-card rounded-3xl p-8 text-center"
            style={{ border: '1px solid hsl(var(--c-green)/0.3)' }}>
            {/* Celebration */}
            <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {ui.lesson_complete}
            </h1>
            <p className="mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lesson.title[lang]}
            </p>

            {/* XP earned */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-8"
              style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.25)' }}>
              <span className="text-3xl">⚡</span>
              <div className="text-left">
                <p className="text-xs" style={{ color: 'hsl(var(--c-green))' }}>{ui.xp_earned}</p>
                <p className="text-3xl font-black" style={{ color: 'hsl(var(--c-green))' }}>
                  +{lesson.xpReward} XP
                </p>
              </div>
            </div>

            {/* Hearts remaining */}
            <div className="flex justify-center gap-1 mb-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className={`text-2xl ${i >= hearts ? 'grayscale opacity-30' : ''}`}>❤️</span>
              ))}
            </div>

            <div className="space-y-3">
              <Link to="/modules">
                <button className="btn-green w-full">
                  {ui.back_to_modules} →
                </button>
              </Link>
              <button
                className="btn-ghost w-full"
                onClick={() => {
                  setCurrentExerciseIndex(0);
                  setHearts(3);
                  setXpEarned(0);
                  setState('exercise');
                }}
              >
                {lang === 'en' ? '↻ Practice again' : '↻ Практикувай отново'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
