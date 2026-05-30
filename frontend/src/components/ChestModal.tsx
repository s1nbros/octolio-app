/**
 * Chest opening modal with CS:GO-style horizontal reel spin.
 *
 * Flow:
 *  1. User clicks "Open chest" → we call POST /api/chests/open which returns
 *     the actual reward.
 *  2. We build a long reel of decoy + real items, position the winning tile
 *     near the end, then animate translateX with a deceleration cubic-bezier
 *     so it lands under the centered pointer.
 *  3. After ~5s we reveal the prize card.
 */
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { ALL_REWARD_TILES } from '../shared/catalogClient';
import { CoinIcon } from './CoinIcon';
import { ChestIcon } from './ChestIcon';

type RewardType = 'xp' | 'coins' | 'freeze' | 'energy' | 'item';
interface OpenResponse {
  reward: { type: RewardType; amount?: number; itemId?: string };
  item: { id: string; name: { en: string; bg: string }; emoji: string; rarity: string; slot: string } | null;
  coinsDelta: number;
  xpDelta: number;
}

const TILE_W = 100;          // px
const TILE_GAP = 6;
const REEL_TILE_COUNT = 60;
const WINNING_INDEX = 52;     // late tile so the reel really scrolls

interface Props {
  /** When non-null the modal is shown for that specific chest position.
   *  The caller passes null to dismiss. */
  target: { moduleId: string; position: 'mid' | 'end' } | null;
  onClose: () => void;
  /** Optional callback fired after a successful open so the parent can refresh. */
  onOpened?: () => void;
}

function rarityColor(r: string): string {
  switch (r) {
    case 'common': return 'hsl(220, 6%, 60%)';
    case 'rare': return 'hsl(220, 80%, 65%)';
    case 'epic': return 'hsl(280, 70%, 65%)';
    case 'legendary': return 'hsl(40, 95%, 60%)';
    default: return 'hsl(var(--c-fg-muted))';
  }
}

function rarityLabel(r: string, lang: 'en' | 'bg'): string {
  if (lang === 'en') return r;
  const map: Record<string, string> = {
    common: 'обикновено', rare: 'рядко', epic: 'епично', legendary: 'легендарно',
  };
  return map[r] ?? r;
}

interface ReelTile {
  id: string;
  emoji: string;
  label: string;
  rarity: string;
}

function buildReelTiles(winning: ReelTile, lang: 'en' | 'bg'): ReelTile[] {
  const pool = ALL_REWARD_TILES(lang);
  const out: ReelTile[] = [];
  for (let i = 0; i < REEL_TILE_COUNT; i++) {
    if (i === WINNING_INDEX) {
      out.push(winning);
    } else {
      out.push(pool[Math.floor(Math.random() * pool.length)]);
    }
  }
  return out;
}

function xpRarity(amount: number): string {
  if (amount >= 1000) return 'legendary';
  if (amount >= 500) return 'epic';
  if (amount >= 200) return 'rare';
  return 'common';
}

function rewardToTile(
  reward: OpenResponse['reward'],
  item: OpenResponse['item'],
  lang: 'en' | 'bg',
): ReelTile {
  if (reward.type === 'xp')    return { id: `xp-${reward.amount}`, emoji: '✨', label: `${reward.amount} XP`, rarity: xpRarity(reward.amount!) };
  // Legacy reward shapes (kept for backward compat with older chest_opens rows).
  if (reward.type === 'coins') return { id: `coins-${reward.amount}`, emoji: '🪙', label: `${reward.amount}`, rarity: 'rare' };
  if (reward.type === 'freeze')return { id: `freeze`, emoji: '🧊', label: lang === 'en' ? 'Streak freeze' : 'Замразяване', rarity: 'epic' };
  if (reward.type === 'energy')return { id: `energy`, emoji: '⚡', label: lang === 'en' ? 'Energy +3' : 'Енергия +3', rarity: 'rare' };
  if (item) return { id: item.id, emoji: item.emoji, label: item.name[lang], rarity: item.rarity };
  return { id: 'unknown', emoji: '❓', label: '?', rarity: 'common' };
}

export function ChestModal({ target, onClose, onOpened }: Props) {
  const open = target !== null;
  const { token, refreshUser } = useAuth();
  const { lang } = useLang();

  // 'idle' → 'spinning' → 'revealed'
  const [phase, setPhase] = useState<'idle' | 'spinning' | 'revealed' | 'error'>('idle');
  const [tiles, setTiles] = useState<ReelTile[]>([]);
  const [winningTile, setWinningTile] = useState<ReelTile | null>(null);
  const [resp, setResp] = useState<OpenResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const reelRef = useRef<HTMLDivElement>(null);

  // Reset whenever the modal is reopened
  useEffect(() => {
    if (open) {
      setPhase('idle');
      setTiles([]);
      setWinningTile(null);
      setResp(null);
      setErrorMsg('');
    }
  }, [open]);

  // ESC closes only when not mid-spin
  useEffect(() => {
    if (!open || phase === 'spinning') return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, phase, onClose]);

  if (!open) return null;

  const startSpin = async () => {
    if (!token || !target) return;
    try {
      const r = await fetch('/api/chests/open', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ moduleId: target.moduleId, position: target.position }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        setErrorMsg(d.message ?? d.error ?? (lang === 'en' ? 'Could not open chest.' : 'Не успяхме да отворим сандъка.'));
        setPhase('error');
        return;
      }
      const data = await r.json() as OpenResponse;
      const win = rewardToTile(data.reward, data.item, lang);
      const newTiles = buildReelTiles(win, lang);
      setTiles(newTiles);
      setWinningTile(win);
      setResp(data);
      setPhase('spinning');

      // The reel scrolls left by (winningIndex * tileW) − offsetToCenter.
      // We add a small jitter so we don't always land dead center.
      const jitter = (Math.random() - 0.5) * (TILE_W * 0.4);
      const endPx = -(WINNING_INDEX * (TILE_W + TILE_GAP) - (300 - TILE_W / 2) + jitter);
      // 300 here = roughly half of modal width (600) so the winning tile centers under the pointer.
      if (reelRef.current) {
        reelRef.current.style.setProperty('--reel-end', `${endPx}px`);
      }

      // Reveal after the reel finishes
      setTimeout(() => {
        setPhase('revealed');
        refreshUser().catch(() => {});
        if (onOpened) onOpened();
      }, 5200);
    } catch {
      setErrorMsg(lang === 'en' ? 'Network error.' : 'Мрежова грешка.');
      setPhase('error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'rgba(5, 8, 20, 0.85)', backdropFilter: 'blur(6px)' }}
      onClick={() => { if (phase !== 'spinning') onClose(); }}
    >
      <div
        className="relative w-full max-w-2xl rounded-3xl overflow-hidden animate-scale-in"
        style={{
          background: 'linear-gradient(180deg, hsl(228, 28%, 14%) 0%, hsl(228, 32%, 10%) 100%)',
          border: '1px solid hsla(0, 0%, 100%, 0.1)',
          boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close (top-right) */}
        {phase !== 'spinning' && (
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center z-10"
            style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))' }}
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
            </svg>
          </button>
        )}

        {/* ─── IDLE: chest art + open button ─── */}
        {phase === 'idle' && (
          <div className="text-center py-12 px-6">
            <div className="mb-3 flex justify-center animate-bounce-soft">
              <ChestIcon size={96} status="available" />
            </div>
            <h2 className="text-2xl font-extrabold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'Mystery Chest' : 'Мистериозен сандък'}
            </h2>
            <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {lang === 'en'
                ? 'Could be coins, XP, a streak freeze, energy, or a cosmetic for your octopus. Spin to find out.'
                : 'Може да са монети, XP, замразяване, енергия или костюм за октопода. Завърти, за да разбереш.'}
            </p>
            <button
              onClick={startSpin}
              className="btn-primary px-8 py-3 text-base font-extrabold animate-pulse-soft"
              style={{ background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 55%))', color: '#1a1f2e' }}
            >
              {lang === 'en' ? '🎰 Open chest' : '🎰 Отвори сандъка'}
            </button>
          </div>
        )}

        {/* ─── SPINNING / REVEALED: reel ─── */}
        {(phase === 'spinning' || phase === 'revealed') && (
          <div className="pt-10 pb-6">
            <h3 className="text-center font-bold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
              {phase === 'spinning'
                ? (lang === 'en' ? 'Spinning…' : 'Върти се…')
                : (lang === 'en' ? 'You won!' : 'Спечели!')}
            </h3>

            {/* Reel viewport */}
            <div className="relative h-32 mx-4 rounded-xl overflow-hidden"
              style={{
                background: 'linear-gradient(180deg, hsl(228, 25%, 8%), hsl(228, 32%, 14%))',
                border: '1px solid hsla(0,0%,100%,0.06)',
                boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)',
              }}>
              {/* Center pointer */}
              <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                style={{
                  width: 4,
                  background: 'linear-gradient(180deg, hsl(45, 95%, 60%) 0%, hsl(35, 90%, 50%) 100%)',
                  boxShadow: '0 0 16px hsl(45, 95%, 60%)',
                }} />
              <div className="absolute top-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderTop: '10px solid hsl(45, 95%, 60%)' }} />
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 z-20 pointer-events-none"
                style={{ width: 0, height: 0, borderLeft: '8px solid transparent', borderRight: '8px solid transparent', borderBottom: '10px solid hsl(45, 95%, 60%)' }} />

              {/* Fade edges */}
              <div className="absolute inset-y-0 left-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to right, hsl(228, 25%, 8%), transparent)' }} />
              <div className="absolute inset-y-0 right-0 w-16 z-10 pointer-events-none"
                style={{ background: 'linear-gradient(to left, hsl(228, 25%, 8%), transparent)' }} />

              {/* Tiles strip */}
              <div
                ref={reelRef}
                className="flex h-full items-center px-2 will-change-transform"
                style={{
                  gap: `${TILE_GAP}px`,
                  // The animation has `forwards`, so it stays at the final
                  // translateX after spinning ends — no manual transform needed.
                  animation: (phase === 'spinning' || phase === 'revealed')
                    ? 'reel-scroll 5s cubic-bezier(0.05, 0.7, 0.15, 1) forwards'
                    : 'none',
                }}
              >
                {tiles.map((t, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-lg flex flex-col items-center justify-center"
                    style={{
                      width: TILE_W,
                      height: 100,
                      background: `linear-gradient(180deg, ${rarityColor(t.rarity)}22 0%, ${rarityColor(t.rarity)}44 100%)`,
                      border: `2px solid ${rarityColor(t.rarity)}`,
                      boxShadow: t.rarity === 'legendary' ? `0 0 14px ${rarityColor(t.rarity)}` : 'none',
                    }}
                  >
                    <div className="text-3xl mb-0.5 flex items-center justify-center" style={{ minHeight: 30 }}>
                      {t.id.startsWith('coins-') ? <CoinIcon size={28} /> : t.emoji}
                    </div>
                    <div className="text-[10px] text-center px-1 leading-tight font-bold" style={{ color: '#fff' }}>
                      {t.label.length > 14 ? t.label.slice(0, 14) + '…' : t.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Prize reveal card */}
            {phase === 'revealed' && winningTile && resp && (
              <div className="mt-5 mx-6 animate-prize-reveal text-center">
                <p className="text-xs uppercase tracking-wider mb-2" style={{ color: rarityColor(winningTile.rarity) }}>
                  {rarityLabel(winningTile.rarity, lang)}
                </p>
                <div className="mb-1 flex justify-center" style={{ fontSize: 48, lineHeight: 1 }}>
                  {resp.reward.type === 'coins' ? <CoinIcon size={48} /> : winningTile.emoji}
                </div>
                <p className="text-lg font-extrabold mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
                  {winningTile.label}
                </p>
                {resp.coinsDelta > 0 && (
                  <p className="text-sm flex items-center justify-center gap-1.5" style={{ color: 'hsl(var(--c-orange))' }}>
                    +{resp.coinsDelta} <CoinIcon size={14} /> {lang === 'en' ? 'added to your wallet' : 'добавени в портфейла'}
                  </p>
                )}
                {resp.xpDelta > 0 && (
                  <p className="text-sm" style={{ color: 'hsl(var(--c-primary))' }}>
                    +{resp.xpDelta} XP
                  </p>
                )}
                {resp.reward.type === 'item' && (
                  <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {lang === 'en' ? 'Added to your inventory.' : 'Добавено в инвентара.'}
                  </p>
                )}

                <div className="flex gap-2 mt-5 justify-center">
                  <button onClick={onClose}
                    className="rounded-full font-bold text-sm px-5 py-2"
                    style={{ background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 55%))', color: '#1a1f2e' }}>
                    {lang === 'en' ? 'Continue →' : 'Продължи →'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {phase === 'error' && (
          <div className="text-center py-12 px-6">
            <div className="text-6xl mb-3">😅</div>
            <p className="text-base font-bold mb-4" style={{ color: 'hsl(var(--c-fg))' }}>{errorMsg}</p>
            <button onClick={onClose}
              className="rounded-full font-bold text-sm px-5 py-2"
              style={{ background: 'rgba(255,255,255,0.08)', color: 'hsl(var(--c-fg))' }}>
              {lang === 'en' ? 'OK' : 'Добре'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

