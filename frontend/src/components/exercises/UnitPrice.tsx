import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function UnitPrice({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.unitPrice!;
  const [picked, setPicked] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Compute price-per-unit for each option
  const perUnit = useMemo(
    () => cfg.options.map(o => o.price / o.quantity),
    [cfg.options],
  );
  const cheapestIdx = useMemo(() => {
    let bestIdx = 0;
    for (let i = 1; i < perUnit.length; i++) {
      if (perUnit[i] < perUnit[bestIdx]) bestIdx = i;
    }
    return bestIdx;
  }, [perUnit]);
  const cheapestPrice = perUnit[cheapestIdx];

  const isCorrect = picked === cheapestIdx;

  const handleSubmit = () => {
    if (picked === null) return;
    setSubmitted(true);
    if (isCorrect) {
      setTimeout(() => onAnswer(true, exercise.xp), 1800);
    }
  };

  const fmtPerUnit = (v: number) => {
    if (v < 1) return `€${v.toFixed(3)}`;
    return `€${v.toFixed(2)}`;
  };

  // Visual: a horizontal bar comparing per-unit prices (smaller = better)
  const maxPerUnit = Math.max(...perUnit);

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

      <p className="text-base font-semibold leading-relaxed mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      <div className="space-y-2 mb-4">
        {cfg.options.map((o, i) => {
          const sel = picked === i;
          const isCheapestOption = submitted && i === cheapestIdx;
          const isWrongPick = submitted && sel && !isCorrect;
          const pu = perUnit[i];
          const pct = (pu / maxPerUnit) * 100;

          return (
            <button key={i}
              onClick={() => !submitted && setPicked(i)}
              disabled={submitted}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: isCheapestOption ? 'hsl(var(--c-green)/0.1)'
                  : isWrongPick ? 'hsl(var(--c-red)/0.1)'
                  : sel ? 'hsl(var(--c-primary)/0.1)'
                  : 'var(--c-glass)',
                border: `1.5px solid ${isCheapestOption ? 'hsl(var(--c-green))'
                  : isWrongPick ? 'hsl(var(--c-red))'
                  : sel ? 'hsl(var(--c-primary))'
                  : 'var(--c-border)'}`,
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{o.emoji}</span>
                <span className="text-sm font-bold flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {o.label[lang]}
                </span>
                <span className="text-xs mono" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  €{o.price.toFixed(2)} / {o.quantity}{cfg.unit}
                </span>
              </div>
              {submitted && (
                <>
                  <div className="h-2 rounded-full overflow-hidden mt-1.5" style={{ background: 'hsl(228, 12%, 18%)' }}>
                    <div className="h-full transition-all duration-500"
                      style={{
                        width: `${pct}%`,
                        background: i === cheapestIdx ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))',
                      }} />
                  </div>
                  <p className="text-[11px] mt-1 mono"
                    style={{ color: i === cheapestIdx ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg-muted))' }}>
                    {fmtPerUnit(pu)}/{cfg.unit}
                    {i === cheapestIdx && (lang === 'en' ? ' · best deal' : ' · най-добра сделка')}
                  </p>
                </>
              )}
              {o.note && (
                <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {o.note[lang]}
                </p>
              )}
            </button>
          );
        })}
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
              ? (lang === 'en' ? `✓ Best deal: ${fmtPerUnit(cheapestPrice)}/${cfg.unit}` : `✓ Най-добрата сделка: ${fmtPerUnit(cheapestPrice)}/${cfg.unit}`)
              : (lang === 'en' ? `✗ Best deal: ${cfg.options[cheapestIdx].label.en} (${fmtPerUnit(cheapestPrice)}/${cfg.unit})` : `✗ Най-добра: ${cfg.options[cheapestIdx].label.bg} (${fmtPerUnit(cheapestPrice)}/${cfg.unit})`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={picked === null}>
          {lang === 'en' ? 'Pick the best deal →' : 'Избери най-добрата →'}
        </button>
      )}
      {submitted && !isCorrect && (
        <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
