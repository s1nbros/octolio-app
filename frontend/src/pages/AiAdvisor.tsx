import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export function AiAdvisor() {
  const { token, user } = useAuth();
  const { lang } = useLang();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isPro = user?.is_pro ?? false;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setInput('');
    setStreaming(true);

    // Add empty assistant message to fill in
    setMessages((prev) => [...prev, { role: 'assistant', content: '' }]);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        setMessages((prev) => {
          const updated = [...prev];
          updated[updated.length - 1] = { role: 'assistant', content: `⚠ ${err.error ?? 'Error'}` };
          return updated;
        });
        setStreaming(false);
        return;
      }

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const chunk = JSON.parse(data) as { text?: string };
            if (chunk.text) {
              setMessages((prev) => {
                const updated = [...prev];
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: updated[updated.length - 1].content + chunk.text,
                };
                return updated;
              });
            }
          } catch { /* ignore parse errors */ }
        }
      }
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: 'assistant', content: '⚠ Connection error. Please try again.' };
        return updated;
      });
    }

    setStreaming(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const suggestions = lang === 'en'
    ? [
        'How do I start investing with €100/month?',
        'What\'s the 50/30/20 budgeting rule?',
        'How do index funds work?',
        'When should I pay off debt vs invest?',
      ]
    : [
        'Как да започна да инвестирам с €100/месец?',
        'Какво е правилото 50/30/20 за бюджет?',
        'Как работят индексните фондове?',
        'Кога да изплащам дълг вместо да инвестирам?',
      ];

  if (!isPro) {
    return (
      <div className="relative min-h-screen flex items-center justify-center px-4">
        <FloatingOrbs />
        <div className="relative max-w-sm w-full animate-scale-in" style={{ zIndex: 1 }}>
          <div className="glass-card rounded-3xl p-8 text-center">
            <div className="text-5xl mb-4">🤖</div>
            <h2 className="font-black text-2xl mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'AI Financial Advisor' : 'AI Финансов съветник'}
            </h2>
            <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en'
                ? 'Get instant, personalized answers to any finance question. Available exclusively for Pro members.'
                : 'Получи незабавни, персонализирани отговори на всякакви финансови въпроси. Достъпно само за Pro членове.'}
            </p>
            <button className="btn-primary w-full mb-3" onClick={async () => {
              const res = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: { Authorization: `Bearer ${token}` },
              });
              const data = await res.json();
              if (data.url) window.location.href = data.url;
            }}>
              ✦ {lang === 'en' ? 'Upgrade to Pro' : 'Надгради до Pro'}
            </button>
            <Link to="/dashboard">
              <button className="btn-ghost w-full">
                {lang === 'en' ? '← Back' : '← Назад'}
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen pb-20 sm:pb-0 flex flex-col">
      <FloatingOrbs />

      <div className="relative flex flex-col max-w-3xl mx-auto w-full px-4 sm:px-6 py-8 flex-1" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-6 animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
              style={{ background: 'hsl(var(--c-primary)/0.15)', border: '1px solid hsl(var(--c-primary)/0.3)' }}>
              🤖
            </div>
            <div>
              <h1 className="text-xl font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
                {lang === 'en' ? 'AI Financial Advisor' : 'AI Финансов съветник'}
              </h1>
              <p className="text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {lang === 'en' ? 'Ask anything about money, investing, or budgeting' : 'Питай всичко за пари, инвестиции или бюджет'}
              </p>
            </div>
            <span className="ml-auto text-xs font-bold px-2.5 py-1 rounded-full"
              style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.3)' }}>
              ✦ PRO
            </span>
          </div>
        </div>

        {/* Chat area */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          {messages.length === 0 && (
            <div className="animate-fade-up">
              <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {lang === 'en' ? 'Try asking:' : 'Опитай да попиташ:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setInput(s); textareaRef.current?.focus(); }}
                    className="text-left text-sm px-4 py-3 rounded-xl transition-all"
                    style={{
                      background: 'var(--c-glass)',
                      border: '1px solid var(--c-border)',
                      color: 'hsl(var(--c-fg-muted))',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-4">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm mr-2 flex-shrink-0 mt-1"
                    style={{ background: 'hsl(var(--c-primary)/0.15)' }}>
                    🤖
                  </div>
                )}
                <div
                  className="max-w-[80%] px-4 py-3 rounded-2xl text-sm whitespace-pre-wrap"
                  style={msg.role === 'user'
                    ? {
                        background: 'hsl(var(--c-primary)/0.15)',
                        color: 'hsl(var(--c-fg))',
                        border: '1px solid hsl(var(--c-primary)/0.25)',
                        borderBottomRightRadius: '4px',
                      }
                    : {
                        background: 'var(--c-glass)',
                        color: 'hsl(var(--c-fg))',
                        border: '1px solid var(--c-border)',
                        borderBottomLeftRadius: '4px',
                      }
                  }
                >
                  {msg.content || (streaming && i === messages.length - 1
                    ? <span className="inline-block w-2 h-4 rounded animate-pulse" style={{ background: 'hsl(var(--c-fg-subtle))' }} />
                    : ''
                  )}
                </div>
              </div>
            ))}
          </div>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="mt-4 glass-card rounded-2xl p-3 flex gap-2 items-end"
          style={{ border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={lang === 'en' ? 'Ask a financial question…' : 'Задай финансов въпрос…'}
            className="flex-1 bg-transparent resize-none text-sm outline-none"
            style={{
              color: 'hsl(var(--c-fg))',
              minHeight: '36px',
              maxHeight: '120px',
            }}
          />
          <button
            onClick={send}
            disabled={!input.trim() || streaming}
            className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm transition-all flex-shrink-0"
            style={{
              background: input.trim() && !streaming ? 'hsl(var(--c-primary))' : 'var(--c-glass)',
              color: input.trim() && !streaming ? '#fff' : 'hsl(var(--c-fg-subtle))',
              border: '1px solid var(--c-border)',
            }}
          >
            {streaming ? '…' : '↑'}
          </button>
        </div>
        <p className="text-xs text-center mt-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Not financial advice. Consult a professional for major decisions.' : 'Не е финансов съвет. Консултирайте се с profesionalist за важни решения.'}
        </p>
      </div>
    </div>
  );
}
