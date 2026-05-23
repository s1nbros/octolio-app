import { useCurrentFrame, interpolate } from 'remotion';
import { theme } from '../theme';

/**
 * Animated gradient + drifting orbs background, mirroring the app's vibe.
 * `tint` chooses which color pair dominates.
 */
export const Background: React.FC<{
  tint?: 'primary' | 'green' | 'orange' | 'purple';
}> = ({ tint = 'primary' }) => {
  const frame = useCurrentFrame();

  const palette = {
    primary: [theme.primary, theme.purple],
    green:   [theme.green,   theme.primary],
    orange:  [theme.orange,  theme.gold],
    purple:  [theme.purple,  theme.primary],
  }[tint];

  const orb1X = interpolate(frame % 300, [0, 150, 300], [-100, 250, -100]);
  const orb1Y = interpolate(frame % 300, [0, 150, 300], [200, 600, 200]);
  const orb2X = interpolate(frame % 420, [0, 210, 420], [900, 600, 900]);
  const orb2Y = interpolate(frame % 420, [0, 210, 420], [1500, 1100, 1500]);

  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at top, ${palette[0]}26, transparent 60%), ${theme.bg}`,
        overflow: 'hidden',
      }}
    >
      {/* Floating orbs */}
      <div
        style={{
          position: 'absolute',
          left: orb1X,
          top: orb1Y,
          width: 500,
          height: 500,
          borderRadius: '50%',
          background: palette[0],
          filter: 'blur(120px)',
          opacity: 0.35,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: orb2X,
          top: orb2Y,
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: palette[1],
          filter: 'blur(140px)',
          opacity: 0.3,
        }}
      />
      {/* Subtle grid */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
          maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
          WebkitMaskImage: 'radial-gradient(ellipse at center, black 30%, transparent 80%)',
        }}
      />
    </div>
  );
};
