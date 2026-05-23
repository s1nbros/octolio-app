import { useCurrentFrame, spring, useVideoConfig, interpolate } from 'remotion';
import { theme, fonts } from '../theme';
import { Background } from '../components/Background';
import { PhoneFrame } from '../components/PhoneFrame';
import { Subtitle } from '../components/Subtitle';

const friendsRoster = [
  { name: 's1nbros',   xp: 1100, you: false, diff: '+ahead', initial: 'S', color: theme.primary },
  { name: 'Alex13',    xp: 980,  you: true,  diff: 'you',    initial: 'A', color: theme.green },
  { name: 'ChickenShine', xp: 740,  you: false, diff: '−240 behind', initial: 'C', color: theme.orange },
  { name: 'Spoko',     xp: 510,  you: false, diff: '−470 behind', initial: 'S', color: theme.purple },
];

const TYPED_NAME = 's1nbros';

export const FriendsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const phoneEnter = spring({ frame, fps, config: { damping: 18 } });
  const phoneY = interpolate(phoneEnter, [0, 1], [400, 0]);
  const phoneOpacity = interpolate(phoneEnter, [0, 1], [0, 1]);

  // Phase 1 (0-90): typing search query + result appears + "+ Add" pressed
  // Phase 2 (90-160): friend list with rivalry stats + notification pops
  const phase = frame < 100 ? 'search' : 'list';

  // Typing animation
  const typeLen = Math.min(TYPED_NAME.length, Math.floor(frame / 5));
  const typed = TYPED_NAME.slice(0, typeLen);

  // "+ Add" button pulse around frame 60-80
  const addPressed = frame >= 70 && frame < 100;
  const addOpacity = interpolate(frame, [55, 70, 100], [0, 1, 1]);

  // Notification appears after switching to list at frame ~140
  const notifEnter = spring({ frame: frame - 140, fps, config: { damping: 14 } });
  const notifScale = interpolate(notifEnter, [0, 1], [0, 1]);
  const notifShakeR = frame > 145 ? Math.sin((frame - 145) / 2) * 3 : 0;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <Background tint="green" />

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
                  👥 Friends
                </p>
              </div>

              {phase === 'search' ? (
                <>
                  {/* Search box */}
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1px solid ${theme.border}`,
                    borderRadius: 16,
                    padding: 18,
                    marginBottom: 18,
                  }}>
                    <p style={{
                      margin: '0 0 10px',
                      fontSize: 14,
                      letterSpacing: 1,
                      color: theme.fgSubtle,
                      fontFamily: fonts.sans,
                      fontWeight: 600,
                    }}>
                      🔎 Search by nickname
                    </p>
                    <div style={{
                      background: 'hsl(228, 14%, 14%)',
                      borderRadius: 10,
                      padding: '14px 18px',
                      border: `1px solid ${theme.border}`,
                      fontSize: 26,
                      fontFamily: fonts.mono,
                      color: theme.fg,
                      minHeight: 56,
                    }}>
                      {typed}
                      <span style={{
                        display: 'inline-block',
                        width: 2,
                        height: 30,
                        background: theme.primary,
                        marginLeft: 2,
                        opacity: Math.floor(frame / 8) % 2 ? 1 : 0,
                        verticalAlign: 'middle',
                      }} />
                    </div>
                  </div>

                  {/* Search result */}
                  {typeLen >= 3 && (
                    <div style={{
                      background: theme.glass,
                      border: `1px solid ${theme.border}`,
                      borderRadius: 18,
                      padding: 18,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      opacity: addOpacity,
                    }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 999,
                        background: `${theme.primary}30`,
                        border: `2px solid ${theme.primary}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: fonts.sans, fontWeight: 900, fontSize: 22, color: theme.primary,
                      }}>S</div>
                      <div style={{ flex: 1 }}>
                        <p style={{ margin: 0, fontSize: 22, fontWeight: 700, color: theme.fg, fontFamily: fonts.sans }}>
                          s1nbros
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 16, color: theme.fgSubtle, fontFamily: fonts.mono }}>
                          1,100 XP
                        </p>
                      </div>
                      <div style={{
                        padding: '10px 18px',
                        borderRadius: 999,
                        background: addPressed ? theme.green : theme.primary,
                        color: '#fff',
                        fontFamily: fonts.sans,
                        fontSize: 18,
                        fontWeight: 800,
                        transform: addPressed ? 'scale(1.08)' : 'scale(1)',
                        boxShadow: addPressed ? `0 0 20px ${theme.green}` : `0 0 14px ${theme.primary}`,
                        transition: 'all 0.2s',
                      }}>
                        {addPressed ? '✓ Sent' : '+ Add'}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {/* Friend list */}
                  <p style={{
                    margin: '0 0 14px',
                    fontSize: 14,
                    letterSpacing: 1,
                    color: theme.fgSubtle,
                    fontFamily: fonts.sans,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                  }}>
                    {friendsRoster.length - 1} friends · race them
                  </p>
                  {friendsRoster.map((f) => {
                    const isAhead = f.diff.includes('+') || f.diff.includes('ahead');
                    const isBehind = f.diff.includes('−') || f.diff.includes('behind');
                    return (
                      <div key={f.name} style={{
                        display: 'flex', alignItems: 'center', gap: 14,
                        padding: '14px 18px',
                        borderRadius: 16,
                        marginBottom: 10,
                        background: f.you ? `${theme.green}12` : theme.glass,
                        border: `1px solid ${f.you ? theme.green : theme.border}`,
                      }}>
                        <div style={{
                          width: 44, height: 44, borderRadius: 999,
                          background: `${f.color}30`,
                          border: `2px solid ${f.color}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: fonts.sans, fontWeight: 900, fontSize: 18, color: f.color,
                        }}>{f.initial}</div>
                        <div style={{ flex: 1 }}>
                          <p style={{ margin: 0, fontSize: 20, fontWeight: 700, color: theme.fg, fontFamily: fonts.sans }}>
                            {f.name} {f.you && <span style={{ color: theme.green, fontSize: 14 }}>· you</span>}
                          </p>
                          <p style={{
                            margin: '2px 0 0',
                            fontSize: 14,
                            color: isAhead ? theme.red : isBehind ? theme.green : theme.fgSubtle,
                            fontFamily: fonts.mono,
                          }}>
                            {f.xp.toLocaleString()} XP · {f.diff}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
          </PhoneFrame>
        </div>
      </div>

      {/* Notification popup, anchored top-right */}
      {phase === 'list' && (
        <div style={{
          position: 'absolute',
          top: 280,
          right: 80,
          transform: `scale(${notifScale}) rotate(${notifShakeR}deg)`,
          transformOrigin: 'top right',
        }}>
          <div style={{
            padding: '18px 22px',
            background: 'hsl(228, 24%, 12%)',
            borderRadius: 20,
            border: `2px solid ${theme.red}`,
            boxShadow: `0 0 40px ${theme.red}, 0 20px 60px rgba(0,0,0,0.6)`,
            maxWidth: 480,
            display: 'flex',
            gap: 14,
            alignItems: 'flex-start',
          }}>
            <span style={{ fontSize: 32 }}>⚡</span>
            <div>
              <p style={{
                margin: 0,
                fontSize: 22,
                fontFamily: fonts.sans,
                fontWeight: 800,
                color: theme.fg,
                lineHeight: 1.2,
              }}>
                s1nbros just overtook you!
              </p>
              <p style={{
                margin: '6px 0 0',
                fontSize: 16,
                fontFamily: fonts.sans,
                color: theme.fgMuted,
              }}>
                They jumped to 1,100 XP. Time to fight back!
              </p>
            </div>
          </div>
        </div>
      )}

      <Subtitle
        eyebrow="New · Friends"
        text="Race friends. Get notified."
        accent={theme.green}
        position="bottom"
      />
    </div>
  );
};
