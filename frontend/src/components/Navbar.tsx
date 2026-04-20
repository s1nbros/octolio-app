import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getLevel } from '../types';

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname.startsWith(p);

  const level = user ? getLevel(user.xp) : null;

  return (
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
            <NavTab to="#"          active={false} label="League" />
            <NavTab to="#"          active={false} label="Shop" />
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

              {/* XP pill */}
              <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: 'hsl(var(--c-primary)/0.1)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
                <span className="text-sm" style={{ color: 'hsl(var(--c-primary))' }}>⚡</span>
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
                <span className="text-sm">🔔</span>
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
