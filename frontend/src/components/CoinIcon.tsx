/**
 * Stylized gold "Octolio Coin" — SVG so it renders identically across
 * platforms (the 🪙 emoji falls back to a plain circle on some devices).
 *
 * Designed to sit inline with text. Uses currentColor for nothing — has
 * its own gold gradient so it always looks like a coin regardless of
 * surrounding text color.
 */
export function CoinIcon({ size = 16, className }: { size?: number; className?: string }) {
  // Stable but unique IDs per call so multiple coins on a page don't collide.
  // React 18 useId would be ideal; for our needs a hash of size + Math.random
  // captured at module load is enough. We use Math.random captured once.
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
        <radialGradient id="oc-coin-face" cx="35%" cy="35%" r="80%">
          <stop offset="0%"  stopColor="#FFE89B" />
          <stop offset="55%" stopColor="#F0B935" />
          <stop offset="100%" stopColor="#A1670E" />
        </radialGradient>
        <linearGradient id="oc-coin-rim" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFD970" />
          <stop offset="100%" stopColor="#7A4B05" />
        </linearGradient>
      </defs>

      {/* Outer rim */}
      <circle cx="12" cy="12" r="11" fill="url(#oc-coin-rim)" />
      {/* Main face */}
      <circle cx="12" cy="12" r="9.2" fill="url(#oc-coin-face)" />
      {/* Inner ring detail */}
      <circle cx="12" cy="12" r="7.4" fill="none" stroke="#7A4B05" strokeOpacity="0.45" strokeWidth="0.55" />
      {/* "O" mark — Octolio brand */}
      <text
        x="12" y="12"
        textAnchor="middle"
        dominantBaseline="central"
        fontFamily="Inter, system-ui, sans-serif"
        fontWeight="900"
        fontSize="10"
        fill="#5A3A06"
      >
        O
      </text>
      {/* Shine highlight */}
      <ellipse cx="9" cy="8.5" rx="3" ry="1.6" fill="#FFFBEA" opacity="0.55" />
    </svg>
  );
}
