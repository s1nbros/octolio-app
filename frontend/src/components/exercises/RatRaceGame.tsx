import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function RatRaceGame({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const profile = exercise.ratRaceProfile!;
  const [month, setMonth] = useState(0);
  const [cash, setCash] = useState(0);
  const [passiveIncome, setPassiveIncome] = useState(0);
  const [chosen, setChosen] = useState<number[]>([]);
  const [phase, setPhase] = useState<'intro' | 'play' | 'result'>('intro');
  const [log, setLog] = useState<string[]>([]);

  const totalExpenses = useMemo(() =>
    profile.expenses.reduce((s, e) => s + e.amount, 0), [profile]);

  const monthlyCashFlow = profile.monthlyIncome + passiveIncome - totalExpenses;
  const isOnFastTrack = passiveIncome >= totalExpenses;

  const startGame = () => setPhase('play');

  const advanceMonth = () => {
    const newCash = cash + monthlyCashFlow;
    setCash(newCash);
    setMonth(m => m + 1);
    setLog(l => [`Month ${month + 1}: Cash flow €${monthlyCashFlow >= 0 ? '+' : ''}${monthlyCashFlow}`, ...l.slice(0, 4)]);
    if (month >= 5) setPhase('result');
  };

  const pickOpportunity = (i: number) => {
    const opp = profile.opportunities[i];
    if (chosen.includes(i) || cash < opp.cost) return;
    setCash(c => c - opp.cost);
    setPassiveIncome(p => p + opp.monthlyPassive);
    setChosen(prev => [...prev, i]);
    setLog(l => [`Invested in ${opp.label[lang]}! +€${opp.monthlyPassive}/mo passive`, ...l.slice(0, 4)]);
  };

  if (phase === 'intro') {
    return (
      <div className="animate-fade-in">
        <div className="rounded-2xl p-5 mb-5"
          style={{ background: 'hsl(var(--c-purple)/0.08)', border: '1px solid hsl(var(--c-purple)/0.2)' }}>
          <div className="text-center mb-4">
            <div className="text-5xl mb-2">{profile.avatar}</div>
            <h3 className="font-bold text-lg" style={{ color: 'hsl(var(--c-fg))' }}>
              {profile.name[lang]}
            </h3>
            <p className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {profile.job[lang]}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg p-3 text-center"
              style={{ background: 'hsl(var(--c-green)/0.08)', border: '1px solid hsl(var(--c-green)/0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Monthly Income' : 'Месечен доход'}
              </p>
              <p className="text-xl font-black" style={{ color: 'hsl(var(--c-green))' }}>
                €{profile.monthlyIncome}
              </p>
            </div>
            <div className="rounded-lg p-3 text-center"
              style={{ background: 'hsl(var(--c-red)/0.08)', border: '1px solid hsl(var(--c-red)/0.2)' }}>
              <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                {lang === 'en' ? 'Monthly Expenses' : 'Месечни разходи'}
              </p>
              <p className="text-xl font-black" style={{ color: 'hsl(var(--c-red))' }}>
                €{totalExpenses}
              </p>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            {profile.expenses.map((e, i) => (
              <div key={i} className="flex justify-between text-xs py-1"
                style={{ borderBottom: '1px solid var(--c-border)', color: 'hsl(var(--c-fg-muted))' }}>
                <span>{e.emoji} {e.label[lang]}</span>
                <span>€{e.amount}</span>
              </div>
            ))}
          </div>
        </div>
        <p className="text-sm mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en'
            ? '🎯 Goal: Build passive income to escape the Rat Race! You have 6 months.'
            : '🎯 Цел: Изгради пасивен доход, за да избягаш от Rat Race! Имаш 6 месеца.'}
        </p>
        <button className="btn-primary w-full" onClick={startGame}>
          {lang === 'en' ? '▶ Start Simulation' : '▶ Започни симулацията'}
        </button>
      </div>
    );
  }

  if (phase === 'result') {
    const escaped = isOnFastTrack;
    return (
      <div className="animate-scale-in text-center">
        <div className="text-6xl mb-4">{escaped ? '🏆' : '😓'}</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'hsl(var(--c-fg))' }}>
          {escaped
            ? (lang === 'en' ? 'You escaped the Rat Race!' : 'Избяга от Rat Race!')
            : (lang === 'en' ? 'Still in the Rat Race...' : 'Все още в Rat Race...')}
        </h3>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: lang === 'en' ? 'Cash Saved' : 'Спестени пари', value: `€${cash}`, color: 'hsl(var(--c-green))' },
            { label: lang === 'en' ? 'Passive/mo' : 'Пасивен/м', value: `€${passiveIncome}`, color: 'hsl(var(--c-purple))' },
            { label: lang === 'en' ? 'Cash Flow' : 'Паричен поток', value: `€${monthlyCashFlow}`, color: monthlyCashFlow >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' },
          ].map(({ label, value, color }) => (
            <div key={label} className="rounded-xl p-3"
              style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
              <p className="text-xs mb-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
              <p className="text-lg font-black" style={{ color }}>{value}</p>
            </div>
          ))}
        </div>
        <p className="text-sm mb-4" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {escaped
            ? (lang === 'en' ? 'Passive income covers all expenses. Work is now optional!' : 'Пасивният доход покрива всички разходи. Работата вече е незадължителна!')
            : (lang === 'en' ? `Passive income €${passiveIncome} vs expenses €${totalExpenses}. Keep investing!` : `Пасивен доход €${passiveIncome} срещу разходи €${totalExpenses}. Продължавай да инвестираш!`)}
        </p>
        <button className="btn-green w-full" onClick={() => onAnswer(escaped, escaped ? exercise.xp : Math.floor(exercise.xp * 0.6))}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Dashboard header */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        {[
          { label: lang === 'en' ? 'Month' : 'Месец', value: `${month}/6`, color: 'hsl(var(--c-primary))' },
          { label: lang === 'en' ? 'Cash' : 'Кеш', value: `€${cash}`, color: cash >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' },
          { label: lang === 'en' ? 'Passive' : 'Пасивен', value: `€${passiveIncome}`, color: 'hsl(var(--c-purple))' },
          { label: lang === 'en' ? 'Flow' : 'Поток', value: `${monthlyCashFlow >= 0 ? '+' : ''}€${monthlyCashFlow}`, color: monthlyCashFlow >= 0 ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-2 text-center"
            style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
            <p className="text-xs" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{label}</p>
            <p className="text-sm font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Fast Track indicator */}
      {isOnFastTrack && (
        <div className="rounded-xl p-3 mb-4 text-center animate-pulse-ring"
          style={{ background: 'hsl(var(--c-green)/0.1)', border: '1px solid hsl(var(--c-green)/0.4)' }}>
          <p className="font-bold text-sm" style={{ color: 'hsl(var(--c-green))' }}>
            🚀 {lang === 'en' ? 'You\'re on the FAST TRACK!' : 'Ти си на БЪРЗАТА ПИСТА!'}
          </p>
        </div>
      )}

      {/* Opportunities */}
      <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? 'Investment Opportunities' : 'Инвестиционни възможности'}
      </p>
      <div className="space-y-2 mb-4">
        {profile.opportunities.map((opp, i) => {
          const bought = chosen.includes(i);
          const canAfford = cash >= opp.cost && !bought;
          return (
            <button key={i}
              onClick={() => canAfford && pickOpportunity(i)}
              disabled={!canAfford}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: bought ? 'hsl(var(--c-green)/0.08)' : 'var(--c-glass)',
                border: `1px solid ${bought ? 'hsl(var(--c-green)/0.3)' : 'var(--c-border)'}`,
                opacity: !canAfford && !bought ? 0.45 : 1,
                cursor: canAfford ? 'pointer' : 'default',
              }}>
              <div className="flex items-center gap-2">
                <span>{opp.emoji}</span>
                <span className="text-sm font-medium flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {opp.label[lang]}
                </span>
                {bought ? (
                  <span className="text-xs font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                    ✓ +€{opp.monthlyPassive}/mo
                  </span>
                ) : (
                  <div className="text-right">
                    <span className="text-xs block" style={{ color: 'hsl(var(--c-red))' }}>€{opp.cost}</span>
                    {opp.monthlyPassive > 0 && (
                      <span className="text-xs block" style={{ color: 'hsl(var(--c-green))' }}>+€{opp.monthlyPassive}/mo</span>
                    )}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Log */}
      {log.length > 0 && (
        <div className="rounded-xl p-3 mb-4 space-y-1"
          style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
          {log.map((l, i) => (
            <p key={i} className="text-xs" style={{ color: i === 0 ? 'hsl(var(--c-fg-muted))' : 'hsl(var(--c-fg-subtle))' }}>
              {l}
            </p>
          ))}
        </div>
      )}

      <button className="btn-primary w-full" onClick={advanceMonth}>
        {lang === 'en' ? `⏩ End Month ${month + 1}` : `⏩ Приключи месец ${month + 1}`}
      </button>
    </div>
  );
}
