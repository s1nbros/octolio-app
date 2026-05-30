/**
 * "What's new in Octolio" — pops up once on a user's device after the
 * update. Three swipeable slides with feature illustrations (we render
 * the actual UI elements so the "screenshots" stay accurate and never
 * drift from the real app).
 *
 * Storage key:   octolio_seen_whatsnew_v1
 * Trigger:       only for authenticated + onboarded users
 * Dismiss:       last slide → "Got it" button OR close (X)
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { OctopusAvatar } from './OctopusAvatar';
import { CoinIcon } from './CoinIcon';

const STORAGE_KEY = 'octolio_seen_whatsnew_v1';

interface Slide {
  badge: { en: string; bg: string };
  title: { en: string; bg: string };
  body:  { en: string; bg: string };
  illustration: React.ReactNode;
  accent: string;            // hsl(...) — colors the badge + dot
}

/* ─── Illustration 1: Octopus mascot ─────────────────────────── */
function MascotShot() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at 50% 40%, hsl(var(--c-primary) / 0.18), transparent 60%)',
        }} />
      <OctopusAvatar size={150} hatEmoji="🎩" faceEmoji="🕶️" bodyEmoji="🎀" />
      <div className="relative mt-3 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold mono flex items-center gap-1.5"
          style={{ background: 'hsl(var(--c-orange)/0.15)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.35)' }}>
          <CoinIcon size={13} /> 1,250
        </span>
        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.35)' }}>
          🔥 12-day streak
        </span>
      </div>
    </div>
  );
}

/* ─── Illustration 2: Friends ───────────────────────────────── */
function FriendsShot() {
  const rows = [
    { rank: 1, medal: '🥇', name: 's1nbros',  xp: 1240, color: 'hsl(var(--c-gold))', chip: '+260' },
    { rank: 2, medal: '🥈', name: 'You',      xp:  980, color: 'hsl(var(--c-gold))', chip: 'you',     isYou: true },
    { rank: 3, medal: '🥉', name: 'spoko',    xp:  810, color: 'hsl(var(--c-gold))', chip: 'friend' },
    { rank: 4, medal: '4',  name: 'thefoid',  xp:  670, color: 'hsl(var(--c-fg-subtle))', chip: null },
  ];
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl overflow-hidden"
        style={{ background: 'hsl(228, 24%, 12%)', border: '1px solid hsla(0,0%,100%,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div className="px-3.5 py-2.5 border-b" style={{ borderColor: 'hsla(0,0%,100%,0.06)' }}>
          <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>League</p>
        </div>
        {rows.map((r) => (
          <div key={r.rank} className="flex items-center gap-2.5 px-3.5 py-2.5"
            style={{ background: r.isYou ? 'hsl(var(--c-primary)/0.08)' : 'transparent' }}>
            <span className="text-xs mono w-5 text-center font-bold" style={{ color: r.color }}>{r.medal}</span>
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ background: r.isYou ? 'hsl(var(--c-primary)/0.25)' : 'hsl(var(--c-fg-subtle)/0.15)',
                color: r.isYou ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
                border: r.isYou ? '1.5px solid hsl(var(--c-primary)/0.5)' : '1.5px solid hsl(var(--c-fg-subtle)/0.2)' }}>
              {r.name[0]?.toUpperCase()}
            </div>
            <span className="text-xs font-semibold flex-1 truncate"
              style={{ color: r.isYou ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-muted))' }}>{r.name}</span>
            {r.chip === 'you' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(var(--c-primary)/0.18)', color: 'hsl(var(--c-primary))' }}>you</span>
            )}
            {r.chip === 'friend' && (
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.3)' }}>✓ friend</span>
            )}
            <span className="text-[10px] mono font-bold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{r.xp.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Illustration 3: Tools (compound calculator preview) ───── */
function ToolsShot() {
  // Tiny sparkline path — looks like a compound-interest curve
  const points = Array.from({ length: 20 }, (_, i) => {
    const x = (i / 19) * 100;
    const y = 80 - Math.pow(i / 19, 1.8) * 70;
    return `${x},${y}`;
  });
  const linePath = `M ${points.join(' L ')}`;
  const areaPath = `${linePath} L 100,80 L 0,80 Z`;

  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl px-4 py-4"
        style={{ background: 'hsl(228, 24%, 12%)', border: '1px solid hsla(0,0%,100%,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        {/* Tabs */}
        <div className="flex gap-1.5 mb-3 text-[10px] font-bold uppercase tracking-wider">
          <span className="px-2 py-1 rounded-md" style={{ background: 'hsl(var(--c-primary))', color: '#fff' }}>Compound</span>
          <span className="px-2 py-1 rounded-md" style={{ color: 'hsl(var(--c-fg-subtle))' }}>Debt</span>
          <span className="px-2 py-1 rounded-md" style={{ color: 'hsl(var(--c-fg-subtle))' }}>FIRE</span>
        </div>

        {/* Big number */}
        <div className="mb-3">
          <p className="text-[9px] uppercase tracking-wider font-bold mb-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            Future value at 7% / 30 yrs
          </p>
          <p className="text-2xl font-extrabold mono leading-none" style={{ color: 'hsl(var(--c-green))' }}>
            €245,800
          </p>
        </div>

        {/* Chart */}
        <svg viewBox="0 0 100 80" width="100%" height="80" className="mb-3">
          <defs>
            <linearGradient id="ws-grad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"  stopColor="hsl(var(--c-green))" stopOpacity="0.35" />
              <stop offset="100%" stopColor="hsl(var(--c-green))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={areaPath} fill="url(#ws-grad)" />
          <path d={linePath} fill="none" stroke="hsl(var(--c-green))" strokeWidth="1.5" strokeLinecap="round" />
        </svg>

        {/* Sliders */}
        <div className="space-y-2">
          {[
            { label: 'Starting',   value: '€5,000',   accent: 'hsl(var(--c-primary))' },
            { label: 'Monthly',    value: '€300',     accent: 'hsl(var(--c-orange))' },
            { label: 'Annual %',   value: '7%',       accent: 'hsl(var(--c-green))' },
          ].map((s) => (
            <div key={s.label} className="flex items-center justify-between text-[10px]">
              <span style={{ color: 'hsl(var(--c-fg-muted))' }}>{s.label}</span>
              <span className="mono font-bold" style={{ color: s.accent }}>{s.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── The modal ──────────────────────────────────────────────── */
export function WhatsNewModal() {
  const { user } = useAuth();
  const { lang } = useLang();
  const [open, setOpen] = useState(false);
  const [idx, setIdx] = useState(0);
  const startX = useRef(0);
  const dx = useRef(0);

  // Show once after login/onboarding
  useEffect(() => {
    if (!user || !user.onboarding_done) return;
    if (localStorage.getItem(STORAGE_KEY) === '1') return;
    // Small delay so it doesn't pop the instant the page mounts
    const t = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(t);
  }, [user]);

  // Keyboard arrows + ESC
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setIdx(i => Math.min(slides.length - 1, i + 1));
      if (e.key === 'ArrowLeft')  setIdx(i => Math.max(0, i - 1));
      if (e.key === 'Escape')     dismiss();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const slides: Slide[] = [
    {
      badge:        { en: 'NEW MASCOT', bg: 'НОВ ТАЛИСМАН' },
      title:        { en: 'Meet your octopus', bg: 'Запознай се с октопода си' },
      body:         { en: 'You now have a personal octopus on your profile. Dress it up with hats, glasses, and accessories from the new Shop — earn coins by trading XP.',
                      bg: 'Сега имаш личен октопод на профила си. Облечи го с шапки, очила и аксесоари от новия Магазин — изкарваш монети, обменяйки XP.' },
      illustration: <MascotShot />,
      accent:       'hsl(var(--c-primary))',
    },
    {
      badge:        { en: 'FRIENDS', bg: 'ПРИЯТЕЛИ' },
      title:        { en: 'Compete with friends', bg: 'Състезавай се с приятели' },
      body:         { en: 'Add friends by nickname or right from the League. Tap anyone to view their profile, mascot, and stats. Find them under Profile → Friends.',
                      bg: 'Добавяй приятели по никнейм или от Лигата. Натисни на някого, за да видиш профила, талисмана и статистиката му. Намери ги в Профил → Приятели.' },
      illustration: <FriendsShot />,
      accent:       'hsl(var(--c-green))',
    },
    {
      badge:        { en: 'TOOLS', bg: 'ИНСТРУМЕНТИ' },
      title:        { en: 'Real money calculators', bg: 'Реални финансови калкулатори' },
      body:         { en: 'A whole new Tools tab with calculators for compound interest, debt payoff, mortgage, FIRE, and net worth. Use what you learn — right away.',
                      bg: 'Изцяло нов раздел Инструменти с калкулатори за сложна лихва, изплащане на дълг, ипотека, FIRE и собствен капитал.' },
      illustration: <ToolsShot />,
      accent:       'hsl(var(--c-orange))',
    },
  ];

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setOpen(false);
  };

  const goNext = () => {
    if (idx >= slides.length - 1) dismiss();
    else setIdx(idx + 1);
  };
  const goPrev = () => { if (idx > 0) setIdx(idx - 1); };

  const onTouchStart = (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; dx.current = 0; };
  const onTouchMove  = (e: React.TouchEvent) => { dx.current = e.touches[0].clientX - startX.current; };
  const onTouchEnd   = () => {
    const threshold = 50;
    if (dx.current <= -threshold) goNext();
    else if (dx.current >= threshold) goPrev();
    dx.current = 0;
  };

  if (!open) return null;

  const isLast = idx === slides.length - 1;
  const slide = slides[idx];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={dismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, hsl(228, 30%, 13%) 0%, hsl(228, 34%, 9%) 100%)',
          border: '1px solid hsla(0, 0%, 100%, 0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Close */}
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-20"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {/* Header */}
        <div className="px-6 pt-6 pb-2 text-center">
          <p className="text-[10px] font-extrabold tracking-[0.2em] uppercase"
            style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? "What's new in Octolio" : 'Какво е ново в Octolio'}
          </p>
        </div>

        {/* Swipeable carousel */}
        <div
          className="overflow-hidden"
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          <div
            className="flex"
            style={{
              transform: `translateX(-${idx * 100}%)`,
              transition: 'transform 0.35s cubic-bezier(0.32, 0.72, 0.32, 1)',
            }}
          >
            {slides.map((s, i) => (
              <div key={i} className="flex-shrink-0 w-full px-6 pb-4 select-none">
                {/* Illustration */}
                <div className="h-[260px] mb-4 flex items-center justify-center rounded-2xl"
                  style={{ background: `radial-gradient(circle at 50% 50%, ${s.accent}1a, transparent 70%)` }}>
                  {s.illustration}
                </div>

                {/* Text */}
                <div className="text-center">
                  <span className="inline-block text-[10px] font-extrabold tracking-[0.18em] px-2.5 py-1 rounded-full mb-2"
                    style={{ background: `${s.accent}22`, color: s.accent, border: `1px solid ${s.accent}55` }}>
                    {s.badge[lang]}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
                    {s.title[lang]}
                  </h2>
                  <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {s.body[lang]}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer: dots + button */}
        <div className="px-6 pb-6 pt-2">
          <div className="flex items-center justify-center gap-2 mb-4">
            {slides.map((s, i) => (
              <button
                key={i}
                onClick={() => setIdx(i)}
                aria-label={`Slide ${i + 1}`}
                className="rounded-full transition-all"
                style={{
                  width: i === idx ? 24 : 8,
                  height: 8,
                  background: i === idx ? s.accent : 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>

          <div className="flex gap-2">
            {idx > 0 && (
              <button onClick={goPrev}
                className="rounded-full px-5 py-3 font-bold text-sm transition-all active:scale-95"
                style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))', border: '1px solid rgba(255,255,255,0.1)' }}>
                {lang === 'en' ? 'Back' : 'Назад'}
              </button>
            )}
            <button
              onClick={goNext}
              className="flex-1 rounded-full px-5 py-3 font-extrabold text-sm transition-all active:scale-95"
              style={{
                background: slide.accent,
                color: '#fff',
                boxShadow: `0 8px 18px ${slide.accent}55`,
              }}>
              {isLast
                ? (lang === 'en' ? 'Got it →' : 'Разбрах →')
                : (lang === 'en' ? `Next (${idx + 1}/${slides.length})` : `Напред (${idx + 1}/${slides.length})`)}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
