/**
 * "What's new in Octolio" — pops up once on a user's device after the
 * update. Three swipeable slides with feature illustrations (we render
 * the actual UI elements so the "screenshots" stay accurate and never
 * drift from the real app).
 *
 * Storage key:   octolio_seen_whatsnew_v2  (bump the version to re-show after an update)
 * Trigger:       only for authenticated + onboarded users
 * Dismiss:       last slide → "Got it" button OR close (X)
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { OctopusAvatar } from './OctopusAvatar';

const STORAGE_KEY = 'octolio_seen_whatsnew_v2';

interface Slide {
  badge: { en: string; bg: string };
  title: { en: string; bg: string };
  body:  { en: string; bg: string };
  illustration: React.ReactNode;
  accent: string;            // hsl(...) — colors the badge + dot
}

/* ─── Illustration 1: Wheel of Luck ──────────────────────────── */
function WheelShot() {
  const colors = ['hsl(160,55%,55%)', 'hsl(45,95%,55%)', 'hsl(200,70%,55%)', 'hsl(290,70%,65%)', 'hsl(0,75%,55%)', 'hsl(28,85%,60%)', 'hsl(239,84%,67%)', 'hsl(155,65%,50%)'];
  const segs = colors.length;
  const cx = 80, cy = 80, r = 68;
  const paths = colors.map((c, i) => {
    const a0 = (i / segs) * 2 * Math.PI - Math.PI / 2;
    const a1 = ((i + 1) / segs) * 2 * Math.PI - Math.PI / 2;
    const x0 = cx + r * Math.cos(a0), y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1), y1 = cy + r * Math.sin(a1);
    return <path key={i} d={`M ${cx} ${cy} L ${x0} ${y0} A ${r} ${r} 0 0 1 ${x1} ${y1} Z`} fill={c} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />;
  });
  return (
    <div className="flex flex-col items-center justify-center w-full h-full">
      <svg width="170" height="178" viewBox="0 0 160 168" style={{ filter: 'drop-shadow(0 10px 24px rgba(0,0,0,0.4))' }}>
        <g className="animate-spin" style={{ transformOrigin: '80px 80px', animationDuration: '14s' }}>{paths}</g>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(45,95%,52%)" strokeWidth="3" />
        <circle cx={cx} cy={cy} r="14" fill="hsl(228,24%,12%)" stroke="hsl(45,95%,55%)" strokeWidth="2.5" />
        <text x={cx} y={cy + 5} textAnchor="middle" fontSize="16" fill="hsl(45,95%,60%)" fontWeight="900">✦</text>
        <path d="M 80 4 L 71 22 L 89 22 Z" fill="hsl(45,95%,60%)" stroke="hsl(45,95%,30%)" strokeWidth="1" />
      </svg>
      <div className="flex gap-2 mt-1 text-lg">✨ 👑 🏆</div>
    </div>
  );
}

/* ─── Illustration 2: New interactive lessons (boss battle) ──── */
function LessonsShot() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl p-4 space-y-3"
        style={{ background: 'hsl(228, 24%, 12%)', border: '1px solid hsla(0,0%,100%,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <p className="text-[10px] uppercase tracking-wider font-bold" style={{ color: 'hsl(var(--c-red))' }}>⚔️ Boss Battle</p>
        <div className="flex items-center gap-2.5">
          <span className="text-3xl">🐉</span>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>The Debt Dragon</p>
            <div className="h-2.5 rounded-full mt-1 overflow-hidden" style={{ background: 'hsl(var(--c-fg)/0.12)' }}>
              <div className="h-full rounded-full" style={{ width: '40%', background: 'hsl(var(--c-red))' }} />
            </div>
          </div>
          <span className="text-sm tracking-tighter">❤️❤️❤️</span>
        </div>
        <div className="flex gap-1.5">
          {['🃏 Swipe', '⚡ Speed', '🎮 Life Sim'].map((t) => (
            <span key={t} className="text-[9px] font-bold px-2 py-1 rounded-md"
              style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))' }}>{t}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Illustration 3: Daily Money Workout ───────────────────── */
function WorkoutShot() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl p-4"
        style={{ background: 'linear-gradient(135deg, hsl(45,95%,55%,0.12), hsl(var(--c-orange)/0.08))', border: '1px solid hsl(45,95%,55%,0.3)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: 'hsl(228,24%,14%)', border: '1px solid hsla(0,0%,100%,0.08)' }}>🧠</div>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>Daily Money Workout</p>
            <p className="text-[11px]" style={{ color: 'hsl(var(--c-fg-muted))' }}>60 seconds · +15 XP · keeps your streak</p>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <span className="text-[11px] font-bold" style={{ color: 'hsl(var(--c-orange))' }}>🔥 12-day streak</span>
          <span className="text-[10px] font-bold px-3 py-1.5 rounded-lg" style={{ background: 'hsl(var(--c-green))', color: '#fff' }}>Start</span>
        </div>
      </div>
    </div>
  );
}

/* ─── Illustration 4: Octopus in new outfits ─────────────────── */
function MascotShot() {
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 40%, hsl(var(--c-green) / 0.18), transparent 60%)' }} />
      <OctopusAvatar size={150} hatEmoji="⭐" faceEmoji="🤖" bodyEmoji="🏆" />
      <div className="relative mt-3 flex items-center gap-2">
        <span className="px-2.5 py-1 rounded-full text-xs font-bold"
          style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.35)' }}>
          ✨ 12 new outfits
        </span>
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
      badge:        { en: 'SPIN TO WIN', bg: 'ВЪРТИ И ПЕЧЕЛИ' },
      title:        { en: 'Wheel of Luck', bg: 'Колело на късмета' },
      body:         { en: 'A one-time welcome spin: win XP, free outfits, a 2-week Pro trial — or one of only 3 real Octolio cups in the whole world.',
                      bg: 'Еднократно завъртане: спечели XP, безплатни дрехи, 2 седмици Pro — или една от само 3 истински чаши Octolio в целия свят.' },
      illustration: <WheelShot />,
      accent:       'hsl(45, 95%, 55%)',
    },
    {
      badge:        { en: 'NEW LESSONS', bg: 'НОВИ УРОЦИ' },
      title:        { en: 'Fresh ways to learn', bg: 'Нови начини да учиш' },
      body:         { en: 'Swipe-sort decks, timed Speed Rounds, epic Boss Battles, and a Life Simulation where your choices compound across 40 years.',
                      bg: 'Swipe колоди, времеви Бързи рундове, епични Битки с босове и Симулация на живота, където изборите ти се натрупват 40 години.' },
      illustration: <LessonsShot />,
      accent:       'hsl(var(--c-primary))',
    },
    {
      badge:        { en: 'DAILY HABIT', bg: 'ДНЕВЕН НАВИК' },
      title:        { en: '60-second Daily Workout', bg: '60-секундна дневна тренировка' },
      body:         { en: 'One quick question a day keeps your streak alive — no energy needed. We can even email you a reminder so you never lose it.',
                      bg: 'Един бърз въпрос на ден пази поредицата ти — без енергия. Можем дори да ти изпратим имейл напомняне, за да не я загубиш.' },
      illustration: <WorkoutShot />,
      accent:       'hsl(var(--c-orange))',
    },
    {
      badge:        { en: 'SHOP & MODULES', bg: 'МАГАЗИН И МОДУЛИ' },
      title:        { en: 'New outfits & modules', bg: 'Нови дрехи и модули' },
      body:         { en: 'Dress your octopus in 12 fresh outfits, and master two new free modules: Fraud & Scam Defense and Money Psychology.',
                      bg: 'Облечи октопода с 12 нови тоалета и усвои два нови безплатни модула: Защита от измами и Психология на парите.' },
      illustration: <MascotShot />,
      accent:       'hsl(var(--c-green))',
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
