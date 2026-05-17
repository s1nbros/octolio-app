import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function RPGScenario({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const [chosen, setChosen] = useState<number | null>(null);
  const choices = exercise.choices ?? [];
  const selected = chosen !== null ? choices[chosen] : null;

  const handlePick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    const c = choices[i];
    if (c.isGood) {
      setTimeout(() => onAnswer(true, exercise.xp), 2200);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Scenario card */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: 'hsl(var(--c-primary)/0.07)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0 mt-0.5">{exercise.avatar ?? '🧑'}</span>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
            {t(exercise.scenario!)}
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'What do you do?' : 'Какво правиш?'}
      </p>

      {/* Choices */}
      <div className="space-y-3 mb-4">
        {choices.map((c, i) => {
          const isPicked = chosen === i;
          const isOther = chosen !== null && !isPicked;
          return (
            <button key={i}
              onClick={() => handlePick(i)}
              disabled={chosen !== null}
              className="w-full text-left rounded-xl p-4 transition-all duration-200"
              style={{
                background: isPicked
                  ? c.isGood ? 'hsl(var(--c-green)/0.12)' : 'hsl(var(--c-red)/0.12)'
                  : 'var(--c-glass)',
                border: `1.5px solid ${isPicked
                  ? c.isGood ? 'hsl(var(--c-green)/0.5)' : 'hsl(var(--c-red)/0.5)'
                  : 'var(--c-border)'}`,
                opacity: isOther ? 0.4 : 1,
                transform: isPicked ? 'translateX(4px)' : undefined,
              }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>
                  {c.label[lang]}
                </span>
                {isPicked && (
                  <span className="ml-auto text-lg">{c.isGood ? '✅' : '❌'}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Consequence reveal */}
      {selected && (
        <div className="rounded-xl p-4 animate-slide-up"
          style={{
            background: selected.isGood ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${selected.isGood ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">{selected.isGood ? '💡' : '⚠️'}</span>
            <span className="font-bold text-sm"
              style={{ color: selected.isGood ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
              {lang === 'en'
                ? (selected.isGood ? 'Good move!' : 'Ouch...')
                : (selected.isGood ? 'Добър ход!' : 'Аух...')}
            </span>
            {selected.cashFlowChange !== 0 && (
              <span className="ml-auto text-sm font-bold"
                style={{ color: selected.cashFlowChange > 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
                {selected.cashFlowChange > 0 ? '+' : ''}€{Math.abs(selected.cashFlowChange)}
              </span>
            )}
          </div>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {t(selected.consequence)}
          </p>
        </div>
      )}

      {selected && !selected.isGood && (
        <button className="btn-primary w-full mt-4" onClick={() => onAnswer(false, 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
