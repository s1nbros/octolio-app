import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

export function Onboarding() {
  const { token, completeOnboarding, refreshUser } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<'pro' | 'free' | null>(null);

  const handlePro = async () => {
    setLoading('pro');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error ?? 'Payment not available yet');
        setLoading(null);
      }
    } catch {
      alert('Could not connect to payment service');
      setLoading(null);
    }
  };

  const handleFree = async () => {
    setLoading('free');
    await completeOnboarding();
    await refreshUser();
    navigate('/dashboard');
  };

  const proFeatures = [
    { icon: '⚡', en: 'Unlimited energy — never wait',      bg: 'Неограничена енергия — без чакане' },
    { icon: '📈', en: 'Advanced Investing module',           bg: 'Модул Напреднало инвестиране' },
    { icon: '🏠', en: 'Real Estate Investing module',        bg: 'Модул Инвестиции в имоти' },
    { icon: '🧾', en: 'Tax Strategy module',                 bg: 'Модул Данъчна стратегия' },
    { icon: '🤖', en: 'AI finance consultant (coming soon)', bg: 'AI финансов консултант (скоро)' },
    { icon: '2×', en: '2× XP on every lesson',              bg: '2× XP за всеки урок' },
  ];

  const freeFeatures = [
    { icon: '✅', en: '4 core modules included',            bg: '4 основни модула включени' },
    { icon: '⚡', en: '12 energy points per day',           bg: '12 енергийни точки на ден' },
    { icon: '🏆', en: 'Full league & streak system',        bg: 'Пълна лига и система за поредица' },
    { icon: '📊', en: 'XP, levels & achievements',          bg: 'XP, нива и постижения' },
  ];

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 md:px-8 py-12 md:py-16">
      <FloatingOrbs />

      <div className="relative w-full max-w-4xl" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="text-center mb-10 md:mb-12 animate-fade-up">
          <img src="/logo.png" alt="Octolio" className="w-14 h-14 md:w-16 md:h-16 mx-auto mb-4 object-contain"
            style={{ filter: 'drop-shadow(0 0 8px hsl(var(--c-green)/0.5))' }} />
          <h1 className="font-black text-4xl md:text-5xl mb-2" style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.02em' }}>
            {lang === 'en' ? 'Choose your plan' : 'Избери своя план'}
          </h1>
          <p className="md:text-lg" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en'
              ? 'Start free anytime. Upgrade when you\'re ready.'
              : 'Започни безплатно. Надгради когато си готов.'}
          </p>
        </div>

        {/* Plans grid */}
        <div className="grid sm:grid-cols-2 gap-5 md:gap-6 animate-fade-up delay-100">

          {/* FREE card */}
          <div className="glass-card rounded-2xl p-6 flex flex-col">
            <div className="mb-5">
              <span className="text-xs font-black px-3 py-1 rounded-full tracking-wider"
                style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.3)' }}>
                FREE
              </span>
              <p className="font-black text-2xl mt-3 mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
                {lang === 'en' ? 'Start Free' : 'Безплатен план'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="mono font-black text-3xl" style={{ color: 'hsl(var(--c-fg))' }}>€0</span>
                <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>{lang === 'en' ? '/forever' : '/завинаги'}</span>
              </div>
            </div>

            <div className="space-y-2.5 flex-1 mb-6">
              {freeFeatures.map(f => (
                <div key={f.en} className="flex items-center gap-2.5 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  <span className="w-6 text-center flex-shrink-0">{f.icon}</span>
                  {lang === 'en' ? f.en : f.bg}
                </div>
              ))}
            </div>

            <button
              onClick={handleFree}
              disabled={loading !== null}
              className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
              style={{
                background: 'rgba(255,255,255,0.08)',
                color: 'hsl(var(--c-fg))',
                border: '1px solid var(--c-border)',
              }}>
              {loading === 'free'
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                    {lang === 'en' ? 'Setting up…' : 'Настройване…'}
                  </span>
                : (lang === 'en' ? 'Continue with Free' : 'Продължи безплатно')}
            </button>
          </div>

          {/* PRO card */}
          <div className="relative overflow-hidden rounded-2xl p-6 flex flex-col"
            style={{
              background: 'linear-gradient(160deg, hsl(var(--c-primary)/0.18) 0%, hsl(var(--c-green)/0.10) 100%)',
              border: '2px solid hsl(var(--c-primary)/0.50)',
              boxShadow: '0 0 40px hsl(var(--c-primary)/0.12)',
            }}>
            {/* Popular badge */}
            <div className="absolute top-4 right-4">
              <span className="text-xs font-black px-2.5 py-1 rounded-full"
                style={{ background: 'hsl(var(--c-gold)/0.2)', color: 'hsl(var(--c-gold))', border: '1px solid hsl(var(--c-gold)/0.4)' }}>
                ⭐ {lang === 'en' ? 'POPULAR' : 'ПОПУЛЯРЕН'}
              </span>
            </div>

            {/* Glow blobs */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, hsl(var(--c-primary)/0.15), transparent 70%)', filter: 'blur(24px)' }} />

            <div className="mb-5 relative">
              <span className="text-xs font-black px-3 py-1 rounded-full tracking-wider"
                style={{ background: 'hsl(var(--c-primary)/0.25)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.45)' }}>
                ✦ PRO
              </span>
              <p className="font-black text-2xl mt-3 mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
                {lang === 'en' ? 'Octolio Pro' : 'Octolio Pro'}
              </p>
              <div className="flex items-baseline gap-2">
                <span className="mono font-black text-3xl" style={{ color: 'hsl(var(--c-fg))' }}>€4.99</span>
                <span className="text-base line-through" style={{ color: 'hsl(var(--c-fg-subtle))' }}>€9.99</span>
                <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>{lang === 'en' ? '/month' : '/месец'}</span>
              </div>
              <span className="inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ background: 'hsl(var(--c-orange)/0.2)', color: 'hsl(var(--c-orange))' }}>
                50% OFF — {lang === 'en' ? 'Limited offer' : 'Ограничена оферта'}
              </span>
            </div>

            <div className="space-y-2.5 flex-1 mb-6 relative">
              {proFeatures.map(f => (
                <div key={f.en} className="flex items-center gap-2.5 text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  <span className="w-6 text-center flex-shrink-0 font-bold" style={{ color: 'hsl(var(--c-green))' }}>{f.icon}</span>
                  {lang === 'en' ? f.en : f.bg}
                </div>
              ))}
            </div>

            <button
              onClick={handlePro}
              disabled={loading !== null}
              className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 relative"
              style={{
                background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))',
                color: '#fff',
                border: 'none',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = '')}>
              {loading === 'pro'
                ? <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    {lang === 'en' ? 'Opening checkout…' : 'Отваряне на плащане…'}
                  </span>
                : `⚡ ${lang === 'en' ? 'Try Pro free for 7 days' : 'Пробвай Pro безплатно 7 дни'}`}
            </button>
            <p className="text-center text-xs mt-2 relative" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Cancel anytime. No commitment.' : 'Откажи по всяко време. Без ангажимент.'}
            </p>
          </div>
        </div>

        {/* Feature comparison note */}
        <p className="text-center text-xs mt-8 animate-fade-up delay-200" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en'
            ? 'Free plan: 12 energy/day — each interactive exercise costs 1 energy. Refills every 24h.'
            : 'Безплатен план: 12 енергия/ден — всяко интерактивно упражнение струва 1 енергия. Зарежда се на 24ч.'}
        </p>
      </div>
    </div>
  );
}
