import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';

interface MarketAsset {
  id: string; symbol: string; name: string; emoji: string;
  category: string; price: number; changePct: number; spark?: number[];
}
interface Holding {
  assetId: string; symbol: string; name: string; emoji: string;
  shares: number; avgCost: number; price: number; value: number; plPct: number;
}
interface PortfolioData {
  cash: number; startingCash: number; holdingsValue: number; totalValue: number;
  totalReturnPct: number; holdings: Holding[]; market: MarketAsset[];
}

const eur = (n: number) => '€' + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pctColor = (p: number) => (p > 0 ? 'hsl(var(--c-green))' : p < 0 ? 'hsl(var(--c-red))' : 'hsl(var(--c-fg-muted))');
const pctText = (p: number) => (p > 0 ? '+' : '') + p.toFixed(2) + '%';

/** Tiny price-history line chart. Green when the series ends up, red when down. */
function Sparkline({ data, width = 66, height = 26 }: { data?: number[]; width?: number; height?: number }) {
  if (!data || data.length < 2) return <div style={{ width, height }} />;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stroke = data[data.length - 1] >= data[0] ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))';
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * width},${(height - 2) - ((v - min) / range) * (height - 4) + 2}`)
    .join(' ');
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" style={{ flexShrink: 0 }}>
      <polyline points={pts} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

export function Portfolio() {
  const { token } = useAuth();
  const { lang } = useLang();
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trade, setTrade] = useState<{ asset: MarketAsset; side: 'buy' | 'sell'; held: number } | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const r = await fetch('/api/portfolio', { headers: { Authorization: `Bearer ${token}` } });
      setData(await r.json());
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 rounded-full border-2 border-t-transparent animate-spin"
          style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }} />
      </div>
    );
  }
  if (!data) return null;

  const heldByAsset = new Map(data.holdings.map((h) => [h.assetId, h.shares]));
  const sparkByAsset = new Map(data.market.map((m) => [m.id, m.spark]));
  const up = data.totalReturnPct >= 0;

  return (
    <div className="w-full max-w-3xl mx-auto pb-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-3xl">📈</div>
        <div>
          <h1 className="font-black text-xl" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en' ? 'Portfolio Simulator' : 'Симулатор на портфейл'}
          </h1>
          <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Practice investing with €10,000 play money' : 'Тренирай инвестиране с €10,000 виртуални пари'}
          </p>
        </div>
      </div>

      {/* Summary */}
      <div className="rounded-2xl p-5 mb-5"
        style={{ background: `linear-gradient(135deg, ${up ? 'hsl(var(--c-green)/0.14)' : 'hsl(var(--c-red)/0.14)'}, hsl(var(--c-primary)/0.08))`, border: '1px solid hsl(var(--c-primary)/0.25)' }}>
        <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Total value' : 'Обща стойност'}
        </p>
        <p className="text-3xl font-black" style={{ color: 'hsl(var(--c-fg))' }}>{eur(data.totalValue)}</p>
        <div className="flex items-center gap-3 mt-2 text-sm font-semibold">
          <span style={{ color: pctColor(data.totalReturnPct) }}>
            {up ? '▲' : '▼'} {pctText(data.totalReturnPct)} {lang === 'en' ? 'all-time' : 'общо'}
          </span>
          <span style={{ color: 'hsl(var(--c-fg-muted))' }}>· {lang === 'en' ? 'Cash' : 'Кеш'}: {eur(data.cash)}</span>
        </div>
      </div>

      {/* Holdings */}
      {data.holdings.length > 0 && (
        <div className="mb-6">
          <h2 className="text-sm font-bold uppercase tracking-wide mb-2 px-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Your holdings' : 'Твоите активи'}
          </h2>
          <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--c-border)' }}>
            {data.holdings.map((h, i) => (
              <button key={h.assetId}
                onClick={() => setTrade({ asset: data.market.find((m) => m.id === h.assetId)!, side: 'sell', held: h.shares })}
                className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                style={{ background: 'var(--c-glass)', borderTop: i ? '1px solid var(--c-border)' : 'none' }}>
                <span className="text-2xl">{h.emoji}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold" style={{ color: 'hsl(var(--c-fg))' }}>{h.symbol}</p>
                  <p className="text-[11px] mono" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                    {h.shares} @ {eur(h.avgCost)}
                  </p>
                </div>
                <Sparkline data={sparkByAsset.get(h.assetId)} />
                <div className="text-right w-20">
                  <p className="text-sm font-bold" style={{ color: 'hsl(var(--c-fg))' }}>{eur(h.value)}</p>
                  <p className="text-[11px] mono font-semibold" style={{ color: pctColor(h.plPct) }}>{pctText(h.plPct)}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Market */}
      <h2 className="text-sm font-bold uppercase tracking-wide mb-2 px-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Market' : 'Пазар'}
      </h2>
      <div className="grid grid-cols-2 gap-2.5">
        {data.market.map((m) => {
          const held = heldByAsset.get(m.id) ?? 0;
          return (
            <button key={m.id}
              onClick={() => setTrade({ asset: m, side: 'buy', held })}
              className="rounded-2xl p-3 text-left transition-all hover:brightness-110"
              style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-xl">{m.emoji}</span>
                <div className="min-w-0">
                  <p className="text-sm font-bold leading-tight" style={{ color: 'hsl(var(--c-fg))' }}>{m.symbol}</p>
                  <p className="text-[10px] truncate" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{m.name}</p>
                </div>
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-sm font-bold mono" style={{ color: 'hsl(var(--c-fg))' }}>{eur(m.price)}</p>
                  <p className="text-[11px] mono font-semibold" style={{ color: pctColor(m.changePct) }}>{pctText(m.changePct)}</p>
                </div>
                <Sparkline data={m.spark} width={76} height={30} />
              </div>
              {held > 0 && (
                <p className="text-[10px] mt-1" style={{ color: 'hsl(var(--c-primary))' }}>
                  {lang === 'en' ? `Holding ${held}` : `Държиш ${held}`}
                </p>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-[10px] text-center mt-5" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en'
          ? 'Simulated market for learning only — prices are not real and update daily.'
          : 'Симулиран пазар само за обучение — цените не са реални и се обновяват дневно.'}
      </p>

      {trade && (
        <TradeModal
          asset={trade.asset}
          side={trade.side}
          held={trade.held}
          cash={data.cash}
          onClose={() => setTrade(null)}
          onDone={() => { setTrade(null); load(); }}
        />
      )}
    </div>
  );
}

function TradeModal({ asset, side: initialSide, held, cash, onClose, onDone }: {
  asset: MarketAsset; side: 'buy' | 'sell'; held: number; cash: number;
  onClose: () => void; onDone: () => void;
}) {
  const { token } = useAuth();
  const { lang } = useLang();
  const [side, setSide] = useState<'buy' | 'sell'>(initialSide);
  const [qtyStr, setQtyStr] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const qty = parseFloat(qtyStr) || 0;
  const amount = qty * asset.price;
  const maxBuy = Math.floor((cash / asset.price) * 10000) / 10000;
  const canAfford = side === 'buy' ? amount <= cash + 1e-6 : qty <= held + 1e-6;
  const valid = qty > 0 && canAfford;

  const submit = async () => {
    if (!valid || !token || busy) return;
    setBusy(true); setError('');
    try {
      const r = await fetch('/api/portfolio/trade', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ assetId: asset.id, side, shares: qty }),
      });
      const d = await r.json();
      if (!r.ok) {
        setError(
          d.error === 'insufficient_funds' ? (lang === 'en' ? 'Not enough cash.' : 'Няма достатъчно кеш.')
          : d.error === 'insufficient_shares' ? (lang === 'en' ? "You don't hold that many." : 'Нямаш толкова.')
          : (lang === 'en' ? 'Trade failed.' : 'Сделката се провали.')
        );
        setBusy(false);
        return;
      }
      onDone();
    } catch {
      setError(lang === 'en' ? 'Network error.' : 'Мрежова грешка.');
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 animate-fade-in"
      style={{ background: 'hsla(220,60%,5%,0.75)', backdropFilter: 'blur(8px)' }} onClick={onClose}>
      <div className="relative max-w-sm w-full rounded-3xl p-6 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
        style={{ background: 'hsl(228, 24%, 11%)', border: '1px solid var(--c-border)' }}>
        <button onClick={onClose} aria-label="Close"
          className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center"
          style={{ background: 'rgba(255,255,255,0.06)', color: 'hsl(var(--c-fg-muted))' }}>✕</button>

        <div className="flex items-center gap-3 mb-4">
          <span className="text-3xl">{asset.emoji}</span>
          <div>
            <p className="font-black text-lg" style={{ color: 'hsl(var(--c-fg))' }}>{asset.symbol}</p>
            <p className="text-xs mono" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {eur(asset.price)} · <span style={{ color: pctColor(asset.changePct) }}>{pctText(asset.changePct)}</span>
            </p>
          </div>
        </div>

        {/* Buy/Sell toggle */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          {(['buy', 'sell'] as const).map((s) => (
            <button key={s} onClick={() => { setSide(s); setError(''); }}
              disabled={s === 'sell' && held <= 0}
              className="rounded-xl py-2 text-sm font-bold transition-all disabled:opacity-40"
              style={side === s
                ? { background: s === 'buy' ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))', color: '#fff' }
                : { background: 'var(--c-glass)', color: 'hsl(var(--c-fg-muted))', border: '1px solid var(--c-border)' }}>
              {s === 'buy' ? (lang === 'en' ? 'Buy' : 'Купи') : (lang === 'en' ? 'Sell' : 'Продай')}
            </button>
          ))}
        </div>

        {/* Quantity */}
        <div className="flex items-center gap-2 mb-2">
          <input type="text" inputMode="decimal" className="input-field flex-1"
            placeholder={lang === 'en' ? 'Shares' : 'Дялове'}
            value={qtyStr} onChange={(e) => setQtyStr(e.target.value.replace(/[^0-9.]/g, ''))} />
          <button className="text-xs font-bold px-3 py-2 rounded-lg"
            style={{ background: 'hsl(var(--c-primary)/0.15)', color: 'hsl(var(--c-primary))' }}
            onClick={() => setQtyStr(String(side === 'buy' ? maxBuy : held))}>
            MAX
          </button>
        </div>
        <p className="text-xs mb-4" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {side === 'buy'
            ? (lang === 'en' ? `Cost: ${eur(amount)} · Cash: ${eur(cash)}` : `Цена: ${eur(amount)} · Кеш: ${eur(cash)}`)
            : (lang === 'en' ? `Proceeds: ${eur(amount)} · You hold ${held}` : `Получаваш: ${eur(amount)} · Държиш ${held}`)}
        </p>

        {error && <p className="text-xs text-center mb-3" style={{ color: 'hsl(var(--c-red))' }}>{error}</p>}

        <button className="btn-primary w-full" disabled={!valid || busy}
          style={side === 'sell' ? { background: 'hsl(var(--c-red))' } : undefined}
          onClick={submit}>
          {busy ? '…' : side === 'buy'
            ? (lang === 'en' ? `Buy ${qty || ''}` : `Купи ${qty || ''}`)
            : (lang === 'en' ? `Sell ${qty || ''}` : `Продай ${qty || ''}`)}
        </button>
      </div>
    </div>
  );
}
