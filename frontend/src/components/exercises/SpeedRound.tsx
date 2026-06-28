import { useEffect, useRef, useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

/**
 * Speed Round — timed rapid-fire. Each question has a shrinking timer bar; a
 * timeout counts as wrong and auto-advances. Combo builds for consecutive
 * correct answers. Pass if score ≥ passScore (default 60%).
 */
export function SpeedRound({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const cfg = exercise.speedRound!;
  const questions = cfg.questions;
  const perQ = (cfg.secondsPerQuestion ?? 8) * 1000;
  const passScore = cfg.passScore ?? 0.6;

  const [started, setStarted] = useState(false);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);
  const [remaining, setRemaining] = useState(perQ);
  const [done, setDone] = useState(false);

  const tickRef = useRef<number | null>(null);
  const lockRef = useRef(false);

  // Per-question countdown.
  useEffect(() => {
    if (!started || done || picked !== null) return;
    setRemaining(perQ);
    const start = Date.now();
    tickRef.current = window.setInterval(() => {
      const left = perQ - (Date.now() - start);
      if (left <= 0) {
        window.clearInterval(tickRef.current!);
        handlePick(-1); // timeout = wrong
      } else {
        setRemaining(left);
      }
    }, 50);
    return () => { if (tickRef.current) window.clearInterval(tickRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idx, started]);

  const handlePick = (choice: number) => {
    if (lockRef.current) return;
    lockRef.current = true;
    if (tickRef.current) window.clearInterval(tickRef.current);
    setPicked(choice);
    const correct = choice === questions[idx].correctIndex;
    if (correct) {
      setScore((s) => s + 1);
      setCombo((c) => { const n = c + 1; setMaxCombo((m) => Math.max(m, n)); return n; });
    } else {
      setCombo(0);
    }
    window.setTimeout(() => {
      lockRef.current = false;
      setPicked(null);
      if (idx + 1 >= questions.length) setDone(true);
      else setIdx((i) => i + 1);
    }, 700);
  };

  // ── Intro ──
  if (!started) {
    return (
      <div className="animate-fade-in text-center">
        <div className="text-5xl mb-3">⚡</div>
        <h3 className="text-xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-fg))' }}>
          {lang === 'en' ? 'Speed Round' : 'Бърз рунд'}
        </h3>
        <p className="text-sm mb-2" style={{ color: 'hsl(var(--c-fg-muted))' }}>{cfg.prompt[lang]}</p>
        <p className="text-xs mb-6" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
          {questions.length} {lang === 'en' ? 'questions' : 'въпроса'} · {(cfg.secondsPerQuestion ?? 8)}s {lang === 'en' ? 'each' : 'всеки'}
        </p>
        <button className="btn-green w-full animate-bounce-soft" onClick={() => setStarted(true)}>
          {lang === 'en' ? 'Start ⚡' : 'Старт ⚡'}
        </button>
      </div>
    );
  }

  // ── Results ──
  if (done) {
    const frac = score / questions.length;
    const passed = frac >= passScore;
    return (
      <div className="animate-scale-in text-center">
        <div className="text-5xl mb-3">{passed ? '🏆' : '🔁'}</div>
        <h3 className="text-2xl font-black mb-1" style={{ color: passed ? 'hsl(var(--c-green))' : 'hsl(var(--c-fg))' }}>
          {score} / {questions.length}
        </h3>
        <p className="text-sm mb-1" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? 'Best combo' : 'Най-добра серия'}: 🔥 {maxCombo}
        </p>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {passed ? (lang === 'en' ? 'Sharp and fast!' : 'Бързо и точно!') : (lang === 'en' ? 'Give it another go.' : 'Опитай пак.')}
        </p>
        <button className="btn-primary w-full" onClick={() => onAnswer(passed, passed ? exercise.xp : 0)}>
          {lang === 'en' ? 'Continue →' : 'Продължи →'}
        </button>
      </div>
    );
  }

  // ── Active question ──
  const q = questions[idx];
  const pct = Math.max(0, (remaining / perQ) * 100);
  const lowTime = remaining < perQ * 0.35;

  return (
    <div className="animate-fade-in">
      {/* Top bar: progress + combo */}
      <div className="flex items-center justify-between mb-2 text-xs font-bold">
        <span style={{ color: 'hsl(var(--c-fg-subtle))' }}>{idx + 1} / {questions.length}</span>
        {combo >= 2 && <span style={{ color: 'hsl(var(--c-orange))' }}>🔥 {combo} {lang === 'en' ? 'combo' : 'серия'}</span>}
      </div>

      {/* Timer bar */}
      <div className="h-2 rounded-full mb-5 overflow-hidden" style={{ background: 'hsl(var(--c-fg)/0.1)' }}>
        <div className="h-full rounded-full" style={{
          width: `${pct}%`,
          background: lowTime ? 'hsl(var(--c-red))' : 'hsl(var(--c-green))',
          transition: 'width 0.05s linear',
        }} />
      </div>

      <p className="text-base font-semibold leading-relaxed mb-5 min-h-[3rem]" style={{ color: 'hsl(var(--c-fg))' }}>
        {q.q[lang]}
      </p>

      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const revealed = picked !== null;
          const isCorrect = revealed && i === q.correctIndex;
          const isWrongPick = revealed && i === picked && picked !== q.correctIndex;
          let border = '1.5px solid var(--c-border)';
          let bg = 'var(--c-glass)';
          if (isCorrect) { border = '2px solid hsl(var(--c-green))'; bg = 'hsl(var(--c-green)/0.12)'; }
          else if (isWrongPick) { border = '2px solid hsl(var(--c-red))'; bg = 'hsl(var(--c-red)/0.1)'; }
          return (
            <button key={i}
              disabled={revealed}
              onClick={() => handlePick(i)}
              className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2"
              style={{ border, background: bg, color: 'hsl(var(--c-fg))' }}>
              <span className="flex-1">{opt[lang]}</span>
              {isCorrect && <span>✓</span>}
              {isWrongPick && <span>✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
