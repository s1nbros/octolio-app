/**
 * Mini profile modal. Pops up when tapping a user (avatar, nickname,
 * leaderboard row) and shows a small snapshot: their octopus mascot,
 * stats, and a friendship action button (Add / Cancel / Accept).
 */
import { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { OctopusAvatar } from './OctopusAvatar';
import { getCatalogItem } from '../shared/catalogClient';
import { getLevel } from '../types';

interface Preview {
  id: number;
  name: string;
  avatar: string | null;
  xp: number;
  streak: number;
  isPro: boolean;
  equippedHat: string | null;
  equippedFace: string | null;
  equippedBody: string | null;
  lessonsCompleted: number;
  memberSince: string;
  friendshipStatus: 'self' | 'friends' | 'pending_out' | 'pending_in' | 'none';
  requestId: number | null;
  friendStreak?: number;
}

interface Props {
  userId: number | null;
  onClose: () => void;
  /** Optional: refresh hook for the parent (e.g. League page) when friendship state changes. */
  onFriendshipChange?: () => void;
}

export function UserProfileModal({ userId, onClose, onFriendshipChange }: Props) {
  const { token } = useAuth();
  const { lang } = useLang();
  const [preview, setPreview] = useState<Preview | null>(null);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId || !token) return;
    setLoading(true);
    setPreview(null);
    setError('');
    fetch(`/api/friends/preview/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => {
        if (d.error) {
          setError(d.error === 'user_not_found'
            ? (lang === 'en' ? 'User not found.' : 'Потребителят не е намерен.')
            : d.error);
        } else {
          setPreview(d);
        }
      })
      .catch(() => setError(lang === 'en' ? 'Network error.' : 'Мрежова грешка.'))
      .finally(() => setLoading(false));
  }, [userId, token, lang]);

  // Close on ESC
  useEffect(() => {
    if (!userId) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [userId, onClose]);

  if (!userId) return null;

  const sendRequest = async () => {
    if (!token || !preview) return;
    setBusy(true);
    await fetch('/api/friends/request', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ targetUserId: preview.id }),
    }).catch(() => {});
    // Re-fetch the preview so we get the canonical state (e.g. pending_in → friends if auto-accepted)
    const r = await fetch(`/api/friends/preview/${preview.id}`, { headers: { Authorization: `Bearer ${token}` } });
    setPreview(await r.json());
    setBusy(false);
    onFriendshipChange?.();
  };

  const cancelRequest = async () => {
    if (!token || !preview?.requestId) return;
    setBusy(true);
    await fetch('/api/friends/cancel', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: preview.requestId }),
    }).catch(() => {});
    setPreview(prev => prev ? { ...prev, friendshipStatus: 'none', requestId: null } : prev);
    setBusy(false);
    onFriendshipChange?.();
  };

  const acceptRequest = async () => {
    if (!token || !preview?.requestId) return;
    setBusy(true);
    await fetch('/api/friends/accept', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ requestId: preview.requestId }),
    }).catch(() => {});
    setPreview(prev => prev ? { ...prev, friendshipStatus: 'friends' } : prev);
    setBusy(false);
    onFriendshipChange?.();
  };

  const removeFriend = async () => {
    if (!token || !preview) return;
    if (!confirm(lang === 'en' ? `Remove ${preview.name}?` : `Премахни ${preview.name}?`)) return;
    setBusy(true);
    await fetch('/api/friends/remove', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ friendUserId: preview.id }),
    }).catch(() => {});
    setPreview(prev => prev ? { ...prev, friendshipStatus: 'none', requestId: null } : prev);
    setBusy(false);
    onFriendshipChange?.();
  };

  const hatItem  = getCatalogItem(preview?.equippedHat);
  const faceItem = getCatalogItem(preview?.equippedFace);
  const bodyItem = getCatalogItem(preview?.equippedBody);
  const level = preview ? getLevel(preview.xp) : null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'rgba(5, 8, 20, 0.78)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, hsl(228, 28%, 14%) 0%, hsl(228, 32%, 10%) 100%)',
          border: '1px solid hsla(0, 0%, 100%, 0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center z-10"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))' }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        </button>

        {/* Body */}
        <div className="px-6 pt-7 pb-5 text-center">
          {loading && !preview ? (
            <div className="py-10">
              <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin mx-auto"
                style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
            </div>
          ) : error ? (
            <div className="py-10">
              <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>{error}</p>
            </div>
          ) : preview ? (
            <>
              {/* Octopus + name */}
              <div className="flex flex-col items-center mb-3">
                <OctopusAvatar size={104}
                  hatEmoji={hatItem?.emoji ?? null}
                  faceEmoji={faceItem?.emoji ?? null}
                  bodyEmoji={bodyItem?.emoji ?? null} />
                <h3 className="font-extrabold text-xl mt-3 flex items-center gap-1.5" style={{ color: 'hsl(var(--c-fg))' }}>
                  {preview.name}
                  {preview.isPro && (
                    <span className="text-[9px] font-black px-1.5 py-0.5 rounded"
                      style={{
                        background: 'hsl(var(--c-primary)/0.18)',
                        color: 'hsl(var(--c-primary))',
                        border: '1px solid hsl(var(--c-primary)/0.35)',
                      }}>
                      ✦ PRO
                    </span>
                  )}
                </h3>
                {level && (
                  <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    Lv.{level.level} · {level.label[lang]}
                  </p>
                )}
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <Stat label={lang === 'en' ? 'XP' : 'XP'} value={preview.xp.toLocaleString()} accent="var(--c-primary)" />
                <Stat label={lang === 'en' ? 'Streak' : 'Стрийк'} value={`🔥 ${preview.streak}`} accent="var(--c-orange)" />
                <Stat label={lang === 'en' ? 'Lessons' : 'Уроци'} value={String(preview.lessonsCompleted)} accent="var(--c-green)" />
              </div>

              {/* Shared friend streak */}
              {preview.friendshipStatus === 'friends' && (preview.friendStreak ?? 0) > 0 && (
                <div className="mb-4 rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 text-sm font-bold"
                  style={{ background: 'hsl(var(--c-orange)/0.12)', color: 'hsl(var(--c-orange))', border: '1px solid hsl(var(--c-orange)/0.3)' }}>
                  🤝🔥 {lang === 'en'
                    ? `${preview.friendStreak}-day friend streak`
                    : `${preview.friendStreak}-дневна приятелска серия`}
                </div>
              )}

              {/* Friendship action */}
              {preview.friendshipStatus === 'self' ? (
                <p className="text-xs italic" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? "That's you!" : 'Това си ти!'}
                </p>
              ) : preview.friendshipStatus === 'friends' ? (
                <div className="flex gap-2">
                  <div className="flex-1 rounded-full text-sm font-bold px-4 py-2.5 flex items-center justify-center gap-1.5"
                    style={{
                      background: 'hsl(var(--c-green)/0.15)',
                      color: 'hsl(var(--c-green))',
                      border: '1px solid hsl(var(--c-green)/0.3)',
                    }}>
                    ✓ {lang === 'en' ? 'Friends' : 'Приятели'}
                  </div>
                  <button onClick={removeFriend} disabled={busy}
                    className="rounded-full text-sm font-bold px-4 py-2.5"
                    style={{
                      background: 'hsl(var(--c-red)/0.12)',
                      color: 'hsl(var(--c-red))',
                      border: '1px solid hsl(var(--c-red)/0.3)',
                      opacity: busy ? 0.6 : 1,
                    }}>
                    {lang === 'en' ? 'Remove' : 'Премахни'}
                  </button>
                </div>
              ) : preview.friendshipStatus === 'pending_out' ? (
                <button onClick={cancelRequest} disabled={busy}
                  className="w-full rounded-full text-sm font-bold px-4 py-2.5"
                  style={{
                    background: 'rgba(255,255,255,0.08)',
                    color: 'hsl(var(--c-fg-muted))',
                    border: '1px solid rgba(255,255,255,0.12)',
                    opacity: busy ? 0.6 : 1,
                  }}>
                  {lang === 'en' ? 'Request sent — tap to cancel' : 'Заявка изпратена — натисни за отмяна'}
                </button>
              ) : preview.friendshipStatus === 'pending_in' ? (
                <button onClick={acceptRequest} disabled={busy}
                  className="w-full rounded-full text-sm font-extrabold px-4 py-2.5"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--c-green)), hsl(160, 60%, 40%))',
                    color: '#fff',
                    opacity: busy ? 0.6 : 1,
                  }}>
                  {lang === 'en' ? 'Accept friend request' : 'Приеми заявката'}
                </button>
              ) : (
                <button onClick={sendRequest} disabled={busy}
                  className="w-full rounded-full text-sm font-extrabold px-4 py-2.5"
                  style={{
                    background: 'hsl(var(--c-primary))',
                    color: '#fff',
                    opacity: busy ? 0.6 : 1,
                  }}>
                  + {lang === 'en' ? 'Add friend' : 'Добави приятел'}
                </button>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className="rounded-xl p-2"
      style={{ background: `linear-gradient(135deg, hsl(${accent}/0.12), transparent)`, border: `1px solid hsl(${accent}/0.22)` }}>
      <p className="text-base font-extrabold mono leading-tight" style={{ color: `hsl(${accent})` }}>{value}</p>
      <p className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
    </div>
  );
}
