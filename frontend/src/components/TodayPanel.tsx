import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { CoinIcon } from './CoinIcon';

interface LocalizedText { en: string; bg: string }

interface WorkoutToday {
  alreadyDone: boolean;
  rewardXp: number;
  rewardCoins: number;
  question: { id: string; question: LocalizedText; options: LocalizedText[] };
}

interface AnswerResult {
  alreadyDone: boolean;
  correct: boolean;
  correctIndex: number;
  explanation: LocalizedText;
  xpAwarded: number;
  coinsAwarded: number;
  totalXp?: number;
  coins?: number;
  streak?: number;
}

/** Map the chosen daily commitment (minutes) to a lesson-count target. */
function goalTarget(dailyGoalMin?: number | null): number {
  if (dailyGoalMin === 3) return 1;
  if (dailyGoalMin === 10) return 3;
  return 2; // 5 min default
}

/**
 * "Today" panel — the daily-return hub at the top of the dashboard.
 *   • Daily goal progress (driven by the user's onboarding daily_goal_min)
 *   • Daily Money Workout: a 60-second question that keeps the streak alive
 */
export function TodayPanel() {
  const { token, user, updateUser } = useAuth();
  const { lang } = useLang();

  const [workout, setWorkout] = useState<WorkoutToday | null>(null);
  const [lessonsToday, setLessonsToday] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);

  // Load workout status + lessons completed today.
  useEffect(() => {
    if (!token) return;
    fetch('/api/workout/today', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setWorkout(d))
      .catch(() => {});

    const today = new Date().toISOString().split('T')[0];
    fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const n = (d.progress ?? []).filter((p: { completed_at?: string }) =>
          p.completed_at?.startsWith(today)
        ).length;
        setLessonsToday(n);
      })
      .catch(() => {});
  }, [token]);

  if (!user) return null;

  const target = goalTarget(user.daily_goal_min);
  const workoutDone = workout?.alreadyDone ?? false;
  const progress = Math.min(lessonsToday + (workoutDone ? 1 : 0), target);
  const goalMet = progress >= target;

  const handleAnswered = (res: AnswerResult) => {
    // Mark workout done locally + update wallet/streak from the server response.
    setWorkout((w) => (w ? { ...w, alreadyDone: true } : w));
    if (!res.alreadyDone) {
      updateUser({
        ...(typeof res.totalXp === 'number' ? { xp: res.totalXp } : {}),
        ...(typeof res.coins === 'number' ? { coins: res.coins } : {}),
        ...(typeof res.streak === 'number' ? { streak: res.streak } : {}),
      });
    }
  };

  return (
    <div className="mb-6 animate-fade-up">
      {/* Header + daily goal */}
      <div className="flex items-center justify-between gap-3 mb-3 px-1">
        <p className="text-[11px] font-bold uppercase tracking-widest" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Today' : 'Днес'}
        </p>
        <div className="flex items-center gap-2">
          {goalMet ? (
            <span className="text-xs font-bold flex items-center gap-1" style={{ color: 'hsl(var(--c-green))' }}>
              🎯 {lang === 'en' ? 'Daily goal done!' : 'Дневна цел изпълнена!'}
            </span>
          ) : (
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Daily goal' : 'Дневна цел'}: {progress}/{target}
            </span>
          )}
          <div className="flex items-center gap-1">
            {Array.from({ length: target }).map((_, i) => (
              <span
                key={i}
                className="w-2 h-2 rounded-full transition-all"
                style={{ background: i < progress ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg)/0.15)' }}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Daily Money Workout card */}
      <div
        className="rounded-2xl p-4 sm:p-5 flex items-center gap-4"
        style={{
          background: workoutDone ? 'hsl(var(--c-fg)/0.04)' : 'linear-gradient(135deg, hsl(45, 95%, 55%, 0.12), hsl(var(--c-orange)/0.08))',
          border: workoutDone ? '1px solid hsl(var(--c-fg)/0.08)' : '1px solid hsl(45, 95%, 55%, 0.3)',
        }}
      >
        <div
          className="flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ background: 'hsl(var(--c-bg-elevated, var(--c-bg)))', border: '1px solid hsl(var(--c-fg)/0.08)' }}
        >
          {workoutDone ? '✅' : '🧠'}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm sm:text-base" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Daily Money Workout' : 'Дневна финансова тренировка'}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {workoutDone
              ? (lang === 'en' ? 'Done today — back tomorrow! Streak protected 🔥' : 'Готово за днес — пак утре! Поредицата е защитена 🔥')
              : (lang === 'en' ? `60 seconds · +${workout?.rewardXp ?? 15} XP · keeps your streak` : `60 секунди · +${workout?.rewardXp ?? 15} XP · пази поредицата`)}
          </p>
        </div>
        {!workoutDone && workout && (
          <button
            onClick={() => setModalOpen(true)}
            className="btn-green flex-shrink-0 px-5 py-2 text-sm font-bold"
          >
            {lang === 'en' ? 'Start' : 'Старт'}
          </button>
        )}
      </div>

      {modalOpen && workout && (
        <WorkoutModal
          workout={workout}
          lang={lang}
          token={token}
          onClose={() => setModalOpen(false)}
          onAnswered={handleAnswered}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Workout question modal — portal-rendered.
 * ─────────────────────────────────────────────────────────── */
function WorkoutModal({
  workout,
  lang,
  token,
  onClose,
  onAnswered,
}: {
  workout: WorkoutToday;
  lang: 'en' | 'bg';
  token: string | null;
  onClose: () => void;
  onAnswered: (res: AnswerResult) => void;
}) {
  const [picked, setPicked] = useState<number | null>(null);
  const [result, setResult] = useState<AnswerResult | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, []);

  const submit = async (choice: number) => {
    if (picked !== null || submitting) return;
    setPicked(choice);
    setSubmitting(true);
    try {
      const res = await fetch('/api/workout/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ choice }),
      });
      const data = (await res.json()) as AnswerResult;
      setResult(data);
      onAnswered(data);
    } catch {
      // Re-enable on failure
      setPicked(null);
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4"
      style={{ background: 'hsl(0, 0%, 0%, 0.7)', backdropFilter: 'blur(10px)' }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-7 relative animate-scale-in"
        style={{ background: 'hsl(228, 24%, 10%)', border: '1px solid hsl(45, 95%, 55%, 0.3)', boxShadow: '0 24px 60px -10px hsl(0,0%,0%,0.5)' }}
      >
        <div className="text-center mb-5">
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(45, 95%, 65%)' }}>
            🧠 {lang === 'en' ? 'Daily Workout' : 'Дневна тренировка'}
          </p>
          <h2 className="text-lg sm:text-xl font-extrabold leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>
            {workout.question.question[lang]}
          </h2>
        </div>

        <div className="space-y-2.5">
          {workout.question.options.map((opt, oi) => {
            const revealed = result !== null;
            const isCorrect = revealed && oi === result.correctIndex;
            const isWrongPick = revealed && oi === picked && !result.correct;
            let border = '1px solid var(--c-border)';
            let bg = 'var(--c-glass)';
            if (isCorrect) { border = '2px solid hsl(var(--c-green))'; bg = 'hsl(var(--c-green)/0.12)'; }
            else if (isWrongPick) { border = '2px solid hsl(var(--c-red))'; bg = 'hsl(var(--c-red)/0.10)'; }
            return (
              <button
                key={oi}
                disabled={revealed || submitting}
                onClick={() => submit(oi)}
                className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2"
                style={{ border, background: bg, color: 'hsl(var(--c-fg))' }}
              >
                <span>{opt[lang]}</span>
                {isCorrect && <span className="ml-auto">✓</span>}
                {isWrongPick && <span className="ml-auto">✗</span>}
              </button>
            );
          })}
        </div>

        {/* Result */}
        {result && (
          <div className="mt-5 animate-fade-up">
            <div
              className="rounded-xl p-4 mb-4 text-sm leading-relaxed"
              style={{
                background: result.correct ? 'hsl(var(--c-green)/0.10)' : 'hsl(var(--c-fg)/0.05)',
                border: `1px solid ${result.correct ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-fg)/0.1)'}`,
                color: 'hsl(var(--c-fg-muted))',
              }}
            >
              <p className="font-bold mb-1" style={{ color: result.correct ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg))' }}>
                {result.correct
                  ? (lang === 'en' ? '✓ Correct!' : '✓ Правилно!')
                  : (lang === 'en' ? 'Good try!' : 'Добър опит!')}
              </p>
              {result.explanation[lang]}
            </div>

            {/* Reward row */}
            {!result.alreadyDone && (result.xpAwarded > 0 || result.coinsAwarded > 0) && (
              <div className="flex items-center justify-center gap-4 mb-4">
                {result.xpAwarded > 0 && (
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: 'hsl(45, 95%, 60%)' }}>
                    ⚡ +{result.xpAwarded} XP
                  </span>
                )}
                {result.coinsAwarded > 0 && (
                  <span className="flex items-center gap-1.5 font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
                    <CoinIcon size={18} /> +{result.coinsAwarded}
                  </span>
                )}
              </div>
            )}

            <button onClick={onClose} className="btn-green w-full py-3 font-bold">
              {lang === 'en' ? '✓ Claim & close' : '✓ Вземи и затвори'}
            </button>
          </div>
        )}

        {!result && (
          <button onClick={onClose} className="w-full mt-4 text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Maybe later' : 'Може би по-късно'}
          </button>
        )}
      </div>
    </div>,
    document.body,
  );
}
