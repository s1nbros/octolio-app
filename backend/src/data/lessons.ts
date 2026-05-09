export interface LocalizedText { en: string; bg: string; }

export interface TheorySlide {
  title: LocalizedText;
  body: LocalizedText;
  emoji?: string;
  highlight?: LocalizedText; // callout box
}

export interface Exercise {
  id: string;
  type:
    | 'theory'              // read-through theory slides, click Continue
    | 'choice'              // classic A/B/C/D
    | 'budget_slider'       // drag sliders to allocate income
    | 'rpg_scenario'        // branching story with cash-flow consequence
    | 'rat_race'            // mini cashflow month simulation
    | 'compound_sim'        // interactive compound interest simulator
    | 'sort_items'          // drag items into Good/Bad buckets
    | 'fill_blank'          // numeric input
    | 'match_terms'         // match terms to definitions
    | 'order_items'         // put items in correct order
    | 'true_false'          // true/false myth buster
    | 'scenario_decision'   // multi-outcome branching decision
    | 'fill_number'         // financial calculation with tolerance
    | 'stock_chart'         // interactive price chart (investing)
    | 'portfolio_pie'       // allocate % across asset classes (investing)
    | 'debt_payoff'         // pick debt payoff strategy (credit/debt)
    | 'tax_brackets';       // tax bracket visualizer (tax)
  // theory
  slides?: TheorySlide[];
  // choice / fill_blank shared
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
    cashFlowChange: number; // +/- monthly cash flow
    isGood: boolean;
  }[];
  // rat_race
  ratRaceProfile?: {
    name: LocalizedText;
    job: LocalizedText;
    avatar: string;
    monthlyIncome: number;
    expenses: { label: LocalizedText; emoji: string; amount: number; }[];
    opportunities: {
      label: LocalizedText;
      emoji: string;
      cost: number;
      monthlyPassive: number;
      isGood: boolean;
    }[];
  };
  // compound_sim
  compoundConfig?: {
    defaultPrincipal: number;
    defaultRate: number;
    defaultYears: number;
    defaultMonthly: number;
  };
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
  xp: number;
}

export interface Lesson {
  id: string;
  moduleId: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  xpReward: number;
  order: number;
  exercises: Exercise[];
}

export interface Module {
  id: string;
  title: LocalizedText;
  description: LocalizedText;
  icon: string;
  color: string;
  order: number;
  proOnly?: boolean;
  lessons: Lesson[];
}

// Load AI-generated modules if the script has been run (see scripts/generateProModules.ts).
// Safe no-op if the file doesn't exist yet.
let generatedModules: Module[] = [];
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  generatedModules = require('./generated-modules.json') as Module[];
} catch { /* no generated file yet */ }

const staticModules: Module[] = [
  // ─────────────────────────────────────────────
  // MODULE 1 — BUDGETING
  // ─────────────────────────────────────────────
  {
    id: 'budgeting',
    title: { en: 'Budgeting Basics', bg: 'Основи на бюджетирането' },
    description: { en: 'Master your money flow and take control of your finances.', bg: 'Овладей паричния поток и контролирай финансите си.' },
    icon: '💰', color: 'green', order: 1,
    lessons: [
      // ── Lesson 1: Rat Race Intro ──
      {
        id: 'rat-race-intro',
        moduleId: 'budgeting',
        title: { en: 'Escape the Rat Race', bg: 'Избягай от Rat Race' },
        description: { en: 'Understand the cycle most people are trapped in — and how to break free.', bg: 'Разбери цикъла, в който повечето хора са хванати — и как да се освободиш.' },
        icon: '🐭', xpReward: 100, order: 1,
        exercises: [
          {
            id: 'rr-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🐭',
                title: { en: 'What is the Rat Race?', bg: 'Какво е Rat Race?' },
                body: { en: 'Most people wake up, go to work, pay bills, and repeat — forever. This is called the Rat Race. You earn money, but it all disappears on expenses before you can save or invest.\n\nRobert Kiyosaki (Rich Dad Poor Dad) says: the poor and middle class work for money — the rich make money work for them.', bg: 'Повечето хора се събуждат, отиват на работа, плащат сметки и повтарят — завинаги. Това е Rat Race. Печелиш пари, но всички изчезват за разходи.\n\nРобърт Кийосаки (Богат татко, беден татко) казва: бедните и средната класа работят за пари — богатите карат парите да работят за тях.' },
                highlight: { en: '💡 Assets put money IN your pocket. Liabilities take money OUT.', bg: '💡 Активите слагат пари В джоба ти. Пасивите вземат пари ОТ джоба ти.' },
              },
              {
                emoji: '🚀',
                title: { en: 'The Fast Track to Freedom', bg: 'Бързата писта към свобода' },
                body: { en: 'Every month your money follows a path:\n\n💼 Income → 🏠 Expenses → 😓 Nothing left\n\nTo escape, redirect money from expenses into ASSETS — things that generate income without you working. The goal: passive income > monthly expenses. At that point, work becomes optional!', bg: 'Всеки месец парите ти следват един път:\n\n💼 Доход → 🏠 Разходи → 😓 Нищо не остава\n\nЗа да избягаш, пренасочи пари от разходи към АКТИВИ — неща, които генерират доход без да работиш. Целта: пасивен доход > месечни разходи. На този етап работата става незадължителна!' },
                highlight: { en: '🎯 Passive income > Monthly expenses = Financial Freedom', bg: '🎯 Пасивен доход > Месечни разходи = Финансова свобода' },
              },
            ],
          },
          {
            id: 'rr-sort-1',
            type: 'sort_items',
            xp: 20,
            sortItems: [
              { label: { en: 'Rental apartment', bg: 'Апартамент под наем' }, emoji: '🏠', isAsset: true },
              { label: { en: 'New iPhone on credit', bg: 'Нов iPhone на кредит' }, emoji: '📱', isAsset: false },
              { label: { en: 'Stock portfolio', bg: 'Портфейл от акции' }, emoji: '📈', isAsset: true },
              { label: { en: 'Car loan', bg: 'Автомобилен заем' }, emoji: '🚗', isAsset: false },
              { label: { en: 'Online business', bg: 'Онлайн бизнес' }, emoji: '💻', isAsset: true },
              { label: { en: 'Designer clothes on credit', bg: 'Дизайнерски дрехи на кредит' }, emoji: '👗', isAsset: false },
            ],
          },
          {
            id: 'rr-tf-1',
            type: 'true_false',
            xp: 15,
            statement: { en: 'You need a high salary to escape the Rat Race.', bg: 'Нужна ти е висока заплата, за да избягаш от Rat Race.' },
            isTrue: false,
            explanation: { en: 'Many high-income earners are deeply trapped in the Rat Race because they increase spending with every raise (lifestyle inflation). The key is passive income vs expenses — not salary size. Someone earning €2,000/month with €1,500 in passive income is closer to freedom than someone earning €10,000 who spends it all.', bg: 'Много хора с високи доходи са дълбоко в Rat Race, защото увеличават харченето с всяко увеличение (инфлация на начина на живот). Ключът е пасивен доход срещу разходи — не размер на заплатата. Човек с €2,000/месец и €1,500 пасивен доход е по-близо до свобода от човек с €10,000 заплата, който харчи всичко.' },
          },
          {
            id: 'rr-calc-1',
            type: 'fill_number',
            xp: 20,
            fillNumberScenario: { en: 'Your monthly expenses are €2,500. To escape the Rat Race, your passive income must exceed your expenses. How much monthly passive income do you need at minimum?', bg: 'Месечните ти разходи са €2,500. За да избягаш от Rat Race, пасивният доход трябва да надвишава разходите. Какъв минимален месечен пасивен доход ти е нужен?' },
            question: { en: 'Minimum monthly passive income needed:', bg: 'Минимален месечен пасивен доход:' },
            fillNumberAnswer: 2500,
            fillNumberTolerance: 100,
            fillNumberUnit: '€',
            fillNumberHint: { en: 'Your passive income needs to cover all your monthly expenses.', bg: 'Пасивният ти доход трябва да покрие всички месечни разходи.' },
            explanation: { en: 'You need at least €2,500/month in passive income to match your expenses. Once passive income > expenses, you are financially free — work becomes a choice, not a necessity.', bg: 'Нужни са ти поне €2,500/месец пасивен доход, за да покриеш разходите. Когато пасивен доход > разходи, ти си финансово свободен — работата става избор, не необходимост.' },
          },
          {
            id: 'rr-match-1',
            type: 'match_terms',
            xp: 15,
            matchPairs: [
              { term: { en: 'Asset', bg: 'Актив' }, definition: { en: 'Something that puts money into your pocket', bg: 'Нещо, което слага пари в джоба ти' } },
              { term: { en: 'Liability', bg: 'Пасив' }, definition: { en: 'Something that takes money out of your pocket', bg: 'Нещо, което вади пари от джоба ти' } },
              { term: { en: 'Passive income', bg: 'Пасивен доход' }, definition: { en: 'Money earned without actively working', bg: 'Пари, печелени без да работиш активно' } },
              { term: { en: 'Rat Race', bg: 'Rat Race' }, definition: { en: 'The cycle of earning and spending with nothing left', bg: 'Цикълът на печелене и харчене без нищо да остане' } },
            ],
          },
          {
            id: 'rr-decision-1',
            type: 'scenario_decision',
            xp: 20,
            decisionScenario: { en: 'You just inherited €10,000 from a relative. You have no emergency fund and currently spend everything you earn. Your friend suggests splitting the money between a vacation and a new TV. What do you do?', bg: 'Току-що наследи €10,000 от роднина. Нямаш авариен фонд и харчиш всичко, което печелиш. Приятел предлага да разделиш парите между ваканция и нов телевизор. Какво правиш?' },
            decisionAvatar: '💰',
            decisionChoices: [
              { label: { en: 'Vacation + TV — I deserve it!', bg: 'Ваканция + телевизор — заслужавам си го!' }, emoji: '🏖️', outcome: { en: 'Fun times! But the money is gone in weeks. No emergency fund, no investments, no path out of the Rat Race. Next unexpected expense goes straight to credit card debt.', bg: 'Забавление! Но парите изчезват за седмици. Няма авариен фонд, няма инвестиции, няма път от Rat Race. Следващият неочакван разход отива директно на дълг по кредитна карта.' }, isBest: false },
              { label: { en: 'Build emergency fund + invest the rest', bg: 'Изгради авариен фонд + инвестирай остатъка' }, emoji: '📈', outcome: { en: 'Smart! €3,000 goes to an emergency fund (3 months safety net). €7,000 into a diversified index fund. At 7% annual returns, that €7,000 becomes €27,000 in 20 years — your first step out of the Rat Race.', bg: 'Умно! €3,000 отиват в авариен фонд (3 месеца предпазна мрежа). €7,000 в диверсифициран индексен фонд. При 7% годишна доходност, тези €7,000 стават €27,000 за 20 години — първата стъпка от Rat Race.' }, isBest: true },
              { label: { en: 'All-in on crypto — it could 10x!', bg: 'Всичко в крипто — може да стане 10x!' }, emoji: '🎰', outcome: { en: 'High risk! Crypto can also drop 80%. Without an emergency fund, you might be forced to sell at a loss during a crash. Building wealth requires a stable foundation first, then calculated risks.', bg: 'Висок риск! Криптото може и да падне с 80%. Без авариен фонд, може да бъдеш принуден да продадеш на загуба при срив. Изграждането на богатство изисква стабилна основа преди да поемеш рискове.' }, isBest: false },
            ],
            explanation: { en: 'The financially smart move: secure your foundation (emergency fund) FIRST, then invest the rest. Building wealth is a marathon, not a sprint. Assets before luxuries.', bg: 'Финансово умният ход: осигури основата (авариен фонд) ПЪРВО, после инвестирай остатъка. Изграждането на богатство е маратон, не спринт. Активи преди лукс.' },
          },
          {
            id: 'rr-rat-race-1',
            type: 'rat_race',
            xp: 30,
            ratRaceProfile: {
              name: { en: 'Mihail the Manager', bg: 'Михаил Мениджърът' },
              job: { en: 'Office Manager', bg: 'Офис мениджър' },
              avatar: '👨‍💼',
              monthlyIncome: 3000,
              expenses: [
                { label: { en: 'Rent', bg: 'Наем' }, emoji: '🏠', amount: 900 },
                { label: { en: 'Food', bg: 'Храна' }, emoji: '🍕', amount: 400 },
                { label: { en: 'Car', bg: 'Кола' }, emoji: '🚗', amount: 300 },
                { label: { en: 'Subscriptions', bg: 'Абонаменти' }, emoji: '📱', amount: 150 },
                { label: { en: 'Misc', bg: 'Разни' }, emoji: '🛍️', amount: 200 },
              ],
              opportunities: [
                { label: { en: 'Index fund (small start)', bg: 'Индексен фонд (малък старт)' }, emoji: '📈', cost: 200, monthlyPassive: 80, isGood: true },
                { label: { en: 'Start side business', bg: 'Започни страничен бизнес' }, emoji: '💼', cost: 300, monthlyPassive: 400, isGood: true },
                { label: { en: 'Buy luxury watch', bg: 'Купи луксозен часовник' }, emoji: '⌚', cost: 600, monthlyPassive: 0, isGood: false },
                { label: { en: 'Buy rental apartment', bg: 'Купи апартамент под наем' }, emoji: '🏠', cost: 800, monthlyPassive: 600, isGood: true },
                { label: { en: 'Launch online course', bg: 'Пусни онлайн курс' }, emoji: '💻', cost: 500, monthlyPassive: 1000, isGood: true },
              ],
            },
          },
        ],
      },

      // ── Lesson 2: 50/30/20 Budget Simulator ──
      {
        id: 'budget-simulator',
        moduleId: 'budgeting',
        title: { en: 'Build Your Budget', bg: 'Изгради своя бюджет' },
        description: { en: 'Use the 50/30/20 rule and interactive sliders to allocate a real salary.', bg: 'Използвай правилото 50/30/20 и интерактивни плъзгачи, за да разпределиш реална заплата.' },
        icon: '⚖️', xpReward: 110, order: 2,
        exercises: [
          {
            id: 'bs-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '⚖️',
                title: { en: 'The 50/30/20 Rule', bg: 'Правилото 50/30/20' },
                body: { en: 'Senator Elizabeth Warren popularized this simple framework:\n\n• 50% → NEEDS (rent, food, transport, utilities)\n• 30% → WANTS (dining out, entertainment, hobbies)\n• 20% → SAVINGS & DEBT (emergency fund, investments, loan payments)\n\nThis works on ANY income — €1,000 or €10,000. The percentages stay the same.', bg: 'Сенатор Елизабет Уорън популяризира тази проста рамка:\n\n• 50% → НУЖДИ (наем, храна, транспорт, комунални)\n• 30% → ЖЕЛАНИЯ (ресторанти, забавления, хобита)\n• 20% → СПЕСТЯВАНИЯ и ДЪЛГ (авариен фонд, инвестиции, заеми)\n\nРаботи при ВСЯКАКЪВ доход — €1,000 или €10,000. Процентите остават същите.' },
                highlight: { en: '💡 Pay yourself FIRST — automate savings before spending.', bg: '💡 Плати ПЪРВО на себе си — автоматизирай спестяванията преди харченето.' },
              },
              {
                emoji: '🧮',
                title: { en: 'Why 20% to Savings?', bg: 'Защо 20% за спестявания?' },
                body: { en: 'If you save €200/month from age 25 at 7% returns, you\'ll have €525,000 by age 65. That\'s half a million — from just €200/month!\n\nMost people save 0%. The difference is enormous. Even 10% is better than nothing — start somewhere and increase over time.', bg: 'Ако спестяваш €200/месец от 25-годишна възраст при 7% доходност, ще имаш €525,000 на 65. Това е половин милион — само от €200/месец!\n\nПовечето хора спестяват 0%. Разликата е огромна. Дори 10% е по-добре от нищо — започни отнякъде и увеличавай с времето.' },
                highlight: { en: '🔑 €200/month at 7% for 40 years = €525,000. Time is the magic ingredient.', bg: '🔑 €200/месец при 7% за 40 години = €525,000. Времето е магическата съставка.' },
              },
            ],
          },
          {
            id: 'bs-match-1',
            type: 'match_terms',
            xp: 15,
            matchPairs: [
              { term: { en: 'Needs (50%)', bg: 'Нужди (50%)' }, definition: { en: 'Rent, groceries, utilities, transport', bg: 'Наем, хранителни, комунални, транспорт' } },
              { term: { en: 'Wants (30%)', bg: 'Желания (30%)' }, definition: { en: 'Dining out, entertainment, hobbies, subscriptions', bg: 'Ресторанти, забавления, хобита, абонаменти' } },
              { term: { en: 'Savings (20%)', bg: 'Спестявания (20%)' }, definition: { en: 'Emergency fund, investments, debt repayment', bg: 'Авариен фонд, инвестиции, изплащане на дълг' } },
              { term: { en: 'Pay yourself first', bg: 'Плати първо на себе си' }, definition: { en: 'Save automatically before spending on anything else', bg: 'Спестявай автоматично преди да харчиш за друго' } },
            ],
          },
          {
            id: 'bs-slider-1',
            type: 'budget_slider',
            xp: 25,
            income: 3000,
            categories: [
              { label: { en: 'Rent & Housing', bg: 'Наем и жилище' }, emoji: '🏠', min: 0, max: 2000, ideal: 900 },
              { label: { en: 'Food & Groceries', bg: 'Храна и хранителни' }, emoji: '🍕', min: 0, max: 800, ideal: 400 },
              { label: { en: 'Transport', bg: 'Транспорт' }, emoji: '🚗', min: 0, max: 600, ideal: 200 },
              { label: { en: 'Entertainment', bg: 'Забавления' }, emoji: '🎮', min: 0, max: 600, ideal: 200 },
              { label: { en: 'Savings & Investing', bg: 'Спестявания и инвестиции' }, emoji: '💎', min: 0, max: 1000, ideal: 600 },
            ],
          },
          {
            id: 'bs-decision-1',
            type: 'scenario_decision',
            xp: 20,
            decisionScenario: { en: 'You just got a €400/month raise! Your current budget is tight but manageable. A colleague says: "Upgrade your apartment — you work hard, you deserve a nicer place!" The upgrade would cost exactly €400/month more.', bg: 'Току-що получи увеличение от €400/месец! Текущият ти бюджет е стегнат, но управляем. Колега казва: "Вземи по-добър апартамент — работиш усилено, заслужаваш по-хубаво място!" Ъпгрейдът ще струва точно €400/месец повече.' },
            decisionAvatar: '💼',
            decisionChoices: [
              { label: { en: 'Upgrade the apartment — I deserve it!', bg: 'Вземи по-добър апартамент — заслужавам си го!' }, emoji: '🏡', outcome: { en: 'Your lifestyle improved, but the entire raise was absorbed by higher rent. You\'re still at €0 savings. This is "lifestyle inflation" — the silent wealth killer. Every raise consumed by expenses keeps you in the Rat Race.', bg: 'Начинът на живот се подобри, но цялото увеличение беше погълнато от по-висок наем. Все още имаш €0 спестявания. Това е "инфлация на начина на живот" — тихият убиец на богатството.' }, isBest: false },
              { label: { en: 'Save €300, enjoy €100 for fun', bg: 'Спести €300, радвай се на €100 за забавление' }, emoji: '⚖️', outcome: { en: 'Smart balance! You enjoy €100/month extra while €300/month goes into investments. In 10 years at 7%, that €300/month becomes €52,000. You reward yourself while building wealth — the best of both worlds.', bg: 'Умен баланс! Радваш се на €100/месец допълнително, докато €300/месец отиват в инвестиции. За 10 години при 7%, тези €300/месец стават €52,000. Възнаграждаваш себе си, докато строиш богатство.' }, isBest: true },
              { label: { en: 'Invest ALL €400', bg: 'Инвестирай ВСИЧКИТЕ €400' }, emoji: '📈', outcome: { en: 'Maximally disciplined! In 20 years, €400/month at 7% = €208,000. But balance matters — treating yourself occasionally maintains motivation. Both this and the balanced approach are great choices.', bg: 'Максимално дисциплинирано! За 20 години €400/месец при 7% = €208,000. Но балансът е важен — да се радваш понякога поддържа мотивацията. И този, и балансираният подход са чудесни избори.' }, isBest: true },
            ],
            explanation: { en: 'The key lesson: avoid lifestyle inflation. When income rises, increase savings FIRST. The worst financial habit is raising expenses to match every raise — it keeps you trapped forever.', bg: 'Ключов урок: избягвай инфлация на начина на живот. Когато доходът расте, увеличи спестяванията ПЪРВО. Най-лошият финансов навик е да вдигаш разходите с всяко увеличение — държи те в капан завинаги.' },
          },
          {
            id: 'bs-tf-1',
            type: 'true_false',
            xp: 15,
            statement: { en: 'You need to track every single penny to budget successfully.', bg: 'Трябва да следиш всяка стотинка, за да бюджетираш успешно.' },
            isTrue: false,
            explanation: { en: 'Tracking every penny leads to burnout. The 50/30/20 rule works because it\'s simple: just ensure the right percentages go to the right buckets. Automate your savings and the rest takes care of itself.', bg: 'Проследяването на всяка стотинка води до изтощение. Правилото 50/30/20 работи, защото е просто: просто осигури правилните проценти в правилните категории. Автоматизирай спестяванията и останалото се нарежда само.' },
          },
          {
            id: 'bs-calc-1',
            type: 'fill_number',
            xp: 20,
            fillNumberScenario: { en: 'Your friend earns €4,500 per month after tax. Using the 50/30/20 rule, how much should go to savings and investments each month?', bg: 'Приятелят ти печели €4,500 на месец след данъци. Използвайки правилото 50/30/20, колко трябва да отидат за спестявания и инвестиции всеки месец?' },
            question: { en: 'Monthly savings amount:', bg: 'Месечна сума за спестявания:' },
            fillNumberAnswer: 900,
            fillNumberTolerance: 50,
            fillNumberUnit: '€',
            fillNumberHint: { en: 'Calculate 20% of the monthly income.', bg: 'Изчисли 20% от месечния доход.' },
            explanation: { en: '€4,500 × 20% = €900. This goes to emergency fund, investments, and debt repayment. Even if you can\'t hit 20% yet, start with whatever you can and increase over time.', bg: '€4,500 × 20% = €900. Това отива за авариен фонд, инвестиции и изплащане на дълг. Дори ако не можеш да постигнеш 20% все още, започни с каквото можеш и увеличавай с времето.' },
          },
          {
            id: 'bs-order-1',
            type: 'order_items',
            xp: 20,
            orderInstruction: { en: 'Rank these financial priorities from most urgent to least urgent:', bg: 'Подреди тези финансови приоритети от най-спешен до най-малко спешен:' },
            orderItems: [
              { label: { en: 'Pay essential bills (rent, food)', bg: 'Плати основни сметки (наем, храна)' }, emoji: '🏠' },
              { label: { en: 'Build emergency fund (€500+)', bg: 'Изгради авариен фонд (€500+)' }, emoji: '🛡️' },
              { label: { en: 'Pay off high-interest debt', bg: 'Изплати дълг с висока лихва' }, emoji: '💳' },
              { label: { en: 'Invest for long-term growth', bg: 'Инвестирай за дългосрочен растеж' }, emoji: '📈' },
              { label: { en: 'Spend on wants and luxuries', bg: 'Харчи за желания и лукс' }, emoji: '🎮' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Financial priority order: essentials first, then safety net, then eliminate expensive debt, then grow wealth, and finally enjoy luxuries. This order protects you from financial disasters while building toward freedom.', bg: 'Финансов приоритет: първо необходимости, после предпазна мрежа, после елиминирай скъп дълг, после расти богатство и накрая се наслаждавай на лукс. Този ред те защитава от финансови бедствия, докато строиш свободата.' },
          },
        ],
      },

      // ── Lesson 3: Expense Tracking RPG ──
      {
        id: 'expense-rpg',
        moduleId: 'budgeting',
        title: { en: 'The Spending Trap', bg: 'Капанът на харченето' },
        description: { en: 'Master the psychology of spending and make smarter purchase decisions.', bg: 'Овладей психологията на харченето и взимай по-умни решения за покупки.' },
        icon: '🎭', xpReward: 110, order: 3,
        exercises: [
          {
            id: 'et-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🧠',
                title: { en: 'Why We Overspend', bg: 'Защо харчим прекалено' },
                body: { en: 'Our brains are wired for instant gratification. Companies spend billions engineering products to be addictive. Every notification, sale, and "limited offer" is designed to bypass your rational thinking.\n\nTracking expenses forces your prefrontal cortex (rational brain) back in control.', bg: 'Мозъкът ни е настроен за незабавно удовлетворение. Компаниите харчат милиарди за инженерство на пристрастяващи продукти. Всяко известие, разпродажба и "ограничена оферта" е проектирано да заобиколи рационалното мислене.\n\nПроследяването на разходите връща контрола на рационалния мозък.' },
                highlight: { en: '📊 People who track spending save 20% more on average than those who don\'t.', bg: '📊 Хората, които проследяват разходите, спестяват средно с 20% повече от тези, които не го правят.' },
              },
              {
                emoji: '☕',
                title: { en: 'The Latte Factor', bg: 'Ефектът на латето' },
                body: { en: 'David Bach\'s "Latte Factor": small daily purchases destroy wealth over time.\n\n€5 coffee × 365 days = €1,825/year\nInvested at 7% for 30 years = €185,000 💸\n\nThis isn\'t about giving up coffee. It\'s about making CONSCIOUS choices about where your money goes.', bg: 'Дейвид Бах\'с "Latte Factor": малките ежедневни покупки унищожават богатство с времето.\n\n€5 кафе × 365 дни = €1,825/година\nИнвестирани при 7% за 30 години = €185,000 💸\n\nНе става въпрос за отказ от кафе. Става въпрос за СЪЗНАТЕЛНИ избори къде отиват парите.' },
                highlight: { en: '💡 Ask before every purchase: "Is this worth X future euros?"', bg: '💡 Питай преди всяка покупка: "Струва ли си X бъдещи евро?"' },
              },
            ],
          },
          {
            id: 'et-calc-1',
            type: 'fill_number',
            xp: 20,
            fillNumberScenario: { en: 'You buy a €4.50 coffee every workday (5 days/week). How much do you spend on coffee per year? (Assume 52 weeks)', bg: 'Купуваш кафе за €4.50 всеки работен ден (5 дни/седмица). Колко харчиш за кафе на година? (Приеми 52 седмици)' },
            question: { en: 'Annual coffee spending:', bg: 'Годишен разход за кафе:' },
            fillNumberAnswer: 1170,
            fillNumberTolerance: 50,
            fillNumberUnit: '€',
            fillNumberHint: { en: 'Multiply daily cost × days per week × weeks per year.', bg: 'Умножи дневната цена × дни на седмица × седмици в годината.' },
            explanation: { en: '€4.50 × 5 × 52 = €1,170/year. Invested at 7% for 30 years, that\'s over €117,000! This doesn\'t mean give up coffee — but maybe make it at home 3 days and enjoy the café twice a week.', bg: '€4.50 × 5 × 52 = €1,170/година. Инвестирани при 7% за 30 години, това е над €117,000! Не означава да се откажеш от кафе — но може да си го правиш вкъщи 3 дни и да се наслаждаваш на кафенето два пъти.' },
          },
          {
            id: 'et-order-1',
            type: 'order_items',
            xp: 20,
            orderInstruction: { en: 'Rank these spending reduction strategies by impact (highest savings first):', bg: 'Подреди тези стратегии за намаляване на разходите по ефект (най-голямо спестяване първо):' },
            orderItems: [
              { label: { en: 'Negotiate rent or move to cheaper place', bg: 'Предоговори наема или се премести на по-евтино' }, emoji: '🏠' },
              { label: { en: 'Cook at home instead of eating out', bg: 'Готви вкъщи вместо да ядеш навън' }, emoji: '🍳' },
              { label: { en: 'Cancel unused subscriptions', bg: 'Откажи неизползвани абонаменти' }, emoji: '📱' },
              { label: { en: 'Use public transport', bg: 'Използвай градски транспорт' }, emoji: '🚌' },
              { label: { en: 'Make coffee at home', bg: 'Прави си кафе вкъщи' }, emoji: '☕' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Focus on the BIG wins first. Reducing rent saves €200-500/month, cooking saves €150-300/month. Subscriptions and small daily habits help too, but start with the biggest expenses for maximum impact.', bg: 'Фокусирай се на ГОЛЕМИТЕ победи първо. Намаляване на наема спестява €200-500/месец, готвене вкъщи спестява €150-300/месец. Абонаментите и малките навици помагат, но започни с най-големите разходи.' },
          },
          {
            id: 'et-tf-1',
            type: 'true_false',
            xp: 15,
            statement: { en: 'Buying something at 50% off always saves you money.', bg: 'Купуването на нещо с 50% намаление винаги ти спестява пари.' },
            isTrue: false,
            explanation: { en: 'If you buy a €200 jacket at 50% off, you didn\'t save €100 — you spent €100 you weren\'t planning to spend! A "sale" only saves money if you were already going to buy that exact item at full price. Unplanned purchases at a discount are still unplanned spending.', bg: 'Ако купиш яке за €200 с 50% намаление, не си спестил €100 — похарчил си €100, които не си планирал! "Намалението" спестява пари само ако вече е планувал да купиш точно този артикул на пълна цена. Непланираните покупки на намаление пак са непланирано харчене.' },
          },
          {
            id: 'et-rpg-1',
            type: 'rpg_scenario',
            xp: 20,
            scenario: { en: 'You\'re walking past a store. There\'s a 50% sale on a jacket you\'ve wanted. It\'s €120 (down from €240). You have €400 left in your budget for the month with 3 weeks to go.', bg: 'Минаваш покрай магазин. Има 50% намаление на яке, което си искал. Струва €120 (от €240). Имаш €400 останали в бюджета за месеца с 3 седмици до края.' },
            avatar: '🧑‍🎤',
            choices: [
              { label: { en: 'Buy it — 50% off is a great deal!', bg: 'Купи го — 50% е страхотна сделка!' }, emoji: '🛍️', consequence: { en: 'You spent 30% of your remaining budget. Three weeks later you run out of money and skip a friend\'s birthday dinner. Missing experiences hurts more than buying things helps.', bg: 'Похарчи 30% от останалия бюджет. Три седмици по-късно ти свършват парите и пропускаш рождения ден на приятел.' }, cashFlowChange: -120, isGood: false },
              { label: { en: 'Skip it — I didn\'t plan this', bg: 'Пропусни го — не съм го планирал' }, emoji: '🚶', consequence: { en: 'The "want" feeling fades in 20 minutes (studies confirm this). You end the month with €400 surplus which goes straight into your emergency fund. Self-control is a superpower.', bg: 'Чувството на "желание" изчезва за 20 минути (изследванията го потвърждават). Завършваш месеца с €400 излишък за аварийния фонд.' }, cashFlowChange: 0, isGood: true },
              { label: { en: 'Add it to next month\'s budget', bg: 'Добави го в бюджета за следващия месец' }, emoji: '📝', consequence: { en: 'You write it down and budget for it next month. When you return, you realize you don\'t actually want it anymore. The 24-hour rule saved you €120!', bg: 'Записваш го и бюджетираш за следващия месец. Когато се върнеш, осъзнаваш, че вече не го искаш. Правилото за 24 часа ти спести €120!' }, cashFlowChange: 0, isGood: true },
            ],
          },
          {
            id: 'et-match-1',
            type: 'match_terms',
            xp: 15,
            matchPairs: [
              { term: { en: 'Impulse buying', bg: 'Импулсивно купуване' }, definition: { en: 'Purchasing without thinking or planning ahead', bg: 'Купуване без мислене или предварително планиране' } },
              { term: { en: 'Lifestyle inflation', bg: 'Инфлация на начина на живот' }, definition: { en: 'Spending more as your income increases', bg: 'Харчене на повече с увеличаване на дохода' } },
              { term: { en: 'The 24-hour rule', bg: 'Правилото за 24 часа' }, definition: { en: 'Wait a day before any non-essential purchase', bg: 'Изчакай ден преди всяка несъществена покупка' } },
              { term: { en: 'The Latte Factor', bg: 'Ефектът на латето' }, definition: { en: 'Small daily expenses that add up to huge amounts over time', bg: 'Малки ежедневни разходи, които стават огромни суми с времето' } },
            ],
          },
          {
            id: 'et-decision-1',
            type: 'scenario_decision',
            xp: 20,
            decisionScenario: { en: 'Your phone still works perfectly but the latest model just came out. Your friends are all upgrading. The new phone costs €1,200 and you could finance it at €50/month for 24 months. Your current phone is 2 years old.', bg: 'Телефонът ти работи перфектно, но последният модел току-що излезе. Приятелите ти ъпгрейдват. Новият телефон струва €1,200 и може да го финансираш на €50/месец за 24 месеца. Текущият ти телефон е на 2 години.' },
            decisionAvatar: '📱',
            decisionChoices: [
              { label: { en: 'Upgrade now — I need the latest tech!', bg: 'Ъпгрейдни сега — имам нужда от последната технология!' }, emoji: '📱', outcome: { en: 'You\'re paying €1,200 for marginal improvements. The financing means you pay more due to interest. Plus in 2 years, you\'ll want the NEXT new model. This cycle never ends and costs €600/year on average.', bg: 'Плащаш €1,200 за маргинални подобрения. Финансирането означава, че плащаш повече заради лихва. Плюс след 2 години ще искаш СЛЕДВАЩИЯ нов модел. Този цикъл не свършва и струва средно €600/година.' }, isBest: false },
              { label: { en: 'Keep my phone — invest the €50/month instead', bg: 'Запази телефона — инвестирай €50/месец вместо това' }, emoji: '💰', outcome: { en: 'Your phone works fine. €50/month invested at 7% for 10 years = €8,600. That\'s 7 phones worth of wealth from ONE delayed upgrade. When your phone actually breaks, buy last year\'s model at a discount.', bg: 'Телефонът ти работи добре. €50/месец инвестирани при 7% за 10 години = €8,600. Това е 7 телефона богатство от ЕДНО отложено ъпгрейдване. Когато телефонът наистина се повреди, купи миналогодишния модел с намаление.' }, isBest: true },
              { label: { en: 'Wait 6 months for the price to drop', bg: 'Изчакай 6 месеца цената да падне' }, emoji: '⏳', outcome: { en: 'Decent compromise. After 6 months the price drops €200-300 and you can decide with a clearer head. But ask yourself: will you even want it in 6 months? Usually the desire fades.', bg: 'Приличен компромис. След 6 месеца цената пада с €200-300 и можеш да решиш с по-ясна глава. Но се запитай: ще го искаш ли след 6 месеца? Обикновено желанието избледнява.' }, isBest: false },
            ],
            explanation: { en: 'The biggest spending trap: upgrading things that still work. Marketing creates artificial "need." The 24-hour rule applies here too — if you wait, the urge usually passes. Invest the difference and build real wealth.', bg: 'Най-големият капан на харченето: ъпгрейдване на неща, които работят. Маркетингът създава изкуствена "нужда." Правилото за 24 часа важи и тук — ако изчакаш, желанието обикновено отминава.' },
          },
        ],
      },

      // ── Lesson 4: Credit Score Mastery ──
      {
        id: 'credit-score-mastery',
        moduleId: 'budgeting',
        title: { en: 'Credit Score Mastery', bg: 'Овладей кредитния рейтинг' },
        description: { en: 'Understand the number that controls your financial doors — and how to improve it.', bg: 'Разбери числото, което контролира финансовите ти врати — и как да го подобриш.' },
        icon: '📊', xpReward: 120, order: 4,
        exercises: [
          // 1. Theory block
          {
            id: 'cs-theory',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '📊',
                title: { en: 'What Is a Credit Score?', bg: 'Какво е кредитен рейтинг?' },
                body: { en: 'Your credit score is a 3-digit number (300–850) that tells lenders how risky it is to lend you money. A higher score means lower interest rates, better loan terms, and easier approvals.\n\nThink of it as your financial reputation — built over years, damaged in days.', bg: 'Кредитният рейтинг е 3-цифрено число (300–850), което казва на кредиторите колко рисковано е да ти заемат пари. По-висок рейтинг означава по-ниски лихви, по-добри условия и по-лесно одобрение.\n\nМисли за него като за финансовата ти репутация — изгражда се с години, разрушава се за дни.' },
                highlight: { en: '680 = Fair | 700 = Good | 750+ = Excellent — each tier unlocks better financial products.', bg: '680 = Задоволителен | 700 = Добър | 750+ = Отличен — всяко ниво отключва по-добри финансови продукти.' },
              },
              {
                emoji: '🧩',
                title: { en: 'The 5 Factors', bg: 'Петте фактора' },
                body: { en: 'Your credit score is built from 5 key factors:\n\n35% — Payment history (pay on time!)\n30% — Credit utilization (keep below 30%)\n15% — Length of credit history\n10% — Credit mix (cards + loans)\n10% — New credit inquiries\n\nThe first two factors alone account for 65% of your score.', bg: 'Кредитният рейтинг се изгражда от 5 ключови фактора:\n\n35% — Плащания навреме\n30% — Използване на кредит (под 30%)\n15% — Дължина на кредитна история\n10% — Микс от кредити\n10% — Нови запитвания\n\nПървите два фактора сами по себе си съставляват 65% от рейтинга.' },
                highlight: { en: '💡 A single missed payment can drop your score by 50-100 points!', bg: '💡 Едно пропуснато плащане може да свали рейтинга ти с 50-100 точки!' },
              },
              {
                emoji: '💰',
                title: { en: 'Why It Matters: Real Money', bg: 'Защо е важно: Реални пари' },
                body: { en: 'With a 680 score, you might pay 8.5% on a car loan.\nWith a 750 score, you would pay 5.2%.\n\nOn a €25,000 car over 5 years:\n680 score: €3,400 more in interest!\n\nOver a lifetime, your credit score can cost or save you €100,000+ in interest charges.', bg: 'С рейтинг 680, може да плащаш 8.5% на автокредит.\nС рейтинг 750, ще плащаш 5.2%.\n\nНа кола за €25,000 за 5 години:\nРейтинг 680: €3,400 повече лихва!\n\nПрез целия живот, кредитният рейтинг може да ти струва или спести €100,000+ в лихви.' },
              },
            ],
          },
          // 2. Match Terms — financial vocabulary
          {
            id: 'cs-match',
            type: 'match_terms',
            xp: 15,
            matchPairs: [
              { term: { en: 'Credit utilization', bg: 'Използване на кредит' }, definition: { en: 'Percentage of your credit limit you are using', bg: 'Процент от кредитния лимит, който използваш' } },
              { term: { en: 'Hard inquiry', bg: 'Твърдо запитване' }, definition: { en: 'Credit check by a lender that temporarily lowers your score', bg: 'Проверка от кредитор, която временно понижава рейтинга' } },
              { term: { en: 'Payment history', bg: 'История на плащанията' }, definition: { en: 'Record of whether you pay bills on time', bg: 'Запис дали плащаш сметките навреме' } },
              { term: { en: 'Credit mix', bg: 'Кредитен микс' }, definition: { en: 'Variety of credit types you have (cards, loans, mortgage)', bg: 'Разнообразие от видове кредити (карти, заеми, ипотека)' } },
            ],
          },
          // 3. True/False — myth busting
          {
            id: 'cs-tf-1',
            type: 'true_false',
            xp: 15,
            statement: { en: 'Checking your own credit score will lower it.', bg: 'Проверката на собствения ти кредитен рейтинг го понижава.' },
            isTrue: false,
            explanation: { en: 'This is a common myth! Checking your own score is a "soft inquiry" which has zero impact. Only "hard inquiries" from lenders (when you apply for credit) temporarily lower your score by 5-10 points.', bg: 'Това е често срещан мит! Проверката на собствения рейтинг е "меко запитване", което няма никакво влияние. Само "твърди запитвания" от кредитори (когато кандидатстваш за кредит) временно понижават рейтинга с 5-10 точки.' },
          },
          // 4. Order Items — rank credit score factors
          {
            id: 'cs-order',
            type: 'order_items',
            xp: 20,
            orderInstruction: { en: 'Rank these factors by their impact on your credit score (most important first)', bg: 'Подреди тези фактори по влиянието им върху кредитния рейтинг (най-важните първо)' },
            orderItems: [
              { label: { en: 'Payment history (35%)', bg: 'История на плащанията (35%)' }, emoji: '📅' },
              { label: { en: 'Credit utilization (30%)', bg: 'Използване на кредит (30%)' }, emoji: '💳' },
              { label: { en: 'Length of history (15%)', bg: 'Дължина на историята (15%)' }, emoji: '📆' },
              { label: { en: 'Credit mix (10%)', bg: 'Кредитен микс (10%)' }, emoji: '🎯' },
              { label: { en: 'New inquiries (10%)', bg: 'Нови запитвания (10%)' }, emoji: '🔍' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Payment history and credit utilization together make up 65% of your score. Focus on paying on time and keeping balances low!', bg: 'Историята на плащанията и използването на кредит заедно съставляват 65% от рейтинга. Фокусирай се върху навременните плащания и ниските баланси!' },
          },
          // 5. Fill Number — calculate utilization
          {
            id: 'cs-calc',
            type: 'fill_number',
            xp: 20,
            fillNumberScenario: { en: 'Your credit card has a €10,000 limit. Financial experts recommend keeping your utilization below 30%. What is the maximum balance you should carry?', bg: 'Кредитната ти карта има лимит от €10,000. Финансовите експерти препоръчват да държиш използването под 30%. Какъв е максималният баланс, който трябва да имаш?' },
            question: { en: 'Maximum recommended balance:', bg: 'Максимален препоръчителен баланс:' },
            fillNumberAnswer: 3000,
            fillNumberTolerance: 100,
            fillNumberUnit: '€',
            fillNumberHint: { en: 'Multiply the credit limit by the recommended utilization percentage.', bg: 'Умножи кредитния лимит по препоръчания процент на използване.' },
            explanation: { en: '€10,000 × 30% = €3,000. Keeping your utilization below 30% shows lenders you manage credit responsibly. Below 10% is even better for your score!', bg: '€10,000 × 30% = €3,000. Поддържането на използването под 30% показва на кредиторите, че управляваш кредита отговорно. Под 10% е още по-добре за рейтинга!' },
          },
          // 6. Scenario Decision — real dilemma
          {
            id: 'cs-decision',
            type: 'scenario_decision',
            xp: 20,
            decisionScenario: { en: 'You have 3 credit cards. Your oldest card (8 years old) has a €50 annual fee and you rarely use it. You\'re thinking about closing it to save money. Your credit score is currently 720.', bg: 'Имаш 3 кредитни карти. Най-старата (8 години) има €50 годишна такса и рядко я използваш. Мислиш да я затвориш, за да спестиш пари. Кредитният ти рейтинг е 720.' },
            decisionAvatar: '🤔',
            decisionChoices: [
              { label: { en: 'Close the card — save €50/year', bg: 'Затвори картата — спести €50/година' }, emoji: '✂️', outcome: { en: 'Closing your oldest card shortens your credit history (15% of score) and increases your utilization ratio. Your score could drop 30-50 points. That drop could cost you thousands on your next loan.', bg: 'Затварянето на най-старата карта скъсява кредитната история (15% от рейтинга) и увеличава съотношението на използване. Рейтингът може да падне с 30-50 точки, което може да ти струва хиляди на следващия заем.' }, isBest: false },
              { label: { en: 'Keep it open — use it once a month', bg: 'Дръж я отворена — използвай я веднъж месечно' }, emoji: '💳', outcome: { en: 'Smart! Making one small purchase per month keeps the card active, preserves your 8-year credit history, and maintains your available credit. The €50/year fee is worth the credit score protection.', bg: 'Умно! Една малка покупка на месец поддържа картата активна, запазва 8-годишната кредитна история и поддържа наличния кредит. €50/година такса си заслужава защитата на рейтинга.' }, isBest: true },
              { label: { en: 'Ask to downgrade to a no-fee card', bg: 'Помоли за преминаване към карта без такса' }, emoji: '📞', outcome: { en: 'Also a great option! Many banks let you downgrade to a no-fee version of the same card, preserving your history and credit limit. Always call and ask before closing.', bg: 'Също чудесен вариант! Много банки позволяват преминаване към версия без такса, запазвайки историята и кредитния лимит. Винаги се обади и попитай преди да затвориш.' }, isBest: true },
            ],
            explanation: { en: 'The general rule: never close your oldest credit card. The credit history length and available credit are worth more than the annual fee. If the fee is too high, call your bank to negotiate or downgrade.', bg: 'Общо правило: никога не затваряй най-старата кредитна карта. Дължината на кредитната история и наличният кредит струват повече от годишната такса. Ако таксата е висока, обади се в банката, за да преговаряш или преминеш на по-евтин вариант.' },
          },
          // 7. True/False — another myth
          {
            id: 'cs-tf-2',
            type: 'true_false',
            xp: 15,
            statement: { en: 'You need to carry a balance on your credit card to build credit.', bg: 'Трябва да поддържаш баланс по кредитната карта, за да изграждаш кредит.' },
            isTrue: false,
            explanation: { en: 'Myth busted! You build credit by using your card and paying the FULL balance each month. Carrying a balance just means you pay interest for nothing. The credit bureaus see your on-time payment regardless of whether you carry a balance or not.', bg: 'Митът е разбит! Изграждаш кредит, като използваш картата и плащаш ПЪЛНИЯ баланс всеки месец. Поддържането на баланс просто означава, че плащаш лихва без причина. Кредитните бюра виждат навременното плащане, независимо дали поддържаш баланс или не.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 2 — SAVING
  // Signature interactive: compound_sim (live growth simulator)
  // ─────────────────────────────────────────────
  {
    id: 'saving',
    title: { en: 'Saving Smart', bg: 'Умно спестяване' },
    description: { en: 'Build your safety net and harness compound interest.', bg: 'Изгради финансова мрежа и използвай сложната лихва.' },
    icon: '💎', color: 'blue', order: 2,
    lessons: [
      // ── Lesson 1: Your Financial Airbag ──
      {
        id: 'emergency-fund',
        moduleId: 'saving',
        title: { en: 'Your Financial Airbag', bg: 'Финансовата ти въздушна възглавница' },
        description: { en: 'Why an emergency fund is the most important first step.', bg: 'Защо аварийният фонд е най-важната първа стъпка.' },
        icon: '🛡️', xpReward: 110, order: 1,
        exercises: [
          {
            id: 'ef-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '💥',
                title: { en: 'Life Happens', bg: 'Животът се случва' },
                body: { en: 'Car breaks down. Medical bill. Job loss. Roof leaks.\n\nWithout an emergency fund, ANY unexpected expense sends you into debt. Studies show 40% of people cannot cover a €400 emergency without borrowing.\n\nAn emergency fund is not an investment — it\'s insurance.', bg: 'Колата се разваля. Медицинска сметка. Загуба на работа. Покривът тече.\n\nБез авариен фонд, ВСЕКИ неочакван разход те вкарва в дълг. 40% от хората не могат да покрият €400 аварийна ситуация без заем.\n\nАварийният фонд не е инвестиция — той е застраховка.' },
                highlight: { en: '🎯 Goal: 3–6 months of expenses in a HIGH-YIELD savings account, always accessible.', bg: '🎯 Цел: 3–6 месеца разходи в спестовна сметка с ВИСОКА ЛИХВА, винаги достъпни.' },
              },
              {
                emoji: '🏗️',
                title: { en: 'Build It in 4 Steps', bg: 'Изгради го в 4 стъпки' },
                body: { en: '1️⃣ Open a separate high-yield savings account (2–5% APY)\n2️⃣ Automate a fixed transfer on payday\n3️⃣ Add windfalls (bonuses, tax refunds)\n4️⃣ Never touch it except for real emergencies\n\nStart with €500 as a "starter" fund, then build to 3 months.', bg: '1️⃣ Отвори отделна спестовна сметка с висока лихва (2–5% ГПР)\n2️⃣ Автоматизирай фиксиран превод в деня на заплата\n3️⃣ Добавяй извънредни доходи (бонуси, връщания)\n4️⃣ Никога не го пипай освен за истински аварии\n\nЗапочни с €500 "стартов" фонд, след това стигни до 3 месеца.' },
                highlight: { en: '💡 Keep it SEPARATE from checking — out of sight, out of mind.', bg: '💡 Дръж го ОТДЕЛНО от разплащателната сметка — извън погледа, извън ума.' },
              },
            ],
          },
          {
            id: 'ef-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Emergency fund', bg: 'Авариен фонд' }, definition: { en: '3–6 months of expenses, kept liquid and safe', bg: '3–6 месеца разходи, държани ликвидни и безопасни' } },
              { term: { en: 'High-yield savings', bg: 'Спестовна с висока лихва' }, definition: { en: 'Bank account paying 2–5% APY, FDIC insured', bg: 'Банкова сметка с 2–5% ГПР, гарантирана' } },
              { term: { en: 'Liquidity', bg: 'Ликвидност' }, definition: { en: 'How quickly an asset can be converted to cash', bg: 'Колко бързо актив може да се превърне в кеш' } },
              { term: { en: 'Starter fund', bg: 'Стартов фонд' }, definition: { en: 'A small €500–€1,000 buffer before the full fund', bg: 'Малък буфер €500–€1,000 преди пълния фонд' } },
            ],
          },
          {
            id: 'ef-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'Your monthly expenses are €2,400 (rent €1,000, food €400, transport €200, bills €300, other €500).', bg: 'Месечните ти разходи са €2,400 (наем €1,000, храна €400, транспорт €200, сметки €300, друго €500).' },
            question: { en: 'How big should a 3-month emergency fund be?', bg: 'Колко голям трябва да е 3-месечен авариен фонд?' },
            fillNumberAnswer: 7200, fillNumberTolerance: 100, fillNumberUnit: '€',
            fillNumberHint: { en: 'Multiply monthly expenses by the number of months you want to cover.', bg: 'Умножи месечните разходи по броя месеци, които искаш да покриеш.' },
            explanation: { en: '€2,400 × 3 = €7,200. Some people prefer 6 months (€14,400) if their income is variable or they have dependents.', bg: '€2,400 × 3 = €7,200. Някои хора предпочитат 6 месеца (€14,400), ако доходът им е променлив или имат зависими.' },
          },
          {
            id: 'ef-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'You should invest your emergency fund in stocks for higher returns.', bg: 'Трябва да инвестираш аварийния фонд в акции за по-висока доходност.' },
            isTrue: false,
            explanation: { en: 'FALSE. Stocks can drop 30–50% exactly when emergencies hit (recessions cause both job loss AND market crashes). Emergency funds need SAFETY and LIQUIDITY, not growth.', bg: 'НЕВЯРНО. Акциите могат да паднат 30–50% точно когато се случват аварии (рецесиите носят и загуба на работа, и спадове на пазара). Аварийните фондове изискват БЕЗОПАСНОСТ и ЛИКВИДНОСТ, не растеж.' },
          },
          {
            id: 'ef-sim-1', type: 'compound_sim', xp: 25,
            compoundConfig: { defaultPrincipal: 500, defaultRate: 4, defaultYears: 2, defaultMonthly: 300 },
          },
          {
            id: 'ef-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '🚗',
            decisionScenario: { en: 'Saturday morning. Car won\'t start. Mechanic quotes €1,400 for repair. You have a €4,000 emergency fund, €0 savings outside it, and a credit card with 23% APR.', bg: 'Съботна сутрин. Колата не пали. Майсторът иска €1,400 за ремонт. Имаш €4,000 авариен фонд, €0 други спестявания и кредитна карта с 23% ГПР.' },
            decisionChoices: [
              { label: { en: 'Use emergency fund — pay €1,400, rebuild later', bg: 'Използвай аварийния фонд — плати €1,400, попълни по-късно' }, emoji: '🛡️', outcome: { en: 'Fund drops to €2,600. You set up a €200/month auto-rebuild plan and are back to €4,000 in 7 months. Zero interest paid, zero stress.', bg: 'Фондът пада до €2,600. Слагаш авто-попълване €200/месец и се връщаш към €4,000 за 7 месеца. Нула лихва, нула стрес.' }, isBest: true },
              { label: { en: 'Charge it to credit card to "save" the fund', bg: 'Плати с кредитна карта, за да "запазиш" фонда' }, emoji: '💳', outcome: { en: 'You charge €1,400 at 23%. Paying €100/month takes 17 months and costs €270 in interest. The fund just sat there — earning 3% — while you paid 23%. Net loss: ~€220.', bg: 'Слагаш €1,400 при 23%. Плащайки €100/месец, отнема 17 месеца и струва €270 лихва. Фондът просто стоеше — печелейки 3% — докато плащаше 23%. Чиста загуба: ~€220.' }, isBest: false },
              { label: { en: 'Delay the repair — use the bus for now', bg: 'Отложи ремонта — карай автобус засега' }, emoji: '🚌', outcome: { en: 'You lose 90 minutes/day commuting. After 3 weeks you crack and pay anyway — but the engine damage worsened, and the bill is now €2,100. Delaying real fixes usually costs more.', bg: 'Губиш 90 мин/ден път. След 3 седмици се предаваш и плащаш — но щетата по двигателя се влоши и сметката е €2,100. Отлагането обикновено струва повече.' }, isBest: false },
            ],
            explanation: { en: 'This is exactly what an emergency fund is for. Using it isn\'t failure — it\'s the system working. Rebuilding is the next step.', bg: 'Точно за това е аварийният фонд. Използването му не е провал — това е работещата система. Попълването е следващата стъпка.' },
          },
          {
            id: 'ef-choice-1', type: 'choice', xp: 15,
            question: { en: 'Where should you keep your emergency fund?', bg: 'Където трябва да държиш аварийния си фонд?' },
            options: [
              { en: 'Stock market for higher returns', bg: 'На борсата за по-висока доходност' },
              { en: 'High-yield savings account', bg: 'Спестовна сметка с висока лихва' },
              { en: 'Cash at home under the mattress', bg: 'В брой вкъщи под матрака' },
              { en: 'Cryptocurrency for growth', bg: 'Криптовалута за растеж' },
            ],
            correctIndex: 1,
            explanation: { en: 'High-yield savings = SAFE + LIQUID + earns 2–5% to fight inflation. Cash loses value, stocks/crypto are too volatile for emergency money.', bg: 'Спестовна с висока лихва = БЕЗОПАСНА + ЛИКВИДНА + 2–5% срещу инфлацията. Парите в брой губят стойност, акции/крипто са твърде волатилни за аварийни пари.' },
          },
        ],
      },

      // ── Lesson 2: Compound Magic ──
      {
        id: 'compound-magic',
        moduleId: 'saving',
        title: { en: 'Money Growing on Trees', bg: 'Пари, израстващи на дървета' },
        description: { en: 'See compound interest in action — the most powerful force in finance.', bg: 'Виж сложната лихва в действие — най-мощната сила във финансите.' },
        icon: '✨', xpReward: 130, order: 2,
        exercises: [
          {
            id: 'cm-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🌱',
                title: { en: 'The 8th Wonder of the World', bg: 'Осмото чудо на света' },
                body: { en: 'Simple interest: earn only on principal\nCompound interest: earn on principal PLUS prior interest\n\n€1,000 at 7%:\n• Year 1: €1,070\n• Year 10: €1,967\n• Year 30: €7,612\n• Year 40: €14,974 🤯\n\nDoubling time follows the Rule of 72: 72 ÷ rate = years to double.', bg: 'Проста лихва: само върху главницата\nСложна лихва: върху главницата + предишните лихви\n\n€1,000 при 7%:\n• Г.1: €1,070\n• Г.10: €1,967\n• Г.30: €7,612\n• Г.40: €14,974 🤯\n\nВремето за удвояване: правило 72 ÷ % = години.' },
                highlight: { en: '⏰ Time matters more than amount. 10 extra years can DOUBLE your final wealth.', bg: '⏰ Времето е по-важно от сумата. 10 допълнителни години могат да УДВОЯТ богатството ти.' },
              },
              {
                emoji: '👶',
                title: { en: 'Anna vs. Bob', bg: 'Анна срещу Боб' },
                body: { en: 'Anna invests €200/mo from age 25–35 (10 yrs), then STOPS. Total in: €24,000\nBob invests €200/mo from age 35–65 (30 yrs). Total in: €72,000\n\nAt 65 (7% return):\n• Anna: €602,000\n• Bob: €243,000\n\nAnna put in 3× LESS, ended with 2.5× MORE. That\'s time.', bg: 'Анна инвестира €200/мес от 25–35 г. (10 г.), после СПИРА. Общо: €24,000\nБоб от 35–65 г. (30 г.). Общо: €72,000\n\nНа 65 (7%):\n• Анна: €602,000\n• Боб: €243,000\n\nАнна слага 3× ПО-МАЛКО, завършва с 2.5× ПОВЕЧЕ. Това е времето.' },
                highlight: { en: '🎯 The best time to start was 10 years ago. The second best is TODAY.', bg: '🎯 Най-доброто време беше преди 10 години. Второто най-добро е ДНЕС.' },
              },
            ],
          },
          {
            id: 'cm-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'Rule of 72: divide 72 by your annual return % to estimate doubling time.', bg: 'Правило 72: раздели 72 на годишната доходност %, за да оцениш времето за удвояване.' },
            question: { en: 'At an 8% annual return, how many years does it take for €1,000 to double?', bg: 'При 8% годишна доходност, за колко години €1,000 се удвояват?' },
            fillNumberAnswer: 9, fillNumberTolerance: 1, fillNumberUnit: '',
            fillNumberHint: { en: '72 ÷ 8 = ?', bg: '72 ÷ 8 = ?' },
            explanation: { en: '72 ÷ 8 = 9 years. The Rule of 72 is a quick mental shortcut for compound math without a calculator.', bg: '72 ÷ 8 = 9 години. Правилото 72 е бърз умствен трик за сложни сметки без калкулатор.' },
          },
          {
            id: 'cm-sim-1', type: 'compound_sim', xp: 30,
            compoundConfig: { defaultPrincipal: 1000, defaultRate: 7, defaultYears: 30, defaultMonthly: 200 },
          },
          {
            id: 'cm-order-1', type: 'order_items', xp: 20,
            orderInstruction: { en: 'Order these from FASTEST to SLOWEST money growth (highest final value first):', bg: 'Подреди от НАЙ-БЪРЗ към НАЙ-БАВЕН растеж (най-висока крайна стойност първа):' },
            orderItems: [
              { label: { en: 'Stocks @ 8% for 30 years', bg: 'Акции @ 8% за 30 г.' }, emoji: '📈' },
              { label: { en: 'Bonds @ 4% for 30 years', bg: 'Облигации @ 4% за 30 г.' }, emoji: '📊' },
              { label: { en: 'High-yield savings @ 2% for 30 years', bg: 'Спестовна @ 2% за 30 г.' }, emoji: '🏦' },
              { label: { en: 'Cash under the mattress @ 0%', bg: 'В брой под матрака @ 0%' }, emoji: '💵' },
            ],
            correctOrder: [0, 1, 2, 3],
            explanation: { en: '€1,000 over 30 years: 8% → €10,063, 4% → €3,243, 2% → €1,811, 0% → €1,000 (and inflation makes it worth €450 in real terms).', bg: '€1,000 за 30 г.: 8% → €10,063, 4% → €3,243, 2% → €1,811, 0% → €1,000 (а инфлацията прави стойността €450 реално).' },
          },
          {
            id: 'cm-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Principal', bg: 'Главница' }, definition: { en: 'The original amount of money invested', bg: 'Първоначалната инвестирана сума' } },
              { term: { en: 'APY', bg: 'ГПР' }, definition: { en: 'Annual percentage yield, including compounding', bg: 'Годишна доходност, включваща капитализация' } },
              { term: { en: 'Rule of 72', bg: 'Правило 72' }, definition: { en: 'Mental shortcut: 72 ÷ rate ≈ years to double', bg: 'Умствен трик: 72 ÷ % ≈ години за удвояване' } },
              { term: { en: 'Compounding', bg: 'Капитализация' }, definition: { en: 'Earning returns on previous returns', bg: 'Печелене на доходност върху предишна доходност' } },
              { term: { en: 'Time horizon', bg: 'Времеви хоризонт' }, definition: { en: 'How long money stays invested before withdrawal', bg: 'Колко дълго парите остават инвестирани' } },
            ],
          },
          {
            id: 'cm-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Doubling your monthly contribution and doubling your time horizon produce roughly the same final amount.', bg: 'Удвояването на месечната вноска и удвояването на времето дават приблизително еднаква крайна сума.' },
            isTrue: false,
            explanation: { en: 'FALSE. Time wins because of exponential compounding. €200/mo for 40 yrs at 7% ≈ €525k, but €400/mo for 20 yrs ≈ €209k. Same total contributed (€96k), wildly different result.', bg: 'НЕВЯРНО. Времето печели заради експоненциалната капитализация. €200/мес за 40 г. при 7% ≈ €525k, а €400/мес за 20 г. ≈ €209k. Същата вноска (€96k), коренно различен резултат.' },
          },
          {
            id: 'cm-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '⏳',
            decisionScenario: { en: 'You\'re 25 with €300/month to spare. You read about compound interest and have 3 options.', bg: 'На 25 си с €300/месец. Прочете за сложна лихва и имаш 3 варианта.' },
            decisionChoices: [
              { label: { en: 'Start now @ €300/month into index funds (7%)', bg: 'Започни сега €300/мес в индексни фондове (7%)' }, emoji: '🚀', outcome: { en: 'At 65: ~€720,000. The 40-year runway means compounding does most of the heavy lifting (>80% of the final value).', bg: 'На 65: ~€720,000. 40-годишният хоризонт оставя капитализацията да върши работата (>80% от стойността).' }, isBest: true },
              { label: { en: 'Wait 10 yrs to "earn more first," then invest €600/mo', bg: 'Изчакай 10 г. да "печелиш повече", после €600/мес' }, emoji: '⏰', outcome: { en: 'At 65: ~€680,000 — slightly less, despite contributing 2× the monthly amount. You contributed €216k vs €144k. Time > amount.', bg: 'На 65: ~€680,000 — малко по-малко, въпреки че влагаш 2× повече. Внасяш €216k срещу €144k. Времето > сумата.' }, isBest: false },
              { label: { en: 'Spend it now, save in your 40s when "established"', bg: 'Похарчи го сега, спестявай в 40-те когато си "стабилен"' }, emoji: '🎉', outcome: { en: 'At 65 (15 yrs of saving from 50): ~€155,000. You missed the most powerful 25 years of compounding. There is no shortcut for time.', bg: 'На 65 (15 г. спестявания от 50): ~€155,000. Пропусна най-силните 25 години капитализация. Няма пряк път за времето.' }, isBest: false },
            ],
            explanation: { en: 'Starting early matters more than starting big. Even small amounts compound into massive sums when given decades.', bg: 'Ранното започване е по-важно от голямата сума. Дори малки суми се натрупват в големи когато им дадем десетилетия.' },
          },
        ],
      },

      // ── Lesson 3: Saving on Autopilot ──
      {
        id: 'saving-habits',
        moduleId: 'saving',
        title: { en: 'Saving on Autopilot', bg: 'Спестяване на автопилот' },
        description: { en: 'Remove willpower from the equation with smart automation.', bg: 'Премахни волята от уравнението с умна автоматизация.' },
        icon: '🤖', xpReward: 120, order: 3,
        exercises: [
          {
            id: 'sh-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🤖',
                title: { en: 'Pay Yourself First', bg: 'Плати първо на себе си' },
                body: { en: 'Willpower is finite. Every "should I save?" decision drains it. The fix: remove the decision.\n\nAuto-transfer savings the day after payday — before bills, before fun, before life eats it. You spend whatever\'s left, guilt-free.\n\nThis single habit beats 90% of "budget apps" because it doesn\'t require any tracking.', bg: 'Волята е ограничена. Всяко "да спестя ли?" я изчерпва. Решението: премахни решението.\n\nАвто-превод за спестявания в деня след заплата — преди сметки, преди забавления. Харчиш каквото остане без вина.\n\nТози навик бие 90% от приложенията за бюджет, защото не изисква проследяване.' },
                highlight: { en: '🔑 Money you never see is money you can\'t spend.', bg: '🔑 Пари, които не виждаш, са пари, които не можеш да похарчиш.' },
              },
              {
                emoji: '📐',
                title: { en: 'How Much to Save?', bg: 'Колко да спестяваш?' },
                body: { en: 'Rules of thumb (use whichever fits):\n\n• 50/30/20: 50% needs, 30% wants, 20% savings+investing\n• 1% rule: increase savings rate by 1% per year, painless\n• Match-it: every raise → split 50/50 with savings\n\nFloor: 10% of gross. Aim for 20%. Wealth-builders do 30%+.', bg: 'Правила (избери си):\n\n• 50/30/20: 50% нужди, 30% желания, 20% спестявания+инвестиции\n• 1% правило: повишавай % с 1 на година, безболезнено\n• Match-it: всяко повишение → 50/50 със спестявания\n\nМинимум: 10% бруто. Цел: 20%. Богаташи: 30%+.' },
                highlight: { en: '⚡ Automation > willpower. Set it once, forget it, watch it grow.', bg: '⚡ Автоматизация > воля. Настрой веднъж, забрави, гледай как расте.' },
              },
            ],
          },
          {
            id: 'sh-sort-1', type: 'sort_items', xp: 20,
            sortItems: [
              { label: { en: 'Auto-transfer to savings on payday', bg: 'Авто-превод за спестявания в деня на заплата' }, emoji: '🤖', isAsset: true },
              { label: { en: 'Impulse buying during sales', bg: 'Импулсивно купуване по намаления' }, emoji: '🛍️', isAsset: false },
              { label: { en: 'High-yield savings account', bg: 'Спестовна сметка с висока лихва' }, emoji: '🏦', isAsset: true },
              { label: { en: 'Five unused streaming subscriptions', bg: 'Пет неизползвани стрийминг абонамента' }, emoji: '📺', isAsset: false },
              { label: { en: 'Saving every raise instead of spending it', bg: 'Спестяване на всяко повишение' }, emoji: '📈', isAsset: true },
              { label: { en: 'Daily €5 coffee shop habit', bg: 'Ежедневен навик за €5 кафе' }, emoji: '☕', isAsset: false },
              { label: { en: 'Sinking funds for predictable big costs', bg: 'Целеви фондове за големи разходи' }, emoji: '🪣', isAsset: true },
              { label: { en: 'Buy now, pay later for non-essentials', bg: 'Купи сега, плати после за неважно' }, emoji: '⌛', isAsset: false },
            ],
          },
          {
            id: 'sh-budget-1', type: 'budget_slider', xp: 25,
            income: 2500,
            categories: [
              { label: { en: 'Fixed Needs (rent, bills)', bg: 'Фиксирани нужди (наем, сметки)' }, emoji: '🏠', min: 0, max: 1500, ideal: 850 },
              { label: { en: 'Variable Needs (food, transport)', bg: 'Променливи нужди (храна, транспорт)' }, emoji: '🛒', min: 0, max: 800, ideal: 450 },
              { label: { en: 'Wants (fun, dining)', bg: 'Желания (забавления, ресторанти)' }, emoji: '🎉', min: 0, max: 600, ideal: 450 },
              { label: { en: 'Emergency Fund', bg: 'Авариен фонд' }, emoji: '🛡️', min: 0, max: 500, ideal: 250 },
              { label: { en: 'Investments', bg: 'Инвестиции' }, emoji: '📈', min: 0, max: 500, ideal: 250 },
              { label: { en: 'Sinking Fund (vacation, gifts)', bg: 'Целеви фонд (ваканция, подаръци)' }, emoji: '🪣', min: 0, max: 400, ideal: 250 },
            ],
          },
          {
            id: 'sh-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '💰',
            decisionScenario: { en: 'You just got a €300/month raise. Lifestyle creep tempts you. Pick the move that builds wealth without feeling deprived.', bg: 'Получи €300/месец повишение. Изкушаваш се да живееш по-широко. Избери ход, който трупа богатство без да се чувстваш ограничен.' },
            decisionChoices: [
              { label: { en: 'Auto-route the entire €300 to savings/investing', bg: 'Авто-преведи целите €300 за спестявания/инвестиции' }, emoji: '💯', outcome: { en: 'Boring but powerful. €300/mo for 30 yrs at 7% = €366,000. You never adapted to the higher take-home, so you don\'t miss it.', bg: 'Скучно, но мощно. €300/мес за 30 г. при 7% = €366,000. Никога не свикна с по-високия доход, не ти липсва.' }, isBest: false },
              { label: { en: 'Split 50/50: €150 savings, €150 enjoy', bg: 'Раздели 50/50: €150 спестявания, €150 удоволствие' }, emoji: '⚖️', outcome: { en: 'Balanced and sustainable. Lifestyle improves a little, savings rate climbs. €150/mo at 7% over 30 yrs ≈ €183,000. Easier to stick with for decades.', bg: 'Балансирано и устойчиво. Стилът се подобрява леко, спестяванията растат. €150/мес при 7% за 30 г. ≈ €183,000. По-лесно за дългосрочно следване.' }, isBest: true },
              { label: { en: 'Spend it all — you earned it', bg: 'Похарчи всичко — заслужи го' }, emoji: '🍾', outcome: { en: 'Lifestyle creep locked in. Next raise, you\'ll do the same. After 10 yrs of raises spent, your savings rate is unchanged but expenses doubled.', bg: 'Луксът се затвърждава. Следващото повишение — същото. След 10 г., спестяванията са същите, разходите — двойни.' }, isBest: false },
            ],
            explanation: { en: 'Splitting raises 50/50 is the sweet spot — wealth builds AND life improves. All-in either direction usually fails over time.', bg: 'Разделянето 50/50 е златната среда — и богатството расте, и животът се подобрява. Крайностите обикновено се провалят.' },
          },
          {
            id: 'sh-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Pay yourself first', bg: 'Плати първо на себе си' }, definition: { en: 'Auto-save before paying anything else', bg: 'Авто-спестявай преди да платиш друго' } },
              { term: { en: 'Lifestyle creep', bg: 'Луксов навик' }, definition: { en: 'Spending rises with income, blocking wealth', bg: 'Разходите растат с дохода, блокирайки богатство' } },
              { term: { en: 'Sinking fund', bg: 'Целеви фонд' }, definition: { en: 'Saving monthly toward a known future expense', bg: 'Месечно спестяване за известен бъдещ разход' } },
              { term: { en: 'Savings rate', bg: 'Норма на спестяване' }, definition: { en: 'Percent of income saved or invested', bg: 'Процент от дохода, който спестяваш' } },
              { term: { en: '1% rule', bg: 'Правило 1%' }, definition: { en: 'Bump savings rate by 1% per year painlessly', bg: 'Качвай нормата с 1% на година безболезнено' } },
            ],
          },
          {
            id: 'sh-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Saving 20% of your income consistently is more powerful than picking the perfect investment.', bg: '20% спестявания постоянно е по-мощно от избирането на перфектната инвестиция.' },
            isTrue: true,
            explanation: { en: 'TRUE. Behavior beats brilliance. Most studies show savings RATE explains 80%+ of long-term wealth, while investment selection explains under 20%. The amount you save dwarfs the optimization.', bg: 'ВЯРНО. Поведението бие гения. Проучвания показват, че НОРМАТА на спестяване обяснява 80%+ от дългосрочното богатство, а изборът на инвестиция — под 20%.' },
          },
          {
            id: 'sh-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'You earn €3,000/month gross. Following the 50/30/20 rule, what should your monthly savings + investing target be?', bg: 'Печелиш €3,000/месец бруто. По правилото 50/30/20, каква е месечната ти цел за спестявания + инвестиции?' },
            question: { en: 'Target savings amount per month?', bg: 'Целева сума за спестяване на месец?' },
            fillNumberAnswer: 600, fillNumberTolerance: 20, fillNumberUnit: '€',
            fillNumberHint: { en: '20% of €3,000 = ?', bg: '20% от €3,000 = ?' },
            explanation: { en: '€3,000 × 20% = €600. Split it: emergency fund first, then index funds, then sinking funds for big purchases.', bg: '€3,000 × 20% = €600. Раздели го: първо авариен фонд, после индексни фондове, после целеви фондове за големи покупки.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 3 — INVESTING
  // Signature interactives: stock_chart (live price chart) + portfolio_pie
  // ─────────────────────────────────────────────
  {
    id: 'investing',
    title: { en: 'Investing 101', bg: 'Инвестиции 101' },
    description: { en: 'Put your money to work through smart investing.', bg: 'Накарай парите си да работят чрез умно инвестиране.' },
    icon: '📈', color: 'purple', order: 3,
    lessons: [
      // ── Lesson 1: Stocks, Bonds & the Market ──
      {
        id: 'stocks-bonds',
        moduleId: 'investing',
        title: { en: 'Stocks, Bonds & the Market', bg: 'Акции, облигации и пазарът' },
        description: { en: 'Two core assets — what they are, and how to read their charts.', bg: 'Двата основни актива — какво са и как да четеш графиките им.' },
        icon: '🏛️', xpReward: 120, order: 1,
        exercises: [
          {
            id: 'sb-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '📊',
                title: { en: 'What is a Stock?', bg: 'Какво е акция?' },
                body: { en: 'A stock = a tiny piece of ownership in a company.\n\nApple makes profit → shareholders get richer.\nApple struggles → shareholders lose value.\n\nThe S&P 500 (top 500 US companies) has returned ~10% annually since 1926. €10,000 in 1990 ≈ €190,000 today.', bg: 'Акция = малко парче собственост в компания.\n\nApple печели → акционерите забогатяват.\nApple се бори → акционерите губят стойност.\n\nS&P 500 (топ 500 компании в САЩ) е давал ~10% годишно от 1926 г. €10,000 от 1990 г. ≈ €190,000 днес.' },
                highlight: { en: '📈 Stocks = OWNERSHIP. Higher risk, higher long-term reward.', bg: '📈 Акции = СОБСТВЕНОСТ. По-висок риск, по-висока награда дългосрочно.' },
              },
              {
                emoji: '🔒',
                title: { en: 'Stocks vs Bonds', bg: 'Акции срещу облигации' },
                body: { en: 'A bond = a loan to a company or government. They pay you regular interest, then return your principal.\n\n• Stocks: ~10% historic return, big swings (-40% possible in a year)\n• Bonds: ~3–5% historic return, mild swings (-10% in a bad year)\n\nRule of thumb: bond % ≈ your age. 30 → 30% bonds, 60 → 60% bonds. Younger investors can ride out crashes.', bg: 'Облигация = заем към компания или правителство. Плащат ти редовна лихва, после връщат главницата.\n\n• Акции: ~10% историческа доходност, големи колебания (-40% за година)\n• Облигации: ~3–5% доходност, по-малки колебания (-10% в лоша година)\n\nПравило: % облигации ≈ възрастта. 30 → 30% облигации, 60 → 60%.' },
                highlight: { en: '🔒 Bonds = LOANS — ballast for the portfolio when stocks crash.', bg: '🔒 Облигации = ЗАЕМИ — баласт за портфейла при сривове.' },
              },
            ],
          },
          {
            id: 'sb-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Stock', bg: 'Акция' }, definition: { en: 'Ownership share in a company', bg: 'Дял на собственост в компания' } },
              { term: { en: 'Bond', bg: 'Облигация' }, definition: { en: 'Loan to a company or government with interest', bg: 'Заем към компания/правителство с лихва' } },
              { term: { en: 'Dividend', bg: 'Дивидент' }, definition: { en: 'Cash paid to shareholders from profits', bg: 'Кеш плащане към акционери от печалбата' } },
              { term: { en: 'Volatility', bg: 'Волатилност' }, definition: { en: 'How much price swings up and down', bg: 'Колко силно се колебае цената' } },
              { term: { en: 'Bear market', bg: 'Мечи пазар' }, definition: { en: 'Sustained decline of 20%+ from peak', bg: 'Устойчив спад от 20%+ от върха' } },
            ],
          },
          {
            id: 'sb-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Stocks always go up over the long term, so picking individual stocks is safe.', bg: 'Акциите винаги растат дългосрочно, така че избирането на единични акции е безопасно.' },
            isTrue: false,
            explanation: { en: 'FALSE. The MARKET (broad index) tends to rise long-term, but INDIVIDUAL stocks can go to zero (Enron, Lehman, Wirecard, Bear Stearns). Diversification across hundreds of companies — not stock picking — is what makes the long-term math work.', bg: 'НЕВЯРНО. ПАЗАРЪТ (широкият индекс) обикновено расте, но ЕДИНИЧНИТЕ акции могат да паднат до нула (Enron, Lehman, Wirecard). Диверсификацията — не избирането на акции — прави математиката да работи.' },
          },
          {
            id: 'sb-chart-1', type: 'stock_chart', xp: 25,
            stockChart: {
              prices: [100, 102, 99, 103, 101, 100, 104, 102, 105, 103, 106, 104, 107, 105, 108, 106, 109, 107, 110, 108, 111, 110, 112, 111],
              labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20','M21','M22','M23','M24'],
              scenario: { en: 'You see this 24-month price chart. Returns over 2 years: ~11%, with very mild ups and downs.', bg: 'Виждаш 24-месечна графика. Доходност за 2 г.: ~11%, с малки колебания.' },
              question: { en: 'Which asset most likely produced this chart?', bg: 'Кой актив най-вероятно е дал тази графика?' },
              mode: 'identify_pattern',
              patternOptions: [
                { en: 'A high-volatility tech stock', bg: 'Високо-волатилна технологична акция' },
                { en: 'A government bond fund', bg: 'Държавен облигационен фонд' },
                { en: 'A cryptocurrency', bg: 'Криптовалута' },
                { en: 'A penny stock', bg: 'Стотинкова акция' },
              ],
              correctPatternIndex: 1,
            },
            explanation: { en: 'Steady, low-volatility growth (~5%/yr) with tiny dips is classic bond behaviour. Stocks would show 30–40% swings; crypto would have wild +/-50% spikes.', bg: 'Стабилен, нискорисков растеж (~5%/год) с малки спадове е типично за облигации. Акциите биха имали 30–40% колебания; крипто — диви ±50% скокове.' },
          },
          {
            id: 'sb-sort-1', type: 'sort_items', xp: 20,
            sortItems: [
              { label: { en: 'S&P 500 index fund', bg: 'Индексен фонд S&P 500' }, emoji: '📊', isAsset: true },
              { label: { en: 'Brand-new car', bg: 'Нова кола' }, emoji: '🚙', isAsset: false },
              { label: { en: 'Government bond ETF', bg: 'ETF държавни облигации' }, emoji: '📜', isAsset: true },
              { label: { en: 'Designer handbag collection', bg: 'Колекция дизайнерски чанти' }, emoji: '👜', isAsset: false },
              { label: { en: 'Dividend-paying blue chip', bg: 'Дивидентна "син чип" акция' }, emoji: '💰', isAsset: true },
              { label: { en: 'Timeshare property', bg: 'Имот на таймшер' }, emoji: '🏖️', isAsset: false },
              { label: { en: 'Total stock market ETF', bg: 'ETF на целия фондов пазар' }, emoji: '🌍', isAsset: true },
            ],
          },
          {
            id: 'sb-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '💼',
            decisionScenario: { en: 'You have €5,000 to invest. Your cousin says "Tesla — going to 10×!" Your colleague says "low-cost index fund." What\'s the move?', bg: 'Имаш €5,000 за инвестиране. Братовчедът: "Tesla — 10× ще стане!" Колегата: "евтин индексен фонд." Какъв е ходът?' },
            decisionChoices: [
              { label: { en: 'All-in on Tesla — high reward', bg: 'Всичко в Tesla — висока награда' }, emoji: '🎰', outcome: { en: 'Single-stock = single point of failure. Tesla dropped 65% in 2022. €5,000 → €1,750. This is gambling, not investing.', bg: 'Едноактивен залог = единична точка на провал. Tesla падна с 65% през 2022. €5,000 → €1,750. Това е хазарт.' }, isBest: false },
              { label: { en: 'All in a broad index fund', bg: 'Всичко в широк индексен фонд' }, emoji: '📊', outcome: { en: 'Spread across 500+ companies. Even after a -19% year you recover within 18 months. At 7%/yr for 20 yrs: ~€19,000.', bg: 'Разпределени в 500+ компании. След -19% година се възстановяваш за 18 мес. При 7%/год за 20 г.: ~€19,000.' }, isBest: true },
              { label: { en: '80% index, 20% Tesla speculation', bg: '80% индекс, 20% спекулация в Tesla' }, emoji: '⚖️', outcome: { en: 'Reasonable: a calculated bet on top of a stable core. Capping speculation at 10–20% protects you if the bet fails.', bg: 'Разумно: премерен залог върху стабилно ядро. Ограничаването на спекулацията до 10–20% те пази, ако залогът се провали.' }, isBest: false },
            ],
            explanation: { en: 'For a beginner, an all-index approach is the highest-return-per-stress-unit option. Speculation is fine ONLY after the boring base is built.', bg: 'За начинаещ, индексен подход дава най-висока доходност на единица стрес. Спекулациите са ОК само след стабилната база.' },
          },
          {
            id: 'sb-choice-1', type: 'choice', xp: 15,
            question: { en: 'Why do most actively-managed funds underperform a plain index over 15+ years?', bg: 'Защо повечето активно-управлявани фондове губят от индекса за 15+ години?' },
            options: [
              { en: 'Active managers are not smart enough', bg: 'Мениджърите не са достатъчно умни' },
              { en: 'High fees + market is hard to beat consistently', bg: 'Високи такси + пазарът трудно се бие постоянно' },
              { en: 'Index funds cheat somehow', bg: 'Индексните фондове по някакъв начин мамят' },
              { en: 'Active funds invest only in bonds', bg: 'Активните фондове купуват само облигации' },
            ],
            correctIndex: 1,
            explanation: { en: '1–2%/yr fees compound brutally. Combined with the difficulty of consistently beating the market net of fees, ~85–90% of active funds lose to a passive index over 15 years.', bg: 'Таксите 1–2%/год се натрупват жестоко. Заедно с трудността пазарът да се бие нетно от такси, ~85–90% от активните фондове губят от пасивен индекс за 15 г.' },
          },
        ],
      },

      // ── Lesson 2: The Index Fund Strategy ──
      {
        id: 'index-funds',
        moduleId: 'investing',
        title: { en: 'The Index Fund Strategy', bg: 'Стратегията с индексни фондове' },
        description: { en: 'The simple investing strategy that beats 90% of professionals.', bg: 'Простата стратегия, която побеждава 90% от професионалистите.' },
        icon: '📊', xpReward: 130, order: 2,
        exercises: [
          {
            id: 'if-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🏆',
                title: { en: 'Why Index Funds Win', bg: 'Защо индексните фондове печелят' },
                body: { en: 'An index fund just buys ALL the stocks in a market index — no manager picking winners. Result: ~10% avg annual return at 0.03–0.10% fees (vs 1–2% for active funds).\n\nOn €100,000 over 30 years, a 1.5% fee gap costs ~€250,000 in lost wealth. Fees compound against you the same way returns compound for you.', bg: 'Индексен фонд просто купува ВСИЧКИ акции в индекс — без мениджър. Резултат: ~10% годишна доходност при такси 0.03–0.10% (срещу 1–2% за активни).\n\nПри €100,000 за 30 г., разлика 1.5% такси струва ~€250,000. Таксите се натрупват срещу теб като доходността за теб.' },
                highlight: { en: '"Don\'t look for the needle in the haystack. Just buy the haystack." — Jack Bogle', bg: '"Не търси иглата в купата сено. Купи купата." — Джак Богъл' },
              },
              {
                emoji: '💪',
                title: { en: 'Dollar-Cost Averaging', bg: 'Усредняване по време' },
                body: { en: 'Don\'t time the market. Invest a fixed amount EVERY month, no matter the price.\n\nMarket up? You buy fewer shares (expensive)\nMarket down? You buy MORE shares (on sale!)\n\nOver years, your purchase price averages out and emotion is removed from the process.', bg: 'Не познавай пазара. Инвестирай фиксирана сума ВСЕКИ месец.\n\nПазар нагоре? Купуваш по-малко акции (скъпо).\nПазар надолу? Купуваш повече (на разпродажба!)\n\nС годините цената ти се осреднява и емоцията се махат.' },
                highlight: { en: '📅 Time IN the market beats TIMING the market — every time.', bg: '📅 Времето НА пазара бие тайминга на пазара — винаги.' },
              },
            ],
          },
          {
            id: 'if-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'You invest €100,000 once. Fund A charges 0.05% expenses, Fund B charges 1.5%. Both return 8% gross/year for 30 years.', bg: 'Инвестираш €100,000 еднократно. Фонд A е с 0.05% такси, Фонд B — 1.5%. И двата дават 8% бруто/год за 30 г.' },
            question: { en: 'Roughly how much MORE will Fund A end with vs Fund B (in thousands €)?', bg: 'Колко ПОВЕЧЕ ще има Фонд A срещу Фонд B (хил. €)?' },
            fillNumberAnswer: 350, fillNumberTolerance: 60, fillNumberUnit: '',
            fillNumberHint: { en: 'Fund A net = 7.95%, Fund B net = 6.5%. Compute €100k at each rate over 30 yrs.', bg: 'Нетна A = 7.95%, B = 6.5%. Сметни €100k при всяка ставка за 30 г.' },
            explanation: { en: '€100k @ 7.95% × 30 yrs ≈ €984k. @ 6.5% × 30 yrs ≈ €661k. Fees stole ~€320k. This is why fees matter MORE than fund picking.', bg: '€100k @ 7.95% × 30 г. ≈ €984k. @ 6.5% × 30 г. ≈ €661k. Таксите откраднаха ~€320k. Затова таксите са по-важни от избора на фонд.' },
          },
          {
            id: 'if-chart-1', type: 'stock_chart', xp: 30,
            stockChart: {
              prices: [2700, 2785, 2834, 2945, 2752, 2941, 2980, 2926, 2976, 3037, 3140, 3230, 3225, 2954, 2584, 2912, 3044, 3100, 3271, 3500, 3363, 3270, 3621, 3756],
              labels: ['Jan19','Feb19','Mar19','Apr19','May19','Jun19','Jul19','Aug19','Sep19','Oct19','Nov19','Dec19','Jan20','Feb20','Mar20','Apr20','May20','Jun20','Jul20','Aug20','Sep20','Oct20','Nov20','Dec20'],
              scenario: { en: 'This is the S&P 500 from 2019–2020. Notice the COVID crash in March 2020 and the rapid recovery.', bg: 'Това е S&P 500 от 2019–2020. Виж COVID срива през март 2020 и бързото възстановяване.' },
              question: { en: 'In hindsight, when was the BEST time to put a lump-sum into the market?', bg: 'В ретроспекция — кога беше НАЙ-ДОБРИЯТ момент за еднократна инвестиция?' },
              mode: 'identify_point',
              correctPointIndex: 14,
              pointTolerance: 1,
              pointPrompt: { en: 'Click the lowest point on the chart — the COVID bottom.', bg: 'Кликни най-ниската точка — дъното на COVID срива.' },
            },
            explanation: { en: 'March 2020 (€2,584) was the bottom — but NOBODY knew at the time. That\'s why dollar-cost averaging beats timing: you can\'t pick the exact low, but if you keep buying through crashes you accumulate cheap shares automatically.', bg: 'Март 2020 (€2,584) беше дъното — но никой не знаеше тогава. Затова DCA бие тайминга: не можеш да хванеш дъното, но ако купуваш през срива, автоматично трупаш евтини акции.' },
          },
          {
            id: 'if-sim-1', type: 'compound_sim', xp: 25,
            compoundConfig: { defaultPrincipal: 0, defaultRate: 8, defaultYears: 30, defaultMonthly: 300 },
          },
          {
            id: 'if-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'ETF', bg: 'ETF' }, definition: { en: 'Exchange-traded fund — a basket of stocks you buy as one share', bg: 'Фонд на борса — кошница акции, купувана като една' } },
              { term: { en: 'Expense ratio', bg: 'Коеф. на разходите' }, definition: { en: 'Annual fee charged by the fund as % of assets', bg: 'Годишна такса на фонда като % от активите' } },
              { term: { en: 'DCA', bg: 'DCA' }, definition: { en: 'Dollar-cost averaging — investing a fixed amount on a schedule', bg: 'Осредняване по време — фиксирана сума по график' } },
              { term: { en: 'Diversification', bg: 'Диверсификация' }, definition: { en: 'Spreading money across many holdings to lower risk', bg: 'Разпределяне на парите в много активи за по-нисък риск' } },
              { term: { en: 'Total return', bg: 'Обща доходност' }, definition: { en: 'Price gains + dividends combined', bg: 'Печалба от цена + дивиденти заедно' } },
            ],
          },
          {
            id: 'if-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Most professional fund managers beat the S&P 500 over a 15-year period.', bg: 'Повечето професионални мениджъри побеждават S&P 500 за 15 г.' },
            isTrue: false,
            explanation: { en: 'FALSE. SPIVA studies show ~85–90% of large-cap active funds underperform the S&P 500 over 15 years AFTER fees. The few who win can\'t be predicted in advance.', bg: 'НЕВЯРНО. SPIVA проучвания: ~85–90% от активните фондове губят от S&P 500 за 15 г. след такси. Печелившите не могат да се предскажат.' },
          },
          {
            id: 'if-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '😰',
            decisionScenario: { en: 'March 2020. COVID crashes the market -34% in 3 weeks. Your €20,000 portfolio is now €13,200. Headlines: "WORST CRASH SINCE 2008."', bg: 'Март 2020. COVID сваля пазара с -34% за 3 седмици. Портфейлът ти от €20,000 е вече €13,200. Заглавията: "НАЙ-ЛОШИЯТ СРИВ ОТ 2008."' },
            decisionChoices: [
              { label: { en: 'Sell everything to "stop the bleeding"', bg: 'Продай всичко да "спреш кръвта"' }, emoji: '🚨', outcome: { en: 'You lock in -€6,800 loss. By Aug 2020 the index recovered 100%. You missed it. Panic selling at the bottom is the #1 retail-investor mistake.', bg: 'Закотвяш -€6,800 загуба. До авг 2020 индексът се възстанови 100%. Пропусна го. Паническа продажба = грешка №1.' }, isBest: false },
              { label: { en: 'Hold and keep the €300/month auto-buy', bg: 'Дръж и продължи €300/месец' }, emoji: '💪', outcome: { en: 'You buy at -34% discount for 3 months. By year-end portfolio is €21,500 — above pre-crash. DCA + discipline = wealth.', bg: 'Купуваш с -34% отстъпка 3 месеца. До края на годината — €21,500, над предсрив. DCA + дисциплина = богатство.' }, isBest: true },
              { label: { en: 'Add €3,000 extra into the dip', bg: 'Добави €3,000 допълнително в спада' }, emoji: '🛍️', outcome: { en: 'Aggressive but it worked: +€8,000 by year-end on the extra buy alone. Only do this with money you don\'t need for 5+ years.', bg: 'Агресивно, но проработи: +€8,000 до края на годината от добавката. Само с пари, които не са ти нужни 5+ години.' }, isBest: false },
            ],
            explanation: { en: 'The "boring" hold-and-keep-buying answer is statistically the best for beginners. It guarantees you don\'t panic-sell AND you DCA into the discount automatically.', bg: 'Скучният "дръж и продължи" е статистически най-добър за начинаещи. Гарантира, че не продаваш паник И че усредняваш в отстъпката автоматично.' },
          },
        ],
      },

      // ── Lesson 3: Build Your First Portfolio ──
      {
        id: 'portfolio-building',
        moduleId: 'investing',
        title: { en: 'Build Your First Portfolio', bg: 'Изгради първия си портфейл' },
        description: { en: 'Allocate across asset classes and stay diversified.', bg: 'Разпределяй между класове активи и остани диверсифициран.' },
        icon: '🎯', xpReward: 140, order: 3,
        exercises: [
          {
            id: 'pb-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🗺️',
                title: { en: 'The Investment Pyramid', bg: 'Инвестиционната пирамида' },
                body: { en: 'Build in order — don\'t skip layers:\n\n🏔️ 1. Emergency fund (3–6 months)\n💎 2. Pay off any debt > 7%\n📈 3. Tax-advantaged accounts (pension, ISA)\n🚀 4. Index funds & broad ETFs\n⚡ 5. Speculation (single stocks, crypto) — under 10%\n\nMost people skip to layer 5 and wonder why they\'re not wealthy.', bg: 'Изграждай по ред:\n\n🏔️ 1. Авариен фонд (3–6 м.)\n💎 2. Изплати дълг >7%\n📈 3. Данъчно облекчени сметки\n🚀 4. Индексни фондове и ETF\n⚡ 5. Спекулации (единични акции, крипто) — под 10%\n\nПовечето хора скачат на 5 и се чудят защо не са богати.' },
                highlight: { en: '🎯 You can start investing with as little as €10/month via fractional ETF shares.', bg: '🎯 Можеш да стартираш с €10/месец чрез частични ETF.' },
              },
              {
                emoji: '🔄',
                title: { en: 'Rebalancing: Stay on Target', bg: 'Ребалансиране: дръж целта' },
                body: { en: 'Targets drift after market moves:\n\nStart: 80% stocks / 20% bonds\nAfter a bull year: 90% / 10% (too risky)\n\nRebalance = sell what\'s grown over-target, buy what\'s under-target. Do it ONCE a year — more often = unnecessary fees + tax events.', bg: 'След пазара целите се отместват:\n\nНачало: 80% акции / 20% облигации\nСлед бичи година: 90% / 10% (твърде рисково)\n\nРебалансирай = продай надхвърлилото, купи изоставащото. ВЕДНЪЖ годишно — по-често = такси + данъци.' },
                highlight: { en: '📅 Calendar a yearly date: "Rebalance" — December 31 works.', bg: '📅 Постави дата: "Ребалансиране" — 31 декември работи.' },
              },
            ],
          },
          {
            id: 'pb-pie-1', type: 'portfolio_pie', xp: 30,
            portfolioPie: {
              scenario: { en: 'You\'re 30 with a 35-year horizon, stable income, and an emergency fund already built. Allocate this portfolio:', bg: 'На 30 си, 35-годишен хоризонт, стабилен доход, авариен фонд готов. Разпредели портфейла:' },
              question: { en: 'Build a balanced long-term allocation (target sums to 100%)', bg: 'Изгради балансирано дългосрочно разпределение (общо 100%)' },
              assets: [
                { label: { en: 'Domestic stock index', bg: 'Местен фондов индекс' }, emoji: '📊', color: 'hsl(var(--c-primary))', ideal: 50 },
                { label: { en: 'International stocks', bg: 'Международни акции' }, emoji: '🌍', color: 'hsl(var(--c-purple))', ideal: 25 },
                { label: { en: 'Bonds', bg: 'Облигации' }, emoji: '📜', color: 'hsl(var(--c-green))', ideal: 20 },
                { label: { en: 'Cash / money market', bg: 'Кеш / парично-пазарен' }, emoji: '💵', color: 'hsl(var(--c-orange))', ideal: 5 },
              ],
              tolerance: 10,
            },
            explanation: { en: 'A "75/20/5" stocks/bonds/cash split is a textbook 30-something allocation. International diversification (~25% of equities) reduces home-country risk without sacrificing returns.', bg: 'Стандартно разпределение за 30-годишен: 75/20/5 акции/облигации/кеш. Международната диверсификация (~25% от акциите) намалява локалния риск без да жертва доходността.' },
          },
          {
            id: 'pb-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '📉',
            decisionScenario: { en: 'You\'re 30. Market drops -40% in 6 months. Your retirement portfolio: €60,000 → €36,000. The news is screaming recession.', bg: 'На 30 си. Пазарът пада -40% за 6 м. Пенсионният портфейл: €60,000 → €36,000. Новините крещят за рецесия.' },
            decisionChoices: [
              { label: { en: 'Move everything to cash until things calm down', bg: 'Премести всичко в кеш до успокояване' }, emoji: '🏦', outcome: { en: 'You miss the 60% recovery that follows. Trying to "get back in" feels impossible because you\'re waiting for the next dip — which often doesn\'t come for years.', bg: 'Пропускаш 60% възстановяване. Влизането обратно изглежда невъзможно, защото чакаш следващ спад — който не идва години.' }, isBest: false },
              { label: { en: 'Hold + continue €400/mo + rebalance to target', bg: 'Дръж + продължи €400/мес + ребалансирай' }, emoji: '🎯', outcome: { en: 'You DCA into the discount. Rebalancing forces you to "buy low" automatically (sell over-allocated bonds, buy under-allocated stocks). Recovery wealth outpaces those who panic-sold.', bg: 'DCA в отстъпката. Ребалансирането автоматично "купува ниско". Възстановяването дава повече от паническите продавачи.' }, isBest: true },
              { label: { en: 'Switch to 100% stocks — they\'re cheap!', bg: 'Премини към 100% акции — евтини са!' }, emoji: '🚀', outcome: { en: 'Aggressive. If recovery is fast you win big; if recession deepens you lose your bond ballast right when you need it. Don\'t abandon allocation discipline based on one moment.', bg: 'Агресивно. При бързо възстановяване — печалба; при дълга рецесия губиш баласта точно когато ти трябва. Не зарязвай дисциплина заради един момент.' }, isBest: false },
            ],
            explanation: { en: 'Hold + DCA + rebalance is the boring statistical winner. It removes emotion AND captures the recovery automatically.', bg: 'Дръж + DCA + ребалансирай е скучният статистически победител. Маха емоцията И хваща възстановяването.' },
          },
          {
            id: 'pb-order-1', type: 'order_items', xp: 25,
            orderInstruction: { en: 'Order the investment pyramid layers from FIRST to LAST priority:', bg: 'Подреди слоевете на пирамидата от ПЪРВИ към ПОСЛЕДЕН приоритет:' },
            orderItems: [
              { label: { en: 'Emergency fund (3–6 months)', bg: 'Авариен фонд (3–6 м.)' }, emoji: '🛡️' },
              { label: { en: 'Pay off >7% APR debt', bg: 'Изплати дълг >7%' }, emoji: '💳' },
              { label: { en: 'Pension / tax-advantaged accounts', bg: 'Пенсия / данъчни сметки' }, emoji: '🏦' },
              { label: { en: 'Index funds & ETFs', bg: 'Индексни фондове & ETF' }, emoji: '📈' },
              { label: { en: 'Single stocks / crypto (<10%)', bg: 'Единични акции / крипто (<10%)' }, emoji: '⚡' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Skipping the base = building on sand. High-interest debt at 22% destroys any 8% portfolio return. Tax accounts give a guaranteed 25–40% boost via tax savings.', bg: 'Прескачането на базата = строеж на пясък. Дълг при 22% яде 8% доходност. Данъчните сметки дават 25–40% бонус.' },
          },
          {
            id: 'pb-chart-1', type: 'stock_chart', xp: 25,
            stockChart: {
              prices: [100, 142, 88, 175, 65, 210, 95, 240, 130, 280, 150, 320, 105, 380, 155, 410, 165, 480, 195, 540, 240, 600, 260, 620],
              labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20','M21','M22','M23','M24'],
              scenario: { en: 'This 24-month chart has +500% gains, but with 30–60% drawdowns repeatedly.', bg: '24-месечна графика с +500% печалба, но с 30–60% спадове често.' },
              question: { en: 'Which holding most likely produced this volatility profile?', bg: 'Кой актив най-вероятно е дал тази волатилност?' },
              mode: 'identify_pattern',
              patternOptions: [
                { en: 'A diversified S&P 500 ETF', bg: 'Диверсифициран S&P 500 ETF' },
                { en: 'A government bond ETF', bg: 'ETF държавни облигации' },
                { en: 'A single tech / crypto position', bg: 'Единична технологична / крипто позиция' },
                { en: 'A 60/40 stock/bond portfolio', bg: 'Портфейл 60/40 акции/облигации' },
              ],
              correctPatternIndex: 2,
            },
            explanation: { en: 'Wild +/-50% swings in months are signature of single stocks or crypto. A diversified portfolio rarely moves more than 5–10% in a normal month — that\'s the whole point of diversification.', bg: 'Луди ±50% колебания на месец са типични за единични акции / крипто. Диверсифициран портфейл рядко мърда повече от 5–10% месечно — това е смисълът на диверсификация.' },
          },
          {
            id: 'pb-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Asset allocation', bg: 'Разпределение на активите' }, definition: { en: 'The mix of stocks, bonds, and cash in your portfolio', bg: 'Микс от акции, облигации, кеш в портфейла' } },
              { term: { en: 'Rebalancing', bg: 'Ребалансиране' }, definition: { en: 'Returning your portfolio to target % allocations', bg: 'Връщане на портфейла към целевите проценти' } },
              { term: { en: 'Risk tolerance', bg: 'Толерантност към риск' }, definition: { en: 'How much volatility you can handle without panicking', bg: 'Колко волатилност понасяш без паника' } },
              { term: { en: 'Time horizon', bg: 'Времеви хоризонт' }, definition: { en: 'How many years until you need the money', bg: 'След колко години ще ти трябват парите' } },
              { term: { en: 'Tax-advantaged account', bg: 'Данъчно облекчена сметка' }, definition: { en: 'Pension/ISA-style accounts that defer or eliminate tax', bg: 'Пенсия/ИСА сметки, които отлагат или елиминират данък' } },
            ],
          },
          {
            id: 'pb-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Rebalancing your portfolio every month is better than once a year.', bg: 'Ребалансиране всеки месец е по-добро от веднъж годишно.' },
            isTrue: false,
            explanation: { en: 'FALSE. Monthly rebalancing triggers more transaction costs and tax events with little extra benefit. Most studies show annual or threshold-based rebalancing (5%+ drift) is optimal.', bg: 'НЕВЯРНО. Месечно ребалансиране носи такси и данъци без голяма полза. Годишно или прагово (5%+ отклонение) е оптимално.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 4 — CREDIT & DEBT
  // Signature interactive: debt_payoff (snowball vs avalanche simulator)
  // ─────────────────────────────────────────────
  {
    id: 'credit-debt',
    title: { en: 'Credit & Debt Mastery', bg: 'Майсторство в кредити и дълг' },
    description: { en: 'Master credit scores, escape the debt trap, and use leverage wisely.', bg: 'Овладей кредитните рейтинги, избягай от капана на дълга и използвай ливъридж мъдро.' },
    icon: '🏦', color: 'orange', order: 4,
    lessons: [
      // ── Lesson 1: Your Credit Score Decoded ──
      {
        id: 'credit-scores',
        moduleId: 'credit-debt',
        title: { en: 'Your Credit Score Decoded', bg: 'Кредитният ти рейтинг декодиран' },
        description: { en: 'What it is, what impacts it, and how to improve it.', bg: 'Какво е, какво влияе и как да го подобриш.' },
        icon: '⭐', xpReward: 120, order: 1,
        exercises: [
          {
            id: 'cs2-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🔢',
                title: { en: 'What is a Credit Score?', bg: 'Какво е кредитен рейтинг?' },
                body: { en: 'A credit score (300–850) predicts how likely you are to repay debt.\n\n300–579 Poor 😞 | 580–669 Fair | 670–739 Good ✅ | 740–799 Very Good 🌟 | 800–850 Exceptional 💎\n\nLenders set your interest rate by score. On a €200,000 mortgage, a 750 vs 600 score = ~€80,000 difference in lifetime interest. Your score is real money.', bg: 'Кредитен рейтинг (300–850) — колко вероятно е да върнеш дълг.\n\n300–579 Лош | 580–669 Задоволителен | 670–739 Добър | 740–799 Много добър | 800–850 Изключителен\n\nКредиторите определят лихвата по рейтинг. При ипотека €200,000, 750 срещу 600 = ~€80,000 разлика в обща лихва.' },
                highlight: { en: '📊 Five factors: Payment history (35%) → Utilization (30%) → Length (15%) → Mix (10%) → New credit (10%)', bg: '📊 Пет фактора: История на плащанията (35%) → Усвояване (30%) → Дължина (15%) → Микс (10%) → Нов кредит (10%)' },
              },
              {
                emoji: '🛠️',
                title: { en: 'How to Build It Fast', bg: 'Как да го построиш бързо' },
                body: { en: '1️⃣ Always pay on time (autopay the minimum, always)\n2️⃣ Keep utilization under 30% — ideally under 10%\n3️⃣ Don\'t close old cards (length matters)\n4️⃣ Don\'t apply for many cards at once (hard inquiries)\n5️⃣ Mix types: revolving (cards) + installment (loans)\n\nGood behavior pays off in 6–12 months. Damage stays on file for ~7 years.', bg: '1️⃣ Винаги плащай навреме (автоплащане поне минимума)\n2️⃣ Усвояване под 30% — идеално под 10%\n3️⃣ Не затваряй стари карти (дължината е важна)\n4️⃣ Не кандидатствай за много карти наведнъж\n5️⃣ Микс типове: револвиращ (карти) + разсрочен (заеми)\n\nДоброто поведение се изплаща за 6–12 месеца. Щетите остават ~7 години.' },
                highlight: { en: '💡 One missed payment can drop your score 100 points. Autopay the minimum on every card.', bg: '💡 Едно пропуснато плащане сваля рейтинга със 100 точки. Автоплащане на минимума навсякъде.' },
              },
            ],
          },
          {
            id: 'cs2-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Credit utilization', bg: 'Кредитно усвояване' }, definition: { en: 'Balance ÷ credit limit, as a percentage', bg: 'Баланс ÷ кредитен лимит, в проценти' } },
              { term: { en: 'Hard inquiry', bg: 'Твърда проверка' }, definition: { en: 'Lender pulls your credit; small temporary score hit', bg: 'Кредитор тегли отчета; малък временен спад' } },
              { term: { en: 'APR', bg: 'ГПР' }, definition: { en: 'Annual percentage rate — yearly cost of borrowing', bg: 'Годишен лихвен процент — годишна цена на заема' } },
              { term: { en: 'Revolving credit', bg: 'Револвиращ кредит' }, definition: { en: 'Open-ended credit you reuse (credit cards)', bg: 'Кредит без край, многократен (кредитни карти)' } },
              { term: { en: 'Installment loan', bg: 'Разсрочен заем' }, definition: { en: 'Fixed amount, fixed payments over a set term', bg: 'Фиксирана сума, фиксирани плащания за период' } },
            ],
          },
          {
            id: 'cs2-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'Your only credit card has a €5,000 limit. The current balance is €1,500.', bg: 'Единствената ти карта е с лимит €5,000. Текущ баланс: €1,500.' },
            question: { en: 'What is your credit utilization, in %?', bg: 'Какво е кредитното ти усвояване, в %?' },
            fillNumberAnswer: 30, fillNumberTolerance: 1, fillNumberUnit: '',
            fillNumberHint: { en: 'Utilization = balance ÷ limit × 100', bg: 'Усвояване = баланс ÷ лимит × 100' },
            explanation: { en: '€1,500 ÷ €5,000 = 30%. That\'s right at the threshold where utilization starts hurting your score. Aim for under 10% for the strongest impact.', bg: '€1,500 ÷ €5,000 = 30%. Точно на прага, където усвояването започва да вреди. Стреми се към <10% за максимален ефект.' },
          },
          {
            id: 'cs2-order-1', type: 'order_items', xp: 25,
            orderInstruction: { en: 'Order the FICO credit-score factors from MOST to LEAST important:', bg: 'Подреди FICO факторите от НАЙ-ВАЖЕН към НАЙ-МАЛОВАЖЕН:' },
            orderItems: [
              { label: { en: 'Payment history (on-time?)', bg: 'История на плащанията (навреме?)' }, emoji: '✅' },
              { label: { en: 'Credit utilization (% of limit used)', bg: 'Усвояване (% от лимита)' }, emoji: '📊' },
              { label: { en: 'Length of credit history', bg: 'Дължина на кредитната история' }, emoji: '📅' },
              { label: { en: 'Credit mix (cards + loans)', bg: 'Микс (карти + заеми)' }, emoji: '🎚️' },
              { label: { en: 'New credit (recent applications)', bg: 'Нов кредит (скорошни заявки)' }, emoji: '🆕' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Payment history (35%) and utilization (30%) drive 65% of your score. The other three factors split the remaining 35%. Focus where it matters: never miss a payment, keep balances low.', bg: 'История (35%) и усвояване (30%) дават 65% от рейтинга. Останалите три фактора делят 35%. Фокусирай: никога не пропускай плащане, дръж балансите ниски.' },
          },
          {
            id: 'cs2-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Closing an old credit card you no longer use will help your credit score.', bg: 'Затварянето на стара неизползвана кредитна карта ще помогне на рейтинга ти.' },
            isTrue: false,
            explanation: { en: 'FALSE. Closing it (a) shortens your credit history average and (b) drops your total available limit, which raises your utilization ratio. Both hurt your score. Leave old cards open with a small recurring charge + autopay.', bg: 'НЕВЯРНО. Затварянето (а) скъсява средната дължина на историята и (б) сваля общия лимит, което вдига усвояването. И двете вредят. Остави старите отворени с малка повтаряща се сметка + автоплащане.' },
          },
          {
            id: 'cs2-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '💳',
            decisionScenario: { en: 'You\'re offered a new card with €5,000 limit and 0% APR for 12 months. You have €2,000 in savings, no credit history, and a planned €3,000 laptop purchase for work next month.', bg: 'Предлагат ти нова карта с лимит €5,000 и 0% ГПР за 12 месеца. Имаш €2,000 спестявания, няма кредитна история и планираш €3,000 лаптоп за работа догодина.' },
            decisionChoices: [
              { label: { en: 'Accept, charge the €3,000 laptop, pay €250/mo across the 0% period', bg: 'Приеми, сложи лаптопа за €3,000, плащай €250/мес в 0% периода' }, emoji: '✅', outcome: { en: 'Great use of the offer. The laptop is fully paid before interest hits, you build payment history, and your average utilization is ~40% (acceptable). Score grows fast.', bg: 'Чудесно използване. Лаптопът е изплатен преди лихвата, изграждаш история на плащанията, средно усвояване ~40% (приемливо). Рейтингът расте.' }, isBest: true },
              { label: { en: 'Accept, max out the card on lifestyle upgrades', bg: 'Приеми, изчерпи го за лукс' }, emoji: '🛍️', outcome: { en: '90% utilization tanks your score AND you can\'t pay it off in 12 months. When 0% expires, ~24% APR hits the WHOLE balance retroactively in many promotional terms. You owe €5,000+ at high interest.', bg: '90% усвояване сваля рейтинга И не можеш да платиш за 12 м. Когато 0% изтече, ~24% ГПР удря ЦЕЛИЯ баланс ретроактивно при много промоции. Дължиш €5,000+ при висока лихва.' }, isBest: false },
              { label: { en: 'Decline — credit cards are dangerous', bg: 'Откажи — кредитните карти са опасни' }, emoji: '❌', outcome: { en: 'Safe but costly long-term. Without credit history, future mortgage and car-loan rates are 2–4% higher. Over a lifetime that\'s tens of thousands of euros lost.', bg: 'Сигурно, но скъпо дългосрочно. Без история, бъдещите ипотеки и заеми за коли са с 2–4% по-високи. За живот това са десетки хиляди евро.' }, isBest: false },
            ],
            explanation: { en: 'Used responsibly, a low-utilization card with autopay is the FASTEST path to a 700+ score. Avoid maxing out, never carry a balance into the post-promo APR.', bg: 'Използвана правилно, карта с ниско усвояване и автоплащане е НАЙ-БЪРЗИЯТ път до 700+. Не я изчерпвай, не носи баланс след промо периода.' },
          },
          {
            id: 'cs2-choice-1', type: 'choice', xp: 15,
            question: { en: 'Your credit card limit is €8,000. For the best score, keep your balance below:', bg: 'Лимитът ти е €8,000. За най-добър рейтинг, дръж баланса под:' },
            options: [
              { en: '€7,200 (90%)', bg: '€7,200 (90%)' },
              { en: '€4,000 (50%)', bg: '€4,000 (50%)' },
              { en: '€2,400 (30%)', bg: '€2,400 (30%)' },
              { en: '€800 (10%)', bg: '€800 (10%)' },
            ],
            correctIndex: 3,
            explanation: { en: 'Under 10% utilization = strongest score impact. Under 30% is acceptable. Above 30% starts hurting. €800 on an €8,000 limit is the optimal target.', bg: 'Под 10% = най-силен ефект. Под 30% — приемливо. Над 30% — вреди. €800 при €8,000 лимит е оптимално.' },
          },
        ],
      },

      // ── Lesson 2: Destroy Your Debt ──
      {
        id: 'debt-destroy',
        moduleId: 'credit-debt',
        title: { en: 'Destroy Your Debt', bg: 'Унищожи дълга си' },
        description: { en: 'Run snowball, avalanche, and even simulations on real debts.', bg: 'Симулирай снежна топка, лавина и равно върху реални дългове.' },
        icon: '⚔️', xpReward: 140, order: 2,
        exercises: [
          {
            id: 'dd2-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '⚔️',
                title: { en: 'Avalanche vs Snowball', bg: 'Лавина срещу снежна топка' },
                body: { en: '❄️ AVALANCHE — pay highest APR first.\n→ Mathematically optimal. Saves the most interest.\n→ Best if you\'re motivated by spreadsheets.\n\n⛄ SNOWBALL — pay smallest balance first.\n→ Quick wins build momentum and discipline.\n→ Best if you\'ve fallen off plans before.\n\nBoth crush "even spread" — the worst common strategy. Pick the one you\'ll actually finish.', bg: '❄️ ЛАВИНА — изплащай най-висок ГПР първо.\n→ Математически оптимално. Спестява най-много лихва.\n→ Подхожда на дисциплинирани.\n\n⛄ СНЕЖНА ТОПКА — най-малък баланс първо.\n→ Бързи победи дават импулс.\n→ Подхожда, ако си се отказвал преди.\n\nИ двете бият "по равно" — най-лошата честа стратегия.' },
                highlight: { en: '🎯 The best debt strategy is the one you\'ll actually stick with for 24+ months.', bg: '🎯 Най-добрата стратегия е тази, с която наистина ще издържиш 24+ месеца.' },
              },
              {
                emoji: '🚀',
                title: { en: 'The Payoff Booster', bg: 'Усилвател на изплащането' },
                body: { en: 'When a debt is paid off, ROLL its full payment into the next debt — don\'t spend it.\n\nDebt 1: €200/mo → killed.\nDebt 2 was €150/mo → now you pay €350/mo.\nDebt 3 was €100/mo → now you pay €450/mo.\n\nYour payments accelerate every kill. This is why disciplined payoff finishes in 1/3 the time of minimums-only.', bg: 'Когато един дълг е изплатен, ПРЕХВЪРЛИ цялата вноска към следващия — не я харчи.\n\nДълг 1: €200/мес → убит.\nДълг 2 беше €150/мес → сега €350/мес.\nДълг 3 беше €100/мес → сега €450/мес.\n\nВноските ускоряват всяка победа. Затова дисциплиниран финал е 1/3 от времето на само минимуми.' },
                highlight: { en: '🔥 Every paid-off debt makes the next one die faster. Momentum compounds.', bg: '🔥 Всеки изплатен дълг убива следващия по-бързо. Импулсът се натрупва.' },
              },
            ],
          },
          {
            id: 'dd2-payoff-1', type: 'debt_payoff', xp: 35,
            debtPayoff: {
              scenario: { en: 'You\'re sitting on 4 debts and have €300/month extra to throw at them. Pick the strategy that pays off fastest with the LEAST total interest.', bg: 'Имаш 4 дълга и €300/месец допълнително. Избери стратегията с НАЙ-МАЛКА обща лихва.' },
              question: { en: 'Which payoff strategy is mathematically optimal here?', bg: 'Коя стратегия е математически оптимална тук?' },
              debts: [
                { label: { en: 'Credit card', bg: 'Кредитна карта' }, emoji: '💳', balance: 4000, apr: 22, minPayment: 100 },
                { label: { en: 'Personal loan', bg: 'Личен заем' }, emoji: '📋', balance: 2500, apr: 12, minPayment: 80 },
                { label: { en: 'Car loan', bg: 'Заем за кола' }, emoji: '🚗', balance: 8000, apr: 7, minPayment: 200 },
                { label: { en: 'Student loan', bg: 'Студентски заем' }, emoji: '🎓', balance: 15000, apr: 5, minPayment: 150 },
              ],
              extraPayment: 300,
              correctStrategy: 'avalanche',
            },
            explanation: { en: 'Avalanche wins because the credit card at 22% costs 4× more interest per euro than the student loan at 5%. Killing the highest-APR debt first saves the most money. Snowball would feel good (€2,500 personal loan dies first) but costs more in interest.', bg: 'Лавина печели: кредитната карта при 22% струва 4× повече лихва на евро от студентския заем при 5%. Атаката на най-високия ГПР спестява най-много. Снежна топка би била по-приятна, но струва повече.' },
          },
          {
            id: 'dd2-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Making only minimum payments on a credit card always pays off the debt within 5 years.', bg: 'Само минимални плащания по кредитна карта винаги изплащат дълга за 5 години.' },
            isTrue: false,
            explanation: { en: 'FALSE. Many minimums are calibrated to 1–2% of balance + interest, which can stretch repayment to 15–25 years. €5,000 at 22% with minimum payments = ~17 years and €6,000+ in interest paid.', bg: 'НЕВЯРНО. Минимумите често са 1–2% от баланса + лихва, което разтяга изплащането до 15–25 години. €5,000 при 22% с минимални = ~17 г. и €6,000+ платена лихва.' },
          },
          {
            id: 'dd2-fill-num-1', type: 'fill_number', xp: 20,
            fillNumberScenario: { en: 'A €3,000 credit-card balance accrues 20% annual interest. You make ZERO payments for one year.', bg: 'Баланс €3,000 при 20% годишна лихва. НУЛА плащания за година.' },
            question: { en: 'What\'s the new balance after 1 year?', bg: 'Какъв е балансът след 1 година?' },
            fillNumberAnswer: 3600, fillNumberTolerance: 30, fillNumberUnit: '€',
            fillNumberHint: { en: '€3,000 × 1.20 = ?', bg: '€3,000 × 1.20 = ?' },
            explanation: { en: '€3,000 × 1.20 = €3,600. €600 of new debt created from nothing. With actual monthly compounding it\'s slightly higher (~€3,657). High-APR debt is the most expensive thing you can own.', bg: '€3,000 × 1.20 = €3,600. €600 нов дълг от нищото. С месечна капитализация — малко повече (~€3,657). Дълг с висок ГПР е най-скъпото нещо, което можеш да притежаваш.' },
          },
          {
            id: 'dd2-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Avalanche method', bg: 'Лавина' }, definition: { en: 'Pay highest APR first — saves most interest', bg: 'Първо най-висок ГПР — спестява най-много' } },
              { term: { en: 'Snowball method', bg: 'Снежна топка' }, definition: { en: 'Pay smallest balance first — fast quick wins', bg: 'Първо най-малък баланс — бързи победи' } },
              { term: { en: 'Minimum payment', bg: 'Минимално плащане' }, definition: { en: 'Smallest required monthly payment to stay current', bg: 'Минималната месечна вноска да не закъснееш' } },
              { term: { en: 'Debt consolidation', bg: 'Консолидация на дълг' }, definition: { en: 'Combine multiple debts into one with lower APR', bg: 'Обединение на няколко дълга в един с по-нисък ГПР' } },
              { term: { en: 'Compounding interest', bg: 'Сложна лихва' }, definition: { en: 'Interest charged on previous unpaid interest', bg: 'Лихва върху предишната неплатена лихва' } },
            ],
          },
          {
            id: 'dd2-rpg-1', type: 'rpg_scenario', xp: 25,
            scenario: { en: 'Tax refund: €2,000! You have a credit card at 22% (€3,500 balance) AND no investments yet. Friend says "invest in S&P 500." Which is the smarter move?', bg: 'Връщане на данъци: €2,000! Имаш карта при 22% (€3,500 баланс) И още няма инвестиции. Приятел: "инвестирай в S&P 500." Кое е по-умно?' },
            avatar: '💰',
            choices: [
              { label: { en: 'Pay €2,000 to the credit card', bg: 'Плати €2,000 по картата' }, emoji: '⚔️', consequence: { en: 'You guarantee a 22% return — risk-free, tax-free, instant. The remaining €1,500 balance dies faster too. Index funds average ~7% net of inflation; nothing beats killing 22% APR debt.', bg: 'Гарантирана 22% доходност — без риск, без данък, мигновено. Остатъкът €1,500 умира по-бързо. Индексните фондове дават ~7% реално; нищо не бие убиването на 22% дълг.' }, cashFlowChange: 770, isGood: true },
              { label: { en: 'Invest the €2,000 in an index fund', bg: 'Инвестирай €2,000 в индексен фонд' }, emoji: '📈', consequence: { en: 'You earn ~€140 in expected returns BUT you pay €440 in card interest in the same year. Net = -€300. Investing while carrying high-APR debt is a guaranteed loss.', bg: 'Печелиш ~€140 очаквана доходност НО плащаш €440 лихва по картата за същата година. Чисто = -€300. Инвестиране със дълг с висок ГПР е сигурна загуба.' }, cashFlowChange: -300, isGood: false },
              { label: { en: 'Split: €1,000 each', bg: 'Раздели: по €1,000' }, emoji: '⚖️', consequence: { en: 'Half-measure. You still pay full interest on the remaining €2,500 at 22%. Better than 100% invest, worse than 100% debt-kill. Hybrid sounds balanced but math punishes it.', bg: 'Половинчато. Все още плащаш пълна лихва на оставащите €2,500 при 22%. По-добре от 100% инвестиция, по-лошо от 100% дълг. Математиката не обича хибриди.' }, cashFlowChange: 200, isGood: false },
            ],
          },
          {
            id: 'dd2-decision-1', type: 'scenario_decision', xp: 25,
            decisionAvatar: '🏦',
            decisionScenario: { en: 'You have 3 cards: €3k @ 22%, €1.5k @ 18%, €4k @ 15%. A bank offers a debt-consolidation loan: ALL €8.5k combined into one at 9% APR over 3 years.', bg: 'Имаш 3 карти: €3к @ 22%, €1.5к @ 18%, €4к @ 15%. Банка предлага консолидиран заем: ВСИЧКИТЕ €8.5к при 9% ГПР за 3 години.' },
            decisionChoices: [
              { label: { en: 'Accept consolidation, cut up the cards', bg: 'Приеми консолидацията, разрежи картите' }, emoji: '✂️', outcome: { en: 'Strong move. Single fixed payment, lower rate, defined end date. Cutting the cards prevents you from re-running balances. Only fails if you re-borrow on the cards.', bg: 'Силен ход. Единствено фиксирано плащане, по-нисък %, ясна крайна дата. Рязането на картите пречи да трупаш нов баланс.' }, isBest: true },
              { label: { en: 'Accept consolidation, keep cards "for emergencies"', bg: 'Приеми, но запази картите "за всеки случай"' }, emoji: '🤔', outcome: { en: '60% of consolidation users re-run balances within 2 years and end up worse. The cards are the trap. Either cut them or freeze them in actual ice.', bg: '60% от консолидиращите трупат нов дълг за 2 г. и завършват по-зле. Картите са капана. Или ги режи, или ги замрази в лед.' }, isBest: false },
              { label: { en: 'Skip the loan, run avalanche on cards instead', bg: 'Пропусни заема, направи лавина на картите' }, emoji: '⚔️', outcome: { en: 'Works if you can match the same monthly payment. But the average APR on the cards is ~17.5% — you\'ll pay ~€1,200 more interest than the 9% loan over 3 years.', bg: 'Работи, ако можеш със същата вноска. Но средният ГПР на картите е ~17.5% — ще платиш ~€1,200 повече за 3 г. от заема при 9%.' }, isBest: false },
            ],
            explanation: { en: 'Consolidation works ONLY if you simultaneously kill access to the original credit. The math wins; behavior decides if you keep the win.', bg: 'Консолидацията работи САМО ако едновременно затвориш достъпа до старите карти. Математиката печели; поведението решава дали ще задържиш победата.' },
          },
        ],
      },
    ],
  },



  // ─────────────────────────────────────────────
  // PRO MODULE 1 — ADVANCED INVESTING
  // Signature interactives: portfolio_pie + stock_chart for advanced concepts
  // ─────────────────────────────────────────────
  {
    id: 'advanced-investing',
    title: { en: 'Advanced Investing', bg: 'Напреднало инвестиране' },
    description: { en: 'ETFs, portfolio strategies and real investment decisions — learn by playing.', bg: 'ETF-и, портфолио стратегии и реални инвестиционни решения — учи чрез игра.' },
    icon: '📈', color: 'blue', order: 10, proOnly: true,
    lessons: [
      // ── Lesson 1: ETF Mastery ──
      {
        id: 'etf-mastery',
        moduleId: 'advanced-investing',
        title: { en: 'ETF Mastery & Portfolio Design', bg: 'Майсторство в ETF и дизайн на портфейл' },
        description: { en: 'Build an advanced 4-asset portfolio and quantify the cost of fees.', bg: 'Изгради напреднал портфейл от 4 актива и изчисли цената на таксите.' },
        icon: '🌐', xpReward: 160, order: 1,
        exercises: [
          {
            id: 'etf-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🌐',
                title: { en: 'The Boring Millionaire Recipe', bg: 'Рецептата на скучния милионер' },
                body: { en: 'The most boring strategy in the world has also made the most millionaires.\n\n1. Buy a total-market ETF (VTI / MSCI World)\n2. Auto-add money every month\n3. Do absolutely nothing else\n4. Wait 20–30 years\n\n€300/mo at 8% for 30 years = €408,000. You contributed €108,000. The other €300,000 is pure compounding.', bg: 'Най-скучната стратегия е направила най-много милионери.\n\n1. Купи total-market ETF (VTI / MSCI World)\n2. Авто-добавяй пари всеки месец\n3. Нищо повече\n4. Чакай 20–30 г.\n\n€300/мес при 8% за 30 г. = €408,000. Ти внасяш €108,000. Останалите €300,000 са капитализация.' },
                highlight: { en: '📊 95% of active traders underperform the index. Boring wins.', bg: '📊 95% от активните търговци губят от индекса. Скучното печели.' },
              },
              {
                emoji: '🧠',
                title: { en: '4-Asset Diversification', bg: 'Диверсификация в 4 актива' },
                body: { en: 'A textbook "advanced lazy" portfolio:\n• 60% domestic stocks\n• 25% international stocks\n• 10% bonds\n• 5% small-cap or REITs (extra growth)\n\nMore moving parts, but each adds true diversification (not just more stocks). Rebalance once a year and it beats most paid advisors.', bg: 'Класически "лазя но напреднало" портфейл:\n• 60% местни акции\n• 25% международни\n• 10% облигации\n• 5% малки компании или REIT-и\n\nПовече части, но всяка дава истинска диверсификация. Ребалансирай 1× годишно и биеш повечето платени съветници.' },
                highlight: { en: '🎯 4 funds beat 4,000 stock picks for 99% of investors.', bg: '🎯 4 фонда бият 4,000 акции за 99% от инвеститорите.' },
              },
            ],
          },
          {
            id: 'etf-match-1', type: 'match_terms', xp: 25,
            matchPairs: [
              { term: { en: 'Expense ratio', bg: 'Коеф. на разходите' }, definition: { en: 'Annual fee as a % of assets in the fund', bg: 'Годишна такса като % от активите' } },
              { term: { en: 'NAV', bg: 'NAV' }, definition: { en: 'Net Asset Value — share price of the fund', bg: 'Нетна стойност на актива — цена на дял' } },
              { term: { en: 'Tracking error', bg: 'Tracking error' }, definition: { en: 'How much an ETF\'s return drifts from its benchmark', bg: 'Колко се отклонява ETF от референтния индекс' } },
              { term: { en: 'Distributing ETF', bg: 'Разпределящ ETF' }, definition: { en: 'Pays out dividends to investors as cash', bg: 'Изплаща дивиденти в брой на инвеститорите' } },
              { term: { en: 'Accumulating ETF', bg: 'Акумулиращ ETF' }, definition: { en: 'Reinvests dividends inside the fund automatically', bg: 'Реинвестира дивидентите автоматично' } },
              { term: { en: 'AUM', bg: 'AUM' }, definition: { en: 'Assets under management — fund size', bg: 'Активи под управление — размер на фонда' } },
            ],
          },
          {
            id: 'etf-pie-1', type: 'portfolio_pie', xp: 35,
            portfolioPie: {
              scenario: { en: 'You\'re 35, high risk tolerance, 30-year horizon. Build a 4-asset "advanced lazy" portfolio.', bg: 'На 35 си, висока толерантност към риск, 30-годишен хоризонт. Изгради 4-активен "лазя но напреднало" портфейл.' },
              question: { en: 'Allocate across the 4 asset classes (sum to 100%):', bg: 'Разпредели между 4-те класа активи (общо 100%):' },
              assets: [
                { label: { en: 'Domestic stocks', bg: 'Местни акции' }, emoji: '📊', color: 'hsl(var(--c-primary))', ideal: 60 },
                { label: { en: 'International stocks', bg: 'Международни акции' }, emoji: '🌍', color: 'hsl(var(--c-purple))', ideal: 25 },
                { label: { en: 'Bonds', bg: 'Облигации' }, emoji: '📜', color: 'hsl(var(--c-green))', ideal: 10 },
                { label: { en: 'Small-cap / REITs', bg: 'Малки компании / REIT' }, emoji: '🏘️', color: 'hsl(var(--c-orange))', ideal: 5 },
              ],
              tolerance: 8,
            },
            explanation: { en: 'A 60/25/10/5 split delivers ~85% equity (growth), 10% bond ballast, and a 5% "tilt" toward small-cap or REITs for extra long-term return. Rebalance to these targets yearly.', bg: 'Сплит 60/25/10/5 дава ~85% акции (растеж), 10% облигационен баласт и 5% наклон към малки компании / REIT за допълнителна доходност. Ребалансирай годишно.' },
          },
          {
            id: 'etf-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'A fund with a 1% expense ratio is "almost free" since 1% sounds tiny.', bg: 'Фонд с 1% такса е "почти безплатен", защото 1% звучи малко.' },
            isTrue: false,
            explanation: { en: 'FALSE. 1%/yr compounds against you. On €100,000 over 30 years at 7% gross, a 1% fee gap costs ~€220,000 in lost wealth. Always pick the lowest-cost fund tracking the same index.', bg: 'НЕВЯРНО. 1% годишно се натрупва срещу теб. При €100,000 за 30 г. при 7% бруто, 1% такса струва ~€220,000 загубено богатство. Винаги най-евтиния фонд за същия индекс.' },
          },
          {
            id: 'etf-fill-num-1', type: 'fill_number', xp: 25,
            fillNumberScenario: { en: 'Two ETFs track the same index. Both return 8% gross. ETF A charges 0.05%; ETF B charges 0.75%. You invest €50,000 once and let it run for 30 years.', bg: 'Два ETF проследяват същия индекс. И двата дават 8% бруто. ETF A — 0.05% такси; ETF B — 0.75%. Инвестираш €50,000 еднократно за 30 г.' },
            question: { en: 'How much MORE will ETF A be worth than ETF B (in thousands €)?', bg: 'С колко ПОВЕЧЕ ще е ETF A срещу ETF B (хил. €)?' },
            fillNumberAnswer: 90, fillNumberTolerance: 20, fillNumberUnit: '',
            fillNumberHint: { en: 'A net = 7.95%, B net = 7.25%. Compute €50k at each over 30 yrs.', bg: 'A нетно = 7.95%, B = 7.25%. Сметни €50k при всяка ставка за 30 г.' },
            explanation: { en: '€50k @ 7.95% × 30 ≈ €494k. @ 7.25% × 30 ≈ €406k. Difference ~€88k — almost double the original investment, lost just to fees.', bg: '€50k @ 7.95% × 30 ≈ €494k. @ 7.25% × 30 ≈ €406k. Разлика ~€88k — почти двойно колкото инвестицията, загубено само от такси.' },
          },
          {
            id: 'etf-chart-1', type: 'stock_chart', xp: 30,
            stockChart: {
              prices: [100, 105, 110, 108, 115, 120, 118, 125, 130, 128, 135, 140, 138, 145, 150, 148, 155, 160, 158, 165, 170, 168, 175, 180],
              labels: ['Jan22','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan23','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
              scenario: { en: 'A 2-year price chart with steady ~+80% growth and only mild dips along the way.', bg: '2-годишна графика с ~+80% растеж и само малки спадове.' },
              question: { en: 'This pattern is most consistent with which holding?', bg: 'Този модел най-вероятно идва от кой актив?' },
              mode: 'identify_pattern',
              patternOptions: [
                { en: 'A diversified total-market ETF in a bull run', bg: 'Диверсифициран total-market ETF в бичи цикъл' },
                { en: 'A leveraged 3× ETF', bg: 'Ливъридж 3× ETF' },
                { en: 'A single small-cap stock', bg: 'Единична малка компания' },
                { en: 'A short-term Treasury ETF', bg: 'Краткосрочен държавен ETF' },
              ],
              correctPatternIndex: 0,
            },
            explanation: { en: 'Smooth ~3–5% monthly upticks with mild pullbacks is signature broad-index behaviour during a bull run. 3× leveraged ETFs would show wider swings; small-caps would be more chaotic; bonds would barely move.', bg: 'Гладко ~3–5% месечно с малки корекции е типично за широк индекс в бичи цикъл. 3× фондове — по-големи колебания; малките — хаотични; облигации — почти не мърдат.' },
          },
          {
            id: 'etf-decision-1', type: 'scenario_decision', xp: 30,
            decisionAvatar: '💼',
            decisionScenario: { en: 'You inherit €10,000. You already own a 4-asset diversified portfolio. A friend pitches "this AI startup ETF is up 80% YTD — you HAVE to buy it before it doubles again."', bg: 'Наследяваш €10,000. Имаш диверсифициран портфейл от 4 актива. Приятел те убеждава: "този AI startup ETF е +80% от началото на годината — ТРЯБВА да купиш преди пак да се удвои."' },
            decisionChoices: [
              { label: { en: 'Add the entire €10k into the existing 4-asset portfolio per allocation', bg: 'Добави целите €10к в текущия портфейл по разпределение' }, emoji: '🎯', outcome: { en: 'You stick to your plan. Boring but bulletproof. Most "hot ETFs" mean-revert hard within 12–18 months. Your 4-asset portfolio still beats 90% of FOMO trades long-term.', bg: 'Стои се на плана. Скучно, но непоклатимо. Повечето "горещи ETF" се връщат жестоко за 12–18 м. 4-активният портфейл бие 90% от FOMO.' }, isBest: true },
              { label: { en: '€7k into the 4-asset, €3k into the AI ETF (capped speculation)', bg: '€7к в 4-активния, €3к в AI ETF (ограничена спекулация)' }, emoji: '⚖️', outcome: { en: 'Acceptable: kept speculation under 30%, kept core. Even if AI ETF -50%, you lose €1,500 — survivable. Just don\'t add MORE to it on the way down.', bg: 'Приемливо: спекулацията под 30%, ядрото запазено. Дори при -50% AI ETF губиш €1,500 — поносимо. Не добавяй повече при спад.' }, isBest: false },
              { label: { en: 'All-in on the AI ETF — momentum trading', bg: 'Всичко в AI ETF — momentum търговия' }, emoji: '🔥', outcome: { en: 'Buying after +80% means you\'re paying for someone else\'s gains. Sector ETFs that rip up usually retrace 40–60% within a year. €10k → €4k–€6k is the common outcome.', bg: 'Купуването след +80% значи плащаш за чужди печалби. Секторни ETF след скок се връщат с 40–60% за година. €10к → €4к–€6к е обичайното.' }, isBest: false },
            ],
            explanation: { en: 'Your existing diversification is the wealth-building system. Speculation in addition to it is fine; speculation INSTEAD of it is gambling.', bg: 'Текущата ти диверсификация е системата за богатство. Спекулация ДОПЪЛНИТЕЛНО — ОК; спекулация ВМЕСТО — хазарт.' },
          },
        ],
      },

      // ── Lesson 2: The Investor's Greatest Enemy ──
      {
        id: 'investor-mindset',
        moduleId: 'advanced-investing',
        title: { en: 'The Investor\'s Greatest Enemy', bg: 'Най-големият враг на инвеститора' },
        description: { en: 'Behavioral pitfalls — and how to read your own emotions through real charts.', bg: 'Поведенчески капани — и как да четеш емоциите си през реални графики.' },
        icon: '🧘', xpReward: 160, order: 2,
        exercises: [
          {
            id: 'mindset-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '📉',
                title: { en: 'The Crash Test', bg: 'Тестът на срива' },
                body: { en: 'It\'s March 2020. COVID hits. Your portfolio drops 40% in 3 weeks.\n\nFriends are panic-selling.\nNews says "worst since 1929."\nYou feel sick checking your app.\n\nThe correct action: NOTHING. Keep auto-buying.\n\nBy August 2020 the market had fully recovered. Holders + buyers built fortunes; sellers locked in permanent losses.', bg: 'Март 2020. COVID удря. Портфейлът -40% за 3 седмици.\n\nПриятелите продават паник.\nНовините: "най-лошият от 1929."\nТи се чувстваш зле да отвориш app-а.\n\nПравилно: НИЩО. Продължи авто-покупките.\n\nДо авг 2020 пазарът се възстанови напълно. Държащите + купуващите забогатяха; продавачите закотвиха загубите.' },
                highlight: { en: '🧘 The investor\'s job is not to predict — it\'s to survive their own emotions.', bg: '🧘 Работата на инвеститора не е да предсказва — а да оцелее от собствените си емоции.' },
              },
              {
                emoji: '🧠',
                title: { en: 'The 4 Cognitive Traps', bg: '4-те когнитивни капана' },
                body: { en: '1. Loss aversion — losses feel 2× worse than gains feel good\n2. Recency bias — recent moves feel like permanent trends\n3. Herd behaviour — selling because "everyone is selling"\n4. Anchoring — refusing to sell because "it was higher last week"\n\nKnowing the names helps you spot them mid-spiral. The pause is what saves you.', bg: '1. Аверсия към загуби — загубата боли 2× повече\n2. Recency bias — последните движения изглеждат като постоянен тренд\n3. Стадно поведение — продаваш защото "всички продават"\n4. Anchoring — не продаваш защото "беше по-горе"\n\nЗнанието на имената ти помага да ги разпознаваш. Паузата те спасява.' },
                highlight: { en: '⏸️ "Don\'t just do something — sit there." — Jack Bogle', bg: '⏸️ "Не прави нищо — просто седни." — Джак Богъл' },
              },
            ],
          },
          {
            id: 'mindset-chart-1', type: 'stock_chart', xp: 30,
            stockChart: {
              prices: [100, 105, 102, 108, 112, 115, 113, 118, 120, 116, 122, 120, 118, 110, 95, 78, 65, 70, 85, 100, 115, 125, 132, 140],
              labels: ['M1','M2','M3','M4','M5','M6','M7','M8','M9','M10','M11','M12','M13','M14','M15','M16','M17','M18','M19','M20','M21','M22','M23','M24'],
              scenario: { en: 'Your portfolio over 24 months. Months 13–17 brought a brutal -47% drawdown before a strong recovery.', bg: 'Портфейлът ти за 24 м. Месеци 13–17 донесоха -47% спад преди силно възстановяване.' },
              question: { en: 'Click the month when adding a LARGER-than-usual contribution would have paid off the most.', bg: 'Кликни месеца, в който добавянето на ПО-ГОЛЯМА от обичайната вноска би се изплатило най-много.' },
              mode: 'identify_point',
              correctPointIndex: 16,
              pointTolerance: 1,
              pointPrompt: { en: 'Look for the bottom — that\'s where extra money buys the most shares.', bg: 'Търси дъното — там допълнителните пари купуват най-много дялове.' },
            },
            explanation: { en: 'The bottom (M17, price 65) is where every extra euro bought ~2× the shares it bought 6 months earlier. Those who added during the panic crushed those who DCA-ed normally and DESTROYED those who panic-sold.', bg: 'Дъното (M17, цена 65) е където всяко евро купи ~2× повече дялове отпреди 6 м. Тези, които добавяха в паниката, биха обикновените DCA и УНИЩОЖИХА паниците.' },
          },
          {
            id: 'mindset-tf-1', type: 'true_false', xp: 15,
            statement: { en: '"This time is different" is usually a reliable signal that markets won\'t recover.', bg: '"Този път е различно" обикновено е надежден сигнал, че пазарите няма да се възстановят.' },
            isTrue: false,
            explanation: { en: 'FALSE. "This time is different" is the most expensive phrase in investing. EVERY major crash in history (1929, 1973, 1987, 2000, 2008, 2020) was called "different" — and EVERY one fully recovered. The pattern repeats because human emotion repeats.', bg: 'НЕВЯРНО. "Този път е различно" е най-скъпата фраза в инвестирането. ВСЕКИ голям срив (1929, 1973, 1987, 2000, 2008, 2020) беше наречен "различен" — и ВСЕКИ се възстанови. Моделът се повтаря, защото емоциите се повтарят.' },
          },
          {
            id: 'mindset-order-1', type: 'order_items', xp: 25,
            orderInstruction: { en: 'Order these investor mistakes from MOST damaging (long-term) to LEAST damaging:', bg: 'Подреди тези грешки от НАЙ-РАЗРУШИТЕЛНА към НАЙ-МАЛКА (дългосрочно):' },
            orderItems: [
              { label: { en: 'Panic-selling near the bottom of a crash', bg: 'Паническа продажба на дъното' }, emoji: '🚨' },
              { label: { en: 'Picking only single stocks (no diversification)', bg: 'Само единични акции (без диверсификация)' }, emoji: '🎰' },
              { label: { en: 'Trying to time the market by sitting in cash', bg: 'Опит за тайминг чрез седене в кеш' }, emoji: '⏰' },
              { label: { en: 'Paying high (1%+) fund management fees', bg: 'Високи (1%+) такси на фонд' }, emoji: '💸' },
              { label: { en: 'Rebalancing slightly more often than yearly', bg: 'Ребалансиране по-често от годишно' }, emoji: '🔁' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Panic selling permanently locks losses (irreversible). Concentration in single stocks risks total loss. Cash-timing typically misses 30–50% of long-run returns. Fees compound silently. Over-rebalancing is a minor annoyance by comparison.', bg: 'Паника закотвя загубите (необратимо). Концентрация = риск от пълна загуба. Кеш-тайминг пропуска 30–50% от доходността. Таксите се натрупват тихо. Прекомерно ребалансиране е дребен проблем.' },
          },
          {
            id: 'mindset-match-1', type: 'match_terms', xp: 20,
            matchPairs: [
              { term: { en: 'Loss aversion', bg: 'Аверсия към загуби' }, definition: { en: 'Losses feel ~2× more painful than gains feel good', bg: 'Загубата боли ~2× повече от радостта на печалбата' } },
              { term: { en: 'Recency bias', bg: 'Recency bias' }, definition: { en: 'Treating the recent past as a long-term trend', bg: 'Взимаш близкото минало за дългосрочен тренд' } },
              { term: { en: 'Anchoring', bg: 'Anchoring' }, definition: { en: 'Refusing to act because of an irrelevant past price', bg: 'Не действаш заради ирелевантна минала цена' } },
              { term: { en: 'Herd behaviour', bg: 'Стадно поведение' }, definition: { en: 'Doing what the crowd is doing without analysis', bg: 'Правиш каквото тълпата без анализ' } },
              { term: { en: 'Sunk cost fallacy', bg: 'Sunk cost' }, definition: { en: 'Holding a bad asset because of money already lost', bg: 'Държиш лош актив заради вече загубените пари' } },
            ],
          },
          {
            id: 'mindset-decision-1', type: 'scenario_decision', xp: 30,
            decisionAvatar: '🚀',
            decisionScenario: { en: 'A coworker just made €40,000 on a meme stock that\'s up 800% in 6 weeks. He\'s posting screenshots in the group chat: "still going to a million." You feel intense FOMO.', bg: 'Колега току-що направи €40,000 на мемна акция +800% за 6 седмици. Постит скрийншоти: "още до милион." Чувстваш силен FOMO.' },
            decisionChoices: [
              { label: { en: 'Buy €5k at the new high — "ride the trend"', bg: 'Купи €5к на новия връх — "качи се на вълната"' }, emoji: '🎢', outcome: { en: 'Classic top-buying. Meme spikes mean-revert: 90% of buyers AT THE HIGH are underwater within 6 months. Average loss: -60% to -80%. Your €5k often becomes €1k–€2k.', bg: 'Класическо купуване на върха. Мемните скокове се връщат: 90% от купувачите НА ВЪРХА са под водата за 6 м. Средна загуба: -60% до -80%. €5к често стават €1к–€2к.' }, isBest: false },
              { label: { en: 'Note the FOMO, write down "I am feeling X", and go invest the €5k in your normal ETF', bg: 'Забележи FOMO, запиши "чувствам X", и инвестирай €5к в обичайния ETF' }, emoji: '📝', outcome: { en: 'Naming the emotion breaks its grip. Investing the SAME money in your boring ETF turns the urge into wealth-building behaviour. This is the move that separates pros from gamblers.', bg: 'Назоваването на емоцията къса хватката. Инвестирането в обичайния ETF превръща импулса в богатство. Това разделя професионалистите от хазартниците.' }, isBest: true },
              { label: { en: 'Sell some of your boring ETF to buy the meme', bg: 'Продай част от ETF, за да купиш мема' }, emoji: '💸', outcome: { en: 'Worst-case scenario: you exit a winner to chase a top. If meme drops 70% AND your ETF rallies 15%, you can lose €4–5k of net worth on a single emotional decision.', bg: 'Най-лошото: излизаш от печелещ за връх. Ако мемът падне 70% И ETF се качи 15%, губиш €4–5к от една емоционална решение.' }, isBest: false },
            ],
            explanation: { en: 'FOMO is information about your emotions, NOT about the asset. The professional move is to use the urge as fuel for your existing plan.', bg: 'FOMO е информация за емоциите ти, НЕ за актива. Професионалният ход е да използваш импулса като гориво за плана си.' },
          },
          {
            id: 'mindset-rpg-1', type: 'rpg_scenario', xp: 30,
            scenario: { en: 'January 2022. Your €10,000 portfolio is at €7,500 after a 25% drop. Coworker: "I sold everything." Headline: "Analysts warn -30% more incoming." Your move?', bg: 'Януари 2022. Портфейлът €10,000 е €7,500 след -25%. Колега: "продадох всичко." Заглавие: "анализатори: -30% още." Ходът ти?' },
            avatar: '😰',
            choices: [
              { label: { en: 'Sell everything to "stop the bleeding"', bg: 'Продай всичко да "спреш кръвта"' }, emoji: '🚨', consequence: { en: 'You sold near the bottom. The market rallied +60% over the next 18 months. You locked in a permanent €2,500 loss and missed the entire recovery.', bg: 'Продаде близо до дъното. Пазарът +60% за 18 м. Закотви €2,500 загуба и пропусна цялото възстановяване.' }, cashFlowChange: -2500, isGood: false },
              { label: { en: 'Hold + continue €300/mo DCA', bg: 'Дръж + продължи €300/мес DCA' }, emoji: '🧘', consequence: { en: 'Hard but correct. 18 months later your portfolio is worth ~€13,200 — beating pre-crash levels. Discipline > prediction.', bg: 'Трудно, но правилно. 18 м. по-късно портфейлът е ~€13,200 — над предсривните нива. Дисциплина > прогноза.' }, cashFlowChange: 5700, isGood: true },
              { label: { en: 'Add an extra €2,000 lump-sum into the dip', bg: 'Добави €2,000 еднократно в спада' }, emoji: '🛒', consequence: { en: 'Aggressive but mathematically optimal. €17,800 portfolio 18 months later. Only do this with money you don\'t need for 5+ years.', bg: 'Агресивно, но математически оптимално. €17,800 за 18 м. Само с пари за 5+ г. напред.' }, cashFlowChange: 8300, isGood: true },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PRO MODULE 2 — REAL ESTATE INVESTING
  // Signature interactive: rat_race (landlord cashflow simulator)
  // ─────────────────────────────────────────────
  {
    id: 'real-estate',
    title: { en: 'Real Estate Investing', bg: 'Инвестиции в недвижими имоти' },
    description: { en: 'Analyse real deals, survive landlord nightmares, and decide: buy or invest in REITs?', bg: 'Анализирай реални сделки, преживей кошмари на наемодатели и реши: купувай или инвестирай в REIT-и?' },
    icon: '🏠', color: 'orange', order: 11, proOnly: true,
    lessons: [
      // ── Lesson 1: The Landlord Game ──
      {
        id: 'reit-fundamentals',
        moduleId: 'real-estate',
        title: { en: 'The Landlord Game', bg: 'Играта на наемодателя' },
        description: { en: 'Run the numbers on real deals. Spot the cashflow traps.', bg: 'Пресметни реалните сделки. Открий капаните на паричния поток.' },
        icon: '🏢', xpReward: 170, order: 1,
        exercises: [
          {
            id: 're-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🏠',
                title: { en: 'Glamour vs Reality', bg: 'Блясък срещу реалност' },
                body: { en: 'The Instagram version:\n📸 "Passive income from my rental!"\n\nThe real version:\n📞 3am call: tenant flooded the bathroom\n🔧 €2,400 boiler repair out of nowhere\n📋 6-month eviction for non-paying tenant\n💸 3 months vacancy between tenants\n\nReal estate CAN beat stocks — but only if the numbers actually work.', bg: 'Instagram версия:\n📸 "Пасивен доход от наема!"\n\nРеалната версия:\n📞 3 ч. сутринта: наемателят наводни банята\n🔧 €2,400 ремонт на бойлер от нищото\n📋 6-месечно изгонване на неплащащ\n💸 3 месеца незаетост между наематели\n\nИмотите МОГАТ да бият акциите — но само ако числата работят.' },
                highlight: { en: '🧮 Cashflow = Rent − Mortgage − Insurance − Maintenance (10%) − Vacancy (8%)', bg: '🧮 Поток = Наем − Ипотека − Застраховка − Поддръжка (10%) − Незаетост (8%)' },
              },
              {
                emoji: '🎯',
                title: { en: 'The 1% Rule — Quick Filter', bg: 'Правилото 1% — бърз филтър' },
                body: { en: 'Before deep analysis, use this 5-second test:\n\nMonthly rent ÷ Purchase price ≥ 1%\n\nExamples:\n✅ €120k property → needs €1,200/mo rent\n❌ €250k property → needs €2,500/mo (rare!)\n\nFails the 1% rule? The math almost never works out after costs. Move on.', bg: 'Преди задълбочен анализ, 5-секунден тест:\n\nМесечен наем ÷ Цена ≥ 1%\n\nПримери:\n✅ €120k имот → нужни €1,200/мес\n❌ €250k имот → нужни €2,500/мес (рядко!)\n\nНе минава 1%? Числата почти никога не работят. Продължи.' },
                highlight: { en: '⚡ Better cap rate target: 6%+ (NOI ÷ price). Anything under 5% rarely beats a REIT after the headaches.', bg: '⚡ По-добра цел за cap rate: 6%+ (NOI ÷ цена). Под 5% рядко бие REIT след главоболията.' },
              },
            ],
          },
          {
            id: 're-match-1', type: 'match_terms', xp: 25,
            matchPairs: [
              { term: { en: 'Cap rate', bg: 'Cap rate' }, definition: { en: 'NOI ÷ purchase price — annual unlevered yield', bg: 'NOI ÷ цена — годишна доходност без ливъридж' } },
              { term: { en: 'NOI', bg: 'NOI' }, definition: { en: 'Net Operating Income = rent − operating expenses', bg: 'Чист оперативен доход = наем − оперативни разходи' } },
              { term: { en: 'Cash-on-cash', bg: 'Cash-on-cash' }, definition: { en: 'Annual cashflow ÷ cash invested (with leverage)', bg: 'Годишен поток ÷ вложен кеш (с ливъридж)' } },
              { term: { en: 'Vacancy rate', bg: 'Норма на незаетост' }, definition: { en: 'Average % of months a unit sits empty per year', bg: 'Среден % месеци, в които имот е празен годишно' } },
              { term: { en: 'Equity', bg: 'Капитал' }, definition: { en: 'Property value minus the mortgage balance', bg: 'Стойност на имота минус остатъка по ипотеката' } },
            ],
          },
          {
            id: 're-fill-num-1', type: 'fill_number', xp: 25,
            fillNumberScenario: { en: 'A €180,000 apartment can be rented for €1,000/month. Apply the 1% rule: monthly rent ÷ price × 100.', bg: 'Апартамент €180,000 може да се отдава за €1,000/мес. Приложи правилото 1%: месечен наем ÷ цена × 100.' },
            question: { en: 'What is the 1%-rule percentage for this deal?', bg: 'Какъв е процентът по правилото 1% за тази сделка?' },
            fillNumberAnswer: 0.56, fillNumberTolerance: 0.05, fillNumberUnit: '',
            fillNumberHint: { en: '€1,000 ÷ €180,000 × 100 = ?', bg: '€1,000 ÷ €180,000 × 100 = ?' },
            explanation: { en: '0.56% — well under 1%. Without significant rent increases, this deal cashflows poorly. Cap rate would also be borderline. Look for properties with stronger rent-to-price ratios.', bg: '0.56% — далеч под 1%. Без големи увеличения на наема, тази сделка е със слаб поток. Cap rate също би бил граничен. Търси имоти с по-добро съотношение наем/цена.' },
          },
          {
            id: 're-tf-1', type: 'true_false', xp: 15,
            statement: { en: 'Real estate values always go up over the long term — you can\'t lose buying property.', bg: 'Стойностите на имотите винаги растат — не можеш да загубиш, купувайки имот.' },
            isTrue: false,
            explanation: { en: 'FALSE. Japanese real estate dropped 70%+ in the 1990s and never recovered. US prices fell 30% in 2008–2012. Spain dropped 40%. Long-term direction is up, but specific markets, neighbourhoods, and decades can lose money. Cashflow protects you when appreciation doesn\'t come.', bg: 'НЕВЯРНО. Японските имоти паднаха 70%+ в 90-те и не се възстановиха. САЩ -30% в 2008–2012. Испания -40%. Дългосрочната посока е нагоре, но конкретни пазари и десетилетия могат да губят. Потокът те пази, когато поскъпването закъснее.' },
          },
          {
            id: 're-rat-race-1', type: 'rat_race', xp: 40,
            ratRaceProfile: {
              name: { en: 'Maria the Landlord', bg: 'Мария наемодателката' },
              job: { en: 'Owns 1 rental apartment', bg: 'Притежава 1 апартамент под наем' },
              avatar: '👩',
              monthlyIncome: 800,
              expenses: [
                { label: { en: 'Mortgage payment', bg: 'Ипотечна вноска' }, emoji: '🏦', amount: 520 },
                { label: { en: 'Insurance', bg: 'Застраховка' }, emoji: '🛡️', amount: 40 },
                { label: { en: 'Maintenance reserve', bg: 'Резерв за поддръжка' }, emoji: '🔧', amount: 80 },
                { label: { en: 'Vacancy reserve', bg: 'Резерв за незаетост' }, emoji: '🚪', amount: 64 },
              ],
              opportunities: [
                { label: { en: 'Buy a REIT ETF with cashflow', bg: 'Купи REIT ETF с потока' }, emoji: '📈', cost: 0, monthlyPassive: 8, isGood: true },
                { label: { en: 'Hire a property manager (8% of rent)', bg: 'Наеми управител (8% от наема)' }, emoji: '👔', cost: 0, monthlyPassive: -64, isGood: false },
                { label: { en: 'Renovate kitchen — higher rent', bg: 'Ремонт на кухня — по-висок наем' }, emoji: '🍳', cost: 3000, monthlyPassive: 80, isGood: true },
                { label: { en: 'Take 2nd mortgage for a vacation', bg: '2-ра ипотека за ваканция' }, emoji: '🏖️', cost: 0, monthlyPassive: -200, isGood: false },
              ],
            },
          },
          {
            id: 're-decision-1', type: 'scenario_decision', xp: 30,
            decisionAvatar: '🏘️',
            decisionScenario: { en: 'Three deals on your desk. €40k cash for the down payment. Pick the BEST cashflow opportunity.', bg: 'Три сделки на бюрото ти. €40к кеш за първоначална вноска. Избери НАЙ-ДОБРАТА сделка за поток.' },
            decisionChoices: [
              { label: { en: 'A: €200k apartment, €1,800/mo rent, "trendy" area', bg: 'А: €200к апартамент, €1,800/мес наем, "моден" район' }, emoji: '🌆', outcome: { en: 'Passes 1% rule (0.9%, borderline). After mortgage €1,100 + costs €260, cashflow is ~€440/mo. Decent, but trendy areas can have rapid value swings. Solid but not exceptional.', bg: 'Минава 1% (0.9%, граница). След ипотека €1,100 + разходи €260, поток ~€440/мес. Прилично, но модните райони имат рискове. Стабилно, но не изключително.' }, isBest: false },
              { label: { en: 'B: €120k smaller flat, €1,250/mo rent, "boring" steady neighbourhood', bg: 'Б: €120к по-малък апартамент, €1,250/мес наем, "скучен" стабилен район' }, emoji: '🏘️', outcome: { en: 'Passes 1% rule (1.04%) easily. Mortgage €700 + costs €175 → cashflow ~€375/mo on €24k down. Cash-on-cash ≈ 18%. Boring areas have stable rents and lower vacancy. Best risk-adjusted return.', bg: 'Минава 1% (1.04%) лесно. Ипотека €700 + разходи €175 → поток ~€375/мес при €24к първоначални. Cash-on-cash ≈ 18%. Скучните райони имат стабилни наеми. Най-добра възвращаемост на риск.' }, isBest: true },
              { label: { en: 'C: €350k modern apartment, €2,000/mo rent, prestige location', bg: 'В: €350к модерен, €2,000/мес наем, престижна локация' }, emoji: '✨', outcome: { en: 'Fails the 1% rule (0.57%). Mortgage €2,000 + costs €260 → cashflow is NEGATIVE €260/mo. Banking on appreciation = speculation, not investing.', bg: 'Не минава 1% (0.57%). Ипотека €2,000 + разходи €260 → поток е МИНУС €260/мес. Залог на поскъпване = спекулация.' }, isBest: false },
            ],
            explanation: { en: '"Boring" properties with strong rent-to-price ratios beat trendy/prestige ones for cashflow. Trendy may appreciate, but speculation isn\'t investing — predictable cashflow is.', bg: '"Скучните" имоти с добро наем/цена бият модните за поток. Модните може да поскъпнат, но спекулацията не е инвестиране — предсказуемият поток е.' },
          },
          {
            id: 're-choice-1', type: 'choice', xp: 15,
            question: { en: 'Deal: €180k apartment, €900/mo rent, mortgage €700, costs €130. Is this a good investment?', bg: 'Сделка: €180к апартамент, €900/мес наем, ипотека €700, разходи €130. Добра инвестиция?' },
            options: [
              { en: 'Yes — €70/mo positive cashflow is great', bg: 'Да — €70/мес положителен поток е страхотно' },
              { en: 'No — barely breaks even, one repair wipes a year of profit', bg: 'Не — едва излиза, един ремонт изтрива година печалба' },
              { en: 'Yes — property always goes up', bg: 'Да — имотите винаги растат' },
              { en: 'It depends on the neighbourhood', bg: 'Зависи от квартала' },
            ],
            correctIndex: 1,
            explanation: { en: '€70/mo = €840/yr. A single boiler repair (€1,500+) wipes 2 years of profit. Fails the 1% rule (€900/€180k = 0.5%). Walk away — better deals exist.', bg: '€70/мес = €840/год. Един ремонт на бойлер (€1,500+) трие 2 години печалба. Не минава 1% (0.5%). Откажи — има по-добри сделки.' },
          },
        ],
      },

      // ── Lesson 2: REIT vs Buy ──
      {
        id: 'rental-cashflow',
        moduleId: 'real-estate',
        title: { en: 'REIT vs Buy — The Showdown', bg: 'REIT срещу купуване — дуелът' },
        description: { en: 'Run head-to-head: what builds more wealth over 20 years with less stress?', bg: 'Очи в очи: какво трупа повече богатство за 20 г. с по-малко стрес?' },
        icon: '⚔️', xpReward: 180, order: 2,
        exercises: [
          {
            id: 'reit-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '⚔️',
                title: { en: 'Two Friends. Same €50k. Different Choices.', bg: 'Двама приятели. Еднакви €50к. Различни избори.' },
                body: { en: 'Alex buys a rental apartment:\n🏠 €200k apartment, €50k down\n📈 +3%/yr appreciation\n💰 €150/mo cashflow after all costs\n😤 1 nightmare tenant. 3 months vacancy. €3k roof.\n\nSam buys a REIT ETF:\n📊 €50k at 7%/yr (price + dividends)\n💸 Auto-reinvested dividends\n😎 0 phone calls at 3am\n📱 Checked portfolio 0 times\n\n20 years later — who wins?', bg: 'Алекс купува апартамент:\n🏠 €200к, €50к първа вноска\n📈 +3%/г поскъпване\n💰 €150/мес поток след всички разходи\n😤 1 кошмарен наемател. 3 м. незаетост. €3к покрив.\n\nСам купува REIT ETF:\n📊 €50к при 7%/г (цена + дивиденти)\n💸 Авто-реинвестирани дивиденти\n😎 0 обаждания в 3 ч.\n📱 Проверил 0 пъти\n\n20 г. по-късно — кой печели?' },
                highlight: { en: '💡 Both can win. REITs = zero work. Direct property only beats IF the math works AND you\'re a good landlord.', bg: '💡 И двамата печелят. REIT = нула работа. Директният имот бие САМО ако числата работят И си добър наемодател.' },
              },
              {
                emoji: '🔑',
                title: { en: 'The Hidden Advantages of Each', bg: 'Скритите предимства на всеки' },
                body: { en: 'Direct property:\n• Leverage: €50k controls €250k of asset\n• Tax breaks: depreciation deduction\n• Forced appreciation: renovate to add value\n\nREITs:\n• Liquidity: sell in 3 seconds, no agent\n• Diversification: own 1,000 properties at once\n• Hands-off: no tenants, no toilets, no calls\n• Lower transaction costs (0.1% vs 8–10%)', bg: 'Директен имот:\n• Ливъридж: €50к контролира €250к актив\n• Данъчни облекчения: амортизация\n• Принудено поскъпване: ремонт = стойност\n\nREIT:\n• Ликвидност: продаваш за 3 сек\n• Диверсификация: 1,000 имота наведнъж\n• Без главоболия: без наематели, без тоалетни\n• По-ниски транзакционни разходи (0.1% vs 8–10%)' },
                highlight: { en: '🎯 Pick one — the answer is whichever you\'ll actually run for 10+ years.', bg: '🎯 Избери едно — отговорът е този, който наистина ще водиш 10+ години.' },
              },
            ],
          },
          {
            id: 'reit-compound-1', type: 'compound_sim', xp: 30,
            compoundConfig: { defaultPrincipal: 50000, defaultRate: 7, defaultYears: 20, defaultMonthly: 150 },
          },
          {
            id: 'reit-order-1', type: 'order_items', xp: 25,
            orderInstruction: { en: 'Order these property-deal evaluation steps from FIRST to LAST:', bg: 'Подреди стъпките за оценка на сделка от ПЪРВА към ПОСЛЕДНА:' },
            orderItems: [
              { label: { en: 'Apply 1%-rule quick filter', bg: 'Приложи бърз филтър 1%' }, emoji: '🎯' },
              { label: { en: 'Calculate full annual NOI (rent − operating costs)', bg: 'Сметни годишен NOI (наем − оп. разходи)' }, emoji: '🧮' },
              { label: { en: 'Compute cap rate and cash-on-cash return', bg: 'Сметни cap rate и cash-on-cash' }, emoji: '📊' },
              { label: { en: 'Stress-test: vacancy + 1 major repair scenario', bg: 'Стрес-тест: незаетост + 1 голям ремонт' }, emoji: '⚠️' },
              { label: { en: 'Compare against a passive REIT alternative', bg: 'Сравни с пасивна REIT алтернатива' }, emoji: '⚖️' },
            ],
            correctOrder: [0, 1, 2, 3, 4],
            explanation: { en: 'Filter fast → compute the real number → stress-test → compare to the easy alternative. Most amateurs skip stress-testing and the REIT comparison and overpay.', bg: 'Бърз филтър → реално число → стрес-тест → сравнение с лесната алтернатива. Повечето пропускат стрес-теста и сравнението и надплащат.' },
          },
          {
            id: 'reit-fill-num-1', type: 'fill_number', xp: 25,
            fillNumberScenario: { en: 'A €150,000 apartment generates €13,500 annual rent. Operating expenses (insurance, maintenance, taxes) total €4,500/year.', bg: 'Апартамент €150,000 дава €13,500 годишен наем. Оперативни разходи (застраховка, поддръжка, данъци) общо €4,500/год.' },
            question: { en: 'What is the cap rate, in %?', bg: 'Какъв е cap rate, в %?' },
            fillNumberAnswer: 6, fillNumberTolerance: 0.5, fillNumberUnit: '',
            fillNumberHint: { en: 'Cap rate = (Rent − Op. expenses) ÷ Price × 100', bg: 'Cap rate = (Наем − Оп. разходи) ÷ Цена × 100' },
            explanation: { en: 'NOI = €13,500 − €4,500 = €9,000. Cap rate = €9,000 ÷ €150,000 = 6%. A 6% cap rate is solid for residential — anything under 5% rarely beats a REIT after the headaches.', bg: 'NOI = €13,500 − €4,500 = €9,000. Cap rate = €9,000 ÷ €150,000 = 6%. 6% е добро за жилищен имот — под 5% рядко бие REIT.' },
          },
          {
            id: 'reit-match-1', type: 'match_terms', xp: 25,
            matchPairs: [
              { term: { en: 'Leverage', bg: 'Ливъридж' }, definition: { en: 'Using borrowed money to control a larger asset', bg: 'Заети пари за контрол на по-голям актив' } },
              { term: { en: 'Refinance', bg: 'Рефинансиране' }, definition: { en: 'Replace a mortgage with a new one (better terms or pull equity)', bg: 'Замяна на ипотеката с нова (по-добри условия или извличане на капитал)' } },
              { term: { en: 'HELOC', bg: 'HELOC' }, definition: { en: 'Home Equity Line of Credit — revolving credit secured by equity', bg: 'Кредит срещу собствения капитал — револвиращ' } },
              { term: { en: 'Depreciation', bg: 'Амортизация' }, definition: { en: 'Tax deduction reflecting "wear and tear" on property', bg: 'Данъчно облекчение за "износване" на имота' } },
              { term: { en: 'REIT', bg: 'REIT' }, definition: { en: 'Real Estate Investment Trust — stock-like share of properties', bg: 'Доверителен фонд за имоти — дял подобен на акция' } },
              { term: { en: '1031 exchange', bg: '1031 размяна' }, definition: { en: 'Defer capital gains tax by swapping property for property', bg: 'Отлагане на данък върху печалбата чрез размяна на имоти' } },
            ],
          },
          {
            id: 'reit-rpg-1', type: 'rpg_scenario', xp: 30,
            scenario: { en: 'Your tenant hasn\'t paid rent in 2 months (€1,800 owed). They claim job loss. They politely ask for "another month." Your savings cover the mortgage but you\'re stressed. Choice?', bg: 'Наемателят ти не е плащал 2 месеца (€1,800 дължими). Твърди загуба на работа. Любезно иска "още един месец". Спестяванията покриват ипотеката, но ти е стресно. Избор?' },
            avatar: '😬',
            choices: [
              { label: { en: 'Grant another month, no paperwork', bg: 'Дай още месец, без документи' }, emoji: '🤝', consequence: { en: 'Studies show 70%+ of "one more month" tenants don\'t pay. You\'re now at 3 months unpaid (€2,700) and the eviction clock didn\'t start. Loss extends another 3–6 months minimum.', bg: 'Проучвания: 70%+ от "още един месец" наематели не плащат. Сега си на 3 м. неплатени (€2,700) и часовникът за изгонване не тече. Загубата продължава поне 3–6 м.' }, cashFlowChange: -2700, isGood: false },
              { label: { en: 'File formal notice + offer cash-for-keys (€500 to leave)', bg: 'Подай официално известие + cash-for-keys (€500 да напусне)' }, emoji: '📋', consequence: { en: 'Pragmatic. Eviction takes 3–6 months. Cash-for-keys often works in 30 days. €500 paid + €1,800 lost rent < a 4-month eviction (€3,600 lost rent + €1,500 legal). Net saved: ~€2,800.', bg: 'Прагматично. Изгонването отнема 3–6 м. Cash-for-keys често работи за 30 дни. €500 + €1,800 загубен наем < 4-м изгонване (€3,600 загубен наем + €1,500 правни). Чисто спестени: ~€2,800.' }, cashFlowChange: 1300, isGood: true },
              { label: { en: 'Skip the legal process and change the locks now', bg: 'Пропусни правния процес и смени ключалките' }, emoji: '🔒', consequence: { en: 'ILLEGAL in almost every jurisdiction. You can be sued, fined €1,000–€10,000, AND ordered to let the tenant back in with a free month. Always go through legal channels.', bg: 'НЕЗАКОННО в почти всяка юрисдикция. Можеш да си съден, глобен €1,000–€10,000, И принуден да го пуснеш с безплатен месец. Винаги по правен път.' }, cashFlowChange: -5000, isGood: false },
            ],
          },
          {
            id: 'reit-decision-1', type: 'scenario_decision', xp: 30,
            decisionAvatar: '🤔',
            decisionScenario: { en: 'You have €40k saved. The €200k local apartment you like would need €1,800/mo rent to cashflow positive — current market rate is €950. What\'s the move?', bg: 'Имаш €40к. Местният апартамент €200к би трябвало да дава €1,800/мес наем за положителен поток — текущ пазар: €950. Ходът?' },
            decisionChoices: [
              { label: { en: 'Buy it anyway — real estate always wins long-term', bg: 'Купи го все пак — имотите винаги печелят дългосрочно' }, emoji: '🏠', outcome: { en: 'You bleed €850/mo from day 1 (€10k/yr). After 3 yrs, you\'ve lost €30k+ in cashflow plus opportunity cost. Selling triggers 8% transaction costs. Permanent ~€45k loss.', bg: 'Кървиш €850/мес от ден 1 (€10к/год). След 3 г. — €30к+ изгубени плюс пропусната възможност. Продажбата носи 8% такси. Постоянна загуба ~€45к.' }, isBest: false },
              { label: { en: 'Park €40k in a REIT ETF, hunt for a better deal', bg: 'Паркирай €40к в REIT ETF, търси по-добра сделка' }, emoji: '📊', outcome: { en: 'Best of both worlds. €40k earns ~7%/yr (~€2,800/yr) while you wait. After 18 months you find a €130k flat renting at €1,150 (passes 1%). Now the math works AND you have €43k+ to deploy.', bg: 'И двата свята. €40к печелят ~7%/г (~€2,800/год) докато чакаш. След 18 м. намираш €130к при €1,150 наем (минава 1%). Числата работят И имаш €43к+ за работа.' }, isBest: true },
              { label: { en: 'Buy a cheaper out-of-state property sight-unseen for cashflow', bg: 'Купи по-евтин имот в друг град без оглед — само за поток' }, emoji: '🚚', outcome: { en: 'Out-of-state without local knowledge = high vacancy, surprise repairs, contractor scams. Most newbies who do this lose money for 2–4 years before learning. Property managers eat 8–10% of rent.', bg: 'В друг град без местни познания = висока незаетост, изненадващи ремонти, измами. Повечето новаци губят 2–4 г. преди да научат. Управителите вземат 8–10%.' }, isBest: false },
            ],
            explanation: { en: 'When the local math doesn\'t work, the answer is patience + REIT in the meantime — not forcing a bad deal or jumping into markets you don\'t understand.', bg: 'Когато местната математика не работи, отговорът е търпение + REIT междувременно — не насилване на лоша сделка или скок в непознати пазари.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PRO MODULE 3 — TAX STRATEGY
  // ─────────────────────────────────────────────
  {
    id: 'tax-strategy',
    title: { en: 'Tax Strategy', bg: 'Данъчна стратегия' },
    description: { en: 'The legal game the wealthy play. Learn every trick — without breaking any laws.', bg: 'Законната игра, която богатите играят. Научи всеки трик — без да нарушаваш закони.' },
    icon: '🧾', color: 'purple', order: 12, proOnly: true,
    lessons: [
      {
        id: 'tax-basics',
        moduleId: 'tax-strategy',
        title: { en: 'The Tax Bracket Myth That Costs People Thousands', bg: 'Митът за данъчните скоби, който струва хиляди' },
        description: { en: 'Bust the biggest tax misconception and learn how brackets actually work.', bg: 'Разбий най-голямото данъчно заблуждение и научи как реално работят скобите.' },
        icon: '💡', xpReward: 130, order: 1,
        exercises: [
          {
            id: 'tax-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🤦',
                title: { en: 'The Myth That Makes People Refuse Raises', bg: 'Митът, заради който хора отказват повишения' },
                body: { en: 'True story: An employee refused a €5,000 raise because "it would push me into the higher tax bracket and I\'d take home less."\n\nThis is 100% wrong. Here\'s why:\n\nTax brackets are MARGINAL. You only pay the higher rate on income ABOVE the threshold.\n\nExample with simplified brackets:\n€0-30k: 20%\n€30k-70k: 35%\n\nIf you earn €31,000:\n• First €30k: taxed at 20% = €6,000\n• Last €1,000: taxed at 35% = €350\n• Total: €6,350 tax\n\nA raise ALWAYS means more money in your pocket.', bg: 'Вярна история: Служител отказа повишение от €5,000, защото "ще ме вкара в по-висока данъчна скоба и ще взема по-малко".\n\nТова е 100% грешно. Ето защо:\n\nДанъчните скоби са ПРЕДЕЛНИ. Плащаш по-високата ставка само за дохода НАД прага.\n\nПример с опростени скоби:\n€0-30k: 20%\n€30k-70k: 35%\n\nАко печелиш €31,000:\n• Първите €30k: данък 20% = €6,000\n• Послед��ите €1,000: данък 35% = €350\n• Общо: €6,350 данък\n\nПовишението ВИНАГИ означава повече пари в джоба ти.' },
                highlight: { en: '💡 Never refuse a raise because of tax brackets. You will always take home more money.', bg: '💡 Никога не отказвай повишение заради данъчни скоби. Винаги ще взимаш повече пари у дома.' },
              },
              {
                emoji: '🎯',
                title: { en: 'The Three Legal Tax Weapons', bg: 'Трите законни данъчни оръжия' },
                body: { en: 'Every person has access to these:\n\n🏦 1. PENSION / RETIREMENT ACCOUNT\nMoney goes in tax-free. Grows tax-free. Taxed only when you withdraw — at retirement when you\'re in a lower bracket.\n\n📉 2. TAX LOSS HARVESTING\nSell losing investments to offset gains. The losses reduce your taxable income.\n\n🏠 3. BUSINESS EXPENSES\nIf you freelance or have a business, many expenses become deductible — laptop, internet, workspace.', bg: 'Всеки има достъп до тях:\n\n🏦 1. ПЕНСИОННА СМЕТКА\nПарите влизат без данък. Растат без данък. Облагат се само при теглене — при пенсиониране, когато си в по-ниска скоба.\n\n📉 2. ДАНЪЧНА РЕАЛИЗАЦИЯ НА ЗАГУБИ\nПродай губещи инвестиции, за да компенсираш печалби. Загубите намаляват облагаемия ти доход.\n\n🏠 3. БИЗНЕС РАЗХОДИ\nАко работиш на свободна практика или имаш бизнес, много разходи стават приспадаеми — лаптоп, интернет, работно пространство.' },
                highlight: { en: '⚠️ These are legal strategies used by millions. Tax evasion (hiding income) is illegal. Tax optimisation (using the rules) is smart.', bg: '⚠️ Това са законни стратегии, използвани от милиони. Данъчното укриване (скриване на доход) е незаконно. Данъчната оптимизация (използване на правилата) е умно.' },
              },
            ],
          },
          {
            id: 'tax-rpg-1', type: 'rpg_scenario', xp: 35,
            scenario: { en: 'You\'re a freelance developer earning €60,000/year. Your accountant friend tells you: "You could set up a simple business structure, deduct your laptop, home office, and courses — saving around €4,000/year in taxes. Takes 2 hours to set up." Your other friend says: "Don\'t bother, it sounds complicated." What do you do?', bg: 'Ти си фрийлансър разработчик, печелиш €60,000/година. Приятелят ти счетоводител казва: "Можеш да създадеш проста бизнес структура, да приспаднеш лаптопа, домашния офис и курсовете — спестявайки около €4,000/година данъци. Отнема 2 часа за настройка." Другият ти приятел казва: "Не си прави труда, звучи сложно." Какво правиш?' },
            avatar: '💻',
            choices: [
              {
                label: { en: 'Skip it — too complicated', bg: 'Пропусни — прекалено сложно' },
                emoji: '😴',
                consequence: { en: 'You pay €4,000 extra in taxes every year. Over 10 years that\'s €40,000 given to the government that you didn\'t have to. Your lazy friend cost you a car.', bg: 'Плащаш €4,000 допълнителни данъци всяка година. За 10 години това са €40,000 дадени на правителството, без да е трябвало. Мързеливият ти приятел те е струвал кола.' },
                cashFlowChange: -333,
                isGood: false,
              },
              {
                label: { en: 'Do it — €4,000/year saved is worth 2 hours', bg: 'Направи го — €4,000/година спестени си заслужава 2 часа' },
                emoji: '✅',
                consequence: { en: 'Smart. €4,000/year saved and invested at 8% for 20 years = €197,000. That 2-hour investment paid for your retirement.', bg: 'Умно. €4,000/година спестени и инвестирани при 8% за 20 години = €197,000. Тази 2-часова инвестиция плати за пенсионирането ти.' },
                cashFlowChange: 333,
                isGood: true,
              },
              {
                label: { en: 'Consult a real tax advisor first', bg: 'Първо се консултирай с истински данъчен съветник' },
                emoji: '🧑‍💼',
                consequence: { en: 'Excellent. The advisor confirms the strategy and finds 2 more deductions you missed. Total savings: €5,500/year. Best €300 you ever spent.', bg: 'Отлично. Съветникът потвърждава стратегията и открива още 2 приспадания, които си пропуснал. Общи спестявания: €5,500/година. Най-добрите €300, които си похарчил.' },
                cashFlowChange: 458,
                isGood: true,
              },
            ],
          },
          {
            id: 'tax-budget-1', type: 'budget_slider', xp: 30,
            income: 5000,
            categories: [
              { label: { en: 'Pension contribution (pre-tax)', bg: 'Пенсионна вноска (преди данък)' }, emoji: '🏦', min: 0, max: 1500, ideal: 500 },
              { label: { en: 'Emergency fund top-up', bg: 'Попълване на спешен фонд' }, emoji: '🛡️', min: 0, max: 1000, ideal: 300 },
              { label: { en: 'Tax-advantaged investments', bg: 'Данъчноблагоприятни инвестиции' }, emoji: '📈', min: 0, max: 2000, ideal: 700 },
              { label: { en: 'Living expenses', bg: 'Разходи за живот' }, emoji: '🏠', min: 1500, max: 3500, ideal: 2500 },
              { label: { en: 'Fun money', bg: 'Пари за забавление' }, emoji: '🎉', min: 0, max: 1000, ideal: 300 },
            ],
          },
          {
            id: 'tax-choice-1', type: 'choice', xp: 20,
            question: { en: 'You get a €10,000 bonus. Which move saves you the most tax legally?', bg: 'Получаваш бонус от €10,000. Кой ход ти спестява най-много данъци законно?' },
            options: [
              { en: 'Put it in a savings account', bg: 'Сложи го в спестовна сметка' },
              { en: 'Spend it immediately before you pay taxes', bg: 'Похарчи го незабавно преди да платиш данъци' },
              { en: 'Contribute the maximum to your pension account', bg: 'Внеси максимума в пенсионната си сметка' },
              { en: 'Invest it in crypto — no taxes there', bg: 'Инвестирай в крипто — там няма данъци' },
            ],
            correctIndex: 2,
            explanation: { en: 'Pension contributions reduce your taxable income directly. If you\'re in a 35% bracket, a €10,000 pension contribution saves €3,500 in taxes immediately — plus the money grows tax-free until retirement. Crypto is NOT tax-free in most countries.', bg: 'Пенсионните вноски директно намаляват облагаемия ти доход. Ако си в 35% скоба, вноска от €10,000 в пенсията спестява €3,500 в данъци незабавно — плюс парите растат без данък до пенсиониране. Крипто НЕ е без данъци в повечето страни.' },
          },
        ],
      },
    ],
  },
];

// Merge static + generated modules.
// Static modules take precedence — generated ones fill in IDs not already in static.
const byId = new Map<string, Module>();
for (const m of generatedModules) byId.set(m.id, m);
for (const m of staticModules) byId.set(m.id, m);
export const modules: Module[] = [...byId.values()].sort((a, b) => a.order - b.order);
