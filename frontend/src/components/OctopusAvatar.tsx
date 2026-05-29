/**
 * Animated octopus mascot. Renders the user's equipped cosmetic on top.
 *
 * The octopus is built with CSS so it bobs/wiggles smoothly (no GIF needed).
 * Cosmetics are emoji glyphs anchored to slots: hat, face, body.
 *
 * Usage:
 *   <OctopusAvatar size={120} equipped="hat_crown" />
 */

interface Props {
  size?: number;
  equipped?: string | null;
  /** Pass the slot of the equipped item so we can render multiple stacked later. */
  itemEmoji?: string | null;
  itemSlot?: 'hat' | 'face' | 'body' | null;
}

export function OctopusAvatar({ size = 120, equipped, itemEmoji, itemSlot }: Props) {
  const s = size;
  return (
    <div
      className="relative inline-block octopus-bob"
      style={{ width: s, height: s, filter: 'drop-shadow(0 8px 24px hsl(var(--c-primary)/0.4))' }}
    >
      {/* Octopus body — SVG */}
      <svg viewBox="0 0 200 200" width={s} height={s}
        style={{ overflow: 'visible' }}>
        <defs>
          <radialGradient id="octoGrad" cx="50%" cy="35%" r="70%">
            <stop offset="0%" stopColor="hsl(var(--c-primary))" />
            <stop offset="60%" stopColor="hsl(180, 60%, 55%)" />
            <stop offset="100%" stopColor="hsl(195, 60%, 40%)" />
          </radialGradient>
          <radialGradient id="octoCheek" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="hsl(0, 80%, 75%)" stopOpacity="0.8" />
            <stop offset="100%" stopColor="hsl(0, 80%, 75%)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Head */}
        <ellipse cx="100" cy="80" rx="62" ry="56" fill="url(#octoGrad)"
          stroke="hsl(var(--c-primary)/0.55)" strokeWidth="2.5" />

        {/* Tentacles */}
        <g fill="url(#octoGrad)" stroke="hsl(var(--c-primary)/0.5)" strokeWidth="2">
          {/* 4 wavy tentacles using cubic curves */}
          <path d="M 50 130 Q 38 165, 50 195 Q 65 175, 60 145 Z" className="octopus-tentacle t1" />
          <path d="M 75 140 Q 65 180, 80 200 Q 95 185, 88 152 Z" className="octopus-tentacle t2" />
          <path d="M 105 142 Q 105 180, 120 200 Q 130 185, 120 150 Z" className="octopus-tentacle t3" />
          <path d="M 135 138 Q 145 175, 155 195 Q 165 175, 155 145 Z" className="octopus-tentacle t4" />
        </g>

        {/* Cheek blush */}
        <circle cx="70" cy="90" r="10" fill="url(#octoCheek)" />
        <circle cx="130" cy="90" r="10" fill="url(#octoCheek)" />

        {/* Eyes */}
        <g>
          <ellipse cx="80" cy="75" rx="9" ry="11" fill="white" />
          <ellipse cx="120" cy="75" rx="9" ry="11" fill="white" />
          <circle cx="82" cy="78" r="5" fill="#1a1f2e" className="octopus-pupil l" />
          <circle cx="122" cy="78" r="5" fill="#1a1f2e" className="octopus-pupil r" />
          <circle cx="80" cy="74" r="1.6" fill="white" />
          <circle cx="120" cy="74" r="1.6" fill="white" />
        </g>

        {/* Smile */}
        <path d="M 90 100 Q 100 110 110 100" stroke="hsl(228, 30%, 12%)" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      </svg>

      {/* Equipped cosmetic (emoji overlay) — positioned per slot */}
      {itemEmoji && itemSlot === 'hat' && (
        <span
          className="absolute select-none octopus-hat"
          style={{
            top: `${s * -0.12}px`,
            left: '50%',
            transform: 'translateX(-50%) rotate(-5deg)',
            fontSize: `${s * 0.42}px`,
            filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.4))',
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          {itemEmoji}
        </span>
      )}
      {itemEmoji && itemSlot === 'face' && (
        <span
          className="absolute select-none"
          style={{
            top: `${s * 0.34}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: `${s * 0.22}px`,
            filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          {itemEmoji}
        </span>
      )}
      {itemEmoji && itemSlot === 'body' && (
        <span
          className="absolute select-none"
          style={{
            bottom: `${s * 0.05}px`,
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: `${s * 0.28}px`,
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))',
            zIndex: 3,
          }}
          aria-hidden="true"
        >
          {itemEmoji}
        </span>
      )}

      {/* When equipped string is provided but emoji isn't passed in (e.g. when
          we only know the ID), the parent can pass the emoji via itemEmoji. */}
      {!itemEmoji && equipped && (
        <span className="sr-only">Equipped: {equipped}</span>
      )}
    </div>
  );
}
