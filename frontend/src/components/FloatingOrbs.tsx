import { useTheme } from '../contexts/ThemeContext';

/** Aurora background — matches the design's starfield + three colour blobs + grid overlay.
 *  Only renders in dark mode; returns null in light mode. */
export function FloatingOrbs() {
  const { isDark } = useTheme();
  if (!isDark) return null;

  return (
    <div className="aurora-stage">
      {/* Star dots */}
      <div className="aurora-stars" />

      {/* Iris / violet — top-left */}
      <div className="aurora-a animate-orb-1" />

      {/* Mint / green — top-right */}
      <div className="aurora-b animate-orb-2" />

      {/* Ember / orange — bottom-center (slow reverse drift) */}
      <div className="aurora-c"
        style={{ animation: 'orb-float-2 28s ease-in-out infinite reverse' }} />

      {/* 48 px grid paper, fades toward edges */}
      <div className="aurora-grid" />
    </div>
  );
}
