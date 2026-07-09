import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLang } from '../contexts/LanguageContext';
import type { Exercise, LocalizedText } from '../types';

/**
 * "Explain my mistake" — an AI tutor button shown after a wrong answer.
 * Free users get a small daily quota (surfaced as `user.ai_explains_remaining`);
 * Pro users are unlimited. When a free user is out of explanations the button
 * turns into a Pro upsell.
 *
 * Reusable across exercise types: pass the `exercise` and, optionally, a short
 * human-readable string of what the learner picked (`userAnswer`).
 */
export function ExplainMistake({ exercise, userAnswer }: { exercise: Exercise; userAnswer?: string }) {
  const { token, user, updateUser } = useAuth();
  const { lang } = useLang();
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [text, setText] = useState('');

  const isPro = !!user?.is_pro;
  const remaining = user?.ai_explains_remaining; // null/undefined = unlimited for pro
  const locked = !isPro && typeof remaining === 'number' && remaining <= 0 && state !== 'done';

  const label =
    lang === 'en' ? 'Why was this wrong?' : 'Защо беше грешно?';

  async function upgrade() {
    if (!token) return;
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch { /* ignore */ }
  }

  async function explain() {
    if (!token || state === 'loading') return;
    setState('loading');
    try {
      const res = await fetch('/api/ai/explain', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: buildContext(exercise, lang), userAnswer }),
      });
      const data = await res.json();
      if (res.status === 403 && data.error === 'daily_limit') {
        updateUser({ ai_explains_remaining: 0 });
        setState('idle');
        return;
      }
      if (!res.ok || !data.text) {
        setState('error');
        return;
      }
      setText(data.text);
      setState('done');
      if (!isPro && typeof data.remaining === 'number') {
        updateUser({ ai_explains_remaining: data.remaining });
      }
    } catch {
      setState('error');
    }
  }

  // ── Out of free explanations → Pro upsell ──
  if (locked) {
    return (
      <button
        onClick={upgrade}
        className="w-full mb-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2"
        style={{
          background: 'hsl(var(--c-primary)/0.1)',
          border: '1px solid hsl(var(--c-primary)/0.25)',
          color: 'hsl(var(--c-primary))',
        }}
      >
        🐙 {lang === 'en'
          ? 'Out of free explanations — go Pro for unlimited ✦'
          : 'Свърши безплатните обяснения — Pro за неограничени ✦'}
      </button>
    );
  }

  if (state === 'done') {
    return (
      <div
        className="mb-4 rounded-xl p-4 animate-slide-up"
        style={{ background: 'hsl(var(--c-primary)/0.08)', border: '1px solid hsl(var(--c-primary)/0.25)' }}
      >
        <p className="font-semibold text-sm mb-1.5 flex items-center gap-1.5" style={{ color: 'hsl(var(--c-primary))' }}>
          🐙 {lang === 'en' ? 'Octolio explains' : 'Octolio обяснява'}
        </p>
        <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {text}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-3">
      <button
        onClick={explain}
        disabled={state === 'loading'}
        className="w-full rounded-xl px-4 py-2.5 text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
        style={{
          background: 'hsl(var(--c-primary)/0.1)',
          border: '1px solid hsl(var(--c-primary)/0.25)',
          color: 'hsl(var(--c-primary))',
        }}
      >
        {state === 'loading' ? (
          <>
            <span
              className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin inline-block"
              style={{ borderColor: 'hsl(var(--c-primary))', borderTopColor: 'transparent' }}
            />
            {lang === 'en' ? 'Thinking…' : 'Мисля…'}
          </>
        ) : (
          <>
            🐙 {label}
            {!isPro && typeof remaining === 'number' && (
              <span className="text-xs font-normal opacity-70">
                ({remaining} {lang === 'en' ? 'left today' : 'днес'})
              </span>
            )}
          </>
        )}
      </button>
      {state === 'error' && (
        <p className="text-xs mt-1.5 text-center" style={{ color: 'hsl(var(--c-red))' }}>
          {lang === 'en' ? 'Could not load explanation — try again.' : 'Обяснението не се зареди — опитай пак.'}
        </p>
      )}
    </div>
  );
}

/** Flatten an exercise into a compact, single-language description for the AI. */
function buildContext(ex: Exercise, lang: 'en' | 'bg'): string {
  const g = (v?: LocalizedText) => (v ? v[lang] : '');
  const lines: string[] = [];

  // ── Generic top-level fields (choice / fill_blank / true_false / scenario_decision) ──
  if (ex.question) lines.push(`Question: ${g(ex.question)}`);
  if (ex.statement) lines.push(`Statement: ${g(ex.statement)}`);
  if (ex.scenario) lines.push(`Scenario: ${g(ex.scenario)}`);
  if (ex.decisionScenario) lines.push(`Scenario: ${g(ex.decisionScenario)}`);
  if (ex.orderInstruction) lines.push(`Task: ${g(ex.orderInstruction)}`);

  if (Array.isArray(ex.options) && ex.options.length) {
    lines.push('Options:');
    ex.options.forEach((o, i) => {
      const mark = i === ex.correctIndex ? '  (correct)' : '';
      lines.push(`  ${['A', 'B', 'C', 'D'][i] ?? i + 1}. ${g(o)}${mark}`);
    });
  }

  if (Array.isArray(ex.decisionChoices) && ex.decisionChoices.length) {
    lines.push('Choices:');
    ex.decisionChoices.forEach((c) => {
      lines.push(`  - ${g(c.label)}${c.isBest ? '  (best choice)' : ''}`);
    });
  }

  if (typeof ex.correctAnswer === 'number') {
    lines.push(`Correct answer: ${ex.correctAnswer}${ex.answerUnit ?? ''}`);
  }
  if (typeof ex.isTrue === 'boolean') {
    lines.push(`Correct answer: ${ex.isTrue ? 'True' : 'False'}`);
  }

  // ── fill_number ──
  if (ex.fillNumberScenario) lines.push(`Scenario: ${g(ex.fillNumberScenario)}`);
  if (typeof ex.fillNumberAnswer === 'number') {
    lines.push(`Correct answer: ${ex.fillNumberUnit ?? ''}${ex.fillNumberAnswer}`);
  }

  // ── stock_chart ──
  if (ex.stockChart) {
    const sc = ex.stockChart;
    if (sc.scenario) lines.push(`Scenario: ${g(sc.scenario)}`);
    lines.push(`Question: ${g(sc.question)}`);
    if (sc.mode === 'identify_pattern' && Array.isArray(sc.patternOptions)) {
      lines.push('Pattern options:');
      sc.patternOptions.forEach((o, i) =>
        lines.push(`  - ${g(o)}${i === sc.correctPatternIndex ? '  (correct)' : ''}`));
    } else if (sc.mode === 'identify_point') {
      lines.push('Task: click the best (lowest-price) entry point on the chart.');
    }
  }

  // ── portfolio_pie ──
  if (ex.portfolioPie) {
    const pp = ex.portfolioPie;
    if (pp.scenario) lines.push(`Scenario: ${g(pp.scenario)}`);
    if (pp.question) lines.push(`Question: ${g(pp.question)}`);
    lines.push('Ideal allocation:');
    pp.assets.forEach((a) => lines.push(`  - ${g(a.label)}: ${a.ideal}%`));
  }

  // ── debt_payoff ──
  if (ex.debtPayoff) {
    const dp = ex.debtPayoff;
    if (dp.scenario) lines.push(`Scenario: ${g(dp.scenario)}`);
    lines.push(`Question: ${g(dp.question)}`);
    lines.push(`Correct strategy: ${dp.correctStrategy} (snowball = smallest balance first, avalanche = highest APR first, even = split evenly)`);
  }

  // ── tax_brackets ──
  if (ex.taxBrackets) {
    const tb = ex.taxBrackets;
    if (tb.scenario) lines.push(`Scenario: ${g(tb.scenario)}`);
    lines.push(`Question: ${g(tb.question)}`);
    lines.push(`Correct answer: ${tb.correctAnswer}${tb.unit ?? ''} for an income of ${tb.testIncome}.`);
  }

  // ── coverage_calc ──
  if (ex.coverageCalc) {
    const cc = ex.coverageCalc;
    if (cc.scenario) lines.push(`Scenario: ${g(cc.scenario)}`);
    lines.push(`Question: ${g(cc.question)}`);
    lines.push(`Correct setup: premium ${cc.correctPremium}, deductible ${cc.correctDeductible}, coverage limit ${cc.correctCoverageLimit}.`);
  }

  if (ex.explanation) lines.push(`Official explanation: ${g(ex.explanation)}`);

  // Fallback so the AI always has something to work with.
  if (!lines.length) lines.push(`Exercise type: ${ex.type}`);

  return lines.join('\n');
}
