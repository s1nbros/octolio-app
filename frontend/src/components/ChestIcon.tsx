/**
 * Treasure-chest SVG. Used in the lesson path and chest modal — the 🎁
 * emoji read as "gift" which was wrong. This one has a wooden body, a
 * curved lid, gold trim, and a centred lock plate so it reads as a
 * proper chest at any size.
 *
 * `status` swaps the palette:
 *   - 'available' → warm wood + gold (default)
 *   - 'opened'    → muted green-grey (looks "consumed")
 *   - 'locked'    → cold grey
 */
interface Props {
  size?: number;
  status?: 'available' | 'opened' | 'locked';
  className?: string;
}

export function ChestIcon({ size = 32, status = 'available', className }: Props) {
  // Palette per state
  const wood       = status === 'opened' ? '#6a7a72' : status === 'locked' ? '#3a3f4a' : '#8b5a2b';
  const woodLight  = status === 'opened' ? '#90a097' : status === 'locked' ? '#5a606b' : '#b07a44';
  const woodDark   = status === 'opened' ? '#3a4a44' : status === 'locked' ? '#1f242c' : '#5e3a1a';
  const trim       = status === 'opened' ? '#a4b3aa' : status === 'locked' ? '#7c8595' : '#d4a73a';
  const trimDark   = status === 'opened' ? '#4f5f56' : status === 'locked' ? '#3d4451' : '#7a5a10';

  // Unique IDs for gradients so multiple chests on one page don't collide
  const uid = `chest-${status}`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      style={{ display: 'inline-block', verticalAlign: '-0.15em', flexShrink: 0 }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${uid}-wood`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={woodLight} />
          <stop offset="100%" stopColor={wood} />
        </linearGradient>
        <linearGradient id={`${uid}-trim`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={trim} />
          <stop offset="100%" stopColor={trimDark} />
        </linearGradient>
      </defs>

      {/* Lid (rounded top) */}
      <path
        d={`M3 12.2 Q3 5.5 12 5.5 Q21 5.5 21 12.2 L21 13 L3 13 Z`}
        fill={`url(#${uid}-wood)`}
        stroke={woodDark}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />

      {/* Body */}
      <path
        d={`M3 13 L21 13 L21 19.7 Q21 20.5 20.2 20.5 L3.8 20.5 Q3 20.5 3 19.7 Z`}
        fill={`url(#${uid}-wood)`}
        stroke={woodDark}
        strokeWidth="0.55"
        strokeLinejoin="round"
      />

      {/* Centre seam between lid and body */}
      <line x1="3.2" y1="13" x2="20.8" y2="13" stroke={woodDark} strokeWidth="0.4" />

      {/* Gold/metal horizontal band right below the lid */}
      <rect
        x="3" y="12.4" width="18" height="1.2"
        fill={`url(#${uid}-trim)`}
        stroke={trimDark}
        strokeWidth="0.25"
      />

      {/* Vertical corner trims (left + right) */}
      <rect x="3" y="6.2" width="1.6" height="14.1" fill={`url(#${uid}-trim)`} stroke={trimDark} strokeWidth="0.25" />
      <rect x="19.4" y="6.2" width="1.6" height="14.1" fill={`url(#${uid}-trim)`} stroke={trimDark} strokeWidth="0.25" />

      {/* Lock plate (centred between band and bottom) */}
      <rect
        x="10.5" y="14.2" width="3" height="3.8"
        rx="0.4"
        fill={`url(#${uid}-trim)`}
        stroke={trimDark}
        strokeWidth="0.3"
      />
      {/* Keyhole */}
      <circle cx="12" cy="15.6" r="0.45" fill="#1a1a1a" />
      <rect x="11.85" y="15.85" width="0.3" height="1.1" fill="#1a1a1a" />

      {/* Highlight gleam on lid */}
      <path
        d={`M5.5 9 Q8 6.8 12 6.8`}
        fill="none"
        stroke="#fff8e0"
        strokeOpacity="0.45"
        strokeWidth="0.9"
        strokeLinecap="round"
      />
    </svg>
  );
}
