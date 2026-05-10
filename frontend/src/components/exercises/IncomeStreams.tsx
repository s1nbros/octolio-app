import { useState, useMemo } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function IncomeStreams({ exercise, onAnswer }: Props) {
  const { t, lang } = useLang();
  const cfg = exercise.incomeStreams!;
  const [selected, setSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);

  const totalIncome = useMemo(
    () => selected.reduce((s, i) => s + cfg.streams[i].hoursPerWeek * cfg.streams[i].eurPerHour * 4, 0),
    [selected, cfg.streams],
  );
  const totalHours = useMemo(
    () => selected.reduce((s, i) => s + cfg.streams[i].hoursPerWeek, 0),
    [selected, cfg.streams],
  );
  const incomePct = Math.min(100, (totalIncome / cfg.targetIncome) * 100);
  const hoursPct = Math.min(100, (totalHours / cfg.maxHoursPerWeek) * 100);

  const meetsTarget = totalIncome >= cfg.targetIncome;
  const fitsHours = totalHours <= cfg.maxHoursPerWeek;
  const correctCount = selected.length >= cfg.minPicks && selected.length <= cfg.maxPicks;
  const isCorrect = meetsTarget && fitsHours && correctCount;

  const togglePick = (i: number) => {
    if (submitted) return;
    setSelected(prev =>
      prev.includes(i)
        ? prev.filter(x => x !== i)
        : prev.length < cfg.maxPicks
          ? [...prev, i]
          : prev,
    );
  };

  const handleSubmit = () => {
    if (selected.length === 0) return;
    setSubmitted(true);
    if (isCorrect) {
      setTimeout(() => onAnswer(true, exercise.xp), 2000);
    }
  };

  return (
    <div className="animate-fade-in">
      {cfg.scenario && (
        <div className="rounded-2xl p-4 mb-4"
          style={{ background: 'hsl(var(--c-purple)/0.07)', border: '1px solid hsl(var(--c-purple)/0.2)' }}>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg))' }}>
            {t(cfg.scenario)}
          </p>
        </div>
      )}

      <p className="text-base font-semibold leading-relaxed mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
        {t(cfg.question)}
      </p>

      {/* Live targets */}
      <div className="rounded-2xl p-3 mb-4 grid grid-cols-2 gap-3"
        style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Income / mo' : 'Доход / мес'}
            </span>
            <span className="mono font-bold" style={{ color: meetsTarget ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg))' }}>
              €{Math.round(totalIncome)} / €{cfg.targetIncome}
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(228, 12%, 18%)' }}>
            <div className="h-full transition-all duration-300"
              style={{ width: `${incomePct}%`, background: meetsTarget ? 'hsl(var(--c-green))' : 'hsl(var(--c-primary))' }} />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>
              {lang === 'en' ? 'Hours / wk' : 'Часове / седм.' }
            </span>
            <span className="mono font-bold"
              style={{ color: fitsHours ? 'hsl(var(--c-fg))' : 'hsl(var(--c-red))' }}>
              {totalHours}h / {cfg.maxHoursPerWeek}h
            </span>
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ background: 'hsl(228, 12%, 18%)' }}>
            <div className="h-full transition-all duration-300"
              style={{ width: `${hoursPct}%`, background: fitsHours ? 'hsl(var(--c-orange))' : 'hsl(var(--c-red))' }} />
          </div>
        </div>
      </div>

      <p className="text-xs mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en'
          ? `Pick ${cfg.minPicks}–${cfg.maxPicks} streams that hit the target without busting your hour budget.`
          : `Избери ${cfg.minPicks}–${cfg.maxPicks} потока, които достигат целта без да надхвърлят часовия бюджет.`}
      </p>

      {/* Stream cards */}
      <div className="space-y-2 mb-4">
        {cfg.streams.map((s, i) => {
          const isSelected = selected.includes(i);
          const monthly = s.hoursPerWeek * s.eurPerHour * 4;
          return (
            <button key={i}
              onClick={() => togglePick(i)}
              disabled={submitted}
              className="w-full text-left rounded-xl p-3 transition-all"
              style={{
                background: isSelected ? 'hsl(var(--c-primary)/0.12)' : 'var(--c-glass)',
                border: `1.5px solid ${isSelected ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
              }}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{s.emoji}</span>
                <span className="text-sm font-bold flex-1" style={{ color: 'hsl(var(--c-fg))' }}>
                  {s.label[lang]}
                </span>
                <span className="text-xs mono font-bold" style={{ color: 'hsl(var(--c-green))' }}>
                  €{monthly}/mo
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 text-[11px]" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                <span className="mono">
                  {s.hoursPerWeek}h/wk · €{s.eurPerHour}/h
                </span>
                <span style={{ color: 'hsl(var(--c-orange))' }}>
                  {'★'.repeat(s.scalability)}{'☆'.repeat(5 - s.scalability)}
                </span>
              </div>
              {s.note && (
                <p className="text-[11px] mt-1" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
                  {s.note[lang]}
                </p>
              )}
            </button>
          );
        })}
      </div>

      {/* Result */}
      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: isCorrect ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
            border: `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm mb-1"
            style={{ color: isCorrect ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
            {isCorrect
              ? (lang === 'en' ? '✓ Solid mix!' : '✓ Силен микс!')
              : !meetsTarget
                ? (lang === 'en' ? `✗ Income too low: €${Math.round(totalIncome)} of €${cfg.targetIncome}` : `✗ Доходът е нисък: €${Math.round(totalIncome)} от €${cfg.targetIncome}`)
                : !fitsHours
                  ? (lang === 'en' ? `✗ Too many hours: ${totalHours}h of ${cfg.maxHoursPerWeek}h max` : `✗ Твърде много часове: ${totalHours}ч от ${cfg.maxHoursPerWeek}ч`)
                  : (lang === 'en' ? `✗ Pick ${cfg.minPicks}–${cfg.maxPicks} streams` : `✗ Избери ${cfg.minPicks}–${cfg.maxPicks} потока`)}
          </p>
          {exercise.explanation && (
            <p className="text-sm leading-relaxed mt-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          )}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={selected.length === 0}>
          {lang === 'en' ? 'Lock in mix →' : 'Финализирай микса →'}
        </button>
      )}
      {submitted && !isCorrect && (
        <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
