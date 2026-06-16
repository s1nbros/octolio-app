// ───────────────────────────────────────────────────────────────
// onboardingData.ts
// Shared definitions for the goal-based onboarding wizard.
// Used by Onboarding.tsx (the flow) and Modules.tsx (the dashboard
// greeting / Continue hero) so goal copy stays in one place.
// ───────────────────────────────────────────────────────────────

export type Lang = 'en' | 'bg';
export type GoalId = 'save' | 'debt' | 'invest' | 'understand' | 'budget';
export type Level = 'beginner' | 'intermediate' | 'advanced';

export interface Goal {
  id: GoalId;
  emoji: string;
  label: { en: string; bg: string };
  blurb: { en: string; bg: string };
}

export const GOALS: Goal[] = [
  {
    id: 'budget',
    emoji: '📊',
    label: { en: 'Build a budget that works', bg: 'Изградя работещ бюджет' },
    blurb: {
      en: 'Take control of where your money goes each month.',
      bg: 'Поеми контрол върху това къде отиват парите ти всеки месец.',
    },
  },
  {
    id: 'save',
    emoji: '💰',
    label: { en: 'Save for something big', bg: 'Спестя за нещо голямо' },
    blurb: {
      en: 'An emergency fund, a trip, a home — build the habit.',
      bg: 'Авариен фонд, пътуване, дом — изгради навика.',
    },
  },
  {
    id: 'debt',
    emoji: '🔓',
    label: { en: 'Get out of debt', bg: 'Изляза от дългове' },
    blurb: {
      en: 'A clear, proven plan to become debt-free faster.',
      bg: 'Ясен, доказан план да станеш без дългове по-бързо.',
    },
  },
  {
    id: 'invest',
    emoji: '📈',
    label: { en: 'Start investing', bg: 'Започна да инвестирам' },
    blurb: {
      en: 'Make your money grow — ETFs, compounding, risk.',
      bg: 'Накарай парите си да растат — ETF-и, сложна лихва, риск.',
    },
  },
  {
    id: 'understand',
    emoji: '🧠',
    label: { en: 'Just understand money better', bg: 'Просто разбера парите по-добре' },
    blurb: {
      en: 'Build real confidence across all the fundamentals.',
      bg: 'Изгради истинска увереност по всички основи.',
    },
  },
];

export function getGoal(id?: string | null): Goal | undefined {
  return GOALS.find((g) => g.id === id);
}

// ── Diagnostic (3 quick questions → experience level) ──────────
export interface DiagnosticQuestion {
  id: string;
  question: { en: string; bg: string };
  options: { en: string; bg: string }[];
  correctIndex: number;
}

export const DIAGNOSTIC: DiagnosticQuestion[] = [
  {
    id: 'd-interest',
    question: {
      en: 'You leave €1,000 in a savings account at 4% interest for a year. Roughly how much interest do you earn?',
      bg: 'Оставяш €1,000 в спестовна сметка при 4% лихва за година. Приблизително колко лихва печелиш?',
    },
    options: [
      { en: '€4', bg: '€4' },
      { en: '€40', bg: '€40' },
      { en: '€400', bg: '€400' },
      { en: '€4,000', bg: '€4,000' },
    ],
    correctIndex: 1,
  },
  {
    id: 'd-diversify',
    question: {
      en: 'What does "diversification" mean when investing?',
      bg: 'Какво означава „диверсификация" при инвестиране?',
    },
    options: [
      { en: 'Putting all your money in one winning stock', bg: 'Влагане на всичко в една печеливша акция' },
      { en: 'Spreading money across different assets to lower risk', bg: 'Разпределяне между различни активи, за да намалиш риска' },
      { en: 'Trading as often as possible', bg: 'Търгуване възможно най-често' },
      { en: 'Only investing in your home country', bg: 'Инвестиране само в собствената ти държава' },
    ],
    correctIndex: 1,
  },
  {
    id: 'd-debt',
    question: {
      en: 'Which debt usually costs you the most over time?',
      bg: 'Кой дълг обикновено ти струва най-много с времето?',
    },
    options: [
      { en: 'A mortgage at 3%', bg: 'Ипотека при 3%' },
      { en: 'A student loan at 5%', bg: 'Студентски заем при 5%' },
      { en: 'Credit card debt at 20%+', bg: 'Дълг по кредитна карта при 20%+' },
      { en: 'A car loan at 7%', bg: 'Автокредит при 7%' },
    ],
    correctIndex: 2,
  },
];

/** Map a diagnostic score (0..N correct) to an experience level. */
export function scoreToLevel(correct: number): Level {
  if (correct >= 3) return 'advanced';
  if (correct === 2) return 'intermediate';
  return 'beginner';
}

export const LEVEL_LABEL: Record<Level, { en: string; bg: string }> = {
  beginner: { en: 'Beginner', bg: 'Начинаещ' },
  intermediate: { en: 'Intermediate', bg: 'Средно ниво' },
  advanced: { en: 'Advanced', bg: 'Напреднал' },
};

// ── Daily commitment options ───────────────────────────────────
export interface DailyOption {
  minutes: number;
  label: { en: string; bg: string };
  sub: { en: string; bg: string };
  recommended?: boolean;
}

export const DAILY_OPTIONS: DailyOption[] = [
  {
    minutes: 3,
    label: { en: 'Casual', bg: 'Спокойно' },
    sub: { en: '3 min / day', bg: '3 мин / ден' },
  },
  {
    minutes: 5,
    label: { en: 'Regular', bg: 'Редовно' },
    sub: { en: '5 min / day', bg: '5 мин / ден' },
    recommended: true,
  },
  {
    minutes: 10,
    label: { en: 'Serious', bg: 'Сериозно' },
    sub: { en: '10 min / day', bg: '10 мин / ден' },
  },
];

// ── Personalized "Money Plan" reveal ───────────────────────────
export interface MoneyPlan {
  title: { en: string; bg: string };
  steps: { en: string; bg: string }[];
}

/**
 * Build a tailored 3-step learning narrative for a goal + level.
 * The first step is always foundations for beginners; advanced users get
 * a faster-tracked framing. These describe the journey — actual lesson
 * unlock order on the dashboard is still sequential.
 */
export function buildPlan(goal: GoalId, level: Level): MoneyPlan {
  const foundationStep =
    level === 'advanced'
      ? {
          en: 'Quick refresher on the fundamentals (you can move fast).',
          bg: 'Бърз преговор на основите (можеш да караш бързо).',
        }
      : {
          en: 'Start with the money fundamentals — budgeting & cash flow.',
          bg: 'Започни с основите — бюджетиране и паричен поток.',
        };

  const byGoal: Record<GoalId, { en: string; bg: string }[]> = {
    budget: [
      { en: 'Master the 50/30/20 rule and track every euro.', bg: 'Овладей правилото 50/30/20 и проследявай всяко евро.' },
      { en: 'Automate savings so budgeting runs itself.', bg: 'Автоматизирай спестяванията, за да се случва само.' },
    ],
    save: [
      { en: 'Build a starter emergency fund that protects you.', bg: 'Изгради стартов авариен фонд, който те пази.' },
      { en: 'Use compound interest to hit big savings goals faster.', bg: 'Използвай сложната лихва, за да стигнеш целите по-бързо.' },
    ],
    debt: [
      { en: 'Learn snowball vs avalanche and pick your strategy.', bg: 'Научи „снежна топка" срещу „лавина" и избери стратегия.' },
      { en: 'Build a payoff plan and protect your credit score.', bg: 'Направи план за изплащане и пази кредитния си рейтинг.' },
    ],
    invest: [
      { en: 'Understand ETFs, risk and diversification (EU/UCITS).', bg: 'Разбери ETF-и, риск и диверсификация (ЕС/UCITS).' },
      { en: 'Build a simple portfolio you can hold for decades.', bg: 'Изгради прост портфейл, който държиш десетилетия.' },
    ],
    understand: [
      { en: 'Cover saving, credit, investing and taxes — end to end.', bg: 'Покрий спестяване, кредит, инвестиции и данъци — от край до край.' },
      { en: 'Build lasting confidence across every money topic.', bg: 'Изгради трайна увереност по всяка тема за пари.' },
    ],
  };

  return {
    title:
      goal === 'debt'
        ? { en: 'Your debt-free plan', bg: 'Твоят план без дългове' }
        : goal === 'invest'
        ? { en: 'Your investing plan', bg: 'Твоят инвестиционен план' }
        : goal === 'save'
        ? { en: 'Your savings plan', bg: 'Твоят план за спестяване' }
        : goal === 'budget'
        ? { en: 'Your budgeting plan', bg: 'Твоят бюджетен план' }
        : { en: 'Your money plan', bg: 'Твоят финансов план' },
    steps: [foundationStep, ...byGoal[goal]],
  };
}
