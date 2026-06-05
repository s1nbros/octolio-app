import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

// ─── Types matching backend /api/wheel/* responses ──────────
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

/** Slice colors — one per rarity tier, kept tidy with the wheel-of-fortune feel. */
const SLOT_FILL: Record<string, string> = {
  xp_25:           'hsl(160, 55%, 55%)',  // green
  xp_50:           'hsl(155, 65%, 50%)',
  xp_100:          'hsl(180, 60%, 50%)',
  xp_200:          'hsl(200, 70%, 55%)',
  xp_500:          'hsl(220, 70%, 60%)',
  xp_1000:         'hsl(260, 65%, 65%)',
  cosmetic_common: 'hsl(35, 80%, 60%)',
  cosmetic_rare:   'hsl(290, 70%, 65%)',
  pro_trial:       'hsl(45, 95%, 55%)',   // gold
  cup:             'hsl(0, 75%, 55%)',    // ruby red for legendary
};

/** Smaller fonts for the longer labels so they fit inside thin slices. */
const SLOT_FONT_SIZE: Record<string, number> = {
  pro_trial: 11,
  cosmetic_common: 11,
  cosmetic_rare: 11,
  cup: 11,
};

const WHEEL_SIZE = 320;        // px
const SPIN_DURATION_MS = 8500; // ms — longer build-up + slower deceleration
const EXTRA_TURNS = 9;         // full rotations before settling
/** Path to the real Octolio cup image. Place it at frontend/public/cup.png. */
const CUP_IMG = '/cup.png';

export function WheelOfLuck({ onClose }: { onClose: () => void }) {
  const { token, refreshUser } = useAuth();
  const { lang } = useLang();

  const [slots, setSlots] = useState<SlotDef[] | null>(null);
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealing' | 'done' | 'error'>('idle');
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState<SpinResponse | null>(null);
  const [error, setError] = useState('');

  // Load the slot list once.
  useEffect(() => {
    if (!token) return;
    fetch('/api/wheel/info', { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setSlots(d.slots ?? null))
      .catch(() => setError(lang === 'en' ? 'Could not load the wheel.' : 'Колелото не успя да зареди.'));
  }, [token, lang]);

  const handleSpin = async () => {
    if (!token || phase !== 'idle' || !slots) return;
    setPhase('spinning');
    setError('');
    try {
      const res = await fetch('/api/wheel/spin', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json()) as SpinResponse & { error?: string };
      if (!res.ok) {
        setPhase('error');
        setError(data.error || 'Spin failed');
        return;
      }
      setResult(data);

      // Compute the final rotation so the target slot lands under the pointer (at the top).
      const sliceDeg = 360 / slots.length;
      // Pointer is at 0° (12 o'clock). We want the centre of the winning slot there.
      // Slot i centre angle (starting from 12 o'clock, clockwise) = i * sliceDeg + sliceDeg/2.
      // The wheel rotates CCW visually because we apply a positive rotation that brings the
      // target slot's centre under the pointer.
      const targetCentre = data.slotIndex * sliceDeg + sliceDeg / 2;
      const finalRotation = 360 * EXTRA_TURNS - targetCentre;
      setRotation(finalRotation);

      // After the spin animation completes, refresh the user record so
      // wheel_spun + is_pro + pro_trial_ends_at are reflected everywhere,
      // THEN reveal the prize. Awaiting guarantees that by the time the
      // user clicks "Claim", any Pro-gated content they navigate to sees
      // the freshly-granted Pro state.
      setTimeout(async () => {
        try { await refreshUser(); } catch { /* keep UX moving even if refresh fails */ }
        setPhase('revealing');
      }, SPIN_DURATION_MS + 200);
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Spin failed');
    }
  };

  const handleClose = async () => {
    // Safety net: refresh again on close in case the first refresh raced.
    // This is the moment Pro-only routes will be hit, so we MUST have the
    // freshest is_pro / pro_trial_ends_at before navigating away.
    try { await refreshUser(); } catch { /* ignore */ }
    setPhase('done');
    onClose();
  };

  // ── Loading state ──────────────────────────────────────────
  if (!slots) {
    return (
      <Backdrop>
        <div className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? 'Loading…' : 'Зареждам…'}
        </div>
      </Backdrop>
    );
  }

  // ── Prize reveal ──────────────────────────────────────────
  if (phase === 'revealing' && result) {
    return <PrizeReveal result={result} lang={lang} onClose={handleClose} />;
  }

  // ── Main wheel UI ─────────────────────────────────────────
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

        <Wheel slots={slots} rotation={rotation} />

        <div className="mt-6 flex flex-col items-center gap-3">
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
function Wheel({ slots, rotation }: { slots: SlotDef[]; rotation: number }) {
  const { lang } = useLang();
  const r = WHEEL_SIZE / 2;
  const sliceDeg = 360 / slots.length;
  const labelRadius = r * 0.65;

  return (
    <div className="relative mx-auto" style={{ width: WHEEL_SIZE, maxWidth: '100%' }}>
      {/* Pointer at the top, points down into the wheel */}
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
        style={{
          transform: `rotate(${rotation}deg)`,
          transition: rotation === 0 ? 'none' : `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.12, 0.6, 0.15, 1)`,
          filter: 'drop-shadow(0 8px 24px hsl(0, 0%, 0%, 0.35))',
        }}
      >
        <defs>
          <radialGradient id="wheelGlow" cx="50%" cy="50%" r="50%">
            <stop offset="80%" stopColor="hsl(0, 0%, 100%, 0)" />
            <stop offset="100%" stopColor="hsl(0, 0%, 100%, 0.15)" />
          </radialGradient>
        </defs>

        {/* Slices */}
        {slots.map((slot, i) => {
          const startAngle = i * sliceDeg - 90 - sliceDeg / 2; // start from top-centred
          const endAngle = startAngle + sliceDeg;
          const path = arcPath(r, r, r - 4, startAngle, endAngle);
          const fill = SLOT_FILL[slot.id] ?? 'hsl(220, 30%, 40%)';

          // Label position
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
                <text
                  x="0"
                  y="-8"
                  textAnchor="middle"
                  fontSize="20"
                  style={{ userSelect: 'none' }}
                >
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

        {/* Outer ring */}
        <circle cx={r} cy={r} r={r - 2} fill="none" stroke="hsl(45, 95%, 50%)" strokeWidth="4" />
        <circle cx={r} cy={r} r={r - 2} fill="url(#wheelGlow)" />

        {/* Centre hub */}
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

/** SVG arc path between two angles (degrees, clockwise). */
function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const rad = (d: number) => (d * Math.PI) / 180;
  const x1 = cx + r * Math.cos(rad(startDeg));
  const y1 = cy + r * Math.sin(rad(startDeg));
  const x2 = cx + r * Math.cos(rad(endDeg));
  const y2 = cy + r * Math.sin(rad(endDeg));
  const largeArc = endDeg - startDeg > 180 ? 1 : 0;
  return `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
}

/* ─────────────────────────────────────────────────────────────
 * Prize reveal screen
 * ─────────────────────────────────────────────────────────── */
function PrizeReveal({
  result,
  lang,
  onClose,
}: {
  result: SpinResponse;
  lang: 'en' | 'bg';
  onClose: () => void;
}) {
  const isRare = result.slot.type === 'pro_trial' || result.slot.type === 'cup';

  /**
   * `rewardName` is the short noun used inside the "You won …" headline.
   * Every prize tier — XP included — produces a headline so the user
   * always sees the same encouraging phrasing.
   * `sub` is the extra detail under the headline. `visual` is either an
   * emoji or a JSX image of the real Octolio cup.
   */
  const { rewardName, sub, visual, color } = useMemo(() => {
    const r = result.reward;
    if (r.isCup) {
      return {
        rewardName: lang === 'en' ? 'an Octolio cup!' : 'чаша Octolio!',
        sub:
          lang === 'en'
            ? "You're 1 of only 3 in the world. Our team will reach out by email to arrange delivery."
            : 'Ти си 1 от само 3-ма в света. Екипът ни ще се свърже с теб по имейл, за да уговори доставка.',
        visual: <CupImage />,
        color: 'hsl(0, 75%, 55%)',
      };
    }
    if (r.proTrialEndsAt) {
      const date = new Date(r.proTrialEndsAt).toLocaleDateString(lang === 'en' ? 'en-GB' : 'bg-BG', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });
      return {
        rewardName: lang === 'en' ? '2 weeks of Pro!' : '2 седмици Pro!',
        sub:
          lang === 'en'
            ? `All Pro features unlocked until ${date}. No card required.`
            : `Всички Pro функции отключени до ${date}. Без карта.`,
        visual: <span>👑</span>,
        color: 'hsl(45, 95%, 55%)',
      };
    }
    if (r.cosmeticId) {
      return {
        rewardName: lang === 'en' ? 'a new cosmetic!' : 'нова козметика!',
        sub:
          lang === 'en'
            ? 'Equip it on your octopus from the Shop tab.'
            : 'Можеш да я екипираш на октопода си от раздела Shop.',
        visual: <span>🎁</span>,
        color: 'hsl(290, 70%, 65%)',
      };
    }
    return {
      // e.g. "25 XP" / "1000 XP" — same shape as every other prize so the
      // headline reads "You won 25 XP" / "You won 1000 XP".
      rewardName: `${r.xpDelta} XP`,
      sub:
        lang === 'en'
          ? 'Added to your account. Keep learning to climb the leaderboard.'
          : 'Добавени към акаунта ти. Продължавай да учиш, за да се изкачиш в класирането.',
      visual: <span>✨</span>,
      color: 'hsl(160, 55%, 55%)',
    };
  }, [result, lang]);

  return (
    <Backdrop>
      {isRare && <Confetti />}
      <div
        className="w-full max-w-md rounded-3xl p-8 text-center relative animate-scale-in overflow-hidden"
        style={{
          background: 'hsl(228, 24%, 10%)',
          border: `1px solid ${color}66`,
          boxShadow: `0 24px 60px -10px ${color}44`,
        }}
      >
        {/* Big radial glow behind the emoji */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 30%, ${color}22, transparent 60%)`,
          }}
        />

        <div className="relative">
          {/* Eyebrow: always "Congratulations!" regardless of which prize tier. */}
          <p
            className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: `${color}1F`, color }}
          >
            {lang === 'en' ? '🎉 Congratulations!' : '🎉 Поздравления!'}
          </p>

          <div
            className="leading-none mb-5 animate-prize-pop flex items-center justify-center"
            style={{ fontSize: 88, filter: `drop-shadow(0 8px 24px ${color}66)` }}
          >
            {visual}
          </div>

          {/* Primary "You won X" headline — same shape for every prize tier,
              from 25 XP all the way to the cup. */}
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-3 leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? `You won ${rewardName}` : `Спечели ${rewardName}`}
          </h2>
          <p className="text-sm leading-relaxed mb-7" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {sub}
          </p>

          <button
            onClick={onClose}
            className="btn-green w-full py-3 font-bold"
          >
            {lang === 'en' ? 'Claim & continue →' : 'Вземи и продължи →'}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Cup image with a graceful emoji fallback.
 * Source file lives at frontend/public/cup.png (drop the real photo there).
 * ─────────────────────────────────────────────────────────── */
function CupImage({ size = 144 }: { size?: number }) {
  const [failed, setFailed] = useState(false);
  if (failed) {
    return (
      <span style={{ fontSize: size, lineHeight: 1 }} aria-label="Octolio cup">
        🏆
      </span>
    );
  }
  return (
    <img
      src={CUP_IMG}
      alt="Octolio cup"
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        // Subtle white plate so the photo doesn't clash with the dark modal.
        background: 'white',
        borderRadius: 16,
        padding: 6,
        boxShadow: '0 8px 30px hsl(0, 0%, 0%, 0.35)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * Lightweight confetti for rare wins — no external library
 * ─────────────────────────────────────────────────────────── */
function Confetti() {
  // Generate 60 pieces once on mount with stable random props.
  const pieces = useRef<{ left: number; delay: number; rotate: number; color: string; size: number }[]>([]);
  if (pieces.current.length === 0) {
    const palette = ['hsl(45, 95%, 55%)', 'hsl(160, 55%, 55%)', 'hsl(0, 75%, 60%)', 'hsl(290, 70%, 65%)', 'hsl(200, 70%, 60%)'];
    for (let i = 0; i < 60; i++) {
      pieces.current.push({
        left: Math.random() * 100,
        delay: Math.random() * 0.8,
        rotate: Math.random() * 360,
        color: palette[Math.floor(Math.random() * palette.length)],
        size: 6 + Math.random() * 8,
      });
    }
  }
  return (
    <div className="fixed inset-0 pointer-events-none z-10 overflow-hidden">
      {pieces.current.map((p, i) => (
        <span
          key={i}
          className="absolute animate-confetti-fall"
          style={{
            left: `${p.left}%`,
            top: -20,
            width: p.size,
            height: p.size * 1.4,
            background: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animationDelay: `${p.delay}s`,
            borderRadius: 2,
          }}
        />
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Backdrop
 * ─────────────────────────────────────────────────────────── */
function Backdrop({ children }: { children: React.ReactNode }) {
  // Lock body scroll while the wheel is open.
  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: 'hsl(0, 0%, 0%, 0.6)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {children}
    </div>
  );
}
