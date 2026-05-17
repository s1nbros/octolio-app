import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function PortfolioPie({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.portfolioPie!;
  const assets = cfg.assets;
  const tolerance = cfg.tolerance ?? 10;

  // Initialize with even split, rounded
  const initial = assets.map(() => Math.round(100 / assets.length));
  // Adjust last to ensure sum = 100
  const sumInit = initial.reduce((a, b) => a + b, 0);
  initial[initial.length - 1] += 100 - sumInit;

  const [values, setValues] = useState<number[]>(initial);
  const [submitted, setSubmitted] = useState(false);

  const total = values.reduce((a, b) => a + b, 0);

  const updateValue = (idx: number, newVal: number) => {
    if (submitted) return;
    newVal = Math.max(0, Math.min(100, newVal));
    const others = values.reduce((sum, v, i) => i === idx ? sum : sum + v, 0);
    if (others + newVal > 100) {
      // Reduce others proportionally
      const excess = others + newVal - 100;
      const next = values.slice();
      next[idx] = newVal;
      const otherIdxs = values.map((_, i) => i).filter(i => i !== idx);
      let remaining = excess;
      for (let i = otherIdxs.length - 1; i >= 0; i--) {
        const oi = otherIdxs[i];
        const reduce = Math.min(next[oi], Math.ceil(remaining / (i + 1)));
        next[oi] -= reduce;
        remaining -= reduce;
        if (remaining <= 0) break;
      }
      setValues(next);
    } else {
      const next = values.slice();
      next[idx] = newVal;
      setValues(next);
    }
  };

  const isCorrect = useMemo(() => {
    return assets.every((a, i) => Math.abs(values[i] - a.ideal) <= tolerance);
  }, [values, assets, tolerance]);

  const handleSubmit = () => {
    if (total !== 100) return;
    setSubmitted(true);
  };

  // Pie chart geometry
  const cx = 50, cy = 50, r = 35;
  let cumulative = 0;
  const slices = values.map((v, i) => {
    const startAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    cumulative += v;
    const endAngle = (cumulative / 100) * 2 * Math.PI - Math.PI / 2;
    const x1 = cx + r * Math.cos(startAngle);
    const y1 = cy + r * Math.sin(startAngle);
    const x2 = cx + r * Math.cos(endAngle);
    const y2 = cy + r * Math.sin(endAngle);
    const large = v > 50 ? 1 : 0;
    const path = v === 0 ? '' : v >= 100
      ? `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.001} ${cy - r} Z`
      : `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`;
    return { path, color: assets[i].color };
  });

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

      {cfg.question && (
        <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: 'hsl(var(--c-fg))' }}>
          {t(cfg.question)}
        </p>
      )}

      {/* Pie + sliders */}
      <div className="flex items-center gap-4 mb-5 rounded-2xl p-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <svg viewBox="0 0 100 100" width="120" height="120" className="flex-shrink-0">
          {slices.map((s, i) => s.path && (
            <path key={i} d={s.path} fill={s.color} stroke="hsl(228, 24%, 10%)" strokeWidth="0.6" />
          ))}
          <circle cx={cx} cy={cy} r={r * 0.45} fill="hsl(228, 24%, 10%)" />
          <text x={cx} y={cy + 1} textAnchor="middle" fontSize="9" fontWeight="800" fill="hsl(var(--c-fg))">
            {total}%
          </text>
        </svg>
        <div className="flex-1 space-y-1.5 min-w-0">
          {assets.map((a, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="w-3 h-3 rounded-sm flex-shrink-0" style={{ background: a.color }} />
              <span className="font-semibold truncate" style={{ color: 'hsl(var(--c-fg))' }}>
                {a.emoji} {a.label[lang]}
              </span>
              <span className="ml-auto mono font-bold" style={{ color: a.color }}>
                {values[i]}%
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-3 mb-5">
        {assets.map((a, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                {a.emoji} {a.label[lang]}
              </span>
              <span className="text-sm font-bold" style={{ color: a.color }}>{values[i]}%</span>
            </div>
            <input type="range" min={0} max={100} step={1} value={values[i]}
              disabled={submitted}
              onChange={e => updateValue(i, Number(e.target.value))}
              style={{ accentColor: a.color }} />
          </div>
        ))}
      </div>

      {total !== 100 && !submitted && (
        <p className="text-xs mb-3 text-center" style={{ color: 'hsl(var(--c-orange))' }}>
          ⚠️ {lang === 'en' ? `Total must equal 100% (currently ${total}%)` : `Общо трябва да е 100% (в момента ${total}%)`}
        </p>
      )}

      {/* Result */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: isCorrect ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm mb-2"
            style={{ color: isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {isCorrect ? (lang === 'en' ? '✓ Solid allocation!' : '✓ Стабилно разпределение!')
              : (lang === 'en' ? '✗ Off target' : '✗ Не е точно')}
          </p>
          <div className="text-xs space-y-1 mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            <p className="font-semibold mb-1">
              {lang === 'en' ? 'Recommended allocation:' : 'Препоръчително разпределение:'}
            </p>
            {assets.map((a, i) => (
              <p key={i}>
                <span style={{ color: a.color }}>●</span> {a.label[lang]}: {a.ideal}% (you: {values[i]}%)
              </p>
            ))}
          </div>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={total !== 100}>
          {lang === 'en' ? 'Submit Allocation →' : 'Подай разпределение →'}
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
