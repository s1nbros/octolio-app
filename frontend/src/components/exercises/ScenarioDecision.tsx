import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function ScenarioDecision({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const choices = exercise.decisionChoices ?? [];
  const [chosen, setChosen] = useState<number | null>(null);
  const [showOutcomes, setShowOutcomes] = useState(false);
  const selected = chosen !== null ? choices[chosen] : null;

  const handlePick = (i: number) => {
    if (chosen !== null) return;
    setChosen(i);
    setTimeout(() => setShowOutcomes(true), 600);
    setTimeout(() => onAnswer(choices[i].isBest, choices[i].isBest ? exercise.xp : Math.floor(exercise.xp * 0.3)), 3000);
  };

  return (
    <div className="animate-fade-in">
      {/* Scenario card */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: 'hsl(var(--c-purple)/0.07)', border: '1px solid hsl(var(--c-purple)/0.2)' }}>
        <div className="flex items-start gap-3">
          <span className="text-3xl flex-shrink-0 mt-0.5">{exercise.decisionAvatar ?? '🤔'}</span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide mb-1.5" style={{ color: 'hsl(var(--c-purple))' }}>
              {lang === 'en' ? 'Scenario' : 'Сценарий'}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
              {t(exercise.decisionScenario!)}
            </p>
          </div>
        </div>
      </div>

      <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'What would you do?' : 'Какво би направил?'}
      </p>

      {/* Choice buttons */}
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
                  ? c.isBest ? 'hsl(var(--c-green)/0.12)' : 'hsl(var(--c-orange)/0.12)'
                  : 'var(--c-glass)',
                border: `1.5px solid ${isPicked
                  ? c.isBest ? 'hsl(var(--c-green)/0.5)' : 'hsl(var(--c-orange)/0.5)'
                  : 'var(--c-border)'}`,
                opacity: isOther ? 0.4 : 1,
                transform: isPicked ? 'translateX(4px)' : undefined,
              }}>
              <div className="flex items-center gap-3">
                <span className="text-xl">{c.emoji}</span>
                <span className="text-sm font-medium flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {c.label[lang]}
                </span>
                {isPicked && (
                  <span className="ml-auto text-lg">{c.isBest ? '⭐' : '💭'}</span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Outcomes reveal */}
      {showOutcomes && selected && (
        <div className="space-y-3 animate-slide-up">
          {/* Your choice outcome */}
          <div className="rounded-xl p-4"
            style={{
              background: selected.isBest ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-orange)/0.1)',
              border: `1px solid ${selected.isBest ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-orange)/0.3)'}`,
            }}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{selected.isBest ? '🎯' : '📉'}</span>
              <span className="font-bold text-sm"
                style={{ color: selected.isBest ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))' }}>
                {selected.isBest
                  ? (lang === 'en' ? 'Best choice!' : 'Най-добър избор!')
                  : (lang === 'en' ? 'Not optimal' : 'Не е оптимално')}
              </span>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(selected.outcome)}
            </p>
          </div>

          {/* Show the best choice if user didn't pick it */}
          {!selected.isBest && (
            <div className="rounded-xl p-4"
              style={{ background: 'hsl(var(--c-green)/0.06)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--c-green))' }}>
                {lang === 'en' ? '💡 Better option:' : '💡 По-добър вариант:'}
              </p>
              {choices.filter(c => c.isBest).map((best, idx) => (
                <div key={idx}>
                  <p className="text-sm font-medium mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
                    {best.emoji} {best.label[lang]}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {t(best.outcome)}
                  </p>
                </div>
              ))}
            </div>
          )}

          {exercise.explanation && (
            <div className="rounded-xl p-3"
              style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
              <p className="text-xs font-semibold mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? '📚 Key takeaway' : '📚 Ключов извод'}
              </p>
              <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {t(exercise.explanation)}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
