import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLang } from '../contexts/LanguageContext';
import { Fireworks } from './Fireworks';

/**
 * Full-screen lesson completion popup.
 *
 *   ┌──────────────────────────────────┐
 *   │  fireworks animation (background) │
 *   │                                  │
 *   │     🎉 Lesson Complete!          │
 *   │     Congratulations!             │
 *   │     <lesson title>               │
 *   │                                  │
 *   │     +250 XP                      │
 *   │     gained this lesson           │
 *   │                                  │
 *   │     ❤️ ❤️ ❤️                   │
 *   │                                  │
 *   │     [   ✓ Claim XP   ]           │
 *   └──────────────────────────────────┘
 *
 * Rendered via createPortal into document.body so no ancestor's CSS stacking
 * context can clip it. Z-index is max-int. Body scroll is locked while open.
 */
export function LessonCompletePopup({
  lessonTitle,
  xpGained,
  heartsRemaining,
  onClaim,
}: {
  lessonTitle: string;
  xpGained: number;
  heartsRemaining: number;
  onClaim: () => void;
}) {
  const { lang } = useLang();

  // Lock body scroll while open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return createPortal(
    <>
      {/* Fireworks layer — sits behind the card */}
      <Fireworks bursts={9} />

      {/* Backdrop + centered card */}
      <div
        className="fixed inset-0 z-[2147483647] flex items-center justify-center p-4"
        style={{
          background: 'hsl(0, 0%, 0%, 0.75)',
          backdropFilter: 'blur(10px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lesson-complete-headline"
      >
        <div
          className="w-full max-w-md rounded-3xl text-center relative animate-scale-in overflow-hidden"
          style={{
            background: 'hsl(228, 24%, 10%)',
            border: '2px solid hsl(160, 55%, 55%, 0.55)',
            boxShadow:
              '0 30px 80px -10px hsl(160, 55%, 45%, 0.35),' +
              '0 0 0 1px hsl(160, 55%, 55%, 0.2) inset',
          }}
        >
          {/* Soft radial glow behind the headline */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 30%, hsl(160, 55%, 55%, 0.18), transparent 65%)',
            }}
          />

          <div className="relative px-7 sm:px-9 pt-8 pb-7">
            {/* ── TOP: Congratulations header ─────────────────── */}
            <div
              className="text-[64px] sm:text-[72px] leading-none mb-3 animate-prize-pop"
              style={{ filter: 'drop-shadow(0 6px 20px hsl(45, 95%, 55%, 0.5))' }}
              aria-hidden="true"
            >
              🎉
            </div>
            <h2
              id="lesson-complete-headline"
              className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
              style={{ color: 'hsl(160, 65%, 60%)', letterSpacing: '-0.01em' }}
            >
              {lang === 'en' ? 'Lesson Complete!' : 'Урокът е завършен!'}
            </h2>
            <p
              className="text-lg sm:text-xl font-extrabold leading-tight mb-1"
              style={{ color: 'hsl(var(--c-fg))' }}
            >
              {lang === 'en' ? '🎊 Congratulations!' : '🎊 Поздравления!'}
            </p>
            <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lessonTitle}
            </p>

            {/* ── MIDDLE: XP gained ───────────────────────────── */}
            <div
              className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl mb-5"
              style={{
                background: 'hsl(45, 95%, 55%, 0.10)',
                border: '1px solid hsl(45, 95%, 55%, 0.35)',
              }}
            >
              <span className="text-3xl">⚡</span>
              <div className="text-left">
                <p
                  className="text-[10px] uppercase tracking-widest font-bold"
                  style={{ color: 'hsl(45, 95%, 65%)' }}
                >
                  {lang === 'en' ? 'XP gained' : 'Спечелени XP'}
                </p>
                <p
                  className="text-4xl font-black leading-none"
                  style={{ color: 'hsl(45, 95%, 60%)' }}
                >
                  +{xpGained}
                </p>
              </div>
            </div>

            {/* Hearts row */}
            <div className="flex justify-center gap-1 mb-7" aria-label="Hearts remaining">
              {Array.from({ length: 3 }).map((_, i) => (
                <span
                  key={i}
                  className="text-2xl"
                  style={{
                    opacity: i < heartsRemaining ? 1 : 0.3,
                    filter: i < heartsRemaining ? 'none' : 'grayscale(1)',
                  }}
                >
                  ❤️
                </span>
              ))}
            </div>

            {/* ── BOTTOM: Claim XP button ─────────────────────── */}
            <button
              onClick={onClaim}
              className="btn-green w-full py-3.5 text-base font-bold tracking-wide"
              autoFocus
            >
              {lang === 'en' ? '✓ Claim XP' : '✓ Вземи XP'}
            </button>
          </div>
        </div>
      </div>
    </>,
    document.body,
  );
}
