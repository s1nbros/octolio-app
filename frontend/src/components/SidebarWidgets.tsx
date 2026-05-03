import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Streak widget ─── */
export function StreakWidget({ streak }: { streak: number }) {
  const days = ['M','T','W','T','F','S','S'];
  const today = (new Date().getDay() + 6) % 7; // Mon=0
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3 gap-2">
        <div>
          <div className="mono text-3xl font-bold" style={{ color: 'hsl(var(--c-orange))' }}>{streak}</div>
          <div className="text-xs uppercase tracking-widest font-semibold mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            Day Streak
          </div>
        </div>
        <span className="text-[10px] font-bold px-2 py-1 rounded text-center"
          style={{ background: 'hsl(var(--c-orange)/0.12)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.25)', letterSpacing: '0.05em' }}>
          SAVED TIL MIDNIGHT
        </span>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-3">
        {days.map((d, i) => {
          const active = i <= today && streak > (today - i);
          return (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                style={{
                  background: active ? 'hsl(var(--c-orange)/0.2)' : 'var(--c-glass)',
                  border: `1px solid ${active ? 'hsl(var(--c-orange)/0.35)' : 'var(--c-border)'}`,
                }}>
                {active ? '🔥' : <span style={{ opacity: 0.3 }}>🔔</span>}
              </div>
              <span className="text-[10px]" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{d}</span>
            </div>
          );
        })}
      </div>

      <p className="text-xs leading-relaxed" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        1 lesson today keeps your streak alive.
      </p>
    </div>
  );
}

/* ─── Pro upsell ─── */
export function ProWidget({ token }: { token: string | null }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    if (!token || loading) return;
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else { alert(data.error ?? 'Checkout failed'); setLoading(false); }
    } catch {
      alert('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl p-4 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, hsl(var(--c-bg-elevated)), hsl(var(--c-primary)/0.08))', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full pointer-events-none"
        style={{ background: 'hsl(var(--c-orange)/0.12)', filter: 'blur(20px)' }} />

      <div className="flex items-center gap-2 mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-primary)/0.2)', color: 'hsl(var(--c-primary))' }}>
          OCTOLIO PRO
        </span>
      </div>

      <p className="font-extrabold text-base leading-tight mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
        Unlock every module.
      </p>
      <p className="font-extrabold text-base leading-tight mb-3" style={{ color: 'hsl(var(--c-green))' }}>
        Level up 2× faster.
      </p>

      <ul className="space-y-1 mb-3 text-xs" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {['All premium modules', '2× XP per lesson', 'Personal AI coach'].map(f => (
          <li key={f} className="flex items-center gap-2">
            <span className="text-xs" style={{ color: 'hsl(var(--c-green))' }}>✓</span>
            {f}
          </li>
        ))}
      </ul>

      <div className="flex items-baseline gap-2 mb-3">
        <span className="mono font-extrabold text-xl" style={{ color: 'hsl(var(--c-fg))' }}>€4.99</span>
        <span className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>/month</span>
      </div>

      <button className="btn-green w-full text-sm py-2 disabled:opacity-50" onClick={handleUpgrade} disabled={loading}>
        {loading ? '…' : '⚡ Try Pro'}
      </button>
    </div>
  );
}

/* ─── League ─── */
interface LeagueEntry { rank: number; id: number; name: string; xp: number; avatar: string | null; isYou: boolean; }

function LeagueAvatar({ avatar, name, isYou }: { avatar: string | null; name: string; isYou: boolean }) {
  if (avatar?.startsWith('data:')) {
    return (
      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0"
        style={{ border: isYou ? '1.5px solid hsl(var(--c-primary)/0.5)' : '1.5px solid hsl(var(--c-fg-subtle)/0.2)' }}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
      style={{
        background: isYou ? 'hsl(var(--c-primary)/0.25)' : 'hsl(var(--c-fg-subtle)/0.15)',
        color: isYou ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
      }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function LeagueWidget({ token }: { token: string | null }) {
  const [rows, setRows] = useState<LeagueEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch('/api/auth/league', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => setRows(d.leaderboard ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-gold)/0.15)', color: 'hsl(var(--c-gold))' }}>
          🏅 GOLD LEAGUE
        </span>
      </div>
      <h3 className="font-extrabold text-base mb-0.5" style={{ color: 'hsl(var(--c-fg))' }}>
        Weekly race
      </h3>
      <p className="text-xs mb-3" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        Top 3 promote · ranked by XP
      </p>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-8 rounded-lg" />)}
        </div>
      ) : (
        <div className="space-y-1">
          {rows.slice(0, 5).map(u => (
            <div key={u.id} className="flex items-center gap-2 py-1 px-1.5 rounded-lg"
              style={{
                background: u.isYou ? 'hsl(var(--c-primary)/0.1)' : 'transparent',
                border: u.isYou ? '1px solid hsl(var(--c-primary)/0.2)' : '1px solid transparent',
              }}>
              <span className="mono text-xs w-4 text-center flex-shrink-0 font-bold"
                style={{ color: u.rank <= 3 ? 'hsl(var(--c-gold))' : 'hsl(var(--c-fg-subtle))' }}>
                {u.rank}
              </span>
              <LeagueAvatar avatar={u.avatar} name={u.name} isYou={u.isYou} />
              <span className="flex-1 text-xs font-medium truncate"
                style={{ color: u.isYou ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-muted))' }}>
                {u.name}
              </span>
              <span className="mono text-[11px] font-semibold flex-shrink-0" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {u.xp >= 1000 ? `${(u.xp / 1000).toFixed(1)}k` : u.xp}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Daily Quests teaser (compact, links to /quests) ─── */
export function DailyQuestsTeaser({ completedLessonsToday, streak, xp }: { completedLessonsToday: number; streak: number; xp: number }) {
  const quests = useMemo(() => [
    { id: 'lesson', icon: '📚', current: completedLessonsToday > 0 ? 1 : 0, total: 1, color: 'hsl(var(--c-primary))' },
    { id: 'streak', icon: '🔥', current: streak > 0 ? 1 : 0, total: 1, color: 'hsl(var(--c-green))' },
    { id: 'xp', icon: '⚡', current: Math.min(xp % 100, 50), total: 50, color: 'hsl(var(--c-orange))' },
  ], [completedLessonsToday, streak, xp]);
  const done = quests.filter(q => q.current >= q.total).length;

  return (
    <Link to="/quests" className="block">
      <div className="glass-card rounded-2xl p-4 transition-all hover:brightness-110">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <span className="text-base" style={{ color: 'hsl(var(--c-orange))' }}>◎</span>
            <h3 className="font-bold text-sm" style={{ color: 'hsl(var(--c-fg))' }}>
              Daily Quests
            </h3>
          </div>
          <span className="text-xs font-bold px-2 py-0.5 rounded-full"
            style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))' }}>
            {done}/{quests.length}
          </span>
        </div>

        {/* Segmented progress */}
        <div className="flex gap-1 mb-3">
          {quests.map(q => (
            <div key={q.id} className="flex-1 h-1.5 rounded-full overflow-hidden"
              style={{ background: 'var(--c-border)' }}>
              <div className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round((q.current / q.total) * 100)}%`,
                  background: q.color,
                }} />
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex gap-1.5">
            {quests.map(q => {
              const d = q.current >= q.total;
              return (
                <span key={q.id} className="w-7 h-7 rounded-lg flex items-center justify-center text-sm"
                  style={{
                    background: d ? 'hsl(var(--c-green)/0.18)' : 'var(--c-glass)',
                    border: `1px solid ${d ? 'hsl(var(--c-green)/0.3)' : 'var(--c-border)'}`,
                    opacity: d ? 1 : 0.7,
                  }}>
                  {d ? '✓' : q.icon}
                </span>
              );
            })}
          </div>
          <span className="text-xs font-semibold" style={{ color: 'hsl(var(--c-primary))' }}>
            View all →
          </span>
        </div>
      </div>
    </Link>
  );
}

/* ─── Money fact ─── */
const FACTS = [
  { fact: 'Saving $5/day from 25 to 65 at 7% grows to about $666,000.', tag: 'Compound interest' },
  { fact: 'The average millionaire has 7 income streams.', tag: 'Wealth building' },
  { fact: '50-30-20: spend 50% on needs, 30% on wants, 20% on savings.', tag: 'Budgeting' },
  { fact: 'Index funds beat 90% of active managers over 15 years.', tag: 'Investing' },
];

export function MoneyFactWidget() {
  const fact = FACTS[new Date().getDate() % FACTS.length];
  return (
    <div className="glass-card rounded-2xl p-4">
      <div className="flex items-center gap-1.5 mb-2">
        <span className="text-xs font-bold px-2 py-0.5 rounded"
          style={{ background: 'hsl(var(--c-primary)/0.12)', color: 'hsl(var(--c-primary))' }}>
          + MONEY FACT
        </span>
      </div>
      <p className="text-sm font-bold leading-snug mb-1.5" style={{ color: 'hsl(var(--c-fg))' }}>
        {fact.fact}
      </p>
      <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{fact.tag}</p>
    </div>
  );
}
