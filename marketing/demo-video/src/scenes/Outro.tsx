import { useCurrentFrame, spring, useVideoConfig, interpolate, Img, staticFile } from 'remotion';
import { theme, fonts } from '../theme';
import { Background } from '../components/Background';

export const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const logoSpring = spring({ frame, fps, config: { damping: 12, stiffness: 120 } });
  const logoScale = interpolate(logoSpring, [0, 1], [0.5, 1]);
  const logoOpacity = interpolate(logoSpring, [0, 1], [0, 1]);

  const ctaEnter = spring({ frame: frame - 14, fps, config: { damping: 16 } });
  const ctaOpacity = interpolate(ctaEnter, [0, 1], [0, 1]);
  const ctaY = interpolate(ctaEnter, [0, 1], [30, 0]);

  const urlEnter = spring({ frame: frame - 28, fps, config: { damping: 16 } });
  const urlOpacity = interpolate(urlEnter, [0, 1], [0, 1]);

  const bob = Math.sin(frame / 6) * 8;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Background tint="purple" />

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
        <div style={{
          transform: `scale(${logoScale}) translateY(${bob}px)`,
          opacity: logoOpacity,
          filter: 'drop-shadow(0 0 50px hsl(258, 65%, 68%))',
        }}>
          <Img src={staticFile('logo.png')} style={{ width: 280, height: 280, objectFit: 'contain' }} />
        </div>

        <div style={{
          opacity: ctaOpacity,
          transform: `translateY(${ctaY}px)`,
          textAlign: 'center',
        }}>
          <p style={{
            margin: 0,
            fontFamily: fonts.sans,
            fontWeight: 900,
            fontSize: 88,
            color: theme.fg,
            letterSpacing: -2,
            lineHeight: 1.05,
          }}>
            Try it now
          </p>
        </div>

        <div style={{
          opacity: urlOpacity,
          padding: '20px 40px',
          borderRadius: 999,
          background: theme.primary,
          color: '#fff',
          fontFamily: fonts.mono,
          fontWeight: 800,
          fontSize: 44,
          boxShadow: `0 0 40px ${theme.primary}, 0 12px 40px rgba(0,0,0,0.4)`,
        }}>
          app.octolio.me
        </div>

        <p style={{
          opacity: urlOpacity,
          margin: 0,
          fontFamily: fonts.sans,
          fontSize: 24,
          color: theme.fgMuted,
        }}>
          Free to start · English & Bulgarian
        </p>
      </div>
    </div>
  );
};
