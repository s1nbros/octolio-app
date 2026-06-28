"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modules = void 0;
// Load AI-generated modules if the script has been run (see scripts/generateProModules.ts).
// Safe no-op if the file doesn't exist yet.
let generatedModules = [];
try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    generatedModules = require('./generated-modules.json');
}
catch { /* no generated file yet */ }
const staticModules = [
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
                        id: 'rr-swipe-1',
                        type: 'swipe_sort',
                        xp: 20,
                        swipeSort: {
                            prompt: { en: 'Asset or liability? An ASSET puts money in your pocket; a LIABILITY takes money out.', bg: 'Актив или пасив? АКТИВЪТ слага пари в джоба ти; ПАСИВЪТ вади пари.' },
                            leftLabel: { en: 'Liability', bg: 'Пасив' },
                            rightLabel: { en: 'Asset', bg: 'Актив' },
                            cards: [
                                { label: { en: 'Rental apartment', bg: 'Апартамент под наем' }, emoji: '🏠', isRight: true, explanation: { en: 'Rent comes IN — it pays you.', bg: 'Наемът ВЛИЗА — плаща ти.' } },
                                { label: { en: 'New iPhone on credit', bg: 'Нов iPhone на кредит' }, emoji: '📱', isRight: false, explanation: { en: 'Loses value + monthly payments out.', bg: 'Губи стойност + месечни вноски навън.' } },
                                { label: { en: 'Stock portfolio', bg: 'Портфейл от акции' }, emoji: '📈', isRight: true, explanation: { en: 'Grows and can pay dividends.', bg: 'Расте и може да носи дивиденти.' } },
                                { label: { en: 'Car loan', bg: 'Автомобилен заем' }, emoji: '🚗', isRight: false, explanation: { en: 'Interest + the car depreciates.', bg: 'Лихва + колата губи стойност.' } },
                                { label: { en: 'Online business', bg: 'Онлайн бизнес' }, emoji: '💻', isRight: true, explanation: { en: 'Generates income — money in.', bg: 'Генерира доход — пари навътре.' } },
                                { label: { en: 'Designer clothes on credit', bg: 'Дизайнерски дрехи на кредит' }, emoji: '👗', isRight: false, explanation: { en: 'Pure cost — money out, no return.', bg: 'Чист разход — пари навън, без възвръщаемост.' } },
                            ],
                        },
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
            // ── Lesson 5: Life Simulation capstone ──
            {
                id: 'money-life-sim',
                moduleId: 'budgeting',
                title: { en: 'Your Money Life', bg: 'Твоят финансов живот' },
                description: { en: 'Live 40 years of money decisions in 5 minutes — and watch them compound.', bg: 'Изживей 40 години финансови решения за 5 минути — и виж как се натрупват.' },
                icon: '🎮', xpReward: 120, order: 5,
                exercises: [
                    {
                        id: 'mls-theory-1',
                        type: 'theory',
                        xp: 0,
                        slides: [
                            {
                                emoji: '🎮',
                                title: { en: 'Play your money life', bg: 'Изиграй финансовия си живот' },
                                body: { en: "You're about to live ~40 years of money decisions in a few minutes — from your first paycheck to retirement. Every choice (what to do with a raise, a windfall, a market crash) carries forward and compounds.\n\nThere are no single right answers, but some paths build wealth and freedom while others quietly leak it. Watch your net worth at the top change as you go.", bg: "Ще изживееш ~40 години финансови решения за няколко минути — от първата заплата до пенсия. Всеки избор (какво да правиш с увеличение, неочаквани пари, срив на пазара) се пренася напред и се натрупва.\n\nНяма единствено правилни отговори, но някои пътища изграждат богатство и свобода, а други тихо го изтичат. Следи нетната си стойност горе." },
                                highlight: { en: '💡 The same €200/month invested at 22 vs spent is often a €400,000+ difference by 60.', bg: '💡 Същите €200/месец, инвестирани на 22 спрямо изхарчени, често са разлика от €400,000+ до 60-годишна възраст.' },
                            },
                        ],
                    },
                    {
                        id: 'mls-sim-1',
                        type: 'life_sim',
                        xp: 120,
                        lifeSim: {
                            startAge: 22,
                            startCash: 1000,
                            monthlySurplus: 300,
                            annualReturn: 0.07,
                            debtApr: 0.18,
                            stages: [
                                {
                                    age: 22, yearsToNext: 3, emoji: '🎓',
                                    title: { en: 'First paycheck', bg: 'Първа заплата' },
                                    scenario: { en: 'You just landed your first real job — €1,900/month. After rent and essentials, about €300 is left over each month. What do you do with it?', bg: 'Току-що започна първата си истинска работа — €1,900/месец. След наем и основни разходи остават около €300 на месец. Какво правиш с тях?' },
                                    choices: [
                                        { label: { en: 'Invest €200/mo in a UCITS index fund', bg: 'Инвестирай €200/мес в UCITS индексен фонд' }, emoji: '📈', monthlyInvestDelta: 200, happinessDelta: 4, wise: true, outcome: { en: 'The single best move of your life. €200/month at 22, growing ~7% a year, becomes a fortune by 60. Time is your superpower.', bg: 'Най-добрият ход в живота ти. €200/месец на 22 г., растящи ~7% годишно, стават цяло състояние до 60. Времето е твоята суперсила.' } },
                                        { label: { en: "Spend it all — you're young!", bg: 'Изхарчи всичко — млад си!' }, emoji: '🎉', happinessDelta: 10, wise: false, outcome: { en: 'Fun now — but your most valuable asset, decades of compounding, is ticking away uninvested.', bg: 'Забавно сега — но най-ценният ти актив, десетилетия натрупване, тече без да е инвестиран.' } },
                                        { label: { en: 'Leave it in a savings account', bg: 'Остави ги в спестовна сметка' }, emoji: '🏦', happinessDelta: 2, wise: false, outcome: { en: 'Safer than spending, but idle cash quietly loses to inflation. Investing would put it to work.', bg: 'По-безопасно от харчене, но застоялият кеш тихо губи от инфлацията. Инвестирането би го накарало да работи.' } },
                                    ],
                                },
                                {
                                    age: 25, yearsToNext: 3, emoji: '📈',
                                    title: { en: 'Your first raise', bg: 'Първото увеличение' },
                                    scenario: { en: 'A promotion bumps your take-home pay by €500/month. Lifestyle, or future?', bg: 'Повишение увеличава нетната ти заплата с €500/месец. Начин на живот или бъдеще?' },
                                    choices: [
                                        { label: { en: 'Bank the whole raise into investments', bg: 'Вкарай цялото увеличение в инвестиции' }, emoji: '💪', monthlyInvestDelta: 500, happinessDelta: 3, wise: true, outcome: { en: 'Avoiding lifestyle inflation is how ordinary incomes build extraordinary wealth.', bg: 'Избягването на инфлацията на начина на живот е как обикновените доходи изграждат необикновено богатство.' } },
                                        { label: { en: 'Upgrade: nicer flat + a car on a €15,000 loan', bg: 'Ъпгрейд: по-хубав апартамент + кола на €15,000 заем' }, emoji: '🚗', debtDelta: 15000, monthlySurplusDelta: -250, happinessDelta: 9, wise: false, outcome: { en: 'Lifestyle creep plus 18% debt. The car loses value while the loan compounds against you.', bg: 'Пълзяща инфлация на разходите плюс дълг при 18%. Колата губи стойност, а заемът се натрупва срещу теб.' } },
                                        { label: { en: 'Split it: invest €250, enjoy €250', bg: 'Раздели: инвестирай €250, харчи €250' }, emoji: '⚖️', monthlyInvestDelta: 250, happinessDelta: 6, wise: true, outcome: { en: 'Balanced and sustainable — you grow wealth and still enjoy your 20s.', bg: 'Балансирано и устойчиво — трупаш богатство и пак се радваш на 20-те си.' } },
                                    ],
                                },
                                {
                                    age: 28, yearsToNext: 4, emoji: '🎁',
                                    title: { en: 'A windfall', bg: 'Неочаквани пари' },
                                    scenario: { en: 'A €10,000 work bonus just landed in your account. What\'s the plan?', bg: 'Бонус от €10,000 току-що влезе в сметката ти. Какъв е планът?' },
                                    choices: [
                                        { label: { en: 'Emergency fund first, invest the rest', bg: 'Първо авариен фонд, инвестирай остатъка' }, emoji: '🛡️', cashDelta: 4000, investDelta: 6000, happinessDelta: 5, wise: true, outcome: { en: 'A safety net AND growth — exactly how the financially secure handle a windfall.', bg: 'Предпазна мрежа И растеж — точно как финансово стабилните се справят с неочаквани пари.' } },
                                        { label: { en: 'Book the dream trip around the world', bg: 'Резервирай мечтаното околосветско пътуване' }, emoji: '✈️', happinessDelta: 16, wise: false, outcome: { en: 'Unforgettable memories — but €10,000 invested could have become €40,000+ by retirement.', bg: 'Незабравими спомени — но €10,000 инвестирани можеха да станат €40,000+ до пенсия.' } },
                                        { label: { en: 'Go all-in on a hot stock tip', bg: 'Заложи всичко на горещ съвет за акция' }, emoji: '🎰', investDelta: 3000, happinessDelta: -6, wise: false, outcome: { en: "The 'sure thing' cratered — €10,000 became €3,000. Betting big on one tip is gambling, not investing.", bg: '„Сигурната работа" се срина — €10,000 станаха €3,000. Залагането на един съвет е хазарт, не инвестиране.' } },
                                    ],
                                },
                                {
                                    age: 32, yearsToNext: 6, emoji: '📉',
                                    title: { en: 'Market crash', bg: 'Срив на пазара' },
                                    scenario: { en: 'A global recession hits. Your investments are down 35% on paper overnight and the news is all doom. Your gut screams: do something!', bg: 'Глобална рецесия удря. Инвестициите ти са надолу 35% на хартия за една нощ и новините са само мрак. Инстинктът ти крещи: направи нещо!' },
                                    choices: [
                                        { label: { en: 'Hold steady, keep investing', bg: 'Дръж позицията, продължавай да инвестираш' }, emoji: '🧘', happinessDelta: -4, wise: true, outcome: { en: "Paper losses aren't real until you sell. You held — and markets recovered to new highs within a few years.", bg: 'Загубите на хартия не са реални, докато не продадеш. Ти задържа — и пазарите се възстановиха до нови върхове за няколко години.' } },
                                        { label: { en: 'Panic-sell to stop the bleeding', bg: 'Продай в паника, за да спреш загубите' }, emoji: '😱', investMultiplier: 0.65, monthlyInvestDelta: -9999, happinessDelta: -8, wise: false, outcome: { en: 'You locked in the 35% loss, then watched from the sidelines as the market roared back. The classic wealth-killer.', bg: 'Заключи 35% загуба, после гледа отстрани как пазарът се върна нагоре. Класическият убиец на богатство.' } },
                                        { label: { en: 'Buy more at the discount', bg: 'Купи още на по-ниската цена' }, emoji: '🛒', investDelta: 3000, cashDelta: -3000, happinessDelta: -2, wise: true, outcome: { en: 'Buying quality assets on sale supercharged your recovery. Be greedy when others are fearful.', bg: 'Купуването на качествени активи в разпродажба ускори възстановяването ти. Бъди алчен, когато другите се страхуват.' } },
                                    ],
                                },
                                {
                                    age: 38, yearsToNext: 7, emoji: '🏡',
                                    title: { en: 'Putting down roots', bg: 'Пускане на корени' },
                                    scenario: { en: 'You\'re thinking about buying a home. The bank pre-approves you for a big mortgage. How do you play it?', bg: 'Мислиш да купиш жилище. Банката те одобрява предварително за голяма ипотека. Как ще постъпиш?' },
                                    choices: [
                                        { label: { en: 'Buy a modest home you can easily afford', bg: 'Купи скромен дом, който лесно си позволяваш' }, emoji: '🏡', cashDelta: -15000, investDelta: 15000, monthlySurplusDelta: -100, happinessDelta: 12, wise: true, outcome: { en: 'A home within your means builds equity and stability without crushing your budget.', bg: 'Дом по джоба ти изгражда собствен капитал и стабилност, без да смазва бюджета.' } },
                                        { label: { en: 'Stretch for the dream house', bg: 'Напъни се за мечтаната къща' }, emoji: '🏰', cashDelta: -25000, debtDelta: 30000, monthlySurplusDelta: -400, happinessDelta: 15, wise: false, outcome: { en: 'House-poor: a beautiful home, renovations on credit, and a budget with no breathing room.', bg: 'Беден заради къщата: красив дом, ремонти на кредит и бюджет без глътка въздух.' } },
                                        { label: { en: 'Keep renting, invest the difference', bg: 'Продължи под наем, инвестирай разликата' }, emoji: '🔑', monthlyInvestDelta: 150, happinessDelta: 4, wise: true, outcome: { en: "Renting isn't 'throwing money away' if you invest the difference. A perfectly valid path.", bg: 'Наемът не е „хвърляне на пари", ако инвестираш разликата. Напълно валиден път.' } },
                                    ],
                                },
                                {
                                    age: 45, yearsToNext: 10, emoji: '💼',
                                    title: { en: 'Peak earning years', bg: 'Върхови години на доходи' },
                                    scenario: { en: 'You\'re at the top of your career, earning more than ever. What do you prioritize?', bg: 'На върха на кариерата си, печелиш повече от всякога. Какво приоритизираш?' },
                                    choices: [
                                        { label: { en: 'Max out pension contributions', bg: 'Максимизирай пенсионните вноски' }, emoji: '🏦', monthlyInvestDelta: 400, happinessDelta: 3, wise: true, outcome: { en: 'Tax-advantaged and automatic — maxing your pension in peak years is rocket fuel for retirement.', bg: 'Данъчно изгодно и автоматично — максимизирането на пенсията във върховите години е ракетно гориво за пенсия.' } },
                                        { label: { en: 'Reward yourself — boat, luxury holidays', bg: 'Възнагради се — лодка, луксозни почивки' }, emoji: '🛥️', cashDelta: -20000, monthlySurplusDelta: -300, happinessDelta: 13, wise: false, outcome: { en: 'You earned it — but lifestyle inflation at peak income is the biggest missed-wealth window of all.', bg: 'Заслужи го — но инфлацията на разходите при върхов доход е най-големият пропуснат шанс за богатство.' } },
                                        { label: { en: 'Start a side business', bg: 'Започни страничен бизнес' }, emoji: '🚀', cashDelta: -10000, monthlySurplusDelta: 400, happinessDelta: 7, wise: true, outcome: { en: 'The startup cost paid off — a new income stream that compounds your options.', bg: 'Стартовият разход се изплати — нов източник на доход, който умножава възможностите ти.' } },
                                    ],
                                },
                                {
                                    age: 55, yearsToNext: 5, emoji: '🌅',
                                    title: { en: 'Retirement on the horizon', bg: 'Пенсията на хоризонта' },
                                    scenario: { en: 'Retirement is just years away and your portfolio has grown nicely. How do you position for the home stretch?', bg: 'Пенсията е само на няколко години, а портфейлът ти порасна добре. Как се позиционираш за финалната права?' },
                                    choices: [
                                        { label: { en: 'Shift some money to safer assets', bg: 'Прехвърли част към по-безопасни активи' }, emoji: '🛡️', happinessDelta: 5, wise: true, outcome: { en: 'De-risking near retirement protects your gains from a badly-timed crash. Sequence-of-returns risk is real.', bg: 'Намаляването на риска близо до пенсия пази печалбите от зле уцелен срив. Рискът от поредността на доходността е реален.' } },
                                        { label: { en: 'Stay 100% in stocks for max growth', bg: 'Остани 100% в акции за максимален растеж' }, emoji: '🎢', happinessDelta: 1, wise: false, outcome: { en: 'It worked out this time — but a crash at 60 with no time to recover could have been devastating.', bg: 'Този път се получи — но срив на 60 без време за възстановяване можеше да е опустошителен.' } },
                                        { label: { en: 'Cash out everything to a savings account', bg: 'Изтегли всичко в спестовна сметка' }, emoji: '💵', cashOutInvestments: true, happinessDelta: -3, wise: false, outcome: { en: 'Totally safe — and totally exposed to inflation. You also gave up years of growth you still needed.', bg: 'Напълно безопасно — и напълно изложено на инфлация. Освен това се отказа от години растеж, които още ти трябваха.' } },
                                    ],
                                },
                            ],
                            endings: [
                                { minNetWorth: 750000, emoji: '🏝️', title: { en: 'Financially Free', bg: 'Финансово свободен' }, message: { en: 'You can retire early and live life on your terms. Your 22-year-old self made you rich — compounding did the rest.', bg: 'Можеш да се пенсионираш рано и да живееш по своите правила. 22-годишният ти те направи богат — натрупването свърши останалото.' } },
                                { minNetWorth: 400000, emoji: '😎', title: { en: 'Comfortable', bg: 'Спокоен' }, message: { en: 'A solid nest egg. Retirement is secure and you have real options. A few bolder early moves could have doubled this.', bg: 'Солиден резерв. Пенсията е сигурна и имаш реални опции. Няколко по-смели ранни хода можеха да удвоят това.' } },
                                { minNetWorth: 150000, emoji: '🌱', title: { en: 'On Track', bg: 'В правилна посока' }, message: { en: 'A real foundation — but a few different choices could have multiplied this. Now you know exactly which ones.', bg: 'Истинска основа — но няколко различни избора можеха да го умножат. Сега знаеш точно кои.' } },
                                { minNetWorth: 0, emoji: '😅', title: { en: 'Just Getting By', bg: 'Едва свързваш двата края' }, message: { en: 'You stayed afloat, but compounding barely got a chance to work. Small, consistent investing changes everything — and it\'s never too late to start.', bg: 'Остана на повърхността, но натрупването едва получи шанс. Малкото последователно инвестиране променя всичко — и никога не е късно да започнеш.' } },
                                { minNetWorth: -999999999, emoji: '😬', title: { en: 'In the Red', bg: 'На червено' }, message: { en: 'Debt outran you. The good news: every choice that got you here is reversible — and you just practiced the better ones.', bg: 'Дългът те изпревари. Добрата новина: всеки избор, който те доведе тук, е обратим — и току-що упражни по-добрите.' } },
                            ],
                        },
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
                        id: 'cm-speed-1', type: 'speed_round', xp: 25,
                        speedRound: {
                            prompt: { en: 'Compounding rapid fire!', bg: 'Сложна лихва — бърз рунд!' },
                            secondsPerQuestion: 8, passScore: 0.6,
                            questions: [
                                { q: { en: 'What grows investments fastest over decades?', bg: 'Какво кара инвестициите да растат най-бързо за десетилетия?' }, options: [{ en: 'Time in the market', bg: 'Време на пазара' }, { en: 'Timing the market', bg: 'Уцелване на пазара' }, { en: 'Checking daily', bg: 'Ежедневна проверка' }], correctIndex: 0 },
                                { q: { en: '€200/mo for 40 yrs vs €400/mo for 20 yrs — which ends bigger?', bg: '€200/мес за 40 г. срещу €400/мес за 20 г. — кое е по-голямо?' }, options: [{ en: '40 years wins', bg: '40 години печели' }, { en: '20 years wins', bg: '20 години печели' }, { en: 'They tie', bg: 'Равни са' }], correctIndex: 0 },
                                { q: { en: 'Earning interest on past interest is called…', bg: 'Лихва върху натрупаната лихва се нарича…' }, options: [{ en: 'Compounding', bg: 'Сложна лихва' }, { en: 'Inflation', bg: 'Инфлация' }, { en: 'Leverage', bg: 'Ливъридж' }], correctIndex: 0 },
                                { q: { en: 'Best time to start investing?', bg: 'Най-доброто време да започнеш да инвестираш?' }, options: [{ en: 'As early as possible', bg: 'Колкото може по-рано' }, { en: 'After you are rich', bg: 'След като забогатееш' }, { en: 'At retirement', bg: 'При пенсиониране' }], correctIndex: 0 },
                                { q: { en: 'Idle cash in a 0% account over 10 years…', bg: 'Застоял кеш в сметка с 0% за 10 години…' }, options: [{ en: 'Loses value to inflation', bg: 'Губи стойност от инфлация' }, { en: 'Doubles', bg: 'Удвоява се' }, { en: 'Stays equal in real terms', bg: 'Остава равен реално' }], correctIndex: 0 },
                            ],
                        },
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
                            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
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
                            labels: ['Jan19', 'Feb19', 'Mar19', 'Apr19', 'May19', 'Jun19', 'Jul19', 'Aug19', 'Sep19', 'Oct19', 'Nov19', 'Dec19', 'Jan20', 'Feb20', 'Mar20', 'Apr20', 'May20', 'Jun20', 'Jul20', 'Aug20', 'Sep20', 'Oct20', 'Nov20', 'Dec20'],
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
                        id: 'if-speed-1', type: 'speed_round', xp: 25,
                        speedRound: {
                            prompt: { en: 'Index investing rapid fire!', bg: 'Индексно инвестиране — бърз рунд!' },
                            secondsPerQuestion: 8, passScore: 0.6,
                            questions: [
                                { q: { en: 'Over 15 years, most active fund managers…', bg: 'За 15 години повечето активни мениджъри…' }, options: [{ en: 'Lose to the index', bg: 'Губят от индекса' }, { en: 'Beat the index', bg: 'Бият индекса' }, { en: 'Match exactly', bg: 'Изравняват точно' }], correctIndex: 0 },
                                { q: { en: 'A low-cost index fund mainly wins because of…', bg: 'Евтиният индексен фонд печели основно заради…' }, options: [{ en: 'Low fees + diversification', bg: 'Ниски такси + диверсификация' }, { en: 'Lucky stock picks', bg: 'Късметлийски избори' }, { en: 'Frequent trading', bg: 'Честа търговия' }], correctIndex: 0 },
                                { q: { en: 'For EU investors, the common fund wrapper is…', bg: 'За ЕС инвеститори честият тип фонд е…' }, options: [{ en: 'UCITS ETF', bg: 'UCITS ETF' }, { en: 'US 401(k)', bg: 'US 401(k)' }, { en: 'Penny stock', bg: 'Пени акция' }], correctIndex: 0 },
                                { q: { en: 'Spreading money across many assets is…', bg: 'Разпределяне на пари между много активи е…' }, options: [{ en: 'Diversification', bg: 'Диверсификация' }, { en: 'Speculation', bg: 'Спекулация' }, { en: 'Leverage', bg: 'Ливъридж' }], correctIndex: 0 },
                                { q: { en: 'Panic-selling at every market dip tends to…', bg: 'Паническо продаване при всеки спад обикновено…' }, options: [{ en: 'Hurt long-term returns', bg: 'Вреди на дългосрочната доходност' }, { en: 'Boost returns', bg: 'Повишава доходността' }, { en: 'Have no effect', bg: 'Няма ефект' }], correctIndex: 0 },
                            ],
                        },
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
                            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
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
            // ── Boss Battle capstone ──
            {
                id: 'investing-boss',
                moduleId: 'investing',
                title: { en: 'Boss: The Hype Beast', bg: 'Бос: Звярът на хайпа' },
                description: { en: 'Defeat the hype with everything you learned about investing.', bg: 'Победи хайпа с всичко научено за инвестирането.' },
                icon: '🐲', xpReward: 150, order: 4,
                exercises: [
                    {
                        id: 'investing-boss-1', type: 'boss_battle', xp: 150,
                        bossBattle: {
                            boss: { name: { en: 'The Hype Beast', bg: 'Звярът на хайпа' }, emoji: '🐲' },
                            intro: { en: 'It feeds on FOMO, hot tips and panic-selling. Land enough clean hits to take it down — three wrong answers and it wins.', bg: 'Храни се с FOMO, горещи съвети и паническо продаване. Нанеси достатъчно точни удари — три грешни отговора и то печели.' },
                            badge: { label: { en: 'Market Master', bg: 'Майстор на пазара' }, emoji: '📈' },
                            questions: [
                                { q: { en: 'Over 15 years, most active fund managers…', bg: 'За 15 години повечето активни мениджъри…' }, options: [{ en: 'Lose to the index', bg: 'Губят от индекса' }, { en: 'Beat the index', bg: 'Бият индекса' }, { en: 'Match it', bg: 'Изравняват го' }], correctIndex: 0, explanation: { en: '~85–90% underperform a low-cost index fund after fees.', bg: '~85–90% изостават от евтин индексен фонд след такси.' } },
                                { q: { en: 'Spreading money across many assets is…', bg: 'Разпределяне на пари между много активи е…' }, options: [{ en: 'Diversification', bg: 'Диверсификация' }, { en: 'Speculation', bg: 'Спекулация' }, { en: 'Leverage', bg: 'Ливъридж' }], correctIndex: 0, explanation: { en: 'Diversification lowers the risk of any single asset sinking you.', bg: 'Диверсификацията намалява риска един актив да те потопи.' } },
                                { q: { en: 'For EU investors, the common fund wrapper is…', bg: 'За ЕС инвеститори честият тип фонд е…' }, options: [{ en: 'UCITS ETF', bg: 'UCITS ETF' }, { en: 'US 401(k)', bg: 'US 401(k)' }, { en: 'Penny stock', bg: 'Пени акция' }], correctIndex: 0, explanation: { en: 'UCITS ETFs are the EU-regulated standard (VWCE, CSPX).', bg: 'UCITS ETF са ЕС-регулираният стандарт (VWCE, CSPX).' } },
                                { q: { en: 'What grows wealth most over decades?', bg: 'Какво трупа богатство най-много за десетилетия?' }, options: [{ en: 'Time in the market', bg: 'Време на пазара' }, { en: 'Timing the market', bg: 'Уцелване на пазара' }, { en: 'Day trading', bg: 'Дневна търговия' }], correctIndex: 0, explanation: { en: 'Time + compounding beats trying to time tops and bottoms.', bg: 'Времето + сложната лихва бият опитите да уцелиш върхове и дъна.' } },
                                { q: { en: 'The market drops 35%. The wise move is usually to…', bg: 'Пазарът пада 35%. Мъдрият ход обикновено е да…' }, options: [{ en: 'Hold and keep investing', bg: 'Задържиш и продължиш да инвестираш' }, { en: 'Panic-sell everything', bg: 'Продадеш всичко в паника' }, { en: 'Stop forever', bg: 'Спреш завинаги' }], correctIndex: 0, explanation: { en: 'Paper losses are not real until you sell; markets recover.', bg: 'Загубите на хартия не са реални, докато не продадеш; пазарите се възстановяват.' } },
                                { q: { en: 'An offer of "guaranteed high returns, no risk" is…', bg: 'Оферта за „гарантирана висока доходност, без риск" е…' }, options: [{ en: 'A scam signal', bg: 'Сигнал за измама' }, { en: 'A great deal', bg: 'Страхотна сделка' }, { en: 'Totally normal', bg: 'Напълно нормално' }], correctIndex: 0, explanation: { en: 'Risk and return are linked — guaranteed-no-risk-high-return is a scam.', bg: 'Рискът и доходността са свързани — гарантирано-без-риск-висока-доходност е измама.' } },
                                { q: { en: 'A low-cost index fund mainly wins because of…', bg: 'Евтиният индексен фонд печели основно заради…' }, options: [{ en: 'Low fees + diversification', bg: 'Ниски такси + диверсификация' }, { en: 'Lucky picks', bg: 'Късметлийски избори' }, { en: 'Frequent trading', bg: 'Честа търговия' }], correctIndex: 0, explanation: { en: 'Low costs are one of the few things you control, and they compound.', bg: 'Ниските разходи са от малкото, които контролираш, и се натрупват.' } },
                            ],
                        },
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
                        orderInstruction: { en: 'Order the credit-score factors used by EU credit bureaus from MOST to LEAST important:', bg: 'Подреди факторите за кредитен рейтинг (ползвани от ЕС кредитни бюра) от НАЙ-ВАЖЕН към НАЙ-МАЛОВАЖЕН:' },
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
                        id: 'cs2-speed-1', type: 'speed_round', xp: 25,
                        speedRound: {
                            prompt: { en: 'Credit score rapid fire!', bg: 'Кредитен рейтинг — бърз рунд!' },
                            secondsPerQuestion: 8, passScore: 0.6,
                            questions: [
                                { q: { en: 'The biggest driver of your credit score is…', bg: 'Най-големият фактор за рейтинга е…' }, options: [{ en: 'Payment history', bg: 'История на плащанията' }, { en: 'Your salary', bg: 'Заплатата ти' }, { en: 'Your age', bg: 'Възрастта ти' }], correctIndex: 0 },
                                { q: { en: 'Keep your card balance below what % of the limit?', bg: 'Под какъв % от лимита да държиш баланса?' }, options: [{ en: 'Under 30%', bg: 'Под 30%' }, { en: 'Around 90%', bg: 'Около 90%' }, { en: 'Exactly 100%', bg: 'Точно 100%' }], correctIndex: 0 },
                                { q: { en: 'Closing your oldest credit card usually…', bg: 'Затварянето на най-старата карта обикновено…' }, options: [{ en: 'Hurts your score', bg: 'Вреди на рейтинга' }, { en: 'Helps your score', bg: 'Помага на рейтинга' }, { en: 'Does nothing', bg: 'Не прави нищо' }], correctIndex: 0 },
                                { q: { en: 'To build credit you should…', bg: 'За да изградиш кредит трябва да…' }, options: [{ en: 'Use a card and pay it in full', bg: 'Ползваш карта и плащаш изцяло' }, { en: 'Carry a balance with interest', bg: 'Държиш баланс с лихва' }, { en: 'Never use credit', bg: 'Никога не ползваш кредит' }], correctIndex: 0 },
                                { q: { en: 'Which debt usually costs the most?', bg: 'Кой дълг обикновено струва най-много?' }, options: [{ en: 'Credit card at 20%+', bg: 'Кредитна карта при 20%+' }, { en: 'Mortgage at 3%', bg: 'Ипотека при 3%' }, { en: 'Student loan at 5%', bg: 'Студентски заем при 5%' }], correctIndex: 0 },
                            ],
                        },
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
            // ── Boss Battle capstone ──
            {
                id: 'credit-boss',
                moduleId: 'credit-debt',
                title: { en: 'Boss: The Debt Dragon', bg: 'Бос: Драконът на дълга' },
                description: { en: 'Slay the dragon with everything you learned about credit and debt.', bg: 'Победи дракона с всичко научено за кредити и дългове.' },
                icon: '🐉', xpReward: 150, order: 3,
                exercises: [
                    {
                        id: 'credit-boss-1', type: 'boss_battle', xp: 150,
                        bossBattle: {
                            boss: { name: { en: 'The Debt Dragon', bg: 'Драконът на дълга' }, emoji: '🐉' },
                            intro: { en: 'It grows fat on high interest and minimum payments. Strike true — three wrong answers and the dragon wins.', bg: 'Тлъстее от висока лихва и минимални вноски. Удряй точно — три грешни отговора и драконът печели.' },
                            badge: { label: { en: 'Debt Slayer', bg: 'Победител на дълга' }, emoji: '🛡️' },
                            questions: [
                                { q: { en: 'The biggest factor in your credit score is…', bg: 'Най-големият фактор за кредитния рейтинг е…' }, options: [{ en: 'Payment history', bg: 'История на плащанията' }, { en: 'Your income', bg: 'Доходът ти' }, { en: 'Your age', bg: 'Възрастта ти' }], correctIndex: 0, explanation: { en: 'Payment history is the #1 driver — never miss a due date.', bg: 'Историята на плащанията е №1 — никога не пропускай падеж.' } },
                                { q: { en: 'Keep your credit utilization below…', bg: 'Дръж усвояването на кредита под…' }, options: [{ en: '30% of your limit', bg: '30% от лимита' }, { en: '90% of your limit', bg: '90% от лимита' }, { en: '100%', bg: '100%' }], correctIndex: 0, explanation: { en: 'Under 30% (ideally under 10%) keeps your score healthy.', bg: 'Под 30% (идеално под 10%) пази рейтинга здрав.' } },
                                { q: { en: 'The avalanche method pays off which debt first?', bg: 'Методът лавина изплаща първо кой дълг?' }, options: [{ en: 'Highest interest rate', bg: 'Най-високата лихва' }, { en: 'Smallest balance', bg: 'Най-малкия баланс' }, { en: 'The oldest one', bg: 'Най-стария' }], correctIndex: 0, explanation: { en: 'Avalanche targets the highest APR first — the cheapest path.', bg: 'Лавината атакува първо най-високата лихва — най-евтиният път.' } },
                                { q: { en: 'Which debt usually costs the most over time?', bg: 'Кой дълг обикновено струва най-много с времето?' }, options: [{ en: 'Credit card at 20%+', bg: 'Кредитна карта при 20%+' }, { en: 'Mortgage at 3%', bg: 'Ипотека при 3%' }, { en: 'Student loan at 5%', bg: 'Студентски заем при 5%' }], correctIndex: 0, explanation: { en: 'High-APR card debt is the most expensive — kill it first.', bg: 'Картовият дълг с висока лихва е най-скъп — унищожи го пръв.' } },
                                { q: { en: 'Closing your oldest credit card usually…', bg: 'Затварянето на най-старата карта обикновено…' }, options: [{ en: 'Hurts your score', bg: 'Вреди на рейтинга' }, { en: 'Helps your score', bg: 'Помага на рейтинга' }, { en: 'Does nothing', bg: 'Не прави нищо' }], correctIndex: 0, explanation: { en: 'It shortens your history and cuts your limit — both hurt.', bg: 'Скъсява историята и сваля лимита — и двете вредят.' } },
                                { q: { en: 'Paying only the minimum on a card means…', bg: 'Плащане само на минимума по карта означава…' }, options: [{ en: 'You pay interest for years', bg: 'Плащаш лихва години наред' }, { en: 'You are debt-free fast', bg: 'Бързо си без дълг' }, { en: 'It costs nothing', bg: 'Не струва нищо' }], correctIndex: 0, explanation: { en: 'Minimums are designed to keep you paying interest for years.', bg: 'Минимумите са направени да плащаш лихва с години.' } },
                                { q: { en: 'Debt consolidation works only if you also…', bg: 'Консолидацията на дълг работи само ако също…' }, options: [{ en: 'Stop using the old credit', bg: 'Спреш да ползваш старите карти' }, { en: 'Open more cards', bg: 'Отвориш още карти' }, { en: 'Ignore the balance', bg: 'Игнорираш баланса' }], correctIndex: 0, explanation: { en: 'The math wins only if you close access to the old credit.', bg: 'Математиката печели само ако затвориш достъпа до стария кредит.' } },
                            ],
                        },
                    },
                ],
            },
        ],
    },
    // ─────────────────────────────────────────────
    // MODULE 5 — SIDE HUSTLES & EXTRA INCOME
    // Signature interactive: income_streams (pick a mix of streams to hit a target)
    // ─────────────────────────────────────────────
    {
        id: 'side-hustles',
        title: { en: 'Side Hustles & Extra Income', bg: 'Странични бизнеси и допълнителен доход' },
        description: { en: 'Turn your skills into income streams without burning out.', bg: 'Превърни уменията си в потоци доход без да изгориш.' },
        icon: '💼', color: 'green', order: 5,
        lessons: [
            // ── Lesson 1: Launch Your Side Hustle ──
            {
                id: 'side-hustle-launch',
                moduleId: 'side-hustles',
                title: { en: 'Launch Your Side Hustle', bg: 'Стартирай страничен бизнес' },
                description: { en: 'Why side income matters, how to validate, and what mix actually fits your life.', bg: 'Защо страничният доход е важен, как да валидираш и какъв микс пасва на живота ти.' },
                icon: '🚀', xpReward: 140, order: 1,
                exercises: [
                    {
                        id: 'sh1-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🚀',
                                title: { en: 'Why Side Income Changes Everything', bg: 'Защо страничният доход променя всичко' },
                                body: { en: 'A salary is a single income stream — and single streams are fragile.\n\nMath: an extra €500/mo from age 25, invested at 7% for 40 years = €1.3M at retirement. From a hobby.\n\nSide hustles also give you:\n• A safety net if your job changes\n• Real-world skills your CV can\'t show\n• Optionality — the freedom to say no\n\nThis isn\'t about grinding 24/7. It\'s about building one tiny stream that pays you while you sleep.', bg: 'Заплатата е единствен поток — а единствените потоци са крехки.\n\nМатематика: допълнителни €500/мес от 25 г., инвестирани при 7% за 40 г. = €1.3М до пенсия. От хоби.\n\nСтраничният бизнес ти дава:\n• Резервна мрежа, ако работата се промени\n• Реални умения, които CV не може да покаже\n• Свобода — възможността да кажеш не\n\nНе е за бачкане 24/7. За изграждане на едно мъничко потокче, което плаща докато спиш.' },
                                highlight: { en: '💡 The goal isn\'t to replace your job — it\'s to make your job optional.', bg: '💡 Целта не е да замениш работата — а да я направиш по избор.' },
                            },
                            {
                                emoji: '🔬',
                                title: { en: 'The 3-Stage Validation Loop', bg: 'Тристепенната валидационна примка' },
                                body: { en: 'Most side hustles fail because people build BEFORE asking if anyone wants to pay.\n\nThe right order:\n\n1️⃣ Talk to 5 potential customers — would they pay?\n2️⃣ Build the smallest possible version (MVP)\n3️⃣ Get 3 actual paying customers BEFORE scaling\n\nIf step 1 says no, kill it. Save months of wasted weekends.', bg: 'Повечето странични бизнеси умират, защото хората строят ПРЕДИ да попитат дали някой ще плати.\n\nПравилният ред:\n\n1️⃣ Говори с 5 потенциални клиенти — биха ли платили?\n2️⃣ Построй най-малката възможна версия (MVP)\n3️⃣ Вземи 3 реални платящи клиенти ПРЕДИ да мащабираш\n\nАко стъпка 1 е "не" — спри. Спести месеци пропилени уикенди.' },
                                highlight: { en: '🎯 If you can\'t get 3 paying customers, the problem is the offer — not the marketing.', bg: '🎯 Ако не можеш да вземеш 3 платящи клиенти, проблемът е офертата — не маркетингът.' },
                            },
                        ],
                    },
                    {
                        id: 'sh1-match-1', type: 'match_terms', xp: 20,
                        matchPairs: [
                            { term: { en: 'MVP', bg: 'MVP' }, definition: { en: 'Minimum Viable Product — smallest version that delivers value', bg: 'Минимална жизнеспособна версия с реална стойност' } },
                            { term: { en: 'Validation', bg: 'Валидация' }, definition: { en: 'Proving people will pay before you build', bg: 'Доказваш че ще платят преди да построиш' } },
                            { term: { en: 'Niche', bg: 'Ниша' }, definition: { en: 'A specific sub-market you serve deeply', bg: 'Конкретен под-пазар, който обслужваш дълбоко' } },
                            { term: { en: 'CAC', bg: 'CAC' }, definition: { en: 'Customer Acquisition Cost — €€ spent to win one customer', bg: 'Цена на придобиване на клиент — €€ за един клиент' } },
                            { term: { en: 'Recurring revenue', bg: 'Повтарящ се приход' }, definition: { en: 'Income that repeats every month from the same customer', bg: 'Доход, който се повтаря всеки месец от същия клиент' } },
                        ],
                    },
                    {
                        id: 'sh1-streams-1', type: 'income_streams', xp: 35,
                        incomeStreams: {
                            scenario: { en: 'You have 12 hours a week free outside your day job. Pick a mix that earns at least €400/month without going over 12 hours.', bg: 'Имаш 12 часа на седмица свободни извън основната работа. Избери микс за поне €400/месец без да надхвърляш 12 часа.' },
                            question: { en: 'Build a realistic €400/mo starter mix', bg: 'Изгради реалистичен стартов микс за €400/мес' },
                            targetIncome: 400,
                            maxHoursPerWeek: 12,
                            minPicks: 1,
                            maxPicks: 3,
                            streams: [
                                { label: { en: 'Freelance graphic design', bg: 'Фрийланс графичен дизайн' }, emoji: '🎨', hoursPerWeek: 8, eurPerHour: 25, scalability: 3 },
                                { label: { en: 'Weekend pet sitting', bg: 'Гледане на домашни любимци уикенди' }, emoji: '🐕', hoursPerWeek: 6, eurPerHour: 15, scalability: 2 },
                                { label: { en: 'Stock photos (passive)', bg: 'Stock снимки (пасивно)' }, emoji: '📸', hoursPerWeek: 3, eurPerHour: 10, scalability: 4, note: { en: 'Earn forever after upload', bg: 'Печелиш завинаги след качване' } },
                                { label: { en: 'Online tutoring', bg: 'Онлайн уроци' }, emoji: '🎓', hoursPerWeek: 5, eurPerHour: 30, scalability: 3 },
                                { label: { en: 'Paid survey apps', bg: 'Платени анкети' }, emoji: '📋', hoursPerWeek: 4, eurPerHour: 5, scalability: 1, note: { en: 'Low rate, no skills built', bg: 'Ниска ставка, без растеж в умения' } },
                                { label: { en: 'Reselling thrift finds', bg: 'Препродажба от второ ръка' }, emoji: '👕', hoursPerWeek: 4, eurPerHour: 20, scalability: 2 },
                            ],
                        },
                        explanation: { en: 'Good mixes: tutoring alone (5h, €600) OR design alone (8h, €800) OR photos + tutoring (8h, €720). Surveys are a trap — €80/mo at €5/h is a brutal trade.', bg: 'Добри миксове: само уроци (5ч, €600) ИЛИ само дизайн (8ч, €800) ИЛИ снимки + уроци (8ч, €720). Анкетите са капан — €80/мес при €5/ч.' },
                    },
                    {
                        id: 'sh1-tf-1', type: 'true_false', xp: 15,
                        statement: { en: '"Passive income" is truly passive — once set up, it requires zero work to maintain.', bg: '"Пасивният доход" е наистина пасивен — щом го настроиш, не изисква никаква работа.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Almost every "passive" income needs maintenance: course updates, marketing, customer support, content refresh, platform changes. The most honest term is "leveraged" income — your time scales 10×, but it\'s never 0.', bg: 'НЕВЯРНО. Почти всеки "пасивен" доход иска поддръжка: обновяване, маркетинг, поддръжка на клиенти, обновяване на съдържание. По-честно е "лост" — времето ти се умножава 10×, но никога 0.' },
                    },
                    {
                        id: 'sh1-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'Order the validation steps from FIRST to LAST (do this BEFORE building anything big):', bg: 'Подреди стъпките за валидация от ПЪРВА към ПОСЛЕДНА (преди да строиш нещо голямо):' },
                        orderItems: [
                            { label: { en: 'Talk to 5 potential customers about the problem', bg: 'Говори с 5 потенциални клиенти за проблема' }, emoji: '💬' },
                            { label: { en: 'Build a minimal version (MVP) in under a week', bg: 'Построй минимална версия (MVP) за под седмица' }, emoji: '🛠️' },
                            { label: { en: 'Charge the first 3 customers FULL price', bg: 'Вземи пълна цена от първите 3 клиента' }, emoji: '💰' },
                            { label: { en: 'Get testimonials and word-of-mouth referrals', bg: 'Вземи отзиви и препоръки' }, emoji: '⭐' },
                            { label: { en: 'Scale up or pivot based on real data', bg: 'Мащабирай или промени курса на база реални данни' }, emoji: '📈' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4],
                        explanation: { en: 'Most people build first and ask later — and then can\'t sell what they built. Talking to 5 humans BEFORE coding/buying inventory kills 80% of bad ideas at zero cost.', bg: 'Повечето хора първо строят, после питат — и не могат да продадат. Разговор с 5 души ПРЕДИ да кодираш/купуваш убива 80% от лошите идеи безплатно.' },
                    },
                    {
                        id: 'sh1-decision-1', type: 'scenario_decision', xp: 25,
                        decisionAvatar: '🎨',
                        decisionScenario: { en: 'You have a stable day job, 8 hours/week free, €0 inventory budget, and decent design skills. Which hustle idea is the best fit?', bg: 'Имаш стабилна работа, 8 ч/седм. свободни, €0 за инвентар, прилични дизайн умения. Коя идея пасва най-добре?' },
                        decisionChoices: [
                            { label: { en: 'Open a print-on-demand t-shirt store', bg: 'Магазин за тениски по поръчка' }, emoji: '👕', outcome: { en: 'Decent fit: uses your skills + zero inventory risk. But slow ramp — most stores take 6–12 months to find a profitable design niche. Income trickles in.', bg: 'Прилично: ползва уменията + нулев риск със стока. Но бавно — повечето магазини откриват печеливша ниша за 6–12 м.' }, isBest: false },
                            { label: { en: 'Start dropshipping electronics', bg: 'Дропшипинг електроника' }, emoji: '📦', outcome: { en: 'Bad fit on every axis: no design-skill use, brutal competition with razor-thin margins, ad-spend required to start, refund headaches. Skip.', bg: 'Лошо на всичко: не ползва уменията, жестока конкуренция с малки маржове, реклама за стартиране, главоболия с връщания.' }, isBest: false },
                            { label: { en: 'Freelance logo design on Upwork / Fiverr', bg: 'Фрийланс дизайн на лога в Upwork / Fiverr' }, emoji: '🎨', outcome: { en: 'Perfect fit. Direct match of skill to paying demand. Zero upfront cost. First clients within weeks. Predictable hourly income. Start here, scale via packages + referrals later.', bg: 'Перфектно. Директно съвпадение умение/платено търсене. Нула стартови разходи. Първи клиенти за седмици. Стартирай тук, мащабирай чрез пакети + препоръки.' }, isBest: true },
                            { label: { en: 'Quit job, raise €50k angel investment for an app', bg: 'Напусни работа, вземи €50к за апликация' }, emoji: '💸', outcome: { en: 'Wildly premature. 99% of pre-product startups die. You have no validation, no track record, no income. This is the opposite of "start small, validate fast."', bg: 'Преждевременно. 99% от стартъпите без продукт умират. Без валидация, без история, без доход.' }, isBest: false },
                        ],
                        explanation: { en: 'The best first hustle has 3 things: it uses an existing skill, has near-zero startup cost, and has buyers ALREADY looking for it. Freelancing on a marketplace nails all three.', bg: 'Най-добрият първи бизнес има 3 неща: ползва съществуващо умение, почти нулеви разходи и купувачите ВЕЧЕ търсят. Фрийлансът покрива и трите.' },
                    },
                    {
                        id: 'sh1-swipe-1', type: 'swipe_sort', xp: 20,
                        swipeSort: {
                            prompt: { en: 'Smart side-hustle move or rookie trap? Swipe each one.', bg: 'Умен ход за страничен бизнес или капан за начинаещи? Плъзни всяко.' },
                            leftLabel: { en: 'Trap', bg: 'Капан' },
                            rightLabel: { en: 'Smart', bg: 'Умен' },
                            cards: [
                                { label: { en: 'Set aside ~30% of income for taxes', bg: 'Заделяш ~30% от дохода за данъци' }, emoji: '🧾', isRight: true, explanation: { en: 'Forgetting taxes is the #1 freelancer mistake.', bg: 'Забравянето на данъци е грешка №1.' } },
                                { label: { en: 'Quit your day job after the first €500', bg: 'Напускаш работа след първите €500' }, emoji: '🚪', isRight: false, explanation: { en: 'Keep stability until the side income is proven.', bg: 'Запази стабилност, докато доходът се докаже.' } },
                                { label: { en: 'Reinvest part of early profit into growth', bg: 'Реинвестираш част от ранната печалба в растеж' }, emoji: '🌱', isRight: true, explanation: { en: 'Smart — once taxes are set aside.', bg: 'Умно — след като данъците са заделени.' } },
                                { label: { en: 'Spend the first profit on a fancy laptop', bg: 'Харчиш първата печалба за скъп лаптоп' }, emoji: '💻', isRight: false, explanation: { en: 'Buy tools when they pay for themselves, not before.', bg: 'Купувай инструменти, когато се изплащат, не преди.' } },
                                { label: { en: 'Track income and expenses from day one', bg: 'Следиш доходи и разходи от ден едно' }, emoji: '📊', isRight: true, explanation: { en: 'You can not manage what you do not measure.', bg: 'Не можеш да управляваш това, което не измерваш.' } },
                                { label: { en: 'Price your work on "whatever feels nice"', bg: 'Определяш цена както ти се струва' }, emoji: '🎲', isRight: false, explanation: { en: 'Price on value and demand, not vibes.', bg: 'Цени на стойност и търсене, не на усещане.' } },
                            ],
                        },
                    },
                ],
            },
            // ── Lesson 2: Price Like a Pro ──
            {
                id: 'side-hustle-pricing',
                moduleId: 'side-hustles',
                title: { en: 'Price Like a Pro', bg: 'Ценообразувай като професионалист' },
                description: { en: 'The 3 pricing models, when to raise rates, and how to handle discount requests.', bg: 'Трите модела на ценообразуване, кога да вдигаш и как да реагираш на отстъпки.' },
                icon: '💸', xpReward: 150, order: 2,
                exercises: [
                    {
                        id: 'sh2-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '💸',
                                title: { en: 'The 3 Pricing Models', bg: 'Трите модела за ценообразуване' },
                                body: { en: '⏰ HOURLY: easy to understand, but caps your income at hours × rate. Penalises you for being fast.\n\n📦 PROJECT / PACKAGE: client pays for the OUTCOME. You make €€/hr go up as you get faster. Best for service work.\n\n🔁 RETAINER / SUBSCRIPTION: client pays monthly for ongoing access. Most stable income, fastest path to "boring" wealth.\n\nMost beginners start hourly and stay stuck there. The leap to packages can DOUBLE your effective rate overnight.', bg: '⏰ ПО ЧАС: лесно, но таванът е часове × ставка. Наказва те, че си бърз.\n\n📦 ПРОЕКТ / ПАКЕТ: клиентът плаща за РЕЗУЛТАТА. Ставката ти расте с бързината. Най-добро за услуги.\n\n🔁 РЕТЕЙНЕР / АБОНАМЕНТ: клиентът плаща месечно за достъп. Най-стабилен доход.\n\nПовечето започват по час и засядат там. Скокът към пакети може да УДВОИ ефективната ставка.' },
                                highlight: { en: '🚀 Price by VALUE delivered, not by hours spent. Your client doesn\'t pay for your time — they pay for their problem to disappear.', bg: '🚀 Ценообразувай по СТОЙНОСТТА, не по времето. Клиентът не плаща за часовете — плаща проблемът му да изчезне.' },
                            },
                            {
                                emoji: '📈',
                                title: { en: 'When to Raise Prices', bg: 'Кога да вдигаш цените' },
                                body: { en: 'You\'re ready to raise prices when ANY of these are true:\n\n✅ You\'re fully booked / turning work away\n✅ You\'ve delivered for 5+ happy clients at the current rate\n✅ Your effective hourly rate is below €30/h after taxes\n✅ It\'s been 6+ months since your last raise\n\nRaise by 20–30%. The clients who say no were going to leave anyway. The ones who stay value you more.', bg: 'Готов си да вдигнеш цените при ВСЯКО от:\n\n✅ Напълно си зает / отказваш работа\n✅ Доставил си на 5+ доволни клиенти\n✅ Ефективната ставка след данъци е под €30/ч\n✅ Минали са 6+ месеца от последното повишение\n\nВдигни с 20–30%. Тези, които напуснат, и без това щяха. Останалите те ценят повече.' },
                                highlight: { en: '💪 Higher prices = better clients. Cheap clients eat the most time and complain the most.', bg: '💪 По-високи цени = по-добри клиенти. Евтините клиенти ядат най-много време и се оплакват най-много.' },
                            },
                        ],
                    },
                    {
                        id: 'sh2-fill-num-1', type: 'fill_number', xp: 20,
                        fillNumberScenario: { en: 'You quoted a €500 flat fee for a logo project. It took you 8 hours total.', bg: 'Оферира €500 фиксирана такса за лого. Отне ти 8 часа.' },
                        question: { en: 'What\'s your effective hourly rate (€/h)?', bg: 'Каква е ефективната ти ставка (€/ч)?' },
                        fillNumberAnswer: 62.5, fillNumberTolerance: 2, fillNumberUnit: '€',
                        fillNumberHint: { en: 'Total paid ÷ total hours = effective rate', bg: 'Общо платено ÷ общо часове = ефективна ставка' },
                        explanation: { en: '€500 ÷ 8h = €62.50/h. The faster you get at logos, the higher this number climbs — without ever raising the quoted price. Hourly pricing punishes speed; project pricing rewards it.', bg: '€500 ÷ 8ч = €62.50/ч. Колкото по-бърз ставаш, толкова повече расте — без да вдигаш цената. По час наказва скоростта; на проект я награждава.' },
                    },
                    {
                        id: 'sh2-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'The lowest price always wins more clients in the long run.', bg: 'Най-ниската цена винаги печели повече клиенти дългосрочно.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Bottom-of-market prices attract bargain hunters who chase the next discount, demand more for less, and never refer you. Mid-to-premium prices attract clients who actually value your work and refer their friends.', bg: 'НЕВЯРНО. Най-ниските цени привличат ловци на отстъпки, които искат повече за по-малко и не препоръчват. Средните-към-премиум цени привличат хора, които ценят работата ти и препоръчват.' },
                    },
                    {
                        id: 'sh2-decision-1', type: 'scenario_decision', xp: 25,
                        decisionAvatar: '🤝',
                        decisionScenario: { en: 'Your fastest-growing client (€2,000/mo retainer) asks for a 20% discount. They say their budget is tight. What\'s your move?', bg: 'Най-бързо растящият ти клиент (€2,000/мес ретейнер) иска 20% отстъпка. Бюджетът им бил тесен. Ходът ти?' },
                        decisionChoices: [
                            { label: { en: 'Give the 20% discount to keep the relationship', bg: 'Дай 20% отстъпка да запазиш отношенията' }, emoji: '😬', outcome: { en: 'Bad precedent. You lose €400/mo (€4,800/yr) AND signal that your prices are negotiable. Other clients will ask too. Within a year you\'ll be underpaid across the board.', bg: 'Лош прецедент. Губиш €400/мес (€4,800/год.) И сигнализираш, че цените се пазарят. И други ще питат. За година си недоплатен навсякъде.' }, isBest: false },
                            { label: { en: 'Counter: same price, but reduce scope to fit their budget', bg: 'Контра: същата цена, по-малък обхват за бюджета им' }, emoji: '✂️', outcome: { en: 'Excellent. You hold your rate AND solve their problem. If they truly have budget constraints, this works. If they were testing you, your rate stays protected. Win-win.', bg: 'Отлично. Държиш ставката И решаваш проблема им. Ако наистина имат бюджет — работи. Ако те тестват — ставката остана. Печеливша.' }, isBest: true },
                            { label: { en: 'Politely decline; offer a 6-month payment plan instead', bg: 'Откажи учтиво; предложи 6-месечен план за плащане' }, emoji: '📅', outcome: { en: 'Reasonable backup. Holds your rate. Works if the client\'s issue is cash flow, not value. Slightly worse than scope-cut because you carry the risk of late payment.', bg: 'Резервен вариант. Държи ставката. Работи ако проблемът е кеш, не стойност. Малко по-зле от скоп-кът — носиш риск за закъснели плащания.' }, isBest: false },
                            { label: { en: 'Drop them — discount-seekers are red flags', bg: 'Откажи им — отстъпко-търсачите са червен флаг' }, emoji: '🚩', outcome: { en: 'Too aggressive for a long-term client asking once. Reserve this response for clients who repeatedly bargain, miss deadlines, or scope-creep. One discount request isn\'t a red flag.', bg: 'Прекалено агресивно за дългогодишен клиент с едно питане. Запази го за такива, които постоянно се пазарят, закъсняват, разширяват обхвата без плащане.' }, isBest: false },
                        ],
                        explanation: { en: 'Discount requests are about value perception, not money. Re-anchor on value: cut scope, not rate. Your rate is your rate.', bg: 'Заявките за отстъпка са за възприемана стойност, не пари. Закотви се в стойността: режи обхвата, не ставката.' },
                    },
                    {
                        id: 'sh2-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'COGS', bg: 'COGS' }, definition: { en: 'Cost of Goods Sold — direct cost to deliver each sale', bg: 'Директна цена за доставяне на всяка продажба' } },
                            { term: { en: 'Gross margin', bg: 'Брутен марж' }, definition: { en: '(Revenue − COGS) ÷ Revenue — your "real" % profit before overhead', bg: '(Приход − COGS) ÷ Приход — "истинският" % печалба преди разходи' } },
                            { term: { en: 'Retainer', bg: 'Ретейнер' }, definition: { en: 'Fixed monthly fee for ongoing access or work', bg: 'Фиксирана месечна такса за постоянен достъп' } },
                            { term: { en: 'Breakeven', bg: 'Точка на изравняване' }, definition: { en: 'Revenue exactly equals total costs — €0 profit', bg: 'Приходите равни на разходите — €0 печалба' } },
                            { term: { en: 'Value-based pricing', bg: 'Ценообразуване по стойност' }, definition: { en: 'Price reflects client\'s outcome, not your time spent', bg: 'Цената отразява резултата за клиента, не часовете ти' } },
                        ],
                    },
                    {
                        id: 'sh2-rpg-1', type: 'rpg_scenario', xp: 25,
                        scenario: { en: 'Sunday evening. A long-time client texts: "EMERGENCY — need the project done by tomorrow 9am. Can you?" Your normal rate is €40/h. What do you reply?', bg: 'Неделя вечер. Дълготраен клиент: "СПЕШНО — нужно е готово до утре 9 ч. Можеш ли?" Обичайна ставка €40/ч. Какво отговаряш?' },
                        avatar: '⏰',
                        choices: [
                            { label: { en: 'Do it free — they\'re a great long-term client', bg: 'Направи го безплатно — добър дългогодишен клиент' }, emoji: '🆓', consequence: { en: 'You burn your Sunday and signal that "emergency = free." They\'ll keep doing it. After 6 months you\'re resentful and quietly ghost them. Worst outcome.', bg: 'Гориш неделята си и сигнализираш "спешно = безплатно". Ще го правят постоянно. След 6 м. си обиден и тихо ги изоставяш.' }, cashFlowChange: -300, isGood: false },
                            { label: { en: 'Quote 2× rush rate (€80/h). They can accept or wait.', bg: 'Оферирай 2× спешна ставка (€80/ч). Приемат или чакат.' }, emoji: '🚀', consequence: { en: 'Best move. They accept because they truly need it (and respect you more). You lock in €640 for the night AND set the rush-fee precedent for future emergencies.', bg: 'Най-добрият ход. Приемат, защото им трябва (и те уважават повече). €640 за нощта И установяваш прецедента "спешно = по-висока ставка".' }, cashFlowChange: 640, isGood: true },
                            { label: { en: 'Refuse — Sundays are sacred', bg: 'Откажи — неделята е свещена' }, emoji: '🛑', consequence: { en: 'Fair boundary if you stick to it long-term. They\'ll find another freelancer who undercharges. You lose this gig but preserve your Sunday and your sanity.', bg: 'Честна граница, ако я държиш дълго. Те ще намерят друг евтин фрийлансър. Губиш гига, но запазваш неделята и здравия си разум.' }, cashFlowChange: 0, isGood: true },
                        ],
                    },
                    {
                        id: 'sh2-streams-1', type: 'income_streams', xp: 35,
                        incomeStreams: {
                            scenario: { en: 'You\'ve been hustling for 6 months. Skills are sharper, contacts wider. New goal: €1,200/mo with up to 20 hours/week, max 4 streams.', bg: 'След 6 месеца бизнес. Уменията остри, контактите широки. Нова цел: €1,200/мес с до 20 часа/седм., макс 4 потока.' },
                            question: { en: 'Build a €1,200/mo mix using your sharpened skills', bg: 'Изгради микс за €1,200/мес с подостри умения' },
                            targetIncome: 1200,
                            maxHoursPerWeek: 20,
                            minPicks: 2,
                            maxPicks: 4,
                            streams: [
                                { label: { en: 'Freelance web development', bg: 'Фрийланс уеб разработка' }, emoji: '💻', hoursPerWeek: 8, eurPerHour: 60, scalability: 4 },
                                { label: { en: 'Online tutoring (premium)', bg: 'Онлайн уроци (премиум)' }, emoji: '🎓', hoursPerWeek: 5, eurPerHour: 40, scalability: 3 },
                                { label: { en: 'YouTube ad revenue', bg: 'YouTube приходи от реклама' }, emoji: '📺', hoursPerWeek: 4, eurPerHour: 10, scalability: 5, note: { en: 'Builds for years', bg: 'Расте с години' } },
                                { label: { en: 'Affiliate marketing blog', bg: 'Афилиейт блог' }, emoji: '🔗', hoursPerWeek: 3, eurPerHour: 15, scalability: 4 },
                                { label: { en: 'Local handyman gigs', bg: 'Местни майсторски услуги' }, emoji: '🔧', hoursPerWeek: 6, eurPerHour: 25, scalability: 2 },
                                { label: { en: 'Freelance copywriting', bg: 'Фрийланс копирайт' }, emoji: '✍️', hoursPerWeek: 4, eurPerHour: 45, scalability: 4 },
                                { label: { en: '1:1 coaching calls', bg: '1:1 коучинг разговори' }, emoji: '💬', hoursPerWeek: 3, eurPerHour: 80, scalability: 5, note: { en: 'High leverage', bg: 'Висок лост' } },
                            ],
                        },
                        explanation: { en: 'Strong combos: web dev (8h, €1,920) alone meets it. Or tutoring + copywriting (9h, €1,520). Or coaching + affiliate (6h, €960) + YouTube (4h, €160) = €1,120 — close but builds long-term assets. Avoid handyman alone (€600).', bg: 'Силни комбинации: уеб дев (8ч, €1,920) сам стига. Уроци + копирайт (9ч, €1,520). Коучинг + афилиейт (6ч, €960) + YouTube (4ч, €160) = €1,120 — изгражда дългосрочни активи.' },
                    },
                ],
            },
            // ── Lesson 3: From Hustle to Business ──
            {
                id: 'side-hustle-business',
                moduleId: 'side-hustles',
                title: { en: 'From Hustle to Business', bg: 'От страничен бизнес към истински бизнес' },
                description: { en: 'When to systemize, when to quit your job, and what structure to choose.', bg: 'Кога да систематизираш, кога да напуснеш работа и каква форма да избереш.' },
                icon: '🏛️', xpReward: 160, order: 3,
                exercises: [
                    {
                        id: 'sh3-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🚪',
                                title: { en: 'When Is It Ready to Replace Your Job?', bg: 'Кога е готов да замени работата?' },
                                body: { en: 'Don\'t quit when hustle income MATCHES your salary — quit when it EXCEEDS it AND has been stable for 6+ months.\n\nThe checklist before resigning:\n\n✅ Hustle income > 1.3× job income (variability buffer)\n✅ 12+ months of expenses saved (runway)\n✅ Health insurance figured out\n✅ Income has been stable or growing for 6+ months\n✅ You\'ve already turned away work at current rates\n\nMost people quit too early. The cost of going back is enormous.', bg: 'Не напускай, когато бизнесът е РАВЕН на заплатата — напусни, когато я НАДВИШАВА И е стабилен 6+ месеца.\n\nСписъкът преди оставка:\n\n✅ Бизнес доход > 1.3× работа (буфер за вариация)\n✅ 12+ месеца разходи спестени\n✅ Здравна осигуровка решена\n✅ Доходът е стабилен или расте 6+ м.\n✅ Вече си отказвал работа при текущи ставки\n\nПовечето напускат рано. Цената на връщане е огромна.' },
                                highlight: { en: '🛡️ Your day job is the cheapest investment in your hustle\'s safety. Don\'t kill it prematurely.', bg: '🛡️ Основната работа е най-евтината инвестиция в безопасността на бизнеса ти. Не я убивай рано.' },
                            },
                            {
                                emoji: '🏗️',
                                title: { en: 'Pick Your Structure', bg: 'Избери структурата' },
                                body: { en: '👤 SOLE PROPRIETOR: simplest. You ARE the business. Cheap to set up but your personal assets are at risk if sued.\n\n🛡️ LLC / LIMITED: separates personal vs business assets. Slightly more paperwork + small annual fee. Right for most service businesses.\n\n🏢 CORPORATION: complex, expensive. Right only if you plan to raise investment or scale to many employees.\n\nDefault recommendation for a first real business: LLC / Limited. The liability protection is cheap insurance.', bg: '👤 ЕДНОЛИЧЕН ТЪРГОВЕЦ: най-просто. Ти СИ бизнесът. Евтино, но личните активи са на риск при съдебно дело.\n\n🛡️ ООД / Limited: разделя личните от бизнес активите. Малко документация + малка годишна такса. Подходящо за повечето услуги.\n\n🏢 КОРПОРАЦИЯ: сложно, скъпо. Само ако ще привличаш инвестиции или много служители.\n\nПрепоръка по подразбиране: ООД. Защитата от отговорност е евтина застраховка.' },
                                highlight: { en: '⚠️ Always consult an accountant in your country — tax rules vary wildly.', bg: '⚠️ Винаги се консултирай с счетоводител в страната си — данъчните правила варират силно.' },
                            },
                        ],
                    },
                    {
                        id: 'sh3-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'Order these systemization steps from FIRST to LAST when turning your hustle into a real business:', bg: 'Подреди стъпките за систематизация от ПЪРВА към ПОСЛЕДНА:' },
                        orderItems: [
                            { label: { en: 'Track every euro of revenue & expense', bg: 'Записвай всяко евро приход и разход' }, emoji: '📊' },
                            { label: { en: 'Define your repeatable signature service / product', bg: 'Дефинирай повтаряема "подписана" услуга / продукт' }, emoji: '🎯' },
                            { label: { en: 'Build a simple website + intake form', bg: 'Прост сайт + форма за поръчки' }, emoji: '🌐' },
                            { label: { en: 'Create standard contracts & invoices', bg: 'Стандартни договори и фактури' }, emoji: '📄' },
                            { label: { en: 'Set up business banking + tax registration', bg: 'Бизнес банкова сметка + данъчна регистрация' }, emoji: '🏦' },
                            { label: { en: 'Hire your first contractor for low-leverage tasks', bg: 'Наеми първи изпълнител за нисколостни задачи' }, emoji: '🤝' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4, 5],
                        explanation: { en: 'Order matters: you can\'t price properly without tracking, can\'t market without a service definition, can\'t protect yourself without contracts, and CAN\'T outsource without a system to outsource INTO.', bg: 'Редът е важен: не можеш да ценообразуваш без записи, да продаваш без дефиниция, да се защитиш без договори, и НЕ МОЖЕШ да делегираш без система за делегиране.' },
                    },
                    {
                        id: 'sh3-decision-1', type: 'scenario_decision', xp: 30,
                        decisionAvatar: '🎢',
                        decisionScenario: { en: 'Your hustle has hit €2,000/mo for 3 straight months. Your day job pays €3,500/mo + health insurance + retirement match. Friends are pushing you to "go all in." What do you do?', bg: 'Бизнесът ти достигна €2,000/мес 3 поредни месеца. Заплатата е €3,500/мес + здравна осигуровка + пенсионна вноска. Приятели те бутат "ва-банк". Какво правиш?' },
                        decisionChoices: [
                            { label: { en: 'Quit immediately — 100% focus will accelerate growth', bg: 'Напусни веднага — 100% фокус ще ускори растежа' }, emoji: '🔥', outcome: { en: 'Premature. €2,000 < €3,500 + benefits. Without the safety net, ANY slow month forces panic decisions: bad clients, low prices, burnout. 70% of people who quit at this stage return to a job within a year.', bg: 'Преждевременно. €2,000 < €3,500 + бонуси. Без мрежата всеки бавен месец = паника: лоши клиенти, ниски цени, прегаряне. 70% се връщат на работа за година.' }, isBest: false },
                            { label: { en: 'Wait until hustle hits €5,250+ for 6 straight months (1.5× salary)', bg: 'Изчакай бизнесът да достигне €5,250+ за 6 поредни месеца (1.5× заплата)' }, emoji: '📈', outcome: { en: 'Textbook move. 1.5× covers the loss of benefits + builds a vacancy buffer. 6 months proves it\'s real, not lucky. You quit from strength, not desperation.', bg: 'Класически ход. 1.5× покрива загубата на бонуси + буфер. 6 м. доказват реалност, не късмет. Напускаш от сила, не от отчаяние.' }, isBest: true },
                            { label: { en: 'Negotiate down to 30h/wk at the day job to grow hustle', bg: 'Договори 30 ч/седм. на основната работа за растеж' }, emoji: '⚖️', outcome: { en: 'Good compromise IF your employer allows it. You get extra hours back for hustle work while keeping benefits. Real-world adoption is rare — most employers say no.', bg: 'Добър компромис, АКО работодателят позволи. Допълнителни часове за бизнеса при запазени бонуси. На практика рядко.' }, isBest: false },
                            { label: { en: 'Keep both indefinitely — never quit, always have a safety net', bg: 'Двете завинаги — никога не напускай, винаги мрежа' }, emoji: '♾️', outcome: { en: 'Comfortable but caps your growth. At some point the hustle needs YOUR full focus to scale. The right answer is to BE READY to quit when the math works — not to commit to "never."', bg: 'Удобно, но ограничава растежа. В даден момент трябва ПЪЛЕН фокус, за да мащабираш. Правилно: бъди ГОТОВ да напуснеш — не "никога".' }, isBest: false },
                        ],
                        explanation: { en: 'The "boring" 1.5× threshold beats both fast quitters and never-quitters. Most successful founders quit AFTER the math is overwhelming, not before.', bg: 'Скучният праг 1.5× бие и бързите напускащи, и тези, които никога не напускат. Повечето успешни основатели напускат СЛЕД като математиката е очевидна.' },
                    },
                    {
                        id: 'sh3-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Sole proprietor', bg: 'Едноличен търговец' }, definition: { en: 'Simplest structure — owner and business are legally the same', bg: 'Най-проста форма — собственикът и бизнесът са едно лице' } },
                            { term: { en: 'LLC / Limited', bg: 'ООД / Limited' }, definition: { en: 'Liability protection — separates personal from business assets', bg: 'Защита от отговорност — разделя личните от бизнес активите' } },
                            { term: { en: 'MRR', bg: 'MRR' }, definition: { en: 'Monthly Recurring Revenue — predictable monthly income', bg: 'Месечен повтарящ се приход — предсказуем доход' } },
                            { term: { en: 'Runway', bg: 'Runway' }, definition: { en: 'Months you can survive without new income', bg: 'Месеците, в които можеш да оцелееш без нов доход' } },
                            { term: { en: 'Sweat equity', bg: 'Sweat equity' }, definition: { en: 'Ownership earned through work instead of cash', bg: 'Собственост, спечелена чрез работа вместо пари' } },
                            { term: { en: 'Cash flow', bg: 'Паричен поток' }, definition: { en: 'Money in minus money out over a time period', bg: 'Парите вътре минус парите навън за период' } },
                        ],
                    },
                    {
                        id: 'sh3-streams-1', type: 'income_streams', xp: 40,
                        incomeStreams: {
                            scenario: { en: 'Final boss: design a €2,000/month replacement-income mix. You\'ve quit your day job and have 25 hours/week of focused business time. Pick 3–5 streams.', bg: 'Финалният тест: дизайн на микс за €2,000/мес заместване. Напусна работата и имаш 25 ч/седм. фокусирано бизнес време. Избери 3–5 потока.' },
                            question: { en: 'Design a €2,000/mo replacement-income mix in ≤25h/wk', bg: 'Дизайн на микс за €2,000/мес в ≤25ч/седм.' },
                            targetIncome: 2000,
                            maxHoursPerWeek: 25,
                            minPicks: 3,
                            maxPicks: 5,
                            streams: [
                                { label: { en: 'High-end web dev clients', bg: 'Премиум уеб дев клиенти' }, emoji: '💻', hoursPerWeek: 10, eurPerHour: 80, scalability: 4 },
                                { label: { en: 'Online course sales', bg: 'Продажба на онлайн курс' }, emoji: '🎬', hoursPerWeek: 5, eurPerHour: 30, scalability: 5, note: { en: 'Builds asset over time', bg: 'Изгражда актив във времето' } },
                                { label: { en: 'Consulting retainer (€2k/mo client)', bg: 'Ретейнер за консултации (клиент €2k/мес)' }, emoji: '💼', hoursPerWeek: 8, eurPerHour: 100, scalability: 5 },
                                { label: { en: 'Affiliate marketing site', bg: 'Афилиейт сайт' }, emoji: '🔗', hoursPerWeek: 4, eurPerHour: 25, scalability: 4 },
                                { label: { en: 'Freelance copywriting', bg: 'Фрийланс копирайт' }, emoji: '✍️', hoursPerWeek: 6, eurPerHour: 60, scalability: 4 },
                                { label: { en: 'Micro-SaaS product', bg: 'Микро-SaaS продукт' }, emoji: '⚙️', hoursPerWeek: 3, eurPerHour: 20, scalability: 5, note: { en: 'Slow start, huge ceiling', bg: 'Бавен старт, огромен таван' } },
                                { label: { en: 'Group coaching cohorts', bg: 'Групов коучинг' }, emoji: '👥', hoursPerWeek: 4, eurPerHour: 120, scalability: 5 },
                                { label: { en: 'Passive stock photos', bg: 'Пасивни stock снимки' }, emoji: '📸', hoursPerWeek: 2, eurPerHour: 15, scalability: 4 },
                            ],
                        },
                        explanation: { en: 'Strong combo: consulting retainer (8h, €3,200) + course (5h, €600) + group coaching (4h, €1,920) — 17h, €5,720, with 8h spare for marketing. The trick: stack ONE high-paying anchor with 1–2 leveraged assets.', bg: 'Силна комбинация: ретейнер (8ч, €3,200) + курс (5ч, €600) + групов коучинг (4ч, €1,920) — 17ч, €5,720, 8ч за маркетинг. Трикът: ЕДИН добре платен анкер + 1–2 лостови актива.' },
                    },
                    {
                        id: 'sh3-fill-num-1', type: 'fill_number', xp: 20,
                        fillNumberScenario: { en: 'You spend €3,000/month total (rent, food, bills). You have €18,000 in savings.', bg: 'Харчиш €3,000/месец общо (наем, храна, сметки). Имаш €18,000 спестени.' },
                        question: { en: 'How many months of runway do you have?', bg: 'Колко месеца runway имаш?' },
                        fillNumberAnswer: 6, fillNumberTolerance: 0, fillNumberUnit: '',
                        fillNumberHint: { en: 'Runway = savings ÷ monthly expenses', bg: 'Runway = спестявания ÷ месечни разходи' },
                        explanation: { en: '€18,000 ÷ €3,000 = 6 months. The startup-advice consensus says 12+ months before quitting a stable job. 6 months is enough for a 3-month "trial leave" but tight for a full quit.', bg: '€18,000 ÷ €3,000 = 6 месеца. Стандартът: 12+ месеца преди да напуснеш стабилна работа. 6 м. стигат за "пробен" период, но са малко за пълно напускане.' },
                    },
                    {
                        id: 'sh3-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'Once your side hustle replaces your salary, you have total freedom and zero risk.', bg: 'Щом бизнесът замени заплатата, имаш пълна свобода и нула риск.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. You lose employer benefits (health insurance, paid leave, pension match), income becomes variable, taxes get more complex, and YOU are now the marketing, sales, ops, and support department. Freedom yes — risk-free no.', bg: 'НЕВЯРНО. Губиш бонуси (здравна, отпуск, пенсия), доходът става променлив, данъците — по-сложни, и ТИ си маркетинг, продажби, операции, поддръжка. Свобода да — без риск не.' },
                    },
                ],
            },
        ],
    },
    // ─────────────────────────────────────────────
    // MODULE 6 — INSURANCE FUNDAMENTALS
    // Signature interactive: coverage_calc (tune premium / deductible / limit)
    // ─────────────────────────────────────────────
    {
        id: 'insurance',
        title: { en: 'Insurance Fundamentals', bg: 'Основи на застраховането' },
        description: { en: 'Protect your wealth before you build it — without overpaying for fear.', bg: 'Защити богатството си, без да преплащаш от страх.' },
        icon: '🛡️', color: 'blue', order: 6,
        lessons: [
            // ── Lesson 1: Insurance 101 — What You Actually Need ──
            {
                id: 'insurance-essentials',
                moduleId: 'insurance',
                title: { en: 'What You Actually Need', bg: 'Какво наистина ти трябва' },
                description: { en: 'Risk transfer basics, which policies matter, and tuning your first auto policy.', bg: 'Основи на трансфер на риск, кои полици са важни и настройка на първа автомобилна.' },
                icon: '🛡️', xpReward: 150, order: 1,
                exercises: [
                    {
                        id: 'ins1-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🛡️',
                                title: { en: 'Insurance = Risk Transfer', bg: 'Застраховка = трансфер на риск' },
                                body: { en: 'You don\'t buy insurance because you EXPECT to claim. You buy it for the ONE event that would otherwise destroy you financially.\n\nRules of thumb:\n✅ Cover the catastrophic (€20k+ losses you can\'t absorb)\n❌ Skip the small stuff (extended warranties, gadget insurance, low-deductible cosmetic add-ons)\n\nIf the worst case is "I have to save up €1,000" — DON\'T insure it. Self-insure with an emergency fund. If the worst case is "I lose my house" — insure it.', bg: 'Не купуваш застраховка, защото ОЧАКВАШ щета. Купуваш я за ЕДНОТО събитие, което иначе би те унищожило финансово.\n\nПравила:\n✅ Покрий катастрофичното (€20к+ загуба)\n❌ Пропусни малките (удължени гаранции, гаджет-застраховки)\n\nАко най-лошото е "трябва да спестя €1,000" — НЕ застраховай. Самозастраховай се с авариен фонд. Ако най-лошото е "губя къщата" — застраховай.' },
                                highlight: { en: '🎯 Insure the catastrophic. Self-insure the small. Skip the gadget warranties.', bg: '🎯 Застраховай катастрофичното. Самозастраховай малкото. Пропусни гаджет-гаранциите.' },
                            },
                            {
                                emoji: '⚙️',
                                title: { en: 'The 4 Levers of Every Policy', bg: '4-те лоста на всяка полица' },
                                body: { en: 'Every policy has 4 dials:\n\n💸 PREMIUM — what you pay per year\n🧾 DEDUCTIBLE — what YOU pay before insurance kicks in\n🛡️ COVERAGE LIMIT — the max insurer will pay out\n📋 EXCLUSIONS — what they refuse to cover\n\nThe trade-off: higher deductible = lower premium. Higher coverage limit = higher premium. Tuning these for YOUR risk profile is the whole game.', bg: 'Всяка полица има 4 настройки:\n\n💸 ВНОСКА — какво плащаш годишно\n🧾 САМОУЧАСТИЕ — какво ТИ плащаш преди застраховката да тръгне\n🛡️ ЛИМИТ — максималното, което застрахователят ще плати\n📋 ИЗКЛЮЧЕНИЯ — какво отказват да покрият\n\nТеглото: по-високо самоучастие = по-ниска вноска. По-висок лимит = по-висока вноска.' },
                                highlight: { en: '💡 The highest deductible you can comfortably pay = the lowest fair premium.', bg: '💡 Най-високото самоучастие, което можеш да платиш = най-ниската честна вноска.' },
                            },
                        ],
                    },
                    {
                        id: 'ins1-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Premium', bg: 'Вноска' }, definition: { en: 'What you pay the insurer per month or year', bg: 'Какво плащаш на застрахователя месечно/годишно' } },
                            { term: { en: 'Deductible', bg: 'Самоучастие' }, definition: { en: 'Amount you pay yourself BEFORE insurance pays anything', bg: 'Сумата, която ти плащаш ПРЕДИ застраховката' } },
                            { term: { en: 'Coverage limit', bg: 'Лимит на покритие' }, definition: { en: 'Maximum the insurer will pay out per claim', bg: 'Максимумът, който застрахователят ще плати' } },
                            { term: { en: 'Claim', bg: 'Иск / щета' }, definition: { en: 'Formal request to be paid after a covered event', bg: 'Официална заявка за плащане след покрито събитие' } },
                            { term: { en: 'Underwriting', bg: 'Андеррайтинг' }, definition: { en: 'Insurer\'s risk assessment that sets your premium', bg: 'Оценката на риска, която определя вноската ти' } },
                        ],
                    },
                    {
                        id: 'ins1-sort-1', type: 'sort_items', xp: 25,
                        sortItems: [
                            { label: { en: 'Health insurance', bg: 'Здравна застраховка' }, emoji: '⚕️', isAsset: true },
                            { label: { en: 'Liability insurance (car/home)', bg: 'Гражданска отговорност' }, emoji: '🚗', isAsset: true },
                            { label: { en: 'Extended warranty on a €600 laptop', bg: 'Удължена гаранция за лаптоп €600' }, emoji: '💻', isAsset: false },
                            { label: { en: 'Term life if you have dependents', bg: 'Срочна Живот, ако имаш зависими' }, emoji: '👨‍👩‍👧', isAsset: true },
                            { label: { en: 'Phone screen insurance', bg: 'Застраховка на екран на телефона' }, emoji: '📱', isAsset: false },
                            { label: { en: 'Flight cancellation for a €120 ticket', bg: 'Анулиране на полет за €120 билет' }, emoji: '✈️', isAsset: false },
                            { label: { en: 'Disability insurance', bg: 'Застраховка инвалидност' }, emoji: '🦽', isAsset: true },
                            { label: { en: 'Identity theft "monitoring" service', bg: '"Мониторинг" за кражба на самоличност' }, emoji: '🕵️', isAsset: false },
                        ],
                    },
                    {
                        id: 'ins1-coverage-1', type: 'coverage_calc', xp: 35,
                        coverageCalc: {
                            scenario: { en: 'You own a €15,000 car. Annual accident odds for a safe driver: ~4%. Tune your auto policy — cover the catastrophic, accept small repairs yourself.', bg: 'Имаш кола за €15,000. Шанс за щета при безопасен шофьор: ~4%/год. Настрой полицата — покрий голямата щета, плати малките сам.' },
                            question: { en: 'Pick the smartest premium / deductible / coverage combo', bg: 'Избери най-умната комбинация вноска / самоучастие / покритие' },
                            claimProbability: 0.04,
                            expectedLoss: 15000,
                            premiumMin: 200,
                            premiumMax: 1200,
                            premiumStep: 50,
                            deductibleOptions: [200, 500, 1000, 2000],
                            coverageLimitOptions: [5000, 10000, 15000, 25000],
                            correctPremium: 500,
                            correctDeductible: 1000,
                            correctCoverageLimit: 15000,
                            tolerance: 50,
                        },
                        explanation: { en: '€1,000 deductible (you absorb routine repairs) + €15k limit (= full car replacement) + €500/yr premium. Higher coverage is wasteful (car only worth €15k). Lower deductible would cost €200+/yr extra for marginal benefit.', bg: '€1,000 самоучастие (поемаш редовните дребни) + €15к лимит (= пълна замяна) + €500/год вноска. По-висок лимит е разход без полза (колата струва €15к).' },
                    },
                    {
                        id: 'ins1-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'The lowest possible deductible is always the safest financial choice.', bg: 'Най-ниското възможно самоучастие е най-сигурният финансов избор.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Lower deductibles raise your annual premium more than they save you in deductibles over time (because most years you don\'t claim). Optimal: deductible = the biggest amount you could comfortably pay tomorrow without panic.', bg: 'НЕВЯРНО. По-ниските самоучастия вдигат вноската повече, отколкото ти спестяват с времето (защото повечето години не предявяваш иск). Оптимално: самоучастие = най-голямата сума, която можеш спокойно да платиш утре.' },
                    },
                    {
                        id: 'ins1-decision-1', type: 'scenario_decision', xp: 25,
                        decisionAvatar: '💻',
                        decisionScenario: { en: 'You\'re buying a €600 laptop. The store offers a "2-year extended warranty + accident protection" for €120 (20% of laptop price). Do you take it?', bg: 'Купуваш лаптоп за €600. Магазинът предлага "2-годишна удължена гаранция + защита от инциденти" за €120 (20% от цената). Взимаш ли?' },
                        decisionChoices: [
                            { label: { en: 'Yes — peace of mind is worth €120', bg: 'Да — спокойствието си струва €120' }, emoji: '😌', outcome: { en: 'Industry data: ~5% of laptops fail in extended-warranty period. Expected payout: 5% × €600 = €30. You paid €120. The store keeps €90 as pure profit. This is one of retail\'s most profitable products for a reason.', bg: 'Реални данни: ~5% от лаптопите се развалят в периода. Очаквана изплатена сума: 5% × €600 = €30. Платил си €120. Магазинът печели €90. Това е една от най-печелившите услуги в търговията.' }, isBest: false },
                            { label: { en: 'Skip it — self-insure with a €120 buffer in savings', bg: 'Пропусни — самозастраховай се с €120 буфер в спестявания' }, emoji: '🐷', outcome: { en: 'Smart. Across 5 laptops in a lifetime, you save €600 in declined warranties for the cost of MAYBE one €300 repair. Self-insure small, predictable risks — every time.', bg: 'Умно. През 5 лаптопа в живота, спестяваш €600 от отказани гаранции срещу евентуално един ремонт от €300.' }, isBest: true },
                            { label: { en: 'Negotiate the warranty down to €40', bg: 'Договори гаранцията до €40' }, emoji: '🗣️', outcome: { en: 'Better than €120. €40 ≈ break-even-fair price for the actual risk. But you still spend mental energy on a tiny risk. Skipping is cleaner.', bg: 'По-добре от €120. €40 ≈ справедлива цена за реалния риск. Но харчиш мисловна енергия за малък риск.' }, isBest: false },
                            { label: { en: 'Buy the laptop on a credit card with purchase protection', bg: 'Плати с кредитна карта със защита на покупки' }, emoji: '💳', outcome: { en: 'Smart hack — many premium credit cards include 90-day to 2-year purchase protection AT NO EXTRA COST. Same protection for free. Use this on big purchases.', bg: 'Умен хак — много премиум карти включват 90 дни до 2 години защита БЕЗПЛАТНО. Същата защита без разход.' }, isBest: false },
                        ],
                        explanation: { en: 'Extended warranties on items under €1,000 are almost always a bad deal — they\'re priced for the SELLER\'s margin, not for the actual risk you face.', bg: 'Удължените гаранции под €1,000 почти винаги са лоша сделка — цената е за маржа на продавача, не за реалния риск.' },
                    },
                    {
                        id: 'ins1-speed-1', type: 'speed_round', xp: 25,
                        speedRound: {
                            prompt: { en: 'Insurance basics rapid fire!', bg: 'Основи на застраховането — бърз рунд!' },
                            secondsPerQuestion: 8, passScore: 0.6,
                            questions: [
                                { q: { en: 'Insurance is worth buying for risks that are…', bg: 'Застраховката си струва за рискове, които са…' }, options: [{ en: 'Rare but financially ruinous', bg: 'Редки, но финансово опустошителни' }, { en: 'Small and frequent', bg: 'Малки и чести' }, { en: 'Certain to happen', bg: 'Сигурни да се случат' }], correctIndex: 0 },
                                { q: { en: 'For a healthy 25-year-old, the MOST vital cover is…', bg: 'За здрав 25-годишен НАЙ-важна е…' }, options: [{ en: 'Health + liability', bg: 'Здравна + гражданска отговорност' }, { en: 'Phone screen cover', bg: 'Застраховка на екран' }, { en: 'Whole-life policy', bg: 'Цяла Живот полица' }], correctIndex: 0 },
                                { q: { en: 'A higher deductible usually means…', bg: 'По-високо самоучастие обикновено значи…' }, options: [{ en: 'A lower premium', bg: 'По-нисък премиум' }, { en: 'A higher premium', bg: 'По-висок премиум' }, { en: 'No coverage', bg: 'Без покритие' }], correctIndex: 0 },
                                { q: { en: 'Insuring your cheap old phone is usually…', bg: 'Застраховането на евтиния стар телефон обикновено е…' }, options: [{ en: 'A waste of money', bg: 'Загуба на пари' }, { en: 'Essential', bg: 'Задължително' }, { en: 'Legally required', bg: 'Изисквано по закон' }], correctIndex: 0 },
                                { q: { en: 'Liability cover mainly protects you from…', bg: 'Гражданската отговорност те пази основно от…' }, options: [{ en: 'Harm you cause to others', bg: 'Вреди, които причиняваш на други' }, { en: 'Your own phone breaking', bg: 'Счупване на твоя телефон' }, { en: 'Stock losses', bg: 'Загуби от акции' }], correctIndex: 0 },
                            ],
                        },
                    },
                ],
            },
            // ── Lesson 2: Tuning Coverage — Deductibles & Trade-offs ──
            {
                id: 'insurance-tuning',
                moduleId: 'insurance',
                title: { en: 'Tuning Coverage', bg: 'Настройка на покритието' },
                description: { en: 'Pick the right deductible, run claim math, and know when to claim vs eat the cost.', bg: 'Избери правилно самоучастие, смятай щети и знай кога да предявиш иск.' },
                icon: '⚙️', xpReward: 160, order: 2,
                exercises: [
                    {
                        id: 'ins2-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '⚖️',
                                title: { en: 'The Deductible Trade-off', bg: 'Тегло на самоучастието' },
                                body: { en: 'Dropping your deductible from €1,000 to €250 typically adds €150–300 to your annual premium.\n\nBut on most policies, you claim once every 5–10 years. So in cash terms:\n\n• High deductible: 5 yrs × €0 + 1 claim × €1,000 = €1,000\n• Low deductible: 5 yrs × €250 in extra premium = €1,250 + €250 deductible on claim = €1,500\n\nThe higher deductible WINS the math — every time. The only reason to lower it is if you can\'t comfortably pay €1,000 tomorrow.', bg: 'Сваляне на самоучастието от €1,000 на €250 обикновено добавя €150–300 към годишната вноска.\n\nНо на повечето полици предявяваш иск веднъж на 5–10 г. Така че:\n\n• Високо: 5 г. × €0 + 1 иск × €1,000 = €1,000\n• Ниско: 5 г. × €250 допълнителна вноска = €1,250 + €250 при иск = €1,500\n\nВисокото самоучастие ПЕЧЕЛИ — винаги.' },
                                highlight: { en: '🎯 Match your deductible to your emergency fund: if you have €5k saved, pick a €1k deductible.', bg: '🎯 Свържи самоучастието с аварийния фонд: имаш €5к — избери €1к самоучастие.' },
                            },
                            {
                                emoji: '🤔',
                                title: { en: 'When NOT to Claim', bg: 'Кога ДА НЕ предявяваш иск' },
                                body: { en: 'A claim isn\'t "free money" — it gets recorded and can raise your premium for 3–5 years.\n\nRule: don\'t claim if the damage is less than 2× your deductible.\n\nExample:\n• €700 damage, €500 deductible → claim nets you €200, but premium goes up €150/yr × 3 yrs = €450 lost. Net: −€250.\n• €5,000 damage, €500 deductible → claim nets you €4,500, premium hike ~€450. Net: +€4,050. Claim.', bg: 'Иск не е "безплатни пари" — записва се и може да вдигне вноската 3–5 г.\n\nПравило: не предявявай, ако щетата е по-малко от 2× самоучастието.\n\nПример:\n• Щета €700, самоучастие €500 → нетна полза €200, вноска +€150/г × 3 г = −€450. Чисто: −€250.\n• Щета €5,000, самоучастие €500 → нетна полза €4,500, вноска +€450. Чисто: +€4,050.' },
                                highlight: { en: '🧾 Small claims often cost MORE than they pay. Save the policy for the big one.', bg: '🧾 Малките искове често струват ПОВЕЧЕ, отколкото плащат.' },
                            },
                        ],
                    },
                    {
                        id: 'ins2-fill-num-1', type: 'fill_number', xp: 25,
                        fillNumberScenario: { en: 'Your home insurance offers two options:\n• Plan A: €400/yr premium, €1,500 deductible\n• Plan B: €600/yr premium, €500 deductible\n\nOver 10 years you expect to claim once.', bg: 'Домашна застраховка с два варианта:\n• A: €400/год, €1,500 самоучастие\n• B: €600/год, €500 самоучастие\n\nЗа 10 г. очакваш 1 иск.' },
                        question: { en: 'How much do you SAVE over 10 years by picking Plan A (in €)?', bg: 'Колко СПЕСТЯВАШ за 10 г., ако избереш A (в €)?' },
                        fillNumberAnswer: 1000, fillNumberTolerance: 50, fillNumberUnit: '€',
                        fillNumberHint: { en: '10-yr cost A = 10×€400 + 1×€1,500. 10-yr cost B = 10×€600 + 1×€500. Difference = ?', bg: '10-г. A = 10×€400 + 1×€1,500. 10-г. B = 10×€600 + 1×€500. Разлика = ?' },
                        explanation: { en: 'A: €4,000 premiums + €1,500 deductible = €5,500. B: €6,000 + €500 = €6,500. Savings: €1,000. The higher deductible wins by €1,000 over a decade. This is why the "rich get rules-driven" — boring math compounds.', bg: 'A: €4,000 вноски + €1,500 самоучастие = €5,500. B: €6,000 + €500 = €6,500. Спестяване: €1,000.' },
                    },
                    {
                        id: 'ins2-coverage-1', type: 'coverage_calc', xp: 35,
                        coverageCalc: {
                            scenario: { en: 'Your apartment + contents are worth €80,000. Fire/theft/water-damage odds ~1.5%/year (urban area). You have €5,000 in emergency savings. Tune your home policy.', bg: 'Апартамент + вещи = €80,000. Шанс за пожар/кражба/щета от вода ~1.5%/г. Имаш €5,000 авариен фонд. Настрой полицата.' },
                            question: { en: 'Pick the optimal home insurance combo', bg: 'Избери оптимална комбинация за домашна застраховка' },
                            claimProbability: 0.015,
                            expectedLoss: 80000,
                            premiumMin: 200,
                            premiumMax: 1500,
                            premiumStep: 50,
                            deductibleOptions: [500, 1000, 2500, 5000],
                            coverageLimitOptions: [40000, 60000, 80000, 120000],
                            correctPremium: 600,
                            correctDeductible: 2500,
                            correctCoverageLimit: 80000,
                            tolerance: 50,
                        },
                        explanation: { en: 'Cover the FULL replacement value (€80k = your total exposure). Don\'t over-insure (€120k is wasted). €2,500 deductible matches your €5k emergency fund. €600/yr is the fair midpoint. Higher coverage limit doesn\'t help because your losses can\'t exceed €80k.', bg: 'Покрий ПЪЛНАТА стойност на замяна (€80к). Не свръхзастраховай (€120к е губеж). €2,500 самоучастие пасва с €5к авариен фонд. €600/год е честна средна точка.' },
                    },
                    {
                        id: 'ins2-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Copay', bg: 'Доплащане' }, definition: { en: 'Fixed amount you pay per service (often health insurance)', bg: 'Фиксирана сума, която плащаш на услуга (често здравна)' } },
                            { term: { en: 'Replacement value', bg: 'Стойност на замяна' }, definition: { en: 'Cost to buy NEW equivalent — not depreciated value', bg: 'Цена за купуване на НОВ еквивалент — не амортизирана стойност' } },
                            { term: { en: 'Actual cash value', bg: 'Действителна стойност' }, definition: { en: 'Depreciated current market value of the item', bg: 'Амортизирана пазарна стойност' } },
                            { term: { en: 'Rider', bg: 'Допълнително покритие' }, definition: { en: 'Add-on coverage for specific items (jewelry, art)', bg: 'Допълнително покритие за конкретни вещи (бижута, изкуство)' } },
                            { term: { en: 'Exclusion', bg: 'Изключение' }, definition: { en: 'A risk specifically NOT covered in the policy', bg: 'Риск, специално НЕ покрит в полицата' } },
                            { term: { en: 'Out-of-pocket max', bg: 'Максимум собствени разходи' }, definition: { en: 'The most you\'ll ever pay in a year — insurer pays 100% after', bg: 'Най-многото, което ще платиш годишно — после застрахователят покрива 100%' } },
                        ],
                    },
                    {
                        id: 'ins2-rpg-1', type: 'rpg_scenario', xp: 25,
                        scenario: { en: 'A storm caused €1,400 in roof damage. Your home policy: €500 deductible. Claim history: clean. Estimated premium increase after claim: €120/yr for 3 yrs.', bg: 'Буря нанесе €1,400 щета на покрива. Полицата: €500 самоучастие. Чиста история. Очаквано увеличение след иск: €120/год за 3 г.' },
                        avatar: '🏠',
                        choices: [
                            { label: { en: 'File the claim — that\'s what insurance is for', bg: 'Предяви иск — за това е застраховката' }, emoji: '📋', consequence: { en: 'Insurer pays €900 (€1,400 − €500). Premium hike: €120 × 3 = €360. Net gain: €540. Borderline call — worth filing but not the obvious win you\'d hope.', bg: 'Застрахователят плаща €900. Вноска +€120 × 3 = €360. Чиста полза: €540. Гранично — заслужава, но не очевидна голяма победа.' }, cashFlowChange: 540, isGood: true },
                            { label: { en: 'Pay out of pocket — keep the clean record', bg: 'Плати сам — запази чистата история' }, emoji: '💰', consequence: { en: 'You\'re out €1,400 today, but no claim recorded. Premium stays flat. Better than filing IF you have 3+ years before policy renewal/comparison shopping. Marginal call.', bg: 'Губиш €1,400 днес, но няма запис. Вноската остава. По-добре от иск АКО имаш 3+ г. до подновяване.' }, cashFlowChange: -1400, isGood: false },
                            { label: { en: 'Get 3 quotes from competitors, then decide', bg: 'Вземи 3 оферти от конкуренти, тогава решавай' }, emoji: '🛒', consequence: { en: 'Best play. If competitors quote LOWER than current premium + €120 hike — file the claim and switch insurers at renewal. If higher — pay out of pocket. Information is leverage.', bg: 'Най-добрият ход. Ако конкурент дава ПО-ниско от текущата + €120 — предяви иск и смени застрахователя. Информацията е лост.' }, cashFlowChange: 800, isGood: true },
                        ],
                    },
                    {
                        id: 'ins2-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'Buying MORE coverage than your asset is worth makes you safer if disaster strikes.', bg: 'Купуването на ПОВЕЧЕ покритие, отколкото активът ти струва, те прави по-сигурен при бедствие.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Insurance only pays the lower of: your actual loss OR the coverage limit. If your apartment is worth €80k, a €120k policy still pays max €80k (your actual loss). You\'re paying for €40k of phantom coverage that can never trigger.', bg: 'НЕВЯРНО. Застраховката плаща по-малкото от: реална загуба ИЛИ лимит. Ако апартаментът е €80к, полица €120к пак плаща макс €80к. Плащаш за €40к фантомно покритие.' },
                    },
                    {
                        id: 'ins2-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'Order the steps to file an insurance claim correctly, from FIRST to LAST:', bg: 'Подреди стъпките за правилно предявяване на иск, от ПЪРВА към ПОСЛЕДНА:' },
                        orderItems: [
                            { label: { en: 'Photograph / document the damage immediately', bg: 'Снимай / документирай щетата веднага' }, emoji: '📸' },
                            { label: { en: 'Read your policy — confirm event is covered', bg: 'Прочети полицата — потвърди, че събитието е покрито' }, emoji: '📄' },
                            { label: { en: 'File the claim within the time window (often 30 days)', bg: 'Подай иск в срок (често 30 дни)' }, emoji: '📋' },
                            { label: { en: 'Cooperate with the adjuster\'s inspection', bg: 'Сътрудничи на оценителя при оглед' }, emoji: '🔍' },
                            { label: { en: 'Get repair quotes (don\'t accept lowball offers)', bg: 'Вземи оферти за ремонт (не приемай ниски)' }, emoji: '🔧' },
                            { label: { en: 'Receive settlement or appeal if low', bg: 'Получи плащане или обжалвай, ако е ниско' }, emoji: '💸' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4, 5],
                        explanation: { en: 'Document FIRST — memories fade and damage gets cleaned up. Read policy SECOND so you don\'t file an exclusion-covered claim. Adjusters can lowball; getting your own quotes gives you leverage to appeal.', bg: 'Документирай ПЪРВО — споменът избледнява. Прочети полицата ВТОРО — да не подаваш иск за изключение. Оценителите дават ниски оферти; собствените оферти ти дават лост.' },
                    },
                ],
            },
            // ── Lesson 3: Health, Life & Long-Term Coverage ──
            {
                id: 'insurance-life-health',
                moduleId: 'insurance',
                title: { en: 'Health, Life & Long-Term Coverage', bg: 'Здравна, Живот и дългосрочни' },
                description: { en: 'Tune health insurance, size term life, and skip the "investment-flavored" traps.', bg: 'Настрой здравна, оразмери срочна Живот и избягвай "инвестиционните" капани.' },
                icon: '⚕️', xpReward: 170, order: 3,
                exercises: [
                    {
                        id: 'ins3-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '⚕️',
                                title: { en: 'Health: The One Bill That Can Bankrupt You', bg: 'Здравна: Сметката, която може да те фалира' },
                                body: { en: 'Even a moderate hospital stay can cost €30,000–€100,000+ before insurance. ONE uninsured serious event = decades of debt.\n\nHealth policy levers:\n💸 PREMIUM: monthly cost\n🧾 DEDUCTIBLE: pay before insurance kicks in\n💊 COPAY: fixed amount per visit/prescription\n🛡️ OUT-OF-POCKET MAX: the most you\'ll EVER pay in a year (your true ceiling)\n\nThe number that actually matters: out-of-pocket max. That\'s your worst-case-scenario for the year.', bg: 'Дори умерена болнична престой може да струва €30,000–€100,000+. ЕДНО незастраховано тежко събитие = десетилетия дълг.\n\nЛостове на здравна:\n💸 ВНОСКА: месечен разход\n🧾 САМОУЧАСТИЕ: преди застраховката тръгне\n💊 ДОПЛАЩАНЕ: фиксирано на посещение\n🛡️ МАКС СОБСТВЕНИ: най-многото, което ВЪОБЩЕ ще платиш годишно\n\nНомерът, който има значение: макс собствени разходи.' },
                                highlight: { en: '🚨 Always pick a plan where you can comfortably pay the out-of-pocket max in a worst-case year.', bg: '🚨 Винаги избирай план с макс собствени, които можеш спокойно да платиш при най-лошата година.' },
                            },
                            {
                                emoji: '🎯',
                                title: { en: 'Term Life vs Whole Life', bg: 'Срочна срещу Цяла Живот' },
                                body: { en: '✅ TERM LIFE — pure insurance. Pays out if you die during the term (10/20/30 yrs). Cheap (~€20–€50/mo for €500k coverage at age 30). Right answer for 95% of people with dependents.\n\n❌ WHOLE LIFE — insurance bundled with an "investment." 5–10× the premium for the same coverage. Returns are typically 2–4% — far worse than DIY-investing the difference.\n\nThe right move: buy CHEAP TERM LIFE for the coverage you need, INVEST the difference in an index fund. You\'ll end up with both protection AND wealth.', bg: '✅ СРОЧНА ЖИВОТ — чиста застраховка. Плаща, ако умреш в срока (10/20/30 г). Евтина (~€20–€50/мес за €500к покритие на 30 г). Правилно за 95% от хората със зависими.\n\n❌ ЦЯЛА ЖИВОТ — застраховка + "инвестиция". 5–10× вноската за същото покритие. Доходност 2–4% — много по-зле от индексен фонд.' },
                                highlight: { en: '💡 "Buy term, invest the difference" is the wealth-building consensus among 95% of fee-only advisors.', bg: '💡 "Купи срочна, инвестирай разликата" е консенсусът на 95% от съветниците без комисиона.' },
                            },
                        ],
                    },
                    {
                        id: 'ins3-coverage-1', type: 'coverage_calc', xp: 35,
                        coverageCalc: {
                            scenario: { en: 'You\'re 28, healthy, employed. Major medical event odds ~3%/year. Worst-case bill if uninsured: ~€50,000. Pick a smart health-insurance combo.', bg: 'На 28 си, здрав, на работа. Шанс за голямо медицинско събитие: ~3%/год. Най-лоша сметка без застраховка: ~€50,000. Избери комбинация.' },
                            question: { en: 'Tune the deductible / coverage / premium for a healthy young adult', bg: 'Настрой самоучастие / покритие / вноска за здрав млад човек' },
                            claimProbability: 0.03,
                            expectedLoss: 50000,
                            premiumMin: 600,
                            premiumMax: 3600,
                            premiumStep: 100,
                            deductibleOptions: [500, 1500, 3000, 5000],
                            coverageLimitOptions: [20000, 35000, 50000, 80000],
                            correctPremium: 1500,
                            correctDeductible: 3000,
                            correctCoverageLimit: 50000,
                            tolerance: 100,
                        },
                        explanation: { en: 'A young healthy person rarely claims. €3,000 deductible + €50,000 limit (covers your real worst case) + €1,500/yr premium = the right balance. Lower deductibles cost 2–3× more in premium without giving you more catastrophic protection.', bg: 'Млад здрав човек рядко предявява иск. €3,000 самоучастие + €50,000 лимит (покрива реалната най-лоша ситуация) + €1,500/год = правилен баланс.' },
                    },
                    {
                        id: 'ins3-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'For a 30-year-old building wealth, order these insurance priorities from MOST to LEAST important:', bg: 'За 30-годишен, изграждащ богатство, подреди приоритетите от НАЙ-важен към НАЙ-маловажен:' },
                        orderItems: [
                            { label: { en: 'Health insurance (catastrophic plan minimum)', bg: 'Здравна (минимум катастрофичен план)' }, emoji: '⚕️' },
                            { label: { en: 'Auto liability (if you drive)', bg: 'Гражданска отговорност (ако шофираш)' }, emoji: '🚗' },
                            { label: { en: 'Term life insurance (if you have dependents)', bg: 'Срочна Живот (ако имаш зависими)' }, emoji: '👨‍👩‍👧' },
                            { label: { en: 'Disability insurance', bg: 'Застраховка инвалидност' }, emoji: '🦽' },
                            { label: { en: 'Renters / home contents insurance', bg: 'Имущество в наеман имот' }, emoji: '🏠' },
                            { label: { en: 'Travel / pet / gadget insurance', bg: 'Пътуване / домашен любимец / гаджет' }, emoji: '✈️' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4, 5],
                        explanation: { en: 'Health and auto-liability protect you from the biggest catastrophic bills (€50k–€500k+). Life only matters if others depend on your income. Disability is statistically MORE likely than death — and often overlooked. Travel/pet/gadget are optional convenience plays.', bg: 'Здравна и гражданска те пазят от най-големите сметки (€50к–€500к+). Живот има значение само ако има зависими. Инвалидност е статистически ПО-вероятна от смърт — често пренебрегвана.' },
                    },
                    {
                        id: 'ins3-decision-1', type: 'scenario_decision', xp: 30,
                        decisionAvatar: '👨‍👩‍👧',
                        decisionScenario: { en: 'You\'re 30, earn €40,000/year, married with 2 kids. Your insurance agent pitches: "Whole-life policy for €600/mo — coverage AND investment in one." A fee-only advisor says: "Buy €400k term life for €30/mo, invest the €570 difference." Who\'s right?', bg: 'На 30 си, печелиш €40,000/год, женен с 2 деца. Агентът: "Цяла Живот за €600/мес — покритие И инвестиция." Платен съветник: "€400к срочна за €30/мес, инвестирай €570 разликата." Кой е прав?' },
                        decisionChoices: [
                            { label: { en: 'Whole life — insurance + forced savings is convenient', bg: 'Цяла Живот — застраховка + принудено спестяване е удобно' }, emoji: '🏦', outcome: { en: 'Whole-life premiums include 5–10% sales commission + admin fees. The "investment" component returns 2–4%/yr. Over 30 yrs, you build ~€280k inside the policy. Same money in a 7% index fund: ~€650k. You leave €370k on the table for "convenience."', bg: 'Цяла Живот включва 5–10% комисиона + такси. Доходността е 2–4%/год. За 30 г. трупаш ~€280к. Същите пари в индексен фонд при 7%: ~€650к. Губиш €370к за "удобство".' }, isBest: false },
                            { label: { en: 'Term life + invest the difference', bg: 'Срочна Живот + инвестирай разликата' }, emoji: '📈', outcome: { en: 'Optimal. €30/mo term gives you €400k death benefit for 30 years. €570/mo into an index fund at 7% = €650k+ at year 30. You end with BOTH protection during the high-risk years AND the wealth.', bg: 'Оптимално. €30/мес срочна = €400к смъртно обезщетение за 30 г. €570/мес в индексен фонд при 7% = €650к+ за 30 г.' }, isBest: true },
                            { label: { en: 'Skip life insurance — invest the full €600/mo', bg: 'Пропусни Живот — инвестирай целите €600/мес' }, emoji: '🚀', outcome: { en: 'Risky with dependents. If you die at 35, your family loses your income with no buffer. They\'d need to liquidate the investment account immediately at whatever value it has. Cheap term life is the safety net.', bg: 'Рисково със зависими. Ако умреш на 35, семейството губи дохода ти без буфер. Биха ликвидирали инвестицията на каквато стойност има.' }, isBest: false },
                            { label: { en: 'Buy €1M whole life — more is safer', bg: 'Купи €1М Цяла Живот — повече = по-сигурно' }, emoji: '💸', outcome: { en: 'Worst of both worlds: massive premium drains your wealth-building budget AND you\'re still locked into the 2–4% returns of the cash-value side. Almost no one needs €1M of life coverage AND can afford it correctly.', bg: 'Най-лошото от двата свята: огромна вноска изпива бюджета И си заключен в 2–4% доходност.' }, isBest: false },
                        ],
                        explanation: { en: 'The fee-only advisor wins because they\'re NOT paid by commission on insurance products. Whole-life policies pay agents 5–10× more in commission than term life — which is why they\'re pushed. Always ask: "How are you paid?"', bg: 'Съветникът без комисиона печели, защото НЕ е платен от продажба на продукти. Цяла Живот плаща 5–10× повече комисиона на агента. Винаги питай: "Как ти плащат?"' },
                    },
                    {
                        id: 'ins3-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Term life', bg: 'Срочна Живот' }, definition: { en: 'Pure death benefit for a fixed period (10/20/30 yrs)', bg: 'Чисто смъртно обезщетение за период (10/20/30 г)' } },
                            { term: { en: 'Whole life', bg: 'Цяла Живот' }, definition: { en: 'Lifetime coverage bundled with a low-return savings account', bg: 'Доживотно покритие + сметка с ниска доходност' } },
                            { term: { en: 'Beneficiary', bg: 'Бенефициент' }, definition: { en: 'The person who receives the payout when you die', bg: 'Лицето, което получава плащането при смърт' } },
                            { term: { en: 'Policy lapse', bg: 'Прекратяване на полица' }, definition: { en: 'When coverage ends because premiums weren\'t paid', bg: 'Когато покритието свърши заради неплатени вноски' } },
                            { term: { en: 'Group plan', bg: 'Групов план' }, definition: { en: 'Employer-provided coverage — usually cheaper but tied to job', bg: 'Покритие от работодателя — обикновено евтино, но обвързано с работата' } },
                            { term: { en: 'Underinsured', bg: 'Недозастрахован' }, definition: { en: 'Coverage limit lower than your actual exposure', bg: 'Лимитът е по-нисък от реалния риск' } },
                        ],
                    },
                    {
                        id: 'ins3-fill-num-1', type: 'fill_number', xp: 25,
                        fillNumberScenario: { en: 'Rule of thumb for term life: coverage = 10× annual income. You earn €35,000/year and want to follow the standard.', bg: 'Правило за срочна Живот: покритие = 10× годишен доход. Печелиш €35,000/год.' },
                        question: { en: 'How much coverage should your term-life policy provide (in thousands €)?', bg: 'Какво покритие трябва да даде полицата (хил. €)?' },
                        fillNumberAnswer: 350, fillNumberTolerance: 25, fillNumberUnit: '',
                        fillNumberHint: { en: '10 × your annual income = ?', bg: '10 × годишен доход = ?' },
                        explanation: { en: '€35,000 × 10 = €350,000. The 10× rule provides ~20 years of replaced income for your family at a safe withdrawal rate (4%). For families with younger kids or single-income households, consider 12–15×.', bg: '€35,000 × 10 = €350,000. Правилото 10× осигурява ~20 г. заместен доход при безопасна 4% норма на теглене.' },
                    },
                    {
                        id: 'ins3-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'Whole-life insurance is the best long-term investment most people can buy.', bg: 'Цяла Живот е най-добрата дългосрочна инвестиция за повечето хора.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Whole-life policies typically return 2–4%/yr after fees vs 7–10% in a low-cost index fund. The "forced savings" angle is real but solved cheaper with an automated brokerage account. Whole life makes sense only in very narrow estate-planning situations for high net worth.', bg: 'НЕВЯРНО. Цяла Живот дава 2–4%/год след такси срещу 7–10% в индексен фонд. "Принудено спестяване" се решава по-евтино с автоматизирана инвестиция.' },
                    },
                ],
            },
        ],
    },
    // ─────────────────────────────────────────────
    // MODULE 7 — EMERGENCY PLANNING & RISK
    // Signature interactive: risk_matrix (place risks into 2x2 grid)
    // ─────────────────────────────────────────────
    {
        id: 'risk-management',
        title: { en: 'Emergency Planning & Risk', bg: 'Аварийно планиране и риск' },
        description: { en: 'Prepare for the unexpected — financially and mentally.', bg: 'Подготви се за неочакваното — финансово и психически.' },
        icon: '🚨', color: 'orange', order: 7,
        lessons: [
            // ── Lesson 1: The Risk Matrix ──
            {
                id: 'risk-essentials',
                moduleId: 'risk-management',
                title: { en: 'The Risk Matrix', bg: 'Матрицата на риска' },
                description: { en: 'Learn the 2×2 framework that decides whether to insure, mitigate, or accept any risk.', bg: 'Научи 2×2 рамката, която решава дали да застраховаш, намалиш или приемеш всеки риск.' },
                icon: '🎯', xpReward: 150, order: 1,
                exercises: [
                    {
                        id: 'rm1-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🎯',
                                title: { en: 'The 2×2 Risk Matrix', bg: '2×2 матрицата на риска' },
                                body: { en: 'Every financial risk lives somewhere on a 2×2 grid:\n\n📏 Impact (how bad if it happens?)\n🎲 Likelihood (how often does it happen?)\n\nThe right STRATEGY follows from the quadrant:\n\n🤷 Low impact + Low chance → ACCEPT (don\'t waste energy)\n🛠️ Low impact + High chance → MITIGATE (small fixes prevent it)\n📜 High impact + Low chance → TRANSFER (this is what insurance is FOR)\n🚫 High impact + High chance → AVOID (change your life choices)', bg: 'Всеки финансов риск стои някъде в 2×2 решетка:\n\n📏 Щета (колко зле, ако се случи?)\n🎲 Вероятност (колко често се случва?)\n\nПравилната СТРАТЕГИЯ идва от квадранта:\n\n🤷 Малка щета + малък шанс → ПРИЕМИ\n🛠️ Малка щета + голям шанс → НАМАЛИ\n📜 Голяма щета + малък шанс → ПРЕХВЪРЛИ (затова е застраховката)\n🚫 Голяма щета + голям шанс → ИЗБЯГВАЙ' },
                                highlight: { en: '🧠 Most people waste energy on accept risks and ignore avoid risks. The matrix flips this.', bg: '🧠 Повечето хора харчат енергия за приемани рискове и пренебрегват избягване. Матрицата обръща това.' },
                            },
                            {
                                emoji: '💸',
                                title: { en: 'The Most Expensive Mistake', bg: 'Най-скъпата грешка' },
                                body: { en: 'Buying insurance for LOW-IMPACT events (phone screen, extended warranties, gadget cover) = paying €300/yr to insure something that worst-case costs €200. You pay the seller\'s profit margin.\n\nNot buying insurance for HIGH-IMPACT events (car liability, health, your income) = one bad day from financial ruin.\n\nMatch the strategy to the quadrant, not to the marketing.', bg: 'Купуване на застраховка за малки събития (екран, удължени гаранции) = плащаш €300/год за нещо, което струва €200. Плащаш маржа на продавача.\n\nНепокупка за големи (гражданска, здравна, доход) = един лош ден до финансов крах.\n\nСвържи стратегията с квадранта, не с маркетинга.' },
                                highlight: { en: '🎯 Insure the catastrophic. Mitigate the annoying. Accept the trivial. Avoid the obvious.', bg: '🎯 Застраховай катастрофичното. Намали досадното. Приеми тривиалното. Избягвай очевидното.' },
                            },
                        ],
                    },
                    {
                        id: 'rm1-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Risk transfer', bg: 'Трансфер на риск' }, definition: { en: 'Paying someone else to absorb the loss (insurance)', bg: 'Плащаш на друг да поеме загубата (застраховка)' } },
                            { term: { en: 'Risk acceptance', bg: 'Приемане на риск' }, definition: { en: 'Self-insure — the loss is small enough to absorb', bg: 'Самозастраховаш се — загубата е достатъчно малка' } },
                            { term: { en: 'Risk mitigation', bg: 'Намаляване на риск' }, definition: { en: 'Reduce the probability or impact through action', bg: 'Намали вероятността или щетата чрез действие' } },
                            { term: { en: 'Risk avoidance', bg: 'Избягване на риск' }, definition: { en: 'Stop doing the thing that exposes you', bg: 'Спри да правиш нещото, което те излага' } },
                            { term: { en: 'Residual risk', bg: 'Остатъчен риск' }, definition: { en: 'What\'s left after your prevention measures', bg: 'Това, което остава след превантивните мерки' } },
                        ],
                    },
                    {
                        id: 'rm1-matrix-1', type: 'risk_matrix', xp: 35,
                        riskMatrix: {
                            scenario: { en: 'You\'re building a personal risk map. Place each everyday risk in the correct quadrant of the matrix.', bg: 'Изгражда си лична карта на риска. Сложи всеки риск в правилния квадрант.' },
                            question: { en: 'Place each risk in its correct quadrant', bg: 'Сложи всеки риск в правилния квадрант' },
                            risks: [
                                { label: { en: 'Raincoat ruined in storm', bg: 'Дъждобран съсипан от буря' }, emoji: '🧥', correctQuadrant: 0 },
                                { label: { en: 'Phone scratches in pocket', bg: 'Драскотини от джоба' }, emoji: '📱', correctQuadrant: 1 },
                                { label: { en: 'Car liability injury ≥€100k', bg: 'Гражданска ≥€100к' }, emoji: '🚗', correctQuadrant: 2 },
                                { label: { en: 'House fire / burglary', bg: 'Пожар / кражба в дома' }, emoji: '🔥', correctQuadrant: 2 },
                                { label: { en: 'Smoking 2 packs/day', bg: 'Пушене 2 кутии/ден' }, emoji: '🚬', correctQuadrant: 3 },
                                { label: { en: 'Forgetting reusable bag at the shop', bg: 'Забравена торба в магазина' }, emoji: '🛍️', correctQuadrant: 1 },
                            ],
                        },
                        explanation: { en: 'A ruined raincoat is too small to insure or worry about (accept). Phone scratches happen often but cost almost nothing — mitigate cheaply (case). Car liability and house fires are catastrophic but rare — that\'s exactly what insurance is for. Smoking is high-impact AND high-chance for damage — avoid (or quit).', bg: 'Съсипаният дъждобран е твърде малък за тревога (приеми). Драскотините са чести, но почти нищо — намали евтино (калъф). Гражданска и пожар са катастрофични, но редки — точно за това е застраховката. Пушенето е и голяма щета, и голям шанс — избягвай.' },
                    },
                    {
                        id: 'rm1-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'Buying more insurance always makes you less exposed to risk.', bg: 'Купуването на повече застраховки винаги те прави по-малко изложен на риск.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Insurance for LOW-impact events is just a transfer of YOUR money to the seller\'s profit margin. The "extra insurance" costs you wealth without reducing real exposure. Match the strategy to the quadrant — don\'t default to "transfer everything."', bg: 'НЕВЯРНО. Застраховките за малки събития са просто трансфер на твоите пари към маржа на продавача. "Допълнителната" застраховка ти струва богатство без да намалява реалния риск.' },
                    },
                    {
                        id: 'rm1-sort-1', type: 'sort_items', xp: 20,
                        sortItems: [
                            { label: { en: 'Keep a 3–6 month emergency fund', bg: 'Дръж 3–6 месеца авариен фонд' }, emoji: '🛡️', isAsset: true },
                            { label: { en: 'Track no insurance policies you own', bg: 'Не следиш кои застраховки имаш' }, emoji: '🤷', isAsset: false },
                            { label: { en: 'Diversify income (job + side hustle)', bg: 'Диверсифицирай дохода (работа + бизнес)' }, emoji: '💼', isAsset: true },
                            { label: { en: 'Borrow to buy depreciating luxury', bg: 'Вземи заем за луксова обезценяваща се вещ' }, emoji: '💸', isAsset: false },
                            { label: { en: 'Document key contacts and accounts', bg: 'Запиши важните контакти и сметки' }, emoji: '📋', isAsset: true },
                            { label: { en: 'Hide financial emergencies from your partner', bg: 'Скривай финансовите кризи от партньора' }, emoji: '🙈', isAsset: false },
                            { label: { en: 'Update beneficiaries every year', bg: 'Обновявай бенефициенти всяка година' }, emoji: '👨‍👩‍👧', isAsset: true },
                        ],
                    },
                    {
                        id: 'rm1-decision-1', type: 'scenario_decision', xp: 25,
                        decisionAvatar: '🚨',
                        decisionScenario: { en: 'Monday morning. HR calls: "Your role is being eliminated. Last day Friday — severance: 2 months pay." You have €4,000 saved and €2,500/mo expenses. First move?', bg: 'Понеделник сутрин. HR се обажда: "Позицията ти се закрива. Последен ден петък — обезщетение: 2 заплати." Имаш €4,000 спестени и €2,500/мес разходи. Първи ход?' },
                        decisionChoices: [
                            { label: { en: 'Panic-apply to 100 jobs in 24 hours', bg: 'Кандидатствай за 100 работи за 24 ч.' }, emoji: '😱', outcome: { en: 'Quantity without quality = generic CVs to mismatched roles. Average response rate drops to ~1%. You\'ll burn out and accept the first low-ball offer. Slow down.', bg: 'Количество без качество = общи CV-та за неподходящи роли. Средният отговор пада до ~1%. Ще изгориш и ще приемеш първата ниска оферта.' }, isBest: false },
                            { label: { en: 'Cut expenses to €1,800/mo, list top 10 target companies, register for benefits', bg: 'Свали разходите до €1,800/мес, изброй топ 10 цел-компании, регистрирай помощи' }, emoji: '🎯', outcome: { en: 'Best of both worlds. Cash cushion stretches to ~5 months (€4k + €5k severance ÷ €1.8k). Targeted search gets 5× higher response rate. Government benefits add a real buffer. This is what "calm under fire" looks like.', bg: 'И от двете. Подушката стига до ~5 месеца (€4к + €5к обезщетение ÷ €1.8к). Целевото търсене има 5× по-висок отговор. Държавни помощи добавят буфер.' }, isBest: true },
                            { label: { en: 'Take a sabbatical, travel for 3 months', bg: 'Вземи sabbatical, пътувай 3 месеца' }, emoji: '✈️', outcome: { en: 'Tempting but irresponsible. You have ~3 months of runway. Travel eats the runway and you return with €0 and stale skills. Save the sabbatical for AFTER you land the next role.', bg: 'Изкушаващо, но безотговорно. Имаш ~3 месеца runway. Пътуването ги изяжда и се връщаш с €0 и стари умения.' }, isBest: false },
                            { label: { en: 'Take a credit-card cash advance to "ride it out"', bg: 'Вземи кеш аванс от карта да "издържиш"' }, emoji: '💳', outcome: { en: 'Worst move. Cash advances charge 25–30% APR + fees from day one (no grace period). You\'re trading short-term comfort for long-term debt at exactly the wrong moment.', bg: 'Най-лош ход. Кеш аванс е 25–30% ГПР + такси от ден 1 (без гратисен период). Сменяш краткосрочен комфорт за дългосрочен дълг.' }, isBest: false },
                        ],
                        explanation: { en: 'A real emergency response is calm + targeted + multi-pronged: extend runway by cutting, narrow the search to high-fit options, use available systems (benefits). Don\'t panic-apply, don\'t hide.', bg: 'Истинският авариен отговор е спокоен + целеви + многостранен: удължи runway с орязване, стесни търсенето към подходящи опции, ползвай налични системи.' },
                    },
                    {
                        id: 'rm1-choice-1', type: 'choice', xp: 15,
                        question: { en: 'Which financial emergency hits the most people, most often?', bg: 'Коя финансова авария удря най-много хора, най-често?' },
                        options: [
                            { en: 'A house burning down', bg: 'Изгоряла къща' },
                            { en: 'Sudden major medical bill', bg: 'Внезапна голяма медицинска сметка' },
                            { en: 'Job loss or income drop', bg: 'Загуба на работа или спад на дохода' },
                            { en: 'Identity theft draining accounts', bg: 'Кражба на самоличност източва сметки' },
                        ],
                        correctIndex: 2,
                        explanation: { en: 'Job loss or major income drop affects ~30–40% of workers AT LEAST once in their career. Compared to single-event catastrophes (fire, theft), it\'s by far the most common AND the most preventable through emergency fund + skill diversification.', bg: 'Загубата на работа или спад на доход засяга ~30–40% от работещите ПОНЕ веднъж в кариерата. В сравнение с еднократните катастрофи (пожар, кражба), е далеч най-честата И най-предотвратимата.' },
                    },
                ],
            },
            // ── Lesson 2: Build Your Emergency Plan ──
            {
                id: 'risk-emergency-plan',
                moduleId: 'risk-management',
                title: { en: 'Build Your Emergency Plan', bg: 'Изгради своя авариен план' },
                description: { en: 'The 5-layer plan, runway math, and what to do in the first 48 hours of a crisis.', bg: '5-слойният план, математика на runway и какво да правиш в първите 48 ч на криза.' },
                icon: '📋', xpReward: 160, order: 2,
                exercises: [
                    {
                        id: 'rm2-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🏗️',
                                title: { en: 'The 5 Layers of Resilience', bg: '5-те слоя на устойчивост' },
                                body: { en: '🥇 Layer 1: Cash buffer — €1,000 starter fund\n🥈 Layer 2: Emergency fund — 3–6 months of expenses\n🥉 Layer 3: Insurance — health + auto liability + (optional) life\n🏅 Layer 4: Income diversification — side hustle or skill stack\n🎖️ Layer 5: Long-term wealth — investment runway in case of permanent disruption\n\nMost people skip layers and overbuild one — like maxing investments without an emergency fund. The layers exist in ORDER for a reason.', bg: '🥇 Слой 1: Кеш буфер — €1,000 стартов\n🥈 Слой 2: Авариен фонд — 3–6 м. разходи\n🥉 Слой 3: Застраховки — здравна + гражданска + (по избор) Живот\n🏅 Слой 4: Диверсификация на дохода — страничен бизнес или умения\n🎖️ Слой 5: Дългосрочно богатство — инвестиционен runway\n\nПовечето прескачат слоеве и натрупват един — като инвестиции без авариен фонд. Слоевете са в ред с причина.' },
                                highlight: { en: '🛡️ Build layer N+1 only after layer N is solid. Don\'t skip — and don\'t overbuild the same layer forever.', bg: '🛡️ Изграждай слой N+1 само след като N е готов. Не прескачай — и не претрупвай един слой завинаги.' },
                            },
                            {
                                emoji: '⏱️',
                                title: { en: 'The First 48 Hours of a Crisis', bg: 'Първите 48 ч на криза' },
                                body: { en: 'When a real emergency hits, your decisions in the first 48 hours shape the next 12 months.\n\nThe checklist:\n• Hour 1–6: stop the bleeding (medical, safety, immediate cash)\n• Hour 6–24: notify key parties (family, employer, insurer)\n• Hour 24–48: list options + 30-day plan (income, expenses, support)\n\nThis isn\'t about being brave — it\'s about having a written list you read when your brain isn\'t working.', bg: 'При истинска криза, решенията в първите 48 ч оформят следващите 12 месеца.\n\nЧек-лист:\n• Час 1–6: спри кървенето (медицинско, безопасност, кеш)\n• Час 6–24: уведоми ключови (семейство, работодател, застраховател)\n• Час 24–48: списък опции + 30-дневен план\n\nНе става въпрос за храброст — за писан списък, който четеш, когато мозъкът ти не работи.' },
                                highlight: { en: '📝 Write your "in case of emergency" doc BEFORE the emergency. Stress destroys executive function.', bg: '📝 Напиши "при авария" документ ПРЕДИ аварията. Стресът унищожава изпълнителните функции.' },
                            },
                        ],
                    },
                    {
                        id: 'rm2-fill-num-1', type: 'fill_number', xp: 25,
                        fillNumberScenario: { en: 'Your monthly expenses total €2,000. You want to build a 6-month emergency fund, contributing €250/month from your paycheck.', bg: 'Месечните разходи са €2,000. Искаш 6-месечен авариен фонд, внасяйки €250/мес от заплатата.' },
                        question: { en: 'How many months until the fund is fully built?', bg: 'Колко месеца до пълно изграждане?' },
                        fillNumberAnswer: 48, fillNumberTolerance: 1, fillNumberUnit: '',
                        fillNumberHint: { en: 'Target = €2,000 × 6 months. Divide by €250/mo to get months.', bg: 'Цел = €2,000 × 6 м. Раздели на €250/мес за брой месеци.' },
                        explanation: { en: '€2,000 × 6 = €12,000 target. €12,000 ÷ €250/mo = 48 months (4 years). That\'s long — most people speed it up with windfalls (tax refunds, bonuses) and by starting with a €1,000 buffer first, then building gradually.', bg: '€2,000 × 6 = €12,000. €12,000 ÷ €250 = 48 м. (4 г.). Дълго — повечето хора ускоряват с извънредни доходи и с €1,000 буфер първо.' },
                    },
                    {
                        id: 'rm2-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'You just lost your job. Order these 5 actions from MOST to LEAST urgent in the first week:', bg: 'Току-що загуби работа. Подреди тези 5 действия от НАЙ-спешно към НАЙ-малко спешно за първата седмица:' },
                        orderItems: [
                            { label: { en: 'Calculate exact runway (savings ÷ expenses)', bg: 'Сметни точен runway (спестявания ÷ разходи)' }, emoji: '🧮' },
                            { label: { en: 'Apply for unemployment / state benefits', bg: 'Кандидатствай за безработица / помощи' }, emoji: '🏛️' },
                            { label: { en: 'Cut non-essential subscriptions and spending', bg: 'Спри неосновни абонаменти и разходи' }, emoji: '✂️' },
                            { label: { en: 'Update CV + reach out to 5 strong contacts', bg: 'Обнови CV + свържи се с 5 силни контакта' }, emoji: '📇' },
                            { label: { en: 'Apply to roles that match top skill', bg: 'Кандидатствай за роли с твоето топ умение' }, emoji: '🎯' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4],
                        explanation: { en: 'You can\'t plan without knowing your runway (step 1). Benefits (step 2) take weeks to process — start early. Cutting expenses (step 3) extends runway immediately. Network FIRST, applications second — 70% of jobs are filled through referrals before public posting.', bg: 'Не можеш да планираш без runway (1). Помощите (2) са седмици за обработка. Орязване (3) удължава runway. Мрежа ПЪРВО, кандидатства второ — 70% от работите се намират чрез препоръки.' },
                    },
                    {
                        id: 'rm2-matrix-1', type: 'risk_matrix', xp: 35,
                        riskMatrix: {
                            scenario: { en: 'You\'re mid-career, married, one child, mortgage. Place each life-stage risk in the right quadrant.', bg: 'Средна кариера, женен, едно дете, ипотека. Сложи всеки риск в правилния квадрант.' },
                            question: { en: 'Categorize each life-stage risk', bg: 'Категоризирай всеки риск' },
                            risks: [
                                { label: { en: 'Forgetting an umbrella once a year', bg: 'Забравен чадър веднъж годишно' }, emoji: '☂️', correctQuadrant: 0 },
                                { label: { en: 'Missing a phone-bill payment', bg: 'Пропуснато плащане на телефон' }, emoji: '📱', correctQuadrant: 1 },
                                { label: { en: 'Long-term disability cutting income', bg: 'Дългосрочна инвалидност' }, emoji: '🦽', correctQuadrant: 2 },
                                { label: { en: 'Daily highway driving without seatbelt', bg: 'Ежедневно без колан по магистрала' }, emoji: '🚗', correctQuadrant: 3 },
                                { label: { en: 'Sudden hospitalization', bg: 'Внезапна хоспитализация' }, emoji: '🏥', correctQuadrant: 2 },
                                { label: { en: 'Unused gym membership', bg: 'Неизползван абонамент за фитнес' }, emoji: '🏋️', correctQuadrant: 1 },
                            ],
                        },
                        explanation: { en: 'Forgotten umbrellas = accept. Phone bills + unused subs = mitigate (autopay + audit annually). Disability + hospitalization = transfer (this is what insurance is FOR). No-seatbelt driving = avoid (change behavior; insurance won\'t fix the actual injury).', bg: 'Чадърите = приеми. Сметки + ненужни абонаменти = намали (автоплащане + годишен преглед). Инвалидност + болница = прехвърли (за това е застраховката). Без колан = избягвай (промени поведението; застраховката не лекува нараняване).' },
                    },
                    {
                        id: 'rm2-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Contingency plan', bg: 'План за непредвидено' }, definition: { en: 'Pre-written plan for "if X happens, I do Y"', bg: 'Предварителен план "ако X, правя Y"' } },
                            { term: { en: 'Runway', bg: 'Runway' }, definition: { en: 'Months you can survive on current savings', bg: 'Месеци, в които оцеляваш с текущите пари' } },
                            { term: { en: 'Sequence-of-returns risk', bg: 'Риск от поредица доходност' }, definition: { en: 'Early bad returns hurt more than late ones in retirement', bg: 'Ранна лоша доходност вреди повече от късна при пенсиониране' } },
                            { term: { en: 'Longevity risk', bg: 'Риск от дълголетие' }, definition: { en: 'Outliving your savings — running out of money', bg: 'Преживяваш парите си — свършват преди ти' } },
                            { term: { en: 'Disaster recovery', bg: 'Възстановяване от бедствие' }, definition: { en: 'Documented procedure to restore key systems after a crisis', bg: 'Документирана процедура за възстановяване след криза' } },
                            { term: { en: 'Single point of failure', bg: 'Единствена точка на провал' }, definition: { en: 'A dependency whose failure breaks everything', bg: 'Зависимост, чийто провал чупи всичко' } },
                        ],
                    },
                    {
                        id: 'rm2-rpg-1', type: 'rpg_scenario', xp: 25,
                        scenario: { en: 'You wake up with chest pain. No health insurance. Local ER visit = €2,000+ before treatment. Friend says "it\'s probably nothing — sleep it off." Your move?', bg: 'Събуждаш се с болка в гърдите. Няма здравна. Спешен център = €2,000+ преди лечение. Приятел: "сигурно е нищо — наспи се." Ходът ти?' },
                        avatar: '🚨',
                        choices: [
                            { label: { en: 'Sleep it off — ER is too expensive', bg: 'Наспи се — спешният е твърде скъп' }, emoji: '😴', consequence: { en: 'Worst outcome path. If it WAS a cardiac event, untreated = permanent damage or death. The €2,000 ER bill is recoverable; the cardiac damage isn\'t. Money beats brain damage every time.', bg: 'Най-лош изход. Ако Е било сърдечно, без лечение = постоянна щета или смърт. €2,000 е възстановимо; щетата не е.' }, cashFlowChange: -50000, isGood: false },
                            { label: { en: 'Go to ER, negotiate the bill afterward', bg: 'Иди в спешен, договори сметката после' }, emoji: '🏥', consequence: { en: 'Right move. Hospitals routinely reduce uninsured bills 30–60% if you ask. Many offer 0% payment plans. Triage first, finance second. Don\'t let cost paralyze a real medical event.', bg: 'Правилен ход. Болниците редовно свалят сметки за неосигурени с 30–60% при питане. 0% планове за плащане. Първо здраве, после финанси.' }, cashFlowChange: -1000, isGood: true },
                            { label: { en: 'Call a tele-health doctor first (~€30)', bg: 'Първо тел-докторски разговор (~€30)' }, emoji: '📞', consequence: { en: 'Smart hedge for ambiguous symptoms. They\'ll triage — if it sounds cardiac, they tell you ER NOW. If muscular, you save €1,970. Use this layer FIRST for non-obvious symptoms.', bg: 'Умен ход за двусмислени симптоми. Триаж — ако звучи сърдечно, "веднага в спешен". Ако мускулно, спестяваш €1,970.' }, cashFlowChange: -30, isGood: true },
                        ],
                    },
                    {
                        id: 'rm2-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'Emergencies are essentially random — there\'s no point in planning for them.', bg: 'Авариите са случайни — няма смисъл да се планира за тях.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Most "emergencies" are statistically predictable: job loss hits ~30% of workers in any decade, major car repairs hit ~70% of car owners every 5 years, major medical bills hit ~40% of households in a lifetime. They feel random because individuals don\'t plan — but at population level they\'re very regular.', bg: 'НЕВЯРНО. Повечето "аварии" са статистически предвидими: загуба на работа удря ~30% от работещите на десетилетие, голям ремонт на кола ~70% на 5 г. Усещат се случайни, защото никой не планира — но на популация ниво са редовни.' },
                    },
                ],
            },
            // ── Lesson 3: Black Swan Preparedness ──
            {
                id: 'risk-black-swan',
                moduleId: 'risk-management',
                title: { en: 'Black Swan Preparedness', bg: 'Подготовка за черни лебеди' },
                description: { en: 'Hedge against rare-but-devastating events without becoming paranoid.', bg: 'Хеджирай срещу редки разрушителни събития, без да станеш параноик.' },
                icon: '🦢', xpReward: 170, order: 3,
                exercises: [
                    {
                        id: 'rm3-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🦢',
                                title: { en: 'What is a Black Swan?', bg: 'Какво е черен лебед?' },
                                body: { en: 'Term from Nassim Taleb: an event that is:\n\n1. Highly improbable (felt impossible BEFORE it happened)\n2. Has massive impact when it does happen\n3. Gets rationalized as "obvious in hindsight"\n\nExamples: 2008 financial crisis, COVID, internet, smartphones.\n\nBlack swans break models. The defense isn\'t prediction — it\'s building systems that SURVIVE shocks instead of trying to forecast them.', bg: 'От Насим Талеб: събитие което е:\n\n1. Много невероятно (изглежда невъзможно ПРЕДИ)\n2. Огромна щета, когато се случи\n3. Рационализирано като "очевидно в ретроспекция"\n\nПримери: 2008, COVID, интернет, смартфони.\n\nЧерните лебеди чупят модели. Защитата не е прогноза — а системи, които ОЦЕЛЯВАТ шокове.' },
                                highlight: { en: '🛡️ Antifragile > resilient > robust > fragile. Build systems that gain from disorder, not just survive it.', bg: '🛡️ Антикрехко > устойчиво > здраво > крехко. Изграждай системи, които печелят от хаос, не само оцеляват.' },
                            },
                            {
                                emoji: '🎯',
                                title: { en: 'The Hedging Principles', bg: 'Принципи на хеджиране' },
                                body: { en: '1️⃣ DIVERSIFY: never have 100% in one job / asset / country / currency\n2️⃣ KEEP OPTIONALITY: cash reserves let you BUY when others must sell\n3️⃣ AVOID RUIN: never bet the survival of your life on a single trade\n4️⃣ BUILD SKILLS, NOT JUST WEALTH: skills are inflation-proof and crisis-proof\n5️⃣ DON\'T OVER-INSURE: paying €20k/yr in insurance to "feel safe" can itself bankrupt you over 30 years', bg: '1️⃣ ДИВЕРСИФИЦИРАЙ: никога 100% в една работа / актив / държава / валута\n2️⃣ ДРЪЖ ОПЦИИ: кеш резерви ти позволяват да КУПУВАШ когато други продават\n3️⃣ ИЗБЯГВАЙ КРАХ: никога не залагай оцеляването си на една сделка\n4️⃣ ИЗГРАЖДАЙ УМЕНИЯ, НЕ САМО БОГАТСТВО\n5️⃣ НЕ ЗАСТРАХОВАЙ ПРЕКОМЕРНО' },
                                highlight: { en: '💡 "I don\'t try to predict the future. I prepare a portfolio that survives whatever future shows up." — Howard Marks', bg: '💡 "Не се опитвам да предвиждам бъдещето. Подготвям портфейл, който оцелява каквото и да дойде." — Хауърд Маркс' },
                            },
                        ],
                    },
                    {
                        id: 'rm3-matrix-1', type: 'risk_matrix', xp: 35,
                        riskMatrix: {
                            scenario: { en: 'Rare-but-real "black swan" risks for an average household. Sort each into the right strategy quadrant.', bg: 'Редки, но реални рискове за домакинство. Сложи всеки в правилен квадрант.' },
                            question: { en: 'Where does each rare risk belong?', bg: 'Къде принадлежи всеки риск?' },
                            risks: [
                                { label: { en: 'Wallet pickpocketed in a year', bg: 'Откраднат портфейл годишно' }, emoji: '👛', correctQuadrant: 0 },
                                { label: { en: 'Daily train delays', bg: 'Ежедневни закъснения на влак' }, emoji: '🚆', correctQuadrant: 1 },
                                { label: { en: 'Surprise medical bill from pandemic', bg: 'Неочаквана сметка от пандемия' }, emoji: '🦠', correctQuadrant: 2 },
                                { label: { en: 'House flood (low-flood-risk area)', bg: 'Наводнение (зона с малък риск)' }, emoji: '🌊', correctQuadrant: 2 },
                                { label: { en: 'All career in one shrinking industry', bg: 'Цяла кариера в смаляваща индустрия' }, emoji: '📉', correctQuadrant: 3 },
                                { label: { en: 'Forgetting weekly shopping list item', bg: 'Забравен артикул в седмичен списък' }, emoji: '🛒', correctQuadrant: 1 },
                            ],
                        },
                        explanation: { en: 'Pickpocket = accept (€100 once a decade). Train delays + grocery items = mitigate (alarms, autopay, lists). Pandemic medical + flood = transfer (insurance + emergency fund). All-in-one-industry = avoid (diversify your career, develop transferable skills).', bg: 'Кражба на портфейл = приеми. Закъснения + забравени артикули = намали (аларми, автоплащане, списъци). Пандемия + наводнение = прехвърли (застраховка + фонд). Цяла кариера в една индустрия = избягвай (диверсифицирай).' },
                    },
                    {
                        id: 'rm3-decision-1', type: 'scenario_decision', xp: 30,
                        decisionAvatar: '🎁',
                        decisionScenario: { en: 'You inherit €100,000. Markets are choppy, war headlines are everywhere, friends recommend everything from gold to crypto to Italian property. What\'s the SAFEST first move?', bg: 'Наследяваш €100,000. Пазарите се клатят, заглавия за война, приятели препоръчват всичко — от злато до крипто до италиански имот. НАЙ-сигурният първи ход?' },
                        decisionChoices: [
                            { label: { en: 'All-in on gold — "hedge against chaos"', bg: 'Всичко в злато — "хедж срещу хаос"' }, emoji: '🪙', outcome: { en: 'Concentration in one "safe" asset is its own black swan. Gold can drop 30% in a year (it has, multiple times). And it generates no income. You\'re trading one risk for another.', bg: 'Концентрацията в един "сигурен" актив е свой собствен черен лебед. Златото може да падне 30% за година. И не генерира доход.' }, isBest: false },
                            { label: { en: 'Park €100k in a high-yield savings account, plan over 90 days', bg: 'Сложи €100к в спестовна с висока лихва, планирай 90 дни' }, emoji: '🏦', outcome: { en: 'Best move. €100k earns ~3–4% in HYSA risk-free WHILE you think. Big decisions made in 1 day are usually wrong. 90 days lets you research, talk to a fee-only advisor, and split intelligently across goals.', bg: 'Най-добър ход. €100к печели ~3–4% в HYSA без риск ДОКАТО мислиш. Големи решения за ден обикновено са грешни. 90 дни ти дават изследване, съветник, умно разделяне.' }, isBest: true },
                            { label: { en: 'Invest it all in stocks today — "time in market wins"', bg: 'Инвестирай всичко в акции днес — "времето на пазара печели"' }, emoji: '📈', outcome: { en: 'Right principle, wrong execution for a lump sum. DCA over 6–12 months reduces sequence-of-returns risk. A market drop right after a 100% deployment can take 5+ years to recover.', bg: 'Правилен принцип, грешно изпълнение за lump sum. DCA за 6–12 м. намалява риска. Спад веднага след 100% депозит може да отнеме 5+ г. за възстановяване.' }, isBest: false },
                            { label: { en: 'Buy a rental property in a "hot" foreign market', bg: 'Купи имот в "горещ" чужд пазар' }, emoji: '🏠', outcome: { en: 'Triple risk: illiquidity + currency + political. Property is the OPPOSITE of optionality. Locking up €100k in foreign real estate when you have no other diversification = black swan magnet.', bg: 'Троен риск: ликвидност + валута + политика. Имотите са ПРОТИВОПОЛОЖНОТО на опционалност.' }, isBest: false },
                        ],
                        explanation: { en: 'Big windfalls are emotional. The right move is to BUY TIME first: park safely, plan deliberately, decide slowly. The 90-day cooling-off rule has saved more inheritances than any "hot tip."', bg: 'Големите печалби са емоционални. Правилно: купи си ВРЕМЕ първо: паркирай сигурно, планирай, решавай бавно.' },
                    },
                    {
                        id: 'rm3-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Black swan', bg: 'Черен лебед' }, definition: { en: 'Rare, high-impact event impossible to predict in advance', bg: 'Рядко събитие с голяма щета, непредвидимо' } },
                            { term: { en: 'Antifragile', bg: 'Антикрехко' }, definition: { en: 'Gains from disorder — gets stronger under stress', bg: 'Печели от хаоса — става по-силно под стрес' } },
                            { term: { en: 'Tail risk', bg: 'Tail risk' }, definition: { en: 'The probability of extreme outcomes in the "tails" of a distribution', bg: 'Вероятността от крайни изходи в краищата на разпределение' } },
                            { term: { en: 'Hedge', bg: 'Хедж' }, definition: { en: 'A position that profits when your main position suffers', bg: 'Позиция, която печели, когато основната губи' } },
                            { term: { en: 'Optionality', bg: 'Опционалност' }, definition: { en: 'Having choices available without obligation to use them', bg: 'Имаш избори без задължение да ги използваш' } },
                        ],
                    },
                    {
                        id: 'rm3-order-1', type: 'order_items', xp: 25,
                        orderInstruction: { en: 'Rank these long-term safety actions from MOST to LEAST impact on black-swan resilience:', bg: 'Подреди тези дългосрочни действия от НАЙ-голямо към НАЙ-малко влияние върху устойчивост:' },
                        orderItems: [
                            { label: { en: 'Diversify income across 2+ sources', bg: 'Диверсифицирай дохода в 2+ източника' }, emoji: '💼' },
                            { label: { en: 'Build a 6-month emergency fund', bg: 'Изгради 6-месечен авариен фонд' }, emoji: '🛡️' },
                            { label: { en: 'Diversify investments globally', bg: 'Диверсифицирай инвестициите глобално' }, emoji: '🌍' },
                            { label: { en: 'Maintain transferable skills', bg: 'Поддържай преносими умения' }, emoji: '🧠' },
                            { label: { en: 'Keep a passport up to date', bg: 'Дръж си валиден паспорт' }, emoji: '📘' },
                        ],
                        correctOrder: [0, 1, 2, 3, 4],
                        explanation: { en: 'Income diversification is the strongest hedge — your earning power is your largest asset. Cash buffer comes next — it converts shock into a manageable problem. Global investing reduces single-country risk. Skills are permanent. A passport gives optionality at zero cost.', bg: 'Диверсификация на дохода е най-силният хедж — печалбата ти е най-големият актив. Кеш буфер превръща шока в управляем проблем. Глобални инвестиции намаляват риска от една страна. Уменията са постоянни. Паспорт = опционалност.' },
                    },
                    {
                        id: 'rm3-tf-1', type: 'true_false', xp: 15,
                        statement: { en: 'You can reliably predict the next major financial crisis if you follow the right experts.', bg: 'Можеш надеждно да предвидиш следващата голяма криза, ако следваш правилните експерти.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Decades of data show even top economists collectively predict ~50% of recessions — basically a coin flip. Permanent "crash callers" eventually look right when a crash hits — but they\'ve been wrong for years before. Build a system that SURVIVES the unknown, not a model that predicts it.', bg: 'НЕВЯРНО. Десетилетия данни показват, че дори топ икономисти колективно предвиждат ~50% от рецесиите — на практика монета. Постоянните "пророци на крах" изглеждат прави, когато удари — но са били грешни години преди.' },
                    },
                    {
                        id: 'rm3-fill-num-1', type: 'fill_number', xp: 25,
                        fillNumberScenario: { en: 'You earn €3,000/mo and spend €2,200/mo. You want a 12-month runway (the "elite" emergency buffer for black-swan resilience).', bg: 'Печелиш €3,000/мес и харчиш €2,200/мес. Искаш 12-месечен runway (елитен буфер за устойчивост).' },
                        question: { en: 'How much do you need saved (in €)?', bg: 'Колко трябва да имаш спестено (в €)?' },
                        fillNumberAnswer: 26400, fillNumberTolerance: 200, fillNumberUnit: '€',
                        fillNumberHint: { en: '12 months × monthly spend = ?', bg: '12 м. × месечно харчене = ?' },
                        explanation: { en: '€2,200 × 12 = €26,400. A 12-month runway is the "FU money" threshold — enough that you can turn down a bad job, walk away from a bad boss, or weather a 1-year crisis without panic. Most financial freedom planning starts here.', bg: '€2,200 × 12 = €26,400. 12-месечен runway е прагът на "пари за независимост" — достатъчно да откажеш лоша работа или да преживееш едногодишна криза.' },
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
                            labels: ['Jan22', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan23', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                            scenario: { en: 'A 2-year price chart with steady ~+80% growth and only mild dips along the way.', bg: '2-годишна графика с ~+80% растеж и само малки спадове.' },
                            question: { en: 'This pattern is most consistent with which holding?', bg: 'Този модел най-вероятно идва от кой актив?' },
                            mode: 'identify_pattern',
                            patternOptions: [
                                { en: 'A diversified total-market ETF in a bull run', bg: 'Диверсифициран total-market ETF в бичи цикъл' },
                                { en: 'A leveraged 3× ETF', bg: 'Ливъридж 3× ETF' },
                                { en: 'A single small-cap stock', bg: 'Единична малка компания' },
                                { en: 'A short-term EU government bond ETF', bg: 'Краткосрочен ETF на ЕС държавни облигации' },
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
                            labels: ['M1', 'M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13', 'M14', 'M15', 'M16', 'M17', 'M18', 'M19', 'M20', 'M21', 'M22', 'M23', 'M24'],
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
    // Signature interactive: tax_brackets (live bracket visualizer)
    // ─────────────────────────────────────────────
    {
        id: 'tax-strategy',
        title: { en: 'Tax Strategy', bg: 'Данъчна стратегия' },
        description: { en: 'The legal game the wealthy play. Learn every trick — without breaking any laws.', bg: 'Законната игра, която богатите играят. Научи всеки трик — без да нарушаваш закони.' },
        icon: '🧾', color: 'purple', order: 12, proOnly: true,
        lessons: [
            // ── Lesson 1: Tax Brackets & Strategy ──
            {
                id: 'tax-basics',
                moduleId: 'tax-strategy',
                title: { en: 'Tax Brackets & Legal Strategy', bg: 'Данъчни скоби и законна стратегия' },
                description: { en: 'Visualize brackets, kill the marginal-rate myth, and learn what wealthy people actually do.', bg: 'Виж скобите, разбий мита за пределната ставка и научи какво правят богатите.' },
                icon: '💡', xpReward: 180, order: 1,
                exercises: [
                    {
                        id: 'tax-theory-1', type: 'theory', xp: 0,
                        slides: [
                            {
                                emoji: '🤦',
                                title: { en: 'The Bracket Myth', bg: 'Митът за скобите' },
                                body: { en: 'True story: an employee refused a €5,000 raise "because it would push me into a higher bracket and I\'d take home less."\n\n100% wrong. Brackets are MARGINAL — only the income ABOVE each threshold gets the higher rate.\n\nSimple example:\n€0–30k: 20% | €30k–70k: 35%\n\nEarn €31k:\n• First €30k × 20% = €6,000\n• Last €1k × 35% = €350\n• Total tax: €6,350 (effective ~20.5%)\n\nA raise ALWAYS leaves more in your pocket.', bg: 'Истинска история: служител отказа €5,000 повишение, "защото ще съм в по-висока скоба и ще взема по-малко".\n\n100% грешно. Скобите са ПРЕДЕЛНИ — само доходът НАД прага получава по-високата ставка.\n\nПример:\n€0–30к: 20% | €30к–70к: 35%\n\nПечелиш €31к:\n• Първите €30к × 20% = €6,000\n• Последните €1к × 35% = €350\n• Общо: €6,350 (ефективно ~20.5%)\n\nПовишение = винаги повече в джоба.' },
                                highlight: { en: '💡 Effective rate < Marginal rate. Always. Refusing raises for "tax reasons" is the most expensive financial myth.', bg: '💡 Ефективна < пределна. Винаги. Отказът от повишение заради "данъци" е най-скъпият мит.' },
                            },
                            {
                                emoji: '🎯',
                                title: { en: 'The 3 Legal Tax Weapons', bg: '3-те законни данъчни оръжия' },
                                body: { en: '🏦 1. Pension / retirement account\nContributions reduce taxable income. Money grows tax-free. Taxed only on withdrawal — typically in a lower bracket.\n\n📉 2. Tax-loss harvesting\nSell losers to offset gains. Up to a per-year limit can offset ordinary income too.\n\n🏠 3. Business / freelance expenses\nLaptop, internet, courses, home-office — fully or partially deductible if used for income-generating work.', bg: '🏦 1. Пенсионна сметка\nВноски намаляват облагаемия доход. Растат без данък. Данък само при теглене — обикновено в по-ниска скоба.\n\n📉 2. Реализация на загуби\nПродай губещи за компенсиране на печалби. До годишен лимит може да компенсира и обикновен доход.\n\n🏠 3. Бизнес / freelance разходи\nЛаптоп, интернет, курсове, домашен офис — изцяло или частично приспадаеми, ако са за приход.' },
                                highlight: { en: '⚠️ Tax avoidance (using the rules) = legal. Tax evasion (hiding income) = illegal. Know the difference.', bg: '⚠️ Данъчно избягване (по правилата) = законно. Укриване (скриване на доход) = незаконно. Знай разликата.' },
                            },
                        ],
                    },
                    {
                        id: 'tax-brackets-1', type: 'tax_brackets', xp: 35,
                        taxBrackets: {
                            scenario: { en: 'Simplified progressive brackets:\n€0–15k: 10%\n€15k–40k: 22%\n€40k–80k: 32%\n€80k+: 40%\n\nUse the slider to explore — then answer for the test income shown.', bg: 'Опростени прогресивни скоби:\n€0–15к: 10%\n€15к–40к: 22%\n€40к–80к: 32%\n€80к+: 40%\n\nИзползвай плъзгача да изследваш — после отговори за дадения доход.' },
                            question: { en: 'At €60,000 annual income, what is your EFFECTIVE tax rate (in %)?', bg: 'При €60,000 годишен доход, каква е ЕФЕКТИВНАТА ти ставка (%)?' },
                            brackets: [
                                { upTo: 15000, rate: 10 },
                                { upTo: 40000, rate: 22 },
                                { upTo: 80000, rate: 32 },
                                { upTo: 999999999, rate: 40 },
                            ],
                            testIncome: 60000,
                            correctAnswer: 22,
                            tolerance: 1.5,
                            unit: '%',
                            adjustable: true,
                            incomeMin: 10000,
                            incomeMax: 150000,
                        },
                        explanation: { en: 'At €60k: €1,500 (10% × 15k) + €5,500 (22% × 25k) + €6,400 (32% × 20k) = €13,400. €13,400 ÷ €60,000 = 22.3%. Your MARGINAL rate is 32%, but your EFFECTIVE rate is much lower — that\'s the bracket truth.', bg: 'При €60к: €1,500 (10% × 15к) + €5,500 (22% × 25к) + €6,400 (32% × 20к) = €13,400. €13,400 ÷ €60,000 = 22.3%. Пределната ти ставка е 32%, но ЕФЕКТИВНАТА е много по-ниска — това е истината за скобите.' },
                    },
                    {
                        id: 'tax-match-1', type: 'match_terms', xp: 25,
                        matchPairs: [
                            { term: { en: 'Marginal rate', bg: 'Пределна ставка' }, definition: { en: 'Tax rate on the NEXT euro of income earned', bg: 'Ставка върху СЛЕДВАЩОТО евро доход' } },
                            { term: { en: 'Effective rate', bg: 'Ефективна ставка' }, definition: { en: 'Total tax ÷ total income (your real %)', bg: 'Общ данък ÷ общ доход (реалният %)' } },
                            { term: { en: 'Deduction', bg: 'Приспадане' }, definition: { en: 'Reduces taxable income before tax is calculated', bg: 'Намалява облагаемия доход преди данък' } },
                            { term: { en: 'Tax credit', bg: 'Данъчен кредит' }, definition: { en: 'Direct €-for-€ reduction of tax owed', bg: 'Директно евро-за-евро намаление на данъка' } },
                            { term: { en: 'Withholding', bg: 'Удържане' }, definition: { en: 'Tax taken out of paychecks during the year', bg: 'Данък удържан от заплатите през годината' } },
                            { term: { en: 'Capital gains', bg: 'Капиталова печалба' }, definition: { en: 'Profit from selling an asset (often taxed differently)', bg: 'Печалба от продажба на актив (често различен данък)' } },
                        ],
                    },
                    {
                        id: 'tax-speed-1', type: 'speed_round', xp: 25,
                        speedRound: {
                            prompt: { en: 'Tax strategy rapid fire!', bg: 'Данъчна стратегия — бърз рунд!' },
                            secondsPerQuestion: 9, passScore: 0.6,
                            questions: [
                                { q: { en: 'Which cuts your tax bill more, euro-for-euro?', bg: 'Кое намалява данъка повече, евро за евро?' }, options: [{ en: 'A tax credit', bg: 'Данъчен кредит' }, { en: 'A tax deduction', bg: 'Данъчно приспадане' }, { en: 'They are equal', bg: 'Равни са' }], correctIndex: 0 },
                                { q: { en: 'Legally lowering your tax is called…', bg: 'Законното намаляване на данъка се нарича…' }, options: [{ en: 'Tax optimization', bg: 'Данъчна оптимизация' }, { en: 'Tax evasion', bg: 'Данъчно укриване' }, { en: 'Fraud', bg: 'Измама' }], correctIndex: 0 },
                                { q: { en: 'Contributing to a pension typically…', bg: 'Вноската в пенсия обикновено…' }, options: [{ en: 'Lowers taxable income now', bg: 'Намалява облагаемия доход сега' }, { en: 'Raises your tax now', bg: 'Вдига данъка сега' }, { en: 'Is illegal', bg: 'Е незаконно' }], correctIndex: 0 },
                                { q: { en: 'Hiding income from the tax authority is…', bg: 'Скриването на доход от данъчните е…' }, options: [{ en: 'Illegal evasion', bg: 'Незаконно укриване' }, { en: 'Smart optimization', bg: 'Умна оптимизация' }, { en: 'A tax credit', bg: 'Данъчен кредит' }], correctIndex: 0 },
                                { q: { en: 'A €1 deduction saves you…', bg: 'Приспадане от €1 ти спестява…' }, options: [{ en: 'Your marginal rate on €1', bg: 'Пределната ставка върху €1' }, { en: 'The full €1', bg: 'Цялото €1' }, { en: 'Nothing', bg: 'Нищо' }], correctIndex: 0 },
                            ],
                        },
                    },
                    {
                        id: 'tax-fill-num-1', type: 'fill_number', xp: 25,
                        fillNumberScenario: { en: 'Brackets: €0–30k @ 20%, €30k–60k @ 35%, €60k+ @ 45%. You earn €40,000/year.', bg: 'Скоби: €0–30к @ 20%, €30к–60к @ 35%, €60к+ @ 45%. Печелиш €40,000/год.' },
                        question: { en: 'How much total tax do you owe (€)?', bg: 'Колко общо данък дължиш (€)?' },
                        fillNumberAnswer: 9500, fillNumberTolerance: 100, fillNumberUnit: '€',
                        fillNumberHint: { en: 'First €30k × 20% + next €10k × 35%', bg: 'Първите €30к × 20% + следващите €10к × 35%' },
                        explanation: { en: '€30k × 20% = €6,000 + €10k × 35% = €3,500 → Total: €9,500. Effective rate = 9,500 ÷ 40,000 = 23.75% (not the 35% marginal bracket). Always think effective.', bg: '€30к × 20% = €6,000 + €10к × 35% = €3,500 → Общо: €9,500. Ефективна ставка = 9,500 ÷ 40,000 = 23.75% (не 35% пределна). Винаги мисли ефективна.' },
                    },
                    {
                        id: 'tax-decision-1', type: 'scenario_decision', xp: 30,
                        decisionAvatar: '💼',
                        decisionScenario: { en: 'Year-end. €10,000 bonus arrives. You\'re in the 35% marginal bracket. Pension annual cap not yet hit. Where does the bonus go for the BIGGEST tax win?', bg: 'Край на годината. €10,000 бонус. Пределна ставка 35%. Годишният лимит на пенсията не е достигнат. Къде отива за НАЙ-ГОЛЯМО данъчно предимство?' },
                        decisionChoices: [
                            { label: { en: 'Pension (pre-tax) — €10k contribution', bg: 'Пенсия (преди данък) — €10к вноска' }, emoji: '🏦', outcome: { en: 'Cuts taxable income by €10k → saves €3,500 immediately. Money also grows TAX-FREE until retirement. At 7% for 25 years that €10k becomes €54k. Best move by far.', bg: 'Намалява облагаемия с €10к → спестяваш €3,500 веднага. Парите растат БЕЗ ДАНЪК до пенсия. При 7% за 25 г. €10к стават €54к. Най-добър ход.' }, isBest: true },
                            { label: { en: 'Taxable brokerage (regular index fund)', bg: 'Облагаема брокерска сметка (обикн. индекс)' }, emoji: '📊', outcome: { en: 'You first pay €3,500 tax on the bonus, leaving €6,500 to invest. Future capital gains also taxable. Decent, but you forfeit ~€3,500 in immediate tax savings.', bg: 'Първо плащаш €3,500 данък, остават €6,500 за инвестиране. Бъдещите печалби — облагаеми. Прилично, но губиш ~€3,500 веднага.' }, isBest: false },
                            { label: { en: 'Spend it on lifestyle upgrades', bg: 'Похарчи за лукс' }, emoji: '🛍️', outcome: { en: 'After tax: €6,500 of pure consumption. Zero compounding, zero future option value. Nothing wrong with celebrating once — but as a strategy this is the most expensive choice.', bg: 'След данък: €6,500 чисто потребление. Нулева капитализация, нула опции. Не е лошо да празнуваш — но като стратегия е най-скъпото.' }, isBest: false },
                            { label: { en: 'Crypto — "no tax there"', bg: 'Крипто — "няма данък там"' }, emoji: '🪙', outcome: { en: 'Wrong premise. Crypto IS taxable in most countries — gains are reported and taxed similar to capital gains, often at higher rates than stocks. Plus volatility. Bad on both axes.', bg: 'Грешна предпоставка. Крипто Е облагаемо в повечето страни — печалбите се декларират като капиталови, често с по-високи ставки. Плюс волатилността. Лошо на всичко.' }, isBest: false },
                        ],
                        explanation: { en: 'Pre-tax pension contributions are a triple-win: cut taxes NOW, grow tax-free, taxed at lower future rate. They\'re the closest thing to a financial cheat code that\'s 100% legal.', bg: 'Пенсионни вноски преди данък са тройна победа: намаляваш данъка СЕГА, расте без данък, плащаш по-ниска ставка после. Най-близкото до законен чийт код.' },
                    },
                    {
                        id: 'tax-choice-1', type: 'choice', xp: 20,
                        question: { en: 'Over a 30-year career, which strategy saves the MOST in taxes legally?', bg: 'За 30-годишна кариера, коя стратегия спестява НАЙ-МНОГО данък законно?' },
                        options: [
                            { en: 'Saving aggressively in a regular savings account', bg: 'Агресивно спестяване в обикновена сметка' },
                            { en: 'Maxing pension contributions every single year', bg: 'Максимално запълване на пенсията всяка година' },
                            { en: 'Always taking the standard deduction without checking alternatives', bg: 'Винаги стандартното приспадане без проверка на алтернативи' },
                            { en: 'Hiding side-hustle income from the tax authority', bg: 'Скриване на доход от страничен бизнес от данъчните' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'Maxing pension contributions consistently saves 25–40% of every contribution in immediate taxes AND defers compounding tax-free for decades. Over 30 years this is often €100k+ in tax savings. Hiding income (option 4) is illegal — never confuse evasion with optimization.', bg: 'Максимални пенсионни вноски постоянно спестяват 25–40% от всяка вноска веднага И отлагат капитализацията без данък десетилетия. За 30 г. — често €100к+ спестени. Скриване на доход (4) е незаконно — никога не бъркай укриване с оптимизация.' },
                    },
                ],
            },
        ],
    },
    // ─────────────────────────────────────────────
    // MODULE — FRAUD & SCAM DEFENSE (free, slots after Side Hustles)
    // ─────────────────────────────────────────────
    {
        id: 'fraud-defense',
        title: { en: 'Fraud & Scam Defense', bg: 'Защита от измами' },
        description: { en: 'Spot scams before they cost you — phishing, fake bank texts, investment cons and more.', bg: 'Разпознай измамите, преди да ти струват — фишинг, фалшиви банкови SMS-и, инвестиционни схеми и още.' },
        icon: '🛡️', color: 'orange', order: 5.5,
        lessons: [
            // ── Lesson 1: Spot the Phishing ──
            {
                id: 'phishing-defense',
                moduleId: 'fraud-defense',
                title: { en: 'Spot the Phishing', bg: 'Разпознай фишинга' },
                description: { en: 'Fake texts and emails that steal your money — and the red flags that give them away.', bg: 'Фалшиви SMS-и и имейли, които крадат парите ти — и сигналите, които ги издават.' },
                icon: '🎣', xpReward: 95, order: 1,
                exercises: [
                    {
                        id: 'ph-theory-1',
                        type: 'theory',
                        xp: 0,
                        slides: [
                            {
                                emoji: '🎣',
                                title: { en: 'What is phishing?', bg: 'Какво е фишинг?' },
                                body: { en: 'Phishing is when a scammer pretends to be someone you trust — your bank, a delivery company, a government office — to trick you into handing over money, card details, or login codes.\n\nMost arrive as an SMS or email with a link. The link leads to a fake page that looks real and captures whatever you type.', bg: 'Фишингът е когато измамник се представя за някого, на когото вярваш — банката ти, куриерска фирма, държавна институция — за да те подмами да дадеш пари, данни за карта или кодове за вход.\n\nПовечето идват като SMS или имейл с връзка. Връзката води към фалшива страница, която изглежда истинска и записва всичко, което въведеш.' },
                                highlight: { en: '💡 Your bank will NEVER ask for your full PIN, password, or a one-time code by SMS, email or phone.', bg: '💡 Банката ти НИКОГА няма да поиска пълния ти PIN, парола или еднократен код по SMS, имейл или телефон.' },
                            },
                            {
                                emoji: '🚩',
                                title: { en: 'The 4 red flags', bg: 'Четирите тревожни сигнала' },
                                body: { en: '1. URGENCY — act in 24h or your account is blocked.\n2. A LINK to click and verify or log in.\n3. ASKS for codes, PINs, passwords or card numbers.\n4. A sender that is ALMOST right — oct0bank.com instead of octobank.bg.\n\nSee any of these? Stop. Go to the real app or website yourself instead.', bg: '1. СПЕШНОСТ — действай до 24ч или сметката ти ще бъде блокирана.\n2. ВРЪЗКА за цъкане и потвърждаване или вход.\n3. ИСКА кодове, PIN-ове, пароли или номера на карти.\n4. Подател, който е ПОЧТИ верен — oct0bank.com вместо octobank.bg.\n\nВиждаш някой от тези? Спри. Отиди сам в истинското приложение или сайт.' },
                            },
                        ],
                    },
                    {
                        id: 'ph-tf-1',
                        type: 'true_false',
                        xp: 15,
                        statement: { en: 'Your bank may ask for your full online-banking password by SMS if your account is at risk.', bg: 'Банката ти може да поиска пълната ти парола за онлайн банкиране по SMS, ако сметката е застрашена.' },
                        isTrue: false,
                        explanation: { en: 'FALSE — and this is the most important rule in the whole module. No legitimate bank EVER asks for your full password, PIN, or a one-time code. Anyone who does is a scammer, full stop.', bg: 'НЕВЯРНО — и това е най-важното правило в целия модул. Нито една истинска банка НИКОГА не иска пълната ти парола, PIN или еднократен код. Който го прави, е измамник, точка.' },
                    },
                    {
                        id: 'ph-rpg-1',
                        type: 'rpg_scenario',
                        xp: 25,
                        avatar: '📱',
                        scenario: { en: 'You get an SMS: OCTOBANK — your card has been BLOCKED for security, re-activate now at octobank-secure-login.com. You do bank with Octobank. What do you do?', bg: 'Получаваш SMS: OCTOBANK — картата ти е БЛОКИРАНА за сигурност, активирай сега на octobank-secure-login.com. Наистина си клиент на Octobank. Какво правиш?' },
                        choices: [
                            { label: { en: 'Tap the link and re-activate my card', bg: 'Цъкам връзката и активирам картата' }, emoji: '🔗', isGood: false, cashFlowChange: -1200, consequence: { en: 'The page looked perfect — and stole your login and card details. €1,200 gone within the hour. The link domain was a fake, not your bank.', bg: 'Страницата изглеждаше идеално — и открадна данните ти за вход и картата. €1,200 изчезнаха за час. Домейнът на връзката беше фалшив, не банката ти.' } },
                            { label: { en: 'Call the number printed on the back of my card', bg: 'Звъня на номера от гърба на картата' }, emoji: '☎️', isGood: true, cashFlowChange: 0, consequence: { en: 'Exactly right. You ignored the SMS link and contacted the bank through a channel YOU trust. They confirmed the SMS was a scam. Crisis avoided.', bg: 'Точно така. Игнорира връзката в SMS-а и се свърза с банката през канал, на който ТИ вярваш. Потвърдиха, че SMS-ът беше измама. Кризата е избегната.' } },
                            { label: { en: 'Reply STOP to the message', bg: 'Отговарям STOP на съобщението' }, emoji: '💬', isGood: false, cashFlowChange: 0, consequence: { en: 'Replying just tells the scammer your number is live — expect more attempts. Never engage. Report and delete instead.', bg: 'Отговорът само казва на измамника, че номерът ти е активен — очаквай още опити. Никога не отговаряй. Докладвай и изтрий.' } },
                        ],
                    },
                    {
                        id: 'ph-choice-1',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'Octobank\'s real site is octobank.bg. Which link below is the REAL bank — not a scam look-alike?', bg: 'Истинският сайт на Octobank е octobank.bg. Коя връзка по-долу е ИСТИНСКАТА банка — а не измамна имитация?' },
                        options: [
                            { en: 'http://octobank-secure-login.com', bg: 'http://octobank-secure-login.com' },
                            { en: 'https://octobank.bg', bg: 'https://octobank.bg' },
                            { en: 'https://oct0bank.bg', bg: 'https://oct0bank.bg' },
                            { en: 'https://octobank.verify-account.net', bg: 'https://octobank.verify-account.net' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'Only octobank.bg is the genuine domain. The others bolt on extra words (-secure-login, verify-account) or swap a letter for a number (oct0bank). Always check the exact domain before the first slash.', bg: 'Само octobank.bg е истинският домейн. Останалите добавят думи (-secure-login, verify-account) или сменят буква с цифра (oct0bank). Винаги проверявай точния домейн преди първата наклонена черта.' },
                    },
                    {
                        id: 'ph-decision-1',
                        type: 'scenario_decision',
                        xp: 25,
                        decisionAvatar: '📧',
                        decisionScenario: { en: 'An email says: Congratulations, you\'ve won a €500 IKEA gift card — claim within 24 hours, just pay €2 shipping with your card. How do you respond?', bg: 'Имейл казва: Поздравления, спечели подаръчна карта IKEA за €500 — вземи я до 24 часа, просто плати €2 доставка с картата си. Как реагираш?' },
                        decisionChoices: [
                            { label: { en: 'Pay the €2 — it\'s tiny', bg: 'Плащам €2 — дребна сума' }, emoji: '💳', isBest: false, outcome: { en: 'The €2 was never the goal — your card details were. Scammers use a tiny charge to harvest card data for big fraud later. You don\'t win prizes you never entered.', bg: 'Целта никога не бяха €2 — а данните на картата ти. Измамниците използват малка сума, за да съберат данни за голяма измама после. Не печелиш награди, за които не си участвал.' } },
                            { label: { en: 'Delete it and report as phishing', bg: 'Изтривам и докладвам като фишинг' }, emoji: '🗑️', isBest: true, outcome: { en: 'Correct. A prize you never entered, plus urgency, plus pay a small fee equals a textbook scam. Deleting and reporting is exactly right.', bg: 'Правилно. Награда, за която не си участвал, плюс спешност, плюс плати малка такса е класическа измама. Изтриването и докладването е точно вярно.' } },
                            { label: { en: 'Reply to ask if it\'s real', bg: 'Отговарям, за да питам дали е истина' }, emoji: '✉️', isBest: false, outcome: { en: 'Replying confirms your address is active and invites more scams. You can\'t fact-check a scammer by asking the scammer.', bg: 'Отговорът потвърждава, че адресът ти е активен и кани още измами. Не можеш да провериш измамник, като питаш самия измамник.' } },
                        ],
                    },
                    {
                        id: 'ph-swipe-1',
                        type: 'swipe_sort',
                        xp: 20,
                        swipeSort: {
                            prompt: { en: 'Scam signal or safe move? Swipe each one.', bg: 'Сигнал за измама или безопасен ход? Плъзни всяко.' },
                            leftLabel: { en: 'Scam signal', bg: 'Сигнал за измама' },
                            rightLabel: { en: 'Safe move', bg: 'Безопасен ход' },
                            cards: [
                                { label: { en: '"Verify your password or your account is blocked"', bg: '„Потвърди паролата си или сметката ще бъде блокирана"' }, emoji: '🔒', isRight: false, explanation: { en: 'Urgency + asking for your password = scam.', bg: 'Спешност + искане на паролата = измама.' } },
                                { label: { en: 'Opening your bank app yourself to check', bg: 'Сам отваряш банковото приложение, за да провериш' }, emoji: '📲', isRight: true, explanation: { en: 'Going direct to the source is always safe.', bg: 'Директно към източника е винаги безопасно.' } },
                                { label: { en: 'A sender address like oct0bank.com', bg: 'Адрес на подател като oct0bank.com' }, emoji: '🕵️', isRight: false, explanation: { en: 'A zero for an O — almost-right is a red flag.', bg: 'Нула вместо O — почти-вярно е тревожен знак.' } },
                                { label: { en: 'Calling the number on the back of your card', bg: 'Звъниш на номера от гърба на картата' }, emoji: '☎️', isRight: true, explanation: { en: 'A channel YOU control — safe.', bg: 'Канал, който ТИ контролираш — безопасно.' } },
                                { label: { en: '"Pay €2 shipping to claim your prize"', bg: '„Плати €2 доставка, за да вземеш наградата"' }, emoji: '🎁', isRight: false, explanation: { en: 'Prize you never entered + a fee = scam.', bg: 'Награда без участие + такса = измама.' } },
                                { label: { en: 'Checking the exact domain before the first slash', bg: 'Проверяваш точния домейн преди първата наклонена черта' }, emoji: '🔍', isRight: true, explanation: { en: 'The real defense against fake links.', bg: 'Истинската защита срещу фалшиви връзки.' } },
                            ],
                        },
                    },
                ],
            },
            // ── Lesson 2: Money Scams & Cons ──
            {
                id: 'money-scams',
                moduleId: 'fraud-defense',
                title: { en: 'Money Scams & Cons', bg: 'Парични схеми и измами' },
                description: { en: 'Investment cons, romance scams, fake invoices — and what to do if you get hit.', bg: 'Инвестиционни схеми, любовни измами, фалшиви фактури — и какво да правиш, ако пострадаш.' },
                icon: '🚨', xpReward: 120, order: 2,
                exercises: [
                    {
                        id: 'ms-theory-1',
                        type: 'theory',
                        xp: 0,
                        slides: [
                            {
                                emoji: '🎭',
                                title: { en: 'The big four money scams', bg: 'Големите четири парични измами' },
                                body: { en: '1. INVESTMENT — guaranteed high returns, crypto doublers, pressure to act fast.\n2. ROMANCE — an online partner you never meet who eventually needs money.\n3. INVOICE / CEO FRAUD — a fake email that your supplier or boss changed bank details.\n4. ADVANCE-FEE — pay a small fee now to unlock a big prize, loan or inheritance.', bg: '1. ИНВЕСТИЦИОННА — гарантирана висока доходност, крипто удвоители, натиск да действаш бързо.\n2. ЛЮБОВНА — онлайн партньор, когото никога не срещаш и който в крайна сметка иска пари.\n3. ФАКТУРА / CEO ИЗМАМА — фалшив имейл, че доставчикът или шефът ти е сменил банкови данни.\n4. ПРЕДВАРИТЕЛНА ТАКСА — плати малка такса сега, за да отключиш голяма награда, заем или наследство.' },
                                highlight: { en: '💡 One rule beats them all: if it is urgent AND involves you sending money or details, slow down and verify independently.', bg: '💡 Едно правило ги бие всички: ако е спешно И включва изпращане на пари или данни, забави и провери независимо.' },
                            },
                        ],
                    },
                    {
                        id: 'ms-rpg-1',
                        type: 'rpg_scenario',
                        xp: 25,
                        avatar: '📈',
                        scenario: { en: 'A slick message: our crypto fund returns a GUARANTEED 30% per month, spots close tonight, send €1,000 and watch it grow. What do you do?', bg: 'Лъскаво съобщение: нашият крипто фонд носи ГАРАНТИРАНИ 30% на месец, местата се затварят довечера, изпрати €1,000 и гледай как растат. Какво правиш?' },
                        choices: [
                            { label: { en: 'Send €1,000 before spots close', bg: 'Изпращам €1,000 преди да затворят местата' }, emoji: '🚀', isGood: false, cashFlowChange: -1000, consequence: { en: 'It paid out €50 once to build trust, then vanished. Guaranteed 30%/month is mathematically impossible — that turns €1,000 into €23,000 in a year. It was a Ponzi.', bg: 'Изплати €50 веднъж, за да изгради доверие, после изчезна. Гарантирани 30%/месец е математически невъзможно — превръща €1,000 в €23,000 за година. Беше Понци схема.' } },
                            { label: { en: 'Ask for the firm\'s regulator licence, then walk away', bg: 'Искам лиценза от регулатора, после се отдръпвам' }, emoji: '🛡️', isGood: true, cashFlowChange: 0, consequence: { en: 'Perfect. No real EU investment is guaranteed high-return, and licensed firms are listed by your national regulator. They had nothing. You kept your €1,000.', bg: 'Идеално. Нито една истинска ЕС инвестиция не е с гарантирана висока доходност, а лицензираните фирми са в списък при националния регулатор. Те нямаха нищо. Запази си €1,000.' } },
                            { label: { en: 'Send a smaller €100 to test it', bg: 'Изпращам по-малко €100 за тест' }, emoji: '🪙', isGood: false, cashFlowChange: -100, consequence: { en: 'Testing a scam still funds the scam — and marks you as a payer they will push harder. The right test is verifying the licence, not sending money.', bg: 'Тестването на измама пак я финансира — и те маркира като платец, върху когото ще натискат повече. Правилният тест е проверка на лиценза, не изпращане на пари.' } },
                        ],
                    },
                    {
                        id: 'ms-tf-1',
                        type: 'true_false',
                        xp: 15,
                        statement: { en: 'A legitimate investment can promise high returns with no risk.', bg: 'Легитимна инвестиция може да обещае висока доходност без риск.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. Risk and return are linked — always. High return, no risk, guaranteed is the single most reliable signal of a scam in all of finance.', bg: 'НЕВЯРНО. Рискът и доходността са свързани — винаги. Висока доходност, без риск, гарантирано е най-надеждният сигнал за измама във финансите.' },
                    },
                    {
                        id: 'ms-choice-1',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'Someone you only know from an online chat — never met in person — says they have an emergency and asks you to send money. Best move?', bg: 'Някой, когото познаваш само от онлайн чат — никога срещан на живо — казва, че има спешен случай и иска да изпратиш пари. Най-добрият ход?' },
                        options: [
                            { en: 'Send it via crypto so it arrives fast', bg: 'Изпращам през крипто, за да стигне бързо' },
                            { en: 'Never send money to someone you haven\'t met; offer to video-call', bg: 'Никога не изпращам пари на несрещан човек; предлагам видеоразговор' },
                            { en: 'Send a smaller amount to be safe', bg: 'Изпращам по-малка сума за всеки случай' },
                            { en: 'Ask them to pay you back double later', bg: 'Моля ги да върнат двойно после' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'This is the classic romance scam. The emergency and request for money — especially crypto or gift cards — is the whole con. Never send money to someone you have not met in person. A real person will understand a video-call.', bg: 'Това е класическата любовна измама. Спешният случай и молбата за пари — особено крипто или ваучери — са цялата схема. Никога не изпращай пари на несрещан човек. Истински човек ще разбере видеоразговора.' },
                    },
                    {
                        id: 'ms-decision-1',
                        type: 'scenario_decision',
                        xp: 25,
                        decisionAvatar: '🧾',
                        decisionScenario: { en: 'You run a small business. An email from your regular supplier says: we\'ve changed banks, please pay this invoice to our new IBAN. The amount and logo look normal. What do you do?', bg: 'Имаш малък бизнес. Имейл от редовния ти доставчик казва: сменихме банка, моля плати тази фактура към новия ни IBAN. Сумата и логото изглеждат нормални. Какво правиш?' },
                        decisionChoices: [
                            { label: { en: 'Pay the new IBAN — the email looks right', bg: 'Плащам към новия IBAN — имейлът изглежда наред' }, emoji: '💸', isBest: false, outcome: { en: 'This is invoice (CEO) fraud — scammers spoof a known supplier and swap the IBAN. The money lands in their account. Changed bank details ALWAYS need a second check.', bg: 'Това е фактурна (CEO) измама — измамниците имитират познат доставчик и сменят IBAN. Парите отиват в тяхната сметка. Сменени банкови данни ВИНАГИ изискват втора проверка.' } },
                            { label: { en: 'Call the supplier on their known number to confirm', bg: 'Звъня на доставчика на познатия номер за потвърждение' }, emoji: '☎️', isBest: true, outcome: { en: 'Exactly. A 30-second call to a number you already have — not one from the email — defeats nearly every invoice scam. Verify any change of bank details out-of-band.', bg: 'Точно. 30-секунден разговор на номер, който вече имаш — не от имейла — побеждава почти всяка фактурна измама. Проверявай всяка смяна на банкови данни по отделен канал.' } },
                            { label: { en: 'Reply to the email asking them to confirm', bg: 'Отговарям на имейла да потвърдят' }, emoji: '↩️', isBest: false, outcome: { en: 'If the email is hijacked or spoofed, the scammer answers yes, it is us. Confirm through a DIFFERENT channel, never by replying.', bg: 'Ако имейлът е хакнат или фалшифициран, измамникът отговаря да, ние сме. Потвърждавай през ДРУГ канал, никога с отговор.' } },
                        ],
                    },
                    {
                        id: 'ms-order-1',
                        type: 'order_items',
                        xp: 25,
                        orderInstruction: { en: 'You realize you just sent money to a scammer. Order these steps from FIRST to LAST:', bg: 'Осъзнаваш, че току-що си изпратил пари на измамник. Подреди стъпките от ПЪРВА към ПОСЛЕДНА:' },
                        orderItems: [
                            { label: { en: 'Call your bank immediately to try to recall the payment', bg: 'Звъни веднага на банката да опита да върне плащането' }, emoji: '🏦' },
                            { label: { en: 'Change passwords on any exposed accounts', bg: 'Смени паролите на засегнатите акаунти' }, emoji: '🔑' },
                            { label: { en: 'Report to police / the national fraud line', bg: 'Докладвай в полицията / националната линия за измами' }, emoji: '👮' },
                            { label: { en: 'Warn friends and family in case they\'re targeted too', bg: 'Предупреди близки, в случай че и те са набелязани' }, emoji: '📢' },
                        ],
                        correctOrder: [0, 1, 2, 3],
                        explanation: { en: 'Speed matters most: the bank may recall a SEPA payment if you call FAST. Then secure your accounts, create an official report (needed for any refund), and warn others. The first hour is everything.', bg: 'Скоростта е най-важна: банката може да върне SEPA плащане, ако звъннеш БЪРЗО. После защити акаунтите, подай официален сигнал (нужен за възстановяване) и предупреди другите. Първият час решава всичко.' },
                    },
                    {
                        id: 'ms-choice-2',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'Across every scam in this module, what is the single most reliable warning sign?', bg: 'През всички измами в този модул, кой е най-надеждният предупредителен знак?' },
                        options: [
                            { en: 'Bad spelling in the message', bg: 'Правописни грешки в съобщението' },
                            { en: 'Pressure to act NOW plus a request for money or details', bg: 'Натиск да действаш СЕГА плюс молба за пари или данни' },
                            { en: 'The message is in English', bg: 'Съобщението е на английски' },
                            { en: 'It arrives in the evening', bg: 'Идва вечерта' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'Urgency plus a request to send money or reveal details is the universal scam fingerprint. Spelling has gotten good (and AI writes cleanly now). When you feel rushed, that is the moment to STOP and verify independently.', bg: 'Спешност плюс молба да изпратиш пари или да разкриеш данни е универсалният отпечатък на измамата. Правописът се подобри (а AI пише чисто вече). Когато се почувстваш притиснат, това е моментът да СПРЕШ и да провериш независимо.' },
                    },
                ],
            },
        ],
    },
    // ─────────────────────────────────────────────
    // MODULE — MONEY PSYCHOLOGY (free, behavioral finance)
    // ─────────────────────────────────────────────
    {
        id: 'money-psychology',
        title: { en: 'Money Psychology', bg: 'Психология на парите' },
        description: { en: 'The hidden biases that sabotage your money — and how to outsmart your own brain.', bg: 'Скритите изкривявания, които саботират парите ти — и как да надхитриш собствения си мозък.' },
        icon: '🧠', color: 'purple', order: 5.7,
        lessons: [
            // ── Lesson 1: Your Brain on Money ──
            {
                id: 'brain-on-money',
                moduleId: 'money-psychology',
                title: { en: 'Your Brain on Money', bg: 'Мозъкът ти и парите' },
                description: { en: 'Why smart people make money mistakes — meet the biases pulling your strings.', bg: 'Защо умни хора правят финансови грешки — запознай се с изкривяванията, които те дърпат за конците.' },
                icon: '🧠', xpReward: 95, order: 1,
                exercises: [
                    {
                        id: 'bom-theory-1',
                        type: 'theory',
                        xp: 0,
                        slides: [
                            {
                                emoji: '🧠',
                                title: { en: 'Smart people, dumb money moves', bg: 'Умни хора, глупави финансови ходове' },
                                body: { en: 'Your brain evolved to survive in a tribe, not to invest for 40 years. The same instincts that kept your ancestors alive — fear losses, follow the crowd, grab rewards now — quietly wreck modern money decisions.\n\nThe good news: you can\'t delete these biases, but once you can NAME them, you can catch yourself in the act.', bg: 'Мозъкът ти е еволюирал да оцелява в племе, а не да инвестира 40 години. Същите инстинкти, които са пазили предците ти живи — страх от загуби, следване на тълпата, грабване на награди сега — тихо рушат модерните финансови решения.\n\nДобрата новина: не можеш да изтриеш тези изкривявания, но щом можеш да ги НАЗОВЕШ, можеш да се хванеш на местопрестъплението.' },
                                highlight: { en: '💡 You don\'t need more willpower. You need to recognize the trap before you fall in.', bg: '💡 Не ти трябва повече воля. Трябва да разпознаеш капана, преди да паднеш в него.' },
                            },
                        ],
                    },
                    {
                        id: 'bom-tf-1',
                        type: 'true_false',
                        xp: 15,
                        statement: { en: 'Losing €100 and gaining €100 feel about equally intense.', bg: 'Загубата на €100 и печалбата на €100 се усещат приблизително еднакво силно.' },
                        isTrue: false,
                        explanation: { en: 'FALSE. This is LOSS AVERSION: losing hurts roughly twice as much as the equivalent gain feels good. It\'s why people panic-sell crashes and cling to losing bets — the pain of locking in a loss feels unbearable.', bg: 'НЕВЯРНО. Това е ОТБЯГВАНЕ НА ЗАГУБИ: загубата боли около два пъти повече, отколкото еквивалентната печалба радва. Затова хората продават в паника при сривове и се вкопчват в губещи залози.' },
                    },
                    {
                        id: 'bom-choice-1',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'You get a €500 tax refund. Which mindset protects you best?', bg: 'Получаваш €500 връщане на данък. Кой начин на мислене те пази най-добре?' },
                        options: [
                            { en: 'It\'s free bonus money, so splurge it guilt-free', bg: 'Това са безплатни бонус пари, харчи ги без вина' },
                            { en: 'Treat it exactly like money you earned — budget it', bg: 'Третирай ги точно като изкарани пари — вкарай ги в бюджета' },
                            { en: 'Keep it separate so it doesn\'t count', bg: 'Дръж ги отделно, за да не се броят' },
                            { en: 'Spend half because it appeared suddenly', bg: 'Похарчи половината, защото се появиха внезапно' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'This is MENTAL ACCOUNTING — treating a refund, bonus or gift as less "real" than salary, so we waste it. A euro is a euro. Refund money invested grows exactly like earned money invested.', bg: 'Това е МЕНТАЛНО СЧЕТОВОДСТВО — третиране на връщане, бонус или подарък като по-малко истински от заплатата, затова ги пилеем. Едно евро си е едно евро. Върнатите пари растат точно като изкараните, ако се инвестират.' },
                    },
                    {
                        id: 'bom-rpg-1',
                        type: 'rpg_scenario',
                        xp: 25,
                        avatar: '📈',
                        scenario: { en: 'You get a €600/month raise. Almost immediately you\'re eyeing a nicer flat, a newer car, fancier dinners — each feels deserved. What\'s really happening?', bg: 'Получаваш увеличение от €600/месец. Почти веднага оглеждаш по-хубав апартамент, по-нова кола, по-луксозни вечери — всяко изглежда заслужено. Какво всъщност се случва?' },
                        choices: [
                            { label: { en: 'Upgrade everything — I earned it', bg: 'Ъпгрейд на всичко — заслужих го' }, emoji: '🛍️', isGood: false, cashFlowChange: -600, consequence: { en: 'This is LIFESTYLE CREEP. Within months the raise vanishes into higher fixed costs, and your happiness resets to where it was — but now you NEED more to keep it. The treadmill speeds up.', bg: 'Това е ПЪЛЗЯЩА ИНФЛАЦИЯ НА РАЗХОДИТЕ. За месеци увеличението изчезва във по-високи фиксирани разходи, а щастието ти се връща там, където беше — но сега ти ТРЯБВА повече, за да го задържиш.' } },
                            { label: { en: 'Automatically invest the raise, lifestyle stays put', bg: 'Автоматично инвестирам увеличението, начинът на живот остава' }, emoji: '🔒', isGood: true, cashFlowChange: 600, consequence: { en: 'Brilliant. By banking the raise BEFORE you adapt to it, you avoid the hedonic treadmill entirely. This one habit is how normal salaries turn into real wealth.', bg: 'Блестящо. Като заделиш увеличението, ПРЕДИ да свикнеш с него, избягваш изцяло хедонистичната пътека. Този навик превръща нормалните заплати в истинско богатство.' } },
                            { label: { en: 'Spend half, invest half', bg: 'Харча половина, инвестирам половина' }, emoji: '⚖️', isGood: true, cashFlowChange: 300, consequence: { en: 'Solid and sustainable — you enjoy some of the reward while still escaping full lifestyle creep. The key is deciding the split BEFORE the money arrives.', bg: 'Стабилно и устойчиво — радваш се на част от наградата, докато избягваш пълната инфлация на разходите. Ключът е да решиш разпределението, ПРЕДИ да дойдат парите.' } },
                        ],
                    },
                    {
                        id: 'bom-decision-1',
                        type: 'scenario_decision',
                        xp: 25,
                        decisionAvatar: '🚗',
                        decisionScenario: { en: 'You\'ve spent €3,000 fixing an old car this year. The mechanic says it now needs another €2,000 repair, and more will follow. A reliable used car costs €6,000. What do you do?', bg: 'Похарчил си €3,000 за ремонт на стара кола тази година. Механикът казва, че сега ѝ трябва още €2,000 ремонт, и ще последват още. Надеждна употребявана кола струва €6,000. Какво правиш?' },
                        decisionChoices: [
                            { label: { en: 'Pay the €2,000 — I\'ve already put so much in', bg: 'Плащам €2,000 — вече вложих толкова' }, emoji: '🔧', isBest: false, outcome: { en: 'That\'s the SUNK COST FALLACY. The €3,000 is already gone whatever you choose — it should NOT influence the decision. You\'re throwing good money after bad to justify the past.', bg: 'Това е ЗАБЛУДАТА НА НЕВЪЗВРАТИМИТЕ РАЗХОДИ. €3,000 вече ги няма, каквото и да избереш — те НЕ бива да влияят на решението. Хвърляш добри пари след лоши, за да оправдаеш миналото.' } },
                            { label: { en: 'Ignore what I\'ve spent; compare €2,000+more vs a reliable car', bg: 'Игнорирам похарченото; сравнявам €2,000+още срещу надеждна кола' }, emoji: '🧮', isBest: true, outcome: { en: 'Exactly right. Decisions should look FORWARD, not back. A car that bleeds €2,000 repeatedly is worse than a reliable one — the past €3,000 is irrelevant to today\'s choice.', bg: 'Точно вярно. Решенията гледат НАПРЕД, не назад. Кола, която източва по €2,000 многократно, е по-лоша от надеждна — миналите €3,000 са без значение за днешния избор.' } },
                            { label: { en: 'Keep repairing forever to avoid "wasting" the past spend', bg: 'Ремонтирам вечно, за да не е напразно похарченото' }, emoji: '♾️', isBest: false, outcome: { en: 'This is the trap at its worst — the more you\'ve sunk, the harder it feels to walk away, so you sink even more. Name the bias and you break the loop.', bg: 'Това е капанът в най-лошия му вид — колкото повече си вложил, толкова по-трудно е да се откажеш, затова влагаш още. Назови изкривяването и разкъсваш цикъла.' } },
                        ],
                    },
                    {
                        id: 'bom-choice-2',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'A jacket\'s tag reads "was €200, now €100". When is buying it actually smart?', bg: 'Етикетът на яке гласи „беше €200, сега €100". Кога купуването му е наистина умно?' },
                        options: [
                            { en: 'Always — you\'re saving €100', bg: 'Винаги — спестяваш €100' },
                            { en: 'Only if you\'d happily pay €100 for it regardless of the old price', bg: 'Само ако с радост би платил €100, без значение от старата цена' },
                            { en: 'Because the discount won\'t last', bg: 'Защото отстъпката няма да трае' },
                            { en: 'Since €100 off must mean it\'s high quality', bg: 'Щом е €100 отстъпка, значи е качествено' },
                        ],
                        correctIndex: 1,
                        explanation: { en: 'This is ANCHORING. The "€200" is a number designed to make €100 feel like a win. The original price is irrelevant — the only question is whether the jacket is worth €100 to YOU. A discount on something you didn\'t need is 100% spending, not saving.', bg: 'Това е ЗАКОТВЯНЕ. „€200" е число, създадено да накара €100 да изглежда като победа. Старата цена е без значение — единственият въпрос е дали якето струва €100 за ТЕБ. Отстъпка за нещо ненужно е 100% харчене, не спестяване.' },
                    },
                ],
            },
            // ── Lesson 2: Beating the Traps ──
            {
                id: 'beating-the-traps',
                moduleId: 'money-psychology',
                title: { en: 'Beating the Traps', bg: 'Победи капаните' },
                description: { en: 'FOMO, instant gratification and the systems that beat willpower every time.', bg: 'FOMO, моментално удоволствие и системите, които бият волята всеки път.' },
                icon: '🛡️', xpReward: 120, order: 2,
                exercises: [
                    {
                        id: 'btt-theory-1',
                        type: 'theory',
                        xp: 0,
                        slides: [
                            {
                                emoji: '⚙️',
                                title: { en: 'Systems beat willpower', bg: 'Системите бият волята' },
                                body: { en: 'Willpower is a battery that drains all day. By evening, the disciplined version of you is gone — which is exactly when bad money choices happen.\n\nThe fix isn\'t trying harder. It\'s building SYSTEMS that make the good choice automatic and the bad choice slower: auto-transfers, spending speed bumps, removing saved cards from shopping sites.', bg: 'Волята е батерия, която се изтощава през деня. До вечерта дисциплинираната версия от теб я няма — точно когато се случват лошите финансови решения.\n\nРешението не е да се стараеш повече. А да изградиш СИСТЕМИ, които правят добрия избор автоматичен, а лошия — по-бавен: автоматични преводи, спирачки при харчене, премахване на запазени карти от сайтове.' },
                                highlight: { en: '💡 Make saving automatic and spending effortful — and you barely need discipline at all.', bg: '💡 Направи спестяването автоматично, а харченето трудоемко — и почти няма да ти трябва дисциплина.' },
                            },
                        ],
                    },
                    {
                        id: 'btt-rpg-1',
                        type: 'rpg_scenario',
                        xp: 25,
                        avatar: '🚀',
                        scenario: { en: 'A coin is up 300% in a month. Your group chat is euphoric, a colleague just doubled their money, and you feel the pull to jump in before you miss out. What do you do?', bg: 'Монета е нагоре 300% за месец. Груповият чат е в еуфория, колега току-що удвои парите си, и усещаш порива да скочиш, преди да изпуснеш. Какво правиш?' },
                        choices: [
                            { label: { en: 'Buy now before it goes higher', bg: 'Купувам сега, преди да поскъпне още' }, emoji: '🤑', isGood: false, cashFlowChange: -1500, consequence: { en: 'Classic FOMO and herd behavior. By the time everyone is euphoric, you\'re usually buying the TOP from the early crowd who are about to sell. It dropped 70% the next month.', bg: 'Класическо FOMO и стадно поведение. Докато всички са в еуфория, обикновено купуваш ВЪРХА от ранната тълпа, която ще продава. Падна 70% следващия месец.' } },
                            { label: { en: 'Stick to my plan and skip the hype', bg: 'Държа се за плана си и пропускам хайпа' }, emoji: '🧭', isGood: true, cashFlowChange: 0, consequence: { en: 'Disciplined. If something only looks attractive because it already went up and everyone\'s talking about it, that\'s a crowd signal, not an investment thesis. Boring and rich beats exciting and broke.', bg: 'Дисциплинирано. Ако нещо изглежда привлекателно само защото вече е поскъпнало и всички говорят за него, това е сигнал на тълпата, не инвестиционна теза.' } },
                            { label: { en: 'Put in a tiny amount I can fully afford to lose', bg: 'Влагам малка сума, която мога да си позволя да загубя' }, emoji: '🎲', isGood: true, cashFlowChange: -50, consequence: { en: 'Acceptable IF it\'s genuinely money you\'d shrug off losing and it\'s a tiny slice of your portfolio. The danger is when "a little fun" quietly becomes your rent money.', bg: 'Приемливо, АКО наистина са пари, чиято загуба не би те засегнала, и са малка част от портфейла. Опасността е когато малко забавление тихо стане парите за наема.' } },
                        ],
                    },
                    {
                        id: 'btt-choice-1',
                        type: 'choice',
                        xp: 15,
                        question: { en: 'Why do so many people under-save for the future even when they intend to?', bg: 'Защо толкова хора спестяват твърде малко за бъдещето, дори когато имат намерение?' },
                        options: [
                            { en: 'The future feels less real than right now (present bias)', bg: 'Бъдещето изглежда по-малко реално от сега (изкривяване към настоящето)' },
                            { en: 'Saving is mathematically impossible', bg: 'Спестяването е математически невъзможно' },
                            { en: 'Banks forbid it', bg: 'Банките го забраняват' },
                            { en: 'Future-you doesn\'t need money', bg: 'Бъдещото ти аз не се нуждае от пари' },
                        ],
                        correctIndex: 0,
                        explanation: { en: 'This is PRESENT BIAS — we massively overvalue rewards now versus later, so "future me" keeps getting robbed by "current me". Automating savings takes the decision away from the impatient present version of you.', bg: 'Това е ИЗКРИВЯВАНЕ КЪМ НАСТОЯЩЕТО — надценяваме наградите сега спрямо после, затова бъдещото аз постоянно бива ограбвано от сегашното. Автоматизирането на спестяванията отнема решението от нетърпеливата версия от теб.' },
                    },
                    {
                        id: 'btt-tf-1',
                        type: 'true_false',
                        xp: 15,
                        statement: { en: 'Waiting 24-48 hours before a big non-essential purchase reliably reduces regret.', bg: 'Изчакването 24-48 часа преди голяма ненужна покупка надеждно намалява съжалението.' },
                        isTrue: true,
                        explanation: { en: 'TRUE. The urge to buy is an emotional SPIKE that fades fast. A simple cooling-off rule — sleep on anything above a set amount — lets the rational you decide. Most "must-haves" quietly stop mattering by tomorrow.', bg: 'ВЯРНО. Импулсът за покупка е емоционален ПИК, който бързо избледнява. Просто правило за изчакване — преспи върху всичко над определена сума — позволява на рационалния теб да реши. Повечето задължителни неща тихо спират да имат значение до утре.' },
                    },
                    {
                        id: 'btt-decision-1',
                        type: 'scenario_decision',
                        xp: 25,
                        decisionAvatar: '🤖',
                        decisionScenario: { en: 'You keep meaning to save but somehow there\'s never anything left at month-end. What\'s the most reliable fix?', bg: 'Все се каниш да спестяваш, но някак в края на месеца никога не остава нищо. Кое е най-надеждното решение?' },
                        decisionChoices: [
                            { label: { en: 'Try harder to spend less each day', bg: 'Старая се повече да харча по-малко всеки ден' }, emoji: '💪', isBest: false, outcome: { en: 'Relying on daily willpower is the plan that fails most. Every purchase becomes a fresh battle you eventually lose by month-end.', bg: 'Разчитането на ежедневна воля е планът, който се проваля най-често. Всяка покупка става нова битка, която накрая губиш до края на месеца.' } },
                            { label: { en: 'Auto-transfer savings the DAY you\'re paid', bg: 'Автоматичен превод към спестявания в ДЕНЯ на заплатата' }, emoji: '🤖', isBest: true, outcome: { en: 'This is the single highest-impact money system. Pay yourself FIRST, automatically, and you spend what\'s left guilt-free. No willpower required — the decision already happened.', bg: 'Това е системата с най-голям ефект. Плати на себе си ПЪРВО, автоматично, и харчиш остатъка без вина. Не е нужна воля — решението вече е взето.' } },
                            { label: { en: 'Wait for a high-income month to start', bg: 'Изчаквам месец с висок доход, за да започна' }, emoji: '⏳', isBest: false, outcome: { en: '"I\'ll start when I earn more" rarely arrives — lifestyle creep eats every raise. Automating even a small amount NOW beats a big amount someday.', bg: 'Ще започна, когато печеля повече рядко идва — инфлацията на разходите изяжда всяко увеличение. Автоматизиране дори на малка сума СЕГА бие голяма сума някой ден.' } },
                        ],
                    },
                    {
                        id: 'btt-order-1',
                        type: 'order_items',
                        xp: 25,
                        orderInstruction: { en: 'Build a "spending speed bump" for big purchases. Order the steps from FIRST to LAST:', bg: 'Изгради спирачка при големи покупки. Подреди стъпките от ПЪРВА към ПОСЛЕДНА:' },
                        orderItems: [
                            { label: { en: 'Set a rule: anything over €X waits 48 hours', bg: 'Задай правило: всичко над €X чака 48 часа' }, emoji: '⏱️' },
                            { label: { en: 'Remove saved cards from shopping apps and sites', bg: 'Премахни запазените карти от приложения и сайтове' }, emoji: '💳' },
                            { label: { en: 'When the urge hits, add it to a wishlist instead of buying', bg: 'Когато дойде импулсът, добави в списък с желания вместо да купуваш' }, emoji: '📝' },
                            { label: { en: 'After 48h, ask: would I still buy this at full price?', bg: 'След 48ч се питай: бих ли го купил на пълна цена?' }, emoji: '✅' },
                        ],
                        correctOrder: [0, 1, 2, 3],
                        explanation: { en: 'First set the rule, then make impulse-buying harder (no saved cards = friction), park the urge on a wishlist so it can cool, and finally judge it rationally. You\'re engineering your environment so the lazy path is the smart one.', bg: 'Първо задай правилото, после направи импулсивното купуване по-трудно (без запазени карти = триене), паркирай импулса в списък, за да изстине, и накрая прецени рационално. Проектираш средата си така, че мързеливият път да е умният.' },
                    },
                    {
                        id: 'btt-speed-1',
                        type: 'speed_round',
                        xp: 25,
                        speedRound: {
                            prompt: { en: 'Name that bias — fast!', bg: 'Назови изкривяването — бързо!' },
                            secondsPerQuestion: 8,
                            passScore: 0.6,
                            questions: [
                                {
                                    q: { en: 'Spending more every time your income rises is…', bg: 'Харченето на повече при всяко увеличение на дохода е…' },
                                    options: [{ en: 'Lifestyle creep', bg: 'Пълзяща инфлация на разходите' }, { en: 'Loss aversion', bg: 'Отбягване на загуби' }, { en: 'Anchoring', bg: 'Закотвяне' }],
                                    correctIndex: 0,
                                },
                                {
                                    q: { en: 'Refusing to sell a loser because "I\'ve already lost so much" is…', bg: 'Отказът да продадеш губещ, защото „вече загубих толкова" е…' },
                                    options: [{ en: 'Present bias', bg: 'Изкривяване към настоящето' }, { en: 'Sunk cost fallacy', bg: 'Заблуда на невъзвратимите разходи' }, { en: 'FOMO', bg: 'FOMO' }],
                                    correctIndex: 1,
                                },
                                {
                                    q: { en: 'Buying because everyone in your chat is buying is…', bg: 'Купуването, защото всички в чата купуват, е…' },
                                    options: [{ en: 'Mental accounting', bg: 'Ментално счетоводство' }, { en: 'Herd / FOMO', bg: 'Стадно / FOMO' }, { en: 'Anchoring', bg: 'Закотвяне' }],
                                    correctIndex: 1,
                                },
                                {
                                    q: { en: 'A €100 loss hurting more than a €100 gain feels good is…', bg: 'Загуба от €100 боли повече, отколкото печалба от €100 радва — това е…' },
                                    options: [{ en: 'Loss aversion', bg: 'Отбягване на загуби' }, { en: 'Lifestyle creep', bg: 'Пълзяща инфлация' }, { en: 'Present bias', bg: 'Изкривяване към настоящето' }],
                                    correctIndex: 0,
                                },
                                {
                                    q: { en: 'The single best defense against all of them is…', bg: 'Най-добрата защита срещу всички тях е…' },
                                    options: [{ en: 'More willpower', bg: 'Повече воля' }, { en: 'Automating good choices', bg: 'Автоматизиране на добрите избори' }, { en: 'Checking prices hourly', bg: 'Проверка на цените всеки час' }],
                                    correctIndex: 1,
                                },
                            ],
                        },
                    },
                ],
            },
        ],
    },
];
// Merge static + generated modules.
// Static modules take precedence — generated ones fill in IDs not already in static.
const byId = new Map();
for (const m of generatedModules)
    byId.set(m.id, m);
for (const m of staticModules)
    byId.set(m.id, m);
exports.modules = [...byId.values()].sort((a, b) => a.order - b.order);
