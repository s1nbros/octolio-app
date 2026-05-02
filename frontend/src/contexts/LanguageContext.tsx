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
  forgot_link: 'Forgot password?',
  forgot_title: 'Forgot password',
  forgot_sub: "Enter your email and we'll send you a link to reset your password.",
  forgot_button: 'Send reset link',
  forgot_sent: 'If that email is registered, a reset link is on its way. Check your inbox.',
  reset_title: 'Set a new password',
  reset_button: 'Reset password',
  reset_done: 'Password updated. Redirecting to sign-in…',
  reset_no_token: 'Reset link is missing or invalid.',
  new_password: 'New password',
  confirm_password: 'Confirm password',
  verify_title: 'Verify your email',
  verify_check_inbox: 'Check your inbox',
  verify_sub: "We sent a 6-digit code to your inbox. Enter it below to activate your account.",
  verify_inbox_with_email: 'We sent a verification email to',
  verify_inbox_generic: 'We sent a verification email to your inbox.',
  verify_instructions: 'Click the link in the email or enter the 6-digit code below. The code expires in 30 minutes.',
  verify_check_spam: "Don't see it? Check your spam folder.",
  verify_code_label: 'Verification code',
  verify_button: 'Verify email',
  verify_no_email: "Didn't get an email?",
  verify_resend: 'Resend',
  verify_resent: 'Verification email sent. Check your inbox.',
  verify_resend_wait: 'Wait a few seconds before resending again.',
  verify_enter_code: 'Enter the 6-digit code from the email',
  verify_email_required: 'Enter your email first',
  login_verify_required: 'Your email is not yet verified.',
  reg_checking: 'Checking availability…',
  reg_name_min: 'At least 2 characters',
  reg_name_no_spaces: 'No spaces allowed in username',
  reg_name_banned: 'This nickname is not allowed',
  reg_name_taken: 'This nickname is already taken',
  reg_name_available: 'Nickname available',
  reg_email_invalid: 'Enter a valid email address',
  reg_email_taken: 'This email is already registered',
  reg_email_ok: 'Email available',
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
  modules_sub: 'Tap a module to start your journey.',
  locked: 'Locked',
  completed: 'Completed',
  start: 'Start',
  continue: 'Continue',
  lessons: 'lessons',
  pick_lesson: 'Pick a lesson',
  unlock_pro: 'Unlock with Pro',
  // Exit confirmation
  exit_confirm_title: 'Are you sure you want to exit?',
  exit_confirm_body: "Your progress in this lesson won't be saved.",
  exit_confirm_stay: 'Keep going',
  exit_confirm_leave: 'Exit lesson',
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
  forgot_link: 'Забравена парола?',
  forgot_title: 'Забравена парола',
  forgot_sub: 'Въведи имейла си и ще ти изпратим връзка за смяна на паролата.',
  forgot_button: 'Изпрати връзка',
  forgot_sent: 'Ако този имейл е регистриран, изпратихме връзка за смяна. Провери пощата си.',
  reset_title: 'Избери нова парола',
  reset_button: 'Смени паролата',
  reset_done: 'Паролата е сменена. Препращаме те към входа…',
  reset_no_token: 'Връзката за смяна липсва или е невалидна.',
  new_password: 'Нова парола',
  confirm_password: 'Потвърди паролата',
  verify_title: 'Потвърди имейла си',
  verify_check_inbox: 'Провери пощата си',
  verify_sub: 'Изпратихме 6-цифрен код на имейла ти. Въведи го по-долу, за да активираш акаунта.',
  verify_inbox_with_email: 'Изпратихме имейл за потвърждение на',
  verify_inbox_generic: 'Изпратихме имейл за потвърждение в пощата ти.',
  verify_instructions: 'Кликни на връзката в имейла или въведи 6-цифрения код по-долу. Кодът изтича след 30 минути.',
  verify_check_spam: 'Не виждаш имейла? Провери папката Spam.',
  verify_code_label: 'Код за потвърждение',
  verify_button: 'Потвърди',
  verify_no_email: 'Не получи имейл?',
  verify_resend: 'Изпрати отново',
  verify_resent: 'Имейлът е изпратен повторно. Провери пощата си.',
  verify_resend_wait: 'Изчакай няколко секунди преди да опиташ отново.',
  verify_enter_code: 'Въведи 6-цифрения код от имейла',
  verify_email_required: 'Първо въведи имейла си',
  login_verify_required: 'Имейлът ти все още не е потвърден.',
  reg_checking: 'Проверявам…',
  reg_name_min: 'Поне 2 символа',
  reg_name_no_spaces: 'Не са позволени интервали',
  reg_name_banned: 'Този прякор не е позволен',
  reg_name_taken: 'Този прякор вече е зает',
  reg_name_available: 'Прякорът е свободен',
  reg_email_invalid: 'Въведи валиден имейл адрес',
  reg_email_taken: 'Този имейл вече е регистриран',
  reg_email_ok: 'Имейлът е свободен',
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
  modules_sub: 'Натисни модул, за да започнеш.',
  locked: 'Заключено',
  completed: 'Завършено',
  start: 'Започни',
  continue: 'Продължи',
  lessons: 'урока',
  pick_lesson: 'Избери урок',
  unlock_pro: 'Отключи с Pro',
  exit_confirm_title: 'Сигурен ли си, че искаш да излезеш?',
  exit_confirm_body: 'Прогресът ти в този урок няма да бъде запазен.',
  exit_confirm_stay: 'Продължи',
  exit_confirm_leave: 'Излез от урока',
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
