import { ReactNode, useEffect, useRef } from 'react';
import { Animated, Easing, ViewStyle } from 'react-native';

/** Mounts children with the web's `scale-in` (opacity + scale 0.9→1). */
export function FadeScaleIn({ children, style, delay = 0, from = 0.92 }: { children: ReactNode; style?: ViewStyle; delay?: number; from?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 350, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ scale: v.interpolate({ inputRange: [0, 1], outputRange: [from, 1] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** Mounts children with the web's `fade-up` (opacity + translateY 14→0). */
export function FadeInUp({ children, style, delay = 0, dy = 16 }: { children: ReactNode; style?: ViewStyle; delay?: number; dy?: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(v, { toValue: 1, duration: 400, delay, easing: Easing.out(Easing.cubic), useNativeDriver: true }).start();
  }, [v, delay]);
  return (
    <Animated.View style={[style, { opacity: v, transform: [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [dy, 0] }) }] }]}>
      {children}
    </Animated.View>
  );
}

/** Looping idle float — a gentle up/down bob with an optional slight sway.
 *  Used to bring the octopus mascot + logo to life. */
export function Bob({ children, style, amount = 6, rotate = 0, duration = 2200 }: {
  children: ReactNode; style?: ViewStyle; amount?: number; rotate?: number; duration?: number;
}) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([
      Animated.timing(v, { toValue: 1, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      Animated.timing(v, { toValue: 0, duration, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
    ]));
    loop.start();
    return () => loop.stop();
  }, [v, duration]);
  const transform: any[] = [{ translateY: v.interpolate({ inputRange: [0, 1], outputRange: [amount / 2, -amount / 2] }) }];
  if (rotate) transform.push({ rotate: v.interpolate({ inputRange: [0, 1], outputRange: [`-${rotate}deg`, `${rotate}deg`] }) });
  return <Animated.View style={[style, { transform }]}>{children}</Animated.View>;
}

/** The web's `xp-pop` — a "+N XP" that pops up and fades. Render when `trigger` changes. */
export function XpPop({ amount, trigger }: { amount: number; trigger: number }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (trigger === 0) return;
    v.setValue(0);
    Animated.timing(v, { toValue: 1, duration: 1200, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  }, [trigger, v]);
  if (trigger === 0) return null;
  return (
    <Animated.Text
      pointerEvents="none"
      style={{
        position: 'absolute', top: -6, alignSelf: 'center', fontWeight: '900', fontSize: 16, color: 'hsl(162, 52%, 62%)',
        opacity: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 1, 0] }),
        transform: [
          { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [0, -30] }) },
          { scale: v.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.5, 1.2, 1] }) },
        ],
      }}
    >
      +{amount} XP!
    </Animated.Text>
  );
}
