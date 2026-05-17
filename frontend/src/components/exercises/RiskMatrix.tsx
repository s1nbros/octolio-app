import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

// Quadrant index:
//  0 = low impact / low likelihood    → ACCEPT
//  1 = low impact / high likelihood   → MITIGATE
//  2 = high impact / low likelihood   → TRANSFER (insure)
//  3 = high impact / high likelihood  → AVOID
const QUADRANTS: Array<{
  label: { en: string; bg: string };
  strategy: { en: string; bg: string };
  emoji: string;
  color: string;
}> = [
  { label: { en: 'Low impact · Low chance', bg: 'Малка щета · Малък шанс' }, strategy: { en: 'Accept', bg: 'Приеми' }, emoji: '🤷', color: 'hsl(var(--c-green))' },
  { label: { en: 'Low impact · High chance', bg: 'Малка щета · Голям шанс' }, strategy: { en: 'Mitigate', bg: 'Намали' }, emoji: '🛠️', color: 'hsl(var(--c-orange))' },
  { label: { en: 'High impact · Low chance', bg: 'Голяма щета · Малък шанс' }, strategy: { en: 'Transfer (insure)', bg: 'Прехвърли (застраховай)' }, emoji: '📜', color: 'hsl(var(--c-primary))' },
  { label: { en: 'High impact · High chance', bg: 'Голяма щета · Голям шанс' }, strategy: { en: 'Avoid', bg: 'Избягвай' }, emoji: '🚫', color: 'hsl(var(--c-red))' },
];

export function RiskMatrix({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.riskMatrix!;
  // placements[i] = quadrant assigned to risk i, or -1 if unassigned
  const [placements, setPlacements] = useState<number[]>(() => cfg.risks.map(() => -1));
  const [activeRisk, setActiveRisk] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const allPlaced = placements.every(p => p !== -1);
  const correctCount = useMemo(
    () => placements.filter((p, i) => p === cfg.risks[i].correctQuadrant).length,
    [placements, cfg.risks],
  );
  const isCorrect = correctCount === cfg.risks.length;

  const placeRisk = (riskIdx: number, quadrant: number) => {
    if (submitted) return;
    setPlacements(prev => {
      const next = prev.slice();
      next[riskIdx] = quadrant;
      return next;
    });
    setActiveRisk(null);
  };

  const handleSubmit = () => {
    if (!allPlaced) return;
    setSubmitted(true);
  };

  // Pile of risks to place (those not yet placed)
  const unplaced = cfg.risks.map((_, i) => i).filter(i => placements[i] === -1);

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

      {/* Unplaced risks pile */}
      {unplaced.length > 0 && (
        <div className="rounded-2xl p-3 mb-3"
          style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
          <p className="text-[11px] uppercase mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Tap a risk, then tap a quadrant' : 'Докосни риск, после квадрант'}
          </p>
          <div className="flex flex-wrap gap-2">
            {unplaced.map(i => {
              const sel = activeRisk === i;
              return (
                <button key={i}
                  onClick={() => !submitted && setActiveRisk(sel ? null : i)}
                  disabled={submitted}
                  className="text-xs font-bold px-3 py-2 rounded-full"
                  style={{
                    background: sel ? 'hsl(var(--c-primary)/0.18)' : 'hsl(228, 12%, 18%)',
                    border: `1.5px solid ${sel ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                    color: sel ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg))',
                  }}>
                  <span className="mr-1">{cfg.risks[i].emoji}</span>
                  {cfg.risks[i].label[lang]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 2x2 grid */}
      <div className="mb-1 flex">
        <div style={{ width: 70 }} />
        <div className="flex-1 grid grid-cols-2 gap-2 text-center text-[10px] uppercase font-bold mb-1"
          style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          <span>{lang === 'en' ? 'Low chance' : 'Малък шанс'}</span>
          <span>{lang === 'en' ? 'High chance' : 'Голям шанс'}</span>
        </div>
      </div>
      <div className="flex gap-2 mb-2">
        <div className="flex flex-col justify-around text-[10px] uppercase font-bold"
          style={{ width: 70, color: 'hsl(var(--c-fg-subtle))', writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}>
          <span>{lang === 'en' ? 'Low impact' : 'Малка щета'}</span>
          <span>{lang === 'en' ? 'High impact' : 'Голяма щета'}</span>
        </div>
        <div className="flex-1 grid grid-cols-2 gap-2">
          {/* Order: top-left = low/low(0), top-right = low/high(1), bottom-left = high/low(2), bottom-right = high/high(3) */}
          {[0, 1, 2, 3].map(q => {
            const placed = cfg.risks
              .map((_, i) => i)
              .filter(i => placements[i] === q);
            const info = QUADRANTS[q];
            const canDrop = activeRisk !== null && !submitted;
            return (
              <button key={q}
                onClick={() => activeRisk !== null && placeRisk(activeRisk, q)}
                disabled={submitted || activeRisk === null}
                className="rounded-2xl p-2 min-h-[110px] text-left transition-all"
                style={{
                  background: canDrop ? `${info.color.replace('))', ')/0.12)')}` : 'var(--c-glass)',
                  border: `1.5px ${canDrop ? 'dashed' : 'solid'} ${canDrop ? info.color : 'var(--c-border)'}`,
                  cursor: activeRisk !== null && !submitted ? 'pointer' : 'default',
                }}>
                <div className="text-[10px] font-bold uppercase mb-1"
                  style={{ color: info.color }}>
                  {info.emoji} {info.strategy[lang]}
                </div>
                <div className="text-[9px] mb-1.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {info.label[lang]}
                </div>
                <div className="flex flex-wrap gap-1">
                  {placed.map(i => {
                    const correct = submitted ? placements[i] === cfg.risks[i].correctQuadrant : null;
                    return (
                      <span key={i}
                        className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                        style={{
                          background: submitted
                            ? (correct ? 'hsl(var(--c-green)/0.15)' : 'hsl(var(--c-red)/0.15)')
                            : 'hsl(228, 12%, 22%)',
                          border: submitted
                            ? `1px solid ${correct ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'}`
                            : '1px solid var(--c-border)',
                          color: submitted
                            ? (correct ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))')
                            : 'hsl(var(--c-fg))',
                        }}>
                        {cfg.risks[i].emoji} {cfg.risks[i].label[lang]}
                        {submitted && !correct && (
                          <span className="ml-1 opacity-70" onClick={e => { e.stopPropagation(); }}>
                            → {QUADRANTS[cfg.risks[i].correctQuadrant].emoji}
                          </span>
                        )}
                      </span>
                    );
                  })}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Result */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 mt-3 animate-slide-up"
          style={{
            background: isCorrect ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm mb-1"
            style={{ color: isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {isCorrect
              ? (lang === 'en' ? '✓ All risks placed correctly!' : '✓ Всички рискове са правилно подредени!')
              : (lang === 'en' ? `✗ ${correctCount} of ${cfg.risks.length} placed correctly` : `✗ ${correctCount} от ${cfg.risks.length} правилно`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full mt-3" onClick={handleSubmit} disabled={!allPlaced}>
          {allPlaced
            ? (lang === 'en' ? 'Check matrix →' : 'Провери матрицата →')
            : (lang === 'en' ? `Place all risks (${unplaced.length} left)` : `Подреди всички (${unplaced.length} остават)`)}
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
