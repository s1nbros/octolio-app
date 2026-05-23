import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { theme, fonts } from '../theme';
import { Background } from '../components/Background';
import { PhoneFrame } from '../components/PhoneFrame';
import { Subtitle } from '../components/Subtitle';

interface Calc {
  emoji: string;
  tab: string;
  title: string;
  sliders: { label: string; value: string; color: string }[];
  resultLabel: string;
  resultValue: string;
  resultColor: string;
}

const calcs: Calc[] = [
  {
    emoji: '📈',
    tab: 'Compound',
    title: 'Compound interest',
    sliders: [
      { label: 'Starting amount', value: '€1,000',   color: 'primary' },
      { label: 'Monthly',         value: '€200/mo',  color: 'green' },
      { label: 'Annual return',   value: '7%',       color: 'purple' },
      { label: 'Years',           value: '30y',      color: 'orange' },
    ],
    resultLabel: 'Final value',
    resultValue: '€253,481',
    resultColor: 'green',
  },
  {
    emoji: '🏠',
    tab: 'Mortgage',
    title: 'Fixed-rate mortgage',
    sliders: [
      { label: 'Home price',  value: '€250,000', color: 'primary' },
      { label: 'Down',        value: '20%',      color: 'green' },
      { label: 'Rate',        value: '4.5%',     color: 'purple' },
      { label: 'Term',        value: '30y',      color: 'orange' },
    ],
    resultLabel: 'Monthly payment',
    resultValue: '€1,013',
    resultColor: 'primary',
  },
  {
    emoji: '🔥',
    tab: 'FIRE',
    title: 'Years to financial independence',
    sliders: [
      { label: 'Current age',   value: '30',     color: 'primary' },
      { label: 'Savings',       value: '€20,000', color: 'green' },
      { label: 'Monthly invest', value: '€800',  color: 'purple' },
      { label: 'Annual spend',  value: '€30,000', color: 'red' },
    ],
    resultLabel: 'Retire at',
    resultValue: 'age 52',
    resultColor: 'orange',
  },
];

const colorMap = (c: string): string => ({
  primary: theme.primary,
  green:   theme.green,
  orange:  theme.orange,
  purple:  theme.purple,
  red:     theme.red,
}[c] ?? theme.primary);

export const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({ frame, fps, config: { damping: 18 } });
  const phoneY = interpolate(phoneEnter, [0, 1], [400, 0]);
  const phoneOpacity = interpolate(phoneEnter, [0, 1], [0, 1]);

  // Each calculator visible for ~65 frames
  const calcDur = 80;
  const calcIndex = Math.min(calcs.length - 1, Math.floor(frame / calcDur));
  const calc = calcs[calcIndex];

  // Result counts up — fake fast count from 0 to final
  const localFrame = frame % calcDur;
  const countProgress = interpolate(localFrame, [10, 50], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
  const easedCount = countProgress < 1 ? countProgress * countProgress * (3 - 2 * countProgress) : 1;
  const slideEnter = spring({ frame: localFrame, fps, config: { damping: 14 } });
  const slideScale = interpolate(slideEnter, [0, 1], [0.92, 1]);
  const slideOpacity = interpolate(slideEnter, [0, 0.5], [0, 1], { extrapolateRight: 'clamp' });

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Background tint="orange" />

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
        <div style={{ transform: `translateY(${phoneY}px)`, opacity: phoneOpacity }}>
          <PhoneFrame>
            <div style={{ padding: '80px 32px 0' }}>
              {/* Header */}
              <div style={{ marginBottom: 20 }}>
                <p style={{
                  margin: 0,
                  fontSize: 48,
                  fontFamily: fonts.sans,
                  fontWeight: 900,
                  color: theme.fg,
                  letterSpacing: -1,
                }}>
                  🧰 Tools
                </p>
                <p style={{
                  margin: '8px 0 0',
                  fontSize: 18,
                  fontFamily: fonts.sans,
                  color: theme.fgMuted,
                }}>
                  Real calculators to use what you learn.
                </p>
              </div>

              {/* Tab strip */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 24, overflow: 'hidden' }}>
                {calcs.map((c, i) => {
                  const active = i === calcIndex;
                  return (
                    <div key={c.tab}
                      style={{
                        padding: '10px 14px',
                        borderRadius: 12,
                        background: active ? `${theme.primary}30` : theme.glass,
                        border: `1.5px solid ${active ? theme.primary : theme.border}`,
                        color: active ? theme.primary : theme.fgMuted,
                        fontSize: 17,
                        fontFamily: fonts.sans,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}>
                      {c.emoji} {c.tab}
                    </div>
                  );
                })}
              </div>

              {/* Card content */}
              <div
                key={calc.tab}
                style={{
                  background: theme.glass,
                  border: `1px solid ${theme.border}`,
                  borderRadius: 32,
                  padding: 32,
                  transform: `scale(${slideScale})`,
                  opacity: slideOpacity,
                }}
              >
                <p style={{
                  margin: '0 0 24px',
                  fontSize: 22,
                  fontFamily: fonts.sans,
                  color: theme.fgMuted,
                }}>
                  {calc.title}
                </p>

                {calc.sliders.map((s, i) => {
                  const c = colorMap(s.color);
                  // Slider thumb position pulses
                  const thumb = 35 + Math.sin((frame + i * 30) / 22) * 15;
                  return (
                    <div key={s.label} style={{ marginBottom: 18 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                        <span style={{ fontSize: 18, fontFamily: fonts.sans, color: theme.fg }}>{s.label}</span>
                        <span style={{ fontSize: 18, fontFamily: fonts.mono, fontWeight: 800, color: c }}>{s.value}</span>
                      </div>
                      <div style={{
                        height: 8,
                        borderRadius: 999,
                        background: 'rgba(255,255,255,0.08)',
                        position: 'relative',
                      }}>
                        <div style={{
                          height: '100%',
                          width: `${thumb + 25}%`,
                          background: c,
                          borderRadius: 999,
                          boxShadow: `0 0 12px ${c}`,
                        }} />
                      </div>
                    </div>
                  );
                })}

                {/* Result tile */}
                <div style={{
                  marginTop: 28,
                  padding: 24,
                  borderRadius: 20,
                  background: `${colorMap(calc.resultColor)}18`,
                  border: `2px solid ${colorMap(calc.resultColor)}55`,
                  textAlign: 'center',
                }}>
                  <p style={{
                    margin: 0,
                    fontSize: 14,
                    letterSpacing: 2,
                    fontFamily: fonts.sans,
                    color: theme.fgSubtle,
                    textTransform: 'uppercase',
                  }}>
                    {calc.resultLabel}
                  </p>
                  <p style={{
                    margin: '8px 0 0',
                    fontSize: 56,
                    fontFamily: fonts.mono,
                    fontWeight: 900,
                    color: colorMap(calc.resultColor),
                  }}>
                    {/* Fake "counting up" by interpolating the number */}
                    {animateResult(calc.resultValue, easedCount)}
                  </p>
                </div>
              </div>
            </div>
          </PhoneFrame>
        </div>
      </div>

      <Subtitle
        eyebrow="New · Tools"
        text="6 calculators to use what you learn"
        accent={theme.orange}
        position="bottom"
      />
    </div>
  );
};

/** Counts numeric part up from 0 → target while keeping the prefix/suffix. */
function animateResult(target: string, t: number): string {
  // Find number inside the string
  const match = target.match(/[\d,]+/);
  if (!match) return target;
  const finalNum = parseInt(match[0].replace(/,/g, ''), 10);
  if (!Number.isFinite(finalNum)) return target;
  const current = Math.round(finalNum * t);
  const formatted = current.toLocaleString();
  return target.replace(match[0], formatted);
}
