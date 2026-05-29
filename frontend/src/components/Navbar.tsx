import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { ProfileSheet } from './ProfileSheet';
import { NotificationBell } from './NotificationBell';

/* SVG icons for the drawer */
function IconHome() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}
function IconLearn() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconLeague() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
function IconAdvisor() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
      <path d="M3 14v1a9 9 0 0 0 18 0v-1" />
    </svg>
  );
}
function IconReview() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconTools() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function IconFriends() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function EnergyPopover({ energy, refillAt, isPro, onClose }: { energy: number; refillAt?: string | null; isPro: boolean; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  const isFull = energy >= 12;
  const hoursToFull = isFull ? 0 : Math.ceil((12 - energy) / 3);

  // Time until next +3: minutes remaining in current hour of refill
  let nextIn: string | null = null;
  if (!isFull && refillAt) {
    const elapsedMs = Date.now() - new Date(refillAt).getTime();
    const msInHour = elapsedMs % 3600000;
    const msUntilNext = 3600000 - msInHour;
    const mins = Math.ceil(msUntilNext / 60000);
    nextIn = `${mins}m`;
  }

  return (
    <div ref={ref} className="absolute right-0 top-10 z-50 rounded-2xl p-4 w-60 shadow-xl"
      style={{ background: 'hsl(228, 24%, 10%)', border: '1px solid rgba(160,140,220,0.2)' }}>
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">⚡</span>
        <span className="font-bold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>Energy</span>
      </div>

      {isPro ? (
        <>
          <div className="w-full h-2.5 rounded-full mb-1 overflow-hidden" style={{ background: 'var(--c-glass)' }}>
            <div className="h-full rounded-full" style={{ width: '100%', background: 'hsl(var(--c-primary))' }} />
          </div>
          <p className="mono text-xs mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>∞ / ∞</p>
          <p className="text-xs" style={{ color: 'hsl(var(--c-primary))' }}>✦ Unlimited energy — Pro perk!</p>
        </>
      ) : (
        <>
          {/* Bar */}
          <div className="w-full h-2.5 rounded-full mb-1 overflow-hidden" style={{ background: 'var(--c-glass)' }}>
            <div className="h-full rounded-full transition-all"
              style={{
                width: `${(energy / 12) * 100}%`,
                background: energy <= 3 ? '#f87171' : 'hsl(var(--c-green))',
              }} />
          </div>
          <p className="mono text-xs mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{energy} / 12</p>

          {isFull ? (
            <p className="text-xs" style={{ color: 'hsl(var(--c-green))' }}>✓ Energy is full! Start a lesson.</p>
          ) : (
            <>
              <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                ⚡ +3 energy every hour
              </p>
              {nextIn && (
                <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  Next +3 in ~{nextIn}
                </p>
              )}
              <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                Full in ~{hoursToFull}h
              </p>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ───────── Mobile slide-in drawer ───────── */
function MobileDrawer({
  open,
  onClose,
  isPro,
}: {
  open: boolean;
  onClose: () => void;
  isPro: boolean;
}) {
  const { isDark, toggleTheme } = useTheme();
  const { lang, setLang } = useLang();
  const location = useLocation();
  const isActive = (p: string) => location.pathname.startsWith(p);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const seenReview  = typeof window !== 'undefined' && localStorage.getItem('octolio_seen_review_v1')  === '1';
  const seenTools   = typeof window !== 'undefined' && localStorage.getItem('octolio_seen_tools_v1')   === '1';
  const seenFriends = typeof window !== 'undefined' && localStorage.getItem('octolio_seen_friends_v1') === '1';
  const seenShop    = typeof window !== 'undefined' && localStorage.getItem('octolio_seen_shop_v1')    === '1';

  const items = [
    { to: '/modules', label: { en: 'Learn', bg: 'Учи' }, icon: <IconLearn />, active: isActive('/modules') || isActive('/lesson') },
    { to: '/quests',  label: { en: 'Quests', bg: 'Куестове' }, icon: <IconHome />, active: isActive('/quests') },
    { to: '/review',  label: { en: 'Review', bg: 'Преглед' }, icon: <IconReview />, active: isActive('/review'), isNew: !seenReview },
    { to: '/tools',   label: { en: 'Tools', bg: 'Инструменти' }, icon: <IconTools />, active: isActive('/tools'), isNew: !seenTools },
    { to: '/shop',    label: { en: 'Shop', bg: 'Магазин' }, icon: <IconShop />, active: isActive('/shop'), isNew: !seenShop },
    { to: '/league',  label: { en: 'League', bg: 'Лига' }, icon: <IconLeague />, active: isActive('/league') },
    { to: '/friends', label: { en: 'Friends', bg: 'Приятели' }, icon: <IconFriends />, active: isActive('/friends'), isNew: !seenFriends },
    ...(isPro ? [{ to: '/advisor', label: { en: 'AI Advisor', bg: 'AI Съветник' }, icon: <IconAdvisor />, active: isActive('/advisor') }] : []),
    { to: '/profile', label: { en: 'Profile', bg: 'Профил' }, icon: <IconProfile />, active: isActive('/profile') },
  ] as { to: string; label: { en: string; bg: string }; icon: React.ReactElement; active: boolean; isNew?: boolean }[];

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="md:hidden fixed inset-0 z-[60] transition-opacity duration-200"
        style={{
          background: 'rgba(0,0,0,0.55)',
          opacity: open ? 1 : 0,
          pointerEvents: open ? 'auto' : 'none',
        }}
      />
      {/* Panel */}
      <aside
        className="md:hidden fixed top-0 left-0 bottom-0 z-[61] w-[78vw] max-w-[320px] transition-transform duration-300 ease-out flex flex-col"
        style={{
          background: 'hsl(228, 24%, 10%)',
          borderRight: '1px solid hsla(0,0%,100%,0.08)',
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          paddingTop: 'max(20px, env(safe-area-inset-top))',
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))',
        }}
        aria-hidden={!open}
      >
        {/* Header inside drawer */}
        <div className="flex items-center gap-2 px-5 mb-6">
          <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
          <span className="font-extrabold text-lg" style={{ color: 'hsl(var(--c-fg))' }}>
            Octolio
          </span>
          <button
            onClick={onClose}
            className="ml-auto w-9 h-9 rounded-full flex items-center justify-center active:scale-95 transition-transform"
            style={{ color: 'hsl(var(--c-fg-muted))', background: 'hsla(0,0%,100%,0.06)' }}
            aria-label="Close menu"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-3 space-y-1.5">
          {items.map((it) => (
            <Link
              key={it.to}
              to={it.to}
              onClick={() => {
                if (it.to === '/review')  localStorage.setItem('octolio_seen_review_v1',  '1');
                if (it.to === '/tools')   localStorage.setItem('octolio_seen_tools_v1',   '1');
                if (it.to === '/friends') localStorage.setItem('octolio_seen_friends_v1', '1');
                if (it.to === '/shop')    localStorage.setItem('octolio_seen_shop_v1',    '1');
                onClose();
              }}
              className="flex items-center gap-3 px-3 py-3 rounded-xl transition-colors active:scale-[0.98]"
              style={{
                background: it.active ? 'hsl(var(--c-primary)/0.15)' : 'transparent',
                color: it.active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg))',
                border: `1px solid ${it.active ? 'hsl(var(--c-primary)/0.3)' : 'transparent'}`,
              }}
            >
              <span className="flex-shrink-0">{it.icon}</span>
              <span className="font-bold text-[15px] flex-1">{it.label[lang]}</span>
              {it.isNew && (
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider flex-shrink-0 animate-pulse-soft"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--c-green)) 0%, hsl(160, 70%, 45%) 100%)',
                    color: '#fff',
                    letterSpacing: '0.05em',
                    boxShadow: '0 0 12px hsl(var(--c-green) / 0.55)',
                  }}>
                  NEW
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Footer controls */}
        <div className="px-5 mt-4 pt-4 border-t" style={{ borderColor: 'hsla(0,0%,100%,0.08)' }}>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 h-10 rounded-xl flex items-center justify-center gap-2 text-sm font-semibold active:scale-95 transition-transform"
              style={{
                background: 'hsla(0,0%,100%,0.06)',
                border: '1px solid hsla(0,0%,100%,0.08)',
                color: 'hsl(var(--c-fg))',
              }}
            >
              <span>{isDark ? '☀️' : '🌙'}</span>
              <span>{isDark ? (lang === 'en' ? 'Light' : 'Светъл') : (lang === 'en' ? 'Dark' : 'Тъмен')}</span>
            </button>
            <button
              onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
              className="h-10 px-3 rounded-xl flex items-center justify-center gap-1 text-sm font-bold mono active:scale-95 transition-transform"
              style={{
                background: 'hsla(0,0%,100%,0.06)',
                border: '1px solid hsla(0,0%,100%,0.08)',
                color: 'hsl(var(--c-fg))',
              }}
              aria-label="Toggle language"
            >
              {lang === 'en' ? '🇬🇧 EN' : '🇧🇬 BG'}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Navbar() {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const [energyOpen, setEnergyOpen] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Disable the hamburger while doing a lesson — user shouldn't navigate away mid-flow
  const inLesson = location.pathname.startsWith('/lesson/');

  // Defensive: close drawer if route changes while it's open
  useEffect(() => { setDrawerOpen(false); }, [location.pathname]);

  return (
    <>
    {/* Top bar — mobile + sm only. AppShell handles md+ with its own sidebar. */}
    <header className="sticky top-0 z-50 md:hidden px-3 pt-3 pb-1">
      <div className="liquid-glass max-w-7xl mx-auto rounded-2xl px-3 h-14 flex items-center gap-2"
        style={{ position: 'relative' }}>

        {/* Logo button — opens nav drawer; locked during lessons */}
        {user ? (
          <button
            onClick={() => !inLesson && setDrawerOpen(true)}
            disabled={inLesson}
            aria-label={inLesson ? 'Menu disabled during lesson' : 'Open menu'}
            className="relative flex items-center justify-center flex-shrink-0 z-10 active:scale-95 transition-transform"
            style={{
              opacity: inLesson ? 0.5 : 1,
              cursor: inLesson ? 'not-allowed' : 'pointer',
              filter: inLesson ? 'grayscale(0.6)' : undefined,
            }}
          >
            <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
              style={{ filter: inLesson ? 'none' : 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
            {inLesson && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: 'hsl(228, 24%, 10%)', color: 'hsl(var(--c-fg-subtle))', border: '1.5px solid hsl(228, 24%, 10%)' }}
                aria-hidden="true"
              >
                <svg width="9" height="9" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17 8h-1V6c0-2.76-2.24-5-5-5S6 3.24 6 6v2H5c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H7.9V6c0-1.71 1.39-3.1 3.1-3.1s3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
            )}
          </button>
        ) : (
          <Link to="/" className="flex items-center gap-2 flex-shrink-0 z-10 active:scale-95 transition-transform">
            <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
              style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
          </Link>
        )}

        {/* Right controls — streak + energy + avatar */}
        <div className="flex items-center gap-2 ml-auto z-10">
          {user ? (
            <>
              {/* Streak chip */}
              <div className="liquid-glass-pill flex items-center gap-1.5 px-3 h-9 rounded-full"
                style={{ color: 'hsl(var(--c-orange))' }}>
                <span className="text-base">🔥</span>
                <span className="mono text-sm font-bold">{user.streak}</span>
              </div>

              {/* Energy chip */}
              <div className="relative">
                <button
                  onClick={() => setEnergyOpen(o => !o)}
                  className="liquid-glass-pill flex items-center gap-1.5 px-3 h-9 rounded-full transition-all active:scale-95"
                  style={{
                    color: user.is_pro ? 'hsl(var(--c-primary))' : user.energy > 3 ? 'hsl(var(--c-green))' : '#f87171',
                  }}>
                  <span className="text-base">⚡</span>
                  <span className="mono text-sm font-bold">
                    {user.is_pro ? '∞' : user.energy}
                  </span>
                </button>
                {energyOpen && (
                  <EnergyPopover
                    energy={user.energy}
                    refillAt={user.energy_refill_at}
                    isPro={user.is_pro}
                    onClose={() => setEnergyOpen(false)}
                  />
                )}
              </div>

              {/* Notification bell */}
              <NotificationBell variant="mobile" />

              {/* Avatar — opens profile sheet */}
              <button
                onClick={() => setSheetOpen(true)}
                className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden text-sm font-bold transition-all active:scale-95"
                style={{
                  background: 'hsl(var(--c-primary)/0.2)',
                  border: '2px solid hsla(0,0%,100%,0.18)',
                  color: 'hsl(var(--c-fg))',
                }}
                aria-label="Open profile">
                {user.avatar?.startsWith('data:')
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>}
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleTheme}
                className="liquid-glass-pill w-9 h-9 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
                title={isDark ? 'Light mode' : 'Dark mode'}>
                {isDark ? '☀️' : '🌙'}
              </button>
              <Link to="/login">
                <button className="btn-ghost text-sm py-1.5 px-3">Log in</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm py-1.5 px-3">Sign up</button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>

    {/* Mobile slide-in nav drawer (only when logged in) */}
    {user && <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} isPro={user.is_pro} />}

    {/* Profile sheet — mounts in the DOM so transitions work */}
    {user && <ProfileSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />}
    </>
  );
}
