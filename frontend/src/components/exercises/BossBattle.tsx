import { useState } from 'react';
import type { Exercise } from '../../types';
import { useLang } from '../../contexts/LanguageContext';
import { Fireworks } from '../Fireworks';

interface Props { exercise: Exercise; onAnswer: (correct: boolean, xp: number) => void; }

const PLAYER_HP = 3;

/**
 * Boss Battle — the module capstone. A themed "boss" has an HP bar; each
 * correct answer deals 1 damage, each wrong answer costs you a heart and
 * reveals an explanation. Defeat the boss (its HP → 0) to win a mastery
 * badge; lose all hearts and you retry. Boss HP = questions − 2, so you can
 * afford a couple of mistakes but not a meltdown.
 */
export function BossBattle({ exercise, onAnswer }: Props) {
  const { lang } = useLang();
  const cfg = exercise.bossBattle!;
  const questions = cfg.questions;
  const bossMaxHp = Math.max(1, questions.length - 2);

  const [phase, setPhase] = useState<'intro' | 'battle' | 'won' | 'lost'>('intro');
  const [qIdx, setQIdx] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [bossHp, setBossHp] = useState(bossMaxHp);
  const [hearts, setHearts] = useState(PLAYER_HP);
  const [hitFlash, setHitFlash] = useState<null | 'boss' | 'player'>(null);

  const reset = () => {
    setPhase('battle'); setQIdx(0); setPicked(null);
    setBossHp(bossMaxHp); setHearts(PLAYER_HP); setHitFlash(null);
  };

  const q = questions[qIdx];

  const pick = (i: number) => {
    if (picked !== null) return;
    setPicked(i);
    const correct = i === q.correctIndex;
    if (correct) {
      const nextBoss = bossHp - 1;
      setBossHp(nextBoss);
      setHitFlash('boss');
      window.setTimeout(() => {
        setHitFlash(null);
        if (nextBoss <= 0) { setPhase('won'); return; }
        advance();
      }, 800);
    } else {
      const nextHearts = hearts - 1;
      setHearts(nextHearts);
      setHitFlash('player');
      // Wrong answers show an explanation + a Continue button (handled in render).
      if (nextHearts <= 0) {
        window.setTimeout(() => { setHitFlash(null); setPhase('lost'); }, 900);
      }
    }
  };

  const advance = () => {
    setPicked(null);
    setHitFlash(null);
    if (qIdx + 1 >= questions.length) {
      // Ran out of questions — won if boss is down, else it survived → lost.
      setPhase(bossHp <= 0 ? 'won' : 'lost');
    } else {
      setQIdx((n) => n + 1);
    }
  };

  // ── Intro ──
  if (phase === 'intro') {
    return (
      <div className="animate-fade-in text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest mb-2" style={{ color: 'hsl(var(--c-red))' }}>
          ⚔️ {lang === 'en' ? 'Boss Battle' : 'Битка с бос'}
        </p>
        <div className="text-7xl mb-3 animate-bounce-soft">{cfg.boss.emoji}</div>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'hsl(var(--c-fg))' }}>{cfg.boss.name[lang]}</h2>
        <p className="text-sm leading-relaxed mb-6 max-w-sm mx-auto" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {cfg.intro[lang]}
        </p>
        <button className="btn-primary w-full" onClick={() => setPhase('battle')}>
          {lang === 'en' ? 'Begin battle ⚔️' : 'Започни битката ⚔️'}
        </button>
      </div>
    );
  }

  // ── Victory ──
  if (phase === 'won') {
    return (
      <div className="animate-scale-in text-center relative">
        <Fireworks bursts={8} />
        <div className="text-6xl mb-2 animate-prize-pop">{cfg.badge.emoji}</div>
        <p className="text-[11px] font-bold uppercase tracking-widest mb-1" style={{ color: 'hsl(var(--c-green))' }}>
          {lang === 'en' ? 'Victory · badge earned' : 'Победа · значка спечелена'}
        </p>
        <h2 className="text-2xl font-black mb-2" style={{ color: 'hsl(var(--c-fg))' }}>{cfg.badge.label[lang]}</h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? `You defeated ${cfg.boss.name.en}!` : `Победи ${cfg.boss.name.bg}!`}
        </p>
        <button className="btn-green w-full" onClick={() => onAnswer(true, exercise.xp)}>
          {lang === 'en' ? 'Claim reward →' : 'Вземи наградата →'}
        </button>
      </div>
    );
  }

  // ── Defeat ──
  if (phase === 'lost') {
    return (
      <div className="animate-scale-in text-center">
        <div className="text-6xl mb-3" style={{ filter: 'grayscale(0.5)' }}>{cfg.boss.emoji}</div>
        <h2 className="text-xl font-extrabold mb-1" style={{ color: 'hsl(var(--c-red))' }}>
          {lang === 'en' ? 'The boss got you!' : 'Босът те победи!'}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'hsl(var(--c-fg-muted))' }}>
          {lang === 'en' ? 'Shake it off and try again — you know this.' : 'Отърси се и опитай пак — знаеш го това.' }
        </p>
        <button className="btn-primary w-full" onClick={reset}>
          {lang === 'en' ? '↻ Try again' : '↻ Опитай пак'}
        </button>
      </div>
    );
  }

  // ── Battle ──
  const revealed = picked !== null;
  const wasWrong = revealed && picked !== q.correctIndex;
  const bossPct = (bossHp / bossMaxHp) * 100;

  return (
    <div className="animate-fade-in">
      {/* Boss header + HP */}
      <div className="rounded-2xl p-4 mb-4" style={{ background: 'hsl(var(--c-red)/0.08)', border: '1px solid hsl(var(--c-red)/0.25)' }}>
        <div className="flex items-center gap-3 mb-2">
          <span className={`text-3xl ${hitFlash === 'boss' ? 'animate-shake' : ''}`}>{cfg.boss.emoji}</span>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm truncate" style={{ color: 'hsl(var(--c-fg))' }}>{cfg.boss.name[lang]}</p>
            <div className="h-2.5 rounded-full mt-1 overflow-hidden" style={{ background: 'hsl(var(--c-fg)/0.12)' }}>
              <div className="h-full rounded-full" style={{ width: `${bossPct}%`, background: 'hsl(var(--c-red))', transition: 'width 0.4s ease' }} />
            </div>
          </div>
        </div>
        {/* Your hearts */}
        <div className="flex items-center gap-1 justify-end">
          {Array.from({ length: PLAYER_HP }).map((_, i) => (
            <span key={i} className={`text-base ${hitFlash === 'player' && i === hearts ? 'animate-shake' : ''}`}
              style={{ opacity: i < hearts ? 1 : 0.25, filter: i < hearts ? 'none' : 'grayscale(1)' }}>❤️</span>
          ))}
        </div>
      </div>

      {/* Question */}
      <p className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: 'hsl(var(--c-fg-subtle))' }}>
        {lang === 'en' ? `Hit ${qIdx + 1}` : `Удар ${qIdx + 1}`}
      </p>
      <p className="text-base font-semibold leading-relaxed mb-4" style={{ color: 'hsl(var(--c-fg))' }}>{q.q[lang]}</p>

      <div className="space-y-2.5">
        {q.options.map((opt, i) => {
          const isCorrect = revealed && i === q.correctIndex;
          const isWrongPick = revealed && i === picked && picked !== q.correctIndex;
          let border = '1.5px solid var(--c-border)';
          let bg = 'var(--c-glass)';
          if (isCorrect) { border = '2px solid hsl(var(--c-green))'; bg = 'hsl(var(--c-green)/0.12)'; }
          else if (isWrongPick) { border = '2px solid hsl(var(--c-red))'; bg = 'hsl(var(--c-red)/0.1)'; }
          return (
            <button key={i} disabled={revealed} onClick={() => pick(i)}
              className="w-full text-left rounded-xl px-4 py-3 text-sm font-semibold transition-all flex items-center gap-2"
              style={{ border, background: bg, color: 'hsl(var(--c-fg))' }}>
              <span className="flex-1">{opt[lang]}</span>
              {isCorrect && <span>✓</span>}
              {isWrongPick && <span>✗</span>}
            </button>
          );
        })}
      </div>

      {/* Wrong-answer explanation + Continue */}
      {wasWrong && hearts > 0 && (
        <>
          {q.explanation && (
            <div className="rounded-xl p-3 mt-4 text-sm" style={{ background: 'hsl(var(--c-red)/0.08)', border: '1px solid hsl(var(--c-red)/0.25)', color: 'hsl(var(--c-fg-muted))' }}>
              {q.explanation[lang]}
            </div>
          )}
          <button className="btn-primary w-full mt-4" onClick={advance}>
            {lang === 'en' ? 'Continue →' : 'Продължи →'}
          </button>
        </>
      )}
    </div>
  );
}
