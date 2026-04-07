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
  type: 'theory' | 'choice' | 'fill_blank' | 'budget_slider' | 'rpg_scenario' | 'rat_race' | 'compound_sim' | 'sort_items';
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
  lessons: LessonMeta[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  xp: number;
  streak: number;
  avatar?: string;
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
