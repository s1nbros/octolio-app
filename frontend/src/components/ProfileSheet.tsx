import { useEffect, useRef, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { getLevel } from '../types';

interface Props {
  open: boolean;
  onClose: () => void;
}

/**
 * Bottom-sheet style profile/settings menu for mobile.
 * Tapping avatar opens it. Houses everything that used to live in the top bar.
 */
export function ProfileSheet({ open, onClose }: Props) {
  const { user, logout } = useAuth();
  const { lang, setLang } = useLang();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = original; };
  }, [open]);

  // Swipe-down-to-dismiss
  const dragStartY = useRef<number | null>(null);
  const [dragY, setDragY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const DISMISS_THRESHOLD = 120; // pixels — drag farther than this and we close

  // Reset drag state whenever the sheet's open state changes
  useEffect(() => {
    if (!open) {
      setDragY(0);
      setIsDragging(false);
      dragStartY.current = null;
    }
  }, [open]);

  const onTouchStart = (e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
    setIsDragging(true);
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    // Only drag DOWN. Add slight resistance for upward motion.
    setDragY(delta > 0 ? delta : delta / 4);
  };
  const onTouchEnd = () => {
    if (dragY > DISMISS_THRESHOLD) {
      // Animate the rest of the way out
      onClose();
    } else {
      // Snap back
      setDragY(0);
    }
    setIsDragging(false);
    dragStartY.current = null;
  };

  if (!user) return null;
  const level = getLevel(user.xp);

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-[100] transition-opacity ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        style={{
          background: 'hsla(228, 30%, 5%, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      />

      {/* Sheet */}
      <div
        className={`fixed left-0 right-0 bottom-0 z-[101] ${isDragging ? '' : 'transition-transform duration-300 ease-out'}`}
        style={{
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: open ? `translateY(${dragY}px)` : 'translateY(100%)',
          // Slight opacity fade as the user drags it away — adds polish
          opacity: open ? Math.max(0.5, 1 - dragY / 400) : 0,
        }}
      >
        <div className="liquid-glass mx-3 mb-3 rounded-3xl overflow-hidden"
          style={{ maxHeight: 'calc(85vh - env(safe-area-inset-bottom))' }}>

          {/* Drag handle — generous hit area, attached drag listeners */}
          <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onTouchCancel={onTouchEnd}
            className="flex justify-center items-center py-4 cursor-grab active:cursor-grabbing select-none"
            style={{ touchAction: 'none' }}
            role="button"
            aria-label="Swipe down to close"
          >
            <div
              className="w-12 rounded-full transition-all"
              style={{
                height: isDragging ? '5px' : '4px',
                background: isDragging ? 'hsla(0,0%,100%,0.5)' : 'hsla(0,0%,100%,0.25)',
              }}
            />
          </div>

          <div className="px-5 pb-5 overflow-y-auto" style={{ maxHeight: 'calc(85vh - 60px)' }}>
            {/* User block */}
            <div className="flex items-center gap-3.5 mb-5 mt-2">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden text-xl font-black flex-shrink-0"
                style={{
                  background: 'hsl(var(--c-primary)/0.2)',
                  border: '2px solid hsl(var(--c-primary)/0.4)',
                  color: 'hsl(var(--c-fg))',
                }}>
                {user.avatar?.startsWith('data:')
                  ? <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
                  : <span>{user.name?.[0]?.toUpperCase() ?? '?'}</span>}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-lg truncate" style={{ color: 'hsl(var(--c-fg))' }}>
                  {user.name}
                </p>
                <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  Lv.{level.level} · {level.label[lang]}
                </p>
              </div>
              {user.is_pro && (
                <span className="text-xs font-black px-2.5 py-1 rounded-full flex-shrink-0"
                  style={{
                    background: 'hsl(var(--c-primary)/0.15)',
                    color: 'hsl(var(--c-primary))',
                    border: '1px solid hsl(var(--c-primary)/0.3)',
                  }}>
                  ✦ PRO
                </span>
              )}
            </div>

            {/* Edit Profile button */}
            <button
              onClick={() => { onClose(); navigate('/profile'); }}
              className="w-full flex items-center justify-between px-4 py-3.5 rounded-2xl mb-4 transition-all active:scale-[0.98]"
              style={{
                background: 'hsl(var(--c-primary))',
                color: '#fff',
                fontWeight: 700,
              }}>
              <span className="flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                {lang === 'en' ? 'Edit Profile' : 'Редактирай профил'}
              </span>
              <span>→</span>
            </button>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              <SheetStat icon="🔥" label={lang === 'en' ? 'Streak' : 'Стрийк'} value={String(user.streak)} accent="var(--c-orange)" />
              <SheetStat icon="⚡" label={lang === 'en' ? 'Energy' : 'Енергия'} value={user.is_pro ? '∞' : `${user.energy}/12`}
                accent={user.is_pro ? 'var(--c-primary)' : user.energy > 3 ? 'var(--c-green)' : 'var(--c-red, 0,70%,55%)'} />
              <SheetStat icon="✨" label="XP" value={user.xp >= 1000 ? `${(user.xp / 1000).toFixed(1)}k` : String(user.xp)} accent="var(--c-primary)" />
              <SheetStat icon="🪙" label={lang === 'en' ? 'Coins' : 'Монети'}
                value={(user.coins ?? 0) >= 1000 ? `${((user.coins ?? 0) / 1000).toFixed(1)}k` : String(user.coins ?? 0)}
                accent="var(--c-orange)" />
            </div>

            {/* Settings */}
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Settings' : 'Настройки'}
            </p>
            <div className="space-y-2 mb-5">
              <SheetRow
                icon={isDark ? '🌙' : '☀️'}
                label={lang === 'en' ? 'Appearance' : 'Тема'}
                hint={isDark ? (lang === 'en' ? 'Dark' : 'Тъмна') : (lang === 'en' ? 'Light' : 'Светла')}
                onClick={toggleTheme}
                trailing={
                  <ToggleSwitch on={isDark} />
                }
              />
              <SheetRow
                icon={lang === 'en' ? '🇬🇧' : '🇧🇬'}
                label={lang === 'en' ? 'Language' : 'Език'}
                hint={lang === 'en' ? 'English' : 'Български'}
                onClick={() => setLang(lang === 'en' ? 'bg' : 'en')}
                trailing={
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                    style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))' }}>
                    {lang === 'en' ? 'EN → BG' : 'BG → EN'}
                  </span>
                }
              />
            </div>

            {/* Quick links */}
            <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Shortcuts' : 'Бързи връзки'}
            </p>
            <div className="space-y-2 mb-5">
              <Link to="/league" onClick={onClose}>
                <SheetRow icon="🏅" label={lang === 'en' ? 'League' : 'Лига'} hint={lang === 'en' ? 'Weekly leaderboard' : 'Седмично класиране'} />
              </Link>
              <Link to="/quests" onClick={onClose}>
                <SheetRow icon="◎" label={lang === 'en' ? 'Daily Quests' : 'Дневни куестове'} hint={lang === 'en' ? 'Bonus XP today' : 'Бонус XP днес'} />
              </Link>
              {!user.is_pro && (
                <Link to="/profile" onClick={onClose}>
                  <SheetRow icon="✦" label={lang === 'en' ? 'Upgrade to Pro' : 'Надгради до Pro'} hint={lang === 'en' ? '€4.99/month' : '€4.99/месец'} accent />
                </Link>
              )}
            </div>

            {/* Log out — prominent, red */}
            <button
              onClick={() => { onClose(); logout(); }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl transition-all active:scale-[0.98] font-bold"
              style={{
                background: 'hsla(0, 70%, 55%, 0.12)',
                color: '#f87171',
                border: '1px solid hsla(0, 70%, 55%, 0.3)',
              }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              {lang === 'en' ? 'Log out' : 'Изход'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ─── Helpers ─── */
function SheetStat({ icon, label, value, accent }: { icon: string; label: string; value: string; accent: string }) {
  return (
    <div className="rounded-2xl p-3 text-center"
      style={{
        background: `linear-gradient(135deg, hsl(${accent}/0.15), transparent)`,
        border: `1px solid hsl(${accent}/0.25)`,
      }}>
      <div className="text-base mb-1">{icon}</div>
      <p className="mono font-extrabold text-base leading-none" style={{ color: `hsl(${accent})` }}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wider mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {label}
      </p>
    </div>
  );
}

function SheetRow({
  icon, label, hint, onClick, trailing, accent,
}: {
  icon: string;
  label: string;
  hint?: string;
  onClick?: () => void;
  trailing?: React.ReactNode;
  accent?: boolean;
}) {
  const Component = onClick ? 'button' : 'div';
  return (
    <Component
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all active:scale-[0.98]"
      style={{
        background: accent ? 'hsl(var(--c-primary)/0.10)' : 'hsla(0,0%,100%,0.04)',
        border: `1px solid ${accent ? 'hsl(var(--c-primary)/0.25)' : 'hsla(0,0%,100%,0.08)'}`,
      }}>
      <span className="text-xl flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-sm font-semibold truncate" style={{ color: 'hsl(var(--c-fg))' }}>{label}</p>
        {hint && <p className="text-xs truncate" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{hint}</p>}
      </div>
      {trailing && <div className="flex-shrink-0">{trailing}</div>}
    </Component>
  );
}

function ToggleSwitch({ on }: { on: boolean }) {
  return (
    <div className="w-11 h-6 rounded-full transition-colors flex-shrink-0 relative"
      style={{ background: on ? 'hsl(var(--c-primary))' : 'hsla(0,0%,100%,0.15)' }}>
      <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform"
        style={{ transform: on ? 'translateX(22px)' : 'translateX(2px)' }} />
    </div>
  );
}
