import { useState } from 'react';
import type { Exercise } from '../types';
import { useLang } from '../contexts/LanguageContext';

interface Props {
  exercise: Exercise;
  onAnswer: (correct: boolean, xp: number) => void;
  questionNumber: number;
  totalQuestions: number;
}

type AnswerState = 'idle' | 'selected' | 'correct' | 'wrong';

export function ExerciseRenderer({ exercise, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t, ui, lang } = useLang();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [fillValue, setFillValue] = useState('');
  const [answerState, setAnswerState] = useState<AnswerState>('idle');

  const isChecked = answerState === 'correct' || answerState === 'wrong';

  const getOptionClass = (index: number) => {
    const base = 'choice-option';
    if (!isChecked) {
      return selectedIndex === index ? `${base} selected` : base;
    }
    if (exercise.type === 'choice') {
      if (index === exercise.correctIndex) return `${base} correct`;
      if (index === selectedIndex && selectedIndex !== exercise.correctIndex) return `${base} wrong`;
    }
    return base;
  };

  const handleCheck = () => {
    if (exercise.type === 'choice') {
      if (selectedIndex === null) return;
      const correct = selectedIndex === exercise.correctIndex;
      setAnswerState(correct ? 'correct' : 'wrong');
      setTimeout(() => onAnswer(correct, correct ? exercise.xp : 0), 1200);
    } else {
      const val = parseFloat(fillValue.replace(/[^0-9.]/g, ''));
      if (isNaN(val)) return;
      const min = exercise.answerMin ?? (exercise.correctAnswer! - 0.01);
      const max = exercise.answerMax ?? (exercise.correctAnswer! + 0.01);
      const correct = val >= min && val <= max;
      setAnswerState(correct ? 'correct' : 'wrong');
      setTimeout(() => onAnswer(correct, correct ? exercise.xp : 0), 1200);
    }
  };

  const canCheck = exercise.type === 'choice'
    ? selectedIndex !== null
    : fillValue.trim().length > 0;

  return (
    <div className="animate-scale-in">
      {/* Question header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-medium px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(99,102,241,0.12)', color: 'hsl(239, 84%, 67%)', border: '1px solid hsl(239,84%,67%,0.2)' }}>
            {ui.question_of ? `${questionNumber} ${ui.question_of} ${totalQuestions}` : `${questionNumber}/${totalQuestions}`}
          </span>
          <span className="text-xs font-medium px-2 py-1 rounded-full"
            style={{ background: 'rgba(255,255,255,0.04)', color: 'hsl(215, 20%, 55%)' }}>
            +{exercise.xp} XP
          </span>
        </div>
        <p className="text-lg font-semibold leading-relaxed" style={{ color: 'hsl(210, 40%, 96%)' }}>
          {t(exercise.question)}
        </p>
      </div>

      {/* Choice options */}
      {exercise.type === 'choice' && exercise.options && (
        <div className="space-y-3 mb-6">
          {exercise.options.map((option, i) => (
            <button
              key={i}
              className={getOptionClass(i)}
              onClick={() => !isChecked && setSelectedIndex(i)}
              disabled={isChecked}
            >
              <OptionBullet
                index={i}
                isSelected={selectedIndex === i}
                isChecked={isChecked}
                isCorrect={i === exercise.correctIndex}
                isWrong={isChecked && i === selectedIndex && selectedIndex !== exercise.correctIndex}
              />
              <span className="flex-1">{option[lang]}</span>
            </button>
          ))}
        </div>
      )}

      {/* Fill in blank */}
      {exercise.type === 'fill_blank' && (
        <div className="mb-6">
          <div className="flex items-center gap-3">
            {exercise.answerUnit && (
              <span className="text-lg font-bold" style={{ color: 'hsl(160, 55%, 55%)' }}>
                {exercise.answerUnit}
              </span>
            )}
            <input
              type="number"
              className="input-field flex-1"
              placeholder={ui.type_answer}
              value={fillValue}
              onChange={(e) => !isChecked && setFillValue(e.target.value)}
              disabled={isChecked}
              style={{
                borderColor: isChecked
                  ? answerState === 'correct'
                    ? 'hsl(160, 55%, 55%)'
                    : 'hsl(0, 72%, 58%)'
                  : undefined,
                background: isChecked
                  ? answerState === 'correct'
                    ? 'hsl(160, 55%, 55%, 0.08)'
                    : 'hsl(0, 72%, 58%, 0.08)'
                  : undefined,
              }}
              onKeyDown={(e) => e.key === 'Enter' && canCheck && !isChecked && handleCheck()}
            />
          </div>
          {isChecked && answerState === 'wrong' && (
            <p className="mt-2 text-sm" style={{ color: 'hsl(0, 72%, 65%)' }}>
              ✗ {lang === 'en' ? 'Correct answer:' : 'Правилен отговор:'} {exercise.correctAnswer}{exercise.answerUnit}
            </p>
          )}
        </div>
      )}

      {/* Feedback */}
      {isChecked && (
        <div
          className="rounded-xl p-4 mb-5 animate-fade-up"
          style={{
            background: answerState === 'correct'
              ? 'hsl(160, 55%, 55%, 0.1)'
              : 'hsl(0, 72%, 58%, 0.1)',
            border: `1px solid ${answerState === 'correct' ? 'hsl(160, 55%, 55%, 0.3)' : 'hsl(0, 72%, 58%, 0.3)'}`,
          }}
        >
          <p className="font-semibold mb-1" style={{
            color: answerState === 'correct' ? 'hsl(160, 55%, 65%)' : 'hsl(0, 72%, 68%)',
          }}>
            {answerState === 'correct' ? `✓ ${ui.correct}` : `✗ ${ui.incorrect}`}
          </p>
          <p className="text-sm leading-relaxed" style={{ color: 'hsl(215, 20%, 70%)' }}>
            {t(exercise.explanation)}
          </p>
        </div>
      )}

      {/* Check button */}
      {!isChecked && (
        <button
          className="btn-primary w-full"
          onClick={handleCheck}
          disabled={!canCheck}
        >
          {ui.check}
        </button>
      )}
    </div>
  );
}

function OptionBullet({
  index, isSelected, isChecked, isCorrect, isWrong,
}: {
  index: number;
  isSelected: boolean;
  isChecked: boolean;
  isCorrect: boolean;
  isWrong: boolean;
}) {
  const letters = ['A', 'B', 'C', 'D'];

  if (isChecked && isCorrect) {
    return (
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: 'hsl(160, 55%, 55%)', color: 'hsl(228, 24%, 8%)' }}>✓</span>
    );
  }
  if (isWrong) {
    return (
      <span className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
        style={{ background: 'hsl(0, 72%, 58%)', color: 'white' }}>✗</span>
    );
  }
  return (
    <span
      className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
      style={{
        background: isSelected ? 'hsl(239, 84%, 67%, 0.2)' : 'rgba(255,255,255,0.06)',
        border: `1.5px solid ${isSelected ? 'hsl(239, 84%, 67%)' : 'rgba(255,255,255,0.12)'}`,
        color: isSelected ? 'hsl(239, 84%, 67%)' : 'hsl(215, 20%, 65%)',
      }}
    >
      {letters[index]}
    </span>
  );
}
