import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

export function MatchTerms({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const pairs = exercise.matchPairs ?? [];
  const [selectedTerm, setSelectedTerm] = useState<number | null>(null);
  const [matches, setMatches] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  // Shuffled definitions order (stable via useState)
  const [defOrder] = useState(() => {
    const indices = pairs.map((_, i) => i);
    for (let i = indices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
    return indices;
  });

  const matchedTerms = new Set(Object.keys(matches).map(Number));
  const matchedDefs = new Set(Object.values(matches));
  const allMatched = Object.keys(matches).length === pairs.length;

  const handleTermClick = (i: number) => {
    if (submitted || matchedTerms.has(i)) return;
    setSelectedTerm(selectedTerm === i ? null : i);
  };

  const handleDefClick = (defIdx: number) => {
    if (submitted || matchedDefs.has(defIdx) || selectedTerm === null) return;
    setMatches(prev => ({ ...prev, [selectedTerm]: defIdx }));
    setSelectedTerm(null);
  };

  const correctCount = Object.entries(matches).filter(
    ([termIdx, defIdx]) => Number(termIdx) === defIdx
  ).length;
  const score = pairs.length > 0 ? correctCount / pairs.length : 0;
  const isPassing = score >= 0.7;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const getMatchColor = (termIdx: number) => {
    if (!submitted) return 'hsl(var(--c-primary))';
    return matches[termIdx] === termIdx ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))';
  };

  return (
    <div className="animate-fade-in">
      <p className="text-sm mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? '🔗 Tap a term, then tap its matching definition'
          : '🔗 Натисни термин, после натисни съответната дефиниция'}
      </p>

      <div className="grid grid-cols-1 gap-3 mb-5">
        {/* Terms */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Terms' : 'Термини'}
          </p>
          <div className="space-y-2">
            {pairs.map((pair, i) => {
              const isSelected = selectedTerm === i;
              const isMatched = matchedTerms.has(i);
              return (
                <button key={`t-${i}`}
                  onClick={() => handleTermClick(i)}
                  disabled={submitted || isMatched}
                  className="w-full text-left rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    background: isMatched
                      ? submitted ? `${getMatchColor(i)}10` : 'hsl(var(--c-primary)/0.08)'
                      : isSelected ? 'hsl(var(--c-primary)/0.15)' : 'var(--c-glass)',
                    border: `1.5px solid ${isMatched
                      ? submitted ? getMatchColor(i) : 'hsl(var(--c-primary)/0.3)'
                      : isSelected ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
                    opacity: isMatched && !submitted ? 0.6 : 1,
                  }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold" style={{
                      color: isSelected ? 'hsl(var(--c-primary))' : isMatched && submitted ? getMatchColor(i) : 'hsl(var(--c-fg))'
                    }}>
                      {pair.term[lang]}
                    </span>
                    {isMatched && submitted && (
                      <span className="ml-auto">{matches[i] === i ? '✓' : '✗'}</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Definitions */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
            {lang === 'en' ? 'Definitions' : 'Дефиниции'}
          </p>
          <div className="space-y-2">
            {defOrder.map((defIdx) => {
              const isMatched = matchedDefs.has(defIdx);
              const canClick = selectedTerm !== null && !isMatched && !submitted;
              return (
                <button key={`d-${defIdx}`}
                  onClick={() => handleDefClick(defIdx)}
                  disabled={!canClick}
                  className="w-full text-left rounded-xl px-4 py-3 transition-all duration-200"
                  style={{
                    background: isMatched ? 'hsl(var(--c-primary)/0.05)' : canClick ? 'hsl(var(--c-primary)/0.03)' : 'var(--c-glass)',
                    border: `1.5px solid ${isMatched ? 'hsl(var(--c-primary)/0.2)' : canClick ? 'hsl(var(--c-primary)/0.3)' : 'var(--c-border)'}`,
                    opacity: isMatched ? 0.5 : 1,
                    cursor: canClick ? 'pointer' : 'default',
                  }}>
                  <span className="text-sm" style={{ color: 'hsl(var(--c-fg-muted))' }}>
                    {pairs[defIdx].definition[lang]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {submitted && (
        <div className="rounded-xl p-4 mb-4 animate-slide-up"
          style={{
            background: Object.entries(matches).filter(([t, d]) => Number(t) === d).length === pairs.length
              ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-orange)/0.1)',
            border: `1px solid ${Object.entries(matches).filter(([t, d]) => Number(t) === d).length === pairs.length
              ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-orange)/0.3)'}`,
          }}>
          <p className="font-semibold text-sm" style={{
            color: Object.entries(matches).filter(([t, d]) => Number(t) === d).length === pairs.length
              ? 'hsl(var(--c-green))' : 'hsl(var(--c-orange))'
          }}>
            {Object.entries(matches).filter(([t, d]) => Number(t) === d).length === pairs.length
              ? (lang === 'en' ? '✓ Perfect matches!' : '✓ Перфектни съвпадения!')
              : (lang === 'en'
                ? `${Object.entries(matches).filter(([t, d]) => Number(t) === d).length}/${pairs.length} correct`
                : `${Object.entries(matches).filter(([t, d]) => Number(t) === d).length}/${pairs.length} правилни`)}
          </p>
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={!allMatched}>
          {lang === 'en' ? 'Check Matches →' : 'Провери съвпаденията →'}
        </button>
      )}
      {submitted && (
        <button className="btn-primary w-full" onClick={() => onAnswer(isPassing, isPassing ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      )}
    </div>
  );
}
