import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

type SortState = 'unsorted' | 'asset' | 'liability';

export function SortItems({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const items = exercise.sortItems ?? [];
  const [sorted, setSorted] = useState<Record<number, SortState>>(
    Object.fromEntries(items.map((_, i) => [i, 'unsorted']))
  );
  const [submitted, setSubmitted] = useState(false);

  const allSorted = items.every((_, i) => sorted[i] !== 'unsorted');

  const assign = (idx: number, bucket: 'asset' | 'liability') => {
    if (submitted) return;
    setSorted(prev => ({ ...prev, [idx]: prev[idx] === bucket ? 'unsorted' : bucket }));
  };

  const correctCount = items.filter((item, i) =>
    (item.isAsset && sorted[i] === 'asset') || (!item.isAsset && sorted[i] === 'liability')
  ).length;
  const score = items.length > 0 ? correctCount / items.length : 0;
  const isPassing = score >= 0.7;

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const unsorted = items.filter((_, i) => sorted[i] === 'unsorted');
  const assetItems = items.filter((_, i) => sorted[i] === 'asset');
  const liabilityItems = items.filter((_, i) => sorted[i] === 'liability');

  const getItemIdx = (item: typeof items[0]) => items.indexOf(item);

  return (
    <div className="animate-fade-in">
      <p className="text-sm mb-4 text-center" style={{ color: 'hsl(var(--c-fg-muted))' }}>
        {lang === 'en'
          ? '📦 Tap an item, then tap a bucket to sort it!'
          : '📦 Натисни предмет, после натисни кофа, за да го сортираш!'}
      </p>

      {/* Unsorted items */}
      {unsorted.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4 justify-center min-h-[60px]">
          {unsorted.map((item) => {
            const idx = getItemIdx(item);
            return (
              <div key={idx}
                className="rounded-xl px-3 py-2 cursor-pointer transition-all animate-scale-in flex items-center gap-2"
                style={{
                  background: 'var(--c-glass)',
                  border: '1.5px solid var(--c-border)',
                  color: 'hsl(var(--c-fg))',
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                }}>
                <span>{item.emoji}</span>
                <span>{item.label[lang]}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Drop zones */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        {[
          {
            id: 'asset' as const,
            label: lang === 'en' ? '✅ Assets' : '✅ Активи',
            sublabel: lang === 'en' ? 'Put money IN' : 'Слагат пари В джоба',
            color: 'hsl(var(--c-green))',
            dimColor: 'hsl(var(--c-green)/0.08)',
            borderColor: 'hsl(var(--c-green)/0.3)',
            itemList: assetItems,
          },
          {
            id: 'liability' as const,
            label: lang === 'en' ? '❌ Liabilities' : '❌ Пасиви',
            sublabel: lang === 'en' ? 'Take money OUT' : 'Вземат пари ОТ джоба',
            color: 'hsl(var(--c-red))',
            dimColor: 'hsl(var(--c-red)/0.08)',
            borderColor: 'hsl(var(--c-red)/0.3)',
            itemList: liabilityItems,
          },
        ].map((bucket) => (
          <div key={bucket.id} className="rounded-2xl p-3 min-h-[120px]"
            style={{ background: bucket.dimColor, border: `1.5px dashed ${bucket.borderColor}` }}>
            <p className="text-xs font-bold mb-0.5" style={{ color: bucket.color }}>{bucket.label}</p>
            <p className="text-xs mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>{bucket.sublabel}</p>
            <div className="space-y-1.5">
              {bucket.itemList.map((item) => {
                const idx = getItemIdx(item);
                const isCorrect = item.isAsset ? bucket.id === 'asset' : bucket.id === 'liability';
                return (
                  <div key={idx}
                    onClick={() => !submitted && assign(idx, bucket.id)}
                    className="rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 cursor-pointer transition-all"
                    style={{
                      background: submitted
                        ? isCorrect ? 'hsl(var(--c-green)/0.15)' : 'hsl(var(--c-red)/0.15)'
                        : 'var(--c-glass)',
                      border: submitted
                        ? `1px solid ${isCorrect ? 'hsl(var(--c-green)/0.4)' : 'hsl(var(--c-red)/0.4)'}`
                        : '1px solid var(--c-border)',
                      fontSize: '0.75rem',
                      color: 'hsl(var(--c-fg))',
                    }}>
                    <span>{item.emoji}</span>
                    <span className="flex-1">{item.label[lang]}</span>
                    {submitted && <span>{isCorrect ? '✓' : '✗'}</span>}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Tap-to-sort: show items with buttons when unsorted items remain */}
      {unsorted.length > 0 && (
        <div className="space-y-2 mb-4">
          {unsorted.map((item) => {
            const idx = getItemIdx(item);
            return (
              <div key={idx} className="rounded-xl p-3 flex items-center gap-3"
                style={{ background: 'var(--c-glass)', border: '1px solid var(--c-border)' }}>
                <span className="text-xl">{item.emoji}</span>
                <span className="flex-1 text-sm" style={{ color: 'hsl(var(--c-fg))' }}>{item.label[lang]}</span>
                <button onClick={() => assign(idx, 'asset')}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                  style={{ background: 'hsl(var(--c-green)/0.1)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.3)' }}>
                  ✅
                </button>
                <button onClick={() => assign(idx, 'liability')}
                  className="text-xs px-2.5 py-1.5 rounded-lg font-semibold"
                  style={{ background: 'hsl(var(--c-red)/0.1)', color: 'hsl(var(--c-red))', border: '1px solid hsl(var(--c-red)/0.3)' }}>
                  ❌
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!submitted && (
        <button className="btn-primary w-full" onClick={handleSubmit} disabled={!allSorted}>
          {lang === 'en' ? 'Check Answers →' : 'Провери отговорите →'}
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
