export interface LocalizedText {
  en: string;
  bg: string;
}

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
  {
    id: 'budgeting',
    title: { en: 'Budgeting Basics', bg: 'Основи на бюджетирането' },
    description: {
      en: 'Learn to manage your money and take control of your finances.',
      bg: 'Научете се да управлявате парите си и да контролирате финансите си.',
    },
    icon: '💰',
    color: 'green',
    order: 1,
    lessons: [
      {
        id: 'what-is-budget',
        moduleId: 'budgeting',
        title: { en: 'What is a Budget?', bg: 'Какво е бюджет?' },
        description: {
          en: 'Discover why budgeting is the foundation of financial health.',
          bg: 'Открийте защо бюджетирането е основата на финансовото здраве.',
        },
        icon: '📋',
        xpReward: 50,
        order: 1,
        exercises: [
          {
            id: 'budget-q1',
            type: 'choice',
            question: {
              en: 'What is the primary purpose of creating a personal budget?',
              bg: 'Каква е основната цел на личния бюджет?',
            },
            options: [
              { en: 'To restrict all fun spending', bg: 'Да ограничи всички разходи за забавления' },
              { en: 'To track and manage income and expenses', bg: 'Да проследи и управлява доходите и разходите' },
              { en: 'To impress your bank', bg: 'Да впечатли банката ти' },
              { en: 'To avoid paying taxes', bg: 'Да избегне плащането на данъци' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'A budget is a financial plan that helps you track where your money comes from and goes, enabling smarter financial decisions.',
              bg: 'Бюджетът е финансов план, който помага да проследиш откъде идват и накъде отиват парите ти, позволявайки по-умни финансови решения.',
            },
            xp: 10,
          },
          {
            id: 'budget-q2',
            type: 'choice',
            question: {
              en: 'A budget is only necessary for people who are struggling financially.',
              bg: 'Бюджетът е необходим само за хора с финансови затруднения.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Everyone benefits from budgeting! It helps wealthy people stay wealthy and helps others build wealth over time.',
              bg: 'Всеки се възползва от бюджетирането! То помага на заможните хора да останат такива и на другите да изградят богатство.',
            },
            xp: 10,
          },
          {
            id: 'budget-q3',
            type: 'choice',
            question: {
              en: 'Maria earns €2,000/month but consistently spends €2,200. What should she do FIRST?',
              bg: 'Мария получава €2,000 на месец, но постоянно харчи €2,200. Какво трябва да направи ПЪРВО?',
            },
            options: [
              { en: 'Apply for a higher credit limit', bg: 'Да кандидатства за по-висок кредитен лимит' },
              { en: 'Track her expenses to find where she can cut back', bg: 'Да проследи разходите си и да намери как да намали' },
              { en: 'Ignore it — things will sort themselves out', bg: 'Да го игнорира — нещата ще се наредят' },
              { en: 'Take a second job immediately', bg: 'Веднага да вземе втора работа' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Before drastic action, Maria should first understand where her money goes. Tracking expenses often reveals easy savings opportunities.',
              bg: 'Преди радикални действия, Мария трябва да разбере накъде отиват парите й. Проследяването на разходите често разкрива лесни начини за спестяване.',
            },
            xp: 15,
          },
          {
            id: 'budget-q4',
            type: 'fill_blank',
            question: {
              en: 'You earn €3,000/month and your expenses total €2,400. Your monthly surplus is €___',
              bg: 'Получавате €3,000 на месец и разходите ви са €2,400. Месечният ви излишък е €___',
            },
            correctAnswer: 600,
            answerMin: 595,
            answerMax: 605,
            answerUnit: '€',
            explanation: {
              en: '€3,000 − €2,400 = €600. This €600 surplus can go toward savings and investments!',
              bg: '€3,000 − €2,400 = €600. Тези €600 могат да отидат за спестявания и инвестиции!',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'fifty-thirty-twenty',
        moduleId: 'budgeting',
        title: { en: 'The 50/30/20 Rule', bg: 'Правилото 50/30/20' },
        description: {
          en: 'A simple framework to split your income wisely.',
          bg: 'Прост начин за разпределение на доходите ти.',
        },
        icon: '⚖️',
        xpReward: 75,
        order: 2,
        exercises: [
          {
            id: '5030-q1',
            type: 'choice',
            question: {
              en: "In the 50/30/20 rule, what does the '50' represent?",
              bg: "В правилото 50/30/20, какво представлява '50'?",
            },
            options: [
              { en: 'Savings and investments', bg: 'Спестявания и инвестиции' },
              { en: 'Entertainment and lifestyle', bg: 'Забавления и начин на живот' },
              { en: 'Needs and necessities', bg: 'Нужди и необходимости' },
              { en: 'Taxes and fees', bg: 'Данъци и такси' },
            ],
            correctIndex: 2,
            explanation: {
              en: '50% goes to essential needs like rent, food, and utilities. 30% covers wants, and 20% goes to savings and debt repayment.',
              bg: '50% отиват за основни нужди като наем, храна и комунални услуги. 30% за желания, а 20% за спестявания и изплащане на дълг.',
            },
            xp: 10,
          },
          {
            id: '5030-q2',
            type: 'fill_blank',
            question: {
              en: 'Using the 50/30/20 rule with monthly income of €4,000, savings should be €___',
              bg: 'Използвайки правилото 50/30/20 с месечен доход от €4,000, спестяванията трябва да са €___',
            },
            correctAnswer: 800,
            answerMin: 795,
            answerMax: 805,
            answerUnit: '€',
            explanation: {
              en: '20% of €4,000 = €800. This goes toward savings, emergency fund, and debt repayment.',
              bg: '20% от €4,000 = €800. Това отива за спестявания, авариен фонд и изплащане на дълг.',
            },
            xp: 15,
          },
          {
            id: '5030-q3',
            type: 'choice',
            question: {
              en: "Which of these is a 'want' (30%) rather than a 'need' (50%)?",
              bg: "Кое е 'желание' (30%), а не 'нужда' (50%)?",
            },
            options: [
              { en: 'Rent / mortgage payment', bg: 'Наем / ипотека' },
              { en: 'Basic groceries', bg: 'Основни хранителни стоки' },
              { en: 'Streaming subscriptions', bg: 'Стрийминг абонаменти' },
              { en: 'Utility bills', bg: 'Комунални сметки' },
            ],
            correctIndex: 2,
            explanation: {
              en: "Streaming services are optional comforts — they belong in the 'wants' category. Rent, groceries, and utilities are necessities.",
              bg: "Стрийминг услугите са незадължителни удобства — те спадат към категорията 'желания'. Наем, хранителни стоки и комунални услуги са необходимости.",
            },
            xp: 10,
          },
          {
            id: '5030-q4',
            type: 'choice',
            question: {
              en: 'Alex earns €3,000/month. He spends €1,800 on needs, €800 on wants, €400 on savings. Which 50/30/20 category is off?',
              bg: 'Алекс получава €3,000 на месец. Харчи €1,800 за нужди, €800 за желания, €400 за спестявания. Коя категория от 50/30/20 не е наред?',
            },
            options: [
              { en: "All correct — it's perfectly balanced", bg: 'Всичко е наред — напълно балансирано' },
              { en: 'Too much on needs (€1,800 vs ideal €1,500)', bg: 'Твърде много за нужди (€1,800 вместо €1,500)' },
              { en: 'Too much on wants', bg: 'Твърде много за желания' },
              { en: 'Too much on savings', bg: 'Твърде много за спестявания' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'With €3,000 income: needs should be €1,500 (50%), wants €900 (30%), savings €600 (20%). Alex overspends on needs and underspends on savings.',
              bg: 'С доход €3,000: нужди трябва да са €1,500 (50%), желания €900 (30%), спестявания €600 (20%). Алекс похарчва прекалено много за нужди и прекалено малко за спестявания.',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'tracking-expenses',
        moduleId: 'budgeting',
        title: { en: 'Tracking Expenses', bg: 'Проследяване на разходите' },
        description: {
          en: 'Small purchases add up — learn to spot your spending leaks.',
          bg: 'Малките покупки се натрупват — научете се да откривате „течовете" в харченето.',
        },
        icon: '🔍',
        xpReward: 75,
        order: 3,
        exercises: [
          {
            id: 'track-q1',
            type: 'choice',
            question: {
              en: "What is the 'latte factor'?",
              bg: "Какво е 'ефектът на латето'?",
            },
            options: [
              { en: 'Caffeine that boosts productivity', bg: 'Кофеин, който повишава продуктивността' },
              { en: 'Small daily purchases that add up significantly', bg: 'Малки ежедневни покупки, които се натрупват значително' },
              { en: 'A type of investment strategy', bg: 'Вид инвестиционна стратегия' },
              { en: 'A savings account at coffee shops', bg: 'Спестовна сметка в кафенета' },
            ],
            correctIndex: 1,
            explanation: {
              en: "The 'latte factor' refers to small, daily expenses (like a €4 coffee) that seem trivial but total thousands per year.",
              bg: "'Ефектът на латето' се отнася за малки ежедневни разходи (като €4 кафе), които изглеждат незначителни, но натрупват хиляди годишно.",
            },
            xp: 10,
          },
          {
            id: 'track-q2',
            type: 'fill_blank',
            question: {
              en: 'You spend €4 on coffee every workday (22 days/month). Annual coffee cost: €___',
              bg: 'Харчите €4 за кафе всеки работен ден (22 дни/месец). Годишен разход за кафе: €___',
            },
            correctAnswer: 1056,
            answerMin: 1040,
            answerMax: 1070,
            answerUnit: '€',
            explanation: {
              en: '€4 × 22 days × 12 months = €1,056/year. That\'s over €1,000 on coffee alone!',
              bg: '€4 × 22 дни × 12 месеца = €1,056/година. Това е над €1,000 само за кафе!',
            },
            xp: 15,
          },
          {
            id: 'track-q3',
            type: 'choice',
            question: {
              en: 'Tracking your expenses can help you identify unnecessary spending patterns.',
              bg: 'Проследяването на разходите може да ти помогне да идентифицираш ненужни модели на харчене.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 0,
            explanation: {
              en: 'Tracking expenses gives you a clear picture of where money goes, making it easy to spot patterns and cut unnecessary spending.',
              bg: 'Проследяването на разходите ти дава ясна картина накъде отиват парите, улеснявайки намирането и намаляването на ненужните разходи.',
            },
            xp: 10,
          },
          {
            id: 'track-q4',
            type: 'choice',
            question: {
              en: "You discover you're paying for 3 streaming services (€45/month) but rarely use 2 of them. Smart move?",
              bg: 'Установявате, че плащате за 3 стрийминг услуги (€45/месец), но рядко използвате 2. Кой е умният ход?',
            },
            options: [
              { en: "Keep all 3 — you might use them someday", bg: 'Запазете и трите — може да ги ползвате някой ден' },
              { en: 'Cancel the 2 unused and save €30/month', bg: 'Отменете 2-те неизползвани и спестете €30/месец' },
              { en: 'Add more services for better value', bg: 'Добавете още услуги за по-добра стойност' },
              { en: 'Switch to more expensive services', bg: 'Преминете към по-скъпи услуги' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Cancelling unused subscriptions is easy money. €30/month saved = €360/year that can go toward savings or investments.',
              bg: 'Отмяната на неизползвани абонаменти е лесни пари. €30/месец спестени = €360/година, които могат да отидат за спестявания или инвестиции.',
            },
            xp: 15,
          },
        ],
      },
    ],
  },

  {
    id: 'saving',
    title: { en: 'Saving Smart', bg: 'Умно спестяване' },
    description: {
      en: 'Build your safety net and harness the power of compound interest.',
      bg: 'Изградете финансова мрежа и използвайте силата на сложната лихва.',
    },
    icon: '💎',
    color: 'blue',
    order: 2,
    lessons: [
      {
        id: 'why-save',
        moduleId: 'saving',
        title: { en: 'Why Save Money?', bg: 'Защо да спестяваме?' },
        description: {
          en: 'Understand the importance of savings for financial security.',
          bg: 'Разберете важността на спестяванията за финансова сигурност.',
        },
        icon: '🛡️',
        xpReward: 50,
        order: 1,
        exercises: [
          {
            id: 'save-q1',
            type: 'choice',
            question: {
              en: 'How many months of expenses should an emergency fund ideally cover?',
              bg: 'Колко месеца разходи трябва да покрива авариен фонд в идеалния случай?',
            },
            options: [
              { en: '1 month', bg: '1 месец' },
              { en: '2 months', bg: '2 месеца' },
              { en: '3–6 months', bg: '3–6 месеца' },
              { en: '12+ months', bg: '12+ месеца' },
            ],
            correctIndex: 2,
            explanation: {
              en: '3–6 months of expenses gives you a solid safety net for job loss, medical emergencies, or major unexpected costs.',
              bg: '3–6 месеца разходи ви осигурява стабилна мрежа за безопасност при загуба на работа, медицински извънредни ситуации или неочаквани разходи.',
            },
            xp: 10,
          },
          {
            id: 'save-q2',
            type: 'choice',
            question: {
              en: 'You should invest your emergency fund in stocks to earn higher returns.',
              bg: 'Трябва да инвестирате авариен фонд в акции, за да спечелите по-висока доходност.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Emergency funds must be safe and accessible. Stocks can lose 30–50% of value right when you need the money most.',
              bg: 'Авариен фонд трябва да е безопасен и достъпен. Акциите могат да загубят 30–50% от стойността точно когато имате най-много нужда от парите.',
            },
            xp: 10,
          },
          {
            id: 'save-q3',
            type: 'choice',
            question: {
              en: "Your car needs a €1,500 repair. Situation A: you have a €2,000 emergency fund. Situation B: no savings, credit card at 22% APR. Which is better?",
              bg: 'Колата ви се нуждае от ремонт за €1,500. Ситуация А: имате €2,000 авариен фонд. Ситуация Б: без спестявания, кредитна карта при 22% ГПР. Коя е по-добра?',
            },
            options: [
              { en: 'Situation B — credit cards are more flexible', bg: 'Ситуация Б — кредитните карти са по-гъвкави' },
              { en: 'Situation A — pay €1,500 and stay stress-free', bg: 'Ситуация А — плащате €1,500 и оставате без стрес' },
              { en: "They're equivalent in cost", bg: 'Те са еквивалентни по цена' },
              { en: 'Situation B — interest is tax deductible', bg: 'Ситуация Б — лихвата е данъчно приспадаема' },
            ],
            correctIndex: 1,
            explanation: {
              en: "With a credit card at 22%, you'd pay hundreds extra in interest. With an emergency fund, you just pay €1,500 and rebuild the fund.",
              bg: 'При кредитна карта с 22%, ще платите стотици допълнително в лихви. С авариен фонд просто плащате €1,500 и попълвате фонда.',
            },
            xp: 15,
          },
          {
            id: 'save-q4',
            type: 'fill_blank',
            question: {
              en: 'Your monthly expenses are €2,000. To have a 3-month emergency fund, you need €___',
              bg: 'Месечните ви разходи са €2,000. За 3-месечен авариен фонд са ви необходими €___',
            },
            correctAnswer: 6000,
            answerMin: 5995,
            answerMax: 6005,
            answerUnit: '€',
            explanation: {
              en: '€2,000 × 3 months = €6,000. Start small — even €500 saved is better than nothing!',
              bg: '€2,000 × 3 месеца = €6,000. Започнете малко — дори €500 спестени е по-добре от нищо!',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'compound-interest',
        moduleId: 'saving',
        title: { en: 'The Magic of Compound Interest', bg: 'Магията на сложната лихва' },
        description: {
          en: 'Discover why time is your greatest financial asset.',
          bg: 'Открийте защо времето е вашият най-голям финансов актив.',
        },
        icon: '✨',
        xpReward: 75,
        order: 2,
        exercises: [
          {
            id: 'compound-q1',
            type: 'choice',
            question: {
              en: 'What is compound interest?',
              bg: 'Какво е сложна лихва?',
            },
            options: [
              { en: 'Interest calculated only on the original principal', bg: 'Лихва, изчислена само върху първоначалната главница' },
              { en: 'Interest calculated on both principal AND accumulated interest', bg: 'Лихва, изчислена върху главницата И натрупаната лихва' },
              { en: 'A complicated bank fee', bg: 'Сложна банкова такса' },
              { en: 'Interest paid monthly regardless of balance', bg: 'Лихва, платена месечно независимо от баланса' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Compound interest is interest on interest — your earnings themselves start earning. This is why it grows exponentially over time.',
              bg: 'Сложната лихва е лихва върху лихва — вашите печалби сами започват да печелят. Затова расте експоненциално с времето.',
            },
            xp: 10,
          },
          {
            id: 'compound-q2',
            type: 'fill_blank',
            question: {
              en: 'Rule of 72: At 8% annual return, money doubles in approximately ___ years.',
              bg: 'Правило на 72: При 8% годишна доходност, парите се удвояват приблизително за ___ години.',
            },
            correctAnswer: 9,
            answerMin: 8,
            answerMax: 10,
            answerUnit: 'years',
            explanation: {
              en: '72 ÷ 8 = 9 years. The Rule of 72 is a quick way to estimate how long it takes to double money at a given interest rate.',
              bg: '72 ÷ 8 = 9 години. Правилото на 72 е бърз начин да изчислите колко години ще отнеме за удвояване при дадена лихва.',
            },
            xp: 15,
          },
          {
            id: 'compound-q3',
            type: 'choice',
            question: {
              en: 'Starting to invest 10 years earlier can result in significantly more wealth at retirement, even saving the same total amount.',
              bg: 'Започването на инвестиране 10 години по-рано може да доведе до значително повече богатство при пенсиониране, дори при спестяване на същата обща сума.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 0,
            explanation: {
              en: "This is the 'early bird advantage' of compound interest. Extra years of compounding can be worth more than extra contributions.",
              bg: "Това е 'предимството на ранния старт' на сложната лихва. Допълнителните години на натрупване могат да струват повече от допълнителните вноски.",
            },
            xp: 10,
          },
          {
            id: 'compound-q4',
            type: 'choice',
            question: {
              en: 'Anna invests €5,000 at age 25 (40 years at 7%). Bob invests €5,000 at age 45 (20 years at 7%). How much more will Anna have at retirement?',
              bg: 'Анна инвестира €5,000 на 25 г. (40 години при 7%). Боб инвестира €5,000 на 45 г. (20 години при 7%). С колко повече ще разполага Анна при пенсиониране?',
            },
            options: [
              { en: 'About the same amount', bg: 'Почти същата сума' },
              { en: 'About 2× more (€20k vs €10k)', bg: 'Около 2 пъти повече (€20k vs €10k)' },
              { en: 'About 4× more (€75k vs €19k)', bg: 'Около 4 пъти повече (€75k vs €19k)' },
              { en: 'Bob will have more — experience matters', bg: 'Боб ще има повече — опитът има значение' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'At 7%: Anna: €5,000 × 1.07⁴⁰ ≈ €75,000. Bob: €5,000 × 1.07²⁰ ≈ €19,000. Starting early is incredibly powerful!',
              bg: 'При 7%: Анна: €5,000 × 1.07⁴⁰ ≈ €75,000. Боб: €5,000 × 1.07²⁰ ≈ €19,000. Ранното начало е невероятно мощно!',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'saving-strategies',
        moduleId: 'saving',
        title: { en: 'Smart Saving Strategies', bg: 'Умни стратегии за спестяване' },
        description: {
          en: 'Practical techniques to save more with less willpower.',
          bg: 'Практически техники за спестяване на повече с по-малко воля.',
        },
        icon: '🧠',
        xpReward: 100,
        order: 3,
        exercises: [
          {
            id: 'strategy-q1',
            type: 'choice',
            question: {
              en: "What does 'paying yourself first' mean?",
              bg: "Какво означава 'плащай първо на себе си'?",
            },
            options: [
              { en: 'Spending on treats before paying bills', bg: 'Харчене за удоволствия преди плащане на сметки' },
              { en: 'Automatically saving a set amount before discretionary spending', bg: 'Автоматично спестяване на определена сума преди свободно харчене' },
              { en: 'Paying off your credit card first', bg: 'Изплащане на кредитна карта първо' },
              { en: 'Giving yourself a weekly allowance', bg: 'Давате си седмични джобни' },
            ],
            correctIndex: 1,
            explanation: {
              en: "By automating savings at the start of the month, you remove willpower from the equation. What's left is yours to spend freely.",
              bg: 'Чрез автоматизиране на спестяванията в началото на месеца, премахвате нуждата от воля. Оставащото можете да харчите свободно.',
            },
            xp: 10,
          },
          {
            id: 'strategy-q2',
            type: 'choice',
            question: {
              en: 'Lifestyle inflation — upgrading your lifestyle every time you get a raise — helps build wealth faster.',
              bg: 'Инфлацията на начина на живот — подобряване на начина ви на живот при всяко увеличение на заплатата — помага да изградите богатство по-бързо.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Lifestyle inflation is the enemy of wealth building. Keeping your costs stable while income rises is one of the most powerful wealth strategies.',
              bg: 'Инфлацията на начина на живот е врагът на изграждането на богатство. Поддържането на стабилни разходи при нарастващ доход е една от най-мощните стратегии.',
            },
            xp: 10,
          },
          {
            id: 'strategy-q3',
            type: 'choice',
            question: {
              en: 'You receive a €500/month raise. Which strategy builds the most wealth over time?',
              bg: 'Получавате увеличение от €500 на месец. Коя стратегия изгражда най-много богатство с времето?',
            },
            options: [
              { en: 'Spend all of it upgrading your lifestyle', bg: 'Похарчете всичко за подобряване на начина на живот' },
              { en: 'Save €400, treat yourself with €100', bg: 'Спестете €400, наградете се с €100' },
              { en: 'Buy more things on credit since income increased', bg: 'Купете повече на кредит, тъй като доходът е нараснал' },
              { en: 'Add new subscriptions and monthly services', bg: 'Добавете нови абонаменти и месечни услуги' },
            ],
            correctIndex: 1,
            explanation: {
              en: "Saving most of a raise is a balanced approach. You still reward yourself while dramatically accelerating wealth building. It's a win-win!",
              bg: 'Спестяването на по-голямата част от увеличението е балансиран подход. Все пак се награждавате, докато значително ускорявате изграждането на богатство.',
            },
            xp: 15,
          },
          {
            id: 'strategy-q4',
            type: 'choice',
            question: {
              en: 'Which is generally the BEST place to keep an emergency fund?',
              bg: 'Кое е като цяло НАЙ-ДОБРОТО място за авариен фонд?',
            },
            options: [
              { en: 'Stock market portfolio', bg: 'Портфейл от акции' },
              { en: 'High-yield savings account', bg: 'Спестовна сметка с висока лихва' },
              { en: 'Cash at home', bg: 'Пари в брой вкъщи' },
              { en: 'Long-term fixed deposits (CDs)', bg: 'Дългосрочни фиксирани депозити' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'High-yield savings accounts offer better interest than regular accounts while keeping your money safe and accessible within 1–2 business days.',
              bg: 'Спестовните сметки с висока лихва предлагат по-добра лихва от обикновените сметки, като държат парите ви безопасни и достъпни в рамките на 1–2 работни дни.',
            },
            xp: 15,
          },
        ],
      },
    ],
  },

  {
    id: 'investing',
    title: { en: 'Investing 101', bg: 'Инвестиции 101' },
    description: {
      en: 'Grow your money through smart investing strategies.',
      bg: 'Увеличете парите си чрез умни инвестиционни стратегии.',
    },
    icon: '📈',
    color: 'purple',
    order: 3,
    lessons: [
      {
        id: 'stocks-bonds',
        moduleId: 'investing',
        title: { en: 'Stocks & Bonds Basics', bg: 'Основи на акции и облигации' },
        description: {
          en: 'Understand the two most common investment types.',
          bg: 'Разберете двата най-разпространени вида инвестиции.',
        },
        icon: '🏛️',
        xpReward: 50,
        order: 1,
        exercises: [
          {
            id: 'stocks-q1',
            type: 'choice',
            question: {
              en: 'When you buy a share of stock, you become...',
              bg: 'Когато купите акция, вие ставате...',
            },
            options: [
              { en: 'A creditor of the company', bg: 'Кредитор на компанията' },
              { en: 'A partial owner of the company', bg: 'Частичен собственик на компанията' },
              { en: 'An employee of the company', bg: 'Служител на компанията' },
              { en: 'Responsible for company debts', bg: 'Отговорен за дълговете на компанията' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Stocks represent ownership. As a shareholder you benefit when the company grows — and lose when it struggles.',
              bg: 'Акциите представляват собственост. Като акционер се възползвате, когато компанията расте — и губите, когато се бори.',
            },
            xp: 10,
          },
          {
            id: 'stocks-q2',
            type: 'choice',
            question: {
              en: 'Bonds are generally considered safer than stocks because...',
              bg: 'Облигациите обикновено се считат за по-безопасни от акциите, защото...',
            },
            options: [
              { en: 'They always increase in value', bg: 'Те винаги нарастват на стойност' },
              { en: 'They are government property', bg: 'Те са държавна собственост' },
              { en: 'They provide fixed interest payments and return principal', bg: 'Те осигуряват фиксирани лихвени плащания и връщат главницата' },
              { en: 'They cannot be sold', bg: 'Не могат да бъдат продадени' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'Bonds are loans to companies or governments. They pay fixed interest and return your principal — making them more predictable than stocks.',
              bg: 'Облигациите са заеми към компании или правителства. Те плащат фиксирана лихва и връщат главницата — правейки ги по-предсказуеми от акциите.',
            },
            xp: 10,
          },
          {
            id: 'stocks-q3',
            type: 'choice',
            question: {
              en: 'Diversifying investments means you cannot lose any money.',
              bg: 'Диверсифицирането на инвестициите означава, че не можете да загубите пари.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Diversification reduces risk — but not to zero. It prevents one bad investment from destroying your portfolio, but markets can still decline.',
              bg: 'Диверсификацията намалява риска — но не до нула. Предотвратява дадена лоша инвестиция да унищожи портфейла ви, но пазарите все пак могат да спаднат.',
            },
            xp: 10,
          },
          {
            id: 'stocks-q4',
            type: 'choice',
            question: {
              en: '€10,000 to invest: Option A: Put all in one company. Option B: Spread across 20 companies in different industries. Generally wiser?',
              bg: '€10,000 за инвестиране: Вариант А: Всичко в една компания. Вариант Б: Разпределени между 20 компании в различни отрасли. Кое е по-мъдро?',
            },
            options: [
              { en: 'Option A — concentrate for maximum gain', bg: 'Вариант А — концентрация за максимална печалба' },
              { en: 'Option B — diversification reduces risk', bg: 'Вариант Б — диверсификацията намалява риска' },
              { en: "They're equally risky", bg: 'Те са еднакво рискови' },
              { en: 'Neither — keep it in cash', bg: 'Нито едното — пазете в брой' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Diversification is a core investing principle. If one company fails, the others cushion the blow. Option A could lose everything if the company fails.',
              bg: 'Диверсификацията е основен инвестиционен принцип. Ако една компания се провали, другите омекотяват удара. Вариант А може да загуби всичко при фалит.',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'index-funds',
        moduleId: 'investing',
        title: { en: 'Index Funds & Long-Term Investing', bg: 'Индексни фондове и дългосрочно инвестиране' },
        description: {
          en: 'The investing strategy that beats most professionals.',
          bg: 'Инвестиционната стратегия, която надминава повечето професионалисти.',
        },
        icon: '📊',
        xpReward: 75,
        order: 2,
        exercises: [
          {
            id: 'index-q1',
            type: 'choice',
            question: {
              en: 'An index fund tracks...',
              bg: 'Индексният фонд проследява...',
            },
            options: [
              { en: 'Individual stocks picked by experts', bg: 'Индивидуални акции, избрани от експерти' },
              { en: 'A market index like the S&P 500', bg: 'Пазарен индекс като S&P 500' },
              { en: 'Only government bonds', bg: 'Само държавни облигации' },
              { en: 'Real estate properties', bg: 'Имотни активи' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Index funds buy all stocks in an index (e.g. the 500 largest US companies). Low fees + broad diversification = great long-term results.',
              bg: 'Индексните фондове купуват всички акции в даден индекс (напр. 500-те най-големи американски компании). Ниски такси + широка диверсификация = отлични дългосрочни резултати.',
            },
            xp: 10,
          },
          {
            id: 'index-q2',
            type: 'choice',
            question: {
              en: 'Most actively managed funds consistently beat index funds over long periods.',
              bg: 'Повечето активно управлявани фондове последователно надвишават индексните фондове за дълги периоди.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Research consistently shows ~90% of actively managed funds underperform their index over 15+ years, mainly due to higher fees and trading costs.',
              bg: 'Изследванията последователно показват, че ~90% от активно управляваните фондове не надминават индекса си за 15+ години, главно поради по-високи такси и разходи за търговия.',
            },
            xp: 10,
          },
          {
            id: 'index-q3',
            type: 'choice',
            question: {
              en: 'You invest €200/month for 30 years at 7% average return. Approximate final value?',
              bg: 'Инвестирате €200 на месец за 30 години при средна доходност от 7%. Приблизителна крайна стойност?',
            },
            options: [
              { en: '€72,000 (just your contributions)', bg: '€72,000 (само вашите вноски)' },
              { en: '€110,000', bg: '€110,000' },
              { en: '€227,000', bg: '€227,000' },
              { en: '€500,000+', bg: '€500,000+' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'You contributed €72,000 (€200×12×30) but compound growth turns it into ~€227,000. That extra €155,000 is pure compound interest!',
              bg: 'Внесохте €72,000 (€200×12×30), но сложният растеж ги превръща в ~€227,000. Тези допълнителни €155,000 са чиста сложна лихва!',
            },
            xp: 15,
          },
          {
            id: 'index-q4',
            type: 'choice',
            question: {
              en: 'Which strategy has historically provided the best returns for average investors over 30+ years?',
              bg: 'Коя стратегия исторически е осигурявала най-добра доходност за средните инвеститори за 30+ години?',
            },
            options: [
              { en: 'Actively trading stocks daily', bg: 'Активна ежедневна търговия с акции' },
              { en: "Timing the market (buy low, sell high)", bg: 'Пазарен тайминг (купуване евтино, продаване скъпо)' },
              { en: 'Regular contributions to low-cost index funds', bg: 'Редовни вноски в нискотарифни индексни фондове' },
              { en: 'Keeping money in a savings account', bg: 'Съхранение на пари в спестовна сметка' },
            ],
            correctIndex: 2,
            explanation: {
              en: '"Time in the market beats timing the market." Regular contributions to index funds, left to compound for decades, is the most proven wealth strategy.',
              bg: '"Времето на пазара побеждава тайминга на пазара." Редовните вноски в индексни фондове, оставени да натрупват за десетилетия, е най-доказаната стратегия за богатство.',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'portfolio-building',
        moduleId: 'investing',
        title: { en: 'Building Your Portfolio', bg: 'Изграждане на портфейл' },
        description: {
          en: 'Learn asset allocation and how to stay the course during market drops.',
          bg: 'Научете разпределение на активите и как да останете стабилни при пазарни спадове.',
        },
        icon: '🎯',
        xpReward: 100,
        order: 3,
        exercises: [
          {
            id: 'portfolio-q1',
            type: 'choice',
            question: {
              en: 'What is asset allocation?',
              bg: 'Какво е разпределение на активите?',
            },
            options: [
              { en: 'Selling all your investments', bg: 'Продаване на всички инвестиции' },
              { en: 'Deciding how to divide investments among different asset types', bg: 'Решаване как да разпределите инвестициите между различни видове активи' },
              { en: 'Opening multiple bank accounts', bg: 'Отваряне на множество банкови сметки' },
              { en: 'Only paying down debt', bg: 'Само изплащане на дълг' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Asset allocation (e.g., 80% stocks, 20% bonds) balances your risk vs. return based on your age, goals, and risk tolerance.',
              bg: 'Разпределението на активите (напр. 80% акции, 20% облигации) балансира риска спрямо доходността въз основа на вашата възраст, цели и толерантност към риск.',
            },
            xp: 10,
          },
          {
            id: 'portfolio-q2',
            type: 'choice',
            question: {
              en: 'A younger investor should generally hold more stocks than bonds.',
              bg: 'По-млад инвеститор обикновено трябва да притежава повече акции отколкото облигации.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 0,
            explanation: {
              en: 'Young investors have time to recover from market drops. More stocks = higher long-term returns. As you near retirement, shift toward safer bonds.',
              bg: 'Младите инвеститори имат време да се възстановят от пазарни спадове. Повече акции = по-висока дългосрочна доходност. С наближаване на пенсиониране преминете към по-безопасни облигации.',
            },
            xp: 10,
          },
          {
            id: 'portfolio-q3',
            type: 'choice',
            question: {
              en: "The market drops 30% in one month. You're 28, investing for retirement at 65. What should you do?",
              bg: 'Пазарът спада с 30% за един месец. На 28 сте и инвестирате за пенсиониране на 65. Какво трябва да направите?',
            },
            options: [
              { en: 'Sell everything to avoid more losses', bg: 'Продайте всичко, за да избегнете повече загуби' },
              { en: 'Panic and move to cash', bg: 'Паникьосайте се и преминете към кеш' },
              { en: 'Continue regular contributions and stay the course', bg: 'Продължете редовните вноски и следвайте курса' },
              { en: 'Borrow money to invest even more', bg: 'Вземете заем за да инвестирате повече' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'With 37 years until retirement, short-term drops are opportunities, not disasters. History shows markets always recover and reach new highs.',
              bg: 'С 37 години до пенсионирането, краткосрочните спадове са възможности, не бедствия. Историята показва, че пазарите винаги се възстановяват и достигат нови върхове.',
            },
            xp: 15,
          },
          {
            id: 'portfolio-q4',
            type: 'choice',
            question: {
              en: "What is 'rebalancing' a portfolio?",
              bg: "Какво е 'балансиране' на портфейл?",
            },
            options: [
              { en: 'Selling all investments and starting over', bg: 'Продаване на всички инвестиции и начало отначало' },
              { en: 'Adjusting allocations back to your target percentages', bg: 'Коригиране на разпределенията обратно към целевите проценти' },
              { en: 'Adding only new investments', bg: 'Добавяне само на нови инвестиции' },
              { en: 'Moving everything to bonds', bg: 'Преместване на всичко в облигации' },
            ],
            correctIndex: 1,
            explanation: {
              en: "After market movements your allocations drift. Rebalancing (e.g., yearly) restores your target mix, keeping risk in check. It's automatic discipline.",
              bg: 'След пазарни движения разпределенията ви се отклоняват. Балансирането (напр. годишно) възстановява целевия микс, поддържайки риска под контрол.',
            },
            xp: 15,
          },
        ],
      },
    ],
  },

  {
    id: 'credit-debt',
    title: { en: 'Credit & Debt', bg: 'Кредити и дългове' },
    description: {
      en: 'Master credit scores and escape the debt trap.',
      bg: 'Овладейте кредитните рейтинги и избягайте от капана на дълга.',
    },
    icon: '🏦',
    color: 'orange',
    order: 4,
    lessons: [
      {
        id: 'credit-scores',
        moduleId: 'credit-debt',
        title: { en: 'Understanding Credit Scores', bg: 'Разбиране на кредитния рейтинг' },
        description: {
          en: 'Learn what affects your score and how to improve it.',
          bg: 'Научете какво влияе на оценката ви и как да я подобрите.',
        },
        icon: '⭐',
        xpReward: 50,
        order: 1,
        exercises: [
          {
            id: 'credit-q1',
            type: 'choice',
            question: {
              en: 'In most scoring models, credit scores range from...',
              bg: 'В повечето модели за оценяване, кредитните оценки варират от...',
            },
            options: [
              { en: '0 to 100', bg: '0 до 100' },
              { en: '100 to 500', bg: '100 до 500' },
              { en: '300 to 850', bg: '300 до 850' },
              { en: '500 to 1000', bg: '500 до 1000' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'FICO scores range 300–850. Above 740 is excellent; 670–739 is good; below 580 is poor. Aim for 740+ to get the best loan rates.',
              bg: 'Оценките по FICO варират от 300 до 850. Над 740 е отлично; 670–739 е добро; под 580 е лошо. Целете 740+ за най-добри лихви по заеми.',
            },
            xp: 10,
          },
          {
            id: 'credit-q2',
            type: 'choice',
            question: {
              en: 'Which factor has the BIGGEST impact on your credit score?',
              bg: 'Кой фактор има НАЙ-ГОЛЯМО влияние върху кредитния ви рейтинг?',
            },
            options: [
              { en: 'Credit age (how long you have had credit)', bg: 'Кредитна възраст (колко дълго имате кредит)' },
              { en: 'Credit utilization ratio', bg: 'Коефициент на усвояване на кредит' },
              { en: 'Payment history (paying on time)', bg: 'История на плащанията (навременно плащане)' },
              { en: 'Number of hard inquiries', bg: 'Брой на твърдите запитвания' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'Payment history accounts for ~35% of your FICO score. Even one missed payment can significantly hurt your score. Always pay at least the minimum on time.',
              bg: 'Историята на плащанията представлява ~35% от оценката по FICO. Дори едно пропуснато плащане може значително да навреди на оценката ви. Винаги плащайте поне минимума навреме.',
            },
            xp: 10,
          },
          {
            id: 'credit-q3',
            type: 'choice',
            question: {
              en: "Checking your own credit score is a 'hard inquiry' and will lower your score.",
              bg: "Проверката на собствения кредитен рейтинг е 'твърдо запитване' и ще намали оценката ви.",
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 1,
            explanation: {
              en: "Checking your own score is a 'soft inquiry' — it never affects your score. Only hard inquiries (from lenders) impact your score.",
              bg: "Проверката на собствената ви оценка е 'меко запитване' — то никога не влияе на оценката ви. Само твърдите запитвания (от кредитори) влияят на оценката.",
            },
            xp: 10,
          },
          {
            id: 'credit-q4',
            type: 'choice',
            question: {
              en: 'Your credit card limit is €5,000. For the best credit score, keep your balance below...',
              bg: 'Лимитът на кредитната ви карта е €5,000. За най-добър кредитен рейтинг, поддържайте баланса под...',
            },
            options: [
              { en: '€4,500 (90% utilization)', bg: '€4,500 (90% усвояване)' },
              { en: '€2,500 (50% utilization)', bg: '€2,500 (50% усвояване)' },
              { en: '€1,500 (30% utilization)', bg: '€1,500 (30% усвояване)' },
              { en: '€500 (10% utilization)', bg: '€500 (10% усвояване)' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'Keep utilization below 30% (ideally under 10%). High utilization signals financial stress to lenders. €1,500 on a €5,000 limit = 30% utilization.',
              bg: 'Поддържайте усвояването под 30% (в идеалния случай под 10%). Високото усвояване сигнализира финансов стрес на кредиторите. €1,500 на лимит от €5,000 = 30% усвояване.',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'good-vs-bad-debt',
        moduleId: 'credit-debt',
        title: { en: 'Good Debt vs Bad Debt', bg: 'Добър дълг срещу лош дълг' },
        description: {
          en: 'Not all debt is created equal — learn the difference.',
          bg: 'Не всички дългове са еднакви — научете разликата.',
        },
        icon: '⚡',
        xpReward: 75,
        order: 2,
        exercises: [
          {
            id: 'debt-q1',
            type: 'choice',
            question: {
              en: "Which of these is typically considered 'good debt'?",
              bg: "Кое от тях обикновено се счита за 'добър дълг'?",
            },
            options: [
              { en: 'High-interest credit card debt', bg: 'Дълг по кредитна карта с висока лихва' },
              { en: 'Payday loans', bg: 'Бързи заеми' },
              { en: 'A mortgage on an affordable home', bg: 'Ипотека за достъпен дом' },
              { en: 'Buy-now-pay-later for luxury items', bg: 'Купи сега, плати по-късно за луксозни стоки' },
            ],
            correctIndex: 2,
            explanation: {
              en: "'Good debt' builds assets or future value. A mortgage builds equity as you pay it down. Credit card debt and payday loans typically just drain your wealth.",
              bg: "'Добрият дълг' изгражда активи или бъдеща стойност. Ипотеката изгражда собствен капитал с изплащането й. Дългът по кредитни карти и бързите заеми обикновено просто източват богатството ви.",
            },
            xp: 10,
          },
          {
            id: 'debt-q2',
            type: 'choice',
            question: {
              en: 'Credit card debt at 22% APR is generally worse than a student loan at 4% APR.',
              bg: 'Дълг по кредитна карта при 22% ГПР е като цяло по-лош от студентски заем при 4% ГПР.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 0,
            explanation: {
              en: 'Higher interest rate = more money lost over time. At 22% vs 4%, the credit card costs over 5× more per year in interest on the same principal.',
              bg: 'По-висока лихва = повече загубени пари с времето. При 22% срещу 4%, кредитната карта струва над 5 пъти повече годишно в лихви при същата главница.',
            },
            xp: 10,
          },
          {
            id: 'debt-q3',
            type: 'fill_blank',
            question: {
              en: 'You owe €2,000 on a credit card at 20% annual interest. Annual interest cost: approximately €___',
              bg: 'Дължите €2,000 на кредитна карта с 20% годишна лихва. Годишен разход за лихва: приблизително €___',
            },
            correctAnswer: 400,
            answerMin: 380,
            answerMax: 420,
            answerUnit: '€',
            explanation: {
              en: '€2,000 × 20% = €400/year in interest. If you only make minimum payments, it could take years to pay off and cost far more.',
              bg: '€2,000 × 20% = €400/година в лихви. Ако правите само минимални плащания, може да отнеме години за изплащане и да струва много повече.',
            },
            xp: 15,
          },
          {
            id: 'debt-q4',
            type: 'choice',
            question: {
              en: 'You have €1,000 extra. Credit card: €1,000 balance at 22% APR. Index fund: ~7% average return. What should you do?',
              bg: 'Имате €1,000 лишни. Кредитна карта: €1,000 баланс при 22% ГПР. Индексен фонд: ~7% средна доходност. Какво трябва да направите?',
            },
            options: [
              { en: 'Invest in the index fund for growth', bg: 'Инвестирайте в индексния фонд за растеж' },
              { en: 'Pay off the credit card debt first', bg: 'Изплатете дълга по кредитната карта първо' },
              { en: 'Split 50/50 between both', bg: 'Разделете 50/50 между двете' },
              { en: 'Keep it as emergency cash', bg: 'Запазете го като авариен кеш' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Guaranteed 22% "return" (by avoiding interest) beats an uncertain 7% investment return. Always eliminate high-interest debt before investing.',
              bg: 'Гарантирана 22% "доходност" (чрез избягване на лихви) надминава несигурна 7% инвестиционна доходност. Винаги елиминирайте дълга с висока лихва преди да инвестирате.',
            },
            xp: 15,
          },
        ],
      },
      {
        id: 'debt-payoff',
        moduleId: 'credit-debt',
        title: { en: 'Getting Out of Debt', bg: 'Освобождаване от дълг' },
        description: {
          en: 'Two proven strategies to become debt-free faster.',
          bg: 'Две доказани стратегии за по-бързо освобождаване от дълг.',
        },
        icon: '🚀',
        xpReward: 100,
        order: 3,
        exercises: [
          {
            id: 'payoff-q1',
            type: 'choice',
            question: {
              en: "The 'Avalanche Method' for debt repayment means...",
              bg: "Методът 'лавина' за изплащане на дълг означава...",
            },
            options: [
              { en: 'Pay off the smallest balance first', bg: 'Изплатете първо най-малкия баланс' },
              { en: 'Pay off the highest interest rate debt first', bg: 'Изплатете първо дълга с най-висока лихва' },
              { en: 'Pay equal amounts to all debts', bg: 'Плащайте равни суми за всички дългове' },
              { en: 'Take a new loan to consolidate debts', bg: 'Вземете нов заем за консолидиране на дългове' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'The Avalanche Method saves the most money by eliminating the highest-interest debt first — mathematically optimal for minimizing total interest paid.',
              bg: 'Методът лавина спестява най-много пари чрез елиминиране на дълга с най-висока лихва първо — математически оптимален за минимизиране на платените лихви.',
            },
            xp: 10,
          },
          {
            id: 'payoff-q2',
            type: 'choice',
            question: {
              en: "The 'Snowball Method' focuses on...",
              bg: "Методът 'снежна топка' се фокусира върху...",
            },
            options: [
              { en: 'Highest interest rate first', bg: 'Първо най-висока лихва' },
              { en: 'Largest balance first', bg: 'Първо най-голям баланс' },
              { en: 'Smallest balance first (for psychological wins)', bg: 'Първо най-малък баланс (за психологически победи)' },
              { en: 'Most recent debt first', bg: 'Първо най-скорошния дълг' },
            ],
            correctIndex: 2,
            explanation: {
              en: 'Paying off small debts first gives you quick wins and motivation. Research shows this keeps people on track better than the mathematically superior Avalanche.',
              bg: 'Изплащането на малките дългове първо ви дава бързи победи и мотивация. Изследванията показват, че това поддържа хората по-добре от математически превъзхождащата лавина.',
            },
            xp: 10,
          },
          {
            id: 'payoff-q3',
            type: 'choice',
            question: {
              en: 'Debt consolidation can sometimes reduce your total interest payments.',
              bg: 'Консолидирането на дълг понякога може да намали общите ви лихвени плащания.',
            },
            options: [
              { en: 'True', bg: 'Вярно' },
              { en: 'False', bg: 'Грешно' },
            ],
            correctIndex: 0,
            explanation: {
              en: 'Consolidating multiple high-interest debts into one lower-interest loan can save thousands. However, beware of extending the loan term — that can cost more overall.',
              bg: 'Консолидирането на множество дългове с висока лихва в един заем с по-ниска лихва може да спести хиляди. Внимавайте обаче с удължаване на срока — това може да струва повече общо.',
            },
            xp: 10,
          },
          {
            id: 'payoff-q4',
            type: 'choice',
            question: {
              en: 'You have 3 debts: €500 at 5%, €2,000 at 22%, €1,500 at 15%. Using the Avalanche method, which do you pay off first?',
              bg: 'Имате 3 дълга: €500 при 5%, €2,000 при 22%, €1,500 при 15%. Използвайки метода лавина, кой изплащате първо?',
            },
            options: [
              { en: '€500 at 5% — smallest balance', bg: '€500 при 5% — най-малък баланс' },
              { en: '€2,000 at 22% — highest interest rate', bg: '€2,000 при 22% — най-висока лихва' },
              { en: '€1,500 at 15% — middle ground', bg: '€1,500 при 15% — средна' },
              { en: 'Pay all equally', bg: 'Плащайте всички поравно' },
            ],
            correctIndex: 1,
            explanation: {
              en: 'Avalanche = highest interest rate first. That 22% credit card is costing you the most per month. Eliminate it first, then attack the 15%, then the 5%.',
              bg: 'Лавина = първо най-висока лихва. Тази кредитна карта при 22% ви струва най-много на месец. Елиминирайте я първо, след това 15%, след това 5%.',
            },
            xp: 15,
          },
        ],
      },
    ],
  },
];
