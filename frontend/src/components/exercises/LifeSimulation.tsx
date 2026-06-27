import { useMemo, useState } from 'react';
import type { Exercise, LifeSimChoice, LifeSimConfig } from '../../types';
import { useLang } from '../../contexts/LanguageContext';
import { Fireworks } from '../Fireworks';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

/** Mutable simulation state carried across all decisions. */
interface SimState {
  cash: number;
  investments: number;
  debt: number;
  monthlySurplus: number; // money available each month
  monthlyInvest: number;  // of that, how much auto-invests
  happiness: number;      // 0–100
  wisdom: number;         // count of wise choices
}

function netWorth(s: SimState): number {
  return Math.round(s.cash + s.investments - s.debt);
}

/** Future value of investments after `years`, including monthly contributions. */
function grow(principal: number, monthly: number, annualReturn: number, years: number): number {
  const r = annualReturn;
  const lump = principal * Math.pow(1 + r, years);
  // FV of a monthly contribution stream, compounded annually (close enough for teaching).
  const annualContribution = monthly * 12;
  const series = r > 0 ? annualContribution * ((Math.pow(1 + r, years) - 1) / r) : annualContribution * years;
  return lump + series;
}

function fmt(n: number): string {
  const v = Math.round(n);
  return v.toLocaleString('en-US').replace(/,/g, ' ');
}

export function LifeSimulation({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const cfg = exercise.lifeSim as LifeSimConfig;

  const [stageIdx, setStageIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [finished, setFinished] = useState(false);

  const [state, setState] = useState<SimState>(() => ({
    cash: cfg.startCash,
    investments: 0,
    debt: 0,
    monthlySurplus: cfg.monthlySurplus,
    monthlyInvest: 0,
    happiness: 50,
    wisdom: 0,
  }));

  const stage = cfg.stages[stageIdx];
  const chosen: LifeSimChoice | null = picked !== null ? stage.choices[picked] : null;

  // Apply a choice's immediate deltas (does not advance time yet).
  const applyChoice = (i: number) => {
    if (picked !== null) return;
    const c = stage.choices[i];
    setState((s) => {
      const next: SimState = { ...s };
      // Deltas represent how the scenario's money (a windfall, a raise, etc.)
      // is allocated — cashDelta and investDelta are both "where it goes".
      if (c.investMultiplier !== undefined) next.investments *= c.investMultiplier;
      if (c.cashOutInvestments) {
        // Liquidate everything to cash and stop auto-investing.
        next.cash += next.investments;
        next.investments = 0;
        next.monthlyInvest = 0;
      }
      next.cash += c.cashDelta ?? 0;
      next.investments += c.investDelta ?? 0;
      next.debt += c.debtDelta ?? 0;
      next.monthlySurplus += c.monthlySurplusDelta ?? 0;
      next.monthlyInvest = Math.max(0, next.monthlyInvest + (c.monthlyInvestDelta ?? 0));
      // Can't invest more than the surplus available.
      next.monthlyInvest = Math.min(next.monthlyInvest, Math.max(0, next.monthlySurplus));
      next.happiness = Math.max(0, Math.min(100, next.happiness + (c.happinessDelta ?? 0)));
      next.debt = Math.max(0, next.debt);
      next.cash = Math.max(0, next.cash);
      if (c.wise) next.wisdom += 1;
      return next;
    });
    setPicked(i);
  };

  // Advance time to the next stage: compound investments, pile idle surplus into
  // cash, grow unpaid debt. Then move on (or finish).
  const advance = () => {
    const years = stage.yearsToNext;
    setState((s) => {
      const next: SimState = { ...s };
      next.investments = grow(s.investments, s.monthlyInvest, cfg.annualReturn, years);
      const idleMonthly = Math.max(0, s.monthlySurplus - s.monthlyInvest);
      next.cash += idleMonthly * 12 * years;
      if (next.debt > 0) next.debt *= Math.pow(1 + cfg.debtApr, years);
      return next;
    });

    if (stageIdx + 1 < cfg.stages.length) {
      setStageIdx((i) => i + 1);
      setPicked(null);
    } else {
      setFinished(true);
    }
  };

  const ending = useMemo(() => {
    if (!finished) return null;
    const nw = netWorth(state);
    const sorted = [...cfg.endings].sort((a, b) => b.minNetWorth - a.minNetWorth);
    return sorted.find((e) => nw >= e.minNetWorth) ?? sorted[sorted.length - 1];
  }, [finished, state, cfg.endings]);

  // ── Finished: payoff reveal ──
  if (finished && ending) {
    const nw = netWorth(state);
    const isGreat = nw >= (cfg.endings[0]?.minNetWorth ?? Infinity) * 0.6;
    return (
      <div className="animate-scale-in relative">
        {isGreat && <Fireworks bursts={7} />}
        <div className="text-center mb-5">
          <div className="text-6xl mb-2 animate-prize-pop">{ending.emoji}</div>
          <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--c-green))' }}>
            {lang === 'en' ? `Age ${cfg.stages[cfg.stages.length - 1].age + cfg.stages[cfg.stages.length - 1].yearsToNext} · the result` : `Възраст ${cfg.stages[cfg.stages.length - 1].age + cfg.stages[cfg.stages.length - 1].yearsToNext} · резултатът`}
          </p>
          <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {ending.title[lang]}
          </h2>
        </div>

        {/* Net worth headline */}
        <div className="rounded-2xl p-5 mb-4 text-center"
          style={{ background: 'hsl(var(--c-green)/0.10)', border: '1px solid hsl(var(--c-green)/0.3)' }}>
          <p className="text-xs uppercase tracking-widest font-bold mb-1" style={{ color: 'hsl(var(--c-green))' }}>
            {lang === 'en' ? 'Net worth' : 'Нетна стойност'}
          </p>
          <p className="text-4xl font-black" style={{ color: 'hsl(var(--c-green))' }}>€{fmt(nw)}</p>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <StatBox label={lang === 'en' ? 'Invested' : 'Инвестирано'} value={`€${fmt(state.investments)}`} color="hsl(var(--c-primary))" />
          <StatBox label={lang === 'en' ? 'Cash' : 'Кеш'} value={`€${fmt(state.cash)}`} color="hsl(var(--c-fg))" />
          <StatBox label={lang === 'en' ? 'Debt' : 'Дълг'} value={`€${fmt(state.debt)}`} color="hsl(var(--c-red))" />
        </div>

        <p className="text-sm leading-relaxed mb-5 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {ending.message[lang]}
        </p>

        {/* Happiness + wisdom */}
        <div className="flex items-center justify-center gap-4 mb-6 text-sm">
          <span style={{ color: 'hsl(var(--c-fg-muted))' }}>😊 {lang === 'en' ? 'Life satisfaction' : 'Удовлетворение'}: <b style={{ color: 'hsl(var(--c-fg))' }}>{Math.round(state.happiness)}/100</b></span>
          <span style={{ color: 'hsl(var(--c-fg-muted))' }}>🧠 {lang === 'en' ? 'Wise calls' : 'Мъдри избори'}: <b style={{ color: 'hsl(var(--c-fg))' }}>{state.wisdom}/{cfg.stages.length}</b></span>
        </div>

        <button className="btn-green w-full" onClick={() => onAnswer(true, exercise.xp)}>
          {lang === 'en' ? 'Finish →' : 'Завърши →'}
        </button>
      </div>
    );
  }

  // ── Active stage ──
  const nw = netWorth(state);
  return (
    <div className="animate-fade-in">
      {/* Persistent stats dashboard */}
      <div className="rounded-2xl p-3.5 mb-4 grid grid-cols-4 gap-2"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <Metric label={lang === 'en' ? 'Age' : 'Възраст'} value={`${stage.age}`} />
        <Metric label={lang === 'en' ? 'Net worth' : 'Нетна ст-ст'} value={`€${fmt(nw)}`} accent={nw >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'} />
        <Metric label={lang === 'en' ? 'Invested' : 'Инвест.'} value={`€${fmt(state.investments)}`} />
        <Metric label={lang === 'en' ? 'Debt' : 'Дълг'} value={`€${fmt(state.debt)}`} accent={state.debt > 0 ? 'hsl(var(--c-red))' : undefined} />
      </div>

      {/* Progress dots */}
      <div className="flex items-center gap-1.5 mb-4">
        {cfg.stages.map((_, i) => (
          <div key={i} className="flex-1 h-1 rounded-full"
            style={{ background: i <= stageIdx ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg)/0.12)' }} />
        ))}
      </div>

      {/* Scenario */}
      <div className="rounded-2xl p-5 mb-4"
        style={{ background: 'hsl(var(--c-primary)/0.07)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0">{stage.emoji ?? '🧑'}</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? `Age ${stage.age}` : `Възраст ${stage.age}`} · {stage.title[lang]}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
              {stage.scenario[lang]}
            </p>
          </div>
        </div>
      </div>

      {/* Choices */}
      <div className="space-y-2.5 mb-4">
        {stage.choices.map((c, i) => {
          const isPicked = picked === i;
          const isOther = picked !== null && !isPicked;
          return (
            <button key={i}
              onClick={() => applyChoice(i)}
              disabled={picked !== null}
              className="w-full text-left rounded-xl p-3.5 transition-all"
              style={{
                background: isPicked ? (c.wise ? 'hsl(var(--c-green)/0.12)' : 'hsl(var(--c-orange)/0.10)') : 'var(--c-glass)',
                border: `1.5px solid ${isPicked ? (c.wise ? 'hsl(var(--c-green)/0.5)' : 'hsl(var(--c-orange)/0.4)') : 'var(--c-border)'}`,
                opacity: isOther ? 0.4 : 1,
              }}>
              <div className="flex items-center gap-3">
                <span className="text-xl flex-shrink-0">{c.emoji ?? '•'}</span>
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>{c.label[lang]}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Outcome reveal */}
      {chosen && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: chosen.wise ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-orange)/0.08)',
            border: `1px solid ${chosen.wise ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-orange)/0.3)'}`,
          }}>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-lg">{chosen.wise ? '💡' : '🤔'}</span>
            <span className="font-bold text-sm" style={{ color: chosen.wise ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))' }}>
              {chosen.wise ? (lang === 'en' ? 'Smart move' : 'Умен ход') : (lang === 'en' ? 'Hmm…' : 'Хмм…')}
            </span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {chosen.outcome[lang]}
          </p>
        </div>
      )}

      {chosen && (
        <button className="btn-primary w-full" onClick={advance}>
          {stageIdx + 1 < cfg.stages.length
            ? (lang === 'en' ? `${stage.yearsToNext} years later →` : `${stage.yearsToNext} години по-късно →`)
            : (lang === 'en' ? 'See your result →' : 'Виж резултата →')}
        </button>
      )}
    </div>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="text-center">
      <p className="text-[9px] uppercase tracking-wide font-bold mb-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
      <p className="text-sm font-black truncate" style={{ color: accent ?? 'hsl(var(--c-fg))' }}>{value}</p>
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
      <p className="text-[9px] uppercase tracking-wide font-bold mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
      <p className="text-sm font-black truncate" style={{ color }}>{value}</p>
    </div>
  );
}
