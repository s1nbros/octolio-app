import { StyleSheet, View, useWindowDimensions } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

/**
 * Aurora background — three soft radial colour blobs (violet / mint / ember),
 * mirroring the web app's `.aurora-*` layers. Purely decorative, non-interactive.
 */
export function Aurora() {
  const { width, height } = useWindowDimensions();
  const blob = (id: string, color: string, o: number) => (
    <RadialGradient id={id} cx="50%" cy="50%" r="50%">
      <Stop offset="0" stopColor={color} stopOpacity={o} />
      <Stop offset="0.62" stopColor={color} stopOpacity={0} />
    </RadialGradient>
  );
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
        <Defs>
          {blob('au-a', 'hsl(270, 65%, 55%)', 0.34)}
          {blob('au-b', 'hsl(162, 55%, 52%)', 0.18)}
          {blob('au-c', 'hsl(32, 82%, 56%)', 0.14)}
        </Defs>
        <Circle cx={width * 0.15} cy={height * 0.04} r={440} fill="url(#au-a)" />
        <Circle cx={width * 0.98} cy={height * 0.16} r={390} fill="url(#au-b)" />
        <Circle cx={width * 0.42} cy={height * 0.98} r={350} fill="url(#au-c)" />
      </Svg>
    </View>
  );
}
