import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import {
  GOALS,
  DIAGNOSTIC,
  DAILY_OPTIONS,
  scoreToLevel,
  buildPlan,
  getGoal,
  LEVEL_LABEL,
  type GoalId,
  type Level,
} from '../shared/onboardingData';

type Step = 'goal' | 'diagnostic' | 'time' | 'plan' | 'pricing';
const STEP_ORDER: Step[] = ['goal', 'diagnostic', 'time', 'plan', 'pricing'];

export function Onboarding() {
  const { token, completeOnboarding, refreshUser, saveOnboardingProfile } = useAuth();
  const { lang } = useLang();
  const navigate = useNavigate();

  const [step, setStep] = useState<Step>('goal');

  // Collected answers
  const [goal, setGoal] = useState<GoalId | null>(null);
  const [diagIndex, setDiagIndex] = useState(0);
  const [diagCorrect, setDiagCorrect] = useState(0);
  const [picked, setPicked] = useState<number | null>(null); // selected option this question
  const [dailyMin, setDailyMin] = useState<number>(5);
  const [loading, setLoading] = useState<'pro' | 'free' | 'plan' | null>(null);

  const level: Level = useMemo(() => scoreToLevel(diagCorrect), [diagCorrect]);

  const stepNum = STEP_ORDER.indexOf(step) + 1;

  /* ── Pricing handlers (unchanged behavior) ── */
  const handlePro = async () => {
    setLoading('pro');
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Payment not available yet'); setLoading(null); }
    } catch {
      alert('Could not connect to payment service');
      setLoading(null);
    }
  };

  const handleFree = async () => {
    setLoading('free');
    await completeOnboarding();
    await refreshUser();
    navigate('/modules');
  };

  /* ── Diagnostic answer ── */
  const answerDiagnostic = (optionIdx: number) => {
    if (picked !== null) return;
    setPicked(optionIdx);
    const correct = optionIdx === DIAGNOSTIC[diagIndex].correctIndex;
    if (correct) setDiagCorrect((c) => c + 1);
    // Advance after a short beat so the user sees the right/wrong feedback.
    setTimeout(() => {
      setPicked(null);
      if (diagIndex + 1 < DIAGNOSTIC.length) {
        setDiagIndex((i) => i + 1);
      } else {
        setStep('time');
      }
    }, 850);
  };

  /* ── Plan → pricing: persist the profile first ── */
  const handlePlanContinue = async () => {
    if (!goal) return;
    setLoading('plan');
    try {
      await saveOnboardingProfile({ goal, experienceLevel: level, dailyGoalMin: dailyMin });
    } catch {
      // Non-fatal — the profile is a nicety, don't block onboarding on it.
    }
    setLoading(null);
    setStep('pricing');
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 py-10 sm:py-14">
      <FloatingOrbs />

      <div className="relative w-full max-w-2xl" style={{ zIndex: 1 }}>
        {/* Progress bar */}
        <div className="flex items-center gap-2 mb-8 max-w-md mx-auto">
          {STEP_ORDER.map((s, i) => (
            <div
              key={s}
              className="flex-1 h-1.5 rounded-full transition-all"
              style={{
                background: i < stepNum ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg)/0.12)',
              }}
            />
          ))}
        </div>

        {/* ── STEP 1: GOAL ── */}
        {step === 'goal' && (
          <div className="animate-fade-up">
            <Header
              title={lang === 'en' ? 'What brings you to Octolio?' : 'Какво те води в Octolio?'}
              sub={lang === 'en' ? "Pick your main goal — we'll tailor your path." : 'Избери основната си цел — ще пригодим пътя ти.'}
            />
            <div className="space-y-3 max-w-md mx-auto">
              {GOALS.map((g) => (
                <button
                  key={g.id}
                  onClick={() => { setGoal(g.id); setStep('diagnostic'); }}
                  className="w-full text-left glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-4 transition-all"
                  style={{ border: goal === g.id ? '2px solid hsl(var(--c-green))' : '1px solid var(--c-border)' }}
                >
                  <span className="text-3xl flex-shrink-0">{g.emoji}</span>
                  <div className="min-w-0">
                    <p className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>
                      {g.label[lang]}
                    </p>
                    <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                      {g.blurb[lang]}
                    </p>
                  </div>
                  <span className="ml-auto text-lg flex-shrink-0" style={{ color: 'hsl(var(--c-fg-subtle))' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 2: DIAGNOSTIC ── */}
        {step === 'diagnostic' && (
          <div className="animate-fade-up" key={diagIndex}>
            <Header
              title={lang === 'en' ? 'Quick check' : 'Бърза проверка'}
              sub={
                lang === 'en'
                  ? `Question ${diagIndex + 1} of ${DIAGNOSTIC.length} — so we start at the right level.`
                  : `Въпрос ${diagIndex + 1} от ${DIAGNOSTIC.length} — за да започнем от правилното ниво.`
              }
            />
            <div className="max-w-md mx-auto">
              <p className="font-bold text-lg mb-5 text-center" style={{ color: 'hsl(var(--c-fg))' }}>
                {DIAGNOSTIC[diagIndex].question[lang]}
              </p>
              <div className="space-y-2.5">
                {DIAGNOSTIC[diagIndex].options.map((opt, oi) => {
                  const isCorrect = oi === DIAGNOSTIC[diagIndex].correctIndex;
                  const revealed = picked !== null;
                  let border = '1px solid var(--c-border)';
                  let bg = 'var(--c-glass)';
                  if (revealed && isCorrect) { border = '2px solid hsl(var(--c-green))'; bg = 'hsl(var(--c-green)/0.12)'; }
                  else if (revealed && oi === picked && !isCorrect) { border = '2px solid hsl(var(--c-red))'; bg = 'hsl(var(--c-red)/0.10)'; }
                  return (
                    <button
                      key={oi}
                      disabled={revealed}
                      onClick={() => answerDiagnostic(oi)}
                      className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2"
                      style={{ border, background: bg, color: 'hsl(var(--c-fg))' }}
                    >
                      <span>{opt[lang]}</span>
                      {revealed && isCorrect && <span className="ml-auto">✓</span>}
                      {revealed && oi === picked && !isCorrect && <span className="ml-auto">✗</span>}
                    </button>
                  );
                })}
              </div>
              <p className="text-center text-xs mt-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? "No wrong answers here — it just calibrates your start." : 'Няма грешни отговори — само настройва старта ти.'}
              </p>
            </div>
          </div>
        )}

        {/* ── STEP 3: TIME ── */}
        {step === 'time' && (
          <div className="animate-fade-up">
            <Header
              title={lang === 'en' ? 'How much time per day?' : 'Колко време на ден?'}
              sub={lang === 'en' ? "This becomes your daily goal. You can change it later." : 'Това става дневната ти цел. Можеш да я смениш по-късно.'}
            />
            <div className="space-y-3 max-w-md mx-auto">
              {DAILY_OPTIONS.map((opt) => (
                <button
                  key={opt.minutes}
                  onClick={() => { setDailyMin(opt.minutes); setStep('plan'); }}
                  className="w-full text-left glass-card glass-card-hover rounded-2xl p-4 flex items-center gap-4"
                  style={{ border: dailyMin === opt.minutes ? '2px solid hsl(var(--c-green))' : '1px solid var(--c-border)' }}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base" style={{ color: 'hsl(var(--c-fg))' }}>{opt.label[lang]}</p>
                      {opt.recommended && (
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-full"
                          style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))' }}>
                          {lang === 'en' ? 'RECOMMENDED' : 'ПРЕПОРЪЧАНО'}
                        </span>
                      )}
                    </div>
                    <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>{opt.sub[lang]}</p>
                  </div>
                  <span className="ml-auto text-lg" style={{ color: 'hsl(var(--c-fg-subtle))' }}>→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 4: PLAN REVEAL ── */}
        {step === 'plan' && goal && (
          <PlanReveal
            goal={goal}
            level={level}
            dailyMin={dailyMin}
            lang={lang}
            loading={loading === 'plan'}
            onContinue={handlePlanContinue}
          />
        )}

        {/* ── STEP 5: PRICING (existing) ── */}
        {step === 'pricing' && (
          <Pricing lang={lang} loading={loading} onPro={handlePro} onFree={handleFree} />
        )}
      </div>
    </div>
  );
}

/* ─── Shared header ─── */
function Header({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="text-center mb-7">
      <h1 className="font-black text-2xl sm:text-3xl mb-2" style={{ color: 'hsl(var(--c-fg))', letterSpacing: '-0.02em' }}>
        {title}
      </h1>
      <p className="text-sm sm:text-base" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{sub}</p>
    </div>
  );
}

/* ─── Plan reveal ─── */
function PlanReveal({
  goal, level, dailyMin, lang, loading, onContinue,
}: {
  goal: GoalId; level: Level; dailyMin: number; lang: 'en' | 'bg'; loading: boolean; onContinue: () => void;
}) {
  const plan = buildPlan(goal, level);
  const g = getGoal(goal);

  return (
    <div className="animate-scale-in max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="text-5xl mb-3">{g?.emoji}</div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-green))' }}>
          {lang === 'en' ? 'Your plan is ready' : 'Планът ти е готов'}
        </p>
        <h1 className="font-black text-2xl sm:text-3xl" style={{ color: 'hsl(var(--c-fg))' }}>
          {plan.title[lang]}
        </h1>
      </div>

      {/* Profile chips */}
      <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
        <Chip label={g?.label[lang] ?? ''} />
        <Chip label={LEVEL_LABEL[level][lang]} />
        <Chip label={lang === 'en' ? `${dailyMin} min / day` : `${dailyMin} мин / ден`} />
      </div>

      {/* Steps */}
      <div className="glass-card rounded-2xl p-5 mb-6 space-y-4">
        {plan.steps.map((s, i) => (
          <div key={i} className="flex gap-3.5 items-start">
            <span
              className="flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-sm font-black"
              style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))' }}
            >
              {i + 1}
            </span>
            <p className="text-sm leading-relaxed pt-0.5" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {s[lang]}
            </p>
          </div>
        ))}
      </div>

      <button onClick={onContinue} disabled={loading} className="btn-green w-full py-3.5 font-bold disabled:opacity-50">
        {loading
          ? <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              {lang === 'en' ? 'Saving…' : 'Запазване…'}
            </span>
          : (lang === 'en' ? "Let's go →" : 'Да започваме →')}
      </button>
    </div>
  );
}

function Chip({ label }: { label: string }) {
  return (
    <span
      className="text-xs font-semibold px-3 py-1.5 rounded-full"
      style={{ background: 'hsl(var(--c-fg)/0.06)', color: 'hsl(var(--c-fg-muted))', border: '1px solid hsl(var(--c-fg)/0.08)' }}
    >
      {label}
    </span>
  );
}

/* ─── Pricing (free vs pro) ─── */
function Pricing({
  lang, loading, onPro, onFree,
}: {
  lang: 'en' | 'bg'; loading: 'pro' | 'free' | 'plan' | null; onPro: () => void; onFree: () => void;
}) {
  const proFeatures = [
    { icon: '⚡', en: 'Unlimited energy — never wait',      bg: 'Неограничена енергия — без чакане' },
    { icon: '📈', en: 'Advanced Investing module',           bg: 'Модул Напреднало инвестиране' },
    { icon: '🏠', en: 'Real Estate Investing module',        bg: 'Модул Инвестиции в имоти' },
    { icon: '🧾', en: 'Tax Strategy module',                 bg: 'Модул Данъчна стратегия' },
    { icon: '🤖', en: 'AI finance consultant',               bg: 'AI финансов консултант' },
    { icon: '2×', en: '2× XP on every lesson',               bg: '2× XP за всеки урок' },
  ];
  const freeFeatures = [
    { icon: '✅', en: '4 core modules included',            bg: '4 основни модула включени' },
    { icon: '⚡', en: '12 energy points per day',           bg: '12 енергийни точки на ден' },
    { icon: '🏆', en: 'Full league & streak system',        bg: 'Пълна лига и система за поредица' },
    { icon: '📊', en: 'XP, levels & achievements',          bg: 'XP, нива и постижения' },
  ];

  return (
    <div className="animate-fade-up">
      <Header
        title={lang === 'en' ? 'Pick how you want to learn' : 'Избери как искаш да учиш'}
        sub={lang === 'en' ? 'Start free anytime. Upgrade when you\'re ready.' : 'Започни безплатно. Надгради когато си готов.'}
      />

      <div className="grid sm:grid-cols-2 gap-5">
        {/* FREE */}
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
          <button onClick={onFree} disabled={loading !== null}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'hsl(var(--c-fg))', border: '1px solid var(--c-border)' }}>
            {loading === 'free'
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Setting up…' : 'Настройване…'}
                </span>
              : (lang === 'en' ? 'Continue with Free' : 'Продължи безплатно')}
          </button>
        </div>

        {/* PRO */}
        <div className="relative overflow-hidden rounded-2xl p-6 flex flex-col"
          style={{
            background: 'linear-gradient(160deg, hsl(var(--c-primary)/0.18) 0%, hsl(var(--c-green)/0.10) 100%)',
            border: '2px solid hsl(var(--c-primary)/0.50)',
            boxShadow: '0 0 40px hsl(var(--c-primary)/0.12)',
          }}>
          <div className="absolute top-4 right-4">
            <span className="text-xs font-black px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(var(--c-gold)/0.2)', color: 'hsl(var(--c-gold))', border: '1px solid hsl(var(--c-gold)/0.4)' }}>
              ⭐ {lang === 'en' ? 'POPULAR' : 'ПОПУЛЯРЕН'}
            </span>
          </div>
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full pointer-events-none"
            style={{ background: 'radial-gradient(circle, hsl(var(--c-primary)/0.15), transparent 70%)', filter: 'blur(24px)' }} />

          <div className="mb-5 relative">
            <span className="text-xs font-black px-3 py-1 rounded-full tracking-wider"
              style={{ background: 'hsl(var(--c-primary)/0.25)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.45)' }}>
              ✦ PRO
            </span>
            <p className="font-black text-2xl mt-3 mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>Octolio Pro</p>
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

          <button onClick={onPro} disabled={loading !== null}
            className="w-full py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 relative"
            style={{ background: 'linear-gradient(90deg, hsl(var(--c-primary)), hsl(var(--c-green)))', color: '#fff', border: 'none' }}
            onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
            onMouseLeave={e => (e.currentTarget.style.filter = '')}>
            {loading === 'pro'
              ? <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  {lang === 'en' ? 'Opening checkout…' : 'Отваряне на плащане…'}
                </span>
              : `⚡ ${lang === 'en' ? 'Get Octolio Pro' : 'Вземи Octolio Pro'}`}
          </button>
          <p className="text-center text-xs mt-2 relative" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Cancel anytime. No commitment.' : 'Откажи по всяко време. Без ангажимент.'}
          </p>
        </div>
      </div>
    </div>
  );
}
