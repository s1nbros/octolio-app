import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import type { PrizeResult } from './PrizeRevealPopup';

/* ─── Types matching backend /api/wheel/* responses ─── */
type SlotType = 'xp' | 'cosmetic' | 'pro_trial' | 'cup';

interface SlotDef {
  id: string;
  type: SlotType;
  label: { en: string; bg: string; emoji: string };
}

interface SpinResponse {
  slotIndex: number;
  slot: SlotDef;
  reward: {
    slotId: string;
    type: SlotType;
    xpDelta?: number;
    cosmeticId?: string;
    proTrialEndsAt?: string;
    isCup?: boolean;
  };
}

const SLOT_FILL: Record<string, string> = {
  xp_25: 'hsl(160, 55%, 55%)',
  xp_50: 'hsl(155, 65%, 50%)',
  xp_100: 'hsl(180, 60%, 50%)',
  xp_200: 'hsl(200, 70%, 55%)',
  xp_500: 'hsl(220, 70%, 60%)',
  xp_1000: 'hsl(260, 65%, 65%)',
  cosmetic_common: 'hsl(35, 80%, 60%)',
  cosmetic_rare: 'hsl(290, 70%, 65%)',
  pro_trial: 'hsl(45, 95%, 55%)',
  cup: 'hsl(0, 75%, 55%)',
};

const SLOT_FONT_SIZE: Record<string, number> = {
  pro_trial: 11,
  cosmetic_common: 11,
  cosmetic_rare: 11,
  cup: 11,
};

const WHEEL_SIZE = 320;
/** How long the wheel spins visually before the popup takes over. */
const SPIN_DURATION_MS = 4500;
const EXTRA_TURNS = 6;

/* ─────────────────────────────────────────────────────────────
 * WheelOfLuck — spinning wheel modal. Calls `onSpinComplete(prize)`
 * once the wheel finishes spinning. The PARENT decides what to do
 * with the prize (typically: mount the PrizeRevealPopup).
 *
 * `onClose` is called only when the user dismisses the wheel
 * WITHOUT a prize (currently only used for the error escape hatch).
 * ─────────────────────────────────────────────────────────── */
export function WheelOfLuck({
  onSpinComplete,
  onClose,
}: {
  onSpinComplete: (prize: PrizeResult) => void;
  onClose: () => void;
}) {
  const { token } = useAuth();
  const { lang } = useLang();

  const [phase, setPhase] = useState<'loading' | 'idle' | 'spinning' | 'error'>('loading');
  const [slots, setSlots] = useState<SlotDef[]>([]);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');
  // Holds the SpinResponse between the network response and the moment
  // the animation finishes (so we can call onSpinComplete with the prize).
  const pendingResultRef = useRef<SpinResponse | null>(null);
  // Guard against the dual-trigger (onTransitionEnd + setTimeout) firing twice.
  const completedRef = useRef(false);

  /* ── Load slot list ─────────────────────────────────────── */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    fetch('/api/wheel/info', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        setSlots(d.slots ?? []);
        setPhase('idle');
      })
      .catch(() => {
        if (cancelled) return;
        setError(lang === 'en' ? 'Could not load the wheel.' : 'Колелото не успя да зареди.');
        setPhase('error');
      });
    return () => {
      cancelled = true;
    };
  }, [token, lang]);

  /* ── Reveal-completion: fire onSpinComplete EXACTLY ONCE ─ */
  const completeSpin = () => {
    if (completedRef.current) return;
    const r = pendingResultRef.current;
    if (!r) return;
    completedRef.current = true;
    onSpinComplete({
      slotType: r.slot.type,
      xpDelta: r.reward.xpDelta,
      cosmeticId: r.reward.cosmeticId,
      proTrialEndsAt: r.reward.proTrialEndsAt,
      isCup: r.reward.isCup,
    });
  };

  /* ── Fallback timer (in case onTransitionEnd never fires) ─ */
  useEffect(() => {
    if (phase !== 'spinning') return;
    const id = window.setTimeout(completeSpin, SPIN_DURATION_MS + 500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── Spin handler ───────────────────────────────────────── */
  const handleSpin = async () => {
    if (!token || phase !== 'idle' || slots.length === 0) return;
    setError('');
    completedRef.current = false;
    setPhase('spinning');

    // BULLETPROOF FALLBACK: schedule the popup to appear regardless of any
    // animation event. This fires after SPIN_DURATION_MS + 500ms whether or
    // not onTransitionEnd / the phase-watching useEffect ever ran. Cleared
    // by completeSpin() if either of the other triggers wins.
    const hardId = window.setTimeout(() => completeSpin(), SPIN_DURATION_MS + 500);

    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as SpinResponse & { error?: string };
      if (!res.ok) {
        window.clearTimeout(hardId);
        setPhase('error');
        setError(data.error || 'Spin failed');
        return;
      }
      pendingResultRef.current = data;

      const sliceDeg = 360 / slots.length;
      const targetCentre = data.slotIndex * sliceDeg + sliceDeg / 2;
      const finalRotation = 360 * EXTRA_TURNS - targetCentre;
      setRotation(finalRotation);
    } catch (e) {
      window.clearTimeout(hardId);
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Spin failed');
    }
  };

  /* ── Render ─────────────────────────────────────────────── */
  return (
    <Backdrop>
      <div
        className="w-full max-w-md rounded-3xl p-6 sm:p-8 relative animate-scale-in"
        style={{
          background: 'hsl(228, 24%, 10%)',
          border: '1px solid hsl(var(--c-fg)/0.08)',
          boxShadow: '0 24px 60px -10px hsl(0, 0%, 0%, 0.4)',
        }}
      >
        <header className="text-center mb-5">
          <p
            className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-3"
            style={{ background: 'hsl(45, 95%, 55%, 0.12)', color: 'hsl(45, 95%, 65%)' }}
          >
            {lang === 'en' ? '✦ Welcome gift' : '✦ Подарък за добре дошъл'}
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Spin the Wheel of Luck' : 'Завърти колелото на късмета'}
          </h2>
          <p className="text-sm mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'One free spin — XP, cosmetics, Pro trial, or an Octolio cup (3 left in the world).'
              : 'Едно безплатно завъртане — XP, козметика, Pro пробен или чаша Octolio (само 3 в света).'}
          </p>
        </header>

        {phase !== 'loading' && (
          <Wheel slots={slots} rotation={rotation} onTransitionEnd={completeSpin} />
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {phase === 'loading' && (
            <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Loading…' : 'Зареждам…'}
            </p>
          )}
          {phase === 'idle' && (
            <button
              onClick={handleSpin}
              className="btn-green px-10 py-3 text-base font-bold animate-bounce-soft"
            >
              🎰 {lang === 'en' ? 'Spin' : 'Завърти'}
            </button>
          )}
          {phase === 'spinning' && (
            <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Spinning…' : 'Върти се…'}
            </p>
          )}
          {phase === 'error' && (
            <>
              <p className="text-sm font-semibold" style={{ color: 'hsl(var(--c-red))' }}>
                ⚠ {error}
              </p>
              <button onClick={onClose} className="btn-ghost px-6 py-2 text-sm">
                {lang === 'en' ? 'Close' : 'Затвори'}
              </button>
            </>
          )}
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────
 * The SVG wheel itself
 * ─────────────────────────────────────────────────────────── */
function Wheel({
  slots,
  rotation,
  onTransitionEnd,
}: {
  slots: SlotDef[];
  rotation: number;
  onTransitionEnd: () => void;
}) {
  const { lang } = useLang();
  const r = WHEEL_SIZE / 2;
  const sliceDeg = slots.length > 0 ? 360 / slots.length : 36;
  const labelRadius = r * 0.65;

  const handleEnd = (e: React.TransitionEvent<SVGSVGElement>) => {
    if (e.propertyName === 'transform') onTransitionEnd();
  };

  return (
    <div className="relative mx-auto" style={{ width: WHEEL_SIZE, maxWidth: '100%' }}>
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: -4, filter: 'drop-shadow(0 4px 8px hsl(0, 0%, 0%, 0.4))' }}
      >
        <svg width="28" height="36" viewBox="0 0 28 36">
          <path
            d="M 14 36 L 0 0 L 28 0 Z"
            fill="hsl(45, 95%, 60%)"
            stroke="hsl(45, 95%, 30%)"
            strokeWidth="1.5"
          />
          <circle cx="14" cy="6" r="2" fill="hsl(45, 95%, 90%)" />
        </svg>
      </div>

      <svg
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        width="100%"
        onTransitionEnd={handleEnd}
        style={{
          transform: `rotate(${rotation}deg)`,
          transition:
            rotation === 0
              ? 'none'
              : `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.6, 0.15, 1)`,
          filter: 'drop-shadow(0 8px 24px hsl(0, 0%, 0%, 0.35))',
        }}
      >
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="hsl(0, 0%, 100%, 0)" />
            <stop offset="100%" stopColor="hsl(0, 0%, 100%, 0.15)" />
          </radialGradient>
        </defs>

        {slots.map((slot, i) => {
          const startAngle = i * sliceDeg - 90 - sliceDeg / 2;
          const endAngle = startAngle + sliceDeg;
          const path = arcPath(r, r, r - 4, startAngle, endAngle);
          const fill = SLOT_FILL[slot.id] ?? 'hsl(220, 30%, 40%)';
          const midAngle = (startAngle + endAngle) / 2;
          const lblX = r + labelRadius * Math.cos((midAngle * Math.PI) / 180);
          const lblY = r + labelRadius * Math.sin((midAngle * Math.PI) / 180);
          const labelText = slot.label[lang];
          const fontSize = SLOT_FONT_SIZE[slot.id] ?? 13;

          return (
            <g key={slot.id}>
              <path d={path} fill={fill} stroke="hsl(0, 0%, 100%, 0.18)" strokeWidth="1.5" />
              <g
                transform={`translate(${lblX}, ${lblY}) rotate(${midAngle + 90})`}
                style={{ pointerEvents: 'none' }}
              >
                <text x="0" y="-8" textAnchor="middle" fontSize="20" style={{ userSelect: 'none' }}>
                  {slot.label.emoji}
                </text>
                <text
                  x="0"
                  y="12"
                  textAnchor="middle"
                  fontSize={fontSize}
                  fontWeight="800"
                  fill="white"
                  style={{ userSelect: 'none' }}
                >
                  {labelText}
                </text>
              </g>
            </g>
          );
        })}

        <circle cx={r} cy={r} r={r - 2} fill="none" stroke="hsl(45, 95%, 50%)" strokeWidth="4" />
        <circle cx={r} cy={r} r={r - 2} fill="url(#wheelGlow)" />
        <circle cx={r} cy={r} r={28} fill="hsl(228, 24%, 14%)" stroke="hsl(45, 95%, 55%)" strokeWidth="3" />
        <text
          x={r}
          y={r + 5}
          textAnchor="middle"
          fontSize="22"
          fontWeight="900"
          fill="hsl(45, 95%, 55%)"
        >
          ✦
        </text>
      </svg>
    </div>
  );
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

function Backdrop({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  // Portal directly into document.body so no ancestor's stacking context,
  // transform, or backdrop-filter can clip or hide the wheel.
  return createPortal(
    <div
      className="fixed inset-0 z-[2147483646] flex items-center justify-center p-4"
      style={{ background: 'hsl(0, 0%, 0%, 0.6)', backdropFilter: 'blur(8px)' }}
    >
      {children}
    </div>,
    document.body,
  );
}
