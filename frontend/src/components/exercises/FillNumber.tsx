import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';
import { ExplainMistake } from '../ExplainMistake';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function FillNumber({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const answer = exercise.fillNumberAnswer ?? 0;
  const tolerance = exercise.fillNumberTolerance ?? answer * 0.05;
  const unit = exercise.fillNumberUnit ?? '';

  const parsedValue = useMemo(() => {
    const cleaned = value.replace(/[^0-9.\-]/g, '');
    return parseFloat(cleaned);
  }, [value]);

  const isCorrect = useMemo(() => {
    if (isNaN(parsedValue)) return false;
    return Math.abs(parsedValue - answer) <= tolerance;
  }, [parsedValue, answer, tolerance]);

  const handleSubmit = () => {
    if (isNaN(parsedValue)) return;
    setSubmitted(true);
    if (isCorrect) {
      setTimeout(() => onAnswer(true, exercise.xp), 1800);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Scenario */}
      {exercise.fillNumberScenario && (
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: 'hsl(var(--c-primary)/0.06)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
            {t(exercise.fillNumberScenario)}
          </p>
        </div>
      )}

      {exercise.question && (
        <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
          {t(exercise.question)}
        </p>
      )}

      {/* Input */}
      <div className="flex gap-2 mb-4 items-center">
        {unit && (
          <span className="text-xl font-bold" style={{ color: 'hsl(var(--c-primary))' }}>
            {unit}
          </span>
        )}
        <input
          type="text"
          inputMode="decimal"
          className="input-field flex-1 text-lg font-semibold"
          placeholder={lang === 'en' ? 'Your answer...' : 'Твоят отговор...'}
          value={value}
          onChange={e => !submitted && setValue(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && value && !submitted && handleSubmit()}
          disabled={submitted}
          style={{
            borderColor: submitted
              ? isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
              : undefined,
            background: submitted
              ? isCorrect ? 'hsl(var(--c-green)/0.08)' : 'hsl(var(--c-red)/0.08)'
              : undefined,
          }}
        />
      </div>

      {/* Hint */}
      {!submitted && exercise.fillNumberHint && (
        <p className="text-xs mb-4 px-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          💡 {t(exercise.fillNumberHint)}
        </p>
      )}

      {/* Result */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: isCorrect ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm mb-1"
            style={{ color: isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {isCorrect
              ? (lang === 'en' ? '✓ Correct!' : '✓ Правилно!')
              : (lang === 'en' ? `✗ The answer is ${unit}${answer.toLocaleString()}` : `✗ Отговорът е ${unit}${answer.toLocaleString()}`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
          {!isCorrect && tolerance > 0 && (
            <p className="text-xs mt-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en'
                ? `Accepted range: ${unit}${(answer - tolerance).toLocaleString()} – ${unit}${(answer + tolerance).toLocaleString()}`
                : `Приет диапазон: ${unit}${(answer - tolerance).toLocaleString()} – ${unit}${(answer + tolerance).toLocaleString()}`}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={!value.trim()}>
          {lang === 'en' ? 'Check Answer →' : 'Провери отговора →'}
        </button>
      )}
      {submitted && !isCorrect && (
        <>
          <ExplainMistake exercise={exercise} userAnswer={value || undefined} />
          <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
            {lang === 'en' ? 'Continue →' : 'Продължи →'}
          </button>
        </>
      )}
    </div>
  );
}
