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
    | 'fill_number';        // financial calculation with tolerance
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
        icon: '🐭', xpReward: 80, order: 1,
        exercises: [
          {
            id: 'rr-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🐭',
                title: { en: 'What is the Rat Race?', bg: 'Какво е Rat Race?' },
                body: { en: 'Most people wake up, go to work, pay bills, and repeat — forever. This is called the Rat Race. You earn money, but it all disappears on expenses before you can save or invest it.', bg: 'Повечето хора се събуждат, отиват на работа, плащат сметки и повтарят — завинаги. Това е Rat Race. Печелиш пари, но всички изчезват за разходи, преди да успееш да спестиш или инвестираш.' },
                highlight: { en: '💡 Robert Kiyosaki (Rich Dad Poor Dad) says: the poor and middle class work for money — the rich make money work for them.', bg: '💡 Робърт Кийосаки (Богат татко, беден татко) казва: бедните и средната класа работят за пари — богатите карат парите да работят за тях.' },
              },
              {
                emoji: '📊',
                title: { en: 'The Cashflow Cycle', bg: 'Цикълът на паричния поток' },
                body: { en: 'Every month your money follows a path:\n\n💼 Income → 🏠 Expenses → 😓 Nothing left\n\nTo escape, you need to redirect money from expenses into ASSETS — things that generate more income without you working.', bg: 'Всеки месец парите ти следват един път:\n\n💼 Доход → 🏠 Разходи → 😓 Нищо не остава\n\nЗа да избягаш, трябва да пренасочиш пари от разходи към АКТИВИ — неща, които генерират доход без да работиш.' },
                highlight: { en: 'Assets put money IN your pocket. Liabilities take money OUT.', bg: 'Активите слагат пари В джоба ти. Пасивите вземат пари ОТ джоба ти.' },
              },
              {
                emoji: '🚀',
                title: { en: 'The Fast Track', bg: 'Бързата писта' },
                body: { en: 'The goal is to reach the Fast Track — where your passive income (from assets) exceeds your expenses. At that point, work becomes optional. Freedom!', bg: 'Целта е да достигнеш Бързата писта — където пасивният ти доход (от активи) надвишава разходите ти. На този етап работата става незадължителна. Свобода!' },
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
              { label: { en: 'Designer clothes', bg: 'Дизайнерски дрехи' }, emoji: '👗', isAsset: false },
            ],
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
          {
            id: 'rr-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'You are in the Fast Track when...', bg: 'Ти си на Бързата писта когато...' },
            options: [
              { en: 'You earn more than your friends', bg: 'Печелиш повече от приятелите си' },
              { en: 'Your passive income exceeds your monthly expenses', bg: 'Пасивният ти доход надвишава месечните ти разходи' },
              { en: 'You have a savings account', bg: 'Имаш спестовна сметка' },
              { en: 'You have no debt', bg: 'Нямаш дълг' },
            ],
            correctIndex: 1,
            explanation: { en: 'The Fast Track = passive income > expenses. Your assets generate enough money that work is optional.', bg: 'Бързата писта = пасивен доход > разходи. Активите ти генерират достатъчно пари, че работата е незадължителна.' },
          },
        ],
      },

      // ── Lesson 2: 50/30/20 Budget Simulator ──
      {
        id: 'budget-simulator',
        moduleId: 'budgeting',
        title: { en: 'Build Your Budget', bg: 'Изгради своя бюджет' },
        description: { en: 'Use the 50/30/20 rule and interactive sliders to allocate a real salary.', bg: 'Използвай правилото 50/30/20 и интерактивни плъзгачи, за да разпределиш реална заплата.' },
        icon: '⚖️', xpReward: 90, order: 2,
        exercises: [
          {
            id: 'bs-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '⚖️',
                title: { en: 'The 50/30/20 Rule', bg: 'Правилото 50/30/20' },
                body: { en: 'Senator Elizabeth Warren popularized this simple framework:\n\n• 50% → NEEDS (rent, food, transport, utilities)\n• 30% → WANTS (dining out, entertainment, hobbies)\n• 20% → SAVINGS & DEBT (emergency fund, investments, loan payments)', bg: 'Сенатор Елизабет Уорън популяризира тази проста рамка:\n\n• 50% → НУЖДИ (наем, храна, транспорт, комунални)\n• 30% → ЖЕЛАНИЯ (ресторанти, забавления, хобита)\n• 20% → СПЕСТЯВАНИЯ и ДЪЛГ (авариен фонд, инвестиции, заеми)' },
                highlight: { en: 'This works on ANY income — €1,000 or €10,000. The percentages stay the same.', bg: 'Работи при ВСЯКАКЪВ доход — €1,000 или €10,000. Процентите остават същите.' },
              },
              {
                emoji: '🧮',
                title: { en: 'Why 20% to savings?', bg: 'Защо 20% за спестявания?' },
                body: { en: 'If you save €200/month from age 25 at 7% returns, you\'ll have €525,000 by age 65. That\'s half a million — from just €200/month!\n\nMost people save 0%. The difference is enormous.', bg: 'Ако спестяваш €200/месец от 25-годишна възраст при 7% доходност, ще имаш €525,000 на 65. Това е половин милион — само от €200/месец!\n\nПовечето хора спестяват 0%. Разликата е огромна.' },
                highlight: { en: '🔑 Pay yourself first — automate savings before spending.', bg: '🔑 Плати първо на себе си — автоматизирай спестяванията преди харченето.' },
              },
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
              { label: { en: 'Savings', bg: 'Спестявания' }, emoji: '💎', min: 0, max: 1000, ideal: 600 },
            ],
          },
          {
            id: 'bs-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'It\'s the 1st of the month. Your salary of €2,800 just arrived. Your friend invites you to a luxury weekend trip for €500. Your emergency fund has only €200 in it.', bg: 'Първи е на месеца. Заплатата ти от €2,800 току-що пристигна. Приятел те кани на луксозен уикенд за €500. Аварийният ти фонд има само €200.' },
            avatar: '🧑‍💻',
            choices: [
              { label: { en: 'Go on the trip — YOLO!', bg: 'Иди на пътуването — живей сега!' }, emoji: '✈️', consequence: { en: 'Fun trip! But now you have €0 emergency fund. Next month your car breaks down and you go €800 into credit card debt at 22% interest...', bg: 'Забавно пътуване! Но вече имаш €0 в аварийния фонд. Следващия месец колата ти се разваля и влизаш в €800 дълг на кредитна карта при 22% лихва...' }, cashFlowChange: -500, isGood: false },
              { label: { en: 'Skip it, save the €500', bg: 'Откажи, спести €500' }, emoji: '💰', consequence: { en: 'Smart! You now have €700 in your emergency fund. Two months later your emergency fund covers the car repair — no stress, no debt!', bg: 'Умно! Вече имаш €700 в аварийния фонд. Два месеца по-късно аварийният фонд покрива ремонта на колата — без стрес, без дълг!' }, cashFlowChange: 500, isGood: true },
              { label: { en: 'Go, but negotiate to pay €200', bg: 'Иди, но договори да платиш €200' }, emoji: '🤝', consequence: { en: 'Good compromise! You had fun AND kept €300 toward your emergency fund. Building emergency savings while still enjoying life is smart balance.', bg: 'Добър компромис! Забавляхте се И запазихте €300 за аварийния фонд. Изграждане на спестявания докато се радваш на живота е умен баланс.' }, cashFlowChange: 300, isGood: true },
            ],
          },
          {
            id: 'bs-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'Using 50/30/20, how much of a €4,500 salary should go to savings?', bg: 'Използвайки 50/30/20, колко от заплата от €4,500 трябва да отидат за спестявания?' },
            options: [
              { en: '€450 (10%)', bg: '€450 (10%)' },
              { en: '€900 (20%)', bg: '€900 (20%)' },
              { en: '€1,350 (30%)', bg: '€1,350 (30%)' },
              { en: '€2,250 (50%)', bg: '€2,250 (50%)' },
            ],
            correctIndex: 1,
            explanation: { en: '20% of €4,500 = €900. This goes to savings, investments, and debt repayment.', bg: '20% от €4,500 = €900. Това отива за спестявания, инвестиции и изплащане на дълг.' },
          },
        ],
      },

      // ── Lesson 3: Expense Tracking RPG ──
      {
        id: 'expense-rpg',
        moduleId: 'budgeting',
        title: { en: 'The Spending Trap', bg: 'Капанът на харченето' },
        description: { en: 'Follow Alex for one month and make real spending decisions.', bg: 'Следвай Алекс за един месец и вземай реални решения за харчене.' },
        icon: '🎭', xpReward: 100, order: 3,
        exercises: [
          {
            id: 'et-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🧠',
                title: { en: 'Why We Overspend', bg: 'Защо харчим прекалено' },
                body: { en: 'Our brains are wired for instant gratification. Companies spend billions engineering products to be addictive. Every notification, sale, and "limited offer" is designed to bypass your rational thinking.\n\nTracking expenses forces your prefrontal cortex (rational brain) back in control.', bg: 'Мозъкът ни е настроен за незабавно удовлетворение. Компаниите харчат милиарди за инженерство на пристрастяващи продукти. Всяко известие, разпродажба и "ограничена оферта" е проектирано да заобиколи рационалното ти мислене.\n\nПроследяването на разходите връща контрола на префронталния кортекс (рационалния мозък).' },
                highlight: { en: '📊 People who track spending save 20% more on average than those who don\'t.', bg: '📊 Хората, които проследяват разходите, спестяват средно с 20% повече от тези, които не го правят.' },
              },
              {
                emoji: '☕',
                title: { en: 'The Latte Factor', bg: 'Ефектът на латето' },
                body: { en: 'David Bach\'s "Latte Factor": small daily purchases destroy wealth over time.\n\n€5 coffee × 365 days = €1,825/year\nInvested at 7% for 30 years = €185,000 💸\n\nThis isn\'t about giving up coffee. It\'s about making CONSCIOUS choices.', bg: 'Дейвид Бах\'с "Latte Factor": малките ежедневни покупки унищожават богатство с времето.\n\n€5 кафе × 365 дни = €1,825/година\nИнвестирани при 7% за 30 години = €185,000 💸\n\nНе става въпрос за отказ от кафе. Става въпрос за СЪЗНАТЕЛНИ избори.' },
                highlight: { en: '💡 Ask before every purchase: "Is this worth X future euros?"', bg: '💡 Питай преди всяка покупка: "Струва ли си X бъдещи евро?"' },
              },
            ],
          },
          {
            id: 'et-rpg-1',
            type: 'rpg_scenario',
            xp: 20,
            scenario: { en: 'Week 1: You\'re walking past a store. There\'s a 50% sale on a jacket you\'ve wanted. It\'s €120 (down from €240). You have €400 left in your budget for the month.', bg: 'Седмица 1: Минаваш покрай магазин. Има 50% намаление на яке, което си искал. Струва €120 (от €240). Имаш €400 останали в бюджета за месеца.' },
            avatar: '🧑‍🎤',
            choices: [
              { label: { en: 'Buy it — 50% off is a great deal!', bg: 'Купи го — 50% е страхотна сделка!' }, emoji: '🛍️', consequence: { en: 'The jacket is nice, but you spent 30% of your remaining budget. Three weeks later you run out of money and skip a friend\'s birthday dinner. Missing experiences hurts more than buying things helps.', bg: 'Якето е хубаво, но похарчи 30% от останалия бюджет. Три седмици по-късно ти свършват парите и пропускаш рождения ден на приятел. Пропускането на преживявания боли повече, отколкото покупките помагат.' }, cashFlowChange: -120, isGood: false },
              { label: { en: 'Skip it — I didn\'t plan this', bg: 'Пропусни го — не съм го планирал' }, emoji: '🚶', consequence: { en: 'You walk away. The "want" feeling fades in 20 minutes (studies confirm this). You end the month with €400 surplus which goes into your emergency fund.', bg: 'Тръгваш си. Чувството на "желание" изчезва за 20 минути (изследванията го потвърждават). Завършваш месеца с €400 излишък, който отива в аварийния фонд.' }, cashFlowChange: 0, isGood: true },
              { label: { en: 'Add it to next month\'s budget', bg: 'Добави го в бюджета за следващия месец' }, emoji: '📝', consequence: { en: 'You write it down and budget for it next month. When you return, you realize you don\'t actually want it anymore. The "24-hour rule" saved you €120!', bg: 'Записваш го и бюджетираш за следващия месец. Когато се върнеш, осъзнаваш, че вече не го искаш. "Правилото 24 часа" ти спести €120!' }, cashFlowChange: 0, isGood: true },
            ],
          },
          {
            id: 'et-rpg-2',
            type: 'rpg_scenario',
            xp: 20,
            scenario: { en: 'Week 3: You get a €400 raise! Your boss is pleased with your work. Your friend says "You should upgrade your apartment — you deserve it!"', bg: 'Седмица 3: Получаваш увеличение от €400! Шефът ти е доволен. Приятел казва: "Трябва да вземеш по-добър апартамент — заслужаваш го!"' },
            avatar: '👩‍💼',
            choices: [
              { label: { en: 'Upgrade apartment (+€400/month)', bg: 'Вземи по-добър апартамент (+€400/месец)' }, emoji: '🏡', consequence: { en: 'Your lifestyle improved, but the raise is completely absorbed by the higher rent. You\'re still at €0 savings. This is "lifestyle inflation" — the silent wealth killer.', bg: 'Начинът на живот се подобри, но увеличението е напълно погълнато от по-високия наем. Все още имаш €0 спестявания. Това е "инфлация на начина на живот" — тихият убиец на богатството.' }, cashFlowChange: 0, isGood: false },
              { label: { en: 'Save €300, treat yourself with €100', bg: 'Спести €300, наради се с €100' }, emoji: '⚖️', consequence: { en: 'Smart! You enjoy €100/month extra (nice dinners, a hobby) while €300/month goes into investments. In 10 years that €300/month becomes €52,000 at 7%.', bg: 'Умно! Радваш се на €100/месец допълнително (хубави вечери, хоби), докато €300/месец отиват в инвестиции. За 10 години тези €300/месец стават €52,000 при 7%.' }, cashFlowChange: 300, isGood: true },
              { label: { en: 'Invest ALL €400', bg: 'Инвестирай ВСИЧКИТЕ €400' }, emoji: '📈', consequence: { en: 'Disciplined! Investing the full raise is mathematically optimal. In 20 years, €400/month at 7% = €208,000. But balance is fine too — treating yourself occasionally maintains motivation.', bg: 'Дисциплинирано! Инвестирането на цялото увеличение е математически оптимално. За 20 години €400/месец при 7% = €208,000. Но балансът е добре — да се радваш понякога поддържа мотивацията.' }, cashFlowChange: 400, isGood: true },
            ],
          },
          {
            id: 'et-fill-1',
            type: 'fill_blank',
            xp: 15,
            question: { en: 'Alex earns €3,200/month and spends €2,750. His monthly surplus is €___', bg: 'Алекс печели €3,200/месец и харчи €2,750. Месечният му излишък е €___' },
            correctAnswer: 450, answerMin: 445, answerMax: 455, answerUnit: '€',
            explanation: { en: '€3,200 − €2,750 = €450. This surplus should go to savings/investments — not lifestyle upgrades!', bg: '€3,200 − €2,750 = €450. Този излишък трябва да отиде за спестявания/инвестиции — не за подобрения на начина на живот!' },
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
  // ─────────────────────────────────────────────
  {
    id: 'saving',
    title: { en: 'Saving Smart', bg: 'Умно спестяване' },
    description: { en: 'Build your safety net and harness compound interest.', bg: 'Изгради финансова мрежа и използвай сложната лихва.' },
    icon: '💎', color: 'blue', order: 2,
    lessons: [
      {
        id: 'emergency-fund',
        moduleId: 'saving',
        title: { en: 'Your Financial Airbag', bg: 'Финансовата ти въздушна възглавница' },
        description: { en: 'Why an emergency fund is the most important first step.', bg: 'Защо аварийният фонд е най-важната първа стъпка.' },
        icon: '🛡️', xpReward: 80, order: 1,
        exercises: [
          {
            id: 'ef-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '💥',
                title: { en: 'Life Happens', bg: 'Животът се случва' },
                body: { en: 'Car breaks down. Medical bill. Job loss. Roof leaks.\n\nWithout an emergency fund, ANY unexpected expense sends you into debt. Studies show 40% of Americans cannot cover a €400 emergency without borrowing.\n\nAn emergency fund is not an investment — it\'s insurance.', bg: 'Колата се разваля. Медицинска сметка. Загуба на работа. Покривът тече.\n\nБез авариен фонд, ВСЕКИ неочакван разход те вкарва в дълг. Проучванията показват, че 40% от американците не могат да покрият €400 аварийна ситуация без заем.\n\nАварийният фонд не е инвестиция — той е застраховка.' },
                highlight: { en: '🎯 Goal: 3–6 months of expenses in a HIGH-YIELD savings account, always accessible.', bg: '🎯 Цел: 3–6 месеца разходи в спестовна сметка с ВИСОКА ЛИХВА, винаги достъпни.' },
              },
              {
                emoji: '🏗️',
                title: { en: 'How to Build It Fast', bg: 'Как да го изградиш бързо' },
                body: { en: 'Step 1: Open a separate high-yield savings account (2–5% APY)\nStep 2: Automate a fixed transfer on payday\nStep 3: Add any windfalls (bonuses, tax refunds)\nStep 4: Never touch it except for real emergencies\n\nStart with €500 as a "starter" fund, then build to 3 months.', bg: 'Стъпка 1: Отвори отделна спестовна сметка с висока лихва (2–5% ГПР)\nСтъпка 2: Автоматизирай фиксиран превод на ден на заплата\nСтъпка 3: Добавяй всякакви извънредни доходи (бонуси, данъчни възстановявания)\nСтъпка 4: Никога не го докосвай освен за истински аварии\n\nЗапочни с €500 като "стартов" фонд, след това изгради до 3 месеца.' },
                highlight: { en: '💡 Keep emergency fund SEPARATE from checking — out of sight, out of mind.', bg: '💡 Дръж аварийния фонд ОТДЕЛНО от разплащателната сметка — извън погледа, извън ума.' },
              },
            ],
          },
          {
            id: 'ef-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'Your car breaks down. Repair cost: €1,200. You have two options based on your financial situation.', bg: 'Колата ти се разваля. Цена за ремонт: €1,200. Имаш два варианта въз основа на финансовото си положение.' },
            avatar: '🔧',
            choices: [
              { label: { en: 'Situation A: I have a €3,000 emergency fund', bg: 'Ситуация А: Имам €3,000 авариен фонд' }, emoji: '✅', consequence: { en: 'You pay €1,200, fund drops to €1,800. Stressful? A little. But NO debt, NO interest, NO panic. You rebuild the fund over the next 3 months. This is what financial resilience looks like.', bg: 'Плащаш €1,200, фондът пада до €1,800. Стресиращо? Малко. Но НЕМ дълг, НЕМ лихва, НЕМ паника. Възстановяваш фонда за следващите 3 месеца. Така изглежда финансовата устойчивост.' }, cashFlowChange: 1800, isGood: true },
              { label: { en: 'Situation B: I have €0 savings, use credit card at 22% APR', bg: 'Ситуация Б: Имам €0 спестявания, използвам кредитна карта при 22% ГПР' }, emoji: '💳', consequence: { en: 'You charge €1,200 at 22%. If you pay €100/month, it takes 14 months and costs €1,475 total — €275 extra in pure interest. Plus the stress of debt hanging over you.', bg: 'Натоварваш €1,200 при 22%. Ако плащаш €100/месец, отнема 14 месеца и струва общо €1,475 — €275 допълнително в чиста лихва. Плюс стреса от висящия дълг.' }, cashFlowChange: -275, isGood: false },
            ],
          },
          {
            id: 'ef-fill-1',
            type: 'fill_blank',
            xp: 15,
            question: { en: 'Your monthly expenses are €2,400. A 3-month emergency fund requires €___', bg: 'Месечните ти разходи са €2,400. 3-месечен авариен фонд изисква €___' },
            correctAnswer: 7200, answerMin: 7100, answerMax: 7300, answerUnit: '€',
            explanation: { en: '€2,400 × 3 = €7,200. Start with a €500 "baby fund" and build up gradually.', bg: '€2,400 × 3 = €7,200. Започни с €500 "бебешки фонд" и изгради постепенно.' },
          },
          {
            id: 'ef-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'Where should you keep your emergency fund?', bg: 'Където трябва да държиш аварийния си фонд?' },
            options: [
              { en: 'Stock market (for higher returns)', bg: 'Фондова борса (за по-висока доходност)' },
              { en: 'High-yield savings account', bg: 'Спестовна сметка с висока лихва' },
              { en: 'Cash at home under the mattress', bg: 'Пари в брой вкъщи под матрака' },
              { en: 'Cryptocurrency', bg: 'Криптовалута' },
            ],
            correctIndex: 1,
            explanation: { en: 'Emergency funds need to be SAFE and ACCESSIBLE. Stocks can drop 40% right when you need the money. Cash loses value to inflation. High-yield savings = best balance.', bg: 'Аварийните фондове трябва да са БЕЗОПАСНИ и ДОСТЪПНИ. Акциите могат да паднат с 40% точно когато имаш нужда от парите. Парите в брой губят стойност поради инфлация. Спестовна сметка с висока лихва = най-добър баланс.' },
          },
        ],
      },
      {
        id: 'compound-magic',
        moduleId: 'saving',
        title: { en: 'Money Growing on Trees', bg: 'Пари, израстващи на дървета' },
        description: { en: 'See compound interest in action — the most powerful force in finance.', bg: 'Виж сложната лихва в действие — най-мощната сила в финансите.' },
        icon: '✨', xpReward: 90, order: 2,
        exercises: [
          {
            id: 'cm-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🌱',
                title: { en: 'Compound Interest: The 8th Wonder', bg: 'Сложна лихва: Осмото чудо' },
                body: { en: 'Einstein allegedly called compound interest "the 8th wonder of the world."\n\nSimple interest: earn interest only on principal\nCompound interest: earn interest on principal PLUS all previous interest\n\nYear 1: €1,000 → €1,070\nYear 2: €1,070 → €1,145 (not €1,140!)\nYear 10: €1,000 → €1,967\nYear 30: €1,000 → €7,612 🤯', bg: 'Айнщайн уж нарекъл сложната лихва "осмото чудо на света."\n\nПроста лихва: печелиш лихва само върху главницата\nСложна лихва: печелиш лихва върху главницата ПЛЮС всички предишни лихви\n\nГодина 1: €1,000 → €1,070\nГодина 2: €1,070 → €1,145 (не €1,140!)\nГодина 10: €1,000 → €1,967\nГодина 30: €1,000 → €7,612 🤯' },
                highlight: { en: '⏰ Time is the most important variable. Starting 10 years earlier can DOUBLE your final wealth.', bg: '⏰ Времето е най-важната променлива. Започването с 10 години по-рано може да УДВОИ крайното богатство.' },
              },
              {
                emoji: '👶',
                title: { en: 'The Early Bird Wins', bg: 'Ранната птица печели' },
                body: { en: 'Anna (age 25): invests €200/month for 10 years then STOPS. Total invested: €24,000\nBob (age 35): invests €200/month for 30 years. Total invested: €72,000\n\nAt age 65 at 7% returns:\n• Anna: €602,000 💰\n• Bob: €243,000 💸\n\nAnna invested 3× LESS money but ended with 2.5× MORE — purely due to time.', bg: 'Анна (25 г.): инвестира €200/месец за 10 години после СПИРА. Общо инвестирано: €24,000\nБоб (35 г.): инвестира €200/месец за 30 години. Общо инвестирано: €72,000\n\nНа 65 г. при 7% доходност:\n• Анна: €602,000 💰\n• Боб: €243,000 💸\n\nАнна инвестира 3× ПО-МАЛКО пари но завърши с 2.5× ПОВЕЧЕ — чисто заради времето.' },
                highlight: { en: '🎯 The best time to invest was 10 years ago. The second best time is TODAY.', bg: '🎯 Най-доброто време за инвестиране беше преди 10 години. Второто най-добро е ДНЕС.' },
              },
            ],
          },
          {
            id: 'cm-simulator-1',
            type: 'compound_sim',
            xp: 30,
            compoundConfig: {
              defaultPrincipal: 1000,
              defaultRate: 7,
              defaultYears: 20,
              defaultMonthly: 200,
            },
          },
          {
            id: 'cm-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'Rule of 72: At 6% annual returns, your money doubles in approximately how many years?', bg: 'Правило 72: При 6% годишна доходност, парите ти се удвояват приблизително за колко години?' },
            options: [
              { en: '6 years', bg: '6 години' },
              { en: '8 years', bg: '8 години' },
              { en: '12 years', bg: '12 години' },
              { en: '18 years', bg: '18 години' },
            ],
            correctIndex: 2,
            explanation: { en: '72 ÷ 6 = 12 years. The Rule of 72 is a mental shortcut: divide 72 by the interest rate to find doubling time.', bg: '72 ÷ 6 = 12 години. Правилото 72 е умствен пряк път: раздели 72 на лихвения процент, за да намериш времето за удвояване.' },
          },
        ],
      },
      {
        id: 'saving-habits',
        moduleId: 'saving',
        title: { en: 'Saving on Autopilot', bg: 'Спестяване на автопилот' },
        description: { en: 'Remove willpower from the equation with smart automation.', bg: 'Премахни волята от уравнението с умна автоматизация.' },
        icon: '🤖', xpReward: 80, order: 3,
        exercises: [
          {
            id: 'sh-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🤖',
                title: { en: 'Automate Everything', bg: 'Автоматизирай всичко' },
                body: { en: 'Willpower is finite. Every decision depletes it. The solution? Remove decisions entirely.\n\n"Pay yourself first" = automatically transfer savings on payday, before you can spend it.\n\nSet up:\n✅ Auto-transfer to savings: payday +1 day\n✅ Auto-invest to index fund: payday +2 days\n✅ Auto-pay bills: no late fees ever', bg: 'Волята е ограничена. Всяко решение я изчерпва. Решението? Премахни решенията напълно.\n\n"Плати първо на себе си" = автоматично прехвърляй спестявания в деня на заплатата, преди да можеш да ги похарчиш.\n\nНастрой:\n✅ Авто-превод към спестявания: ден на заплата +1 ден\n✅ Авто-инвестиция в индексен фонд: ден на заплата +2 дни\n✅ Авто-плащане на сметки: никога повече закъснели такси' },
                highlight: { en: '🔑 Automation removes emotion from finance. You can\'t spend money you never see.', bg: '🔑 Автоматизацията премахва емоциите от финансите. Не можеш да похарчиш пари, които никога не виждаш.' },
              },
            ],
          },
          {
            id: 'sh-budget-1',
            type: 'budget_slider',
            xp: 25,
            income: 2500,
            categories: [
              { label: { en: 'Fixed Needs (rent, bills)', bg: 'Фиксирани нужди (наем, сметки)' }, emoji: '🏠', min: 0, max: 1500, ideal: 850 },
              { label: { en: 'Variable Needs (food, transport)', bg: 'Променливи нужди (храна, транспорт)' }, emoji: '🛒', min: 0, max: 800, ideal: 450 },
              { label: { en: 'Wants (fun, dining)', bg: 'Желания (забавления, ресторанти)' }, emoji: '🎉', min: 0, max: 600, ideal: 450 },
              { label: { en: 'Emergency Fund', bg: 'Авариен фонд' }, emoji: '🛡️', min: 0, max: 500, ideal: 250 },
              { label: { en: 'Investments', bg: 'Инвестиции' }, emoji: '📈', min: 0, max: 500, ideal: 250 },
            ],
          },
          {
            id: 'sh-rpg-1',
            type: 'rpg_scenario',
            xp: 20,
            scenario: { en: 'You set up automatic savings of €300/month. After 6 months you have €1,800 saved! Your friend suggests using it to buy the latest gaming console + games (€600) and a weekend trip (€400). That leaves €800. "You worked hard, you deserve it!"', bg: 'Настройваш автоматични спестявания от €300/месец. След 6 месеца имаш €1,800 спестени! Приятел предлага да използваш парите за последната игрална конзола + игри (€600) и уикенд пътуване (€400). Остават €800. "Работи усилено, заслужаваш си!"' },
            avatar: '🎮',
            choices: [
              { label: { en: 'Yes! I earned this money for fun', bg: 'Да! Спечелих тези пари за забавление' }, emoji: '🎮', consequence: { en: 'Fun month! But that was your emergency fund. A week later your laptop dies for work. You need €700 — back to credit card debt. The savings are gone in one emotional weekend.', bg: 'Забавен месец! Но това беше аварийният ти фонд. Седмица по-късно лаптопът ти умира за работа. Нужни са ти €700 — обратно към дълг с кредитна карта. Спестяванията изчезват за един емоционален уикенд.' }, cashFlowChange: -1000, isGood: false },
              { label: { en: 'No — this is my emergency fund', bg: 'Не — това е аварийният ми фонд' }, emoji: '🛡️', consequence: { en: 'You explain that €1,800 is your emergency fund target (3×€600 monthly expenses). You suggest a more affordable weekend (€150). Your friend respects your discipline. Emergency fund stays intact.', bg: 'Обясняваш, че €1,800 е целта на аварийния фонд (3×€600 месечни разходи). Предлагаш по-достъпен уикенд (€150). Приятелят ти уважава дисциплината ти. Аварийният фонд остава непокътнат.' }, cashFlowChange: 1800, isGood: true },
            ],
          },
          {
            id: 'sh-sort-1',
            type: 'sort_items',
            xp: 20,
            sortItems: [
              { label: { en: 'Automatic monthly savings transfer', bg: 'Автоматичен месечен превод за спестявания' }, emoji: '🤖', isAsset: true },
              { label: { en: 'Impulse buying during sales', bg: 'Импулсивно купуване по намаления' }, emoji: '🛍️', isAsset: false },
              { label: { en: 'High-yield savings account', bg: 'Спестовна сметка с висока лихва' }, emoji: '🏦', isAsset: true },
              { label: { en: 'Multiple streaming subscriptions unused', bg: 'Множество неизползвани стрийминг абонаменти' }, emoji: '📺', isAsset: false },
              { label: { en: 'Emergency fund (3–6 months)', bg: 'Авариен фонд (3–6 месеца)' }, emoji: '🛡️', isAsset: true },
              { label: { en: 'Daily coffee shop habit', bg: 'Ежедневен навик за кафе' }, emoji: '☕', isAsset: false },
            ],
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 3 — INVESTING
  // ─────────────────────────────────────────────
  {
    id: 'investing',
    title: { en: 'Investing 101', bg: 'Инвестиции 101' },
    description: { en: 'Put your money to work through smart investing.', bg: 'Накарай парите си да работят чрез умно инвестиране.' },
    icon: '📈', color: 'purple', order: 3,
    lessons: [
      {
        id: 'stocks-bonds',
        moduleId: 'investing',
        title: { en: 'Stocks, Bonds & the Market', bg: 'Акции, облигации и пазарът' },
        description: { en: 'Understand the two most common investments — and which to use when.', bg: 'Разбери двата най-разпространени вида инвестиции — и кога да използваш кой.' },
        icon: '🏛️', xpReward: 80, order: 1,
        exercises: [
          {
            id: 'sb-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '📊',
                title: { en: 'What is a Stock?', bg: 'Какво е акция?' },
                body: { en: 'A stock = a tiny piece of ownership in a company.\n\nWhen Apple makes profit → shareholders get richer\nWhen Apple struggles → shareholders lose value\n\nHistorically the S&P 500 (top 500 US companies) has returned ~10% annually since 1926. €10,000 invested in 1990 would be ~€190,000 today.', bg: 'Акция = малко парче собственост в компания.\n\nКогато Apple прави печалба → акционерите забогатяват\nКогато Apple се бори → акционерите губят стойност\n\nИсторически S&P 500 (топ 500 американски компании) е връщал ~10% годишно от 1926 г. €10,000 инвестирани през 1990 г. биха били ~€190,000 днес.' },
                highlight: { en: '📈 Stocks = OWNERSHIP. Higher risk, higher long-term reward.', bg: '📈 Акции = СОБСТВЕНОСТ. По-висок риск, по-висока дългосрочна награда.' },
              },
              {
                emoji: '🔒',
                title: { en: 'What is a Bond?', bg: 'Какво е облигация?' },
                body: { en: 'A bond = a loan you make to a company or government.\n\nThey promise to pay you back PLUS regular interest (coupon payments). More predictable than stocks, but lower returns.\n\nUse bonds to:\n• Reduce portfolio volatility\n• Protect wealth near retirement\n• Balance your stock allocation', bg: 'Облигация = заем, който правиш на компания или правителство.\n\nТе обещават да ти върнат парите ПЛЮС редовна лихва (купонни плащания). По-предсказуеми от акциите, но по-ниска доходност.\n\nИзползвай облигации за:\n• Намаляване на волатилността на портфейла\n• Защита на богатство близо до пенсиониране\n• Балансиране на разпределението на акции' },
                highlight: { en: '🔒 Bonds = LOANS. Lower risk, lower reward. Great ballast for a portfolio.', bg: '🔒 Облигации = ЗАЕМИ. По-нисък риск, по-ниска награда. Добър баласт за портфейл.' },
              },
              {
                emoji: '🎯',
                title: { en: 'Asset Allocation by Age', bg: 'Разпределение на активите по възраст' },
                body: { en: 'Simple rule: your bond % ≈ your age\n\nAge 25 → 25% bonds, 75% stocks\nAge 45 → 45% bonds, 55% stocks\nAge 65 → 65% bonds, 35% stocks\n\nWhy? Young investors have TIME to recover from crashes. Older investors need stability.', bg: 'Прост правило: % облигации ≈ възрастта ти\n\nВъзраст 25 → 25% облигации, 75% акции\nВъзраст 45 → 45% облигации, 55% акции\nВъзраст 65 → 65% облигации, 35% акции\n\nЗащо? Младите инвеститори имат ВРЕМЯ да се възстановят от сривове. По-старите инвеститори се нуждаят от стабилност.' },
                highlight: { en: '⏰ The younger you are, the more risk you can afford to take.', bg: '⏰ Колкото по-млад си, толкова повече риск можеш да си позволиш.' },
              },
            ],
          },
          {
            id: 'sb-sort-1',
            type: 'sort_items',
            xp: 20,
            sortItems: [
              { label: { en: 'S&P 500 index fund', bg: 'Индексен фонд S&P 500' }, emoji: '📊', isAsset: true },
              { label: { en: 'Payday loan to a friend', bg: 'Бърз заем на приятел' }, emoji: '💸', isAsset: false },
              { label: { en: 'Government bond', bg: 'Държавна облигация' }, emoji: '📜', isAsset: true },
              { label: { en: 'Brand new depreciating car', bg: 'Нова обезценяваща се кола' }, emoji: '🚙', isAsset: false },
              { label: { en: 'Dividend-paying stocks', bg: 'Акции с дивиденти' }, emoji: '💰', isAsset: true },
              { label: { en: 'Timeshare vacation property', bg: 'Ваканционен имот на таймшер' }, emoji: '🏖️', isAsset: false },
            ],
          },
          {
            id: 'sb-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'You\'ve saved €5,000 and want to invest it. Your cousin says "Put it ALL in Tesla — it\'s going to 10× !" Your financial advisor says "Spread it across an index fund."', bg: 'Спестил си €5,000 и искаш да ги инвестираш. Братовчед ти казва: "Сложи ВСИЧКО в Tesla — ще се 10× !" Финансовият ти съветник казва: "Разпредели ги в индексен фонд."' },
            avatar: '🤔',
            choices: [
              { label: { en: 'All in Tesla — high risk, high reward!', bg: 'Всичко в Tesla — висок риск, висока награда!' }, emoji: '🎰', consequence: { en: 'Tesla dropped 65% in 2022. Your €5,000 becomes €1,750. This is not investing — it\'s gambling. Single-stock concentration is one of the biggest wealth destroyers.', bg: 'Tesla падна с 65% през 2022 г. €5,000 стават €1,750. Това не е инвестиране — това е хазарт. Концентрацията в една акция е един от най-големите унищожители на богатство.' }, cashFlowChange: -3250, isGood: false },
              { label: { en: 'Index fund — diversified and steady', bg: 'Индексен фонд — диверсифициран и стабилен' }, emoji: '📊', consequence: { en: 'Smart! Spread across 500 companies, your €5,000 follows the broad market. Even after the 2022 crash (-19%), you recover within 18 months. At 7% average, in 20 years: ~€19,000.', bg: 'Умно! Разпределени между 500 компании, €5,000 следват широкия пазар. Дори след срива от 2022 г. (-19%), се възстановяваш за 18 месеца. При средно 7%, за 20 години: ~€19,000.' }, cashFlowChange: 14000, isGood: true },
              { label: { en: 'Split: 80% index, 20% Tesla', bg: 'Раздели: 80% индекс, 20% Tesla' }, emoji: '⚖️', consequence: { en: 'Reasonable compromise. Your €1,000 Tesla position is a calculated bet, while €4,000 in index funds gives stability. Keep speculative positions under 10–20% of portfolio.', bg: 'Разумен компромис. Позицията ти от €1,000 в Tesla е изчислен залог, докато €4,000 в индексни фондове дава стабилност. Дръж спекулативни позиции под 10–20% от портфейла.' }, cashFlowChange: 8000, isGood: true },
            ],
          },
          {
            id: 'sb-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'Why do most actively managed funds underperform index funds over 15+ years?', bg: 'Защо повечето активно управлявани фондове се представят по-зле от индексните фондове за 15+ години?' },
            options: [
              { en: 'Fund managers are not smart enough', bg: 'Мениджърите на фондове не са достатъчно умни' },
              { en: 'High fees + inability to consistently beat the market', bg: 'Високи такси + невъзможност постоянно да победят пазара' },
              { en: 'Index funds cheat somehow', bg: 'Индексните фондове по някакъв начин мамят' },
              { en: 'Active funds focus only on bonds', bg: 'Активните фондове се фокусират само върху облигации' },
            ],
            correctIndex: 1,
            explanation: { en: 'Even brilliant managers can\'t consistently predict the market. Their fees (1–2%/year) compound against you. Index funds charge ~0.05% — the difference is enormous over decades.', bg: 'Дори брилянтните мениджъри не могат постоянно да предсказват пазара. Таксите им (1–2%/годишно) се натрупват срещу теб. Индексните фондове таксуват ~0.05% — разликата е огромна за десетилетия.' },
          },
        ],
      },
      {
        id: 'index-funds',
        moduleId: 'investing',
        title: { en: 'The Index Fund Strategy', bg: 'Стратегията с индексни фондове' },
        description: { en: 'The simple investing strategy that beats 90% of professionals.', bg: 'Простата инвестиционна стратегия, която побеждава 90% от професионалистите.' },
        icon: '📊', xpReward: 90, order: 2,
        exercises: [
          {
            id: 'if-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🏆',
                title: { en: 'Why Index Funds Win', bg: 'Защо индексните фондове печелят' },
                body: { en: 'An index fund buys ALL stocks in a market index. No manager picking stocks — just the entire market.\n\nResult: ~10% average annual return over decades\nFee: as low as 0.03% (vs 1–2% for active funds)\n\nOver 30 years, a 2% fee difference on €100,000 = €250,000 LOST in fees alone. The fee gap is the biggest hidden cost in investing.', bg: 'Индексен фонд купува ВСИЧКИ акции в пазарен индекс. Без мениджър, избиращ акции — само целият пазар.\n\nРезултат: ~10% средна годишна доходност за десетилетия\nТакса: толкова ниска като 0.03% (срещу 1–2% за активни фондове)\n\nЗа 30 години разликата от 2% такса при €100,000 = €250,000 ЗАГУБЕНИ само в такси. Разликата в таксите е най-голямата скрита цена при инвестирането.' },
                highlight: { en: '"Don\'t look for the needle in the haystack. Just buy the haystack." — Jack Bogle, Vanguard founder', bg: '"Не търсете иглата в купата сено. Просто купете купата сено." — Джак Богъл, основател на Vanguard' },
              },
              {
                emoji: '💪',
                title: { en: 'Dollar-Cost Averaging', bg: 'Осредняване на разходите в долари' },
                body: { en: 'Don\'t try to time the market. Instead: invest a fixed amount EVERY month, no matter what.\n\nMarket up? You buy fewer shares (expensive)\nMarket down? You buy MORE shares (on sale! 🛍️)\n\nOver time, this automatically averages out your purchase price and removes emotion from investing.', bg: 'Не се опитвай да намериш правилния момент за пазара. Вместо това: инвестирай фиксирана сума ВСЕКИ месец, независимо от всичко.\n\nПазар нагоре? Купуваш по-малко акции (скъпо)\nПазар надолу? Купуваш ПОВЕЧЕ акции (на разпродажба! 🛍️)\n\nС времето това автоматично осреднява цената на покупка и премахва емоциите от инвестирането.' },
                highlight: { en: '📅 Time in the market beats timing the market — every single time.', bg: '📅 Времето на пазара побеждава тайминга на пазара — всеки един път.' },
              },
            ],
          },
          {
            id: 'if-compound-1',
            type: 'compound_sim',
            xp: 30,
            compoundConfig: {
              defaultPrincipal: 0,
              defaultRate: 8,
              defaultYears: 30,
              defaultMonthly: 300,
            },
          },
          {
            id: 'if-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'March 2020: COVID crashes the market -34% in 3 weeks. Your €20,000 portfolio is now worth €13,200. CNBC says "WORST CRASH SINCE 2008." Your stomach is in knots.', bg: 'Март 2020: COVID срива пазара с -34% за 3 седмици. Портфейлът ти от €20,000 е вече €13,200. CNBC казва: "НАЙ-ЛОШИЯТ СРИВ ОТ 2008." Стомахът ти е на възел.' },
            avatar: '😰',
            choices: [
              { label: { en: 'SELL everything — protect what\'s left!', bg: 'ПРОДАЙ всичко — защити каквото е останало!' }, emoji: '🚨', consequence: { en: 'You sell at €13,200 (a €6,800 loss). The market recovers 100% by August 2020 — 5 months later. You locked in your loss and missed the entire recovery. This is panic selling — the #1 investing mistake.', bg: 'Продаваш при €13,200 (загуба от €6,800). Пазарът се възстановява с 100% до август 2020 г. — 5 месеца по-късно. Заключи загубата си и пропусна цялото възстановяване. Това е паническа продажба — грешка #1 при инвестирането.' }, cashFlowChange: -6800, isGood: false },
              { label: { en: 'Hold and keep my monthly investment', bg: 'Дръж и продължи месечната инвестиция' }, emoji: '💪', consequence: { en: 'You held. You also bought shares at -34% discount for 3 months. By year-end your portfolio recovered to €21,500 — more than before the crash! Staying the course is how wealth is built.', bg: 'Държа. Купи и акции при -34% отстъпка за 3 месеца. До края на годината портфейлът се възстанови до €21,500 — повече от преди срива! Придържането към курса е начинът за изграждане на богатство.' }, cashFlowChange: 1500, isGood: true },
              { label: { en: 'Buy MORE — everything is on sale!', bg: 'Купи ПОВЕЧЕ — всичко е на разпродажба!' }, emoji: '🛍️', consequence: { en: 'Bold move! You invested extra €3,000 during the crash. By year-end you gained €8,000 on those shares alone. Market crashes are the greatest wealth transfer opportunities for disciplined investors.', bg: 'Смел ход! Инвестира допълнителни €3,000 по време на срива. До края на годината спечели €8,000 само от тези акции. Пазарните сривове са най-голямата възможност за трансфер на богатство за дисциплинирани инвеститори.' }, cashFlowChange: 8000, isGood: true },
            ],
          },
        ],
      },
      {
        id: 'portfolio-building',
        moduleId: 'investing',
        title: { en: 'Build Your First Portfolio', bg: 'Изгради първия си портфейл' },
        description: { en: 'Practical steps to start investing — even with €50/month.', bg: 'Практически стъпки за начало на инвестиране — дори с €50/месец.' },
        icon: '🎯', xpReward: 100, order: 3,
        exercises: [
          {
            id: 'pb-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🗺️',
                title: { en: 'The Investment Pyramid', bg: 'Инвестиционната пирамида' },
                body: { en: 'Build in order — don\'t skip steps:\n\n🏔️ Layer 1 (Base): Emergency fund (3–6 months)\n💎 Layer 2: Pay off high-interest debt (>7%)\n📈 Layer 3: Tax-advantaged accounts (pension, ISA)\n🚀 Layer 4: Index funds & ETFs\n⚡ Layer 5 (Top): Individual stocks, crypto (<10%)\n\nMost people skip to Layer 5 and wonder why they\'re not wealthy.', bg: 'Изграждай по ред — не прескачай стъпки:\n\n🏔️ Слой 1 (База): Авариен фонд (3–6 месеца)\n💎 Слой 2: Изплати дълг с висока лихва (>7%)\n📈 Слой 3: Данъчно облекчени сметки (пенсия, ИСА)\n🚀 Слой 4: Индексни фондове и ETF\n⚡ Слой 5 (Връх): Индивидуални акции, крипто (<10%)\n\nПовечето хора прескачат до Слой 5 и се чудят защо не са богати.' },
                highlight: { en: '🎯 You can start with as little as €10/month in fractional ETF shares.', bg: '🎯 Можеш да започнеш с толкова малко като €10/месец в дробни ETF акции.' },
              },
              {
                emoji: '🔄',
                title: { en: 'Rebalancing: Stay on Track', bg: 'Ребалансиране: Остани на курса' },
                body: { en: 'After market movements, your allocation drifts:\n\nTarget: 80% stocks, 20% bonds\nAfter bull market: 90% stocks, 10% bonds (too risky!)\n\nRebalancing = selling some stocks, buying bonds to return to target.\n\nDo this ONCE A YEAR. More frequently = more fees, more tax events.', bg: 'След пазарни движения разпределението ти се отклонява:\n\nЦел: 80% акции, 20% облигации\nСлед бичи пазар: 90% акции, 10% облигации (прекалено рисково!)\n\nРебалансиране = продаване на малко акции, купуване на облигации за връщане към целта.\n\nПрави това ВЕДНЪЖ ГОДИШНО. По-често = повече такси, повече данъчни събития.' },
                highlight: { en: '📅 Set a calendar reminder: "Rebalance portfolio" — December 31st every year.', bg: '📅 Постави напомняне в календара: "Ребалансиране на портфейл" — 31 декември всяка година.' },
              },
            ],
          },
          {
            id: 'pb-budget-1',
            type: 'budget_slider',
            xp: 25,
            income: 1000,
            categories: [
              { label: { en: 'Emergency Fund', bg: 'Авариен фонд' }, emoji: '🛡️', min: 0, max: 400, ideal: 150 },
              { label: { en: 'Index Fund ETF', bg: 'Индексен фонд ETF' }, emoji: '📊', min: 0, max: 600, ideal: 400 },
              { label: { en: 'Individual Stocks (<10%)', bg: 'Индивидуални акции (<10%)' }, emoji: '🎯', min: 0, max: 200, ideal: 100 },
              { label: { en: 'Bonds', bg: 'Облигации' }, emoji: '📜', min: 0, max: 300, ideal: 200 },
              { label: { en: 'Cash Reserve', bg: 'Кешов резерв' }, emoji: '💵', min: 0, max: 200, ideal: 150 },
            ],
          },
          {
            id: 'pb-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'You\'re 30 years old investing for retirement. Market drops 40%. What should you do?', bg: 'На 30 години си и инвестираш за пенсиониране. Пазарът пада с 40%. Какво трябва да правиш?' },
            options: [
              { en: 'Sell everything to avoid more losses', bg: 'Продай всичко, за да избегнеш повече загуби' },
              { en: 'Do nothing — or buy more at lower prices', bg: 'Не правиш нищо — или купи повече на по-ниски цени' },
              { en: 'Move everything to bonds immediately', bg: 'Премести всичко в облигации веднага' },
              { en: 'Put everything in cash until markets recover', bg: 'Сложи всичко в кеш, докато пазарите се възстановят' },
            ],
            correctIndex: 1,
            explanation: { en: 'At 30, you have 35 years until retirement. Every major market crash in history has recovered. Selling locks in losses. Buying more at lower prices accelerates wealth building.', bg: 'На 30 години имаш 35 години до пенсиониране. Всеки голям пазарен срив в историята се е възстановил. Продаването заключва загубите. Купуването на повече на по-ниски цени ускорява изграждането на богатство.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // MODULE 4 — CREDIT & DEBT
  // ─────────────────────────────────────────────
  {
    id: 'credit-debt',
    title: { en: 'Credit & Debt Mastery', bg: 'Майсторство в кредити и дълг' },
    description: { en: 'Master credit scores, escape the debt trap, and use leverage wisely.', bg: 'Овладей кредитните рейтинги, избягай от капана на дълга и използвай ливъридж мъдро.' },
    icon: '🏦', color: 'orange', order: 4,
    lessons: [
      {
        id: 'credit-scores',
        moduleId: 'credit-debt',
        title: { en: 'Your Credit Score Decoded', bg: 'Кредитният ти рейтинг декодиран' },
        description: { en: 'What it is, what impacts it, and how to improve it.', bg: 'Какво е, какво влияе и как да го подобриш.' },
        icon: '⭐', xpReward: 80, order: 1,
        exercises: [
          {
            id: 'cs-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '🔢',
                title: { en: 'What is a Credit Score?', bg: 'Какво е кредитен рейтинг?' },
                body: { en: 'A credit score (300–850) is a number that predicts how likely you are to repay debt.\n\n300–579: Poor 😞\n580–669: Fair\n670–739: Good ✅\n740–799: Very Good 🌟\n800–850: Exceptional 💎\n\nLenders use it to set interest rates. A 750 score vs 600 score on a €200,000 mortgage = €80,000 difference in total interest!', bg: 'Кредитният рейтинг (300–850) е число, което предсказва колко вероятно е да върнеш дълг.\n\n300–579: Лош 😞\n580–669: Задоволителен\n670–739: Добър ✅\n740–799: Много добър 🌟\n800–850: Изключителен 💎\n\nКредиторите го използват за определяне на лихвени проценти. Рейтинг 750 срещу 600 при ипотека €200,000 = €80,000 разлика в общата лихва!' },
                highlight: { en: '📊 5 Factors: Payment History (35%) → Utilization (30%) → Length (15%) → Mix (10%) → New Credit (10%)', bg: '📊 5 фактора: История на плащанията (35%) → Усвояване (30%) → Дължина (15%) → Микс (10%) → Нов кредит (10%)' },
              },
              {
                emoji: '🛠️',
                title: { en: 'How to Improve Your Score', bg: 'Как да подобриш рейтинга си' },
                body: { en: '1️⃣ Always pay on time (even just the minimum)\n2️⃣ Keep utilization below 30% (ideally <10%)\n3️⃣ Don\'t close old cards — length matters\n4️⃣ Don\'t apply for many cards at once\n5️⃣ Have a mix: credit card + installment loan\n\nImproving takes 6–12 months of good behavior. Damage can take 7 years to fall off.', bg: '1️⃣ Винаги плащай навреме (дори само минимума)\n2️⃣ Дръж усвояването под 30% (в идеалния случай <10%)\n3️⃣ Не затваряй стари карти — дължината има значение\n4️⃣ Не кандидатствай за много карти наведнъж\n5️⃣ Имай микс: кредитна карта + разсрочен заем\n\nПодобряването отнема 6–12 месеца добро поведение. Щетите може да отнеме 7 години да изчезнат.' },
                highlight: { en: '💡 Set up autopay for at least the minimum on every credit card. One missed payment can drop your score 100 points.', bg: '💡 Настрой автоматично плащане за поне минимума на всяка кредитна карта. Едно пропуснато плащане може да свали рейтинга ти с 100 точки.' },
              },
            ],
          },
          {
            id: 'cs-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'You\'re offered a new credit card with €5,000 limit and 0% APR for 12 months. You currently have €2,000 in savings and no credit history.', bg: 'Предлагат ти нова кредитна карта с лимит €5,000 и 0% ГПР за 12 месеца. В момента имаш €2,000 спестявания и няма кредитна история.' },
            avatar: '💳',
            choices: [
              { label: { en: 'Accept, spend €4,500 on it (90% utilization)', bg: 'Приеми, похарчи €4,500 (90% усвояване)' }, emoji: '🛍️', consequence: { en: 'High spending looks risky to lenders. Your utilization is 90% — this destroys your credit score. After 12 months the 0% ends; if you haven\'t paid it off, interest hits 24% retroactively on the full balance.', bg: 'Високото харчене изглежда рисково за кредиторите. Усвояването ти е 90% — това унищожава кредитния ти рейтинг. След 12 месеца 0% приключва; ако не си го изплатил, лихвата достига 24% ретроактивно на целия баланс.' }, cashFlowChange: -1500, isGood: false },
              { label: { en: 'Accept, use <10% and pay in full monthly', bg: 'Приеми, използвай <10% и плащай изцяло месечно' }, emoji: '✅', consequence: { en: 'Perfect strategy! Low utilization (under €500) + on-time full payments = fastest credit score growth. After 12 months you have an 700+ score, strong credit history, and zero interest paid.', bg: 'Перфектна стратегия! Ниско усвояване (под €500) + навременни пълни плащания = най-бърз растеж на кредитния рейтинг. След 12 месеца имаш рейтинг 700+, силна кредитна история и нула платена лихва.' }, cashFlowChange: 0, isGood: true },
              { label: { en: 'Decline — credit cards are dangerous', bg: 'Откажи — кредитните карти са опасни' }, emoji: '❌', consequence: { en: 'Playing it safe, but missed opportunity. Credit cards, used responsibly, build your score fast. Without credit history, you\'ll pay higher rates on mortgages and car loans later — costing far more than any credit card risk.', bg: 'Играеш на сигурно, но пропусната възможност. Кредитните карти, използвани отговорно, изграждат рейтинга ти бързо. Без кредитна история ще плащаш по-високи ставки за ипотеки и заеми за коли по-късно — струва много повече от всякакъв риск с кредитна карта.' }, cashFlowChange: 0, isGood: false },
            ],
          },
          {
            id: 'cs-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'Your credit card limit is €8,000. For the best score, keep your balance below:', bg: 'Лимитът на кредитната ти карта е €8,000. За най-добър рейтинг, дръж баланса под:' },
            options: [
              { en: '€7,200 (90%)', bg: '€7,200 (90%)' },
              { en: '€4,000 (50%)', bg: '€4,000 (50%)' },
              { en: '€2,400 (30%)', bg: '€2,400 (30%)' },
              { en: '€800 (10%)', bg: '€800 (10%)' },
            ],
            correctIndex: 3,
            explanation: { en: 'Under 10% utilization = best score impact. Under 30% = acceptable. Above 30% starts hurting your score. €800 on an €8,000 limit is ideal.', bg: 'Под 10% усвояване = най-добро въздействие върху рейтинга. Под 30% = приемливо. Над 30% започва да навредява на рейтинга. €800 при лимит €8,000 е идеално.' },
          },
          {
            id: 'cs-sort-1',
            type: 'sort_items',
            xp: 20,
            sortItems: [
              { label: { en: 'Paying credit card in full monthly', bg: 'Плащане на кредитна карта изцяло месечно' }, emoji: '✅', isAsset: true },
              { label: { en: 'Missing a loan payment', bg: 'Пропускане на плащане по заем' }, emoji: '💥', isAsset: false },
              { label: { en: 'Keeping old accounts open', bg: 'Поддържане на стари сметки отворени' }, emoji: '📋', isAsset: true },
              { label: { en: 'Maxing out multiple cards', bg: 'Изчерпване на множество карти' }, emoji: '💸', isAsset: false },
              { label: { en: 'Checking your own credit score', bg: 'Проверка на собствения кредитен рейтинг' }, emoji: '🔍', isAsset: true },
              { label: { en: 'Applying for 5 cards in one month', bg: 'Кандидатстване за 5 карти за един месец' }, emoji: '🚫', isAsset: false },
            ],
          },
        ],
      },
      {
        id: 'debt-destroy',
        moduleId: 'credit-debt',
        title: { en: 'Destroy Your Debt', bg: 'Унищожи дълга си' },
        description: { en: 'Two battle-tested strategies to become debt-free faster.', bg: 'Две изпитани стратегии за по-бързо освобождаване от дълг.' },
        icon: '⚔️', xpReward: 100, order: 2,
        exercises: [
          {
            id: 'dd-theory-1',
            type: 'theory',
            xp: 0,
            slides: [
              {
                emoji: '⚔️',
                title: { en: 'Avalanche vs Snowball', bg: 'Лавина срещу снежна топка' },
                body: { en: '❄️ AVALANCHE: Pay highest interest rate first\n→ Mathematically optimal. Saves the most money.\n→ Best if you\'re disciplined and motivated by math\n\n⛄ SNOWBALL: Pay smallest balance first\n→ Builds psychological momentum with quick wins\n→ Best if you need motivation to stay on track\n\nBoth work. Snowball users are more likely to FINISH. Avalanche users save more money. Pick based on your personality.', bg: '❄️ ЛАВИНА: Изплащай първо с най-висока лихва\n→ Математически оптимално. Спестява най-много пари.\n→ Най-добро ако си дисциплиниран и мотивиран от математиката\n\n⛄ СНЕЖНА ТОПКА: Изплащай първо с най-малък баланс\n→ Изгражда психологически импулс с бързи победи\n→ Най-добро ако имаш нужда от мотивация да останеш на курса\n\nИ двете работят. Потребителите на снежна топка са по-склонни да ЗАВЪРШАТ. Потребителите на лавина спестяват повече пари. Избери въз основа на личността си.' },
                highlight: { en: '🎯 The best debt strategy is the one you\'ll actually stick with.', bg: '🎯 Най-добрата стратегия за дълг е тази, с която наистина ще се придържаш.' },
              },
              {
                emoji: '💡',
                title: { en: 'The Debt Payoff Booster', bg: 'Усилвателят на изплащане на дълг' },
                body: { en: 'After paying off a debt, take ALL that payment and add it to the next debt. This creates an accelerating "debt avalanche."\n\nExample:\n• Debt 1: €200/month → paid off\n• Now pay €200 + €150 = €350/month to Debt 2\n• Debt 2 paid off → pay €350 + €100 = €450 to Debt 3\n\nThe payments SNOWBALL and you accelerate to debt-free.', bg: 'След изплащане на дълг, вземи ВСИЧКО това плащане и го добави към следващия дълг. Това създава ускоряваща се "лавина на дълга."\n\nПример:\n• Дълг 1: €200/месец → изплатен\n• Сега плащай €200 + €150 = €350/месец за Дълг 2\n• Дълг 2 изплатен → плащай €350 + €100 = €450 за Дълг 3\n\nПлащанията "снежна топка" и ускоряваш до освобождаване от дълг.' },
                highlight: { en: '🚀 Every paid-off debt makes the next one faster. Momentum is everything.', bg: '🚀 Всеки изплатен дълг прави следващия по-бърз. Импулсът е всичко.' },
              },
            ],
          },
          {
            id: 'dd-rpg-1',
            type: 'rpg_scenario',
            xp: 25,
            scenario: { en: 'You have €500 extra each month to put toward debt. You owe: Credit Card: €800 at 24% APR. Car Loan: €5,000 at 8% APR. Student Loan: €12,000 at 4% APR. Which do you attack first?', bg: 'Имаш €500 допълнителни всеки месец за дълг. Дължиш: Кредитна карта: €800 при 24% ГПР. Автомобилен заем: €5,000 при 8% ГПР. Студентски заем: €12,000 при 4% ГПР. Кой атакуваш първо?' },
            avatar: '💳',
            choices: [
              { label: { en: 'Avalanche: Credit card first (24% APR)', bg: 'Лавина: Кредитната карта първо (24% ГПР)' }, emoji: '❄️', consequence: { en: 'Smart! The credit card at 24% costs you €192/year in interest. Pay it off in 2 months, then redirect €500 + minimum payment to the car loan. Total interest saved vs minimum payments: ~€3,200.', bg: 'Умно! Кредитната карта при 24% ти струва €192/годишно в лихви. Изплати я за 2 месеца, след това пренасочи €500 + минималното плащане към автомобилния заем. Общо спестена лихва срещу минимални плащания: ~€3,200.' }, cashFlowChange: 3200, isGood: true },
              { label: { en: 'Snowball: Credit card first (€800, smallest balance)', bg: 'Снежна топка: Кредитната карта първо (€800, най-малък баланс)' }, emoji: '⛄', consequence: { en: 'Same first choice! Here Avalanche and Snowball agree — attack the credit card. You get a quick win in 2 months AND save the most on interest. Then you build momentum toward the car loan.', bg: 'Същият първи избор! Тук Лавина и Снежна топка се съгласяват — атакувай кредитната карта. Получаваш бърза победа за 2 месеца И спестяваш най-много от лихви. После изграждаш импулс към автомобилния заем.' }, cashFlowChange: 3000, isGood: true },
              { label: { en: 'Student loan first (largest debt)', bg: 'Студентският заем първо (най-голям дълг)' }, emoji: '📚', consequence: { en: 'Suboptimal! The student loan at 4% costs less than the credit card at 24%. While paying the student loan, the credit card charges 6× more interest. Always attack the highest APR first.', bg: 'Неоптимално! Студентският заем при 4% струва по-малко от кредитната карта при 24%. Докато плащаш студентския заем, кредитната карта начислява 6 пъти повече лихви. Винаги атакувай най-високия ГПР първо.' }, cashFlowChange: -800, isGood: false },
            ],
          },
          {
            id: 'dd-fill-1',
            type: 'fill_blank',
            xp: 15,
            question: { en: 'You owe €3,000 at 20% annual interest. If you make no payments, after 1 year you owe €___', bg: 'Дължиш €3,000 при 20% годишна лихва. Ако не правиш плащания, след 1 година дължиш €___' },
            correctAnswer: 3600, answerMin: 3580, answerMax: 3620, answerUnit: '€',
            explanation: { en: '€3,000 × 1.20 = €3,600. That\'s €600 of new debt created from nothing — pure interest. This is why high-interest debt must be the #1 priority.', bg: '€3,000 × 1.20 = €3,600. Това са €600 нов дълг, създаден от нищото — чиста лихва. Затова дългът с висока лихва трябва да е приоритет #1.' },
          },
          {
            id: 'dd-choice-1',
            type: 'choice',
            xp: 15,
            question: { en: 'You have €2,000. Option A: Invest in index fund (~7% return). Option B: Pay off credit card at 22% APR. Which is better?', bg: 'Имаш €2,000. Вариант А: Инвестирай в индексен фонд (~7% доходност). Вариант Б: Изплати кредитна карта при 22% ГПР. Кой е по-добър?' },
            options: [
              { en: 'Invest — the market always wins long-term', bg: 'Инвестирай — пазарът винаги печели в дългосрочен план' },
              { en: 'Pay the credit card — guaranteed 22% "return"', bg: 'Изплати кредитната карта — гарантирана 22% "доходност"' },
              { en: 'Split 50/50', bg: 'Раздели 50/50' },
              { en: "It doesn't matter", bg: 'Няма значение' },
            ],
            correctIndex: 1,
            explanation: { en: 'Paying 22% debt = a guaranteed 22% return (by eliminating interest). Investing gives an uncertain ~7%. You can\'t beat a guaranteed 22%. Always eliminate high-interest debt first.', bg: 'Изплащането на 22% дълг = гарантирана 22% доходност (чрез елиминиране на лихвата). Инвестирането дава несигурни ~7%. Не можеш да победиш гарантирани 22%. Винаги елиминирай дълга с висока лихва първо.' },
          },
        ],
      },
    ],
  },



  // ─────────────────────────────────────────────
  // PRO MODULE 1 — ADVANCED INVESTING
  // ─────────────────────────────────────────────
  {
    id: 'advanced-investing',
    title: { en: 'Advanced Investing', bg: 'Напреднало инвестиране' },
    description: { en: 'ETFs, portfolio strategies and real investment decisions — learn by playing.', bg: 'ETF-и, портфолио стратегии и реални инвестиционни решения — учи чрез игра.' },
    icon: '📈', color: 'blue', order: 10, proOnly: true,
    lessons: [
      {
        id: 'etf-mastery',
        moduleId: 'advanced-investing',
        title: { en: 'Build Your First Portfolio', bg: 'Изгради първото си портфолио' },
        description: { en: 'Sort assets, simulate compound growth, and make your first real allocation decision.', bg: 'Сортирай активи, симулирай сложна лихва и вземи първото си реално инвестиционно решение.' },
        icon: '🌐', xpReward: 150, order: 1,
        exercises: [
          {
            id: 'etf-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🌐',
                title: { en: 'The Boring Millionaire Secret', bg: 'Тайната на скучния милионер' },
                body: { en: 'The world\'s most boring investment strategy has also made the most millionaires.\n\nStep 1: Buy a total market ETF (like VTI or MSCI World)\nStep 2: Add money every month automatically\nStep 3: Do absolutely nothing else\nStep 4: Wait 20-30 years\n\nThat\'s it. No stock picking. No timing the market. No stress.', bg: 'Най-скучната инвестиционна стратегия в света е създала и най-много милионери.\n\nСтъпка 1: Купи total market ETF (като VTI или MSCI World)\nСтъпка 2: Добавяй пари всеки месец автоматично\nСтъпка 3: Не прави абсолютно нищо друго\nСтъпка 4: Изчакай 20-30 години\n\nТолкова. Без избиране на акции. Без опит за timing. Без стрес.' },
                highlight: { en: '📊 €300/month at 8% for 30 years = €408,000. You only put in €108,000. The rest is pure compound magic.', bg: '📊 €300/месец при 8% за 30 години = €408,000. Ти си вложил само €108,000. Останалото е чиста магия на сложната лихва.' },
              },
              {
                emoji: '🧠',
                title: { en: 'ETF vs "Hot Tips"', bg: 'ETF срещу "Горещи съвети"' },
                body: { en: 'Your friend just told you about an amazing crypto coin.\nYour uncle swears this mining stock will 10x.\nA TikToker says this is the next Amazon.\n\nHere\'s what the data says:\n• 95% of active traders underperform the index\n• Professional fund managers beat the market less than 20% of the time\n• The S&P 500 has never had a 20-year period with negative returns\n\nThe boring ETF wins. Every time.', bg: 'Приятелят ти току-що ти разказа за невероятна крипто монета.\nЧичо ти се кълне, че тази минна акция ще стане 10x.\nTikToker казва, че това е следващият Amazon.\n\nЕто какво казват данните:\n• 95% от активните търговци се представят по-зле от индекса\n• Професионалните мениджъри на фондове бият пазара по-малко от 20% от времето\n• S&P 500 никога не е имал 20-годишен период с отрицателна доходност\n\nСкучният ETF печели. Всеки път.' },
                highlight: { en: '⚠️ "Hot tips" feel exciting. But excitement is the enemy of good investing.', bg: '⚠️ "Горещите съвети" звучат вълнуващо. Но вълнението е враг на доброто инвестиране.' },
              },
            ],
          },
          {
            id: 'etf-sort-1', type: 'sort_items', xp: 25,
            sortItems: [
              { label: { en: 'MSCI World ETF', bg: 'MSCI World ETF' }, emoji: '🌐', isAsset: true },
              { label: { en: 'Friend\'s hot stock tip', bg: 'Горещ съвет от приятел за акция' }, emoji: '🎰', isAsset: false },
              { label: { en: 'S&P 500 index fund', bg: 'S&P 500 индексен фонд' }, emoji: '📈', isAsset: true },
              { label: { en: 'Crypto meme coin', bg: 'Крипто мем монета' }, emoji: '🐸', isAsset: false },
              { label: { en: 'Monthly auto-invest plan', bg: 'Месечен план за автоматично инвестиране' }, emoji: '⚙️', isAsset: true },
              { label: { en: 'Leveraged day-trading', bg: 'Ливъридж дневна търговия' }, emoji: '📉', isAsset: false },
            ],
          },
          {
            id: 'etf-compound-1', type: 'compound_sim', xp: 30,
            compoundConfig: { defaultPrincipal: 1000, defaultRate: 8, defaultYears: 20, defaultMonthly: 200 },
          },
          {
            id: 'etf-choice-1', type: 'choice', xp: 20,
            question: { en: 'You have €5,000 to invest. You\'re 22 years old. Best strategy?', bg: 'Имаш €5,000 за инвестиране. На 22 години си. Най-добрата стратегия?' },
            options: [
              { en: 'Wait for the market to drop before buying', bg: 'Изчакай пазарът да падне преди да купиш' },
              { en: 'Put it in a savings account — investing is risky', bg: 'Сложи го в спестовна сметка — инвестирането е рисково' },
              { en: 'Buy a total market ETF today and set up monthly contributions', bg: 'Купи total market ETF днес и настрой месечни вноски' },
              { en: 'Split between 20 individual stocks to diversify', bg: 'Раздели между 20 отделни акции за диверсификация' },
            ],
            correctIndex: 2,
            explanation: { en: 'Time in the market beats timing the market. Buying today and adding monthly is far better than waiting for a "perfect" moment that never comes. Total market ETF gives instant diversification.', bg: 'Времето в пазара побеждава опита за timing. Купуването днес и добавянето месечно е много по-добро от чакането за "перфектен" момент, който никога не идва. Total market ETF дава моментална диверсификация.' },
          },
        ],
      },
      {
        id: 'investor-mindset',
        moduleId: 'advanced-investing',
        title: { en: 'The Investor\'s Greatest Enemy', bg: 'Най-големият враг на инвеститора' },
        description: { en: 'Play through real market crash scenarios and learn to control your emotions.', bg: 'Преживей реални сценарии за пазарни сривове и се научи да контролираш емоциите си.' },
        icon: '🧘', xpReward: 160, order: 2,
        exercises: [
          {
            id: 'mindset-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '📉',
                title: { en: 'The Market Just Crashed 40%', bg: 'Пазарът току-що се срина с 40%' },
                body: { en: 'It\'s March 2020. COVID hits. Your portfolio drops 40% in 3 weeks.\n\nYour friends are panic selling.\nThe news says "worst crash since 1929".\nYou feel sick every time you open your app.\n\nWhat should you actually do?\n\nAbsolutely nothing. Keep your monthly contributions going.\n\nBy August 2020 the market had fully recovered. Those who held (and kept buying) made a fortune. Those who sold locked in their losses forever.', bg: 'Март 2020. COVID удря. Портфолиото ти пада с 40% за 3 седмици.\n\nПриятелите ти продават в паника.\nНовините казват "най-лошият срив от 1929".\nТи се чувстваш зле всеки път, когато отваряш приложението.\n\nКакво трябва реално да направиш?\n\nАбсолютно нищо. Продължавай месечните вноски.\n\nДо август 2020 пазарът напълно се възстанови. Тези, които задържаха (и продължиха да купуват), спечелиха много. Тези, които продадоха, заключиха загубите си завинаги.' },
                highlight: { en: '🧘 The investor\'s job is not to predict the future — it\'s to survive your own emotions.', bg: '🧘 Работата на инвеститора не е да предвижда бъдещето — а да оцелее от собствените си емоции.' },
              },
            ],
          },
          {
            id: 'mindset-rpg-1', type: 'rpg_scenario', xp: 35,
            scenario: { en: 'It\'s January 2022. Your €10,000 portfolio has dropped 25% to €7,500 over 3 months. Your colleague says "I sold everything, this is going to zero." Your phone notification: "BREAKING: Analysts predict further 30% drop." What do you do?', bg: 'Януари 2022. Портфолиото ти от €10,000 е паднало с 25% до €7,500 за 3 месеца. Колегата ти казва "Продадох всичко, това ще стане нула." Известие на телефона ти: "BREAKING: Анализатори предвиждат допълнителен спад от 30%." Какво правиш?' },
            avatar: '😰',
            choices: [
              {
                label: { en: 'Sell everything — protect what\'s left', bg: 'Продай всичко — защити останалото' },
                emoji: '🚨',
                consequence: { en: 'You sold at the bottom. The market recovered 60% over the next 18 months. You locked in a permanent €2,500 loss.', bg: 'Продаде на дъното. Пазарът се възстанови с 60% в следващите 18 месеца. Заключи постоянна загуба от €2,500.' },
                cashFlowChange: -2500,
                isGood: false,
              },
              {
                label: { en: 'Do nothing — stay the course', bg: 'Не прави нищо — продължавай курса' },
                emoji: '🧘',
                consequence: { en: 'Hard but correct. 18 months later your portfolio is worth €13,200 — a 32% gain from today\'s low.', bg: 'Трудно, но правилно. 18 месеца по-късно портфолиото ти струва €13,200 — 32% печалба от днешното дъно.' },
                cashFlowChange: 0,
                isGood: true,
              },
              {
                label: { en: 'Buy more — the sale of the decade', bg: 'Купи още — разпродажбата на десетилетието' },
                emoji: '🛒',
                consequence: { en: 'You invested €2,000 more at the dip. Your total portfolio hit €17,800 eighteen months later. Legendary move.', bg: 'Инвестира още €2,000 при спада. Общото ти портфолио достигна €17,800 осемнадесет месеца по-късно. Легендарен ход.' },
                cashFlowChange: 2000,
                isGood: true,
              },
            ],
          },
          {
            id: 'mindset-choice-1', type: 'choice', xp: 20,
            question: { en: 'The stock market drops 30% in one month. What does a smart long-term investor do?', bg: 'Фондовият пазар пада с 30% за един месец. Какво прави умният дългосрочен инвеститор?' },
            options: [
              { en: 'Sell and wait for the bottom before re-entering', bg: 'Продай и изчакай дъното преди да влезеш отново' },
              { en: 'Panic — this time really is different', bg: 'Паникьосай се — този път наистина е различно' },
              { en: 'Continue regular contributions and ignore the noise', bg: 'Продължи редовните вноски и игнорирай шума' },
              { en: 'Move everything to gold and wait', bg: 'Премести всичко в злато и изчакай' },
            ],
            correctIndex: 2,
            explanation: { en: 'Every crash in history has been followed by a full recovery. The investors who kept buying during dips ended up far ahead. "This time is different" is the most expensive phrase in investing.', bg: 'Всеки срив в историята е бил последван от пълно възстановяване. Инвеститорите, които продължиха да купуват по време на спадовете, се оказаха далеч напред. "Този път е различно" е най-скъпата фраза в инвестирането.' },
          },
        ],
      },
    ],
  },

  // ─────────────────────────────────────────────
  // PRO MODULE 2 — REAL ESTATE INVESTING
  // ─────────────────────────────────────────────
  {
    id: 'real-estate',
    title: { en: 'Real Estate Investing', bg: 'Инвестиции в недвижими имоти' },
    description: { en: 'Analyse real deals, survive landlord nightmares, and decide: buy or invest in REITs?', bg: 'Анализирай реални сделки, преживей кошмари на наемодатели и реши: купувай или инвестирай в REIT-и?' },
    icon: '🏠', color: 'orange', order: 11, proOnly: true,
    lessons: [
      {
        id: 'reit-fundamentals',
        moduleId: 'real-estate',
        title: { en: 'The Landlord Game', bg: 'Играта на наемодателя' },
        description: { en: 'Run the numbers on real deals. Can you spot the cashflow traps?', bg: 'Пресметни реалните сделки. Можеш ли да забележиш капаните на паричния поток?' },
        icon: '🏢', xpReward: 160, order: 1,
        exercises: [
          {
            id: 're-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '🏠',
                title: { en: 'The Glamour vs Reality of Real Estate', bg: 'Блясъкът срещу Реалността на недвижимите имоти' },
                body: { en: 'The Instagram version:\n📸 "Passive income from my rental property!"\n\nThe real version:\n📞 3am call — tenant flooded the bathroom\n🔧 €2,400 boiler repair out of nowhere\n📋 6-month eviction process for non-paying tenant\n💸 3 months of vacancy between tenants\n\nReal estate CAN be great — but only if the numbers actually work.', bg: 'Instagram версията:\n📸 "Пасивен доход от имота ми под наем!"\n\nРеалната версия:\n📞 Обаждане в 3 сутринта — наемателят е наводнил банята\n🔧 Ремонт на бойлер за €2,400 от нищото\n📋 6-месечен процес на изгонване на наемател, който не плаща\n💸 3 месеца незаетост между наемателите\n\nНедвижимите имоти МОГАТ да бъдат страхотни — но само ако числата реално работят.' },
                highlight: { en: '🧮 The formula: Monthly Cashflow = Rent − Mortgage − Insurance − Maintenance (10%) − Vacancy (8%)', bg: '🧮 Формулата: Месечен поток = Наем − Ипотека − Застраховка − Поддръжка (10%) − Незаетост (8%)' },
              },
              {
                emoji: '🎯',
                title: { en: 'The 1% Rule — Your Quick Filter', bg: 'Правилото за 1% — Бързият ти филтър' },
                body: { en: 'Before deep analysis, use this quick test:\n\nMonthly rent ÷ Purchase price ≥ 1%\n\nExamples:\n✅ €120,000 property → needs €1,200/month rent\n❌ €250,000 property → would need €2,500/month — rare!\n\nIf a deal doesn\'t pass the 1% rule, the math rarely works out. Move on and find better deals.', bg: 'Преди задълбочен анализ, използвай този бърз тест:\n\nМесечен наем ÷ Цена на покупка ≥ 1%\n\nПримери:\n✅ Имот за €120,000 → нужни са €1,200/месец наем\n❌ Имот за €250,000 → ще са нужни €2,500/месец — рядко!\n\nАко сделката не преминава правилото за 1%, математиката рядко се получава. Продължавай и намирай по-добри сделки.' },
              },
            ],
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
                { label: { en: 'Buy a REIT ETF with cashflow', bg: 'Купи REIT ETF с паричния поток' }, emoji: '📈', cost: 0, monthlyPassive: 8, isGood: true },
                { label: { en: 'Hire a property manager (8% of rent)', bg: 'Наеми управител на имот (8% от наема)' }, emoji: '👔', cost: 0, monthlyPassive: -64, isGood: false },
                { label: { en: 'Renovate kitchen — higher rent', bg: 'Ремонт на кухня — по-висок наем' }, emoji: '🍳', cost: 3000, monthlyPassive: 80, isGood: true },
                { label: { en: 'Take out 2nd mortgage for vacation', bg: 'Вземи 2-ра ипотека за ваканция' }, emoji: '🏖️', cost: 0, monthlyPassive: -200, isGood: false },
              ],
            },
          },
          {
            id: 're-choice-1', type: 'choice', xp: 25,
            question: { en: 'Deal: €180,000 apartment. Rent: €900/month. Mortgage: €700. Running costs: €130/month. Is this a good investment?', bg: 'Сделка: Апартамент за €180,000. Наем: €900/месец. Ипотека: €700. Текущи разходи: €130/месец. Добра инвестиция ли е?' },
            options: [
              { en: 'Yes — €70/month positive cashflow is great', bg: 'Да — €70/месец положителен поток е страхотно' },
              { en: 'No — barely breaks even, one repair wipes the year\'s profit', bg: 'Не — едва покрива разходите, един ремонт заличава годишната печалба' },
              { en: 'Yes — property always goes up in value', bg: 'Да — имотите винаги растат в стойност' },
              { en: 'It depends on the neighbourhood', bg: 'Зависи от квартала' },
            ],
            correctIndex: 1,
            explanation: { en: '€900 − €700 − €130 = €70/month = €840/year. One boiler breakdown (€1,500+) wipes 2 years of profit. This deal also fails the 1% rule (€900/€180k = 0.5%). Keep looking.', bg: '€900 − €700 − €130 = €70/месец = €840/година. Един авариен бойлер (€1,500+) заличава 2 години печалба. Тази сделка също не преминава правилото за 1% (€900/€180k = 0.5%). Продължавай да търсиш.' },
          },
        ],
      },
      {
        id: 'rental-cashflow',
        moduleId: 'real-estate',
        title: { en: 'REIT vs Buy — The Ultimate Showdown', bg: 'REIT срещу Купуване — Финалното противостоене' },
        description: { en: 'Run a head-to-head simulation: what builds more wealth over 20 years?', bg: 'Стартирай симулация очи в очи: какво изгражда повече богатство за 20 години?' },
        icon: '⚔️', xpReward: 170, order: 2,
        exercises: [
          {
            id: 'reit-theory-1', type: 'theory', xp: 0,
            slides: [
              {
                emoji: '⚔️',
                title: { en: 'Two Friends. Same €50,000. Different Choices.', bg: 'Двама приятели. Еднакви €50,000. Различни избори.' },
                body: { en: 'Alex buys a rental apartment:\n🏠 €200,000 apartment, €50k down payment\n📈 Property appreciates 3%/year\n💰 €150/month cashflow after all costs\n😤 1 nightmare tenant. 3 months vacancy. €3k roof repair.\n\nSam invests in REIT ETF:\n📊 €50,000 invested at 7%/year\n💸 Dividends auto-reinvested\n😎 Zero phone calls at 3am\n📱 Checked portfolio 0 times this year\n\n20 years later: Who wins?', bg: 'Алекс купува апартамент под наем:\n🏠 Апартамент за €200,000, €50k първоначална вноска\n📈 Имотът се поскъпва с 3%/година\n💰 €150/месец паричен поток след всички разходи\n😤 1 кошмарен наемател. 3 месеца незаетост. Ремонт на покрив за €3k.\n\nСам инвестира в REIT ETF:\n📊 €50,000 при 7%/година\n💸 Дивиденти автоматично реинвестирани\n😎 Нула обаждания в 3 сутринта\n📱 Проверил портфолиото 0 пъти тази година\n\n20 години по-късно: Кой печели?' },
                highlight: { en: '💡 Spoiler: Both can win — but REITs require zero work. Direct property can outperform IF the numbers work AND you are a good landlord.', bg: '💡 Спойлер: И двамата могат да спечеля�� — но REIT-ите не изискват никаква работа. Директният имот може да надмине IF числата работят И ти си добър наемодател.' },
              },
            ],
          },
          {
            id: 'reit-compound-1', type: 'compound_sim', xp: 35,
            compoundConfig: { defaultPrincipal: 50000, defaultRate: 7, defaultYears: 20, defaultMonthly: 150 },
          },
          {
            id: 'reit-rpg-1', type: 'rpg_scenario', xp: 35,
            scenario: { en: 'You have €40,000 saved. Option A: 20% down payment on a €200,000 rental apartment (needs €1,800/month rent to cashflow positive — current market rate: €950). Option B: Invest the full €40,000 in a diversified REIT ETF. What do you do?', bg: 'Имаш спестени €40,000. Вариант А: 20% първоначална вноска за апартамент под наем за €200,000 (нужен €1,800/месец наем за положителен поток — текуща пазарна ставка: €950). Вариант Б: Инвестирай пълните €40,000 в диверсифициран REIT ETF. Какво правиш?' },
            avatar: '🤔',
            choices: [
              {
                label: { en: 'Buy the apartment — real estate never loses', bg: 'Купи апартамента — недвижимите имоти никога не губят' },
                emoji: '🏠',
                consequence: { en: 'You\'re losing €850/month from day one (rent €950 vs costs €1,800). After 3 years you sell at a €15,000 loss after transaction costs.', bg: 'Губиш €850/месец от първия ден (наем €950 срещу разходи €1,800). След 3 години продаваш на загуба от €15,000 след транзакционни разходи.' },
                cashFlowChange: -850,
                isGood: false,
              },
              {
                label: { en: 'Invest in REIT ETF — the numbers don\'t work on the apartment', bg: 'Инвестирай в REIT ETF — числата не работят за апартамента' },
                emoji: '📊',
                consequence: { en: 'Smart call. Your €40,000 grows to €78,000 in 10 years at 7%. Meanwhile you receive quarterly dividends with zero management stress.', bg: 'Умно решение. Твоите €40,000 нарастват до €78,000 за 10 години при 7%. Получаваш тримесечни дивиденти без стрес от управление.' },
                cashFlowChange: 300,
                isGood: true,
              },
              {
                label: { en: 'Keep saving until I find a deal that actually cashflows', bg: 'Продължавай да спестяваш докато намериш сделка, която реално носи поток' },
                emoji: '⏳',
                consequence: { en: 'Patience is a virtue. While waiting, you park the €40k in a REIT ETF. 2 years later you find a €140k apartment renting at €950 — the numbers work. You buy.', bg: 'Търпението е добродетел. Докато чакаш, паркираш €40k в REIT ETF. 2 години по-късно намираш апартамент за €140k под наем за €950 — числата работят. Купуваш го.' },
                cashFlowChange: 150,
                isGood: true,
              },
            ],
          },
          {
            id: 'reit-choice-1', type: 'choice', xp: 20,
            question: { en: 'What is the single biggest advantage of REITs over direct property ownership?', bg: 'Кое е единственото най-голямо предимство на REIT-ите пред директното притежание на имот?' },
            options: [
              { en: 'Higher returns always', bg: 'Винаги по-висока доходност' },
              { en: 'Liquidity — you can sell in seconds without transaction costs', bg: 'Ликвидност — можеш да продадеш за секунди без транзакционни разходи' },
              { en: 'No taxes on dividends', bg: 'Без данъци върху дивидентите' },
              { en: 'Government guarantee of your investment', bg: 'Правителствена гаранция за инвестицията ти' },
            ],
            correctIndex: 1,
            explanation: { en: 'Selling a property takes months and costs 5-10% in fees. Selling a REIT takes 3 seconds and costs nearly nothing. This liquidity is incredibly valuable in emergencies or when better opportunities appear.', bg: 'Продажбата на имот отнема месеци и струва 5-10% в такси. Продажбата на REIT отнема 3 секунди и не струва почти нищо. Тази ликвидност е невероятно ценна при спешни случаи или когато се появят по-добри възможности.' },
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
