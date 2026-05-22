export interface LocalizedText { en: string; bg: string; }
export type Lang = 'en' | 'bg';

export interface TheorySlide {
  title: LocalizedText;
  body: LocalizedText;
  emoji?: string;
  highlight?: LocalizedText;
}

export interface Exercise {
  id: string;
  type: 'theory' | 'choice' | 'fill_blank' | 'budget_slider' | 'rpg_scenario' | 'rat_race' | 'compound_sim' | 'sort_items' | 'match_terms' | 'order_items' | 'true_false' | 'scenario_decision' | 'fill_number' | 'stock_chart' | 'portfolio_pie' | 'debt_payoff' | 'tax_brackets' | 'income_streams' | 'coverage_calc' | 'risk_matrix' | 'unit_price';
  xp: number;
  // theory
  slides?: TheorySlide[];
  // choice / fill_blank
  question?: LocalizedText;
  options?: LocalizedText[];
  correctIndex?: number;
  correctAnswer?: number;
  answerMin?: number;
  answerMax?: number;
  answerUnit?: string;
  explanation?: LocalizedText;
  // budget_slider
  income?: number;
  categories?: { label: LocalizedText; emoji: string; min: number; max: number; ideal: number; }[];
  // rpg_scenario
  scenario?: LocalizedText;
  avatar?: string;
  choices?: {
    label: LocalizedText;
    emoji: string;
    consequence: LocalizedText;
    cashFlowChange: number;
    isGood: boolean;
  }[];
  // rat_race
  ratRaceProfile?: {
    name: LocalizedText;
    job: LocalizedText;
    avatar: string;
    monthlyIncome: number;
    expenses: { label: LocalizedText; emoji: string; amount: number; }[];
    opportunities: { label: LocalizedText; emoji: string; cost: number; monthlyPassive: number; isGood: boolean; }[];
  };
  // compound_sim
  compoundConfig?: { defaultPrincipal: number; defaultRate: number; defaultYears: number; defaultMonthly: number; };
  // sort_items
  sortItems?: { label: LocalizedText; emoji: string; isAsset: boolean; }[];
  // match_terms
  matchPairs?: { term: LocalizedText; definition: LocalizedText; }[];
  // order_items
  orderItems?: { label: LocalizedText; emoji: string; }[];
  correctOrder?: number[];
  orderInstruction?: LocalizedText;
  // true_false
  statement?: LocalizedText;
  isTrue?: boolean;
  // scenario_decision
  decisionScenario?: LocalizedText;
  decisionAvatar?: string;
  decisionChoices?: {
    label: LocalizedText;
    emoji: string;
    outcome: LocalizedText;
    isBest: boolean;
  }[];
  // fill_number
  fillNumberScenario?: LocalizedText;
  fillNumberAnswer?: number;
  fillNumberTolerance?: number;
  fillNumberUnit?: string;
  fillNumberHint?: LocalizedText;
  // stock_chart
  stockChart?: {
    prices: number[];
    labels?: string[];
    scenario?: LocalizedText;
    question: LocalizedText;
    mode: 'identify_point' | 'identify_pattern';
    correctPointIndex?: number;
    pointTolerance?: number;
    pointPrompt?: LocalizedText;
    patternOptions?: LocalizedText[];
    correctPatternIndex?: number;
  };
  // portfolio_pie
  portfolioPie?: {
    scenario?: LocalizedText;
    question?: LocalizedText;
    assets: { label: LocalizedText; emoji: string; color: string; ideal: number; }[];
    tolerance: number;
  };
  // debt_payoff
  debtPayoff?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    debts: { label: LocalizedText; emoji: string; balance: number; apr: number; minPayment: number; }[];
    extraPayment: number;
    correctStrategy: 'snowball' | 'avalanche' | 'even';
  };
  // tax_brackets
  taxBrackets?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    brackets: { upTo: number; rate: number; }[];
    testIncome: number;
    correctAnswer: number;
    tolerance: number;
    unit: string;
    adjustable?: boolean;
    incomeMin?: number;
    incomeMax?: number;
  };
  // income_streams
  incomeStreams?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    targetIncome: number;          // monthly extra income €
    maxHoursPerWeek: number;       // total hours budget
    minPicks: number;              // min number of streams to select
    maxPicks: number;              // max number of streams to select
    streams: {
      label: LocalizedText;
      emoji: string;
      hoursPerWeek: number;
      eurPerHour: number;
      scalability: number;         // 1-5 stars (informational)
      note?: LocalizedText;
    }[];
  };
  // coverage_calc
  coverageCalc?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    claimProbability: number;       // 0-1 annual probability of claim
    expectedLoss: number;            // potential loss €
    premiumMin: number;
    premiumMax: number;
    premiumStep: number;
    deductibleOptions: number[];     // selectable deductibles €
    coverageLimitOptions: number[];  // selectable coverage limits €
    correctPremium: number;
    correctDeductible: number;
    correctCoverageLimit: number;
    tolerance: number;               // tolerance € on premium match
  };
  // risk_matrix
  riskMatrix?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    // quadrants: 0=low-impact/low-likelihood (Accept)
    //            1=low-impact/high-likelihood (Mitigate)
    //            2=high-impact/low-likelihood (Transfer / Insure)
    //            3=high-impact/high-likelihood (Avoid)
    risks: {
      label: LocalizedText;
      emoji: string;
      correctQuadrant: 0 | 1 | 2 | 3;
      explanation?: LocalizedText;
    }[];
  };
  // unit_price
  unitPrice?: {
    scenario?: LocalizedText;
    question: LocalizedText;
    unit: string;                    // e.g. "kg", "L", "wash"
    options: {
      label: LocalizedText;
      emoji: string;
      price: number;                 // total €
      quantity: number;              // amount in `unit`
      note?: LocalizedText;
    }[];
    // correct option = lowest price/quantity automatically
  };
}

export interface LessonMeta {
  id: string;
  moduleId: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  xpReward: number;
  order: number;
  exerciseCount: number;
  completed: boolean;
}

export interface Lesson extends Omit<LessonMeta, 'exerciseCount' | 'completed'> {
  exercises: Exercise[];
}

export interface ModuleMeta {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  color: string;
  order: number;
  proOnly: boolean;
  lessons: LessonMeta[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  avatar?: string;
  created_at?: string;
  last_active?: string;
  is_pro: boolean;
  energy: number;
  energy_refill_at?: string | null;
  onboarding_done: boolean;
  streak_freezes: number;
}

export const LEVELS = [
  { level: 1, label: { en: 'Apprentice', bg: 'Чирак' }, minXp: 0, maxXp: 300 },
  { level: 2, label: { en: 'Saver', bg: 'Спестовник' }, minXp: 300, maxXp: 700 },
  { level: 3, label: { en: 'Analyst', bg: 'Анализатор' }, minXp: 700, maxXp: 1400 },
  { level: 4, label: { en: 'Investor', bg: 'Инвеститор' }, minXp: 1400, maxXp: 2500 },
  { level: 5, label: { en: 'Wealth Builder', bg: 'Строител на богатство' }, minXp: 2500, maxXp: Infinity },
];

export function getLevel(xp: number) {
  return LEVELS.slice().reverse().find((l) => xp >= l.minXp) ?? LEVELS[0];
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  if (level.maxXp === Infinity) return 100;
  return Math.min(100, Math.round(((xp - level.minXp) / (level.maxXp - level.minXp)) * 100));
}
