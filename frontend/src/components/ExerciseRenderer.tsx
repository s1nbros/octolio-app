import { useState } from 'react';
import type { Exercise } from '../types';
import { useLang } from '../contexts/LanguageContext';
import { TheoryCard } from './exercises/TheoryCard';
import { RPGScenario } from './exercises/RPGScenario';
import { BudgetSlider } from './exercises/BudgetSlider';
import { RatRaceGame } from './exercises/RatRaceGame';
import { CompoundSim } from './exercises/CompoundSim';
import { SortItems } from './exercises/SortItems';
import { MatchTerms } from './exercises/MatchTerms';
import { OrderItems } from './exercises/OrderItems';
import { TrueFalse } from './exercises/TrueFalse';
import { ScenarioDecision } from './exercises/ScenarioDecision';
import { FillNumber } from './exercises/FillNumber';
import { StockChart } from './exercises/StockChart';
import { PortfolioPie } from './exercises/PortfolioPie';
import { DebtPayoff } from './exercises/DebtPayoff';
import { TaxBrackets } from './exercises/TaxBrackets';
import { IncomeStreams } from './exercises/IncomeStreams';
import { CoverageCalc } from './exercises/CoverageCalc';
import { RiskMatrix } from './exercises/RiskMatrix';
import { UnitPrice } from './exercises/UnitPrice';
import { LifeSimulation } from './exercises/LifeSimulation';
import { SwipeSort } from './exercises/SwipeSort';
import { SpeedRound } from './exercises/SpeedRound';

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean, xp: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

export function ExerciseRenderer({ exercise, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t, lang, ui } = useLang();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [answerState, setAnswerState] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const isChecked = answerState !== 'idle';

  // ── Theory: auto-complete with 0 XP ──
  if (exercise.type === 'theory') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={0} isTheory />
        <TheoryCard exercise={exercise} onDone={() => onAnswer(true, 0)} />
      </div>
    );
  }

  // ── RPG Scenario ──
  if (exercise.type === 'rpg_scenario') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <RPGScenario exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Budget Slider ──
  if (exercise.type === 'budget_slider') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <BudgetSlider exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Rat Race ──
  if (exercise.type === 'rat_race') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <RatRaceGame exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Compound Sim ──
  if (exercise.type === 'compound_sim') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <CompoundSim exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Sort Items ──
  if (exercise.type === 'sort_items') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <SortItems exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Match Terms ──
  if (exercise.type === 'match_terms') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <MatchTerms exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Order Items ──
  if (exercise.type === 'order_items') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <OrderItems exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── True False ──
  if (exercise.type === 'true_false') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <TrueFalse exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Scenario Decision ──
  if (exercise.type === 'scenario_decision') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <ScenarioDecision exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Fill Number ──
  if (exercise.type === 'fill_number') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <FillNumber exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Stock Chart ──
  if (exercise.type === 'stock_chart') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <StockChart exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Portfolio Pie ──
  if (exercise.type === 'portfolio_pie') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <PortfolioPie exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Debt Payoff ──
  if (exercise.type === 'debt_payoff') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <DebtPayoff exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Tax Brackets ──
  if (exercise.type === 'tax_brackets') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <TaxBrackets exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Income Streams ──
  if (exercise.type === 'income_streams') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <IncomeStreams exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Coverage Calc ──
  if (exercise.type === 'coverage_calc') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <CoverageCalc exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Risk Matrix ──
  if (exercise.type === 'risk_matrix') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <RiskMatrix exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Unit Price ──
  if (exercise.type === 'unit_price') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <UnitPrice exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Life Simulation ──
  if (exercise.type === 'life_sim') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <LifeSimulation exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Swipe Sort ──
  if (exercise.type === 'swipe_sort') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <SwipeSort exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Speed Round ──
  if (exercise.type === 'speed_round') {
    return (
      <div>
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <SpeedRound exercise={exercise} onAnswer={onAnswer} />
      </div>
    );
  }

  // ── Choice ──
  if (exercise.type === 'choice') {
    const handleCheck = () => {
      if (selectedIndex === null) return;
      const correct = selectedIndex === exercise.correctIndex;
      setAnswerState(correct ? 'correct' : 'wrong');
      if (correct) {
        setTimeout(() => onAnswer(true, exercise.xp), 1400);
      }
    };

    return (
      <div className="animate-scale-in">
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <p className="text-base font-semibold leading-relaxed mb-5" style={{ color: 'hsl(var(--c-fg))' }}>
          {t(exercise.question!)}
        </p>
        <div className="space-y-3 mb-5">
          {(exercise.options ?? []).map((opt, i) => {
            let cls = 'choice-option';
            if (isChecked) {
              if (i === exercise.correctIndex) cls += ' correct';
              else if (i === selectedIndex) cls += ' wrong';
            } else if (i === selectedIndex) {
              cls += ' selected';
            }
            return (
              <button key={i} className={cls} disabled={isChecked}
                onClick={() => !isChecked && setSelectedIndex(i)}>
                <OptionBullet index={i} isSelected={selectedIndex === i} isChecked={isChecked}
                  isCorrect={i === exercise.correctIndex} isWrong={isChecked && i === selectedIndex && i !== exercise.correctIndex} />
                <span className="flex-1">{opt[lang]}</span>
              </button>
            );
          })}
        </div>
        {isChecked && exercise.explanation && (
          <div className="rounded-xl p-4 mb-4 animate-slide-up"
            style={{
              background: answerState === 'correct' ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
              border: `1px solid ${answerState === 'correct' ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
            }}>
            <p className="font-semibold text-sm mb-1"
              style={{ color: answerState === 'correct' ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
              {answerState === 'correct' ? `✓ ${ui.correct}` : `✗ ${ui.incorrect}`}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation)}
            </p>
          </div>
        )}
        {!isChecked && (
          <button className="btn-primary w-full" onClick={handleCheck} disabled={selectedIndex === null}>
            {ui.check}
          </button>
        )}
        {isChecked && answerState === 'wrong' && (
          <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
            {lang === 'en' ? 'Continue →' : 'Продължи →'}
          </button>
        )}
      </div>
    );
  }

  // ── Fill Blank ──
  if (exercise.type === 'fill_blank') {
    const handleCheck = () => {
      const val = parseFloat(fillValue.replace(/[^0-9.]/g, ''));
      if (isNaN(val)) return;
      const min = exercise.answerMin ?? exercise.correctAnswer! - 0.01;
      const max = exercise.answerMax ?? exercise.correctAnswer! + 0.01;
      const correct = val >= min && val <= max;
      setAnswerState(correct ? 'correct' : 'wrong');
      if (correct) {
        setTimeout(() => onAnswer(true, exercise.xp), 1400);
      }
    };

    return (
      <div className="animate-scale-in">
        <ExerciseHeader questionNumber={questionNumber} totalQuestions={totalQuestions} xp={exercise.xp} />
        <p className="text-base font-semibold leading-relaxed mb-5" style={{ color: 'hsl(var(--c-fg))' }}>
          {t(exercise.question!)}
        </p>
        <div className="flex gap-2 mb-4">
          {exercise.answerUnit && (
            <span className="text-xl font-bold self-center" style={{ color: 'hsl(var(--c-green))' }}>
              {exercise.answerUnit}
            </span>
          )}
          <input type="number" className="input-field flex-1"
            placeholder={ui.type_answer} value={fillValue}
            onChange={e => !isChecked && setFillValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fillValue && !isChecked && handleCheck()}
            disabled={isChecked}
            style={{
              borderColor: isChecked ? (answerState === 'correct' ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))') : undefined,
              background: isChecked ? (answerState === 'correct' ? 'hsl(var(--c-green)/0.08)' : 'hsl(var(--c-red)/0.08)') : undefined,
            }} />
        </div>
        {isChecked && answerState === 'wrong' && (
          <p className="text-sm mb-3" style={{ color: 'hsl(var(--c-red))' }}>
            ✗ {lang === 'en' ? 'Correct answer:' : 'Правилен отговор:'} {exercise.correctAnswer}{exercise.answerUnit}
          </p>
        )}
        {isChecked && exercise.explanation && (
          <div className="rounded-xl p-4 mb-4 animate-slide-up"
            style={{
              background: answerState === 'correct' ? 'hsl(var(--c-green)/0.1)' : 'hsl(var(--c-red)/0.1)',
              border: `1px solid ${answerState === 'correct' ? 'hsl(var(--c-green)/0.3)' : 'hsl(var(--c-red)/0.3)'}`,
            }}>
            <p className="font-semibold text-sm mb-1"
              style={{ color: answerState === 'correct' ? 'hsl(var(--c-green))' : 'hsl(var(--c-red))' }}>
              {answerState === 'correct' ? `✓ ${ui.correct}` : `✗ ${ui.incorrect}`}
            </p>
            <p className="text-sm leading-relaxed" style={{ color: 'hsl(var(--c-fg-muted))' }}>
              {t(exercise.explanation!)}
            </p>
          </div>
        )}
        {!isChecked && (
          <button className="btn-primary w-full" onClick={handleCheck} disabled={!fillValue.trim()}>
            {ui.check}
          </button>
        )}
        {isChecked && answerState === 'wrong' && (
          <button className="btn-primary w-full" onClick={() => onAnswer(false, 0)}>
            {lang === 'en' ? 'Continue →' : 'Продължи →'}
          </button>
        )}
      </div>
    );
  }

  return null;
}

function ExerciseHeader({ questionNumber, totalQuestions, xp, isTheory }: {
  questionNumber: number; totalQuestions: number; xp: number; isTheory?: boolean;
}) {
  const { lang } = useLang();
  return (
    <div className="flex items-center gap-2 mb-4">
      <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
        style={{ background: isTheory ? 'hsl(var(--c-purple)/0.12)' : 'hsl(var(--c-primary)/0.12)', color: isTheory ? 'hsl(var(--c-purple))' : 'hsl(var(--c-primary))', border: `1px solid ${isTheory ? 'hsl(var(--c-purple)/0.2)' : 'hsl(var(--c-primary)/0.2)'}` }}>
        {isTheory ? (lang === 'en' ? '📖 Theory' : '📖 Теория') : `${questionNumber} / ${totalQuestions}`}
      </span>
      {xp > 0 && (
        <span className="text-xs font-semibold px-2 py-1 rounded-full"
          style={{ background: 'hsl(var(--c-green)/0.1)', color: 'hsl(var(--c-green))', border: '1px solid hsl(var(--c-green)/0.2)' }}>
          +{xp} XP
        </span>
      )}
    </div>
  );
}

function OptionBullet({ index, isSelected, isChecked, isCorrect, isWrong }: {
  index: number; isSelected: boolean; isChecked: boolean; isCorrect: boolean; isWrong: boolean;
}) {
  if (isChecked && isCorrect) return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: 'hsl(var(--c-green))', color: 'hsl(var(--c-bg))' }}>✓</span>
  );
  if (isWrong) return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: 'hsl(var(--c-red))', color: '#fff' }}>✗</span>
  );
  return (
    <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
      style={{
        background: isSelected ? 'hsl(var(--c-primary)/0.2)' : 'var(--c-glass)',
        border: `1.5px solid ${isSelected ? 'hsl(var(--c-primary))' : 'var(--c-border)'}`,
        color: isSelected ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg-muted))',
      }}>
      {['A', 'B', 'C', 'D'][index]}
    </span>
  );
}
