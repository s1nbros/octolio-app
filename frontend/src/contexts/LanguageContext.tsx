import React, { createContext, useContext, useState } from 'react';
import type { Lang, LocalizedText } from '../types';

interface LanguageContextType {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: LocalizedText) => string;
  ui: typeof UI_EN;
}

const UI_EN = {
  // Nav
  home: 'Home',
  learn: 'Learn',
  dashboard: 'Dashboard',
  logout: 'Log out',
  login: 'Log in',
  signup: 'Sign up',
  // Landing
  hero_title: 'Master Your Finances,',
  hero_title2: 'One Lesson at a Time',
  hero_sub: 'Gamified financial education that actually sticks. Learn budgeting, saving, investing and more — in English or Bulgarian.',
  get_started: 'Get Started Free',
  already_member: 'Already have an account?',
  feature1_title: 'Fun & Gamified',
  feature1_desc: 'Earn XP, maintain streaks and level up as you learn real financial skills.',
  feature2_title: 'Expert Curriculum',
  feature2_desc: 'Structured modules covering budgeting, investing, credit and more.',
  feature3_title: 'Bilingual',
  feature3_desc: 'Learn in English or Bulgarian — switch anytime.',
  feature4_title: 'Track Progress',
  feature4_desc: 'Your progress is saved automatically. Resume any time, any device.',
  // Auth
  email: 'Email',
  password: 'Password',
  full_name: 'Full name',
  sign_in: 'Sign in',
  create_account: 'Create account',
  no_account: "Don't have an account?",
  have_account: 'Already have an account?',
  remember_me: 'Remember me',
  // Dashboard
  welcome_back: 'Welcome back',
  your_progress: 'Your Progress',
  current_streak: 'Day streak',
  total_xp: 'Total XP',
  level: 'Level',
  continue_learning: 'Continue Learning',
  modules_completed: 'Modules',
  lessons_completed: 'Lessons done',
  keep_going: 'Keep going!',
  // Modules
  modules_title: 'Your Learning Path',
  modules_sub: 'Complete lessons in order to unlock new modules.',
  locked: 'Locked',
  completed: 'Completed',
  start: 'Start',
  continue: 'Continue',
  lessons: 'lessons',
  // Lesson
  lesson_complete: 'Lesson Complete!',
  xp_earned: 'XP Earned',
  next_lesson: 'Next Lesson',
  back_to_modules: 'Back to Modules',
  hearts: 'Hearts',
  check: 'Check',
  skip: 'Skip',
  your_answer: 'Your answer',
  correct: 'Correct!',
  incorrect: 'Not quite...',
  explanation: 'Explanation',
  continue_btn: 'Continue',
  type_answer: 'Type your answer...',
  question_of: 'of',
};

const UI_BG: typeof UI_EN = {
  home: 'Начало',
  learn: 'Учи',
  dashboard: 'Табло',
  logout: 'Изход',
  login: 'Вход',
  signup: 'Регистрация',
  hero_title: 'Овладей финансите си,',
  hero_title2: 'един урок наведнъж',
  hero_sub: 'Геймифицирано финансово образование, което остава. Учи бюджетиране, спестяване, инвестиции и още — на английски или български.',
  get_started: 'Започни безплатно',
  already_member: 'Вече имаш акаунт?',
  feature1_title: 'Забавно и геймифицирано',
  feature1_desc: 'Спечели XP, поддържай стрийкове и повишавай ниво, докато учиш реални финансови умения.',
  feature2_title: 'Експертна програма',
  feature2_desc: 'Структурирани модули, обхващащи бюджетиране, инвестиции, кредит и още.',
  feature3_title: 'Двуезично',
  feature3_desc: 'Учи на английски или български — смени по всяко време.',
  feature4_title: 'Следи напредъка',
  feature4_desc: 'Напредъкът ти се записва автоматично. Продължи по всяко време, от всяко устройство.',
  email: 'Имейл',
  password: 'Парола',
  full_name: 'Пълно име',
  sign_in: 'Влез',
  create_account: 'Създай акаунт',
  no_account: 'Нямаш акаунт?',
  have_account: 'Вече имаш акаунт?',
  remember_me: 'Запомни ме',
  welcome_back: 'Добре дошъл',
  your_progress: 'Твоят напредък',
  current_streak: 'Поредни дни',
  total_xp: 'Общо XP',
  level: 'Ниво',
  continue_learning: 'Продължи да учиш',
  modules_completed: 'Модули',
  lessons_completed: 'Завършени уроци',
  keep_going: 'Продължавай!',
  modules_title: 'Твоят път на учене',
  modules_sub: 'Завърши уроците по ред, за да отключиш нови модули.',
  locked: 'Заключено',
  completed: 'Завършено',
  start: 'Започни',
  continue: 'Продължи',
  lessons: 'урока',
  lesson_complete: 'Урокът е завършен!',
  xp_earned: 'Спечелени XP',
  next_lesson: 'Следващ урок',
  back_to_modules: 'Обратно към модулите',
  hearts: 'Животи',
  check: 'Провери',
  skip: 'Пропусни',
  your_answer: 'Твоят отговор',
  correct: 'Правилно!',
  incorrect: 'Не съвсем...',
  explanation: 'Обяснение',
  continue_btn: 'Продължи',
  type_answer: 'Въведи отговора...',
  question_of: 'от',
};

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>(
    () => (localStorage.getItem('octolio_lang') as Lang) || 'en'
  );

  const setLang = (l: Lang) => {
    localStorage.setItem('octolio_lang', l);
    setLangState(l);
  };

  const t = (text: LocalizedText) => text[lang];
  const ui = lang === 'en' ? UI_EN : UI_BG;

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, ui }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLang must be used within LanguageProvider');
  return ctx;
}
