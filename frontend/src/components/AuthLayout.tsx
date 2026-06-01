import { Link } from 'react-router-dom';
import { useLang } from '../contexts/LanguageContext';

type Mode = 'signin' | 'signup';

interface Props {
  mode: Mode;
  /** Big heading shown above the form on the right column. */
  title: string;
  /** Smaller sub-line under the title. */
  subtitle: string;
  /** Form contents. */
  children: React.ReactNode;
  /** Optional small slot to the right of the title (e.g. "Sign up →" link). */
  topRightLink?: React.ReactNode;
  /** Optional footer slot under the form (legal microcopy etc.). */
  footer?: React.ReactNode;
}

/**
 * Split-screen auth shell used by Login + Register.
 *
 * Desktop (≥lg):  brand showcase (left) | focused form column (right)
 * Mobile / tablet: stacked — small brand header on top, form below.
 *
 * Inspired by the auth patterns of Vercel / Linear / Stripe / Notion: clean,
 * narrow form column, prominent SSO + email, ambient brand panel.
 */
export function AuthLayout({ mode, title, subtitle, children, topRightLink, footer }: Props) {
  const { lang } = useLang();

  return (
    <div
      className="min-h-screen w-full"
      style={{
        background: 'hsl(var(--c-bg))',
        color: 'hsl(var(--c-fg))',
      }}
    >
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* ── LEFT: brand panel ─────────────────────────────── */}
        <BrandPanel mode={mode} />

        {/* ── RIGHT: form column ────────────────────────────── */}
        <div className="flex flex-col">
          {/* Top bar (mobile-friendly): logo + tiny top-right action */}
          <div className="flex items-center justify-between px-6 sm:px-10 lg:px-12 pt-6 lg:pt-8">
            <Link to="/" className="flex items-center gap-2 group">
              <img
                src="/logo.png"
                alt="Octolio"
                className="w-8 h-8 object-contain lg:hidden"
              />
              <span
                className="font-extrabold tracking-tight text-lg lg:opacity-0 lg:pointer-events-none"
                style={{ color: 'hsl(var(--c-fg))' }}
              >
                Octolio
              </span>
            </Link>
            {topRightLink && (
              <div className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {topRightLink}
              </div>
            )}
          </div>

          {/* Centered form area */}
          <div className="flex-1 flex items-center justify-center px-6 sm:px-10 lg:px-12 py-8">
            <div className="w-full max-w-sm">
              <header className="mb-7">
                <h1
                  className="text-3xl sm:text-[34px] font-extrabold tracking-tight leading-tight"
                  style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.02em' }}
                >
                  {title}
                </h1>
                <p
                  className="text-sm mt-2 leading-relaxed"
                  style={{ color: 'hsl(var(--c-fg-muted))' }}
                >
                  {subtitle}
                </p>
              </header>

              {children}
            </div>
          </div>

          {/* Bottom legal strip */}
          <footer
            className="px-6 sm:px-10 lg:px-12 pb-6 text-xs flex flex-wrap items-center justify-between gap-3"
            style={{ color: 'hsl(var(--c-fg-subtle))' }}
          >
            <span>© {new Date().getFullYear()} Octolio</span>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:underline">
                {lang === 'en' ? 'Privacy' : 'Поверителност'}
              </Link>
              <Link to="/faq" className="hover:underline">
                {lang === 'en' ? 'FAQ' : 'ЧЗВ'}
              </Link>
            </div>
            {footer}
          </footer>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────
 * Left brand panel — marketing + social proof
 * ───────────────────────────────────────────────────────────── */
function BrandPanel({ mode }: { mode: Mode }) {
  const { lang } = useLang();

  const headline =
    mode === 'signup'
      ? lang === 'en'
        ? 'Learn money skills,\nplay through real life.'
        : 'Научи финанси,\nиграй през реалния живот.'
      : lang === 'en'
      ? 'Welcome back to\nyour money journey.'
      : 'Добре дошъл обратно\nкъм финансовия си път.';

  const bullets =
    lang === 'en'
      ? [
          { icon: '🎮', title: 'Gamified lessons', desc: '6–7 bite-sized exercises per lesson. Streaks. XP. Hearts. The fun parts of Duolingo, applied to finance.' },
          { icon: '🇪🇺', title: 'Built for Europe', desc: 'Euros, UCITS ETFs, SEPA, ECB rates, EU pension pillars. No US-only IRA / 401(k) confusion.' },
          { icon: '🧠', title: 'AI Financial Advisor', desc: 'Pro members get a private chat with a Claude-powered advisor — personal questions, real answers.' },
        ]
      : [
          { icon: '🎮', title: 'Геймифицирани уроци', desc: '6–7 кратки упражнения на урок. Стрийкове. XP. Сърца. Забавните части на Duolingo, приложени към финансите.' },
          { icon: '🇪🇺', title: 'Създаден за Европа', desc: 'Евро, UCITS ETF, SEPA, лихва на ЕЦБ, ЕС пенсионни стълбове. Без US-специфики като IRA / 401(k).' },
          { icon: '🧠', title: 'AI финансов съветник', desc: 'Pro потребителите получават личен чат със съветник, задвижван от Claude — лични въпроси, реални отговори.' },
        ];

  return (
    <aside
      className="hidden lg:flex relative flex-col justify-between p-12 xl:p-16 overflow-hidden"
      style={{
        background:
          'radial-gradient(1200px 500px at 0% 0%, hsl(var(--c-green)/0.18), transparent 60%),' +
          'radial-gradient(900px 600px at 100% 100%, hsl(var(--c-primary)/0.20), transparent 65%),' +
          'hsl(var(--c-bg-elevated, var(--c-bg)))',
        borderRight: '1px solid hsl(var(--c-fg)/0.06)',
      }}
    >
      {/* Subtle grid overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(hsl(var(--c-fg)/0.025) 1px, transparent 1px),' +
            'linear-gradient(90deg, hsl(var(--c-fg)/0.025) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
          maskImage: 'radial-gradient(ellipse at center, black 40%, transparent 75%)',
        }}
      />

      {/* Top: logo + wordmark */}
      <div className="relative flex items-center gap-3">
        <img
          src="/logo.png"
          alt="Octolio"
          className="w-10 h-10 object-contain"
          style={{ filter: 'drop-shadow(0 4px 16px hsl(var(--c-green)/0.4))' }}
        />
        <span
          className="font-extrabold text-xl tracking-tight"
          style={{ color: 'hsl(var(--c-fg))' }}
        >
          Octolio
        </span>
      </div>

      {/* Middle: headline + bullets */}
      <div className="relative max-w-md">
        <h2
          className="text-4xl xl:text-5xl font-extrabold leading-[1.05] mb-10 whitespace-pre-line"
          style={{
            color: 'hsl(var(--c-fg))',
            letterSpacing: '-0.025em',
          }}
        >
          {headline}
        </h2>
        <ul className="space-y-5">
          {bullets.map((b) => (
            <li key={b.title} className="flex gap-4">
              <span
                className="flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{
                  background: 'hsl(var(--c-fg)/0.05)',
                  border: '1px solid hsl(var(--c-fg)/0.08)',
                }}
              >
                {b.icon}
              </span>
              <div>
                <p className="font-bold text-base mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
                  {b.title}
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {b.desc}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Bottom: testimonial / stats card */}
      <div
        className="relative rounded-2xl p-5 max-w-md"
        style={{
          background: 'hsl(var(--c-fg)/0.04)',
          border: '1px solid hsl(var(--c-fg)/0.08)',
          backdropFilter: 'blur(6px)',
        }}
      >
        <p className="text-sm leading-relaxed italic" style={{ color: 'hsl(var(--c-fg))' }}>
          {lang === 'en'
            ? '"I went from never investing to opening my first UCITS ETF position in three weeks. Octolio made finance click."'
            : '„Преминах от никакво инвестиране до първа UCITS ETF позиция за три седмици. Octolio направи финансите смилаеми."'}
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm"
            style={{
              background: 'linear-gradient(135deg, hsl(var(--c-green)), hsl(var(--c-primary)))',
              color: 'white',
            }}
          >
            M
          </div>
          <div className="text-xs leading-tight">
            <p className="font-semibold" style={{ color: 'hsl(var(--c-fg))' }}>
              Maria, 28
            </p>
            <p style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Sofia, Bulgaria · Pro user' : 'София, България · Pro потребител'}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
