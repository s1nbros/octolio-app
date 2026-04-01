export interface LocalizedText {
  en: string;
  bg: string;
}

export type Lang = 'en' | 'bg';

export interface Exercise {
  id: string;
  type: 'choice' | 'fill_blank';
  question: LocalizedText;
  options?: LocalizedText[];
  correctIndex?: number;
  correctAnswer?: number;
  answerMin?: number;
  answerMax?: number;
  answerUnit?: string;
  explanation: LocalizedText;
  xp: number;
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
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
}

export const LEVELS = [
  { level: 1, label: { en: 'Apprentice', bg: 'Чирак' }, minXp: 0, maxXp: 200 },
  { level: 2, label: { en: 'Student', bg: 'Студент' }, minXp: 200, maxXp: 500 },
  { level: 3, label: { en: 'Analyst', bg: 'Анализатор' }, minXp: 500, maxXp: 1000 },
  { level: 4, label: { en: 'Investor', bg: 'Инвеститор' }, minXp: 1000, maxXp: 2000 },
  { level: 5, label: { en: 'Expert', bg: 'Експерт' }, minXp: 2000, maxXp: Infinity },
];

export function getLevel(xp: number) {
  return LEVELS.slice().reverse().find((l) => xp >= l.minXp) ?? LEVELS[0];
}

export function getLevelProgress(xp: number) {
  const level = getLevel(xp);
  if (level.maxXp === Infinity) return 100;
  const range = level.maxXp - level.minXp;
  const progress = xp - level.minXp;
  return Math.min(100, Math.round((progress / range) * 100));
}
