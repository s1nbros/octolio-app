import { useState, useMemo, useEffect } from 'react';
import { useLang } from '../contexts/LanguageContext';
import { FloatingOrbs } from '../components/FloatingOrbs';

type ToolId = 'compound' | 'mortgage' | 'debt' | 'fire' | 'goal' | 'networth';

const NET_WORTH_KEY = 'octolio_net_worth_v1';

// ─── Helpers ────────────────────────────────────────────────────────────
function fmtEur(v: number): string {
  if (!isFinite(v)) return '—';
  return '€' + Math.round(v).toLocaleString();
}
function fmtPct(v: number): string {
  if (!isFinite(v)) return '—';
  return v.toFixed(2) + '%';
}

// ─── Sparkline (reusable) ───────────────────────────────────────────────
function Sparkline({ points, color = 'hsl(var(--c-green))' }: { points: number[]; color?: string }) {
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const W = 100;
  const H = 40;
  const path = points.map((v, i) => {
    const x = (i / (points.length - 1)) * W;
    const y = H - ((v - min) / range) * (H - 4) - 2;
    return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
  }).join(' ');
  const areaPath = path + ` L${W} ${H} L0 ${H} Z`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="60" className="block">
      <defs>
        <linearGradient id="sparkGradTools" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#sparkGradTools)" />
      <path d={path} fill="none" stroke={color} strokeWidth="0.8" strokeLinecap="round" />
    </svg>
  );
}

// ─── Slider Field ───────────────────────────────────────────────────────
function Slider({
  label, value, setValue, min, max, step, unit, color = 'hsl(var(--c-primary))',
}: {
  label: string; value: number; setValue: (n: number) => void;
  min: number; max: number; step: number; unit: string; color?: string;
}) {
  return (
    <div className="mb-3">
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium" style={{ color: 'hsl(var(--c-fg))' }}>{label}</span>
        <span className="text-sm font-bold mono" style={{ color }}>
          {unit.startsWith('€') ? `€${value.toLocaleString()}` : `${value} ${unit}`}
        </span>
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => setValue(Number(e.target.value))}
        style={{ accentColor: color, width: '100%' }} />
    </div>
  );
}

// ─── Compound Interest Calculator ───────────────────────────────────────
function CompoundCalculator() {
  const { lang } = useLang();
  const [principal, setPrincipal] = useState(1000);
  const [monthly, setMonthly] = useState(200);
  const [rate, setRate] = useState(7);
  const [years, setYears] = useState(20);

  const { final, contrib, growth, series } = useMemo(() => {
    const r = rate / 100 / 12;
    const n = years * 12;
    const series: number[] = [];
    for (let y = 0; y <= years; y++) {
      const months = y * 12;
      const fvP = principal * Math.pow(1 + r, months);
      const fvM = r === 0 ? monthly * months : monthly * ((Math.pow(1 + r, months) - 1) / r);
      series.push(fvP + fvM);
    }
    const final = series[series.length - 1];
    const contrib = principal + monthly * n;
    return { final, contrib, growth: final - contrib, series };
  }, [principal, monthly, rate, years]);

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'See how a starting amount + monthly contributions grow with compound interest.'
          : 'Виж как начална сума + месечни вноски растат със сложна лихва.'}
      </p>
      <Slider label={lang === 'en' ? 'Starting amount' : 'Начална сума'} value={principal} setValue={setPrincipal} min={0} max={100000} step={500} unit="€" />
      <Slider label={lang === 'en' ? 'Monthly contribution' : 'Месечна вноска'} value={monthly} setValue={setMonthly} min={0} max={3000} step={50} unit="€/mo" color="hsl(var(--c-green))" />
      <Slider label={lang === 'en' ? 'Annual return' : 'Годишна доходност'} value={rate} setValue={setRate} min={0} max={15} step={0.5} unit="%" color="hsl(var(--c-purple))" />
      <Slider label={lang === 'en' ? 'Years' : 'Години'} value={years} setValue={setYears} min={1} max={50} step={1} unit={lang === 'en' ? 'yr' : 'г.'} color="hsl(var(--c-orange))" />

      <div className="rounded-2xl p-3 my-4" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <Sparkline points={series} />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat label={lang === 'en' ? 'You invest' : 'Внасяш'} value={fmtEur(contrib)} color="hsl(var(--c-fg-muted))" />
        <Stat label={lang === 'en' ? 'Market adds' : 'Пазарът дава'} value={fmtEur(growth)} color="hsl(var(--c-purple))" />
        <Stat label={lang === 'en' ? 'Final' : 'Крайна стойност'} value={fmtEur(final)} color="hsl(var(--c-green))" />
      </div>
    </div>
  );
}

// ─── Mortgage Calculator ────────────────────────────────────────────────
function MortgageCalculator() {
  const { lang } = useLang();
  const [price, setPrice] = useState(250000);
  const [downPct, setDownPct] = useState(20);
  const [rate, setRate] = useState(4.5);
  const [years, setYears] = useState(30);

  const { monthly, total, interest, principal } = useMemo(() => {
    const principal = price * (1 - downPct / 100);
    const r = rate / 100 / 12;
    const n = years * 12;
    const monthly = r === 0 ? principal / n : (principal * r) / (1 - Math.pow(1 + r, -n));
    const total = monthly * n;
    return { monthly, total, interest: total - principal, principal };
  }, [price, downPct, rate, years]);

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Estimate monthly payment + total interest for a fixed-rate mortgage.'
          : 'Оцени месечната вноска и общата лихва за фиксирана ипотека.'}
      </p>
      <Slider label={lang === 'en' ? 'Home price' : 'Цена на имота'} value={price} setValue={setPrice} min={50000} max={1000000} step={5000} unit="€" />
      <Slider label={lang === 'en' ? 'Down payment %' : 'Първа вноска %'} value={downPct} setValue={setDownPct} min={0} max={50} step={1} unit="%" color="hsl(var(--c-green))" />
      <Slider label={lang === 'en' ? 'Interest rate' : 'Лихвен процент'} value={rate} setValue={setRate} min={1} max={12} step={0.1} unit="%" color="hsl(var(--c-purple))" />
      <Slider label={lang === 'en' ? 'Loan term' : 'Срок на заема'} value={years} setValue={setYears} min={5} max={40} step={1} unit={lang === 'en' ? 'yr' : 'г.'} color="hsl(var(--c-orange))" />

      <div className="rounded-2xl p-4 my-4 text-center" style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Monthly payment' : 'Месечна вноска'}
        </p>
        <p className="text-3xl font-black mono" style={{ color: 'hsl(var(--c-primary))' }}>
          {fmtEur(monthly)}
        </p>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Stat label={lang === 'en' ? 'Loan amount' : 'Заем'} value={fmtEur(principal)} color="hsl(var(--c-fg-muted))" />
        <Stat label={lang === 'en' ? 'Total interest' : 'Обща лихва'} value={fmtEur(interest)} color="hsl(var(--c-red))" />
        <Stat label={lang === 'en' ? 'Total paid' : 'Общо платено'} value={fmtEur(total)} color="hsl(var(--c-fg))" />
      </div>
    </div>
  );
}

// ─── Debt Payoff Calculator (Avalanche vs Snowball vs Even) ─────────────
type Debt = { id: number; label: string; balance: number; apr: number; minPayment: number };

function DebtCalculator() {
  const { lang } = useLang();
  const [debts, setDebts] = useState<Debt[]>([
    { id: 1, label: lang === 'en' ? 'Credit card'   : 'Кредитна карта', balance: 4000,  apr: 22, minPayment: 100 },
    { id: 2, label: lang === 'en' ? 'Personal loan' : 'Личен заем',     balance: 2500,  apr: 12, minPayment: 80 },
    { id: 3, label: lang === 'en' ? 'Car loan'      : 'Заем за кола',   balance: 8000,  apr: 7,  minPayment: 200 },
  ]);
  const [extraPayment, setExtraPayment] = useState(300);

  const update = (id: number, key: keyof Debt, val: number | string) => {
    setDebts(prev => prev.map(d => d.id === id ? { ...d, [key]: typeof val === 'number' ? val : val } : d));
  };
  const remove = (id: number) => setDebts(prev => prev.filter(d => d.id !== id));
  const add = () => setDebts(prev => [...prev, { id: Date.now(), label: lang === 'en' ? 'New debt' : 'Нов дълг', balance: 1000, apr: 15, minPayment: 50 }]);

  const sim = (strategy: 'snowball' | 'avalanche' | 'even') => {
    const ds = debts.map(d => ({ ...d }));
    let totalInterest = 0;
    let months = 0;
    while (ds.some(d => d.balance > 0.01) && months < 600) {
      months++;
      for (const d of ds) {
        if (d.balance > 0) {
          const interest = d.balance * (d.apr / 100 / 12);
          d.balance += interest;
          totalInterest += interest;
        }
      }
      for (const d of ds) {
        if (d.balance > 0) {
          const pay = Math.min(d.balance, d.minPayment);
          d.balance -= pay;
        }
      }
      let available = extraPayment;
      const order: number[] = ds.map((_, i) => i).filter(i => ds[i].balance > 0.01);
      if (strategy === 'snowball') order.sort((a, b) => ds[a].balance - ds[b].balance);
      else if (strategy === 'avalanche') order.sort((a, b) => ds[b].apr - ds[a].apr);

      if (strategy === 'even') {
        if (order.length > 0) {
          const each = available / order.length;
          for (const i of order) {
            const pay = Math.min(ds[i].balance, each);
            ds[i].balance -= pay;
          }
        }
      } else {
        for (const i of order) {
          if (available <= 0) break;
          const pay = Math.min(ds[i].balance, available);
          ds[i].balance -= pay;
          available -= pay;
        }
      }
    }
    return { months, totalInterest: Math.round(totalInterest) };
  };

  const results = useMemo(() => ({
    avalanche: sim('avalanche'),
    snowball:  sim('snowball'),
    even:      sim('even'),
  }), [debts, extraPayment]); // eslint-disable-line react-hooks/exhaustive-deps

  const best: 'avalanche' | 'snowball' | 'even' = useMemo(() => {
    const arr: ('avalanche' | 'snowball' | 'even')[] = ['avalanche', 'snowball', 'even'];
    return arr.reduce((b, k) => results[k].totalInterest < results[b].totalInterest ? k : b, 'avalanche');
  }, [results]);

  const totalBalance = debts.reduce((s, d) => s + d.balance, 0);

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Compare snowball, avalanche, and even strategies on your real debts.'
          : 'Сравни снежна топка, лавина и равно върху реалните си дългове.'}
      </p>

      <div className="rounded-2xl p-3 mb-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        {debts.map(d => (
          <div key={d.id} className="grid grid-cols-12 gap-2 items-center py-1.5">
            <input type="text" value={d.label}
              onChange={e => update(d.id, 'label', e.target.value)}
              className="col-span-4 text-sm bg-transparent outline-none" style={{ color: 'hsl(var(--c-fg))' }} />
            <input type="number" value={d.balance}
              onChange={e => update(d.id, 'balance', Number(e.target.value))}
              className="col-span-3 text-sm mono bg-transparent outline-none text-right" style={{ color: 'hsl(var(--c-red))' }} />
            <input type="number" step="0.1" value={d.apr}
              onChange={e => update(d.id, 'apr', Number(e.target.value))}
              className="col-span-2 text-sm mono bg-transparent outline-none text-right" style={{ color: 'hsl(var(--c-orange))' }} />
            <input type="number" value={d.minPayment}
              onChange={e => update(d.id, 'minPayment', Number(e.target.value))}
              className="col-span-2 text-sm mono bg-transparent outline-none text-right" style={{ color: 'hsl(var(--c-fg-muted))' }} />
            <button onClick={() => remove(d.id)}
              className="col-span-1 text-xs" style={{ color: 'hsl(var(--c-red))' }}>✕</button>
          </div>
        ))}
        <div className="grid grid-cols-12 gap-2 text-[10px] uppercase tracking-wide mt-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          <span className="col-span-4">{lang === 'en' ? 'Debt' : 'Дълг'}</span>
          <span className="col-span-3 text-right">{lang === 'en' ? 'Balance €' : 'Баланс €'}</span>
          <span className="col-span-2 text-right">APR %</span>
          <span className="col-span-2 text-right">{lang === 'en' ? 'Min €' : 'Мин €'}</span>
        </div>
        <button onClick={add} className="text-xs mt-2 underline" style={{ color: 'hsl(var(--c-primary))' }}>
          + {lang === 'en' ? 'Add debt' : 'Добави дълг'}
        </button>
      </div>

      <Slider label={lang === 'en' ? 'Extra payment / mo' : 'Допълнително / мес'} value={extraPayment} setValue={setExtraPayment} min={0} max={2000} step={25} unit="€" color="hsl(var(--c-green))" />

      <div className="rounded-2xl p-3 my-3 text-center" style={{ background: 'hsl(var(--c-red)/0.08)', border: '1px solid hsl(var(--c-red)/0.25)' }}>
        <p className="text-xs uppercase" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Total debt' : 'Общ дълг'}
        </p>
        <p className="text-2xl font-black mono" style={{ color: 'hsl(var(--c-red))' }}>{fmtEur(totalBalance)}</p>
      </div>

      <div className="space-y-2">
        {(['avalanche', 'snowball', 'even'] as const).map(s => {
          const info = {
            avalanche: { en: '🏔️ Avalanche (highest APR first)', bg: '🏔️ Лавина (най-висок ГПР първо)' },
            snowball:  { en: '⛄ Snowball (smallest balance first)', bg: '⛄ Снежна топка (най-малък баланс първо)' },
            even:      { en: '⚖️ Split evenly',  bg: '⚖️ Разделено поравно' },
          }[s];
          const r = results[s];
          const isBest = s === best;
          return (
            <div key={s} className="rounded-xl p-3 flex items-center justify-between"
              style={{
                background: isBest ? 'hsl(var(--c-green)/0.1)' : 'var(--c-glass)',
                border: `1.5px solid ${isBest ? 'hsl(var(--c-green))' : 'var(--c-border)'}`,
              }}>
              <span className="text-sm font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
                {info[lang]}
              </span>
              <div className="text-right">
                <p className="text-xs mono font-bold" style={{ color: 'hsl(var(--c-fg))' }}>
                  {Math.floor(r.months / 12)}y {r.months % 12}m
                </p>
                <p className="text-[11px] mono" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                  {fmtEur(r.totalInterest)} {lang === 'en' ? 'interest' : 'лихва'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── FIRE / Retirement Calculator ───────────────────────────────────────
function FireCalculator() {
  const { lang } = useLang();
  const [currentAge, setCurrentAge] = useState(30);
  const [currentSavings, setCurrentSavings] = useState(20000);
  const [monthly, setMonthly] = useState(800);
  const [rate, setRate] = useState(7);
  const [annualSpend, setAnnualSpend] = useState(30000);

  const { fireNumber, yearsToFire, retireAge, series } = useMemo(() => {
    const fireNumber = annualSpend * 25; // 4% safe withdrawal rule
    const r = rate / 100 / 12;
    let balance = currentSavings;
    const series: number[] = [balance];
    let months = 0;
    const MAX = 12 * 70;
    while (balance < fireNumber && months < MAX) {
      balance = balance * (1 + r) + monthly;
      months++;
      if (months % 12 === 0) series.push(balance);
    }
    const years = months / 12;
    return {
      fireNumber,
      yearsToFire: years,
      retireAge: currentAge + years,
      series,
    };
  }, [currentSavings, monthly, rate, annualSpend, currentAge]);

  const possible = yearsToFire < 70;

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Find your "FIRE number" (25× annual expenses) and how long it takes to hit it.'
          : 'Намери своя "FIRE номер" (25× годишни разходи) и след колко време го достигаш.'}
      </p>
      <Slider label={lang === 'en' ? 'Current age' : 'Текуща възраст'} value={currentAge} setValue={setCurrentAge} min={18} max={65} step={1} unit={lang === 'en' ? 'yr' : 'г.'} />
      <Slider label={lang === 'en' ? 'Current savings' : 'Текущи спестявания'} value={currentSavings} setValue={setCurrentSavings} min={0} max={500000} step={1000} unit="€" color="hsl(var(--c-green))" />
      <Slider label={lang === 'en' ? 'Monthly investing' : 'Месечно инвестиране'} value={monthly} setValue={setMonthly} min={0} max={5000} step={50} unit="€/mo" color="hsl(var(--c-purple))" />
      <Slider label={lang === 'en' ? 'Annual return' : 'Годишна доходност'} value={rate} setValue={setRate} min={1} max={12} step={0.5} unit="%" color="hsl(var(--c-orange))" />
      <Slider label={lang === 'en' ? 'Annual spending' : 'Годишни разходи'} value={annualSpend} setValue={setAnnualSpend} min={10000} max={150000} step={1000} unit="€" color="hsl(var(--c-red))" />

      <div className="rounded-2xl p-3 my-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <Sparkline points={series} color="hsl(var(--c-green))" />
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: 'hsl(var(--c-green)/0.08)', border: '1px solid hsl(var(--c-green)/0.25)' }}>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'FIRE number' : 'FIRE номер'}
        </p>
        <p className="text-2xl font-black mono mb-2" style={{ color: 'hsl(var(--c-green))' }}>
          {fmtEur(fireNumber)}
        </p>
        {possible ? (
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg))' }}>
            {lang === 'en'
              ? `🚀 You hit it in ${yearsToFire.toFixed(1)} years — at age ${retireAge.toFixed(0)}`
              : `🚀 Стигаш до него за ${yearsToFire.toFixed(1)} години — на ${retireAge.toFixed(0)} г.`}
          </p>
        ) : (
          <p className="text-sm" style={{ color: 'hsl(var(--c-red))' }}>
            {lang === 'en'
              ? '⚠️ Out of reach at current rate — try increasing monthly investing.'
              : '⚠️ Извън обхват при текущи темпове — опитай по-висока месечна инвестиция.'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Savings Goal ───────────────────────────────────────────────────────
function GoalCalculator() {
  const { lang } = useLang();
  const [target, setTarget] = useState(10000);
  const [current, setCurrent] = useState(1000);
  const [monthly, setMonthly] = useState(300);
  const [rate, setRate] = useState(4);

  const { months, years } = useMemo(() => {
    const r = rate / 100 / 12;
    let bal = current;
    let m = 0;
    while (bal < target && m < 600) {
      bal = bal * (1 + r) + monthly;
      m++;
    }
    return { months: m, years: m / 12 };
  }, [target, current, monthly, rate]);

  const pct = Math.min(100, (current / target) * 100);

  return (
    <div>
      <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Set a savings goal and see when you\'ll hit it.'
          : 'Постави цел за спестяване и виж кога ще я достигнеш.'}
      </p>
      <Slider label={lang === 'en' ? 'Goal' : 'Цел'} value={target} setValue={setTarget} min={500} max={200000} step={500} unit="€" />
      <Slider label={lang === 'en' ? 'Already saved' : 'Вече спестено'} value={current} setValue={setCurrent} min={0} max={target} step={100} unit="€" color="hsl(var(--c-green))" />
      <Slider label={lang === 'en' ? 'Monthly contribution' : 'Месечна вноска'} value={monthly} setValue={setMonthly} min={10} max={3000} step={10} unit="€/mo" color="hsl(var(--c-purple))" />
      <Slider label={lang === 'en' ? 'Interest rate' : 'Лихвен процент'} value={rate} setValue={setRate} min={0} max={10} step={0.25} unit="%" color="hsl(var(--c-orange))" />

      <div className="rounded-2xl p-4 my-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div className="flex justify-between text-xs mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          <span>{fmtEur(current)}</span>
          <span>{fmtEur(target)}</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: 'hsl(228, 12%, 18%)' }}>
          <div className="h-full" style={{ width: `${pct}%`, background: 'hsl(var(--c-green))', transition: 'width 0.4s' }} />
        </div>
      </div>

      <div className="rounded-2xl p-4 text-center" style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.25)' }}>
        <p className="text-xs uppercase mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Time to goal' : 'Време до целта'}
        </p>
        {months >= 600 ? (
          <p className="text-sm" style={{ color: 'hsl(var(--c-red))' }}>
            {lang === 'en' ? '⚠️ Too far away — increase monthly contribution.' : '⚠️ Прекалено далеч — увеличи месечната вноска.'}
          </p>
        ) : (
          <p className="text-2xl font-black mono" style={{ color: 'hsl(var(--c-primary))' }}>
            {Math.floor(years)}y {months % 12}m
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Net Worth Tracker (localStorage) ───────────────────────────────────
// value is stored as a STRING so the input can hold partial typing
// (decimals, empty, leading zero). Totals coerce via Number().
type Entry = { id: number; label: string; value: string };
type NetWorthData = { assets: Entry[]; liabilities: Entry[] };

function NetWorthTracker() {
  const { lang } = useLang();
  const [data, setData] = useState<NetWorthData>(() => {
    try {
      const raw = localStorage.getItem(NET_WORTH_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Migrate any legacy numeric `value` to string
        const coerce = (arr: { id: number; label: string; value: number | string }[]): Entry[] =>
          (arr ?? []).map(e => ({ id: e.id, label: e.label, value: String(e.value ?? '') }));
        return { assets: coerce(parsed.assets), liabilities: coerce(parsed.liabilities) };
      }
    } catch {}
    return {
      assets:      [{ id: 1, label: lang === 'en' ? 'Cash / savings' : 'Кеш / спестявания', value: '5000' }, { id: 2, label: lang === 'en' ? 'Investments' : 'Инвестиции', value: '15000' }],
      liabilities: [{ id: 1, label: lang === 'en' ? 'Credit card debt' : 'Дълг по карта', value: '2000' }],
    };
  });

  useEffect(() => {
    try { localStorage.setItem(NET_WORTH_KEY, JSON.stringify(data)); } catch {}
  }, [data]);

  const updateEntry = (kind: 'assets' | 'liabilities', id: number, key: 'label' | 'value', val: string) => {
    setData(prev => ({
      ...prev,
      [kind]: prev[kind].map(e => e.id === id ? { ...e, [key]: val } : e),
    }));
  };
  const addEntry = (kind: 'assets' | 'liabilities') => {
    setData(prev => ({
      ...prev,
      [kind]: [...prev[kind], { id: Date.now(), label: lang === 'en' ? 'New entry' : 'Нов запис', value: '' }],
    }));
  };
  const removeEntry = (kind: 'assets' | 'liabilities', id: number) => {
    setData(prev => ({ ...prev, [kind]: prev[kind].filter(e => e.id !== id) }));
  };

  const parseAmt = (s: string): number => {
    const cleaned = s.replace(',', '.').replace(/[^0-9.\-]/g, '');
    const n = Number(cleaned);
    return Number.isFinite(n) ? n : 0;
  };
  const totalAssets = data.assets.reduce((s, e) => s + parseAmt(e.value), 0);
  const totalLiab   = data.liabilities.reduce((s, e) => s + parseAmt(e.value), 0);
  const netWorth = totalAssets - totalLiab;

  // Section is intentionally inlined (not a nested component) so its inputs
  // don't unmount/remount on every keystroke and lose focus.
  const renderSection = (title: string, kind: 'assets' | 'liabilities', color: string) => (
    <div className="rounded-2xl p-3 mb-3" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold uppercase tracking-wide" style={{ color }}>{title}</p>
        <p className="text-[10px] uppercase tracking-wide" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Tap to edit' : 'Натисни за редакция'}
        </p>
      </div>

      {/* Column headers */}
      <div className="grid grid-cols-12 gap-2 mb-1 px-1 text-[10px] uppercase tracking-wide" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        <span className="col-span-7">{lang === 'en' ? 'Label' : 'Етикет'}</span>
        <span className="col-span-4 text-right">{lang === 'en' ? 'Amount €' : 'Сума €'}</span>
        <span className="col-span-1" />
      </div>

      {data[kind].map(e => (
        <div key={e.id} className="grid grid-cols-12 gap-2 items-center py-1">
          <input
            type="text"
            value={e.label}
            placeholder={lang === 'en' ? 'e.g. Savings' : 'напр. Спестявания'}
            onChange={ev => updateEntry(kind, e.id, 'label', ev.target.value)}
            className="col-span-7 text-sm rounded-lg px-2.5 py-1.5 outline-none focus:ring-2 focus:ring-offset-0"
            style={{
              color: 'hsl(var(--c-fg))',
              background: 'hsl(228, 14%, 14%)',
              border: '1px solid var(--c-border)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
          <input
            type="text"
            inputMode="decimal"
            value={e.value}
            placeholder="0"
            onChange={ev => {
              // Keep digits, single dot/comma, and an optional leading minus.
              const cleaned = ev.target.value.replace(/[^0-9.,\-]/g, '');
              updateEntry(kind, e.id, 'value', cleaned);
            }}
            className="col-span-4 text-sm mono rounded-lg px-2.5 py-1.5 outline-none text-right focus:ring-2"
            style={{
              color,
              background: 'hsl(228, 14%, 14%)',
              border: '1px solid var(--c-border)',
              boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }}
          />
          <button
            onClick={() => removeEntry(kind, e.id)}
            className="col-span-1 w-7 h-7 rounded-full text-xs flex items-center justify-center transition-colors hover:bg-red-500/15"
            style={{ color: 'hsl(var(--c-red))', background: 'hsl(var(--c-red)/0.08)' }}
            aria-label="Remove">
            ✕
          </button>
        </div>
      ))}
      <button
        onClick={() => addEntry(kind)}
        className="text-xs font-semibold mt-2 px-3 py-1.5 rounded-full transition-colors"
        style={{ color, background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 35%, transparent)` }}>
        + {lang === 'en' ? 'Add row' : 'Добави ред'}
      </button>
    </div>
  );

  return (
    <div>
      <p className="text-sm mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? 'Track your net worth. Stored on this device only — nothing leaves your phone.'
          : 'Следи нетното си богатство. Запазено само на това устройство.'}
      </p>
      <div className="rounded-xl p-3 mb-3 text-xs" style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.2)', color: 'hsl(var(--c-fg-muted))' }}>
        ✏️ {lang === 'en'
          ? 'Tap any label or amount to type your own values. Use "+ Add row" to add more.'
          : 'Натисни всеки етикет или сума, за да въведеш собствени стойности. "+ Добави ред" за нов запис.'}
      </div>
      {renderSection(lang === 'en' ? '🟢 Assets' : '🟢 Активи', 'assets', 'hsl(var(--c-green))')}
      {renderSection(lang === 'en' ? '🔴 Liabilities' : '🔴 Задължения', 'liabilities', 'hsl(var(--c-red))')}
      <div className="rounded-2xl p-4 text-center"
        style={{
          background: netWorth >= 0 ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
          border: `1px solid ${netWorth >= 0 ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
        }}>
        <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {lang === 'en' ? 'Net worth' : 'Нетно богатство'}
        </p>
        <p className="text-3xl font-black mono" style={{ color: netWorth >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
          {fmtEur(netWorth)}
        </p>
        <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {fmtEur(totalAssets)} {lang === 'en' ? 'assets' : 'активи'} − {fmtEur(totalLiab)} {lang === 'en' ? 'debt' : 'дълг'}
        </p>
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl p-3 text-center" style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
      <p className="text-[10px] uppercase mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
      <p className="text-sm font-black mono" style={{ color }}>{value}</p>
    </div>
  );
}

// ─── Main page ──────────────────────────────────────────────────────────
export function Tools() {
  const { lang } = useLang();
  const [tool, setTool] = useState<ToolId>('compound');

  const tools: { id: ToolId; emoji: string; label: { en: string; bg: string } }[] = [
    { id: 'compound', emoji: '📈', label: { en: 'Compound', bg: 'Сложна лихва' } },
    { id: 'mortgage', emoji: '🏠', label: { en: 'Mortgage', bg: 'Ипотека' } },
    { id: 'debt',     emoji: '⚔️', label: { en: 'Debt payoff', bg: 'Изплащане на дълг' } },
    { id: 'fire',     emoji: '🔥', label: { en: 'FIRE',     bg: 'FIRE' } },
    { id: 'goal',     emoji: '🎯', label: { en: 'Goal',     bg: 'Цел' } },
    { id: 'networth', emoji: '💰', label: { en: 'Net worth', bg: 'Нетно богатство' } },
  ];

  return (
    <div className="relative pb-24 sm:pb-12 overflow-hidden">
      <div className="md:hidden"><FloatingOrbs /></div>

      <div className="relative max-w-md md:max-w-2xl mx-auto px-4 sm:px-6 md:px-0 py-2 sm:py-4 md:py-2" style={{ zIndex: 1 }}>
        <div className="mb-5 text-center md:text-left">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
            🧰 {lang === 'en' ? 'Tools' : 'Инструменти'}
          </h1>
          <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
            {lang === 'en'
              ? 'Real calculators to use what you learn.'
              : 'Реални калкулатори, за да приложиш наученото.'}
          </p>
        </div>

        {/* Tool tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-4 -mx-1 px-1" style={{ scrollbarWidth: 'none' }}>
          {tools.map(t => {
            const active = tool === t.id;
            return (
              <button key={t.id} onClick={() => setTool(t.id)}
                className="flex-shrink-0 rounded-xl px-3 py-2 text-sm font-bold transition-all"
                style={{
                  background: active ? 'hsl(var(--c-primary)/0.18)' : 'var(--c-glass)',
                  border: `1.5px solid ${active ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                  color: active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
                }}>
                {t.emoji} {t.label[lang]}
              </button>
            );
          })}
        </div>

        <div className="rounded-3xl p-4 md:p-6"
          style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
          {tool === 'compound' && <CompoundCalculator />}
          {tool === 'mortgage' && <MortgageCalculator />}
          {tool === 'debt'     && <DebtCalculator />}
          {tool === 'fire'     && <FireCalculator />}
          {tool === 'goal'     && <GoalCalculator />}
          {tool === 'networth' && <NetWorthTracker />}
        </div>
      </div>
    </div>
  );
}
