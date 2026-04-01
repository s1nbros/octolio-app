import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ExerciseRenderer } from '../components/ExerciseRenderer';
import type { Lesson as LessonType } from '../types';

type LessonState = 'loading' | 'intro' | 'exercise' | 'complete' | 'error';

export function Lesson() {
  const { moduleId, lessonId } = useParams<{ moduleId: string; lessonId: string }>();
  const { token, updateUser, user } = useAuth();
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
      updateUser({ xp: data.totalXp, streak: data.streak });
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
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {lesson.title[lang]}
            </h1>
            <p className="mb-6" style={{ color: 'hsl(215, 20%, 60%)' }}>
              {lesson.description[lang]}
            </p>

            <div className="flex items-center justify-center gap-6 mb-8">
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(239, 84%, 67%)' }}>
                  {lesson.exercises.length}
                </div>
                <div className="text-xs" style={{ color: 'hsl(215, 20%, 55%)' }}>
                  {lang === 'en' ? 'exercises' : 'упражнения'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(160, 55%, 55%)' }}>
                  +{lesson.xpReward}
                </div>
                <div className="text-xs" style={{ color: 'hsl(215, 20%, 55%)' }}>XP</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(28, 85%, 60%)' }}>
                  {'❤'.repeat(3)}
                </div>
                <div className="text-xs" style={{ color: 'hsl(215, 20%, 55%)' }}>
                  {lang === 'en' ? 'lives' : 'животи'}
                </div>
              </div>
            </div>

            {alreadyCompleted && (
              <p className="text-sm mb-4 px-4 py-2 rounded-lg"
                style={{ background: 'hsl(160, 55%, 55%, 0.1)', color: 'hsl(160, 55%, 65%)', border: '1px solid hsl(160, 55%, 55%, 0.2)' }}>
                ✓ {lang === 'en' ? 'You already completed this lesson!' : 'Вече завърши този урок!'} {lang === 'en' ? 'Practice again?' : 'Практикувай отново?'}
              </p>
            )}

            <button className="btn-primary w-full" onClick={() => setState('exercise')}>
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

  // Exercise screen
  if (state === 'exercise' && lesson.exercises[currentExerciseIndex]) {
    const exercise = lesson.exercises[currentExerciseIndex];
    const progress = ((currentExerciseIndex) / lesson.exercises.length) * 100;

    return (
      <div className="relative min-h-screen">
        <FloatingOrbs />

        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 py-8" style={{ zIndex: 1 }}>
          {/* Top bar */}
          <div className="flex items-center gap-4 mb-8">
            {/* Back */}
            <button
              className="text-sm p-2 rounded-lg transition-all"
              style={{ color: 'hsl(215, 20%, 55%)', background: 'rgba(255,255,255,0.04)' }}
              onClick={() => navigate('/modules')}
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
              style={{ background: 'hsl(239, 84%, 67%, 0.12)', color: 'hsl(239, 84%, 72%)', border: '1px solid hsl(239,84%,67%,0.2)' }}>
              ⚡ {xpEarned}
              {xpPopVisible && (
                <span className="absolute -top-8 left-1/2 -translate-x-1/2 text-sm font-bold animate-xp-pop whitespace-nowrap"
                  style={{ color: 'hsl(160, 55%, 60%)' }}>
                  +{lastXp} XP!
                </span>
              )}
            </div>
          </div>

          {/* Exercise card */}
          <div className="glass-card rounded-3xl p-6 sm:p-8">
            <ExerciseRenderer
              key={`${currentExerciseIndex}-${exercise.id}`}
              exercise={exercise}
              onAnswer={handleAnswer}
              questionNumber={currentExerciseIndex + 1}
              totalQuestions={lesson.exercises.length}
            />
          </div>
        </div>
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
            style={{ border: '1px solid hsl(160, 55%, 55%, 0.3)' }}>
            {/* Celebration */}
            <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'hsl(210, 40%, 96%)' }}>
              {ui.lesson_complete}
            </h1>
            <p className="mb-6" style={{ color: 'hsl(215, 20%, 60%)' }}>
              {lesson.title[lang]}
            </p>

            {/* XP earned */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-8"
              style={{ background: 'hsl(160, 55%, 55%, 0.1)', border: '1px solid hsl(160, 55%, 55%, 0.25)' }}>
              <span className="text-3xl">⚡</span>
              <div className="text-left">
                <p className="text-xs" style={{ color: 'hsl(160, 55%, 60%)' }}>{ui.xp_earned}</p>
                <p className="text-3xl font-black" style={{ color: 'hsl(160, 55%, 65%)' }}>
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
