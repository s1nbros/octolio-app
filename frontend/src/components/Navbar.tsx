import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

/* SVG icons for the bottom nav */
function IconHome() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  );
}
function IconLearn() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  );
}
function IconLeague() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11" />
    </svg>
  );
}
function IconProfile() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
function IconAdvisor() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
      <path d="M3 14v1a9 9 0 0 0 18 0v-1" />
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

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname.startsWith(p);
  const [energyOpen, setEnergyOpen] = useState(false);

  return (
    <>
    {/* Top bar — mobile + sm only. AppShell handles md+ with its own sidebar. */}
    <header className="sticky top-0 z-50 md:hidden px-3 pt-3 pb-1">
      <div className="liquid-glass max-w-7xl mx-auto rounded-2xl px-3 h-14 flex items-center gap-2"
        style={{ position: 'relative' }}>

        {/* Logo */}
        <Link to={user ? '/modules' : '/'} className="flex items-center gap-2 flex-shrink-0 z-10">
          <img src="/logo.png" alt="Octolio" className="w-8 h-8 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
        </Link>

        {/* Center nav tabs (sm only — phones use bottom nav) */}
        {user && (
          <nav className="hidden sm:flex items-center gap-0.5 flex-1 z-10">
            <NavTab to="/modules"   active={isActive('/modules') || isActive('/lesson')} label="Learn" />
            <NavTab to="/quests"    active={isActive('/quests')} label="Quests" />
            <NavTab to="/league"    active={isActive('/league')} label="League" />
            {user.is_pro && (
              <NavTab to="/advisor" active={isActive('/advisor')} label="✦ AI" disabled />
            )}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-1.5 ml-auto z-10">
          {user ? (
            <>
              {/* Energy pill — visible on phones now */}
              <div className="relative">
                <button
                  onClick={() => setEnergyOpen(o => !o)}
                  className="liquid-glass-pill flex items-center gap-1 px-2.5 py-1.5 rounded-full transition-all active:scale-95"
                  style={{
                    color: user.is_pro ? 'hsl(var(--c-primary))' : user.energy > 3 ? 'hsl(var(--c-green))' : '#f87171',
                  }}>
                  <span className="text-sm">⚡</span>
                  <span className="mono text-xs font-bold">
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

              {/* Streak pill */}
              <div className="liquid-glass-pill flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                style={{ color: 'hsl(var(--c-orange))' }}>
                <span className="text-sm">🔥</span>
                <span className="mono text-xs font-bold">{user.streak}</span>
              </div>

              {/* Pro badge (sm+) */}
              {user.is_pro && (
                <div className="hidden sm:flex liquid-glass-pill items-center px-2.5 py-1.5 rounded-full"
                  style={{ color: 'hsl(var(--c-primary))' }}>
                  <span className="text-[10px] font-black tracking-wider">✦ PRO</span>
                </div>
              )}

              {/* Language toggle (sm+) */}
              <button onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
                className="hidden sm:flex liquid-glass-pill items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all active:scale-95"
                style={{ color: 'hsl(var(--c-fg-muted))' }}>
                <span>{lang === 'en' ? '🇬🇧' : '🇧🇬'}</span>
                <span>{lang === 'en' ? 'EN' : 'BG'}</span>
              </button>

              {/* Theme toggle */}
              <button onClick={toggleTheme}
                className="liquid-glass-pill w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
                title={isDark ? 'Light mode' : 'Dark mode'}>
                {isDark ? '☀️' : '🌙'}
              </button>

              {/* Avatar */}
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-sm font-bold transition-all active:scale-95"
                style={{
                  background: 'hsl(var(--c-primary)/0.2)',
                  border: `2px solid ${isActive('/profile') ? 'hsl(var(--c-primary))' : 'hsla(0,0%,100%,0.15)'}`,
                  color: 'hsl(var(--c-fg))',
                }}>
                {user.avatar?.startsWith('data:')
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>}
              </button>

              {/* Log out — icon-only button, always visible */}
              <button onClick={logout}
                className="liquid-glass-pill w-8 h-8 rounded-full flex items-center justify-center transition-all active:scale-95"
                style={{ color: '#f87171' }}
                title="Log out"
                aria-label="Log out">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
              </button>
            </>
          ) : (
            <>
              <button onClick={toggleTheme}
                className="liquid-glass-pill w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all active:scale-95"
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

    {/* ── Mobile bottom nav — phones only (xs) ── */}
    {user && (
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-3 pt-1 pointer-events-none">
        <div className="liquid-glass max-w-7xl mx-auto rounded-2xl pointer-events-auto"
          style={{
            paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
          }}>
          <div className="flex items-center justify-around px-1.5 pt-2 pb-2">
            <BottomTab to="/modules"   active={isActive('/modules') || isActive('/lesson')} icon={<IconLearn />} label="Learn" />
            <BottomTab to="/quests"    active={isActive('/quests')}    icon={<IconHome />} label="Quests" />
            <BottomTab to="/league"    active={isActive('/league')}    icon={<IconLeague />} label="League" />
            {user.is_pro && (
              <BottomTab to="/advisor" active={isActive('/advisor')} icon={<IconAdvisor />} label="AI" disabled />
            )}
            <BottomTab to="/profile"   active={isActive('/profile')}   icon={<IconProfile />} label="Profile" />
          </div>
        </div>
      </nav>
    )}
    </>
  );
}

function BottomTab({ to, active, icon, label, disabled }: { to: string; active: boolean; icon: React.ReactNode; label: string; disabled?: boolean }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all"
      style={{
        color: disabled ? 'hsl(var(--c-fg-subtle)/0.5)' : active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-subtle))',
        opacity: disabled ? 0.5 : 1,
      }}>
      {/* Active pill highlight behind icon */}
      <div className="relative flex items-center justify-center w-10 h-7 rounded-full transition-all"
        style={{ background: !disabled && active ? 'hsl(var(--c-primary)/0.18)' : 'transparent' }}>
        {icon}
      </div>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </Link>
  );
}

function NavTab({ to, active, label, disabled }: { to: string; active: boolean; label: string; disabled?: boolean }) {
  return (
    <Link to={to}
      className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
      style={{
        color: disabled ? 'hsl(var(--c-fg-subtle)/0.6)' : active ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-subtle))',
        background: !disabled && active ? 'hsl(var(--c-primary)/0.12)' : 'transparent',
        opacity: disabled ? 0.5 : 1,
      }}>
      {label}
    </Link>
  );
}
