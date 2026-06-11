import { useMemo } from 'react';

/**
 * Pure-CSS fireworks effect — no canvas, no external library.
 *
 * Renders N "bursts" at random positions across the viewport. Each burst is
 * a single point that explodes into 14 colored particles radiating outward,
 * fading as they go. Bursts are staggered so the effect feels alive for
 * several seconds.
 */
export function Fireworks({ bursts = 8 }: { bursts?: number }) {
  const palette = [
    'hsl(45, 95%, 60%)',   // gold
    'hsl(160, 65%, 55%)',  // green
    'hsl(0, 80%, 60%)',    // red
    'hsl(200, 80%, 60%)',  // sky
    'hsl(290, 70%, 65%)',  // violet
    'hsl(35, 90%, 60%)',   // orange
  ];

  // Stable random per-mount.
  const items = useMemo(() => {
    return Array.from({ length: bursts }, (_, i) => ({
      key: i,
      top: 10 + Math.random() * 60,             // % from top
      left: 10 + Math.random() * 80,            // % from left
      delay: Math.random() * 2.5,               // seconds
      color: palette[Math.floor(Math.random() * palette.length)],
      scale: 0.85 + Math.random() * 0.5,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bursts]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[2147483645] overflow-hidden">
      {items.map((b) => (
        <Burst
          key={b.key}
          top={b.top}
          left={b.left}
          delay={b.delay}
          color={b.color}
          scale={b.scale}
        />
      ))}
    </div>
  );
}

function Burst({
  top,
  left,
  delay,
  color,
  scale,
}: {
  top: number;
  left: number;
  delay: number;
  color: string;
  scale: number;
}) {
  const PARTICLES = 14;
  const radius = 110 * scale; // px

  return (
    <div
      className="absolute"
      style={{
        top: `${top}%`,
        left: `${left}%`,
        width: 0,
        height: 0,
      }}
    >
      {Array.from({ length: PARTICLES }).map((_, i) => {
        const angle = (i / PARTICLES) * 2 * Math.PI;
        const dx = Math.cos(angle) * radius;
        const dy = Math.sin(angle) * radius;
        return (
          <span
            key={i}
            className="absolute animate-firework-particle"
            style={{
              left: 0,
              top: 0,
              width: 6,
              height: 6,
              borderRadius: '50%',
              background: color,
              boxShadow: `0 0 8px ${color}`,
              // CSS variables consumed by the @keyframes
              ['--dx' as string]: `${dx}px`,
              ['--dy' as string]: `${dy}px`,
              animationDelay: `${delay}s`,
            } as React.CSSProperties}
          />
        );
      })}
      {/* Bright flash at the centre when the burst fires */}
      <span
        className="absolute animate-firework-flash"
        style={{
          left: -10,
          top: -10,
          width: 20,
          height: 20,
          borderRadius: '50%',
          background: color,
          boxShadow: `0 0 24px ${color}`,
          animationDelay: `${delay}s`,
        }}
      />
    </div>
  );
}
