import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

interface Msg { role: 'user' | 'assistant'; content: string; }

const SUGGESTIONS: { en: string; bg: string }[] = [
  { en: 'How do I start an emergency fund?', bg: 'Как да започна авариен фонд?' },
  { en: 'Explain the 50/30/20 budgeting rule', bg: 'Обясни правилото 50/30/20 за бюджет' },
  { en: 'Should I pay off debt or invest first?', bg: 'Първо да изплатя дълг или да инвестирам?' },
  { en: 'How much should I save for retirement?', bg: 'Колко да спестявам за пенсия?' },
];

export function AiAdvisor() {
  const { token, user } = useAuth();
  const { lang } = useLang();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, loading]);

  // ── Free users: Pro upsell wall (fits inside the app shell, no full-screen hacks) ──
  if (!user?.is_pro) {
    const upgrade = async () => {
      if (!token) return;
      try {
        const res = await fetch('/api/stripe/checkout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.url) window.location.href = data.url;
      } catch { /* ignore */ }
    };
    return (
      <div className="max-w-md mx-auto py-10 sm:py-16 animate-scale-in">
        <div className="glass-card rounded-3xl p-8 text-center">
          <div className="text-5xl mb-4">🐙</div>
          <h2 className="font-black text-2xl mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Your personal money coach' : 'Твоят личен финансов треньор'}
          </h2>
          <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Ask anything about budgeting, investing, debt or taxes and get clear, practical answers. Available with Octolio Pro.'
              : 'Питай каквото искаш за бюджет, инвестиции, дългове или данъци и получи ясни, практични отговори. Достъпно с Octolio Pro.'}
          </p>
          <button className="btn-primary w-full mb-3" onClick={upgrade}>
            ✦ {lang === 'en' ? 'Upgrade to Pro' : 'Надгради до Pro'}
          </button>
          <Link to="/modules">
            <button className="btn-ghost w-full">
              {lang === 'en' ? '← Back to Learn' : '← Към Учене'}
            </button>
          </Link>
        </div>
      </div>
    );
  }

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading || !token) return;
    const next: Msg[] = [...messages, { role: 'user', content: trimmed }];
    setMessages(next);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: next }),
      });
      const data = await res.json();
      if (!res.ok || !data.text) {
        setError(
          data.error === 'AI service not configured'
            ? (lang === 'en' ? 'AI coach is temporarily unavailable.' : 'AI треньорът е временно недостъпен.')
            : (data.error
                ? `⚠ ${data.error}`
                : (lang === 'en' ? 'Something went wrong — try again.' : 'Нещо се обърка — опитай пак.'))
        );
      } else {
        setMessages((m) => [...m, { role: 'assistant', content: data.text }]);
      }
    } catch {
      setError(lang === 'en' ? 'Network error — try again.' : 'Мрежова грешка — опитай пак.');
    }
    setLoading(false);
  };

  return (
    // A bounded chat panel that lives inside the app shell's main column. Height
    // tracks the viewport but caps out on big screens so it never becomes a
    // stretched full-height HUD. max-w keeps line length readable.
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">🐙</div>
        <div>
          <h1 className="font-black text-xl" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'AI Money Coach' : 'AI Финансов треньор'}
          </h1>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Your personal finance guide' : 'Твоят личен финансов гид'}
          </p>
        </div>
      </div>

      {/* Chat card */}
      <div
        className="glass-card rounded-3xl flex flex-col overflow-hidden"
        style={{ height: 'min(calc(100dvh - 190px), 680px)', minHeight: 380 }}
      >
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {messages.length === 0 && !loading && (
            <div className="h-full flex flex-col justify-center">
              <p className="text-sm mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {lang === 'en'
                  ? "👋 Hi! I'm your money coach. Ask me anything, or start with one of these:"
                  : '👋 Здравей! Аз съм твоят финансов треньор. Питай ме каквото искаш или започни с:'}
              </p>
              <div className="grid sm:grid-cols-2 gap-2 max-w-xl mx-auto w-full">
                {SUGGESTIONS.map((s, i) => (
                  <button key={i} onClick={() => send(s[lang])}
                    className="text-left text-sm rounded-xl px-3 py-2.5 transition-all hover:brightness-110"
                    style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.2)', color: 'hsl(var(--c-fg))' }}>
                    {s[lang]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className="max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap"
                style={m.role === 'user'
                  ? { background: 'hsl(var(--c-primary))', color: '#fff' }
                  : { background: 'var(--c-glass)', border: '1px solid var(--c-border)', color: 'hsl(var(--c-fg))' }}>
                {m.content}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                <span className="inline-flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'hsl(var(--c-fg-muted))', animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'hsl(var(--c-fg-muted))', animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full animate-bounce" style={{ background: 'hsl(var(--c-fg-muted))', animationDelay: '300ms' }} />
                </span>
              </div>
            </div>
          )}

          {error && (
            <p className="text-xs text-center" style={{ color: 'hsl(var(--c-red))' }}>{error}</p>
          )}
        </div>

        {/* Input bar (pinned to the bottom of the card) */}
        <div className="flex gap-2 p-3 border-t" style={{ borderColor: 'var(--c-border)' }}>
          <input
            type="text"
            className="input-field flex-1"
            placeholder={lang === 'en' ? 'Ask about money…' : 'Питай за пари…'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send(input)}
            disabled={loading}
          />
          <button className="btn-primary px-5" onClick={() => send(input)} disabled={loading || !input.trim()}>
            {lang === 'en' ? 'Send' : 'Изпрати'}
          </button>
        </div>
      </div>

      <p className="text-[10px] text-center mt-2.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en'
          ? 'AI can make mistakes. Not financial advice — consult a professional for big decisions.'
          : 'AI може да греши. Това не е финансов съвет — консултирай се със специалист за важни решения.'}
      </p>
    </div>
  );
}
