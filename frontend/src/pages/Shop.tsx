import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';
import { OctopusAvatar } from '../components/OctopusAvatar';
import type { Rarity, Slot } from '../shared/catalogClient';
import { getCatalogItem } from '../shared/catalogClient';

interface ShopItem {
  id: string;
  name: { en: string; bg: string };
  emoji: string;
  slot: Slot;
  rarity: Rarity;
  price: number;
  description: { en: string; bg: string };
  owned: boolean;
  equipped: boolean;
}

function rarityColor(r: Rarity): string {
  switch (r) {
    case 'common': return 'hsl(220, 6%, 60%)';
    case 'rare': return 'hsl(220, 80%, 65%)';
    case 'epic': return 'hsl(280, 70%, 65%)';
    case 'legendary': return 'hsl(40, 95%, 60%)';
  }
}

function rarityLabel(r: Rarity, lang: 'en' | 'bg'): string {
  if (lang === 'en') return r;
  return ({ common: 'обикновено', rare: 'рядко', epic: 'епично', legendary: 'легендарно' } as const)[r];
}

export function Shop() {
  const { token, user, refreshUser } = useAuth();
  const { lang } = useLang();
  const [items, setItems] = useState<ShopItem[]>([]);
  const [coins, setCoins] = useState(0);
  const [equipped, setEquipped] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [slotFilter, setSlotFilter] = useState<Slot | 'all'>('all');
  const [exchangeXp, setExchangeXp] = useState<string>('100');
  const [exchangeBusy, setExchangeBusy] = useState(false);
  const [flash, setFlash] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/shop/catalog', { headers: { Authorization: `Bearer ${token}` } });
      const d = await r.json();
      setItems(d.items ?? []);
      setCoins(d.coins ?? 0);
      setEquipped(d.equippedCostume ?? null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  const buy = async (id: string) => {
    if (!token) return;
    const r = await fetch('/api/shop/buy', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    });
    const d = await r.json();
    if (!r.ok) {
      setFlash(d.error === 'insufficient_coins'
        ? (lang === 'en' ? 'Not enough coins.' : 'Нямаш достатъчно монети.')
        : (lang === 'en' ? 'Could not buy.' : 'Не успяхме да купим.'));
      setTimeout(() => setFlash(''), 2200);
      return;
    }
    setFlash(lang === 'en' ? '✓ Bought!' : '✓ Купено!');
    setTimeout(() => setFlash(''), 1600);
    await load();
    refreshUser().catch(() => {});
  };

  const equip = async (id: string | null) => {
    if (!token) return;
    await fetch('/api/shop/equip', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ itemId: id }),
    });
    setEquipped(id);
    setItems(prev => prev.map(it => ({ ...it, equipped: it.id === id })));
  };

  const exchange = async () => {
    if (!token) return;
    const amt = parseInt(exchangeXp, 10);
    if (!Number.isFinite(amt) || amt < 100) {
      setFlash(lang === 'en' ? 'Min 100 XP per exchange.' : 'Мин. 100 XP за обмен.');
      setTimeout(() => setFlash(''), 2000);
      return;
    }
    if (amt > (user?.xp ?? 0)) {
      setFlash(lang === 'en' ? 'Not enough XP.' : 'Нямаш достатъчно XP.');
      setTimeout(() => setFlash(''), 2000);
      return;
    }
    setExchangeBusy(true);
    try {
      const r = await fetch('/api/shop/exchange', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ xpAmount: amt }),
      });
      const d = await r.json();
      if (!r.ok) {
        setFlash(d.error ?? (lang === 'en' ? 'Could not exchange.' : 'Грешка.'));
        setTimeout(() => setFlash(''), 2000);
        return;
      }
      setFlash(lang === 'en' ? `✓ +${d.coinsGained} coins!` : `✓ +${d.coinsGained} монети!`);
      setTimeout(() => setFlash(''), 1800);
      setCoins(d.coins);
      refreshUser().catch(() => {});
    } finally {
      setExchangeBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }

  const visibleItems = slotFilter === 'all' ? items : items.filter(i => i.slot === slotFilter);
  const equippedItem = getCatalogItem(equipped);

  return (
    <div className="relative pb-24 sm:pb-12 overflow-hidden">
      <div className="md:hidden"><FloatingOrbs /></div>

      <div className="relative max-w-md md:max-w-3xl mx-auto px-4 sm:px-6 md:px-0 py-2 sm:py-4 md:py-2" style={{ zIndex: 1 }}>
        {/* Header */}
        <div className="mb-5 text-center md:text-left animate-fade-up">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            🛍️ {lang === 'en' ? 'Octopus Boutique' : 'Бутик Октопод'}
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Dress your octopus. Show off on your profile.'
              : 'Облечи октопода. Покажи се на профила.'}
          </p>
        </div>

        {/* Preview card with octopus + coin balance + XP exchanger */}
        <div className="rounded-3xl p-4 mb-5 grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 items-center"
          style={{ background: 'linear-gradient(135deg, hsl(228, 30%, 12%), hsl(228, 32%, 8%))', border: '1px solid hsl(var(--c-primary)/0.2)' }}>
          <div className="flex flex-col items-center">
            <OctopusAvatar size={140}
              equipped={equipped ?? null}
              itemEmoji={equippedItem?.emoji ?? null}
              itemSlot={equippedItem?.slot ?? null} />
            <p className="text-xs mt-2 font-bold mono" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {user?.name ?? 'You'}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl px-4 py-2.5"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsla(0,0%,100%,0.06)' }}>
              <div>
                <p className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {lang === 'en' ? 'Wallet' : 'Портфейл'}
                </p>
                <p className="font-extrabold text-2xl" style={{ color: 'hsl(var(--c-orange))' }}>
                  🪙 {coins.toLocaleString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  XP
                </p>
                <p className="font-extrabold text-2xl" style={{ color: 'hsl(var(--c-primary))' }}>
                  ✨ {(user?.xp ?? 0).toLocaleString()}
                </p>
              </div>
            </div>

            {/* XP → coins exchanger */}
            <div className="rounded-xl px-4 py-3"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid hsla(0,0%,100%,0.06)' }}>
              <p className="text-xs font-bold mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                {lang === 'en' ? 'Trade XP for coins (2 XP = 1 🪙, min 100 XP)' : 'Обмени XP за монети (2 XP = 1 🪙, мин 100)'}
              </p>
              <div className="flex gap-2">
                <input
                  type="number" min={100} step={50}
                  value={exchangeXp}
                  onChange={e => setExchangeXp(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg text-sm font-semibold outline-none"
                  style={{
                    background: 'hsl(228, 14%, 14%)',
                    border: '1px solid hsla(0,0%,100%,0.08)',
                    color: 'hsl(var(--c-fg))',
                  }} />
                <button onClick={exchange} disabled={exchangeBusy}
                  className="rounded-lg font-bold text-sm px-4 py-2"
                  style={{
                    background: 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 55%))',
                    color: '#1a1f2e',
                    opacity: exchangeBusy ? 0.6 : 1,
                  }}>
                  → 🪙 {Math.floor(Math.max(100, Number(exchangeXp) || 0) / 2)}
                </button>
              </div>
            </div>
          </div>
        </div>

        {flash && (
          <div className="rounded-xl px-4 py-2 mb-3 text-sm font-bold text-center animate-fade-in"
            style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))', border: '1px solid hsl(var(--c-primary)/0.3)' }}>
            {flash}
          </div>
        )}

        {/* Slot filter */}
        <div className="flex gap-2 mb-3 overflow-x-auto -mx-1 px-1">
          {(['all', 'hat', 'face', 'body'] as const).map(s => {
            const active = slotFilter === s;
            const labels = {
              all:  lang === 'en' ? 'All'   : 'Всички',
              hat:  lang === 'en' ? 'Hats'  : 'Шапки',
              face: lang === 'en' ? 'Face'  : 'Лице',
              body: lang === 'en' ? 'Body'  : 'Тяло',
            };
            return (
              <button key={s} onClick={() => setSlotFilter(s)}
                className="text-xs font-bold px-3 py-1.5 rounded-full whitespace-nowrap"
                style={{
                  background: active ? 'hsl(var(--c-primary))' : 'var(--c-glass)',
                  color: active ? '#fff' : 'hsl(var(--c-fg-muted))',
                  border: `1px solid ${active ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                }}>
                {labels[s]}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {visibleItems.map(item => (
            <div key={item.id} className="rounded-2xl p-3 flex flex-col items-center text-center"
              style={{
                background: `linear-gradient(180deg, ${rarityColor(item.rarity)}10, transparent)`,
                border: `1.5px solid ${rarityColor(item.rarity)}`,
                boxShadow: item.rarity === 'legendary' ? `0 0 18px ${rarityColor(item.rarity)}55` : 'none',
              }}>
              <p className="text-[10px] uppercase tracking-wider font-bold mb-1" style={{ color: rarityColor(item.rarity) }}>
                {rarityLabel(item.rarity, lang)}
              </p>
              <div className="text-5xl mb-1">{item.emoji}</div>
              <p className="text-sm font-extrabold leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>
                {item.name[lang]}
              </p>
              <p className="text-[10px] leading-snug mt-0.5 mb-2 line-clamp-2 min-h-[26px]" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {item.description[lang]}
              </p>
              {item.owned ? (
                item.equipped ? (
                  <button onClick={() => equip(null)}
                    className="w-full rounded-lg font-bold text-xs py-1.5"
                    style={{ background: 'hsl(var(--c-green)/0.15)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.4)' }}>
                    ✓ {lang === 'en' ? 'Equipped' : 'Носи се'}
                  </button>
                ) : (
                  <button onClick={() => equip(item.id)}
                    className="w-full rounded-lg font-bold text-xs py-1.5"
                    style={{ background: 'hsl(var(--c-primary))', color: '#fff' }}>
                    {lang === 'en' ? 'Equip' : 'Сложи'}
                  </button>
                )
              ) : (
                <button onClick={() => buy(item.id)}
                  disabled={coins < item.price}
                  className="w-full rounded-lg font-bold text-xs py-1.5"
                  style={{
                    background: coins >= item.price
                      ? 'linear-gradient(135deg, hsl(45, 95%, 55%), hsl(35, 90%, 55%))'
                      : 'rgba(255,255,255,0.06)',
                    color: coins >= item.price ? '#1a1f2e' : 'hsl(var(--c-fg-subtle))',
                  }}>
                  🪙 {item.price}
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
