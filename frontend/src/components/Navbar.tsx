import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { getLevel } from '../types';

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, ui } = useLang();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="nav-bar sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <img
            src="/logo.png"
            alt="Octolio"
            className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(160, 55%, 55%, 0.4))' }}
          />
          <span className="font-bold text-lg tracking-tight" style={{ color: 'hsl(210, 40%, 96%)' }}>
            Octolio
          </span>
        </Link>

        {/* Center Nav (logged in) */}
        {user && (
          <nav className="hidden sm:flex items-center gap-1">
            <NavLink to="/dashboard" active={isActive('/dashboard')} label={ui.dashboard} />
            <NavLink to="/modules" active={isActive('/modules')} label={ui.learn} />
          </nav>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {/* Language Toggle */}
          <button
            onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            style={{
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'hsl(215, 20%, 65%)',
            }}
            title={lang === 'en' ? 'Switch to Bulgarian' : 'Switch to English'}
          >
            <span className="text-base">{lang === 'en' ? '🇬🇧' : '🇧🇬'}</span>
            <span>{lang === 'en' ? 'EN' : 'BG'}</span>
          </button>

          {user ? (
            <div className="flex items-center gap-3">
              {/* XP + Level */}
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <span className="text-sm font-semibold" style={{ color: 'hsl(160, 55%, 55%)' }}>
                  ⚡ {user.xp} XP
                </span>
                <span className="text-xs" style={{ color: 'hsl(215, 20%, 50%)' }}>·</span>
                <span className="text-sm font-medium" style={{ color: 'hsl(215, 20%, 65%)' }}>
                  Lv.{getLevel(user.xp).level}
                </span>
              </div>

              {/* Streak */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'rgba(255,165,0,0.08)', border: '1px solid rgba(255,165,0,0.15)' }}>
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold" style={{ color: 'hsl(28, 85%, 60%)' }}>{user.streak}</span>
              </div>

              {/* Logout */}
              <button onClick={logout} className="btn-ghost text-sm py-1.5 px-3">
                {ui.logout}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <button className="btn-ghost text-sm py-1.5 px-4">{ui.login}</button>
              </Link>
              <Link to="/register">
                <button className="btn-primary text-sm py-1.5 px-4">{ui.signup}</button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function NavLink({ to, active, label }: { to: string; active: boolean; label: string }) {
  return (
    <Link
      to={to}
      className="px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
      style={{
        color: active ? 'hsl(210, 40%, 96%)' : 'hsl(215, 20%, 65%)',
        background: active ? 'rgba(99, 102, 241, 0.12)' : 'transparent',
        border: active ? '1px solid hsl(239, 84%, 67%, 0.2)' : '1px solid transparent',
      }}
    >
      {label}
    </Link>
  );
}
