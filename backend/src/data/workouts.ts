// ───────────────────────────────────────────────────────────────
// workouts.ts — the Daily Money Workout question pool.
//
// One bite-sized question per calendar day, picked deterministically by
// date so every user gets the same "daily" question (Wordle-style). The
// pool rotates; add more questions any time.
// ───────────────────────────────────────────────────────────────

export interface LocalizedText { en: string; bg: string }

export interface WorkoutQuestion {
  id: string;
  question: LocalizedText;
  options: LocalizedText[];
  correctIndex: number;
  explanation: LocalizedText;
}

export const WORKOUTS: WorkoutQuestion[] = [
  {
    id: 'w-emergency-months',
    question: { en: 'How many months of expenses is a common emergency-fund target?', bg: 'Колко месечни разхода е често препоръчвана цел за авариен фонд?' },
    options: [
      { en: '0.5 months', bg: '0.5 месеца' },
      { en: '3–6 months', bg: '3–6 месеца' },
      { en: '24 months', bg: '24 месеца' },
      { en: 'No fund needed', bg: 'Не е нужен фонд' },
    ],
    correctIndex: 1,
    explanation: { en: '3–6 months of essential expenses is the classic safety net — enough to absorb a job loss or big surprise.', bg: '3–6 месеца основни разходи е класическата защита — достатъчно при загуба на работа или голяма изненада.' },
  },
  {
    id: 'w-5030-20',
    question: { en: 'In the 50/30/20 rule, what does the 20% go to?', bg: 'В правилото 50/30/20, за какво отиват 20%?' },
    options: [
      { en: 'Wants', bg: 'Желания' },
      { en: 'Needs', bg: 'Нужди' },
      { en: 'Savings & debt payoff', bg: 'Спестявания и изплащане на дълг' },
      { en: 'Taxes', bg: 'Данъци' },
    ],
    correctIndex: 2,
    explanation: { en: '50% needs, 30% wants, 20% savings + extra debt payments. The 20% is what builds wealth.', bg: '50% нужди, 30% желания, 20% спестявания + дълг. 20%-те изграждат богатството.' },
  },
  {
    id: 'w-compound',
    question: { en: 'What makes compound interest so powerful over time?', bg: 'Какво прави сложната лихва толкова мощна с времето?' },
    options: [
      { en: 'You earn interest on your interest', bg: 'Печелиш лихва върху лихвата' },
      { en: 'Banks add bonus cash', bg: 'Банките добавят бонус пари' },
      { en: 'Inflation disappears', bg: 'Инфлацията изчезва' },
      { en: 'Taxes are removed', bg: 'Данъците отпадат' },
    ],
    correctIndex: 0,
    explanation: { en: 'Your gains start generating their own gains. Time in the market beats timing the market.', bg: 'Печалбите ти започват да носят свои печалби. Времето на пазара бие опитите да го уцелиш.' },
  },
  {
    id: 'w-ucits',
    question: { en: 'For EU investors, what kind of ETF is typically the most accessible?', bg: 'За инвеститори в ЕС, кой вид ETF е обикновено най-достъпен?' },
    options: [
      { en: 'US-domiciled ETFs', bg: 'ETF-и регистрирани в САЩ' },
      { en: 'UCITS ETFs', bg: 'UCITS ETF-и' },
      { en: 'Penny-stock funds', bg: 'Фондове за пени-акции' },
      { en: 'Leveraged-only ETFs', bg: 'Само ливъридж ETF-и' },
    ],
    correctIndex: 1,
    explanation: { en: 'UCITS funds are the EU-regulated standard (e.g. VWCE, CSPX) — most EU brokers offer them.', bg: 'UCITS фондовете са ЕС-регулираният стандарт (напр. VWCE, CSPX) — повечето ЕС брокери ги предлагат.' },
  },
  {
    id: 'w-credit-util',
    question: { en: 'Keeping your credit-card balance below what % of the limit helps your score most?', bg: 'Под какъв % от лимита да държиш баланса на картата, за да помогнеш на рейтинга?' },
    options: [
      { en: 'Under 30%', bg: 'Под 30%' },
      { en: 'Under 90%', bg: 'Под 90%' },
      { en: 'Exactly 100%', bg: 'Точно 100%' },
      { en: "It doesn't matter", bg: 'Няма значение' },
    ],
    correctIndex: 0,
    explanation: { en: 'Low utilization (ideally under 10–30%) signals you are not over-reliant on credit.', bg: 'Ниско усвояване (идеално под 10–30%) показва, че не разчиташ прекалено на кредит.' },
  },
  {
    id: 'w-avalanche',
    question: { en: 'The debt "avalanche" method pays off which debt first?', bg: 'Методът „лавина" за дълг изплаща първо кой дълг?' },
    options: [
      { en: 'Smallest balance', bg: 'Най-малкия баланс' },
      { en: 'Highest interest rate', bg: 'Най-високата лихва' },
      { en: 'Oldest debt', bg: 'Най-стария дълг' },
      { en: 'Random', bg: 'Случаен' },
    ],
    correctIndex: 1,
    explanation: { en: 'Avalanche targets the highest interest rate first — mathematically the cheapest path. (Snowball targets smallest balance for motivation.)', bg: 'Лавината атакува първо най-високата лихва — математически най-евтиният път. (Снежната топка — най-малкия баланс за мотивация.)' },
  },
  {
    id: 'w-diversify',
    question: { en: 'Why diversify your investments?', bg: 'Защо да диверсифицираш инвестициите си?' },
    options: [
      { en: 'To guarantee profit', bg: 'За да гарантираш печалба' },
      { en: 'To reduce the risk of any single asset', bg: 'За да намалиш риска от един актив' },
      { en: 'To avoid all taxes', bg: 'За да избегнеш всички данъци' },
      { en: 'To trade more often', bg: 'За да търгуваш по-често' },
    ],
    correctIndex: 1,
    explanation: { en: "Spreading across assets means one bad pick can't sink you. Diversification is the only free lunch in investing.", bg: 'Разпределянето между активи значи, че един лош избор не те потапя. Диверсификацията е единственият безплатен обяд в инвестирането.' },
  },
  {
    id: 'w-inflation',
    question: { en: 'If inflation is 4% and your savings earn 1%, your money is…', bg: 'Ако инфлацията е 4%, а спестяванията печелят 1%, парите ти…' },
    options: [
      { en: 'Gaining value', bg: 'Печелят стойност' },
      { en: 'Losing purchasing power', bg: 'Губят покупателна способност' },
      { en: 'Perfectly stable', bg: 'Напълно стабилни' },
      { en: 'Doubling', bg: 'Удвояват се' },
    ],
    correctIndex: 1,
    explanation: { en: 'A 1% return against 4% inflation is a ~3% real loss. Cash sitting idle quietly shrinks.', bg: 'Доходност 1% срещу 4% инфлация е ~3% реална загуба. Кешът на престой тихо се топи.' },
  },
  {
    id: 'w-sepa',
    question: { en: 'What is a SEPA transfer?', bg: 'Какво е SEPA превод?' },
    options: [
      { en: 'A euro bank transfer within the EU area', bg: 'Банков превод в евро в рамките на ЕС' },
      { en: 'A crypto token', bg: 'Крипто токен' },
      { en: 'A type of tax', bg: 'Вид данък' },
      { en: 'A credit score', bg: 'Кредитен рейтинг' },
    ],
    correctIndex: 0,
    explanation: { en: 'SEPA lets you send euros across participating European countries cheaply and in a standard way.', bg: 'SEPA позволява да изпращаш евро между европейски държави евтино и стандартизирано.' },
  },
  {
    id: 'w-pay-yourself',
    question: { en: '"Pay yourself first" means…', bg: '„Първо плати на себе си" означава…' },
    options: [
      { en: 'Spend on treats before bills', bg: 'Харчи за лукс преди сметки' },
      { en: 'Automate savings before you spend', bg: 'Автоматизирай спестяванията преди да харчиш' },
      { en: 'Take a salary advance', bg: 'Вземи аванс от заплата' },
      { en: 'Pay your debts last', bg: 'Плати дълговете последни' },
    ],
    correctIndex: 1,
    explanation: { en: 'Move money to savings the moment you get paid — what is left is what you spend. Habit beats willpower.', bg: 'Прехвърли към спестявания веднага щом ти платят — остатъкът е за харчене. Навикът бие волята.' },
  },
  {
    id: 'w-index-fees',
    question: { en: 'Over 15+ years, most active fund managers…', bg: 'За 15+ години, повечето активни мениджъри на фондове…' },
    options: [
      { en: 'Beat the index easily', bg: 'Лесно бият индекса' },
      { en: 'Underperform a low-cost index fund', bg: 'Изостават от евтин индексен фонд' },
      { en: 'Guarantee returns', bg: 'Гарантират доходност' },
      { en: 'Avoid all risk', bg: 'Избягват всякакъв риск' },
    ],
    correctIndex: 1,
    explanation: { en: '~85–90% of active funds lose to the index after fees. Low costs are one of the few things you control.', bg: '~85–90% от активните фондове губят от индекса след такси. Ниските разходи са едно от малкото, които контролираш.' },
  },
  {
    id: 'w-needs-wants',
    question: { en: 'Which is a "need", not a "want"?', bg: 'Кое е „нужда", а не „желание"?' },
    options: [
      { en: 'Streaming subscriptions', bg: 'Стрийминг абонаменти' },
      { en: 'Rent / housing', bg: 'Наем / жилище' },
      { en: 'A second coffee out', bg: 'Второ кафе навън' },
      { en: 'The newest phone', bg: 'Най-новият телефон' },
    ],
    correctIndex: 1,
    explanation: { en: 'Housing is essential. Separating needs from wants is the foundation of every budget.', bg: 'Жилището е essential. Разделянето на нужди от желания е основата на всеки бюджет.' },
  },
];

/** Number of whole days since the Unix epoch (UTC). */
function dayNumberUTC(d = new Date()): number {
  return Math.floor(d.getTime() / 86400000);
}

/** Deterministically pick today's workout so all users share the same daily question. */
export function getTodaysWorkout(today = new Date()): { index: number; question: WorkoutQuestion } {
  const index = dayNumberUTC(today) % WORKOUTS.length;
  return { index, question: WORKOUTS[index] };
}

/** Reward tuning. */
export const WORKOUT_REWARD_CORRECT = { xp: 15, coins: 5 };
export const WORKOUT_REWARD_WRONG = { xp: 5, coins: 0 };
