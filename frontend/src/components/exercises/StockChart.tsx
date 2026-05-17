import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function StockChart({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.stockChart!;
  const prices = cfg.prices;
  const labels = cfg.labels ?? prices.map((_, i) => `${i + 1}`);
  const mode = cfg.mode;

  const [pointIdx, setPointIdx] = useState<number | null>(null);
  const [optionIdx, setOptionIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const min = useMemo(() => Math.min(...prices), [prices]);
  const max = useMemo(() => Math.max(...prices), [prices]);
  const range = max - min || 1;

  const W = 100;
  const H = 60;
  const padX = 4;
  const xAt = (i: number) => padX + (i / (prices.length - 1)) * (W - padX * 2);
  const yAt = (v: number) => H - 6 - ((v - min) / range) * (H - 12);

  const path = prices.map((v, i) => `${i === 0 ? 'M' : 'L'}${xAt(i).toFixed(2)} ${yAt(v).toFixed(2)}`).join(' ');
  const areaPath = path + ` L${xAt(prices.length - 1).toFixed(2)} ${H} L${xAt(0).toFixed(2)} ${H} Z`;

  const trend = prices[prices.length - 1] > prices[0] ? 'up' : 'down';
  const trendColor = trend === 'up' ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))';

  const isCorrect = useMemo(() => {
    if (submitted === false) return false;
    if (mode === 'identify_point') {
      if (pointIdx === null) return false;
      const tol = cfg.pointTolerance ?? 1;
      return Math.abs(pointIdx - (cfg.correctPointIndex ?? 0)) <= tol;
    }
    return optionIdx === cfg.correctPatternIndex;
  }, [submitted, pointIdx, optionIdx, cfg, mode]);

  const handleSubmit = () => {
    if (mode === 'identify_point' && pointIdx === null) return;
    if (mode === 'identify_pattern' && optionIdx === null) return;
    setSubmitted(true);
  };

  const handleChartClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (submitted || mode !== 'identify_point') return;
    const svg = e.currentTarget;
    const rect = svg.getBoundingClientRect();
    const xPct = ((e.clientX - rect.left) / rect.width) * W;
    let nearestIdx = 0;
    let nearestDist = Infinity;
    for (let i = 0; i < prices.length; i++) {
      const d = Math.abs(xAt(i) - xPct);
      if (d < nearestDist) { nearestDist = d; nearestIdx = i; }
    }
    setPointIdx(nearestIdx);
  };

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

      <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      {/* Chart */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <svg
          viewBox={`0 0 ${W} ${H}`}
          width="100%"
          height="220"
          className={mode === 'identify_point' && !submitted ? 'cursor-crosshair' : ''}
          onClick={handleChartClick}
          style={{ touchAction: 'none' }}
        >
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={trendColor} stopOpacity="0.35" />
              <stop offset="100%" stopColor={trendColor} stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(p => (
            <line key={p} x1={padX} y1={H * p + 3} x2={W - padX} y2={H * p + 3}
              stroke="hsl(var(--c-fg-subtle))" strokeWidth="0.15" strokeDasharray="0.6 0.6" opacity="0.4" />
          ))}

          {/* Filled area */}
          <path d={areaPath} fill="url(#chartGrad)" />
          {/* Line */}
          <path d={path} fill="none" stroke={trendColor} strokeWidth="0.7" strokeLinecap="round" strokeLinejoin="round" />

          {/* Marker for selected point */}
          {pointIdx !== null && (
            <g>
              <line x1={xAt(pointIdx)} y1="3" x2={xAt(pointIdx)} y2={H - 3}
                stroke="hsl(var(--c-primary))" strokeWidth="0.4" strokeDasharray="0.8 0.8" />
              <circle cx={xAt(pointIdx)} cy={yAt(prices[pointIdx])} r="1.6"
                fill="hsl(var(--c-primary))" stroke="#fff" strokeWidth="0.4" />
            </g>
          )}

          {/* After submit, show correct point */}
          {submitted && mode === 'identify_point' && cfg.correctPointIndex !== undefined && (
            <g>
              <circle cx={xAt(cfg.correctPointIndex)} cy={yAt(prices[cfg.correctPointIndex])} r="2.2"
                fill="none" stroke="hsl(var(--c-green))" strokeWidth="0.5" />
              <circle cx={xAt(cfg.correctPointIndex)} cy={yAt(prices[cfg.correctPointIndex])} r="1.4"
                fill="hsl(var(--c-green))" stroke="#fff" strokeWidth="0.4" />
            </g>
          )}
        </svg>

        {/* Price + label readout */}
        <div className="flex justify-between mt-2 text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          <span className="mono">{labels[0]}</span>
          {pointIdx !== null && (
            <span className="font-bold" style={{ color: 'hsl(var(--c-primary))' }}>
              {labels[pointIdx]} · €{prices[pointIdx].toLocaleString()}
            </span>
          )}
          <span className="mono">{labels[labels.length - 1]}</span>
        </div>
      </div>

      {/* Hint for identify_point before submit */}
      {mode === 'identify_point' && !submitted && pointIdx === null && cfg.pointPrompt && (
        <p className="text-xs text-center mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          💡 {t(cfg.pointPrompt)}
        </p>
      )}

      {/* Pattern options */}
      {mode === 'identify_pattern' && (
        <div className="space-y-2 mb-4">
          {(cfg.patternOptions ?? []).map((opt, i) => {
            const isSelected = optionIdx === i;
            const isCorrectOpt = submitted && i === cfg.correctPatternIndex;
            const isWrongOpt = submitted && isSelected && i !== cfg.correctPatternIndex;
            return (
              <button key={i}
                onClick={() => !submitted && setOptionIdx(i)}
                disabled={submitted}
                className="w-full text-left rounded-xl p-3 transition-all"
                style={{
                  background: isCorrectOpt ? 'hsl(var(--c-green)/0.12)'
                    : isWrongOpt ? 'hsl(var(--c-red)/0.12)'
                    : isSelected ? 'hsl(var(--c-primary)/0.1)'
                    : 'var(--c-glass)',
                  border: `1.5px solid ${isCorrectOpt ? 'hsl(var(--c-green))'
                    : isWrongOpt ? 'hsl(var(--c-red))'
                    : isSelected ? 'hsl(var(--c-primary))'
                    : 'var(--c-border)'}`,
                }}>
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                  {opt[lang]}
                </span>
              </button>
            );
          })}
        </div>
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
            {isCorrect ? (lang === 'en' ? '✓ Sharp eye!' : '✓ Остро око!')
              : (lang === 'en' ? '✗ Not quite' : '✗ Не съвсем')}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit}
          disabled={mode === 'identify_point' ? pointIdx === null : optionIdx === null}>
          {lang === 'en' ? 'Check →' : 'Провери →'}
        </button>
      )}
      {submitted && (
        <button className="btn-primary w-full" onClick={() => onAnswer(isCorrect, isCorrect ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
