import { Link } from 'react-router-dom';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { useLang } from '../contexts/LanguageContext';

const FEATURES = [
  { icon: '🎮', titleKey: 'feature1_title', descKey: 'feature1_desc', color: 'hsl(var(--c-primary))' },
  { icon: '📚', titleKey: 'feature2_title', descKey: 'feature2_desc', color: 'hsl(var(--c-green))' },
  { icon: '🌍', titleKey: 'feature3_title', descKey: 'feature3_desc', color: 'hsl(var(--c-purple))' },
  { icon: '📊', titleKey: 'feature4_title', descKey: 'feature4_desc', color: 'hsl(var(--c-orange))' },
] as const;

const MODULES_PREVIEW = [
  { icon: '💰', en: 'Budgeting Basics', bg: 'Основи на бюджетирането', colorVar: 'var(--c-green)' },
  { icon: '💎', en: 'Saving Smart', bg: 'Умно спестяване', colorVar: 'var(--c-primary)' },
  { icon: '📈', en: 'Investing 101', bg: 'Инвестиции 101', colorVar: 'var(--c-purple)' },
  { icon: '🏦', en: 'Credit & Debt', bg: 'Кредити и дългове', colorVar: 'var(--c-orange)' },
];

export function Landing() {
  const { ui, lang } = useLang();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingOrbs />

      <div className="relative" style={{ zIndex: 1 }}>
        {/* Hero */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-20 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-6 animate-fade-up">
            <img
              src="/logo.png"
              alt="Octolio mascot"
              className="w-28 h-28 object-contain"
              style={{ filter: 'drop-shadow(0 8px 24px hsl(var(--c-green)/0.35))' }}
            />
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 animate-fade-up delay-100"
            style={{
              background: 'hsl(var(--c-green)/0.08)',
              border: '1px solid hsl(var(--c-green)/0.2)',
            }}>
            <span className="text-xs font-semibold" style={{ color: 'hsl(var(--c-green))' }}>
              🎓 {lang === 'en' ? 'Financial literacy, gamified' : 'Финансова грамотност, геймифицирана'}
            </span>
          </div>

          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight tracking-tight mb-6 animate-fade-up delay-100">
            <span style={{ color: 'hsl(var(--c-fg))' }}>{ui.hero_title}</span>
            <br />
            <span style={{
              background: 'linear-gradient(135deg, hsl(var(--c-green)), hsl(var(--c-primary)))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}>
              {ui.hero_title2}
            </span>
          </h1>

          <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-10 animate-fade-up delay-200"
            style={{ color: 'hsl(var(--c-fg-muted))', lineHeight: 1.7 }}>
            {ui.hero_sub}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-up delay-300">
            <Link to="/register">
              <button className="btn-green text-base px-8 py-3.5 animate-bounce-soft" style={{ animationDelay: '1s' }}>
                {ui.get_started} →
              </button>
            </Link>
            <Link to="/login">
              <button className="btn-ghost text-base px-8 py-3.5">
                {ui.already_member} {ui.login}
              </button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-6 mt-10 animate-fade-up delay-400">
            {[
              { value: '4+', label: lang === 'en' ? 'Modules' : 'Модула' },
              { value: '12+', label: lang === 'en' ? 'Lessons' : 'Урока' },
              { value: '48+', label: lang === 'en' ? 'Exercises' : 'Упражнения' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold" style={{ color: 'hsl(var(--c-green))' }}>{value}</div>
                <div className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* Module preview strip */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-20">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MODULES_PREVIEW.map((m, i) => (
              <div
                key={m.en}
                className="glass-card rounded-2xl p-4 text-center animate-fade-up"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="text-3xl mb-2">{m.icon}</div>
                <p className="text-sm font-semibold" style={{ color: `hsl(${m.colorVar})` }}>
                  {lang === 'en' ? m.en : m.bg}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 mb-24">
          <h2 className="text-3xl font-bold text-center mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Why Octolio?' : 'Защо Octolio?'}
          </h2>
          <p className="text-center mb-12" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Everything you need to build lasting financial habits.'
              : 'Всичко необходимо за изграждане на трайни финансови навици.'}
          </p>
          <div className="grid sm:grid-cols-2 gap-5">
            {FEATURES.map((f, i) => (
              <div
                key={f.titleKey}
                className="glass-card glass-card-hover rounded-2xl p-6 animate-fade-up"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: `${f.color}18` }}
                  >
                    {f.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-base mb-1.5" style={{ color: 'hsl(var(--c-fg))' }}>
                      {ui[f.titleKey]}
                    </h3>
                    <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                      {ui[f.descKey]}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-24 text-center">
          <div className="glass-card rounded-3xl p-10"
            style={{ border: '1px solid hsl(var(--c-green)/0.2)' }}>
            <div className="flex justify-center mb-4">
              <img src="/logo.png" alt="Octolio" className="w-20 h-20 object-contain"
                style={{ filter: 'drop-shadow(0 4px 16px hsl(var(--c-green)/0.3))' }} />
            </div>
            <h2 className="text-3xl font-bold mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Ready to level up your finances?' : 'Готов ли си да подобриш финансите си?'}
            </h2>
            <p className="mb-8" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en'
                ? 'Join Octolio today and start your journey to financial freedom.'
                : 'Присъедини се към Octolio днес и започни пътуването към финансова свобода.'}
            </p>
            <Link to="/register">
              <button className="btn-green text-base px-10 py-3.5">
                {ui.get_started} →
              </button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          className="max-w-5xl mx-auto px-4 sm:px-6 pb-10 pt-2 text-center text-sm"
          style={{ color: 'hsl(var(--c-fg-muted))' }}
        >
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 mb-3">
            <Link to="/faq" className="hover:underline" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? 'FAQ' : 'Често задавани въпроси'}
            </Link>
            <span style={{ color: 'hsl(var(--c-fg)/0.2)' }}>•</span>
            <Link to="/privacy" className="hover:underline" style={{ color: 'hsl(var(--c-primary))' }}>
              {lang === 'en' ? 'Privacy Policy' : 'Политика за поверителност'}
            </Link>
            <span style={{ color: 'hsl(var(--c-fg)/0.2)' }}>•</span>
            <Link to="/login" className="hover:underline" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en' ? 'Log in' : 'Вход'}
            </Link>
          </div>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg)/0.5)' }}>
            © {new Date().getFullYear()} Octolio.{' '}
            {lang === 'en'
              ? 'Educational content only — not regulated financial advice.'
              : 'Само образователно съдържание — не е регулирана финансова консултация.'}
          </p>
        </footer>
      </div>
    </div>
  );
}
