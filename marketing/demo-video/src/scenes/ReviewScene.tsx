import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { theme, fonts } from '../theme';
import { Background } from '../components/Background';
import { PhoneFrame } from '../components/PhoneFrame';
import { Subtitle } from '../components/Subtitle';

const cards = [
  { id: 1, type: 'match_terms', label: 'Match the terms', from: 'compound interest', to: 'principal × (1+r)^n' },
  { id: 2, type: 'fill_number',  label: '50/30/20 split on €3,000?', answer: '€600' },
  { id: 3, type: 'true_false',   label: 'Higher deductible = lower premium', answer: 'TRUE' },
];

export const ReviewScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Phone slides in from the bottom
  const phoneEnter = spring({ frame, fps, config: { damping: 18 } });
  const phoneY = interpolate(phoneEnter, [0, 1], [400, 0]);
  const phoneOpacity = interpolate(phoneEnter, [0, 1], [0, 1]);

  // Cards swap every 60 frames (2s each)
  const cardIndex = Math.min(2, Math.floor(frame / 60));
  const card = cards[cardIndex];

  // Card flip animation when index changes
  const cardSpring = spring({ frame: (frame % 60), fps, config: { damping: 14 } });
  const cardScale = interpolate(cardSpring, [0, 1], [0.85, 1]);
  const cardOpacity = interpolate(cardSpring, [0, 0.4], [0, 1], { extrapolateRight: 'clamp' });

  // Progress bar fills as cards advance
  const totalCards = 12;
  const completed = cardIndex + 1;
  const progressPct = (completed / totalCards) * 100;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Background tint="primary" />

      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-start',
          paddingTop: 220,
        }}
      >
        <div
          style={{
            transform: `translateY(${phoneY}px)`,
            opacity: phoneOpacity,
          }}
        >
          <PhoneFrame>
            {/* Top header bar */}
            <div style={{ padding: '80px 32px 0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <span style={{ fontSize: 36 }}>🔁</span>
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0,
                    fontSize: 16,
                    fontFamily: fonts.sans,
                    fontWeight: 700,
                    letterSpacing: 2,
                    color: theme.fgSubtle,
                    textTransform: 'uppercase',
                  }}>
                    Review · {completed} / {totalCards}
                  </p>
                </div>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: 999,
                  background: `${theme.orange}20`,
                  border: `1.5px solid ${theme.orange}`,
                  color: theme.orange,
                  fontSize: 18,
                  fontFamily: fonts.mono,
                  fontWeight: 800,
                }}>
                  Box {cardIndex + 1}/5
                </span>
              </div>

              {/* Progress bar */}
              <div style={{
                height: 10,
                borderRadius: 999,
                background: 'rgba(255,255,255,0.08)',
                overflow: 'hidden',
                marginBottom: 32,
              }}>
                <div style={{
                  height: '100%',
                  width: `${progressPct}%`,
                  background: theme.primary,
                  borderRadius: 999,
                  transition: 'width 0.4s',
                  boxShadow: `0 0 16px ${theme.primary}`,
                }} />
              </div>

              {/* Card content */}
              <div
                style={{
                  background: theme.bgCard,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 32,
                  padding: 40,
                  transform: `scale(${cardScale})`,
                  opacity: cardOpacity,
                  boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
                }}
              >
                <p style={{
                  margin: 0,
                  fontSize: 14,
                  fontFamily: fonts.sans,
                  fontWeight: 700,
                  letterSpacing: 2,
                  color: theme.primary,
                  textTransform: 'uppercase',
                  marginBottom: 16,
                }}>
                  {card.type.replace('_', ' ')}
                </p>
                <p style={{
                  margin: 0,
                  fontSize: 32,
                  fontFamily: fonts.sans,
                  fontWeight: 700,
                  color: theme.fg,
                  lineHeight: 1.3,
                  marginBottom: 32,
                }}>
                  {card.label}
                </p>
                <div style={{
                  padding: '20px 24px',
                  background: `${theme.green}15`,
                  border: `2px solid ${theme.green}`,
                  borderRadius: 16,
                  fontFamily: fonts.mono,
                  fontWeight: 800,
                  fontSize: 28,
                  color: theme.green,
                  textAlign: 'center',
                }}>
                  ✓ {card.answer ?? card.to}
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>

      <Subtitle
        eyebrow="New · Review"
        text="Never forget what you got wrong"
        accent={theme.primary}
        position="bottom"
      />
    </div>
  );
};
