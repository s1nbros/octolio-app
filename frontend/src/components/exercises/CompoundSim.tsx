import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

function calcFV(principal: number, monthly: number, rate: number, years: number): number {
  const r = rate / 100 / 12;
  const n = years * 12;
  if (r === 0) return principal + monthly * n;
  const futureOfPrincipal = principal * Math.pow(1 + r, n);
  const futureOfMonthly = monthly * ((Math.pow(1 + r, n) - 1) / r);
  return futureOfPrincipal + futureOfMonthly;
}

export function CompoundSim({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const cfg = exercise.compoundConfig!;

  const [principal, setPrincipal] = useState(cfg.defaultPrincipal);
  const [monthly, setMonthly] = useState(cfg.defaultMonthly);
  const [rate, setRate] = useState(cfg.defaultRate);
  const [years, setYears] = useState(cfg.defaultYears);
  const [revealed, setRevealed] = useState(false);

  const fv = useMemo(() => calcFV(principal, monthly, rate, years), [principal, monthly, rate, years]);
  const totalContrib = principal + monthly * years * 12;
  const totalGrowth = fv - totalContrib;
  const growthPct = totalContrib > 0 ? Math.round((fv / totalContrib - 1) * 100) : 0;

  // sparkline data — yearly values
  const dataPoints = useMemo(() => {
    const pts = [];
    for (let y = 0; y <= years; y++) pts.push(calcFV(principal, monthly, rate, y));
    return pts;
  }, [principal, monthly, rate, years]);

  const maxVal = dataPoints[dataPoints.length - 1];

  return (
    <div className="animate-fade-in">
      <p className="text-sm mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? '🔮 Adjust the sliders to see the power of compound interest!'
          : '🔮 Настрой плъзгачите, за да видиш силата на сложната лихва!'}
      </p>

      {/* Sliders */}
      <div className="space-y-4 mb-5">
        {[
          { label: { en: 'Starting amount', bg: 'Начална сума' }, value: principal, setter: setPrincipal, min: 0, max: 50000, step: 500, unit: '€', color: 'hsl(var(--c-primary))' },
          { label: { en: 'Monthly investment', bg: 'Месечна инвестиция' }, value: monthly, setter: setMonthly, min: 0, max: 2000, step: 50, unit: '€/mo', color: 'hsl(var(--c-green))' },
          { label: { en: 'Annual return', bg: 'Годишна доходност' }, value: rate, setter: setRate, min: 1, max: 15, step: 0.5, unit: '%', color: 'hsl(var(--c-purple))' },
          { label: { en: 'Time horizon', bg: 'Времеви хоризонт' }, value: years, setter: setYears, min: 1, max: 50, step: 1, unit: lang === 'en' ? 'yrs' : 'г.', color: 'hsl(var(--c-orange))' },
        ].map(({ label, value, setter, min, max, step, unit, color }) => (
          <div key={unit}>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                {label[lang]}
              </span>
              <span className="text-sm font-bold" style={{ color }}>
                {unit.startsWith('€') ? `€${value.toLocaleString()}` : `${value} ${unit}`}
              </span>
            </div>
            <input type="range" min={min} max={max} step={step} value={value}
              onChange={e => setter(Number(e.target.value))}
              style={{ accentColor: color }} />
          </div>
        ))}
      </div>

      {/* Sparkline chart */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', height: '80px', position: 'relative', overflow: 'hidden' }}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <defs>
            <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--c-green))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--c-green))" stopOpacity="0" />
            </linearGradient>
          </defs>
          {dataPoints.length > 1 && (() => {
            const w = 100;
            const h = 70;
            const pts = dataPoints.map((v, i) => ({
              x: (i / (dataPoints.length - 1)) * w,
              y: h - (v / maxVal) * (h - 5),
            }));
            const pathD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x}%,${p.y}`).join(' ');
            const areaD = pathD + ` L${pts[pts.length - 1].x}%,${h} L0,${h} Z`;
            return (
              <>
                <path d={areaD} fill="url(#sparkGrad)" />
                <path d={pathD} fill="none" stroke="hsl(var(--c-green))" strokeWidth="2" />
              </>
            );
          })()}
        </svg>
        <p className="absolute top-2 right-3 text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {years} {lang === 'en' ? 'years' : 'г.'}
        </p>
      </div>

      {/* Results */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        {[
          { label: lang === 'en' ? 'You invest' : 'Ти инвестираш', value: `€${Math.round(totalContrib).toLocaleString()}`, color: 'hsl(var(--c-fg-muted))' },
          { label: lang === 'en' ? 'Market adds' : 'Пазарът добавя', value: `€${Math.round(totalGrowth).toLocaleString()}`, color: 'hsl(var(--c-purple))' },
          { label: lang === 'en' ? 'Final value' : 'Крайна стойност', value: `€${Math.round(fv).toLocaleString()}`, color: 'hsl(var(--c-green))' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-3 text-center"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
            <p className="text-base font-black" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {growthPct > 0 && (
        <div className="rounded-xl p-3 mb-5 text-center"
          style={{ background: 'hsl(var(--c-green)/0.08)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
          <p className="text-sm font-bold" style={{ color: 'hsl(var(--c-green))' }}>
            {lang === 'en'
              ? `🚀 Your money grows ${growthPct}% — compound interest did ${Math.round((totalGrowth / fv) * 100)}% of the work!`
              : `🚀 Парите ти нарастват с ${growthPct}% — сложната лихва свърши ${Math.round((totalGrowth / fv) * 100)}% от работата!`}
          </p>
        </div>
      )}

      {!revealed ? (
        <button className="btn-primary w-full" onClick={() => setRevealed(true)}>
          {lang === 'en' ? '✓ I understand compound interest!' : '✓ Разбирам сложната лихва!'}
        </button>
      ) : (
        <>
          <div className="rounded-xl p-3 text-center mb-3"
            style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.3)' }}>
            <p className="font-semibold text-sm" style={{ color: 'hsl(var(--c-green))' }}>
              ✓ {lang === 'en' ? 'Great job exploring!' : 'Страхотно!'}
            </p>
          </div>
          <button className="btn-primary w-full" onClick={() => onAnswer(true, exercise.xp)}>
            {lang === 'en' ? 'Continue →' : 'Продължи →'}
          </button>
        </>
      )}
    </div>
  );
}
