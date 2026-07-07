/**
 * "What's new in Octolio" — pops up once on a user's device after the
 * update. Three swipeable slides with feature illustrations (we render
 * the actual UI elements so the "screenshots" stay accurate and never
 * drift from the real app).
 *
 * Storage key:   octolio_seen_whatsnew_v3  (bump the version to re-show after an update)
 * Trigger:       only for authenticated + onboarded users
 * Dismiss:       last slide → "Got it" button OR close (X)
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

const STORAGE_KEY = 'octolio_seen_whatsnew_v3';

interface Slide {
  badge: { en: string; bg: string };
  title: { en: string; bg: string };
  body:  { en: string; bg: string };
  illustration: React.ReactNode;
  accent: string;            // hsl(...) — colors the badge + dot
}

/* ─── Illustration 1: AI "Explain my mistake" ────────────────── */
function ExplainShot() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl p-4 space-y-2.5"
        style={{ background: 'hsl(228, 24%, 12%)', border: '1px solid hsla(0,0%,100%,0.08)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <div className="rounded-lg px-3 py-2" style={{ background: 'hsl(var(--c-red)/0.1)', border: '1px solid hsl(var(--c-red)/0.3)' }}>
          <p className="text-[11px] font-bold" style={{ color: 'hsl(var(--c-red))' }}>✗ Not quite…</p>
        </div>
        <div className="rounded-lg px-3 py-2 flex items-center justify-center gap-1.5 text-[11px] font-bold"
          style={{ background: 'hsl(var(--c-primary)/0.1)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
          🐙 Why was this wrong? <span className="font-normal opacity-70">(2 left today)</span>
        </div>
        <div className="rounded-lg px-3 py-2.5" style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
          <p className="text-[10px] font-bold mb-1" style={{ color: 'hsl(var(--c-primary))' }}>🐙 Octolio explains</p>
          <p className="text-[10px] leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            Compound interest grows on your gains too — so the €100 you skipped isn't €100, it's what it'd become in 30 years…
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Illustration 2: Friend streaks ─────────────────────────── */
function FriendStreakShot() {
  const Bubble = ({ letter, color }: { letter: string; color: string }) => (
    <div className="rounded-full flex items-center justify-center font-black"
      style={{ width: 60, height: 60, fontSize: 24, background: `${color}22`, color, border: `2px solid ${color}` }}>
      {letter}
    </div>
  );
  return (
    <div className="relative flex flex-col items-center justify-center w-full h-full">
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 42%, hsl(var(--c-orange) / 0.18), transparent 60%)' }} />
      <div className="relative flex items-center gap-3">
        <Bubble letter="Y" color="hsl(var(--c-primary))" />
        <div className="text-3xl">🤝</div>
        <Bubble letter="M" color="hsl(var(--c-green))" />
      </div>
      <div className="relative mt-4 px-3 py-1.5 rounded-full text-sm font-black"
        style={{ background: 'hsl(var(--c-orange)/0.15)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.35)' }}>
        🤝🔥 14-day friend streak
      </div>
    </div>
  );
}

/* ─── Illustration 3: Weekly co-op quests ────────────────────── */
function CoopQuestShot() {
  return (
    <div className="w-full h-full flex items-center justify-center px-4">
      <div className="w-full max-w-[280px] rounded-2xl p-4"
        style={{ background: 'hsl(var(--c-primary)/0.06)', border: '1px solid hsl(var(--c-primary)/0.2)', boxShadow: '0 20px 40px rgba(0,0,0,0.4)' }}>
        <p className="text-[10px] uppercase tracking-wider font-bold mb-3" style={{ color: 'hsl(var(--c-primary))' }}>
          🤝 Weekly co-op quest
        </p>
        <div className="rounded-xl p-3" style={{ background: 'hsl(228,24%,12%)', border: '1px solid hsla(0,0%,100%,0.08)' }}>
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[12px] font-bold" style={{ color: 'hsl(var(--c-fg))' }}>You + Maria</p>
            <span className="text-[10px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>500 / 500 XP</span>
          </div>
          <div className="h-2 rounded-full overflow-hidden mb-2.5" style={{ background: 'hsl(var(--c-fg)/0.12)' }}>
            <div className="h-full rounded-full" style={{ width: '100%', background: 'hsl(var(--c-green))' }} />
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[9px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>You 280 · Maria 220</span>
            <span className="text-[10px] font-black px-3 py-1 rounded-full" style={{ background: 'hsl(var(--c-green))', color: '#fff' }}>
              Claim +120 XP · +25 🪙
            </span>
          </div>
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
      badge:        { en: 'AI TUTOR', bg: 'AI НАСТАВНИК' },
      title:        { en: 'Explain my mistake', bg: 'Обясни грешката ми' },
      body:         { en: 'Got one wrong? Tap 🐙 and Octolio explains exactly why — in plain words. Free every day, and unlimited with Pro.',
                      bg: 'Сгреши ли? Натисни 🐙 и Octolio ти обяснява точно защо — просто и ясно. Безплатно всеки ден, неограничено с Pro.' },
      illustration: <ExplainShot />,
      accent:       'hsl(var(--c-primary))',
    },
    {
      badge:        { en: 'LEARN TOGETHER', bg: 'УЧЕТЕ ЗАЕДНО' },
      title:        { en: 'Friend streaks', bg: 'Приятелски серии' },
      body:         { en: 'Practice on the same day as a friend and build a shared streak. Miss a day together and it resets — so keep each other going!',
                      bg: 'Учи в същия ден като приятел и трупайте обща серия. Пропуснете ли ден заедно, тя се нулира — така че се мотивирайте!' },
      illustration: <FriendStreakShot />,
      accent:       'hsl(var(--c-orange))',
    },
    {
      badge:        { en: 'TEAM UP', bg: 'ОБЕДИНЕТЕ СЕ' },
      title:        { en: 'Weekly co-op quests', bg: 'Седмични съвместни куестове' },
      body:         { en: 'You and each friend share a weekly XP goal. Hit it together and you BOTH claim a reward — XP and coins.',
                      bg: 'Ти и всеки приятел споделяте седмична XP цел. Постигнете я заедно и ДВАМАТА получавате награда — XP и монети.' },
      illustration: <CoopQuestShot />,
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
