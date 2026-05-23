import { useCurrentFrame, interpolate, spring, useVideoConfig } from 'remotion';
import { theme, fonts } from '../theme';

interface SubtitleProps {
  text: string;
  /** Optional smaller line above the main text */
  eyebrow?: string;
  /** Optional accent color for the eyebrow + bar */
  accent?: string;
  /** Where to render: top | center | bottom */
  position?: 'top' | 'center' | 'bottom';
}

export const Subtitle: React.FC<SubtitleProps> = ({
  text,
  eyebrow,
  accent = theme.green,
  position = 'bottom',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const enter = spring({ frame, fps, config: { damping: 18 } });
  const opacity = interpolate(enter, [0, 1], [0, 1]);
  const ty = interpolate(enter, [0, 1], [16, 0]);

  const posStyle: React.CSSProperties =
    position === 'top'
      ? { top: 100 }
      : position === 'center'
        ? { top: '50%', transform: `translateY(calc(-50% + ${ty}px))` }
        : { bottom: 160 };

  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        padding: '0 80px',
        opacity,
        transform: position === 'center' ? posStyle.transform : `translateY(${ty}px)`,
        textAlign: 'center',
        ...posStyle,
      }}
    >
      {eyebrow && (
        <div
          style={{
            display: 'inline-block',
            padding: '8px 18px',
            borderRadius: 999,
            background: `${accent}25`,
            border: `2px solid ${accent}`,
            color: accent,
            fontFamily: fonts.sans,
            fontWeight: 800,
            fontSize: 24,
            letterSpacing: 3,
            textTransform: 'uppercase',
            marginBottom: 24,
          }}
        >
          {eyebrow}
        </div>
      )}
      <div
        style={{
          fontFamily: fonts.sans,
          fontWeight: 900,
          fontSize: 64,
          lineHeight: 1.1,
          color: theme.fg,
          textShadow: '0 4px 24px rgba(0,0,0,0.6)',
        }}
      >
        {text}
      </div>
    </div>
  );
};
