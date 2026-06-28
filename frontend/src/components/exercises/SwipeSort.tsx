import { useRef, useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

const THRESHOLD = 90; // px to commit a swipe

/**
 * Swipe Sort — a Tinder-style deck. Flick each card left or right (or use the
 * buttons) to categorize it. Immediate ✓/✗ flash per card, score at the end.
 * Passing bar: at most one mistake.
 */
export function SwipeSort({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const cfg = exercise.swipeSort!;
  const cards = cfg.cards;

  const [idx, setIdx] = useState(0);
  const [drag, setDrag] = useState(0);            // current horizontal offset
  const [flash, setFlash] = useState<null | { correct: boolean; explanation?: string }>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const startX = useRef<number | null>(null);
  const animatingRef = useRef(false);

  const card = cards[idx];

  const commit = (side: 'left' | 'right') => {
    if (animatingRef.current || flash) return;
    animatingRef.current = true;
    const correct = (side === 'right') === card.isRight;
    if (correct) setCorrectCount((c) => c + 1);
    // Fling the card off-screen.
    setDrag(side === 'right' ? 600 : -600);
    setFlash({ correct, explanation: card.explanation?.[lang] });

    window.setTimeout(() => {
      const next = idx + 1;
      setFlash(null);
      setDrag(0);
      animatingRef.current = false;
      if (next >= cards.length) {
        setDone(true);
      } else {
        setIdx(next);
      }
    }, 950);
  };

  // ── Pointer drag ──
  const onDown = (e: React.PointerEvent) => {
    if (flash || animatingRef.current) return;
    startX.current = e.clientX;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };
  const onMove = (e: React.PointerEvent) => {
    if (startX.current === null) return;
    setDrag(e.clientX - startX.current);
  };
  const onUp = () => {
    if (startX.current === null) return;
    const dx = drag;
    startX.current = null;
    if (dx > THRESHOLD) commit('right');
    else if (dx < -THRESHOLD) commit('left');
    else setDrag(0); // snap back
  };

  // ── Finished ──
  if (done) {
    const total = cards.length;
    const passed = correctCount >= total - 1; // allow one slip
    return (
      <div className="animate-scale-in text-center">
        <div className="text-5xl mb-3">{passed ? '🎉' : '🔁'}</div>
        <h3 className="text-xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
          {correctCount} / {total} {lang === 'en' ? 'correct' : 'верни'}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {passed
            ? (lang === 'en' ? 'Nice sorting!' : 'Браво на сортирането!')
            : (lang === 'en' ? 'Close — review and try again.' : 'Близо — прегледай и опитай пак.')}
        </p>
        <button className="btn-primary w-full" onClick={() => onAnswer(passed, passed ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      </div>
    );
  }

  const rot = Math.max(-12, Math.min(12, drag / 12));
  const leaning = drag > 30 ? 'right' : drag < -30 ? 'left' : null;

  return (
    <div className="animate-fade-in select-none">
      <p className="text-base font-semibold leading-relaxed mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
        {cfg.prompt[lang]}
      </p>
      <p className="text-xs mb-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Swipe or tap a side · ' : 'Плъзни или натисни страна · '}{idx + 1}/{cards.length}
      </p>

      {/* Side labels */}
      <div className="flex justify-between mb-3 text-xs font-bold uppercase tracking-wide">
        <span style={{ color: leaning === 'left' ? 'hsl(var(--c-red))' : 'hsl(var(--c-fg-subtle))' }}>← {cfg.leftLabel[lang]}</span>
        <span style={{ color: leaning === 'right' ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg-subtle))' }}>{cfg.rightLabel[lang]} →</span>
      </div>

      {/* Card */}
      <div className="relative mb-5" style={{ height: 200 }}>
        {/* Peek of next card */}
        {cards[idx + 1] && (
          <div className="absolute inset-0 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', transform: 'scale(0.95) translateY(8px)', opacity: 0.6 }} />
        )}
        <div
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          className="absolute inset-0 rounded-2xl flex flex-col items-center justify-center px-6 text-center cursor-grab active:cursor-grabbing"
          style={{
            background: flash
              ? (flash.correct ? 'hsl(var(--c-green)/0.14)' : 'hsl(var(--c-red)/0.12)')
              : 'hsl(var(--c-bg-elevated, var(--c-bg)))',
            border: `2px solid ${flash ? (flash.correct ? 'hsl(var(--c-green)/0.6)' : 'hsl(var(--c-red)/0.6)') : 'hsl(var(--c-primary)/0.3)'}`,
            transform: `translateX(${drag}px) rotate(${rot}deg)`,
            transition: startX.current === null ? 'transform 0.35s cubic-bezier(0.2,0.8,0.2,1)' : 'none',
            boxShadow: '0 12px 32px hsl(0,0%,0%,0.25)',
            touchAction: 'pan-y',
          }}
        >
          {card.emoji && <span className="text-4xl mb-2">{card.emoji}</span>}
          <span className="text-lg font-bold" style={{ color: 'hsl(var(--c-fg))' }}>{card.label[lang]}</span>
          {flash && (
            <span className="mt-2 text-2xl">{flash.correct ? '✓' : '✗'}</span>
          )}
        </div>
      </div>

      {/* Flash explanation */}
      {flash?.explanation && (
        <div className="rounded-xl p-3 mb-4 text-sm animate-slide-up"
          style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
          {flash.explanation}
        </div>
      )}

      {/* Buttons (accessibility + desktop) */}
      <div className="flex gap-3">
        <button
          onClick={() => commit('left')}
          disabled={!!flash}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: 'hsl(var(--c-red)/0.1)', border: '1.5px solid hsl(var(--c-red)/0.35)', color: 'hsl(var(--c-red))' }}>
          ← {cfg.leftLabel[lang]}
        </button>
        <button
          onClick={() => commit('right')}
          disabled={!!flash}
          className="flex-1 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
          style={{ background: 'hsl(var(--c-green)/0.1)', border: '1.5px solid hsl(var(--c-green)/0.35)', color: 'hsl(var(--c-green))' }}>
          {cfg.rightLabel[lang]} →
        </button>
      </div>
    </div>
  );
}
