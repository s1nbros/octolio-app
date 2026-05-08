import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function TrueFalse({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const [chosen, setChosen] = useState<boolean | null>(null);
  const isAnswered = chosen !== null;
  const isCorrect = chosen === exercise.isTrue;

  const handleChoice = (value: boolean) => {
    if (isAnswered) return;
    setChosen(value);
    setTimeout(() => onAnswer(value === exercise.isTrue, value === exercise.isTrue ? exercise.xp : 0), 2200);
  };

  return (
    <div className="animate-fade-in">
      {/* Statement card */}
      <div className="rounded-2xl p-6 mb-6 text-center"
        style={{
          background: 'hsl(var(--c-primary)/0.06)',
          border: '1px solid hsl(var(--c-primary)/0.2)',
        }}>
        <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'True or False?' : 'Вярно или невярно?'}
        </p>
        <p className="text-base font-semibold leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
          "{t(exercise.statement!)}"
        </p>
      </div>

      {/* True / False buttons */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <button
          onClick={() => handleChoice(true)}
          disabled={isAnswered}
          className="rounded-xl py-4 text-center transition-all duration-200"
          style={{
            background: isAnswered
              ? chosen === true
                ? isCorrect ? 'hsl(var(--c-green)/0.15)' : 'hsl(var(--c-red)/0.15)'
                : exercise.isTrue === true ? 'hsl(var(--c-green)/0.08)' : 'var(--c-glass)'
              : 'var(--c-glass)',
            border: `2px solid ${isAnswered
              ? chosen === true
                ? isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
                : exercise.isTrue === true ? 'hsl(var(--c-green)/0.4)' : 'var(--c-border)'
              : 'var(--c-border)'}`,
          }}>
          <span className="text-2xl block mb-1">✅</span>
          <span className="text-sm font-bold" style={{
            color: isAnswered && chosen === true
              ? isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
              : 'hsl(var(--c-fg))'
          }}>
            {lang === 'en' ? 'TRUE' : 'ВЯРНО'}
          </span>
        </button>

        <button
          onClick={() => handleChoice(false)}
          disabled={isAnswered}
          className="rounded-xl py-4 text-center transition-all duration-200"
          style={{
            background: isAnswered
              ? chosen === false
                ? isCorrect ? 'hsl(var(--c-green)/0.15)' : 'hsl(var(--c-red)/0.15)'
                : exercise.isTrue === false ? 'hsl(var(--c-green)/0.08)' : 'var(--c-glass)'
              : 'var(--c-glass)',
            border: `2px solid ${isAnswered
              ? chosen === false
                ? isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
                : exercise.isTrue === false ? 'hsl(var(--c-green)/0.4)' : 'var(--c-border)'
              : 'var(--c-border)'}`,
          }}>
          <span className="text-2xl block mb-1">❌</span>
          <span className="text-sm font-bold" style={{
            color: isAnswered && chosen === false
              ? isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
              : 'hsl(var(--c-fg))'
          }}>
            {lang === 'en' ? 'FALSE' : 'НЕВЯРНО'}
          </span>
        </button>
      </div>

      {/* Result reveal */}
      {isAnswered && (
        <div className="rounded-xl p-4 animate-slide-up"
          style={{
            background: isCorrect ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{isCorrect ? '💡' : '⚠️'}</span>
            <span className="font-bold text-sm" style={{ color: isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
              {isCorrect
                ? (exercise.isTrue
                  ? (lang === 'en' ? 'Fact confirmed!' : 'Фактът е потвърден!')
                  : (lang === 'en' ? 'Myth busted!' : 'Митът е разбит!'))
                : (lang === 'en' ? 'Not quite...' : 'Не съвсем...')}
            </span>
          </div>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
