import { useEffect, useMemo, useRef, useState } from 'react';
import { useLang } from '../contexts/LanguageContext';

/**
 * Wheel of Luck prize reveal — pop-up modal.
 *
 * Lives in its own component, completely independent of the wheel itself.
 * AppShell mounts it when the wheel reports a completed spin. As long as
 * `result` is non-null the popup is on screen; setting it to null closes
 * the popup.
 *
 * Structure (top → bottom):
 *   - Big "🎉 Congratulations!" header
 *   - Prize-specific description
 *   - Full-width "Claim" button
 */
export interface PrizeResult {
  slotType: 'xp' | 'cosmetic' | 'pro_trial' | 'cup';
  xpDelta?: number;
  cosmeticId?: string;
  proTrialEndsAt?: string;
  isCup?: boolean;
}

const CUP_IMG = '/cup.png';

export function PrizeRevealPopup({
  result,
  onClaim,
}: {
  result: PrizeResult;
  onClaim: () => void;
}) {
  const { lang } = useLang();

  // Lock body scroll while open
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  const isRare = result.slotType === 'pro_trial' || result.slotType === 'cup';

  /** Per-prize content. */
  const { rewardName, description, visual, color } = useMemo(() => {
    if (result.isCup) {
      return {
        rewardName: lang === 'en' ? 'an Octolio cup!' : 'чаша Octolio!',
        description:
          lang === 'en'
            ? "You're 1 of only 3 in the world. Our team will reach out by email to arrange delivery."
            : 'Ти си 1 от само 3-ма в света. Екипът ни ще се свърже с теб по имейл, за да уговори доставка.',
        visual: <CupImage />,
        color: 'hsl(0, 75%, 55%)',
      };
    }
    if (result.proTrialEndsAt) {
      const date = new Date(result.proTrialEndsAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return {
        rewardName: lang === 'en' ? '2 weeks of Pro!' : '2 седмици Pro!',
        description:
          lang === 'en'
            ? `All Pro features are unlocked until ${date}. No card required — your trial is already active.`
            : `Всички Pro функции са отключени до ${date}. Без карта — пробният ти период е активен.`,
        visual: <span>👑</span>,
        color: 'hsl(45, 95%, 55%)',
      };
    }
    if (result.cosmeticId) {
      return {
        rewardName: lang === 'en' ? 'a new cosmetic!' : 'нова козметика!',
        description:
          lang === 'en'
            ? 'A new outfit piece is now in your inventory. Equip it on your octopus from the Shop tab.'
            : 'Нова козметика е добавена в инвентара ти. Екипирай я на октопода си от раздела Shop.',
        visual: <span>🎁</span>,
        color: 'hsl(290, 70%, 65%)',
      };
    }
    return {
      rewardName: `${result.xpDelta} XP!`,
      description:
        lang === 'en'
          ? `${result.xpDelta} XP have been added to your account. Keep learning to climb the leaderboard!`
          : `${result.xpDelta} XP бяха добавени към акаунта ти. Продължавай да учиш, за да се изкачиш в класирането!`,
      visual: <span>✨</span>,
      color: 'hsl(160, 55%, 55%)',
    };
  }, [result, lang]);

  return (
    <>
      {isRare && <Confetti />}
      <div
        className="fixed inset-0 z-[200] flex items-center justify-center p-4"
        style={{
          background: 'hsl(0, 0%, 0%, 0.7)',
          backdropFilter: 'blur(10px)',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="prize-headline"
      >
        <div
          className="w-full max-w-md rounded-3xl text-center relative animate-scale-in overflow-hidden"
          style={{
            background: 'hsl(228, 24%, 10%)',
            border: `2px solid ${color}88`,
            boxShadow: `0 30px 80px -10px ${color}55, 0 0 0 1px ${color}33 inset`,
          }}
        >
          {/* Radial glow behind the visual */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 30%, ${color}33, transparent 65%)` }}
          />

          <div className="relative px-7 sm:px-9 pt-8 pb-7">
            {/* ── TOP: Congratulations header ───────────────────── */}
            <h2
              id="prize-headline"
              className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2"
              style={{ color, letterSpacing: '-0.01em' }}
            >
              {lang === 'en' ? '🎉 Congratulations!' : '🎉 Поздравления!'}
            </h2>
            <p
              className="text-lg sm:text-xl font-extrabold leading-tight mb-6"
              style={{ color: 'hsl(var(--c-fg))' }}
            >
              {lang === 'en' ? `You won ${rewardName}` : `Спечели ${rewardName}`}
            </p>

            {/* ── MIDDLE: Prize visual + specific description ───── */}
            <div
              className="leading-none mb-5 animate-prize-pop flex items-center justify-center"
              style={{ fontSize: 96, filter: `drop-shadow(0 8px 30px ${color}88)` }}
            >
              {visual}
            </div>
            <p
              className="text-sm sm:text-base leading-relaxed mb-7 max-w-sm mx-auto"
              style={{ color: 'hsl(var(--c-fg-muted))' }}
            >
              {description}
            </p>

            {/* ── BOTTOM: Claim button ──────────────────────────── */}
            <button
              onClick={onClaim}
              className="btn-green w-full py-3.5 text-base font-bold tracking-wide"
              autoFocus
            >
              {lang === 'en' ? '✓ Claim' : '✓ Вземи'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Cup image with a graceful fallback to the trophy emoji.
 * ─────────────────────────────────────────────────────────── */
function CupImage({ size = 160 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span style={{ fontSize: size, lineHeight: 1 }} aria-label="Octolio cup">
        🏆
      </span>
    );
  }
  return (
    <img
      src={CUP_IMG}
      alt="Octolio cup"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        background: 'white',
        borderRadius: 18,
        padding: 8,
        boxShadow: '0 10px 36px hsl(0, 0%, 0%, 0.4)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * Confetti for rare wins.
 * ─────────────────────────────────────────────────────────── */
function Confetti() {
  const pieces = useRef<{ left: number; delay: number; rotate: number; color: string; size: number }[]>([]);
  if (pieces.current.length === 0) {
    const palette = [
      'hsl(45, 95%, 55%)',
      'hsl(160, 55%, 55%)',
      'hsl(0, 75%, 60%)',
      'hsl(290, 70%, 65%)',
      'hsl(200, 70%, 60%)',
    ];
    for (let i = 0; i < 80; i++) {
      pieces.current.push({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        rotate: Math.random() * 360,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 6 + Math.random() * 10,
      });
    }
  }
  return (
    <div className="fixed inset-0 pointer-events-none z-[201] overflow-hidden">
      {pieces.current.map((p, i) => (
        <span
          key={i}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}
