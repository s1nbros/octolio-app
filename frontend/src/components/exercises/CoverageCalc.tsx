import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function CoverageCalc({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.coverageCalc!;
  const [premium, setPremium] = useState(cfg.correctPremium); // start at correct so user has to think
  const [deductibleIdx, setDeductibleIdx] = useState(
    Math.max(0, cfg.deductibleOptions.indexOf(cfg.correctDeductible)),
  );
  const [coverageIdx, setCoverageIdx] = useState(
    Math.max(0, cfg.coverageLimitOptions.indexOf(cfg.correctCoverageLimit)),
  );
  const [submitted, setSubmitted] = useState(false);

  // Reset starting position to defaults the user must adjust:
  // (use a one-time init by spreading from middle option)
  // Note: starting from correct on purpose to let users explore freely;
  // many learners experiment first then submit.

  const deductible = cfg.deductibleOptions[deductibleIdx];
  const coverageLimit = cfg.coverageLimitOptions[coverageIdx];

  // Expected payout per year = probability × min(loss − deductible, coverageLimit)
  const expectedPayout = useMemo(() => {
    const claimable = Math.max(0, Math.min(cfg.expectedLoss - deductible, coverageLimit));
    return cfg.claimProbability * claimable;
  }, [deductible, coverageLimit, cfg]);
  const ev = expectedPayout - premium; // positive = insurer is underpriced (good for you)

  // Worst-case out-of-pocket if claim hits = deductible + (loss − coverageLimit) above limit
  const worstCase = useMemo(() => {
    const aboveLimit = Math.max(0, cfg.expectedLoss - coverageLimit - deductible);
    return premium + deductible + aboveLimit;
  }, [premium, deductible, coverageLimit, cfg.expectedLoss]);

  const isCorrect = useMemo(() => {
    return Math.abs(premium - cfg.correctPremium) <= cfg.tolerance
      && deductible === cfg.correctDeductible
      && coverageLimit === cfg.correctCoverageLimit;
  }, [premium, deductible, coverageLimit, cfg]);

  const handleSubmit = () => {
    setSubmitted(true);
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

      <p className="text-base font-semibold leading-relaxed mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      {/* Stats panel */}
      <div className="rounded-2xl p-4 mb-4 grid grid-cols-3 gap-2"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="text-center">
          <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Claim odds' : 'Шанс за щета'}
          </p>
          <p className="text-sm font-black" style={{ color: 'hsl(var(--c-orange))' }}>
            {(cfg.claimProbability * 100).toFixed(1)}%
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Possible loss' : 'Възможна щета'}
          </p>
          <p className="text-sm font-black" style={{ color: 'hsl(var(--c-red))' }}>
            €{cfg.expectedLoss.toLocaleString()}
          </p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Worst case' : 'Най-лош случай'}
          </p>
          <p className="text-sm font-black" style={{ color: 'hsl(var(--c-purple))' }}>
            €{Math.round(worstCase).toLocaleString()}
          </p>
        </div>
      </div>

      {/* Premium slider */}
      <div className="mb-4 rounded-2xl p-4"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="flex justify-between mb-1">
          <span className="text-sm font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
            💸 {lang === 'en' ? 'Annual premium' : 'Годишна вноска'}
          </span>
          <span className="text-sm font-bold mono" style={{ color: 'hsl(var(--c-primary))' }}>
            €{premium}/yr
          </span>
        </div>
        <input type="range"
          min={cfg.premiumMin} max={cfg.premiumMax} step={cfg.premiumStep}
          value={premium}
          disabled={submitted}
          onChange={e => setPremium(Number(e.target.value))}
          style={{ accentColor: 'hsl(var(--c-primary))', width: '100%' }} />

        {/* Deductible chips */}
        <p className="text-sm font-semibold mt-3 mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
          🧾 {lang === 'en' ? 'Deductible' : 'Самоучастие'}
        </p>
        <div className="flex gap-2 flex-wrap">
          {cfg.deductibleOptions.map((d, i) => {
            const sel = i === deductibleIdx;
            return (
              <button key={i} disabled={submitted}
                onClick={() => setDeductibleIdx(i)}
                className="text-xs font-bold px-3 py-1.5 rounded-full mono"
                style={{
                  background: sel ? 'hsl(var(--c-orange)/0.18)' : 'var(--c-glass)',
                  border: `1.5px solid ${sel ? 'hsl(var(--c-orange))' : 'var(--c-border)'}`,
                  color: sel ? 'hsl(var(--c-orange))' : 'hsl(var(--c-fg-muted))',
                }}>
                €{d}
              </button>
            );
          })}
        </div>

        {/* Coverage limit chips */}
        <p className="text-sm font-semibold mt-3 mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
          🛡️ {lang === 'en' ? 'Coverage limit' : 'Лимит на покритие'}
        </p>
        <div className="flex gap-2 flex-wrap">
          {cfg.coverageLimitOptions.map((c, i) => {
            const sel = i === coverageIdx;
            return (
              <button key={i} disabled={submitted}
                onClick={() => setCoverageIdx(i)}
                className="text-xs font-bold px-3 py-1.5 rounded-full mono"
                style={{
                  background: sel ? 'hsl(var(--c-green)/0.18)' : 'var(--c-glass)',
                  border: `1.5px solid ${sel ? 'hsl(var(--c-green))' : 'var(--c-border)'}`,
                  color: sel ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg-muted))',
                }}>
                €{c.toLocaleString()}
              </button>
            );
          })}
        </div>
      </div>

      {/* EV math */}
      <div className="rounded-2xl p-3 mb-4"
        style={{ background: 'hsl(var(--c-purple)/0.07)', border: '1px solid hsl(var(--c-purple)/0.2)' }}>
        <p className="text-[11px] uppercase mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Expected value math (per year)' : 'Очаквана стойност (годишно)'}
        </p>
        <p className="text-xs mono" style={{ color: 'hsl(var(--c-fg))' }}>
          ({(cfg.claimProbability * 100).toFixed(1)}% × €{Math.min(cfg.expectedLoss - deductible, coverageLimit).toLocaleString()})
          − €{premium} = <strong style={{ color: ev >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {ev >= 0 ? '+' : '−'}€{Math.abs(ev).toFixed(0)}
          </strong>
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en'
            ? 'Insurance is rarely +EV — you pay for peace of mind. Goal: cover the catastrophic, accept the small.'
            : 'Застраховките рядко са +EV — плащаш за спокойствие. Целта: покрий катастрофичното, приеми малкото.'}
        </p>
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
              ? (lang === 'en' ? '✓ Smart coverage!' : '✓ Умно покритие!')
              : (lang === 'en'
                ? `✗ Sweet spot: €${cfg.correctPremium}/yr · €${cfg.correctDeductible} deductible · €${cfg.correctCoverageLimit.toLocaleString()} coverage`
                : `✗ Златна среда: €${cfg.correctPremium}/г. · €${cfg.correctDeductible} самоучастие · €${cfg.correctCoverageLimit.toLocaleString()} покритие`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit}>
          {lang === 'en' ? 'Lock in policy →' : 'Финализирай полицата →'}
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
