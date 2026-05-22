import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { ExerciseRenderer } from '../components/ExerciseRenderer';
import type { Exercise } from '../types';

interface ReviewCard {
  id: number;
  moduleId: string;
  lessonId: string;
  exerciseId: string;
  boxLevel: number;
  timesReviewed: number;
  timesCorrect: number;
  exercise: Exercise;
}

interface ReviewStats {
  total: number;
  due: number;
  mastered: number;
}

type State = 'loading' | 'empty' | 'reviewing' | 'done';

export function Review() {
  const { token } = useAuth();
  const { lang } = useLang();

  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [stats, setStats] = useState<ReviewStats>({ total: 0, due: 0, mastered: 0 });
  const [idx, setIdx] = useState(0);
  const [state, setState] = useState<State>('loading');
  const [reviewedCount, setReviewedCount] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    Promise.all([
      fetch('/api/review/due', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch('/api/review/stats', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ])
      .then(([dueData, statsData]) => {
        setStats(statsData);
        const due: ReviewCard[] = dueData.cards ?? [];
        if (due.length === 0) {
          setState('empty');
        } else {
          setCards(due);
          setState('reviewing');
        }
      })
      .catch(() => setState('empty'));
  }, [token]);

  const handleAnswer = async (correct: boolean) => {
    const card = cards[idx];
    if (!card) return;

    // Submit to backend
    try {
      await fetch('/api/review/done', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ cardId: card.id, correct }),
      });
    } catch {
      // best-effort
    }

    setReviewedCount(c => c + 1);
    if (correct) setCorrectCount(c => c + 1);

    if (idx + 1 >= cards.length) {
      setState('done');
    } else {
      setIdx(i => i + 1);
    }
  };

  if (state === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (state === 'empty') {
    return (
      <div className="relative pb-24 sm:pb-12 overflow-hidden">
        <div className="md:hidden"><FloatingOrbs /></div>
        <div className="relative max-w-md mx-auto px-4 sm:px-6 py-8 text-center" style={{ zIndex: 1 }}>
          <div className="text-6xl mb-4">🌱</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Nothing to review yet' : 'Няма какво да преглеждаш още'}
          </h1>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Exercises you get wrong in lessons show up here on a spaced schedule. Get a few wrong, come back tomorrow.'
              : 'Грешните отговори се появяват тук по разпределена програма. Сбъркай няколко, върни се утре.'}
          </p>
          {stats.total > 0 && (
            <p className="text-xs mb-6 mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en'
                ? `${stats.total} tracked · ${stats.mastered} mastered`
                : `${stats.total} проследени · ${stats.mastered} овладени`}
            </p>
          )}
          <Link to="/modules" className="btn-primary inline-block">
            {lang === 'en' ? 'Back to lessons' : 'Обратно към уроците'}
          </Link>
        </div>
      </div>
    );
  }

  if (state === 'done') {
    const accuracy = reviewedCount > 0 ? Math.round((correctCount / reviewedCount) * 100) : 0;
    return (
      <div className="relative pb-24 sm:pb-12 overflow-hidden">
        <div className="md:hidden"><FloatingOrbs /></div>
        <div className="relative max-w-md mx-auto px-4 sm:px-6 py-8 text-center" style={{ zIndex: 1 }}>
          <div className="text-6xl mb-4">🎯</div>
          <h1 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Review complete!' : 'Прегледът е завършен!'}
          </h1>
          <p className="text-base mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? `${correctCount} / ${reviewedCount} correct (${accuracy}%)`
              : `${correctCount} / ${reviewedCount} правилни (${accuracy}%)`}
          </p>
          <Link to="/modules" className="btn-primary inline-block">
            {lang === 'en' ? 'Done' : 'Готово'}
          </Link>
        </div>
      </div>
    );
  }

  // Reviewing
  const card = cards[idx];
  const totalDue = cards.length;
  const progressPct = ((idx) / totalDue) * 100;

  return (
    <div className="relative pb-24 sm:pb-12 overflow-hidden">
      <div className="md:hidden"><FloatingOrbs /></div>
      <div className="relative max-w-md md:max-w-2xl mx-auto px-4 sm:px-6 md:px-0 py-2 sm:py-4 md:py-2" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl">🔁</span>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Review' : 'Преглед'} · {idx + 1} / {totalDue}
            </p>
            <div className="h-1.5 rounded-full overflow-hidden mt-1" style={{ background: 'hsl(228, 12%, 18%)' }}>
              <div className="h-full transition-all"
                style={{ width: `${progressPct}%`, background: 'hsl(var(--c-primary))' }} />
            </div>
          </div>
          <span className="text-xs mono font-bold px-2 py-1 rounded-full"
            style={{
              background: 'hsl(var(--c-orange)/0.12)',
              color: 'hsl(var(--c-orange))',
              border: '1px solid hsl(var(--c-orange)/0.25)',
            }}>
            {lang === 'en' ? 'Box' : 'Box'} {card.boxLevel}/5
          </span>
        </div>

        {/* Exercise */}
        <div key={card.id} className="rounded-3xl p-4 md:p-6"
          style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
          <ExerciseRenderer
            exercise={card.exercise}
            onAnswer={(correct) => handleAnswer(correct)}
            questionNumber={idx + 1}
            totalQuestions={totalDue}
          />
        </div>
      </div>
    </div>
  );
}
