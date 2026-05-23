import { useCurrentFrame, spring, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import { theme, fonts } from '../theme';
import { Background } from '../components/Background';

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 14, stiffness: 130 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.3, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  const titleEnter = spring({ frame: frame - 12, fps, config: { damping: 16 } });
  const titleY = interpolate(titleEnter, [0, 1], [40, 0]);
  const titleOpacity = interpolate(titleEnter, [0, 1], [0, 1]);

  const eyebrowEnter = spring({ frame: frame - 28, fps, config: { damping: 16 } });
  const eyebrowOpacity = interpolate(eyebrowEnter, [0, 1], [0, 1]);
  const eyebrowY = interpolate(eyebrowEnter, [0, 1], [20, 0]);

  const pulse = 1 + Math.sin(frame / 8) * 0.03;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Background tint="primary" />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 40,
        }}
      >
        {/* Logo */}
        <div
          style={{
            transform: `scale(${logoScale * pulse})`,
            opacity: logoOpacity,
            filter: 'drop-shadow(0 0 40px hsl(258, 65%, 68%))',
          }}
        >
          <Img
            src={staticFile('logo.png')}
            style={{ width: 320, height: 320, objectFit: 'contain' }}
          />
        </div>

        {/* Eyebrow pill */}
        <div
          style={{
            opacity: eyebrowOpacity,
            transform: `translateY(${eyebrowY}px)`,
            padding: '14px 28px',
            borderRadius: 999,
            background: `${theme.green}25`,
            border: `2px solid ${theme.green}`,
            color: theme.green,
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 28,
            letterSpacing: 4,
            textTransform: 'uppercase',
          }}
        >
          🚀 Big Update
        </div>

        {/* Title */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 120,
            color: theme.fg,
            letterSpacing: -2,
            textShadow: '0 8px 40px rgba(110,90,230,0.6)',
          }}
        >
          Octolio
        </div>

        {/* Subline */}
        <div
          style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            fontFamily: fonts.sans,
            fontWeight: 600,
            fontSize: 36,
            color: theme.fgMuted,
            textAlign: 'center',
            maxWidth: 800,
          }}
        >
          Three new features.
          <br />
          One launch.
        </div>
      </div>
    </div>
  );
};
