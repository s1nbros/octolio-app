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

/** Slice colors — one per rarity tier. */
const SLOT_FILL: Record<string, string> = {
  xp_25:           'hsl(160, 55%, 55%)',
  xp_50:           'hsl(155, 65%, 50%)',
  xp_100:          'hsl(180, 60%, 50%)',
  xp_200:          'hsl(200, 70%, 55%)',
  xp_500:          'hsl(220, 70%, 60%)',
  xp_1000:         'hsl(260, 65%, 65%)',
  cosmetic_common: 'hsl(35, 80%, 60%)',
  cosmetic_rare:   'hsl(290, 70%, 65%)',
  pro_trial:       'hsl(45, 95%, 55%)',
  cup:             'hsl(0, 75%, 55%)',
};

const SLOT_FONT_SIZE: Record<string, number> = {
  pro_trial: 11,
  cosmetic_common: 11,
  cosmetic_rare: 11,
  cup: 11,
};

const WHEEL_SIZE = 320;
const SPIN_DURATION_MS = 8500;
const EXTRA_TURNS = 9;
const CUP_IMG = '/cup.png';

/* ─────────────────────────────────────────────────────────────
 * Top-level component
 * ─────────────────────────────────────────────────────────── */
export function WheelOfLuck({ onClose }: { onClose: () => void }) {
  const { token, refreshUser } = useAuth();
  const { lang } = useLang();

  // Phase state machine — kept intentionally tiny.
  //   'loading'   → fetching the slot list
  //   'idle'      → user can spin
  //   'spinning'  → backend responded, SVG is rotating
  //   'revealed'  → reveal screen is showing the prize
  //   'error'     → fatal error; show retry/close
  const [phase, setPhase] = useState<'loading' | 'idle' | 'spinning' | 'revealed' | 'error'>('loading');
  const [slots, setSlots] = useState<SlotDef[]>([]);
  const [result, setResult] = useState<SpinResponse | null>(null);
  const [rotation, setRotation] = useState(0);
  const [error, setError] = useState('');

  // Used to make sure the reveal trigger only fires once per spin, even if
  // both onTransitionEnd AND the fallback setTimeout race to a finish.
  const revealFiredRef = useRef(false);

  /* ── 1. Load the slot list ───────────────────────────────── */
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
    return () => { cancelled = true; };
  }, [token, lang]);

  /* ── 2. Reveal trigger — fired by EITHER onTransitionEnd or a fallback timer.
        Whichever fires first wins; the other is no-op'd by revealFiredRef. ── */
  const triggerReveal = () => {
    if (revealFiredRef.current) return;
    revealFiredRef.current = true;
    setPhase('revealed');
    // Fire-and-forget refresh so is_pro / wheel_spun update in the background.
    // We re-refresh on Claim as a safety net before navigating to Pro routes.
    refreshUser().catch(() => { /* keep UX moving */ });
  };

  /* ── 3. Fallback timer — fires `triggerReveal` if onTransitionEnd misses
        (e.g. background tab throttling, reduced-motion, browser quirks). ── */
  useEffect(() => {
    if (phase !== 'spinning') return;
    const id = window.setTimeout(triggerReveal, SPIN_DURATION_MS + 500);
    return () => window.clearTimeout(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  /* ── 4. Spin handler ─────────────────────────────────────── */
  const handleSpin = async () => {
    if (!token || phase !== 'idle' || slots.length === 0) return;
    setError('');
    revealFiredRef.current = false;
    setPhase('spinning');
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

      // Land the winning slot under the top pointer.
      const sliceDeg = 360 / slots.length;
      const targetCentre = data.slotIndex * sliceDeg + sliceDeg / 2;
      const finalRotation = 360 * EXTRA_TURNS - targetCentre;
      setRotation(finalRotation);
      // Reveal is now driven by the SVG's onTransitionEnd (primary) + fallback timer.
    } catch (e) {
      setPhase('error');
      setError(e instanceof Error ? e.message : 'Spin failed');
    }
  };

  /* ── 5. Close handler ────────────────────────────────────── */
  const handleClose = async () => {
    // Refresh one more time so any Pro-gated route the user lands on next
    // sees the freshly-granted is_pro state.
    try { await refreshUser(); } catch { /* ignore */ }
    onClose();
  };

  /* ── 6. Render ───────────────────────────────────────────── */
  // Reveal takes over the modal entirely once a prize is in.
  if (phase === 'revealed' && result) {
    return <PrizeReveal result={result} lang={lang} onClose={handleClose} />;
  }

  if (phase === 'loading') {
    return (
      <Backdrop>
        <div className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? 'Loading…' : 'Зареждам…'}
        </div>
      </Backdrop>
    );
  }

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

        <Wheel slots={slots} rotation={rotation} onTransitionEnd={triggerReveal} />

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

  // Only fire on the transform transition completing — other CSS properties
  // shouldn't bubble through but we guard just in case.
  const handleEnd = (e: React.TransitionEvent<SVGSVGElement>) => {
    if (e.propertyName === 'transform') onTransitionEnd();
  };

  return (
    <div className="relative mx-auto" style={{ width: WHEEL_SIZE, maxWidth: '100%' }}>
      {/* Pointer */}
      <div
        className="absolute left-1/2 -translate-x-1/2 z-10"
        style={{ top: -4, filter: 'drop-shadow(0 4px 8px hsl(0, 0%, 0%, 0.4))' }}
      >
        <svg width="28" height="36" viewBox="0 0 28 36">
          <path d="M 14 36 L 0 0 L 28 0 Z" fill="hsl(45, 95%, 60%)" stroke="hsl(45, 95%, 30%)" strokeWidth="1.5" />
          <circle cx="14" cy="6" r="2" fill="hsl(45, 95%, 90%)" />
        </svg>
      </div>

      <svg
        viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}
        width="100%"
        onTransitionEnd={handleEnd}
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
              <g transform={`translate(${lblX}, ${lblY}) rotate(${midAngle + 90})`} style={{ pointerEvents: 'none' }}>
                <text x="0" y="-8" textAnchor="middle" fontSize="20" style={{ userSelect: 'none' }}>
                  {slot.label.emoji}
                </text>
                <text x="0" y="12" textAnchor="middle" fontSize={fontSize} fontWeight="800" fill="white" style={{ userSelect: 'none' }}>
                  {labelText}
                </text>
              </g>
            </g>
          );
        })}

        <circle cx={r} cy={r} r={r - 2} fill="none" stroke="hsl(45, 95%, 50%)" strokeWidth="4" />
        <circle cx={r} cy={r} r={r - 2} fill="url(#wheelGlow)" />
        <circle cx={r} cy={r} r={28} fill="hsl(228, 24%, 14%)" stroke="hsl(45, 95%, 55%)" strokeWidth="3" />
        <text x={r} y={r + 5} textAnchor="middle" fontSize="22" fontWeight="900" fill="hsl(45, 95%, 55%)">
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

/* ─────────────────────────────────────────────────────────────
 * Prize reveal screen — ALWAYS shows "🎉 Congratulations!" big.
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
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 30%, ${color}22, transparent 60%)` }}
        />

        <div className="relative">
          <p
            className="inline-block text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4"
            style={{ background: `${color}1F`, color }}
          >
            {lang === 'en' ? '✦ Prize unlocked' : '✦ Награда отключена'}
          </p>

          <div
            className="leading-none mb-5 animate-prize-pop flex items-center justify-center"
            style={{ fontSize: 88, filter: `drop-shadow(0 8px 24px ${color}66)` }}
          >
            {visual}
          </div>

          {/* BIG primary message — shows for every prize, including 25 XP. */}
          <h2
            className="text-3xl sm:text-4xl font-extrabold mb-1 leading-tight"
            style={{ color, letterSpacing: '-0.01em' }}
          >
            {lang === 'en' ? '🎉 Congratulations!' : '🎉 Поздравления!'}
          </h2>
          <p
            className="text-xl sm:text-2xl font-extrabold mb-3 leading-tight"
            style={{ color: 'hsl(var(--c-fg))' }}
          >
            {lang === 'en' ? `You won ${rewardName}` : `Спечели ${rewardName}`}
          </p>
          <p className="text-sm leading-relaxed mb-7" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {sub}
          </p>

          <button onClick={onClose} className="btn-green w-full py-3 font-bold">
            {lang === 'en' ? 'Claim & continue →' : 'Вземи и продължи →'}
          </button>
        </div>
      </div>
    </Backdrop>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Cup image with a graceful emoji fallback.
 * Source file lives at frontend/public/cup.png.
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
        background: 'white',
        borderRadius: 16,
        padding: 6,
        boxShadow: '0 8px 30px hsl(0, 0%, 0%, 0.35)',
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────
 * Lightweight confetti for rare wins.
 * ─────────────────────────────────────────────────────────── */
function Confetti() {
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
 * Backdrop — locks body scroll while modal is open.
 * ─────────────────────────────────────────────────────────── */
function Backdrop({ children }: { children: React.ReactNode }) {
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
      style={{ background: 'hsl(0, 0%, 0%, 0.6)', backdropFilter: 'blur(8px)' }}
    >
      {children}
    </div>
  );
}
