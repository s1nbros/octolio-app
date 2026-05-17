import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function OrderItems({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const items = exercise.orderItems ?? [];
  const correctOrder = exercise.correctOrder ?? items.map((_, i) => i);

  // Start with shuffled order
  const [order, setOrder] = useState<number[]>(() => {
    const indices = items.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleTap = (positionIdx: number) => {
    if (submitted) return;
    if (selectedIdx === null) {
      setSelectedIdx(positionIdx);
    } else if (selectedIdx === positionIdx) {
      setSelectedIdx(null);
    } else {
      // Swap items
      const newOrder = [...order];
      [newOrder[selectedIdx], newOrder[positionIdx]] = [newOrder[positionIdx], newOrder[selectedIdx]];
      setOrder(newOrder);
      setSelectedIdx(null);
    }
  };

  const correctCount = order.reduce((sum, itemIdx, posIdx) => sum + (itemIdx === correctOrder[posIdx] ? 1 : 0), 0);
  const score = items.length > 0 ? correctCount / items.length : 0;
  const isPassing = score >= 0.7;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const isItemCorrect = (posIdx: number) => order[posIdx] === correctOrder[posIdx];

  return (
    <div className="animate-fade-in">
      <p className="text-sm mb-2 text-center font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
        {exercise.orderInstruction ? t(exercise.orderInstruction) : (lang === 'en' ? 'Put these in the correct order' : 'Подреди ги в правилен ред')}
      </p>
      <p className="text-xs mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? '↕ Tap two items to swap their positions'
          : '↕ Натисни два елемента, за да ги размениш'}
      </p>

      <div className="space-y-2 mb-5">
        {order.map((itemIdx, posIdx) => {
          const item = items[itemIdx];
          const isSelected = selectedIdx === posIdx;
          return (
            <button key={posIdx}
              onClick={() => handleTap(posIdx)}
              disabled={submitted}
              className="w-full text-left rounded-xl px-4 py-3.5 transition-all duration-200 flex items-center gap-3"
              style={{
                background: submitted
                  ? isItemCorrect(posIdx) ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)'
                  : isSelected ? 'hsl(var(--c-primary)/0.12)' : 'var(--c-glass)',
                border: `1.5px solid ${submitted
                  ? isItemCorrect(posIdx) ? 'hsl(var(--c-green)/0.4)' : 'hsl(var(--c-red)/0.4)'
                  : isSelected ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                transform: isSelected ? 'scale(1.02)' : undefined,
              }}>
              {/* Position number */}
              <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
                style={{
                  background: submitted
                    ? isItemCorrect(posIdx) ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))'
                    : isSelected ? 'hsl(var(--c-primary))' : 'var(--c-glass)',
                  color: submitted || isSelected ? '#fff' : 'hsl(var(--c-fg-muted))',
                  border: !submitted && !isSelected ? '1.5px solid var(--c-border)' : 'none',
                }}>
                {submitted ? (isItemCorrect(posIdx) ? '✓' : '✗') : posIdx + 1}
              </span>

              <span className="text-xl flex-shrink-0">{item.emoji}</span>
              <span className="text-sm font-medium flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                {item.label[lang]}
              </span>

              {submitted && !isItemCorrect(posIdx) && (
                <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  →{correctOrder.indexOf(itemIdx) + 1}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: order.every((itemIdx, posIdx) => itemIdx === correctOrder[posIdx])
              ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-orange)/0.1)',
            border: `1px solid ${order.every((itemIdx, posIdx) => itemIdx === correctOrder[posIdx])
              ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-orange)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm" style={{
            color: order.every((itemIdx, posIdx) => itemIdx === correctOrder[posIdx])
              ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))'
          }}>
            {order.every((itemIdx, posIdx) => itemIdx === correctOrder[posIdx])
              ? (lang === 'en' ? '✓ Perfect order!' : '✓ Перфектна подредба!')
              : (lang === 'en' ? 'Check the correct positions above' : 'Провери правилните позиции по-горе')}
          </p>
          {exercise.explanation && (
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit}>
          {lang === 'en' ? 'Check Order →' : 'Провери реда →'}
        </button>
      )}
      {submitted && (
        <button className="btn-primary w-full" onClick={() => onAnswer(isPassing, isPassing ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
