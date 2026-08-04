import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Defs, Ellipse, G, Path, RadialGradient, Stop } from 'react-native-svg';
import { Bob } from '../lib/anim';

/** Octopus mascot with hat / face / body emoji slots, mirroring the web
 *  OctopusAvatar. When `animate`, it idle-bobs and blinks periodically. */
export function OctopusAvatar({ size = 120, hatEmoji, faceEmoji, bodyEmoji, animate = true }: {
  size?: number; hatEmoji?: string | null; faceEmoji?: string | null; bodyEmoji?: string | null; animate?: boolean;
}) {
  const s = size;
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!animate) return;
    let openTimer: any;
    let closeTimer: any;
    const schedule = () => {
      openTimer = setTimeout(() => {
        setBlink(true);
        closeTimer = setTimeout(() => { setBlink(false); schedule(); }, 140);
      }, 2600 + Math.random() * 2400);
    };
    schedule();
    return () => { clearTimeout(openTimer); clearTimeout(closeTimer); };
  }, [animate]);

  const inner = (
    <View style={{ width: s, height: s, position: 'relative' }}>
      <Svg viewBox="0 0 200 200" width={s} height={s}>
        <Defs>
          <RadialGradient id="octoGrad" cx="50%" cy="35%" r="70%">
            <Stop offset="0%" stopColor="hsl(258, 72%, 76%)" />
            <Stop offset="100%" stopColor="hsl(258, 60%, 55%)" />
          </RadialGradient>
          <RadialGradient id="octoCheek" cx="50%" cy="50%" r="50%">
            <Stop offset="0%" stopColor="hsl(0, 80%, 75%)" stopOpacity={0.8} />
            <Stop offset="100%" stopColor="hsl(0, 80%, 75%)" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* Tentacles */}
        <G fill="url(#octoGrad)" stroke="hsla(258,65%,68%,0.5)" strokeWidth={2}>
          <Path d="M 50 130 Q 38 165, 50 195 Q 65 175, 60 145 Z" />
          <Path d="M 75 140 Q 65 180, 80 200 Q 95 185, 88 152 Z" />
          <Path d="M 105 142 Q 105 180, 120 200 Q 130 185, 120 150 Z" />
          <Path d="M 135 138 Q 145 175, 155 195 Q 165 175, 155 145 Z" />
        </G>

        {/* Head */}
        <Ellipse cx={100} cy={80} rx={62} ry={56} fill="url(#octoGrad)" stroke="hsla(258,65%,68%,0.55)" strokeWidth={2.5} />

        {/* Cheeks */}
        <Circle cx={70} cy={90} r={10} fill="url(#octoCheek)" />
        <Circle cx={130} cy={90} r={10} fill="url(#octoCheek)" />

        {/* Eyes — closed (blink) or open */}
        {blink ? (
          <>
            <Path d="M 71 76 Q 80 82 89 76" stroke="#1a1f2e" strokeWidth={2.6} fill="none" strokeLinecap="round" />
            <Path d="M 111 76 Q 120 82 129 76" stroke="#1a1f2e" strokeWidth={2.6} fill="none" strokeLinecap="round" />
          </>
        ) : (
          <>
            <Ellipse cx={80} cy={75} rx={9} ry={11} fill="white" />
            <Ellipse cx={120} cy={75} rx={9} ry={11} fill="white" />
            <Circle cx={82} cy={78} r={5} fill="#1a1f2e" />
            <Circle cx={122} cy={78} r={5} fill="#1a1f2e" />
            <Circle cx={80} cy={74} r={1.6} fill="white" />
            <Circle cx={120} cy={74} r={1.6} fill="white" />
          </>
        )}

        {/* Smile */}
        <Path d="M 90 100 Q 100 110 110 100" stroke="hsl(228, 30%, 12%)" strokeWidth={2.5} fill="none" strokeLinecap="round" />
      </Svg>

      {/* Cosmetic slots */}
      {hatEmoji ? <Slot emoji={hatEmoji} top={s * -0.18} fontSize={s * 0.52} /> : null}
      {faceEmoji ? <Slot emoji={faceEmoji} top={s * 0.13} fontSize={s * 0.34} /> : null}
      {bodyEmoji ? <Slot emoji={bodyEmoji} bottom={s * 0.02} fontSize={s * 0.38} /> : null}
    </View>
  );

  return animate ? <Bob amount={6} rotate={1} duration={2600}>{inner}</Bob> : inner;
}

function Slot({ emoji, top, bottom, fontSize }: { emoji: string; top?: number; bottom?: number; fontSize: number }) {
  return (
    <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, top, bottom, alignItems: 'center' }}>
      <Text style={{ fontSize }}>{emoji}</Text>
    </View>
  );
}
