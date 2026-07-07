/**
 * Friends UI as a tab section (now lives inside Profile.tsx instead of
 * its own page). Three sub-tabs: friends list, pending requests, add by
 * username search. Tapping any user opens the mini profile modal.
 */
import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { UserProfileModal } from './UserProfileModal';

interface Friend {
  id: number;
  name: string;
  xp: number;
  streak: number;
  avatar: string | null;
  /** Shared friend streak: days both of you practiced in a row. 0 = none/broken. */
  friend_streak?: number;
}

interface PendingRow {
  request_id: number;
  id: number;
  name: string;
  xp: number;
  avatar: string | null;
}

interface SearchResult {
  id: number;
  name: string;
  xp: number;
  avatar: string | null;
  status: 'none' | 'pending_out' | 'pending_in' | 'friends';
}

interface Quest {
  friendId: number;
  friendName: string;
  friendAvatar: string | null;
  goal: number;
  combined: number;
  yourContribution: number;
  friendContribution: number;
  complete: boolean;
  claimed: boolean;
  claimable: boolean;
  rewardXp: number;
  rewardCoins: number;
}

type SubTab = 'friends' | 'requests' | 'add';

function Avatar({ avatar, name, size = 40 }: { avatar: string | null; name: string; size?: number }) {
  if (avatar?.startsWith('data:')) {
    return (
      <div className="rounded-full overflow-hidden flex-shrink-0"
        style={{ width: size, height: size, border: '2px solid hsl(var(--c-fg-subtle)/0.2)' }}>
        <img src={avatar} alt={name} className="w-full h-full object-cover" />
      </div>
    );
  }
  return (
    <div className="rounded-full flex items-center justify-center font-bold flex-shrink-0"
      style={{
        width: size, height: size, fontSize: size * 0.4,
        background: 'hsl(var(--c-primary)/0.18)',
        color: 'hsl(var(--c-primary))',
        border: '2px solid hsl(var(--c-primary)/0.3)',
      }}>
      {name[0]?.toUpperCase()}
    </div>
  );
}

export function FriendsSection() {
  const { token, user, updateUser } = useAuth();
  const { lang } = useLang();
  const [subTab, setSubTab] = useState<SubTab>('friends');
  const [previewUserId, setPreviewUserId] = useState<number | null>(null);

  const [friends, setFriends] = useState<Friend[]>([]);
  const [incoming, setIncoming] = useState<PendingRow[]>([]);
  const [outgoing, setOutgoing] = useState<PendingRow[]>([]);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [claiming, setClaiming] = useState<number | null>(null);

  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);

  const loadAll = useCallback(async () => {
    if (!token) return;
    try {
      const [a, b, c] = await Promise.all([
        fetch('/api/friends/list', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/friends/pending', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
        fetch('/api/friends/quests', { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      ]);
      setFriends(a.friends ?? []);
      setIncoming(b.incoming ?? []);
      setOutgoing(b.outgoing ?? []);
      setQuests(c.quests ?? []);
    } catch {}
  }, [token]);

  const claimQuest = async (friendId: number) => {
    if (!token || claiming !== null) return;
    setClaiming(friendId);
    try {
      const res = await fetch('/api/friends/quests/claim', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId }),
      });
      const data = await res.json();
      if (res.ok) {
        if (typeof data.xp === 'number') updateUser({ xp: data.xp });
        if (typeof data.coins === 'number') updateUser({ coins: data.coins });
        await loadAll();
      }
    } catch {} finally {
      setClaiming(null);
    }
  };

  useEffect(() => { loadAll(); }, [loadAll]);

  // Debounced search
  useEffect(() => {
    if (!token) return;
    if (q.trim().length < 2) { setResults([]); return; }
    setSearching(true);
    const handle = setTimeout(() => {
      fetch(`/api/friends/search?q=${encodeURIComponent(q.trim())}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(d => setResults(d.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setSearching(false));
    }, 280);
    return () => clearTimeout(handle);
  }, [q, token]);

  const myXp = user?.xp ?? 0;
  const pendingCount = incoming.length + outgoing.length;

  return (
    <div>
      {/* Sub-tabs */}
      <div className="flex gap-2 mb-4">
        {(['friends', 'requests', 'add'] as SubTab[]).map(t => {
          const active = subTab === t;
          const label = t === 'friends'
            ? (lang === 'en' ? 'Friends' : 'Приятели')
            : t === 'requests'
              ? (lang === 'en' ? 'Requests' : 'Заявки')
              : (lang === 'en' ? 'Add' : 'Добави');
          const badge = t === 'friends' ? friends.length
            : t === 'requests' ? pendingCount
            : 0;
          return (
            <button key={t} onClick={() => setSubTab(t)}
              className="flex-1 rounded-xl px-3 py-2 text-sm font-bold transition-all"
              style={{
                background: active ? 'hsl(var(--c-primary)/0.18)' : 'var(--c-glass)',
                border: `1.5px solid ${active ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                color: active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
              }}>
              {label}
              {badge > 0 && (
                <span className="ml-1.5 text-[10px] mono font-black px-1.5 py-0.5 rounded-full"
                  style={{ background: active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-subtle))', color: '#fff' }}>
                  {badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Weekly co-op quests */}
      {subTab === 'friends' && quests.some(q => q.combined > 0 || q.claimable) && (
        <div className="rounded-2xl p-3 mb-4" style={{ background: 'hsl(var(--c-primary)/0.06)', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          <p className="text-xs font-bold uppercase tracking-wide mb-3 flex items-center gap-1.5" style={{ color: 'hsl(var(--c-primary))' }}>
            🤝 {lang === 'en' ? 'Weekly co-op quests' : 'Седмични съвместни куестове'}
          </p>
          <div className="space-y-3">
            {quests.filter(q => q.combined > 0 || q.claimable).map(q => {
              const pct = Math.min(100, Math.round((q.combined / q.goal) * 100));
              return (
                <div key={q.friendId} className="rounded-xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>
                      {lang === 'en' ? 'You + ' : 'Ти + '}{q.friendName}
                    </p>
                    <span className="text-[11px] mono flex-shrink-0" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {q.combined.toLocaleString()} / {q.goal.toLocaleString()} XP
                    </span>
                  </div>
                  <div className="progress-bar-track mb-2" style={{ height: '8px' }}>
                    <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {lang === 'en' ? 'You' : 'Ти'} {q.yourContribution.toLocaleString()} · {q.friendName} {q.friendContribution.toLocaleString()}
                    </span>
                    {q.claimed ? (
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{ background: 'hsl(var(--c-green)/0.12)', color: 'hsl(var(--c-green))' }}>
                        ✓ {lang === 'en' ? 'Claimed' : 'Взето'}
                      </span>
                    ) : q.claimable ? (
                      <button onClick={() => claimQuest(q.friendId)} disabled={claiming === q.friendId}
                        className="text-[11px] font-black px-3 py-1 rounded-full transition-all disabled:opacity-60"
                        style={{ background: 'hsl(var(--c-green))', color: '#fff' }}>
                        {claiming === q.friendId
                          ? '…'
                          : `${lang === 'en' ? 'Claim' : 'Вземи'} +${q.rewardXp} XP · +${q.rewardCoins} 🪙`}
                      </button>
                    ) : (
                      <span className="text-[10px]" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                        {lang === 'en' ? `${q.goal - q.combined} XP to go` : `Още ${q.goal - q.combined} XP`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Friends list */}
      {subTab === 'friends' && (
        <div className="rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
          {friends.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-5xl mb-3">🌱</div>
              <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {lang === 'en' ? 'No friends yet — find someone in the Add tab.' : 'Все още нямаш приятели — намери някого в раздела "Добави".'}
              </p>
              <button onClick={() => setSubTab('add')} className="btn-primary text-sm">
                {lang === 'en' ? 'Find friends →' : 'Намери приятели →'}
              </button>
            </div>
          ) : (
            friends.map(f => {
              const diff = f.xp - myXp;
              return (
                <button
                  key={f.id}
                  onClick={() => setPreviewUserId(f.id)}
                  className="w-full text-left flex items-center gap-3 py-2.5 hover:bg-white/[0.03] active:bg-white/[0.06] rounded-lg px-1 transition-colors"
                >
                  <Avatar avatar={f.avatar} name={f.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate flex items-center gap-1.5" style={{ color: 'hsl(var(--c-fg))' }}>
                      {f.name}
                      {(f.friend_streak ?? 0) > 0 && (
                        <span
                          className="text-[10px] font-black px-1.5 py-0.5 rounded-full inline-flex items-center gap-0.5"
                          title={lang === 'en' ? 'Friend streak — days you both practiced in a row' : 'Приятелска серия — дни, в които и двамата тренирахте подред'}
                          style={{ background: 'hsl(var(--c-orange)/0.15)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.3)' }}>
                          🤝🔥{f.friend_streak}
                        </span>
                      )}
                    </p>
                    <p className="text-[11px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {f.xp.toLocaleString()} XP · 🔥{f.streak}
                      <span className="ml-2" style={{ color: diff > 0 ? 'hsl(var(--c-red))' : diff < 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg-subtle))' }}>
                        {diff > 0 ? `+${diff.toLocaleString()} ahead` : diff < 0 ? `${diff.toLocaleString()} behind` : 'tied'}
                      </span>
                    </p>
                  </div>
                  <span className="text-[10px] text-[hsl(var(--c-fg-subtle))]">→</span>
                </button>
              );
            })
          )}
        </div>
      )}

      {/* Requests */}
      {subTab === 'requests' && (
        <div className="space-y-4">
          <div className="rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? `Incoming (${incoming.length})` : `Входящи (${incoming.length})`}
            </p>
            {incoming.length === 0 ? (
              <p className="text-sm py-3 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'No incoming requests.' : 'Няма входящи заявки.'}
              </p>
            ) : (
              incoming.map(r => (
                <button
                  key={r.request_id}
                  onClick={() => setPreviewUserId(r.id)}
                  className="w-full text-left flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-lg px-1 transition-colors"
                >
                  <Avatar avatar={r.avatar} name={r.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>{r.name}</p>
                    <p className="text-[11px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {r.xp.toLocaleString()} XP · {lang === 'en' ? 'tap to view' : 'натисни за преглед'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? `Sent (${outgoing.length})` : `Изпратени (${outgoing.length})`}
            </p>
            {outgoing.length === 0 ? (
              <p className="text-sm py-3 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'No outgoing requests.' : 'Няма изпратени заявки.'}
              </p>
            ) : (
              outgoing.map(r => (
                <button
                  key={r.request_id}
                  onClick={() => setPreviewUserId(r.id)}
                  className="w-full text-left flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-lg px-1 transition-colors"
                >
                  <Avatar avatar={r.avatar} name={r.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>{r.name}</p>
                    <p className="text-[11px]" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {lang === 'en' ? 'Awaiting reply…' : 'Очаква отговор…'}
                    </p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add */}
      {subTab === 'add' && (
        <div>
          <div className="mb-3 rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              🔎 {lang === 'en' ? 'Search by nickname (min 2 letters)' : 'Търси по никнейм (мин. 2 букви)'}
            </p>
            <input
              type="text"
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder={lang === 'en' ? 'e.g. s1nbros' : 'напр. s1nbros'}
              className="w-full text-sm rounded-lg px-3 py-2 outline-none focus:ring-2"
              style={{
                color: 'hsl(var(--c-fg))',
                background: 'hsl(228, 14%, 14%)',
                border: '1px solid var(--c-border)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
              }} />
          </div>

          <div className="rounded-2xl p-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            {q.trim().length < 2 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Type at least 2 letters to search.' : 'Въведи поне 2 букви за търсене.'}
              </p>
            ) : searching ? (
              <p className="text-sm py-6 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Searching…' : 'Търся…'}
              </p>
            ) : results.length === 0 ? (
              <p className="text-sm py-6 text-center" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'No users found.' : 'Няма намерени потребители.'}
              </p>
            ) : (
              results.map(r => (
                <button
                  key={r.id}
                  onClick={() => setPreviewUserId(r.id)}
                  className="w-full text-left flex items-center gap-3 py-2.5 hover:bg-white/[0.03] rounded-lg px-1 transition-colors"
                >
                  <Avatar avatar={r.avatar} name={r.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate" style={{ color: 'hsl(var(--c-fg))' }}>{r.name}</p>
                    <p className="text-[11px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                      {r.xp.toLocaleString()} XP
                    </p>
                  </div>
                  {r.status === 'friends' && (
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: 'hsl(var(--c-green)/0.12)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.25)' }}>
                      ✓ {lang === 'en' ? 'Friends' : 'Приятели'}
                    </span>
                  )}
                  {r.status === 'pending_out' && (
                    <span className="text-xs px-2.5 py-1 rounded-full"
                      style={{ background: 'var(--c-glass)', color: 'hsl(var(--c-fg-muted))', border: '1px solid var(--c-border)' }}>
                      {lang === 'en' ? 'Sent' : 'Изпратено'}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      <UserProfileModal
        userId={previewUserId}
        onClose={() => setPreviewUserId(null)}
        onFriendshipChange={loadAll}
      />
    </div>
  );
}
