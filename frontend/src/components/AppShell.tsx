import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { FloatingOrbs } from './FloatingOrbs';
import { ProWidget, LeagueWidget, MoneyFactWidget, StreakWidget, DailyQuestsTeaser } from './SidebarWidgets';
import { NotificationBell } from './NotificationBell';
import { CoinIcon } from './CoinIcon';
import { WhatsNewModal } from './WhatsNewModal';
import { InstallPrompt } from './InstallPrompt';
import { BottomNav } from './BottomNav';
import { WheelOfLuck } from './WheelOfLuck';
import { PrizeRevealPopup, type PrizeResult } from './PrizeRevealPopup';
import { getLevel } from '../types';

const SEEN_REVIEW_KEY  = 'octolio_seen_review_v1';
const SEEN_TOOLS_KEY   = 'octolio_seen_tools_v1';
const SEEN_FRIENDS_KEY = 'octolio_seen_friends_v1';
const SEEN_SHOP_KEY    = 'octolio_seen_shop_v1';
export { SEEN_REVIEW_KEY, SEEN_TOOLS_KEY, SEEN_FRIENDS_KEY, SEEN_SHOP_KEY };

/* SVG icons reused by the sidebar */
function IconQuests() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
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
function IconAdvisor() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a2 2 0 0 1 2 2c0 .74-.4 1.39-1 1.73V7h1a7 7 0 0 1 7 7H3a7 7 0 0 1 7-7h1V5.73A2 2 0 0 1 10 4a2 2 0 0 1 2-2z" />
      <path d="M3 14v1a9 9 0 0 0 18 0v-1" />
    </svg>
  );
}
function IconTools() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
function IconPortfolio() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 5-6" />
    </svg>
  );
}
function IconReview() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}
function IconFriends() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
function IconShop() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l1.5-5h15L21 9" />
      <path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9" />
      <path d="M3 9h18" />
      <path d="M9 13a3 3 0 0 0 6 0" />
    </svg>
  );
}
function IconLogout() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

/* ─── Energy popover (carried over from Navbar.tsx logic) ─── */
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
              <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>⚡ +3 energy every hour</p>
              {nextIn && (
                <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>Next +3 in ~{nextIn}</p>
              )}
              <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>Full in ~{hoursToFull}h</p>
            </>
          )}
        </>
      )}
    </div>
  );
}

/* ─── Top stats bar — Duolingo-style pills row, top right of main column ─── */
function StatsBar() {
  const { user } = useAuth();
  const { lang, setLang } = useLang();
  const [energyOpen, setEnergyOpen] = useState(false);
  if (!user) return null;

  return (
    <div className="flex items-center gap-2 md:gap-3">
      {/* Language flag */}
      <button onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-bold transition-all"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}
        title="Switch language">
        <span className="text-base">{lang === 'en' ? '🇬🇧' : '🇧🇬'}</span>
        <span>{lang === 'en' ? 'EN' : 'BG'}</span>
      </button>

      {/* Streak (clickable label) */}
      <PillWithLabel
        label={lang === 'en' ? 'Streak — days in a row' : 'Стрийк — поредни дни'}
        background="hsl(var(--c-orange)/0.1)" border="hsl(var(--c-orange)/0.2)" color="hsl(var(--c-orange))">
        <span className="text-sm">🔥</span>
        <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-orange))' }}>{user.streak}</span>
      </PillWithLabel>

      {/* Energy (clickable popover) */}
      <div className="relative">
        <button onClick={() => setEnergyOpen(o => !o)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
          style={{
            background: user.is_pro ? 'hsl(var(--c-primary)/0.1)' : user.energy > 3 ? 'hsl(var(--c-green)/0.1)' : 'hsl(0,70%,55%,0.12)',
            border: `1px solid ${user.is_pro ? 'hsl(var(--c-primary)/0.25)' : user.energy > 3 ? 'hsl(var(--c-green)/0.25)' : 'hsl(0,70%,55%,0.35)'}`,
          }}>
          <span className="text-sm">⚡</span>
          <span className="mono text-sm font-semibold" style={{ color: user.is_pro ? 'hsl(var(--c-primary))' : user.energy > 3 ? 'hsl(var(--c-green))' : '#f87171' }}>
            {user.is_pro ? '∞' : `${user.energy}/12`}
          </span>
        </button>
        {energyOpen && <EnergyPopover energy={user.energy} refillAt={user.energy_refill_at} isPro={user.is_pro} onClose={() => setEnergyOpen(false)} />}
      </div>

      {/* XP (clickable label) */}
      <PillWithLabel
        label={lang === 'en' ? 'XP — Experience points. Earned from lessons and chests.' : 'XP — Точки опит. Печелиш ги от уроци и сандъци.'}
        background="hsl(var(--c-primary)/0.1)" border="hsl(var(--c-primary)/0.2)" color="hsl(var(--c-primary))">
        <span className="text-sm" style={{ color: 'hsl(var(--c-primary))' }}>✨</span>
        <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
          {user.xp.toLocaleString()}
        </span>
      </PillWithLabel>

      {/* Coins (clickable label) */}
      <PillWithLabel
        label={lang === 'en' ? 'Coins — Spend on cosmetics in the shop. Earn by trading XP.' : 'Монети — За костюми в магазина. Изкарваш ги срещу XP.'}
        background="hsl(var(--c-orange)/0.1)" border="hsl(var(--c-orange)/0.3)" color="hsl(var(--c-orange))">
        <CoinIcon size={14} />
        <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-orange))' }}>
          {(user.coins ?? 0).toLocaleString()}
        </span>
      </PillWithLabel>

      {/* Pro badge */}
      {user.is_pro && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
          style={{ background: 'hsl(var(--c-primary)/0.15)', border: '1px solid hsl(var(--c-primary)/0.35)' }}>
          <span className="text-xs font-black tracking-wider" style={{ color: 'hsl(var(--c-primary))' }}>✦ PRO</span>
        </div>
      )}
    </div>
  );
}

/* ─── Pill that pops a label tooltip on click ─── */
function PillWithLabel({
  label,
  background,
  border,
  color: _color,
  children,
}: {
  label: string;
  background: string;
  border: string;
  color: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    const t = setTimeout(() => setOpen(false), 3500); // auto-dismiss
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      clearTimeout(t);
    };
  }, [open]);

  return (
    <button
      ref={ref}
      onClick={() => setOpen(o => !o)}
      className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all"
      style={{ background, border: `1px solid ${border}` }}
    >
      {children}
      {open && (
        <span
          className="absolute z-50 left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap rounded-lg px-3 py-1.5 text-xs font-semibold animate-fade-in pointer-events-none"
          style={{
            background: 'hsl(228, 24%, 10%)',
            color: 'hsl(var(--c-fg))',
            border: '1px solid rgba(255,255,255,0.1)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)',
            maxWidth: '260px',
            whiteSpace: 'normal',
            textAlign: 'center',
          }}
        >
          {label}
        </span>
      )}
    </button>
  );
}

/* ─── "NEW" pill for freshly-shipped features ─── */
function NewPill() {
  return (
    <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full tracking-wider flex-shrink-0 animate-pulse-soft"
      style={{
        background: 'linear-gradient(135deg, hsl(var(--c-green)) 0%, hsl(160, 70%, 45%) 100%)',
        color: '#fff',
        letterSpacing: '0.05em',
        boxShadow: '0 0 12px hsl(var(--c-green) / 0.55)',
      }}>
      NEW
    </span>
  );
}

/* ─── Sidebar nav item ─── */
function SidebarLink({ to, active, label, icon, disabled, badge, isNew }: { to: string; active: boolean; label: string; icon: React.ReactNode; disabled?: boolean; badge?: number; isNew?: boolean }) {
  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all font-bold uppercase tracking-wider text-sm"
      style={{
        background: !disabled && active ? 'hsl(var(--c-primary)/0.12)' : 'transparent',
        color: disabled ? 'hsl(var(--c-fg-subtle)/0.5)' : active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
        border: !disabled && active ? '2px solid hsl(var(--c-primary)/0.3)' : '2px solid transparent',
        opacity: disabled ? 0.5 : 1,
      }}>
      <span className="flex-shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {isNew && <NewPill />}
      {badge !== undefined && badge > 0 && (
        <span className="text-[10px] mono font-black px-1.5 py-0.5 rounded-full"
          style={{ background: 'hsl(var(--c-red))', color: '#fff', minWidth: '18px', textAlign: 'center' }}>
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </Link>
  );
}

/* ─── Left sidebar (md+) ─── */
function LeftSidebar() {
  const { user, logout, token } = useAuth();
  const { lang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = (p: string) => location.pathname.startsWith(p);
  const [reviewDue, setReviewDue] = useState(0);
  const [friendRequestsCount, setFriendRequestsCount] = useState(0);
  const [seenReview, setSeenReview]   = useState(() => localStorage.getItem(SEEN_REVIEW_KEY) === '1');
  const [seenTools, setSeenTools]     = useState(() => localStorage.getItem(SEEN_TOOLS_KEY) === '1');
  const [seenFriends, setSeenFriends] = useState(() => localStorage.getItem(SEEN_FRIENDS_KEY) === '1');
  const [seenShop, setSeenShop]       = useState(() => localStorage.getItem(SEEN_SHOP_KEY) === '1');

  useEffect(() => {
    if (!token) return;
    fetch('/api/review/stats', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setReviewDue(d.due ?? 0))
      .catch(() => {});
    fetch('/api/friends/pending', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setFriendRequestsCount((d.incoming ?? []).length))
      .catch(() => {});
  }, [token, location.pathname]);

  // Mark NEW pills as seen the moment the user visits each page.
  useEffect(() => {
    if (location.pathname.startsWith('/review') && !seenReview) {
      localStorage.setItem(SEEN_REVIEW_KEY, '1');
      setSeenReview(true);
    }
    if (location.pathname.startsWith('/tools') && !seenTools) {
      localStorage.setItem(SEEN_TOOLS_KEY, '1');
      setSeenTools(true);
    }
    if (location.pathname.startsWith('/friends') && !seenFriends) {
      localStorage.setItem(SEEN_FRIENDS_KEY, '1');
      setSeenFriends(true);
    }
    if (location.pathname.startsWith('/shop') && !seenShop) {
      localStorage.setItem(SEEN_SHOP_KEY, '1');
      setSeenShop(true);
    }
  }, [location.pathname, seenReview, seenTools, seenFriends, seenShop]);

  if (!user) return null;

  const labels = {
    learn:    lang === 'en' ? 'Learn'    : 'Учи',
    league:   lang === 'en' ? 'League'   : 'Лига',
    advisor:  lang === 'en' ? 'AI Coach' : 'AI Коуч',
  };

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:left-0 md:top-0 md:h-screen md:w-56 lg:w-64 z-40 border-r"
      style={{
        background: 'hsl(var(--c-bg))',
        borderColor: 'var(--c-border)',
      }}>
      {/* Logo + notification bell */}
      <div className="flex items-center gap-2 px-5 py-5 flex-shrink-0">
        <Link to="/modules" className="flex items-center gap-2 flex-1">
          <img src="/logo.png" alt="Octolio" className="w-9 h-9 object-contain"
            style={{ filter: 'drop-shadow(0 0 6px hsl(var(--c-green)/0.4))' }} />
          <span className="font-extrabold text-lg tracking-tight" style={{ color: 'hsl(var(--c-fg))' }}>
            Octolio
          </span>
        </Link>
        <NotificationBell variant="sidebar" />
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto">
        <SidebarLink to="/modules" active={isActive('/modules') || isActive('/lesson')} label={labels.learn} icon={<IconLearn />} />
        <SidebarLink to="/quests" active={isActive('/quests')} label={lang === 'en' ? 'Quests' : 'Куестове'} icon={<IconQuests />} />
        <SidebarLink to="/review" active={isActive('/review')} label={lang === 'en' ? 'Review' : 'Преглед'} icon={<IconReview />} badge={reviewDue} isNew={!seenReview} />
        <SidebarLink to="/tools" active={isActive('/tools')} label={lang === 'en' ? 'Tools' : 'Инструменти'} icon={<IconTools />} isNew={!seenTools} />
        <SidebarLink to="/portfolio" active={isActive('/portfolio')} label={lang === 'en' ? 'Portfolio' : 'Портфейл'} icon={<IconPortfolio />} />
        <SidebarLink to="/league" active={isActive('/league')} label={labels.league} icon={<IconLeague />} />
        <SidebarLink to="/shop" active={isActive('/shop')} label={lang === 'en' ? 'Shop' : 'Магазин'} icon={<IconShop />} isNew={!seenShop} />
        <SidebarLink to="/advisor" active={isActive('/advisor')} label={`✦ ${labels.advisor}`} icon={<IconAdvisor />} />
      </nav>

      {/* Bottom controls */}
      <div className="px-3 py-3 border-t flex-shrink-0" style={{ borderColor: 'var(--c-border)' }}>
        {/* User row */}
        <button onClick={() => navigate('/profile')}
          className="w-full flex items-center gap-2.5 px-2 py-2 rounded-xl mb-2 transition-all"
          style={{ background: 'var(--c-glass)' }}>
          <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-sm font-bold flex-shrink-0"
            style={{ background: 'hsl(var(--c-primary)/0.2)', color: 'hsl(var(--c-fg))', border: '1.5px solid hsl(var(--c-primary)/0.4)' }}>
            {user.avatar?.startsWith('data:')
              ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              : user.name?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>{user.name}</p>
            <p className="text-xs truncate" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              Lv.{getLevel(user.xp).level} · {getLevel(user.xp).label[lang]}
            </p>
          </div>
        </button>

        {/* Theme + logout */}
        <div className="flex gap-2">
          <button onClick={toggleTheme}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}
            title={isDark ? 'Light mode' : 'Dark mode'}>
            {isDark ? '☀️' : '🌙'}
          </button>
          <button onClick={logout}
            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
            <IconLogout />
          </button>
        </div>

        {/* Legal links */}
        <div className="flex items-center justify-center gap-3 mt-3 text-[11px]" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          <a href="/faq" className="hover:underline">{lang === 'en' ? 'FAQ' : 'ЧЗВ'}</a>
          <span>·</span>
          <a href="/privacy" className="hover:underline">{lang === 'en' ? 'Privacy' : 'Поверителност'}</a>
        </div>
      </div>
    </aside>
  );
}

/* ─── Right rail ─── */
function RightRail() {
  const { user, token } = useAuth();
  // Track today's completed-lessons count for the quests teaser
  const [completedToday, setCompletedToday] = useState(0);

  useEffect(() => {
    if (!token) return;
    fetch('/api/progress', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const today = new Date().toISOString().split('T')[0];
        const todayCount = (data.progress ?? []).filter((p: { completed_at: string }) =>
          p.completed_at?.startsWith(today)
        ).length;
        setCompletedToday(todayCount);
      })
      .catch(() => {});
  }, [token]);

  if (!user) return null;
  return (
    <aside className="hidden md:block flex-shrink-0 w-72 lg:w-80 space-y-4 sticky top-6 self-start">
      <DailyQuestsTeaser completedLessonsToday={completedToday} streak={user.streak} xp={user.xp} />
      {!user.is_pro && <ProWidget token={token} />}
      <LeagueWidget token={token} />
      <StreakWidget streak={user.streak} />
      <MoneyFactWidget />
    </aside>
  );
}

/* ─── Main shell ─── */
export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, refreshUser } = useAuth();

  // ── Wheel of Luck flow ──────────────────────────────────────
  // The flow has 3 states managed here so the popup is INDEPENDENT of the
  // wheel component. Even if the wheel unmounts, the popup keeps showing
  // until the user clicks Claim.
  //
  //   shouldShowWheel  → captured ONCE; gates initial wheel mount
  //   prize            → set when the wheel reports a completed spin
  //   wheelClosed      → set when prize is claimed; hides everything for good
  const [shouldShowWheel] = useState<boolean>(
    () => !!user && user.onboarding_done && user.wheel_spun !== true,
  );
  const [prize, setPrize] = useState<PrizeResult | null>(null);
  const [wheelClosed, setWheelClosed] = useState(false);

  // If not logged in (shouldn't happen since shell only wraps protected routes), bail
  if (!user) return <>{children}</>;

  return (
    <div className="relative min-h-screen">
      <FloatingOrbs />
      <LeftSidebar />

      {/* Main content + right rail, offset by sidebar width on md+ */}
      <div className="md:pl-56 lg:pl-64">
        {/* Top bar — only visible md+ since mobile uses Navbar */}
        <header className="hidden md:flex sticky top-0 z-30 items-center justify-end gap-3 px-6 lg:px-8 py-3 backdrop-blur"
          style={{ background: 'hsla(228, 30%, 8%, 0.7)', borderBottom: '1px solid var(--c-border)' }}>
          <StatsBar />
        </header>

        {/* Content + right rail layout. Extra bottom padding on mobile so the
            fixed bottom tab bar never covers the last bit of content. */}
        <div className="flex gap-6 px-4 sm:px-6 md:px-6 lg:px-8 pt-4 pb-28 md:py-6">
          <main className="flex-1 min-w-0">{children}</main>
          <RightRail />
        </div>
      </div>

      {/* Mobile bottom tab bar (5 fundamental pages). Desktop uses the sidebar. */}
      <BottomNav />

      {/* First-visit-after-update announcement */}
      <WhatsNewModal />

      {/* Add-to-home-screen nudge (PWA install) */}
      <InstallPrompt />

      {/* One-time Wheel of Luck.
          Show the spinning wheel while: gate=true, no prize yet, not closed.
          The wheel calls onSpinComplete(prize); we then mount the popup. */}
      {shouldShowWheel && !wheelClosed && !prize && (
        <WheelOfLuck
          onSpinComplete={(p) => setPrize(p)}
          onClose={() => setWheelClosed(true)}
        />
      )}

      {/* Prize reveal popup — independent of the wheel. Lives until Claim. */}
      {prize && (
        <PrizeRevealPopup
          result={prize}
          onClaim={() => {
            setPrize(null);
            setWheelClosed(true);
            // Refresh so is_pro / wheel_spun / pro_trial_ends_at reflect everywhere
            // by the time the user navigates to Pro-only routes.
            refreshUser().catch(() => {});
          }}
        />
      )}
    </div>
  );
}
