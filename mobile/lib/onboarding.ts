/** Onboarding definitions (mirror of frontend/src/shared/onboardingData.ts, English). */
export type Level = 'beginner' | 'intermediate' | 'advanced';

export const GOALS = [
  { id: 'budget', emoji: '📊', label: 'Build a budget that works' },
  { id: 'save', emoji: '💰', label: 'Save for something big' },
  { id: 'debt', emoji: '🔓', label: 'Get out of debt' },
  { id: 'invest', emoji: '📈', label: 'Start investing' },
  { id: 'understand', emoji: '🧠', label: 'Just understand money better' },
] as const;

export const DIAGNOSTIC = [
  {
    question: 'You leave €1,000 in a savings account at 4% interest for a year. Roughly how much interest do you earn?',
    options: ['€4', '€40', '€400', '€4,000'],
    correctIndex: 1,
  },
  {
    question: 'What does "diversification" mean when investing?',
    options: ['Putting all your money in one winning stock', 'Spreading money across different assets to lower risk', 'Trading as often as possible', 'Only investing in your home country'],
    correctIndex: 1,
  },
  {
    question: 'Which debt usually costs you the most over time?',
    options: ['A mortgage at 3%', 'A student loan at 5%', 'Credit card debt at 20%+', 'A car loan at 7%'],
    correctIndex: 2,
  },
];

export function scoreToLevel(correct: number): Level {
  if (correct >= 3) return 'advanced';
  if (correct === 2) return 'intermediate';
  return 'beginner';
}

export const LEVEL_LABEL: Record<Level, string> = { beginner: 'Beginner', intermediate: 'Intermediate', advanced: 'Advanced' };

export const DAILY_OPTIONS: { minutes: number; label: string; sub: string; recommended?: boolean }[] = [
  { minutes: 3, label: 'Casual', sub: '3 min / day' },
  { minutes: 5, label: 'Regular', sub: '5 min / day', recommended: true },
  { minutes: 10, label: 'Serious', sub: '10 min / day' },
];
