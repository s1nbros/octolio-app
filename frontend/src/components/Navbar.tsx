import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getLevel } from '../types';

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, ui } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname === p;

  return (
    <header className="nav-bar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">

        {/* Logo */}
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2 flex-shrink-0">
          <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
          <span className="font-bold text-lg tracking-tight hidden sm:block" style={{ color: 'hsl(var(--c-fg))' }}>
            Octolio
          </span>
        </Link>

        {/* Center nav */}
        {user && (
          <nav className="hidden sm:flex items-center gap-1 flex-1 justify-center">
            <NavLink to="/dashboard" active={isActive('/dashboard')} label={ui.dashboard} />
            <NavLink to="/modules" active={isActive('/modules')} label={ui.learn} />
          </nav>
        )}

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Theme toggle */}
          <button onClick={toggleTheme}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* Language toggle */}
          <button onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold transition-all"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
            <span>{lang === 'en' ? '🇬🇧' : '🇧🇬'}</span>
            <span className="hidden sm:inline">{lang === 'en' ? 'EN' : 'BG'}</span>
          </button>

          {user ? (
            <>
              {/* XP pill */}
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                <span className="text-sm font-bold" style={{ color: 'hsl(var(--c-green))' }}>⚡ {user.xp}</span>
                <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>·</span>
                <span className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>Lv.{getLevel(user.xp).level}</span>
              </div>
              {/* Streak */}
              <div className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-full"
                style={{ background: 'hsl(var(--c-orange)/0.1)', border: '1px solid hsl(var(--c-orange)/0.25)' }}>
                <span className="text-sm">🔥</span>
                <span className="text-sm font-bold" style={{ color: 'hsl(var(--c-orange))' }}>{user.streak}</span>
              </div>
              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full flex items-center justify-center text-xl transition-all"
                style={{ background: 'var(--c-glass)', border: `2px solid ${isActive('/profile') ? 'hsl(var(--c-primary))' : 'var(--c-border)'}` }}
                title={lang === 'en' ? 'Profile' : 'Профил'}
              >
                {user.avatar ?? '🦊'}
              </button>
              <button onClick={logout} className="btn-ghost text-sm py-1.5 px-3">{ui.logout}</button>
            </>
          ) : (
            <>
              <Link to="/login"><button className="btn-ghost text-sm py-1.5 px-3">{ui.login}</button></Link>
              <Link to="/register"><button className="btn-primary text-sm py-1.5 px-3">{ui.signup}</button></Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link to={to} className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
      style={{
        color: active ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-muted))',
        background: active ? 'hsl(var(--c-primary)/0.12)' : 'transparent',
        border: `1px solid ${active ? 'hsl(var(--c-primary)/0.2)' : 'transparent'}`,
      }}>
      {label}
    </Link>
  );
}
