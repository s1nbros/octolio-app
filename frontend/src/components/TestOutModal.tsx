import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import type { LocalizedText } from '../types';

interface Question { exerciseId: string; prompt: LocalizedText; options: LocalizedText[]; }
interface Quiz {
  eligible: boolean;
  reason?: string;
  title?: LocalizedText;
  total?: number;
  passNeeded?: number;
  rewardXp?: number;
  questions?: Question[];
}
interface Result { passed: boolean; score: number; total: number; passNeeded: number; xpAwarded?: number; totalXp?: number; streak?: number; }

/**
 * "Test out of a module" — a short quiz drawn from the module's own exercises.
 * Pass → every lesson in the module is marked complete (skip the basics) + a
 * flat XP bonus. Grading is server-side.
 */
export function TestOutModal({ moduleId, onClose, onPassed }: {
  moduleId: string | null;
  onClose: () => void;
  onPassed: () => void;
}) {
  const { token, updateUser } = useAuth();
  const { lang } = useLang();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [phase, setPhase] = useState<'loading' | 'intro' | 'quiz' | 'result'>('loading');
  const [idx, setIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (!moduleId || !token) return;
    setPhase('loading'); setQuiz(null); setIdx(0); setAnswers({}); setResult(null);
    fetch(`/api/testout/${moduleId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d: Quiz) => { setQuiz(d); setPhase(d.eligible ? 'intro' : 'result'); })
      .catch(() => { setQuiz({ eligible: false, reason: 'error' }); setPhase('result'); });
  }, [moduleId, token]);

  if (!moduleId) return null;

  const questions = quiz?.questions ?? [];
  const q = questions[idx];

  const choose = (optIndex: number) => {
    if (!q) return;
    setAnswers((a) => ({ ...a, [q.exerciseId]: optIndex }));
  };

  const next = async () => {
    if (idx < questions.length - 1) { setIdx(idx + 1); return; }
    // Last question → submit
    if (!token || !moduleId) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/testout/${moduleId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers }),
      });
      const data = (await res.json()) as Result;
      setResult(data);
      setPhase('result');
      if (data.passed) {
        if (typeof data.totalXp === 'number') updateUser({ xp: data.totalXp });
        if (typeof data.streak === 'number') updateUser({ streak: data.streak });
      }
    } catch {
      setResult({ passed: false, score: 0, total: questions.length, passNeeded: quiz?.passNeeded ?? 0 });
      setPhase('result');
    }
    setSubmitting(false);
  };

  const close = () => {
    const passed = result?.passed;
    onClose();
    if (passed) onPassed();
  };

  const ineligibleText = (reason?: string) =>
    reason === 'completed' ? (lang === 'en' ? "You've already completed this module." : 'Вече завърши този модул.')
    : reason === 'no_quiz' ? (lang === 'en' ? 'This module has no quiz to test out of.' : 'Този модул няма тест за прескачане.')
    : reason === 'locked' ? (lang === 'en' ? 'Finish the earlier modules first.' : 'Първо завърши предишните модули.')
    : reason === 'pro_required' ? (lang === 'en' ? 'This module is Pro-only.' : 'Този модул е само за Pro.')
    : (lang === 'en' ? 'Test-out is not available here.' : 'Прескачането не е налично тук.');

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'hsla(220,60%,5%,0.75)', backdropFilter: 'blur(8px)' }}
      onClick={close}>
      <div className="relative max-w-md w-full glass-card rounded-3xl p-6 sm:p-7 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'hsl(228, 24%, 11%)', border: '1px solid var(--c-border)' }}>

        {/* Close */}
        <button onClick={close} aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))' }}>✕</button>

        {phase === 'loading' && (
          <div className="py-10 flex justify-center">
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
              style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
          </div>
        )}

        {/* Intro */}
        {phase === 'intro' && quiz?.eligible && (
          <div className="text-center">
            <div className="text-5xl mb-3">⚡</div>
            <h2 className="font-black text-xl mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Test out' : 'Прескочи с тест'}
            </h2>
            <p className="text-sm mb-5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en'
                ? `Answer ${quiz.total} quick questions from ${quiz.title?.[lang]}. Get ${quiz.passNeeded}+ right to skip the whole module and earn +${quiz.rewardXp} XP.`
                : `Отговори на ${quiz.total} бързи въпроса от ${quiz.title?.[lang]}. Дай ${quiz.passNeeded}+ верни, за да прескочиш целия модул и спечелиш +${quiz.rewardXp} XP.`}
            </p>
            <button className="btn-primary w-full" onClick={() => setPhase('quiz')}>
              {lang === 'en' ? 'Start test →' : 'Започни теста →'}
            </button>
          </div>
        )}

        {/* Quiz */}
        {phase === 'quiz' && q && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))' }}>
                {idx + 1} / {questions.length}
              </span>
            </div>
            <div className="progress-bar-track mb-4" style={{ height: 8 }}>
              <div className="progress-bar-fill" style={{ width: `${(idx / questions.length) * 100}%` }} />
            </div>

            <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
              {q.prompt[lang]}
            </p>
            <div className="space-y-2.5 mb-5">
              {q.options.map((opt, i) => {
                const selected = answers[q.exerciseId] === i;
                return (
                  <button key={i} onClick={() => choose(i)}
                    className="w-full text-left rounded-xl px-4 py-3 text-sm font-medium transition-all"
                    style={{
                      background: selected ? 'hsl(var(--c-primary)/0.15)' : 'var(--c-glass)',
                      border: `1.5px solid ${selected ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                      color: 'hsl(var(--c-fg))',
                    }}>
                    {opt[lang]}
                  </button>
                );
              })}
            </div>
            <button className="btn-primary w-full"
              disabled={answers[q.exerciseId] === undefined || submitting}
              onClick={next}>
              {submitting
                ? '…'
                : idx < questions.length - 1
                  ? (lang === 'en' ? 'Next →' : 'Напред →')
                  : (lang === 'en' ? 'Submit' : 'Изпрати')}
            </button>
          </div>
        )}

        {/* Result */}
        {phase === 'result' && (
          <div className="text-center">
            {!quiz?.eligible ? (
              <>
                <div className="text-4xl mb-3">🚫</div>
                <p className="text-sm mb-5" style={{ color: 'hsl(var(--c-fg-muted))' }}>{ineligibleText(quiz?.reason)}</p>
                <button className="btn-ghost w-full" onClick={close}>{lang === 'en' ? 'Close' : 'Затвори'}</button>
              </>
            ) : result?.passed ? (
              <>
                <div className="text-5xl mb-3">🎉</div>
                <h2 className="font-black text-xl mb-1" style={{ color: 'hsl(var(--c-green))' }}>
                  {lang === 'en' ? 'Tested out!' : 'Прескочи успешно!'}
                </h2>
                <p className="text-sm mb-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {lang === 'en' ? `You scored ${result.score}/${result.total}.` : `Резултат: ${result.score}/${result.total}.`}
                </p>
                <p className="text-sm mb-5 font-semibold" style={{ color: 'hsl(var(--c-green))' }}>
                  {lang === 'en' ? `Module complete · +${result.xpAwarded} XP` : `Модулът е завършен · +${result.xpAwarded} XP`}
                </p>
                <button className="btn-primary w-full" onClick={close}>{lang === 'en' ? 'Nice!' : 'Супер!'}</button>
              </>
            ) : (
              <>
                <div className="text-5xl mb-3">📚</div>
                <h2 className="font-black text-xl mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {lang === 'en' ? 'Not this time' : 'Не този път'}
                </h2>
                <p className="text-sm mb-5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {lang === 'en'
                    ? `You got ${result?.score}/${result?.total} (needed ${result?.passNeeded}). Work through the lessons and you'll nail it.`
                    : `Даде ${result?.score}/${result?.total} (нужни ${result?.passNeeded}). Мини през уроците и ще се справиш.`}
                </p>
                <button className="btn-primary w-full" onClick={close}>{lang === 'en' ? 'Go to lessons' : 'Към уроците'}</button>
              </>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
