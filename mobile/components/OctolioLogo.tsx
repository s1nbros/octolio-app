import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, RadialGradient, Stop } from 'react-native-svg';
import { Bob } from '../lib/anim';

/** Octolio brand mark — mint octopus holding a gold star-coin with an up-arrow
 *  tentacle (growth). Vector recreation of the app icon; scales crisply.
 *  One arm on the left (the up-arrow), one on the right (the coin). Idle-bobs. */
export function OctolioLogo({ size = 140, animate = true }: { size?: number; animate?: boolean }) {
  const svg = (
    <Svg viewBox="0 0 220 210" width={size} height={size * (210 / 220)}>
      <Defs>
        <LinearGradient id="ol_body" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#aeecd8" />
          <Stop offset="1" stopColor="#54c4a4" />
        </LinearGradient>
        <LinearGradient id="ol_tip" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#7ad4ba" />
          <Stop offset="1" stopColor="#b9a6f0" />
        </LinearGradient>
        <RadialGradient id="ol_coin" cx="40%" cy="35%" r="75%">
          <Stop offset="0" stopColor="#f7d78c" />
          <Stop offset="1" stopColor="#dca548" />
        </RadialGradient>
        <RadialGradient id="ol_cheek" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor="#f2a68d" stopOpacity={0.85} />
          <Stop offset="1" stopColor="#f2a68d" stopOpacity={0} />
        </RadialGradient>
      </Defs>

      {/* up-arrow tentacle (left) */}
      <Path d="M74 120 Q54 126 48 146" fill="none" stroke="#79cfb5" strokeWidth={13} strokeLinecap="round" />
      <Path d="M48 150 L48 106" fill="none" stroke="#79cfb5" strokeWidth={13} strokeLinecap="round" />
      <Path d="M32 122 L48 104 L64 122" fill="none" stroke="#79cfb5" strokeWidth={13} strokeLinecap="round" strokeLinejoin="round" />

      {/* coin arm (right, behind head) */}
      <Path d="M148 104 Q178 100 184 80" fill="none" stroke="#5cc7a7" strokeWidth={13} strokeLinecap="round" />

      {/* bottom tentacles (mint → lavender tips) — no left-side leg, so the
          up-arrow reads as the single left arm */}
      <G fill="url(#ol_tip)">
        <Path d="M84 144 Q76 182 90 200 Q104 186 98 152 Z" />
        <Path d="M110 146 Q112 184 126 200 Q136 184 124 152 Z" />
        <Path d="M136 136 Q148 170 154 194 Q166 174 150 146 Z" />
      </G>

      {/* head */}
      <Ellipse cx={100} cy={82} rx={60} ry={54} fill="url(#ol_body)" stroke="#c9efe1" strokeWidth={3} />
      <Ellipse cx={80} cy={56} rx={17} ry={10} fill="#ffffff" opacity={0.3} />

      {/* cheeks */}
      <Circle cx={70} cy={94} r={11} fill="url(#ol_cheek)" />
      <Circle cx={130} cy={94} r={11} fill="url(#ol_cheek)" />

      {/* eyes */}
      <Ellipse cx={82} cy={78} rx={9} ry={11} fill="#ffffff" />
      <Ellipse cx={118} cy={78} rx={9} ry={11} fill="#ffffff" />
      <Circle cx={84} cy={81} r={5} fill="#294a44" />
      <Circle cx={120} cy={81} r={5} fill="#294a44" />
      <Circle cx={82} cy={77} r={1.7} fill="#ffffff" />
      <Circle cx={118} cy={77} r={1.7} fill="#ffffff" />

      {/* smile */}
      <Path d="M90 101 Q100 112 110 101" stroke="#294a44" strokeWidth={3} fill="none" strokeLinecap="round" />

      {/* star-coin (on top) */}
      <Circle cx={184} cy={62} r={22} fill="url(#ol_coin)" stroke="#cf9838" strokeWidth={2.5} />
      <Circle cx={184} cy={62} r={16} fill="none" stroke="#eab95f" strokeWidth={2} />
      <Path d="M184 50 L187.06 57.79 L195.41 58.29 L188.95 63.61 L191.05 71.71 L184 67.2 L176.95 71.71 L179.05 63.61 L172.59 58.29 L180.94 57.79 Z" fill="#cf9235" />
    </Svg>
  );
  return animate ? <Bob amount={9} rotate={1.5} duration={2000}>{svg}</Bob> : svg;
}
