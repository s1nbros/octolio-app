import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

type Strategy = 'snowball' | 'avalanche' | 'even';

interface SimResult { months: number; totalInterest: number; }

function simulate(
  debts: { balance: number; apr: number; minPayment: number }[],
  extraPayment: number,
  strategy: Strategy,
): SimResult {
  // Clone
  const ds = debts.map(d => ({ ...d }));
  let totalInterest = 0;
  let months = 0;
  const MAX_MONTHS = 600;

  while (ds.some(d => d.balance > 0.01) && months < MAX_MONTHS) {
    months++;

    // Accrue interest
    for (const d of ds) {
      if (d.balance > 0) {
        const interest = d.balance * (d.apr / 100 / 12);
        d.balance += interest;
        totalInterest += interest;
      }
    }

    // Pay minimums on each
    let availableExtra = extraPayment;
    for (const d of ds) {
      if (d.balance > 0) {
        const pay = Math.min(d.balance, d.minPayment);
        d.balance -= pay;
      }
    }

    // Distribute extra
    if (availableExtra > 0) {
      let order: number[] = ds.map((_, i) => i).filter(i => ds[i].balance > 0.01);
      if (strategy === 'snowball') order.sort((a, b) => ds[a].balance - ds[b].balance);
      else if (strategy === 'avalanche') order.sort((a, b) => ds[b].apr - ds[a].apr);

      if (strategy === 'even') {
        const active = order.length;
        if (active > 0) {
          const each = availableExtra / active;
          for (const i of order) {
            const pay = Math.min(ds[i].balance, each);
            ds[i].balance -= pay;
          }
        }
      } else {
        for (const i of order) {
          if (availableExtra <= 0) break;
          const pay = Math.min(ds[i].balance, availableExtra);
          ds[i].balance -= pay;
          availableExtra -= pay;
        }
      }
    }
  }

  return { months, totalInterest: Math.round(totalInterest) };
}

export function DebtPayoff({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.debtPayoff!;
  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Pre-compute results for all 3 strategies (so user sees comparison after submit)
  const results = useMemo(() => ({
    snowball: simulate(cfg.debts, cfg.extraPayment, 'snowball'),
    avalanche: simulate(cfg.debts, cfg.extraPayment, 'avalanche'),
    even: simulate(cfg.debts, cfg.extraPayment, 'even'),
  }), [cfg]);

  const handleSubmit = () => {
    if (strategy === null) return;
    setSubmitted(true);
  };

  const totalDebt = cfg.debts.reduce((s, d) => s + d.balance, 0);

  const strategyLabels: Record<Strategy, { label: { en: string; bg: string }; emoji: string; desc: { en: string; bg: string } }> = {
    snowball: {
      label: { en: 'Snowball', bg: 'Снежна топка' },
      emoji: '⛄',
      desc: { en: 'Pay smallest balance first — quick wins for motivation', bg: 'Първо най-малкия баланс — бързи победи за мотивация' },
    },
    avalanche: {
      label: { en: 'Avalanche', bg: 'Лавина' },
      emoji: '🏔️',
      desc: { en: 'Pay highest APR first — saves the most interest', bg: 'Първо най-висок ГПР — спестява най-много лихва' },
    },
    even: {
      label: { en: 'Split evenly', bg: 'Разделено поравно' },
      emoji: '⚖️',
      desc: { en: 'Spread extra payment across all debts', bg: 'Разпредели допълнителното плащане върху всички дългове' },
    },
  };

  return (
    <div className="animate-fade-in">
      {cfg.scenario && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'hsl(var(--c-orange)/0.08)', border: '1px solid hsl(var(--c-orange)/0.25)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
            {t(cfg.scenario)}
          </p>
        </div>
      )}

      {/* Debt list */}
      <div className="rounded-2xl p-4 mb-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="flex justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wide" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Your Debts' : 'Твоите дългове'}
          </p>
          <p className="text-xs font-bold" style={{ color: 'hsl(var(--c-red))' }}>
            {lang === 'en' ? 'Total' : 'Общо'}: €{totalDebt.toLocaleString()}
          </p>
        </div>
        {cfg.debts.map((d, i) => (
          <div key={i} className="flex items-center gap-2 py-1.5 border-b last:border-b-0"
            style={{ borderColor: 'var(--c-border)' }}>
            <span className="text-lg">{d.emoji}</span>
            <span className="text-sm font-semibold flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
              {d.label[lang]}
            </span>
            <span className="text-xs mono" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              €{d.balance.toLocaleString()} · {d.apr}%
            </span>
          </div>
        ))}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <span className="text-lg">💪</span>
          <span className="text-sm font-semibold flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Extra payment available' : 'Допълнителна сума за плащане'}
          </span>
          <span className="text-xs mono font-bold" style={{ color: 'hsl(var(--c-green))' }}>
            +€{cfg.extraPayment}/mo
          </span>
        </div>
      </div>

      <p className="text-base font-semibold leading-relaxed mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      {/* Strategy buttons */}
      <div className="space-y-2 mb-4">
        {(['snowball', 'avalanche', 'even'] as Strategy[]).map(s => {
          const info = strategyLabels[s];
          const isSelected = strategy === s;
          const isCorrectS = submitted && s === cfg.correctStrategy;
          const isWrongS = submitted && isSelected && s !== cfg.correctStrategy;
          const r = results[s];
          return (
            <button key={s}
              onClick={() => !submitted && setStrategy(s)}
              disabled={submitted}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: isCorrectS ? 'hsl(var(--c-green)/0.12)'
                  : isWrongS ? 'hsl(var(--c-red)/0.12)'
                  : isSelected ? 'hsl(var(--c-primary)/0.1)'
                  : 'var(--c-glass)',
                border: `1.5px solid ${isCorrectS ? 'hsl(var(--c-green))'
                  : isWrongS ? 'hsl(var(--c-red))'
                  : isSelected ? 'hsl(var(--c-primary))'
                  : 'var(--c-border)'}`,
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{info.emoji}</span>
                <span className="text-sm font-bold flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {info.label[lang]}
                </span>
                {submitted && (
                  <span className="text-[10px] mono font-bold" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {Math.floor(r.months / 12)}y {r.months % 12}m · €{r.totalInterest.toLocaleString()}
                  </span>
                )}
              </div>
              <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {info.desc[lang]}
              </p>
            </button>
          );
        })}
      </div>

      {/* Result */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: strategy === cfg.correctStrategy ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${strategy === cfg.correctStrategy ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm mb-1"
            style={{ color: strategy === cfg.correctStrategy ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {strategy === cfg.correctStrategy
              ? (lang === 'en' ? `✓ ${strategyLabels[cfg.correctStrategy].label.en} wins!` : `✓ ${strategyLabels[cfg.correctStrategy].label.bg} печели!`)
              : (lang === 'en' ? `✗ The optimal choice was: ${strategyLabels[cfg.correctStrategy].label.en}` : `✗ Оптималният избор беше: ${strategyLabels[cfg.correctStrategy].label.bg}`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={strategy === null}>
          {lang === 'en' ? 'Run Simulation →' : 'Стартирай симулация →'}
        </button>
      )}
      {submitted && (
        <button className="btn-primary w-full" onClick={() => onAnswer(strategy === cfg.correctStrategy, strategy === cfg.correctStrategy ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
