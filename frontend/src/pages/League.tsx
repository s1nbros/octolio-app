import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

interface LeagueEntry {
  rank: number;
  id: number;
  name: string;
  xp: number;
  avatar: string | null;
  isYou: boolean;
}

function UserAvatar({ avatar, name, isYou, size = 'md' }: { avatar: string | null; name: string; isYou: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const dim = size === 'lg' ? 'w-12 h-12 text-xl' : size === 'md' ? 'w-8 h-8 text-xs' : 'w-7 h-7 text-xs';
  if (avatar?.startsWith('data:')) {
    return (
      <div className={`${dim} rounded-full overflow-hidden flex-shrink-0`}
        style={{ border: isYou ? '2px solid hsl(var(--c-primary)/0.5)' : '2px solid hsl(var(--c-fg-subtle)/0.2)' }}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className={`${dim} rounded-full flex items-center justify-center font-bold flex-shrink-0`}
      style={{
        background: isYou ? 'hsl(var(--c-primary)/0.25)' : 'hsl(var(--c-fg-subtle)/0.15)',
        border: isYou ? '2px solid hsl(var(--c-primary)/0.5)' : '2px solid hsl(var(--c-fg-subtle)/0.2)',
        color: isYou ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
      }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function League() {
  const { token } = useAuth();
  const { lang } = useLang();
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

  const topThree = rows.filter(r => r.rank <= 3);
  const rest = rows.filter(r => r.rank > 3);
  const you = rows.find(r => r.isYou);

  const podiumOrder = [
    topThree.find(r => r.rank === 2),
    topThree.find(r => r.rank === 1),
    topThree.find(r => r.rank === 3),
  ].filter(Boolean) as LeagueEntry[];

  const podiumHeight = ['h-20', 'h-28', 'h-16'];
  const podiumColor = [
    'hsl(var(--c-fg-subtle)/0.3)',
    'hsl(var(--c-gold)/0.4)',
    'hsl(var(--c-fg-subtle)/0.2)',
  ];
  const medalEmoji = ['🥈', '🥇', '🥉'];

  return (
    <div className="relative pb-8 sm:pb-0">
      <div className="md:hidden"><FloatingOrbs /></div>
      <div className="relative max-w-2xl md:max-w-3xl mx-auto px-4 sm:px-6 md:px-0 py-8 md:py-2" style={{ zIndex: 1 }}>

        {/* Header */}
        <div className="text-center mb-8 md:mb-10 animate-fade-up">
          <span className="text-xs font-bold px-3 py-1 rounded-full"
            style={{ background: 'hsl(var(--c-gold)/0.15)', color: 'hsl(var(--c-gold))', border: '1px solid hsl(var(--c-gold)/0.25)' }}>
            🏅 GOLD LEAGUE
          </span>
          <h1 className="font-extrabold text-3xl md:text-4xl mt-3 mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Weekly Race' : 'Седмично надбягване'}
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Top 3 promote to the next league · ranked by XP' : 'Топ 3 се качват в следващата лига · класирани по XP'}
          </p>
        </div>

        {/* Your standing pill */}
        {you && (
          <div className="flex items-center justify-center gap-3 mb-6 animate-fade-up">
            <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl"
              style={{ background: 'hsl(var(--c-primary)/0.1)', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
              <span className="text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Your rank' : 'Твоят ранг'}
              </span>
              <span className="mono font-extrabold text-xl" style={{ color: 'hsl(var(--c-primary))' }}>
                #{you.rank}
              </span>
              <span className="mono text-sm font-semibold" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {you.xp.toLocaleString()} XP
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5,6,7].map(i => (
              <div key={i} className="skeleton h-14 rounded-2xl" />
            ))}
          </div>
        ) : (
          <>
            {/* Podium */}
            {podiumOrder.length === 3 && (
              <div className="flex items-end justify-center gap-3 mb-6 animate-fade-up">
                {podiumOrder.map((u, pi) => (
                  <div key={u.id} className="flex flex-col items-center gap-2" style={{ width: '96px' }}>
                    <UserAvatar avatar={u.avatar} name={u.name} isYou={u.isYou} size="lg" />
                    <div className="text-xs font-semibold truncate max-w-full text-center"
                      style={{ color: 'hsl(var(--c-fg-muted))' }}>
                      {u.name}
                    </div>
                    <div className="mono text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {u.xp.toLocaleString()}
                    </div>
                    {/* Podium block */}
                    <div className={`w-full ${podiumHeight[pi]} rounded-t-xl flex items-start justify-center pt-2`}
                      style={{ background: podiumColor[pi] }}>
                      <span className="text-xl">{medalEmoji[pi]}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Full leaderboard */}
            <div className="glass-card rounded-2xl overflow-hidden animate-fade-up delay-100">
              <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--c-border)' }}>
                <h2 className="font-bold text-sm" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'All participants' : 'Всички участници'}
                </h2>
              </div>
              <div className="divide-y" style={{ borderColor: 'var(--c-border)' }}>
                {rows.map(u => (
                  <div key={u.id} className="flex items-center gap-3 px-4 py-3"
                    style={{
                      background: u.isYou ? 'hsl(var(--c-primary)/0.06)' : 'transparent',
                    }}>
                    {/* Rank */}
                    <span className="mono text-sm w-7 text-center flex-shrink-0 font-bold"
                      style={{ color: u.rank <= 3 ? 'hsl(var(--c-gold))' : 'hsl(var(--c-fg-subtle))' }}>
                      {u.rank <= 3 ? ['🥇','🥈','🥉'][u.rank - 1] : u.rank}
                    </span>

                    <UserAvatar avatar={u.avatar} name={u.name} isYou={u.isYou} size="md" />

                    {/* Name */}
                    <span className="flex-1 text-sm font-medium truncate"
                      style={{ color: u.isYou ? 'hsl(var(--c-fg))' : 'hsl(var(--c-fg-muted))' }}>
                      {u.name}
                      {u.isYou && (
                        <span className="ml-1.5 text-xs px-1.5 py-0.5 rounded-full"
                          style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))' }}>
                          {lang === 'en' ? 'you' : 'ти'}
                        </span>
                      )}
                    </span>

                    {/* XP */}
                    <span className="mono text-sm font-semibold flex-shrink-0"
                      style={{ color: u.rank <= 3 ? 'hsl(var(--c-gold))' : 'hsl(var(--c-fg-subtle))' }}>
                      {u.xp.toLocaleString()} XP
                    </span>

                    {/* Promote badge for top 3 */}
                    {u.rank <= 3 && (
                      <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 hidden sm:block"
                        style={{ background: 'hsl(var(--c-green)/0.12)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.2)' }}>
                        ↑ {lang === 'en' ? 'Promotes' : 'Качва се'}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Relegation note */}
            <p className="text-center text-xs mt-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en'
                ? 'Resets every Monday · Top 3 advance · Bottom 3 relegated'
                : 'Нулира се всеки понеделник · Топ 3 се качват · Последните 3 се снишават'}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
