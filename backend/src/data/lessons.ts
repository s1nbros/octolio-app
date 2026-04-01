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
    | 'theory'          // read-through theory slides, click Continue
    | 'choice'          // classic A/B/C/D
    | 'budget_slider'   // drag sliders to allocate income
    | 'rpg_scenario'    // branching story with cash-flow consequence
    | 'rat_race'        // mini cashflow month simulation
    | 'compound_sim'    // interactive compound interest simulator
    | 'sort_items'      // drag items into Good/Bad buckets
    | 'fill_blank';     // numeric input
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
  lessons: Lesson[];
}

export const modules: Module[] = [
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
                { label: { en: 'Buy rental apartment', bg: 'Купи апартамент под наем' }, emoji: '🏠', cost: 800, monthlyPassive: 350, isGood: true },
                { label: { en: 'Invest in index fund', bg: 'Инвестирай в индексен фонд' }, emoji: '📈', cost: 300, monthlyPassive: 25, isGood: true },
                { label: { en: 'Buy new luxury watch', bg: 'Купи луксозен часовник' }, emoji: '⌚', cost: 600, monthlyPassive: 0, isGood: false },
                { label: { en: 'Start side business', bg: 'Започни страничен бизнес' }, emoji: '💼', cost: 400, monthlyPassive: 200, isGood: true },
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
];
