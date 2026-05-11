import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

type Vibe = { emoji: string; label: { en: string; bg: string }; color: string };

function vibeFor(value: number, ideal: number): Vibe {
  if (ideal <= 0) return { emoji: '🙂', label: { en: 'OK', bg: 'Ок' }, color: 'hsl(var(--c-fg-muted))' };
  const diff = (value - ideal) / ideal;
  const abs = Math.abs(diff);
  if (abs < 0.1) return { emoji: '🎯', label: { en: 'Sweet spot', bg: 'Идеално' }, color: 'hsl(var(--c-green))' };
  if (abs < 0.25) return { emoji: '🙂', label: { en: 'Close enough', bg: 'Близо' }, color: 'hsl(var(--c-orange))' };
  if (diff > 0) return { emoji: '🥵', label: { en: 'Overspending', bg: 'Прекалено' }, color: 'hsl(var(--c-red))' };
  return { emoji: '😰', label: { en: 'Too tight', bg: 'Прекалено малко' }, color: 'hsl(var(--c-red))' };
}

export function BudgetSlider({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const income = exercise.income ?? 3000;
  const cats = exercise.categories ?? [];

  const [values, setValues] = useState<number[]>(cats.map(c => c.ideal));
  const [submitted, setSubmitted] = useState(false);
  const [shake, setShake] = useState(false);

  const total = useMemo(() => values.reduce((a, b) => a + b, 0), [values]);
  const remaining = income - total;
  const overBudget = remaining < 0;

  // Live score (recomputes as user drags — visible BEFORE submit too)
  const score = useMemo(() => {
    let s = 0;
    cats.forEach((c, i) => {
      const abs = Math.abs(values[i] - c.ideal) / c.ideal;
      if (abs < 0.1) s += 2;
      else if (abs < 0.25) s += 1;
    });
    return s;
  }, [values, cats]);

  const maxScore = cats.length * 2;
  const scorePct = maxScore > 0 ? (score / maxScore) * 100 : 0;
  const isGood = score >= maxScore * 0.7;

  const scoreColor =
    scorePct >= 70 ? 'hsl(var(--c-green))'
    : scorePct >= 40 ? 'hsl(var(--c-orange))'
    : 'hsl(var(--c-red))';

  const headlineEmoji = scorePct >= 90 ? '🤩' : scorePct >= 70 ? '🎯' : scorePct >= 40 ? '🤔' : '😬';
  const headline = useMemo<{ en: string; bg: string }>(() => {
    if (!submitted) return { en: 'Tweak each slider to hit the budget sweet spot', bg: 'Настрой плъзгачите, за да уцелиш идеалния бюджет' };
    if (scorePct >= 90) return { en: 'Perfect budget! Octi the financial octopus is proud 🐙', bg: 'Перфектен бюджет! Финансовият октопод Окти е горд 🐙' };
    if (scorePct >= 70) return { en: 'Great allocation — solid financial foundation!', bg: 'Чудесно разпределение — солидна основа!' };
    if (scorePct >= 40) return { en: 'Decent try — a few categories drifted too far.', bg: 'Добър опит — някои категории се отклониха.' };
    return { en: 'Yikes — let\'s tune this. Tap "Continue" to learn from it.', bg: 'Ехх — нека го поправим. Натисни "Продължи".' };
  }, [submitted, scorePct, lang]);

  const handleSubmit = () => {
    if (overBudget) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    setSubmitted(true);
  };

  const handleContinue = () => onAnswer(isGood, isGood ? exercise.xp : 0);

  return (
    <div className={`animate-fade-in ${shake ? 'animate-shake' : ''}`}>
      {/* Income header */}
      <div className="rounded-xl p-4 mb-4 text-center"
        style={{ background: 'hsl(var(--c-green)/0.08)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
        <p className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: 'hsl(var(--c-green))' }}>
          {lang === 'en' ? 'Monthly Income' : 'Месечен доход'}
        </p>
        <p className="text-3xl font-black" style={{ color: 'hsl(var(--c-fg))' }}>€{income.toLocaleString()}</p>
      </div>

      {/* Live score meter */}
      <div className="rounded-xl p-3 mb-5"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-bold uppercase tracking-wide flex items-center gap-1"
            style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            <span className="text-base">{headlineEmoji}</span>
            {lang === 'en' ? 'Budget Health' : 'Здраве на бюджета'}
          </span>
          <span className="text-sm font-black mono" style={{ color: scoreColor }}>
            {score}/{maxScore}
          </span>
        </div>
        <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(228, 12%, 18%)' }}>
          <div className="h-full transition-all duration-300"
            style={{ width: `${scorePct}%`, background: scoreColor }} />
        </div>
        <p className="text-xs mt-2 leading-snug" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {t(headline)}
        </p>
      </div>

      {/* Sliders */}
      <div className="space-y-4 mb-5">
        {cats.map((cat, i) => {
          const pct = Math.round((values[i] / income) * 100);
          const vibe = vibeFor(values[i], cat.ideal);
          const abs = Math.abs(values[i] - cat.ideal) / cat.ideal;
          const sliderColor = abs < 0.1 ? 'hsl(var(--c-green))'
            : abs < 0.25 ? 'hsl(var(--c-orange))'
            : values[i] > cat.ideal ? 'hsl(var(--c-red))'
            : 'hsl(var(--c-red))';

          // Compute marker position (where ideal sits on the slider track)
          const idealMarkerPct = ((cat.ideal - cat.min) / (cat.max - cat.min)) * 100;

          return (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                  {cat.emoji} {t(cat.label)}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold" style={{ color: sliderColor }}>
                    €{values[i]}
                  </span>
                  <span className="text-xs mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>({pct}%)</span>
                </div>
              </div>
              <div className="relative">
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
                  style={{ accentColor: sliderColor, width: '100%' }}
                />
                {/* Ideal marker: only revealed after submit so it's a real puzzle */}
                {submitted && (
                  <div
                    className="absolute pointer-events-none animate-fade-in"
                    style={{
                      left: `calc(${idealMarkerPct}% - 1px)`,
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: 2, height: 14,
                      background: 'hsl(var(--c-green))',
                      boxShadow: '0 0 6px hsl(var(--c-green))',
                    }}
                  />
                )}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs font-medium flex items-center gap-1" style={{ color: vibe.color }}>
                  <span>{vibe.emoji}</span>
                  <span>{t(vibe.label)}</span>
                </span>
                {submitted && (
                  <span className="text-xs animate-fade-in" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {lang === 'en' ? 'Ideal:' : 'Идеал:'} €{cat.ideal}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Remaining */}
      <div className="rounded-xl p-3 mb-5 flex items-center justify-between"
        style={{
          background: overBudget ? 'hsl(var(--c-red)/0.1)' : remaining > 0 ? 'hsl(var(--c-orange)/0.08)' : 'hsl(var(--c-green)/0.08)',
          border: `1px solid ${overBudget ? 'hsl(var(--c-red)/0.3)' : remaining > 0 ? 'hsl(var(--c-orange)/0.3)' : 'hsl(var(--c-green)/0.25)'}`,
        }}>
        <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {overBudget
            ? (lang === 'en' ? '🚨 Over budget' : '🚨 Над бюджета')
            : remaining > 0
              ? (lang === 'en' ? '💸 Unspent' : '💸 Неразпределени')
              : (lang === 'en' ? '✅ All allocated' : '✅ Всичко разпределено')}
        </span>
        <span className="text-lg font-black mono"
          style={{ color: overBudget ? 'hsl(var(--c-red))' : remaining > 0 ? 'hsl(var(--c-orange))' : 'hsl(var(--c-green))' }}>
          {overBudget ? '-' : ''}€{Math.abs(remaining)}
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
              ? (lang === 'en' ? `🎯 Great budget — +${exercise.xp} XP!` : `🎯 Чудесен бюджет — +${exercise.xp} XP!`)
              : (lang === 'en' ? '📊 Almost — check the green markers!' : '📊 Почти — виж зелените маркери!')}
          </p>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en' ? 'Tip: the 50/30/20 rule is a guide, not a law — adjust to your life.' : 'Съвет: правилото 50/30/20 е насока, не закон — адаптирай го.'}
          </p>
        </div>
      )}

      {!submitted && (
        <button
          className="btn-primary w-full"
          onClick={handleSubmit}
          disabled={overBudget}
          title={overBudget ? (lang === 'en' ? 'You\'re spending more than you earn!' : 'Харчиш повече от приходите!') : ''}>
          {lang === 'en' ? 'Lock in Budget 🔒' : 'Заключи бюджета 🔒'}
        </button>
      )}
      {submitted && (
        <button className="btn-primary w-full" onClick={handleContinue}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
