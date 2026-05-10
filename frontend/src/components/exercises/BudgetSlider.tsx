import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function BudgetSlider({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const income = exercise.income ?? 3000;
  const cats = exercise.categories ?? [];

  const [values, setValues] = useState<number[]>(cats.map(c => c.ideal));
  const [submitted, setSubmitted] = useState(false);

  const total = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const remaining = income - total;
  const overBudget = remaining < 0;

  const score = useMemo(() => {
    if (!submitted) return 0;
    let s = 0;
    cats.forEach((c, i) => {
      const diff = Math.abs(values[i] - c.ideal) / c.ideal;
      if (diff < 0.1) s += 2;
      else if (diff < 0.25) s += 1;
    });
    return s;
  }, [submitted, values, cats]);

  const maxScore = cats.length * 2;
  const isGood = score >= maxScore * 0.7;

  const handleSubmit = () => {
    if (overBudget) return;
    setSubmitted(true);
    if (isGood) {
      setTimeout(() => onAnswer(true, exercise.xp), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Income header */}
      <div className="rounded-xl p-4 mb-5 text-center"
        style={{ background: 'hsl(var(--c-green)/0.08)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--c-green))' }}>
          {lang === 'en' ? 'Monthly Income' : 'Месечен доход'}
        </p>
        <p className="text-3xl font-black" style={{ color: 'hsl(var(--c-fg))' }}>€{income.toLocaleString()}</p>
      </div>

      {/* Sliders */}
      <div className="space-y-5 mb-5">
        {cats.map((cat, i) => {
          const pct = Math.round((values[i] / income) * 100);
          const diff = submitted ? Math.abs(values[i] - cat.ideal) / cat.ideal : null;
          const sliderColor = !submitted
            ? 'hsl(var(--c-primary))'
            : diff! < 0.1 ? 'hsl(var(--c-green))'
            : diff! < 0.25 ? 'hsl(var(--c-orange))'
            : 'hsl(var(--c-red))';

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                  {cat.emoji} {t(cat.label)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: sliderColor }}>
                    €{values[i]}
                  </span>
                  <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>({pct}%)</span>
                  {submitted && diff! < 0.1 && <span>✅</span>}
                  {submitted && diff! >= 0.25 && <span>⚠️</span>}
                </div>
              </div>
              <input
                type="range"
                min={cat.min} max={cat.max} step={50}
                value={values[i]}
                disabled={submitted}
                onChange={e => {
                  const next = [...values];
                  next[i] = Number(e.target.value);
                  setValues(next);
                }}
                style={{ accentColor: sliderColor }}
              />
              {submitted && (
                <p className="text-xs mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Suggested:' : 'Предложено:'} €{cat.ideal}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Remaining */}
      <div className="rounded-xl p-3 mb-5 flex items-center justify-between"
        style={{
          background: overBudget ? 'hsl(var(--c-red)/0.1)' : 'hsl(var(--c-green)/0.08)',
          border: `1px solid ${overBudget ? 'hsl(var(--c-red)/0.3)' : 'hsl(var(--c-green)/0.2)'}`,
        }}>
        <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? 'Remaining' : 'Остатък'}
        </span>
        <span className="text-lg font-black"
          style={{ color: overBudget ? 'hsl(var(--c-red))' : 'hsl(var(--c-green))' }}>
          {overBudget ? '-' : ''}€{Math.abs(remaining)}
          {overBudget && (lang === 'en' ? ' over budget!' : ' над бюджета!')}
        </span>
      </div>

      {/* Score reveal */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: isGood ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-orange)/0.1)',
            border: `1px solid ${isGood ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-orange)/0.3)'}`,
          }}>
          <p className="font-bold mb-1" style={{ color: isGood ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))' }}>
            {isGood
              ? (lang === 'en' ? '🎯 Great budget allocation!' : '🎯 Страхотно разпределение на бюджета!')
              : (lang === 'en' ? '📊 Good try! Check the suggested values.' : '📊 Добър опит! Провери предложените стойности.')}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? `Score: ${score}/${maxScore}` : `Резултат: ${score}/${maxScore}`}
          </p>
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={overBudget}>
          {lang === 'en' ? 'Submit Budget →' : 'Изпрати бюджета →'}
        </button>
      )}
      {submitted && !isGood && (
        <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
