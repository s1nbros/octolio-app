import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

function calcTax(income: number, brackets: { upTo: number; rate: number }[]): { taxOwed: number; bracketFills: number[] } {
  let remaining = income;
  let prev = 0;
  let taxOwed = 0;
  const fills: number[] = [];
  for (const b of brackets) {
    const range = b.upTo === Infinity ? Infinity : b.upTo - prev;
    const taxedHere = Math.min(remaining, range);
    fills.push(Math.max(0, taxedHere));
    taxOwed += taxedHere * (b.rate / 100);
    remaining -= taxedHere;
    if (b.upTo === Infinity) break;
    prev = b.upTo;
    if (remaining <= 0) break;
  }
  // Pad fills array to match brackets length
  while (fills.length < brackets.length) fills.push(0);
  return { taxOwed, bracketFills: fills };
}

export function TaxBrackets({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.taxBrackets!;
  const [income, setIncome] = useState(cfg.testIncome);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { taxOwed, bracketFills } = useMemo(() => calcTax(income, cfg.brackets), [income, cfg.brackets]);
  const effectiveRate = income > 0 ? (taxOwed / income) * 100 : 0;
  const marginalRate = useMemo(() => {
    let prev = 0;
    for (const b of cfg.brackets) {
      if (income <= b.upTo) return b.rate;
      prev = b.upTo;
    }
    return cfg.brackets[cfg.brackets.length - 1].rate;
  }, [income, cfg.brackets]);

  const parsedAnswer = parseFloat(answer.replace(/[^0-9.\-]/g, ''));
  const isCorrect = useMemo(() => {
    if (isNaN(parsedAnswer)) return false;
    return Math.abs(parsedAnswer - cfg.correctAnswer) <= cfg.tolerance;
  }, [parsedAnswer, cfg]);

  const handleSubmit = () => {
    if (isNaN(parsedAnswer)) return;
    setSubmitted(true);
    setTimeout(() => onAnswer(isCorrect, isCorrect ? exercise.xp : 0), 1800);
  };

  const colors = ['hsl(var(--c-green))', 'hsl(var(--c-primary))', 'hsl(var(--c-purple))', 'hsl(var(--c-orange))', 'hsl(var(--c-red))'];

  return (
    <div className="animate-fade-in">
      {cfg.scenario && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'hsl(var(--c-purple)/0.07)', border: '1px solid hsl(var(--c-purple)/0.2)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
            {t(cfg.scenario)}
          </p>
        </div>
      )}

      {/* Income display (locked when not adjustable) */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Annual Income' : 'Годишен доход'}
          </span>
          <span className="text-xl font-black" style={{ color: 'hsl(var(--c-primary))' }}>
            €{income.toLocaleString()}
          </span>
        </div>
        {cfg.adjustable && (
          <input type="range"
            min={cfg.incomeMin ?? 10000}
            max={cfg.incomeMax ?? 200000}
            step={1000}
            value={income}
            disabled={submitted}
            onChange={e => setIncome(Number(e.target.value))}
            style={{ accentColor: 'hsl(var(--c-primary))', width: '100%' }} />
        )}
      </div>

      {/* Bracket visualization */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <p className="text-xs font-bold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Tax Brackets' : 'Данъчни прагове'}
        </p>
        <div className="space-y-1.5">
          {cfg.brackets.map((b, i) => {
            const prev = i === 0 ? 0 : cfg.brackets[i - 1].upTo;
            const fill = bracketFills[i];
            const range = b.upTo === Infinity ? (income - prev) : (b.upTo - prev);
            const fillPct = range > 0 ? (fill / range) * 100 : 0;
            const taxFromBracket = fill * (b.rate / 100);
            const c = colors[i % colors.length];
            return (
              <div key={i}>
                <div className="flex justify-between text-xs mb-0.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  <span className="mono">
                    €{prev.toLocaleString()}
                    {b.upTo === Infinity ? '+' : `–€${b.upTo.toLocaleString()}`} @ {b.rate}%
                  </span>
                  <span className="mono font-bold" style={{ color: fill > 0 ? c : 'hsl(var(--c-fg-subtle))' }}>
                    {fill > 0 ? `€${Math.round(taxFromBracket).toLocaleString()}` : '—'}
                  </span>
                </div>
                <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(228, 12%, 18%)' }}>
                  <div className="h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, fillPct)}%`, background: c }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <div className="text-center">
            <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Tax owed' : 'Дължим данък'}
            </p>
            <p className="text-sm font-black" style={{ color: 'hsl(var(--c-red))' }}>
              €{Math.round(taxOwed).toLocaleString()}
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Effective' : 'Ефективна'}
            </p>
            <p className="text-sm font-black" style={{ color: 'hsl(var(--c-orange))' }}>
              {effectiveRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Marginal' : 'Пределна'}
            </p>
            <p className="text-sm font-black" style={{ color: 'hsl(var(--c-purple))' }}>
              {marginalRate}%
            </p>
          </div>
        </div>
      </div>

      <p className="text-base font-semibold leading-relaxed mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      {/* Numeric input */}
      <div className="flex gap-2 mb-4 items-center">
        <input type="text"
          inputMode="decimal"
          className="input-field flex-1 text-lg font-semibold"
          placeholder={lang === 'en' ? 'Your answer' : 'Твоят отговор'}
          value={answer}
          onChange={e => !submitted && setAnswer(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && answer && !submitted && handleSubmit()}
          disabled={submitted}
          style={{
            borderColor: submitted ? (isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))') : undefined,
            background: submitted ? (isCorrect ? 'hsl(var(--c-green)/0.08)' : 'hsl(var(--c-red)/0.08)') : undefined,
          }} />
        {cfg.unit && (
          <span className="text-xl font-bold" style={{ color: 'hsl(var(--c-primary))' }}>
            {cfg.unit}
          </span>
        )}
      </div>

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
              : (lang === 'en' ? `✗ Answer: ${cfg.correctAnswer}${cfg.unit}` : `✗ Отговор: ${cfg.correctAnswer}${cfg.unit}`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={!answer.trim()}>
          {lang === 'en' ? 'Check Answer →' : 'Провери отговора →'}
        </button>
      )}
    </div>
  );
}
