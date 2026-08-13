import { Link, useLocation } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

/** Mobile-only bottom tab bar (the 5 fundamental pages). Everything else stays
 *  reachable from these pages (Shop/Friends/Settings from Profile, Workout from
 *  Learn, etc.) and from the top-bar menu. Desktop keeps the AppShell sidebar. */

function I({ children }: { children: React.ReactNode }) {
  return (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {children}
    </svg>
  );
}
const IconLearn = () => <I><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></I>;
const IconQuests = () => <I><circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="4" /></I>;
const IconReview = () => <I><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></I>;
const IconLeague = () => <I><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></I>;
const IconProfile = () => <I><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></I>;

const TABS = [
  { to: '/modules', label: { en: 'Learn', bg: 'Учи' }, Icon: IconLearn, match: (p: string) => p.startsWith('/modules') || p.startsWith('/lesson') },
  { to: '/quests', label: { en: 'Quests', bg: 'Куестове' }, Icon: IconQuests, match: (p: string) => p.startsWith('/quests') },
  { to: '/review', label: { en: 'Review', bg: 'Преглед' }, Icon: IconReview, match: (p: string) => p.startsWith('/review') },
  { to: '/league', label: { en: 'League', bg: 'Лига' }, Icon: IconLeague, match: (p: string) => p.startsWith('/league') },
  { to: '/profile', label: { en: 'Profile', bg: 'Профил' }, Icon: IconProfile, match: (p: string) => p.startsWith('/profile') },
];

export function BottomNav() {
  const { lang } = useLang();
  const { pathname } = useLocation();
  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-40"
      style={{
        background: 'hsla(228, 28%, 8%, 0.85)',
        backdropFilter: 'saturate(180%) blur(18px)',
        WebkitBackdropFilter: 'saturate(180%) blur(18px)',
        borderTop: '1px solid hsla(0,0%,100%,0.07)',
        boxShadow: '0 -6px 24px hsla(0,0%,0%,0.28)',
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      <div className="flex items-stretch justify-around px-1.5 pt-2 pb-1.5">
        {TABS.map(({ to, label, Icon, match }) => {
          const active = match(pathname);
          const color = active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-subtle))';
          return (
            <Link
              key={to}
              to={to}
              className="flex-1 flex flex-col items-center gap-1 active:scale-90 transition-transform duration-150"
            >
              <span
                className="flex items-center justify-center rounded-2xl transition-all duration-200"
                style={{
                  width: 56,
                  height: 30,
                  color,
                  background: active ? 'hsl(var(--c-primary)/0.16)' : 'transparent',
                  transform: active ? 'translateY(-1px)' : 'none',
                }}
              >
                <Icon />
              </span>
              <span className="text-[10px] font-extrabold tracking-tight" style={{ color }}>
                {label[lang]}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
