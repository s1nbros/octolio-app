import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onDone: () => void; }

export function TheoryCard({ exercise, onDone }: Props) {
  const { t } = useLang();
  const slides = exercise.slides ?? [];
  const [idx, setIdx] = useState(0);
  const slide = slides[idx];
  const isLast = idx === slides.length - 1;

  if (!slide) return null;

  return (
    <div className="animate-card-flip">
      {/* Progress dots */}
      {slides.length > 1 && (
        <div className="flex gap-1.5 justify-center mb-5">
          {slides.map((_, i) => (
            <div key={i} className="h-1.5 rounded-full transition-all duration-300"
              style={{
                width: i === idx ? '24px' : '6px',
                background: i <= idx ? 'hsl(var(--c-primary))' : 'var(--c-border)',
              }} />
          ))}
        </div>
      )}

      {/* Card */}
      <div className="theory-card mb-5" key={idx}>
        {slide.emoji && (
          <div className="text-5xl mb-4 text-center animate-bounce-soft">{slide.emoji}</div>
        )}
        <h3 className="text-xl font-bold mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
          {t(slide.title)}
        </h3>
        <p className="text-sm leading-relaxed whitespace-pre-line mb-4" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {t(slide.body)}
        </p>
        {slide.highlight && (
          <div className="rounded-xl p-3.5 mt-3"
            style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.25)' }}>
            <p className="text-sm font-medium" style={{ color: 'hsl(var(--c-green))' }}>
              {t(slide.highlight)}
            </p>
          </div>
        )}
      </div>

      <button
        className="btn-primary w-full"
        onClick={() => isLast ? onDone() : setIdx(i => i + 1)}
      >
        {isLast ? '✓ Got it!' : 'Next →'}
      </button>
    </div>
  );
}
