import { useMemo, useState } from 'react';
import { useLang } from '../contexts/LanguageContext';

type Lang = 'en' | 'bg';

export type Faq = {
  id: string;
  q: { en: string; bg: string };
  a: { en: string; bg: string };
};

export type FaqCategory = {
  id: string;
  label: { en: string; bg: string };
  items: Faq[];
};

export const FAQ_CATEGORIES: FaqCategory[] = [
  {
    id: 'getting-started',
    label: { en: 'Getting Started', bg: 'Първи стъпки' },
    items: [
      {
        id: 'what-is-octolio',
        q: { en: 'What is Octolio?', bg: 'Какво е Octolio?' },
        a: {
          en: 'Octolio is a gamified personal finance learning app — think Duolingo, but for budgeting, saving, investing, taxes, debt, and more. You earn XP, build streaks, level up an octopus mascot, and unlock new modules as you go. The content is tailored to the European market (€, EU rules, UCITS funds, SEPA transfers, etc.).',
          bg: 'Octolio е геймифицирано приложение за финансово обучение — нещо като Duolingo, но за бюджетиране, спестяване, инвестиции, данъци, дългове и още. Печелиш XP, изграждаш стрийкове, развиваш октопод-маскот и отключваш нови модули. Съдържанието е адаптирано към европейския пазар (€, правила на ЕС, UCITS фондове, SEPA преводи и т.н.).',
        },
      },
      {
        id: 'is-it-free',
        q: { en: 'Is Octolio free?', bg: 'Octolio безплатен ли е?' },
        a: {
          en: 'Yes — the core experience is free forever. You can complete the free modules, earn XP, build streaks, collect cosmetics, and use the calculators with no payment. Pro unlocks advanced modules (real estate, tax strategy, advanced investing), unlimited energy, and the AI Financial Advisor.',
          bg: 'Да — основната версия е безплатна завинаги. Можеш да завършваш безплатните модули, да печелиш XP, да изграждаш стрийкове, да събираш козметики и да използваш калкулаторите без плащане. Pro отключва напреднали модули (имоти, данъчна стратегия, напреднали инвестиции), неограничена енергия и AI финансов съветник.',
        },
      },
      {
        id: 'how-to-start',
        q: { en: 'How do I start a lesson?', bg: 'Как започвам урок?' },
        a: {
          en: 'After signing in, open the "Learn" page. Tap any unlocked module to see its lesson path, then tap a lesson node to begin. Lessons are short (6–7 exercises) and cost 3 energy each (or 0 if you have Pro).',
          bg: 'След вход отвори страницата „Учи". Натисни отключен модул, за да видиш пътя му с уроци, после натисни възел с урок, за да започнеш. Уроците са кратки (6–7 упражнения) и струват 3 енергия всеки (или 0 ако имаш Pro).',
        },
      },
      {
        id: 'languages',
        q: { en: 'Which languages are supported?', bg: 'Кои езици се поддържат?' },
        a: {
          en: 'English and Bulgarian. You can switch languages at any time from your profile settings — every lesson, exercise, and explanation is bilingual.',
          bg: 'Английски и български. Можеш да смениш езика по всяко време от настройките на профила — всеки урок, упражнение и обяснение е двуезичен.',
        },
      },
    ],
  },
  {
    id: 'gameplay',
    label: { en: 'Gameplay & Progress', bg: 'Геймплей и прогрес' },
    items: [
      {
        id: 'energy',
        q: { en: 'What is energy and how does it refill?', bg: 'Какво е енергията и как се възстановява?' },
        a: {
          en: 'Energy is the resource that lets you start lessons. The cap is 12, and every lesson costs 3 energy. Energy refills at +3 per hour automatically — you don\'t need to be in the app. Pro users have unlimited energy.',
          bg: 'Енергията е ресурсът, който ти позволява да започваш уроци. Лимитът е 12, всеки урок струва 3 енергия. Възстановява се с +3 на час автоматично — не е нужно да си в приложението. Pro потребителите имат неограничена енергия.',
        },
      },
      {
        id: 'hearts',
        q: { en: 'What are hearts?', bg: 'Какво са сърцата?' },
        a: {
          en: 'Hearts are lives inside a single lesson. You start every lesson with 3 hearts. Each wrong answer costs 1 heart. If you lose all 3, the lesson restarts from exercise 1 (you keep your energy cost but XP for that run is zeroed). Pro and free users both use the same 3-heart system.',
          bg: 'Сърцата са животи в рамките на един урок. Започваш с 3 сърца. Всеки грешен отговор струва 1 сърце. Ако загубиш и трите, урокът се рестартира от упражнение 1 (енергията не се връща, но спечелените XP в този опит се нулират). Pro и безплатните потребители използват една и съща система от 3 сърца.',
        },
      },
      {
        id: 'streak',
        q: { en: 'How does the streak work?', bg: 'Как работи стрийкът?' },
        a: {
          en: 'Your streak bumps +1 the first time you complete a lesson on a new calendar day. Miss a day and the streak resets to 1 — unless you have a streak freeze, which is consumed automatically to save it.',
          bg: 'Стрийкът ти се увеличава с +1 при първия завършен урок в нов календарен ден. Пропуснеш ли ден, се нулира до 1 — освен ако нямаш streak freeze, който се консумира автоматично, за да го запази.',
        },
      },
      {
        id: 'streak-freeze',
        q: { en: 'What is a streak freeze and how do I get one?', bg: 'Какво е streak freeze и как се сдобивам с него?' },
        a: {
          en: 'A streak freeze protects your streak for one missed day. You can hold up to 3, and each one costs 100 XP from the streak-freeze shop on your Profile page. They\'re consumed automatically on the next lesson after a missed day.',
          bg: 'Streak freeze пази стрийка ти за един пропуснат ден. Можеш да държиш до 3, всеки струва 100 XP от магазина за freezes на страницата Профил. Консумират се автоматично при следващия урок след пропуснат ден.',
        },
      },
      {
        id: 'xp-levels',
        q: { en: 'What does XP do?', bg: 'За какво служи XP?' },
        a: {
          en: 'XP measures your overall progress. It drives the leaderboard ranking, unlocks future content tiers, can be exchanged for coins in the shop (2 XP = 1 coin), and is the currency for buying streak freezes (100 XP each).',
          bg: 'XP измерва общия ти прогрес. Определя класирането в League, отключва бъдещи нива на съдържание, може да се обменя за монети в магазина (2 XP = 1 монета) и е валутата за streak freezes (по 100 XP).',
        },
      },
      {
        id: 'spaced-repetition',
        q: { en: 'What is the Review tab?', bg: 'Какво е разделът Review?' },
        a: {
          en: 'Every time you answer an exercise wrong, it lands in a spaced-repetition deck. Review brings it back at growing intervals (1d → 3d → 7d → 21d → 60d) so concepts you struggle with actually stick. Correct answers promote the card; wrong answers reset it.',
          bg: 'Всеки път, когато отговориш грешно, упражнението влиза в колода за интервално повторение. Review го връща на нарастващи интервали (1д → 3д → 7д → 21д → 60д), за да затвърди концепциите, които ти създават трудност. Верните отговори придвижват картата напред; грешните я нулират.',
        },
      },
      {
        id: 'quests',
        q: { en: 'What are daily quests?', bg: 'Какво са дневните куестове?' },
        a: {
          en: 'Daily quests are small, time-boxed goals (e.g., "Complete 3 lessons today", "Earn 50 XP") that reward bonus XP and coins. They reset every day at midnight in your local timezone.',
          bg: 'Дневните куестове са малки задачи с краен срок (напр. „Завърши 3 урока днес", „Спечели 50 XP"), които дават бонус XP и монети. Нулират се всеки ден в полунощ по локалното време.',
        },
      },
    ],
  },
  {
    id: 'cosmetics',
    label: { en: 'Coins, Chests & Shop', bg: 'Монети, сандъци и магазин' },
    items: [
      {
        id: 'what-are-coins',
        q: { en: 'How do I earn coins?', bg: 'Как печеля монети?' },
        a: {
          en: 'Coins are earned by exchanging XP in the Shop tab (2 XP = 1 coin, minimum 100 XP per exchange). Chests give XP rewards, not coins. Coins are spent on cosmetics for your octopus mascot.',
          bg: 'Монетите се печелят чрез обмяна на XP в раздела Shop (2 XP = 1 монета, минимум 100 XP на обмяна). Сандъците дават XP награди, не монети. Монетите се харчат за козметика на октопода ти.',
        },
      },
      {
        id: 'what-are-chests',
        q: { en: 'What do chests contain?', bg: 'Какво има в сандъците?' },
        a: {
          en: 'Each module has up to 2 chests (mid-module and end-of-module) that unlock after you complete the lessons leading up to them. Rewards are XP-only and weighted from common (25 XP) all the way to the mythic 2,500 XP jackpot.',
          bg: 'Всеки модул има до 2 сандъка (среден и в края), които се отключват след като завършиш съответните уроци. Наградите са само XP и са с тегла от обичайни (25 XP) до митичния джакпот от 2 500 XP.',
        },
      },
      {
        id: 'cosmetics-effect',
        q: { en: 'Do cosmetics affect gameplay?', bg: 'Влияят ли козметиките на геймплея?' },
        a: {
          en: 'No. Cosmetics are purely visual. Your mascot has 3 slots (hat, face, body) and you can equip one item per slot at the same time. Nothing you wear changes the math, XP gain, or unlocks.',
          bg: 'Не. Козметиките са чисто визуални. Маскотът ти има 3 слота (шапка, лице, тяло) и можеш да екипираш по един предмет на слот едновременно. Нищо, което носиш, не променя математиката, XP или отключванията.',
        },
      },
      {
        id: 'how-to-equip',
        q: { en: 'How do I equip cosmetics?', bg: 'Как екипирам козметики?' },
        a: {
          en: 'Open the Shop tab, tap any item you own, and hit Equip. Each slot is independent — equipping a hat won\'t remove your sunglasses or backpack.',
          bg: 'Отвори раздела Shop, натисни предмет, който притежаваш, и натисни Equip. Всеки слот е независим — екипирането на шапка няма да премахне очилата или раницата ти.',
        },
      },
    ],
  },
  {
    id: 'pro-billing',
    label: { en: 'Pro & Billing', bg: 'Pro и плащания' },
    items: [
      {
        id: 'what-is-pro',
        q: { en: 'What do I get with Pro?', bg: 'Какво получавам с Pro?' },
        a: {
          en: 'Pro unlocks: advanced modules (real estate, tax strategy, advanced investing, etc.), unlimited energy so you never have to wait, the AI Financial Advisor for personalized questions, and early access to new modules as they ship.',
          bg: 'Pro отключва: напреднали модули (имоти, данъчна стратегия, напреднали инвестиции и др.), неограничена енергия, AI финансов съветник за персонализирани въпроси и ранен достъп до нови модули.',
        },
      },
      {
        id: 'how-to-subscribe',
        q: { en: 'How do I subscribe to Pro?', bg: 'Как се абонирам за Pro?' },
        a: {
          en: 'From your Profile page, tap "Upgrade to Pro". You\'ll be redirected to Stripe Checkout — a secure, PCI-DSS Level 1 payment page that supports cards, SEPA Direct Debit, and most European payment methods.',
          bg: 'От страницата Профил натисни „Upgrade to Pro". Ще бъдеш пренасочен към Stripe Checkout — сигурна, сертифицирана страница за плащане (PCI-DSS Level 1), която поддържа карти, SEPA Direct Debit и повечето европейски методи на плащане.',
        },
      },
      {
        id: 'payment-methods',
        q: { en: 'Which payment methods are accepted?', bg: 'Кои методи на плащане се приемат?' },
        a: {
          en: 'Stripe handles checkout, so we accept all major EU cards (Visa, Mastercard, Maestro), SEPA Direct Debit, and depending on your country: iDEAL (NL), Bancontact (BE), Sofort, Giropay (DE), and others. We don\'t see or store your card number.',
          bg: 'Stripe обработва плащанията, така че приемаме всички основни ЕС карти (Visa, Mastercard, Maestro), SEPA Direct Debit и в зависимост от страната ти: iDEAL (НЛ), Bancontact (БЕ), Sofort, Giropay (ГЕ) и други. Не виждаме и не съхраняваме номера на картата ти.',
        },
      },
      {
        id: 'cancel-pro',
        q: { en: 'How do I cancel Pro?', bg: 'Как анулирам Pro?' },
        a: {
          en: 'Open your Profile page and tap "Manage subscription". You\'ll land in the Stripe customer portal where you can cancel anytime. You keep Pro access until the end of the current billing period.',
          bg: 'Отвори страницата Профил и натисни „Manage subscription". Ще бъдеш пренасочен към портала на Stripe, където можеш да отмениш по всяко време. Запазваш Pro достъпа до края на текущия платежен период.',
        },
      },
      {
        id: 'refund',
        q: { en: 'Can I get a refund?', bg: 'Мога ли да получа възстановяване?' },
        a: {
          en: 'Under EU consumer protection rules you generally have a 14-day right of withdrawal for digital services, provided you haven\'t actively consumed the service in that window. For specific cases, email us — we review refund requests case by case.',
          bg: 'Според правилата на ЕС за защита на потребителите обикновено имаш 14-дневно право на отказ за дигитални услуги, при условие че не си активно ползвал услугата през този период. За конкретни случаи ни пиши — преглеждаме заявки за възстановяване индивидуално.',
        },
      },
      {
        id: 'vat',
        q: { en: 'Are prices including VAT?', bg: 'Цените включват ли ДДС?' },
        a: {
          en: 'Yes. Prices shown to EU consumers include VAT at the rate of your country, as required by EU VAT rules for digital services. Your Stripe receipt itemizes the VAT.',
          bg: 'Да. Цените за ЕС потребители включват ДДС по ставката на твоята страна, както изискват ЕС правилата за дигитални услуги. Stripe разписката детайлизира ДДС.',
        },
      },
    ],
  },
  {
    id: 'account-security',
    label: { en: 'Account & Security', bg: 'Акаунт и сигурност' },
    items: [
      {
        id: 'email-verification',
        q: { en: 'Why do I need to verify my email?', bg: 'Защо трябва да потвърдя имейла си?' },
        a: {
          en: 'Email verification prevents fake accounts, enables password reset, and lets us send important transactional notices (billing receipts, security alerts). You won\'t be able to sign in or use the app until you verify.',
          bg: 'Верификацията на имейла предотвратява фалшиви акаунти, позволява смяна на парола и ни дава начин да изпращаме важни известия (разписки, сигнали за сигурност). Не можеш да влезеш или да ползваш приложението преди верификация.',
        },
      },
      {
        id: 'verification-email-missing',
        q: { en: "I didn't get a verification email. What now?", bg: 'Не получих имейл за верификация. Какво да направя?' },
        a: {
          en: 'First, check your spam/junk folder. If it\'s not there, go to the verification page and hit "Resend" — you can resend after a short cooldown. If it still doesn\'t arrive, email us with the address you signed up with.',
          bg: 'Първо провери папката спам. Ако не е там, отиди на страницата за верификация и натисни „Изпрати отново" — можеш да го направиш след кратко изчакване. Ако пак не пристигне, пиши ни с имейла, с който си се регистрирал.',
        },
      },
      {
        id: 'forgot-password',
        q: { en: 'I forgot my password. How do I reset it?', bg: 'Забравих си паролата. Как да я нулирам?' },
        a: {
          en: 'On the login page click "Forgot password", enter your email, and you\'ll receive a reset link valid for 1 hour. The link works once. If you don\'t see the email, check spam.',
          bg: 'На страницата за вход натисни „Forgot password", въведи имейла си и ще получиш връзка за нулиране, валидна 1 час. Връзката работи веднъж. Ако не виждаш имейла, провери спам.',
        },
      },
      {
        id: 'change-nickname',
        q: { en: 'Can I change my nickname?', bg: 'Мога ли да си сменя прякора?' },
        a: {
          en: 'Yes — from Profile → Settings. Nicknames must be unique, at least 2 characters, no spaces, and pass our banned-words filter (which is normalized for lookalikes, so leetspeak workarounds don\'t pass).',
          bg: 'Да — от Профил → Настройки. Прякорите трябва да са уникални, поне 2 символа, без интервали и да минат филтъра ни за забранени думи (нормализиран срещу leetspeak трикове).',
        },
      },
      {
        id: 'delete-account',
        q: { en: 'How do I delete my account?', bg: 'Как изтривам акаунта си?' },
        a: {
          en: 'Open Profile → Settings → Delete account, or email us. We erase personal data within 30 days, except billing records that EU accounting law requires us to keep for up to 10 years (these are anonymized where possible).',
          bg: 'Отвори Профил → Настройки → Изтрий акаунт, или ни пиши. Изтриваме личните данни в рамките на 30 дни, с изключение на счетоводните записи, които ЕС законодателството изисква да съхраним до 10 години (те се анонимизират, където е възможно).',
        },
      },
      {
        id: 'data-export',
        q: { en: 'Can I export my data?', bg: 'Мога ли да изтегля данните си?' },
        a: {
          en: 'Yes. Under GDPR Article 20 you have the right to data portability. Email us and we\'ll send you a structured (JSON) export of your account, progress, friends, and notifications within 30 days.',
          bg: 'Да. По чл. 20 на GDPR имаш право на преносимост на данните. Пиши ни и ще ти изпратим структуриран (JSON) експорт на акаунта, прогреса, приятелите и нотификациите в рамките на 30 дни.',
        },
      },
      {
        id: 'data-security',
        q: { en: 'How secure is my data?', bg: 'Колко защитени са данните ми?' },
        a: {
          en: 'Passwords are hashed with bcrypt (we never see them). Traffic is HTTPS. The database is hosted in the EU and encrypted at rest. We rate-limit authentication endpoints to deter brute-force attacks. See our Privacy Policy for the full breakdown.',
          bg: 'Паролите се хешират с bcrypt (никога не ги виждаме). Трафикът е HTTPS. Базата данни се намира в ЕС и е криптирана при съхранение. Налагаме rate limit на входните точки за вход, за да предотвратим brute-force атаки. Виж пълни подробности в Политиката за поверителност.',
        },
      },
    ],
  },
  {
    id: 'social',
    label: { en: 'Friends & Social', bg: 'Приятели и социално' },
    items: [
      {
        id: 'add-friends',
        q: { en: 'How do I add a friend?', bg: 'Как добавям приятел?' },
        a: {
          en: 'Open Profile → Friends → Add. Search by nickname and send a request. They get a notification. If they\'ve already requested you, the friendship auto-accepts.',
          bg: 'Отвори Профил → Приятели → Добави. Търси по прякор и изпрати заявка. Те получават нотификация. Ако вече са те поканили, приятелството се приема автоматично.',
        },
      },
      {
        id: 'league',
        q: { en: 'How does the League work?', bg: 'Как работи League?' },
        a: {
          en: 'The League is a global XP leaderboard. Tap any row to peek at that user\'s octopus and friend status. You can request, accept, or remove friends right from the modal.',
          bg: 'League е глобална XP класация. Натисни ред, за да видиш октопода и приятелския статус на потребителя. Можеш да изпратиш заявка, да приемеш или да премахнеш приятел директно от прозореца.',
        },
      },
      {
        id: 'overtake-notification',
        q: { en: 'Why did I get a "friend overtook you" notification?', bg: 'Защо получих нотификация „приятел те задмина"?' },
        a: {
          en: 'When a friend\'s XP passes yours, you get a friendly nudge so you know to catch up. We only notify you for friends — never strangers.',
          bg: 'Когато XP на приятел премине твоето, получаваш приятелски стимул да наваксаш. Уведомяваме те само за приятели — никога за непознати.',
        },
      },
    ],
  },
  {
    id: 'tools-content',
    label: { en: 'Tools & Content', bg: 'Инструменти и съдържание' },
    items: [
      {
        id: 'tools-tab',
        q: { en: 'What are the Tools?', bg: 'Какво е разделът Tools?' },
        a: {
          en: 'A free calculator hub: compound interest, mortgage payoff, debt snowball/avalanche, FIRE number, savings goal, and a net-worth tracker. All numbers in € and based on EU-style amortization where relevant. Net worth is saved locally on your device only.',
          bg: 'Безплатен хъб с калкулатори: сложна лихва, изплащане на ипотека, debt snowball/avalanche, FIRE число, цел за спестяване и нетна стойност. Всички числа са в € и базирани на ЕС-стилни амортизации, където е приложимо. Нетната стойност се записва само локално на твоето устройство.',
        },
      },
      {
        id: 'eu-content',
        q: { en: 'Is the content tailored to European rules?', bg: 'Адаптирано ли е съдържанието към европейските правила?' },
        a: {
          en: 'Yes. Examples use €, references are to UCITS ETFs (not US mutual funds), SEPA transfers, ECB rates, EU consumer credit and mortgage directives, and "your national tax authority" rather than the US IRS. Where Bulgarian specifics are useful (10% flat income tax, NRA), we call them out.',
          bg: 'Да. Примерите използват €, фондовете са UCITS ETF (не US mutual funds), SEPA преводи, лихва на ЕЦБ, ЕС директиви за потребителски кредит и ипотеки, и „националната ти данъчна агенция" вместо американската IRS. Когато са полезни български специфики (10% плосък данък, НАП), ги отбелязваме.',
        },
      },
      {
        id: 'ai-advisor-pro',
        q: { en: 'How does the AI Financial Advisor work?', bg: 'Как работи AI финансовият съветник?' },
        a: {
          en: 'It\'s a Pro-only chat powered by Claude Haiku. Ask anything personal-finance related — budgeting, debt strategy, asset allocation, EU tax basics — and get a streamed reply in seconds. It\'s an educational tool, not regulated financial advice.',
          bg: 'Чат само за Pro, задвижван от Claude Haiku. Питай за всичко свързано с лични финанси — бюджетиране, стратегии за дълг, разпределение на активи, основи на ЕС данъци — и получаваш стриймнат отговор за секунди. Това е образователен инструмент, не регулирана финансова консултация.',
        },
      },
      {
        id: 'not-advice',
        q: { en: 'Is Octolio regulated financial advice?', bg: 'Octolio регулирана финансова консултация ли е?' },
        a: {
          en: 'No. Octolio is an educational service. We are not licensed to provide investment advice under MiFID II or any national equivalent. Always consult a licensed financial advisor before making major decisions about pensions, large investments, or mortgages.',
          bg: 'Не. Octolio е образователна услуга. Нямаме лиценз да даваме инвестиционни консултации по MiFID II или национален еквивалент. Винаги се консултирай с лицензиран финансов съветник преди важни решения за пенсия, големи инвестиции или ипотеки.',
        },
      },
      {
        id: 'generated-lessons',
        q: { en: 'What is a generated lesson?', bg: 'Какво е „generated" урок?' },
        a: {
          en: 'Some modules include AI-generated lessons drafted by Claude and reviewed by our team. They follow the same exercise structure as hand-written lessons and award normal XP.',
          bg: 'Някои модули включват AI-генерирани уроци, изготвени от Claude и прегледани от екипа ни. Следват същата структура като ръчно написаните и дават нормално XP.',
        },
      },
    ],
  },
  {
    id: 'troubleshooting',
    label: { en: 'Troubleshooting', bg: 'Отстраняване на проблеми' },
    items: [
      {
        id: 'lesson-stuck',
        q: { en: 'My lesson froze or won\'t load. What now?', bg: 'Урокът ми се замрази или не зарежда. Какво да направя?' },
        a: {
          en: 'Refresh the page first — your progress on completed exercises is recorded immediately. If the same lesson keeps breaking, log out and back in. If it persists, screenshot it and email us with the module + lesson name.',
          bg: 'Първо опресни страницата — прогресът ти от завършени упражнения се записва веднага. Ако същият урок продължава да не работи, излез и влез отново. Ако се повтаря, направи скрийншот и ни пиши с името на модула и урока.',
        },
      },
      {
        id: 'energy-not-refilling',
        q: { en: 'My energy is not refilling. Why?', bg: 'Енергията ми не се възстановява. Защо?' },
        a: {
          en: 'Energy refills lazily on the next API call (e.g., opening a page that hits /me). Just navigate within the app and it will recompute. Pro users always see "∞".',
          bg: 'Енергията се възстановява лениво при следваща API заявка (напр. при отваряне на страница, която вика /me). Просто навигирай в приложението и ще се преизчисли. Pro потребителите винаги виждат „∞".',
        },
      },
      {
        id: 'streak-lost',
        q: { en: 'I lost my streak even though I played yesterday. Help!', bg: 'Загубих си стрийка, въпреки че играх вчера. Помощ!' },
        a: {
          en: 'Streak is based on calendar days in your local timezone. If you played close to midnight and crossed two days, that\'s expected. If you definitely played and the streak still reset, email us with the dates and we\'ll investigate.',
          bg: 'Стрийкът се базира на календарни дни в локалната ти часова зона. Ако си играл около полунощ и си пресякъл два дни, това е очаквано. Ако наистина си играл и стрийкът се е нулирал, пиши ни с датите и ще проверим.',
        },
      },
      {
        id: 'pro-not-active',
        q: { en: 'I paid for Pro but the app still says free. What gives?', bg: 'Платих за Pro, но приложението още казва безплатен. Какво става?' },
        a: {
          en: 'Stripe webhooks are usually instant but can take up to 60 seconds. Refresh the app once. If after a minute you still don\'t see Pro, log out and back in. If it still doesn\'t resolve, email us with your Stripe receipt.',
          bg: 'Stripe webhook-овете обикновено са моментални, но може да отнемат до 60 секунди. Опресни приложението веднъж. Ако след минута още не виждаш Pro, излез и влез отново. Ако пак не се оправи, пиши ни с разписката от Stripe.',
        },
      },
      {
        id: 'ai-error',
        q: { en: 'The AI Advisor gave an error. Why?', bg: 'AI съветникът ми даде грешка. Защо?' },
        a: {
          en: 'The advisor uses streaming. Most errors are transient network drops — just retry. If the streaming icon never appears, your network may be blocking server-sent events (some corporate proxies do). Try a different network.',
          bg: 'Съветникът използва streaming. Повечето грешки са преходни мрежови прекъсвания — просто опитай отново. Ако streaming иконата изобщо не се появява, мрежата ти може да блокира server-sent events (някои корпоративни прокси-та го правят). Опитай с друга мрежа.',
        },
      },
      {
        id: 'browser-support',
        q: { en: 'Which browsers does Octolio support?', bg: 'Кои браузъри поддържа Octolio?' },
        a: {
          en: 'Modern versions of Chrome, Firefox, Safari, and Edge are fully supported on desktop and mobile. We don\'t test on Internet Explorer.',
          bg: 'Поддържат се модерните версии на Chrome, Firefox, Safari и Edge на десктоп и мобилен. Не тестваме на Internet Explorer.',
        },
      },
    ],
  },
  {
    id: 'privacy',
    label: { en: 'Privacy & GDPR', bg: 'Поверителност и GDPR' },
    items: [
      {
        id: 'data-collected',
        q: { en: 'What personal data do you collect?', bg: 'Какви лични данни събирате?' },
        a: {
          en: 'Your nickname, email, language, theme, learning progress (lessons, XP, streak, cards), social graph (friends, requests), economy data (coins, items), and Stripe customer ID if you go Pro. We don\'t see your card number or chat-history transcripts after they\'re delivered. Full breakdown in our Privacy Policy.',
          bg: 'Прякор, имейл, език, тема, прогрес от обучението (уроци, XP, стрийк, карти), социален граф (приятели, заявки), икономически данни (монети, предмети) и Stripe customer ID, ако си Pro. Не виждаме номера на картата ти или транскрипти на чата след доставянето им. Пълни детайли в Политиката за поверителност.',
        },
      },
      {
        id: 'data-location',
        q: { en: 'Where is my data stored?', bg: 'Къде се съхраняват данните ми?' },
        a: {
          en: 'Primarily in the EU. Our database (Neon Postgres) and hosting (Render) are in EU regions. When the AI Advisor is invoked, your message is transiently processed by Anthropic; transfers outside the EEA are covered by Standard Contractual Clauses.',
          bg: 'Основно в ЕС. Базата данни (Neon Postgres) и хостингът (Render) са в ЕС региони. При използване на AI съветника съобщението ти се обработва транзитно от Anthropic; прехвърлянията извън ЕИП са покрити от Стандартни договорни клаузи.',
        },
      },
      {
        id: 'cookies',
        q: { en: 'Do you use cookies or tracking?', bg: 'Използвате ли cookies или tracking?' },
        a: {
          en: 'We use local storage (not classic cookies) for language, theme, and the "What\'s New" modal — strictly necessary, no consent banner required. No third-party advertising or cross-site tracking.',
          bg: 'Използваме local storage (не класически cookies) за език, тема и „Какво ново" модала — строго необходимо, без банер за съгласие. Без реклама от трети страни или cross-site tracking.',
        },
      },
      {
        id: 'gdpr-rights',
        q: { en: 'What GDPR rights do I have?', bg: 'Какви GDPR права имам?' },
        a: {
          en: 'Access, rectification, erasure, restriction, portability, objection, and withdrawal of consent. To exercise any of these, email us and we\'ll respond within 30 days. See the Privacy Policy for details and your right to lodge a complaint with your national data protection authority.',
          bg: 'Достъп, коригиране, изтриване, ограничаване, преносимост, възражение и оттегляне на съгласие. За да упражниш някое, пиши ни и ще отговорим в рамките на 30 дни. Виж Политиката за поверителност за детайли и правото си да подадеш жалба до националния орган за защита на данните.',
        },
      },
    ],
  },
];

export function FaqList() {
  const { lang } = useLang() as { lang: Lang };
  const [activeCat, setActiveCat] = useState<string>('all');
  const [openId, setOpenId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const norm = query.trim().toLowerCase();
    const cats =
      activeCat === 'all' ? FAQ_CATEGORIES : FAQ_CATEGORIES.filter((c) => c.id === activeCat);
    if (!norm) return cats;
    return cats
      .map((c) => ({
        ...c,
        items: c.items.filter(
          (i) =>
            i.q[lang].toLowerCase().includes(norm) || i.a[lang].toLowerCase().includes(norm)
        ),
      }))
      .filter((c) => c.items.length > 0);
  }, [activeCat, query, lang]);

  return (
    <div>
      <div className="mb-4">
        <input
          type="text"
          className="input-field"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={lang === 'en' ? 'Search FAQs…' : 'Търси във ЧЗВ…'}
        />
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <CategoryChip
          active={activeCat === 'all'}
          label={lang === 'en' ? 'All' : 'Всички'}
          onClick={() => setActiveCat('all')}
        />
        {FAQ_CATEGORIES.map((c) => (
          <CategoryChip
            key={c.id}
            active={activeCat === c.id}
            label={c.label[lang]}
            onClick={() => setActiveCat(c.id)}
          />
        ))}
      </div>

      {visible.length === 0 ? (
        <div
          className="glass-card rounded-2xl p-8 text-center"
          style={{ color: 'hsl(var(--c-fg-muted))' }}
        >
          {lang === 'en' ? 'No questions match your search.' : 'Няма съвпадения за търсенето.'}
        </div>
      ) : (
        visible.map((c) => (
          <section key={c.id} className="mb-6">
            <h3 className="text-base font-bold mb-3" style={{ color: 'hsl(var(--c-fg))' }}>
              {c.label[lang]}
            </h3>
            <div className="space-y-2">
              {c.items.map((item) => {
                const isOpen = openId === item.id;
                return (
                  <div
                    key={item.id}
                    className="glass-card rounded-xl overflow-hidden"
                    style={{ border: '1px solid hsl(var(--c-fg)/0.06)' }}
                  >
                    <button
                      onClick={() => setOpenId(isOpen ? null : item.id)}
                      className="w-full text-left px-5 py-4 flex items-start gap-3"
                    >
                      <span
                        className="text-sm font-semibold flex-1"
                        style={{ color: 'hsl(var(--c-fg))' }}
                      >
                        {item.q[lang]}
                      </span>
                      <span
                        className="text-xl flex-shrink-0 transition-transform"
                        style={{
                          color: 'hsl(var(--c-primary))',
                          transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)',
                        }}
                      >
                        +
                      </span>
                    </button>
                    {isOpen && (
                      <div
                        className="px-5 pb-5 text-sm leading-relaxed"
                        style={{ color: 'hsl(var(--c-fg-muted))' }}
                      >
                        {item.a[lang]}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))
      )}
    </div>
  );
}

function CategoryChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all"
      style={{
        background: active ? 'hsl(var(--c-primary))' : 'hsl(var(--c-fg)/0.06)',
        color: active ? 'white' : 'hsl(var(--c-fg-muted))',
        border: active ? 'none' : '1px solid hsl(var(--c-fg)/0.08)',
      }}
    >
      {label}
    </button>
  );
}
