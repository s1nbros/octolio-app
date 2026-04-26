import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getLevel } from '../types';

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

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname.startsWith(p);

  const level = user ? getLevel(user.xp) : null;

  return (
    <>
    <header className="nav-bar sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-4">

        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
          <span className="font-extrabold text-base tracking-tight hidden sm:block" style={{ color: 'hsl(var(--c-fg))' }}>
            Octolio
          </span>
        </Link>

        {/* Center nav tabs */}
        {user && (
          <nav className="hidden sm:flex items-center gap-0.5 flex-1">
            <NavTab to="/dashboard" active={isActive('/dashboard')} label="Dashboard" />
            <NavTab to="/modules"   active={isActive('/modules') || isActive('/lesson')} label="Learn" />
            <NavTab to="/league"    active={isActive('/league')} label="League" />
            {user.is_pro && (
              <NavTab to="/advisor" active={isActive('/advisor')} label="✦ AI Advisor" />
            )}
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2 ml-auto">
          {/* Theme */}
          <button onClick={toggleTheme}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-base transition-all"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {user ? (
            <>
              {/* Language toggle — single button */}
              <button onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
                style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
                <span>{lang === 'en' ? '🇬🇧' : '🇧🇬'}</span>
                <span>{lang === 'en' ? 'EN' : 'BG'}</span>
              </button>

              {/* Pro badge OR energy pill */}
              {user.is_pro ? (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'hsl(var(--c-primary)/0.15)', border: '1px solid hsl(var(--c-primary)/0.35)' }}>
                  <span className="text-xs font-black tracking-wider" style={{ color: 'hsl(var(--c-primary))' }}>✦ PRO</span>
                </div>
              ) : (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  title="Energy — refills every 24h"
                  style={{
                    background: user.energy > 3 ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red,0,70%,55%)/0.12)',
                    border: `1px solid ${user.energy > 3 ? 'hsl(var(--c-green)/0.25)' : 'hsl(var(--c-red,0,70%,55%)/0.35)'}`,
                  }}>
                  <span className="text-sm">⚡</span>
                  <span className="mono text-sm font-semibold" style={{ color: user.energy > 3 ? 'hsl(var(--c-green))' : '#f87171' }}>
                    {user.energy}/12
                  </span>
                </div>
              )}

              {/* XP pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'hsl(var(--c-primary)/0.1)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
                <span className="text-sm" style={{ color: 'hsl(var(--c-primary))' }}>🪙</span>
                <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
                  {user.xp.toLocaleString()}
                </span>
              </div>

              {/* Level pill */}
              {level && (
                <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                  style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
                  <span className="text-sm" style={{ color: 'hsl(var(--c-green))' }}>🏆</span>
                  <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-green))' }}>
                    Lv.{level.level}
                  </span>
                </div>
              )}

              {/* Streak */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'hsl(var(--c-orange)/0.1)', border: '1px solid hsl(var(--c-orange)/0.2)' }}>
                <span className="text-sm">🔥</span>
                <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-orange))' }}>
                  {user.streak}
                </span>
              </div>

              {/* Avatar */}
              <button
                onClick={() => navigate('/profile')}
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden text-sm font-bold transition-all"
                style={{
                  background: 'hsl(var(--c-primary)/0.2)',
                  border: `2px solid ${isActive('/profile') ? 'hsl(var(--c-primary))' : 'hsl(var(--c-primary)/0.3)'}`,
                  color: 'hsl(var(--c-fg))',
                }}>
                {user.avatar?.startsWith('data:')
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>}
              </button>

              {/* Log out */}
              <button onClick={logout}
                className="hidden sm:block text-sm font-semibold px-3 py-1.5 rounded-lg transition-all"
                style={{ color: 'hsl(var(--c-fg-muted))', background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                Log out
              </button>
            </>
          ) : (
            <>
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

    {/* ── Mobile bottom nav — visible only on small screens ── */}
    {user && (
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(14,12,28,0.72)',
          backdropFilter: 'blur(24px) saturate(180%)',
          WebkitBackdropFilter: 'blur(24px) saturate(180%)',
          borderTop: '1px solid rgba(160,140,220,0.18)',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
        }}>
        {/* Safe-area padding for iPhone home indicator */}
        <div className="flex items-center justify-around px-2 pt-2 pb-safe"
          style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>

          <BottomTab to="/dashboard" active={isActive('/dashboard')} icon={<IconHome />} label="Home" />
          <BottomTab to="/modules"   active={isActive('/modules') || isActive('/lesson')} icon={<IconLearn />} label="Learn" />
          <BottomTab to="/league"    active={isActive('/league')}    icon={<IconLeague />} label="League" />
          {user.is_pro && (
            <BottomTab to="/advisor" active={isActive('/advisor')} icon={<IconAdvisor />} label="AI" />
          )}
          <BottomTab to="/profile"   active={isActive('/profile')}   icon={<IconProfile />} label="Profile" />

        </div>
      </nav>
    )}
    </>
  );
}

function BottomTab({ to, active, icon, label }: { to: string; active: boolean; icon: React.ReactNode; label: string }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-0.5 px-4 py-1 rounded-2xl transition-all"
      style={{ color: active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-subtle))' }}>
      {/* Active pill highlight behind icon */}
      <div className="relative flex items-center justify-center w-10 h-7 rounded-full transition-all"
        style={{ background: active ? 'hsl(var(--c-primary)/0.18)' : 'transparent' }}>
        {icon}
      </div>
      <span className="text-xs font-semibold tracking-wide">{label}</span>
    </Link>
  );
}

function NavTab({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link to={to}
      className="px-4 py-1.5 rounded-lg text-sm font-semibold transition-all"
      style={{
        color: active ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-subtle))',
        background: active ? 'hsl(var(--c-primary)/0.12)' : 'transparent',
      }}>
      {label}
    </Link>
  );
}
