"use strict";
// ───────────────────────────────────────────────────────────────
// generateAllModules.ts
//
// Generates the full catalogue via Claude:
//   • 3 recreated free modules (saving, investing, credit-debt)
//   • 5 new   free modules
//   • 3 recreated pro  modules (advanced-investing, real-estate, tax-strategy)
//   • 8 new   pro  modules
//
// Total: 19 modules ≈ 57 lessons ≈ 400+ exercises.
// Cost on Opus ~$8–15. On Sonnet ~$1–2 — switch the model in
// services/lessonGenerator.ts if you want it cheaper/faster.
//
// Run:
//   cd octolio-app/backend
//   ANTHROPIC_API_KEY=sk-ant-... npx ts-node src/scripts/generateAllModules.ts
//
// Output: src/data/generated-modules.json
// lessons.ts auto-loads it; generated entries OVERRIDE any static
// module with the same `id`. Restart the backend to see the changes.
//
// To skip a module, comment it out below.
// ───────────────────────────────────────────────────────────────
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const lessonGenerator_1 = require("../services/lessonGenerator");
// ============= RECREATED FREE MODULES =============
const RECREATED_FREE = [
    {
        id: 'saving',
        title: { en: 'Saving Smart', bg: 'Умно спестяване' },
        description: { en: 'Build your safety net and harness compound interest.', bg: 'Изгради финансова мрежа и използвай сложната лихва.' },
        icon: '💎', color: 'blue', order: 2, proOnly: false,
        lessonTopics: [
            'Emergency fund and financial safety net',
            'Compound interest and the power of time',
            'Automating savings and pay-yourself-first',
        ],
        lessonIcons: ['🛡️', '✨', '🤖'],
    },
    {
        id: 'investing',
        title: { en: 'Investing 101', bg: 'Инвестиции 101' },
        description: { en: 'From zero to your first portfolio — the fundamentals of investing.', bg: 'От нула до първия портфейл — основите на инвестирането.' },
        icon: '📈', color: 'purple', order: 3, proOnly: false,
        lessonTopics: [
            'Stocks, bonds and how markets work',
            'Index funds and ETFs',
            'Diversification and asset allocation',
        ],
        lessonIcons: ['🏛️', '📊', '🎯'],
    },
    {
        id: 'credit-debt',
        title: { en: 'Credit & Debt Mastery', bg: 'Майсторство в кредити и дълг' },
        description: { en: 'Build great credit and crush bad debt.', bg: 'Изгради чудесен кредит и унищожи лошия дълг.' },
        icon: '🏦', color: 'orange', order: 4, proOnly: false,
        lessonTopics: [
            'Credit score: how it works and how to build it',
            'Good debt vs bad debt and the avalanche method',
        ],
        lessonIcons: ['⭐', '⚔️'],
    },
];
// ============= 5 NEW FREE MODULES =============
const NEW_FREE = [
    {
        id: 'side-hustles',
        title: { en: 'Side Hustles & Extra Income', bg: 'Странични бизнеси и допълнителен доход' },
        description: { en: 'Turn your skills into income streams.', bg: 'Превърни уменията си в потоци от доход.' },
        icon: '💼', color: 'green', order: 5, proOnly: false,
        lessonTopics: [
            'Finding a profitable side hustle',
            'Freelancing and pricing your skills',
            'Scaling from hustle to small business',
        ],
        lessonIcons: ['🚀', '💻', '📈'],
    },
    {
        id: 'insurance',
        title: { en: 'Insurance Fundamentals', bg: 'Основи на застраховането' },
        description: { en: 'Protect your wealth before you build it.', bg: 'Защити богатството си преди да го изградиш.' },
        icon: '🛡️', color: 'blue', order: 6, proOnly: false,
        lessonTopics: [
            'Health, life and disability insurance basics',
            'Auto and renter/home insurance',
            'How to read a policy and avoid scams',
        ],
        lessonIcons: ['❤️', '🚗', '📜'],
    },
    {
        id: 'risk-management',
        title: { en: 'Emergency Planning & Risk', bg: 'Аварийно планиране и риск' },
        description: { en: 'Prepare for the unexpected — financially and mentally.', bg: 'Подготви се за неочакваното — финансово и психически.' },
        icon: '🚨', color: 'orange', order: 7, proOnly: false,
        lessonTopics: [
            'Financial risk types: market, credit, liquidity, inflation',
            'Building a personal disaster plan',
            'Recession-proofing your finances',
        ],
        lessonIcons: ['⚠️', '🗺️', '🛟'],
    },
    {
        id: 'smart-shopping',
        title: { en: 'Smart Shopping & Negotiation', bg: 'Умно пазаруване и преговори' },
        description: { en: 'Spend less without feeling deprived.', bg: 'Харчи по-малко без чувство на лишение.' },
        icon: '🛍️', color: 'purple', order: 8, proOnly: false,
        lessonTopics: [
            'Behavioral pricing tricks and how to spot them',
            'Negotiating salary, rent and big purchases',
            'Cashback, rewards, and credit-card optimization',
        ],
        lessonIcons: ['🎯', '🤝', '💳'],
    },
    {
        id: 'money-mindset',
        title: { en: 'Money Mindset & Behavior', bg: 'Манталитет и поведение спрямо парите' },
        description: { en: 'Master the psychology that drives every financial decision.', bg: 'Овладей психологията зад всяко финансово решение.' },
        icon: '🧠', color: 'green', order: 9, proOnly: false,
        lessonTopics: [
            'Cognitive biases that destroy wealth',
            'Habits of financially successful people',
            'Setting and tracking financial goals',
        ],
        lessonIcons: ['🪞', '🏆', '🎯'],
    },
];
// ============= RECREATED PRO MODULES =============
const RECREATED_PRO = [
    {
        id: 'advanced-investing',
        title: { en: 'Advanced Investing', bg: 'Напреднало инвестиране' },
        description: { en: 'Beyond index funds — go global, go disciplined.', bg: 'Отвъд индексните фондове — глобално и дисциплинирано.' },
        icon: '📈', color: 'blue', order: 10, proOnly: true,
        lessonTopics: [
            'Global portfolio construction and rebalancing',
            'Dollar-cost averaging vs lump-sum investing',
        ],
        lessonIcons: ['🌐', '🧘'],
    },
    {
        id: 'real-estate',
        title: { en: 'Real Estate Investing', bg: 'Инвестиции в недвижими имоти' },
        description: { en: 'Use property to build long-term wealth.', bg: 'Използвай имоти за дългосрочно богатство.' },
        icon: '🏠', color: 'orange', order: 11, proOnly: true,
        lessonTopics: [
            'Buying your first rental property',
            'Cash flow vs appreciation strategies',
        ],
        lessonIcons: ['🏢', '⚔️'],
    },
    {
        id: 'tax-strategy',
        title: { en: 'Tax Strategy', bg: 'Данъчна стратегия' },
        description: { en: 'Keep more of what you earn — legally.', bg: 'Запази повече от това, което печелиш — законно.' },
        icon: '🧾', color: 'purple', order: 12, proOnly: true,
        lessonTopics: [
            'Tax-advantaged accounts and pension contributions',
        ],
        lessonIcons: ['💡'],
    },
];
// ============= 8 NEW PRO MODULES =============
const NEW_PRO = [
    {
        id: 'crypto',
        title: { en: 'Cryptocurrency & Web3', bg: 'Криптовалути и Web3' },
        description: { en: 'Understand Bitcoin, blockchain, DeFi — and the real risks.', bg: 'Разбери Bitcoin, блокчейн, DeFi — и реалните рискове.' },
        icon: '₿', color: 'yellow', order: 13, proOnly: true,
        lessonTopics: [
            'Bitcoin and blockchain basics',
            'Altcoins, tokens and stablecoins',
            'Decentralized finance (DeFi) protocols',
        ],
        lessonIcons: ['⛓️', '🪙', '🌐'],
    },
    {
        id: 'retirement',
        title: { en: 'Financial Independence & Retirement', bg: 'Финансова независимост и пенсиониране' },
        description: { en: 'Engineer your exit — FIRE, retirement accounts, withdrawal math.', bg: 'Планирай изхода си — FIRE, пенсионни сметки, безопасно теглене.' },
        icon: '🏖️', color: 'green', order: 14, proOnly: true,
        lessonTopics: [
            'FIRE movement and financial independence',
            'Retirement accounts: IRA, 401k, pension pillars',
            'Safe withdrawal rate and the 4% rule',
        ],
        lessonIcons: ['🔥', '🏦', '📉'],
    },
    {
        id: 'stock-picking',
        title: { en: 'Stock Picking & Analysis', bg: 'Подбор и анализ на акции' },
        description: { en: 'Read 10-Ks like Warren Buffett.', bg: 'Чети 10-K отчети като Уорън Бъфет.' },
        icon: '🔎', color: 'blue', order: 15, proOnly: true,
        lessonTopics: [
            'Reading financial statements: P&L, balance sheet, cash flow',
            'Valuation: P/E, DCF and intrinsic value',
            'Moats, competitive advantage and quality investing',
        ],
        lessonIcons: ['📑', '🧮', '🏰'],
    },
    {
        id: 'options-derivatives',
        title: { en: 'Options & Derivatives', bg: 'Опции и деривати' },
        description: { en: 'Hedge, leverage, and earn income with contracts.', bg: 'Хеджирай, ливъридж, и печели доход с контракти.' },
        icon: '⚙️', color: 'purple', order: 16, proOnly: true,
        lessonTopics: [
            'Calls, puts and the basic option payoff',
            'Covered calls and cash-secured puts',
            'Risk management and avoiding blowups',
        ],
        lessonIcons: ['📈', '💰', '🛡️'],
    },
    {
        id: 'estate-planning',
        title: { en: 'Estate Planning & Inheritance', bg: 'Наследствено планиране' },
        description: { en: 'Pass on wealth without tearing the family apart.', bg: 'Предай богатство без да разкъсаш семейството.' },
        icon: '📜', color: 'orange', order: 17, proOnly: true,
        lessonTopics: [
            'Wills, trusts and beneficiaries',
            'Inheritance tax and gift strategies',
        ],
        lessonIcons: ['✍️', '🎁'],
    },
    {
        id: 'entrepreneurship',
        title: { en: 'Entrepreneurship & Business Finance', bg: 'Предприемачество и бизнес финанси' },
        description: { en: 'Run the numbers behind a real business.', bg: 'Управлявай числата зад истински бизнес.' },
        icon: '🏢', color: 'green', order: 18, proOnly: true,
        lessonTopics: [
            'Revenue, costs, margins and unit economics',
            'Funding: bootstrapping, loans, angels, VC',
            'Reading a startup cap table',
        ],
        lessonIcons: ['💵', '🚀', '📊'],
    },
    {
        id: 'international-investing',
        title: { en: 'International Investing & Currency', bg: 'Международни инвестиции и валути' },
        description: { en: 'Go global without getting burned by FX.', bg: 'Инвестирай глобално без да загубиш от валутата.' },
        icon: '🌍', color: 'blue', order: 19, proOnly: true,
        lessonTopics: [
            'Emerging vs developed markets',
            'Currency risk and how to hedge it',
        ],
        lessonIcons: ['🗺️', '💱'],
    },
    {
        id: 'macro-cycles',
        title: { en: 'Macroeconomics & Market Cycles', bg: 'Макроикономика и пазарни цикли' },
        description: { en: 'See the big picture — interest rates, inflation, recessions.', bg: 'Виж голямата картина — лихви, инфлация, рецесии.' },
        icon: '🌊', color: 'purple', order: 20, proOnly: true,
        lessonTopics: [
            'Interest rates, central banks and the bond market',
            'Inflation, deflation and stagflation',
            'Business cycles and recession indicators',
        ],
        lessonIcons: ['🏛️', '🔥', '📉'],
    },
];
const ALL_SPECS = [
    ...RECREATED_FREE,
    ...NEW_FREE,
    ...RECREATED_PRO,
    ...NEW_PRO,
];
async function main() {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY is not set. Aborting.');
        process.exit(1);
    }
    console.log(`Generating ${ALL_SPECS.length} modules…`);
    const totalLessons = ALL_SPECS.reduce((n, s) => n + s.lessonTopics.length, 0);
    console.log(`(${totalLessons} lessons total — this will take a while)\n`);
    const outPath = path.resolve(__dirname, '../data/generated-modules.json');
    // Resume support — if we already have a partial file, keep its modules and skip them.
    let modules = [];
    if (fs.existsSync(outPath)) {
        try {
            modules = JSON.parse(fs.readFileSync(outPath, 'utf8'));
            console.log(`📁 Found existing file with ${modules.length} modules — will skip those and append new ones.\n`);
        }
        catch { /* corrupt file, start fresh */ }
    }
    const doneIds = new Set(modules.map((m) => m.id));
    for (const spec of ALL_SPECS) {
        if (doneIds.has(spec.id)) {
            console.log(`⏭  Skipping "${spec.title.en}" (already generated).`);
            continue;
        }
        console.log(`\n── ${spec.title.en} (${spec.lessonTopics.length} lessons, ${spec.proOnly ? 'PRO' : 'free'}) ──`);
        try {
            const mod = await (0, lessonGenerator_1.generateModule)(spec);
            modules.push(mod);
            const exerciseCount = mod.lessons.reduce((n, l) => n + l.exercises.length, 0);
            console.log(`   ✓ done — ${mod.lessons.length} lessons, ${exerciseCount} exercises`);
            // Write after EACH module so a crash doesn't lose work.
            fs.writeFileSync(outPath, JSON.stringify(modules, null, 2));
        }
        catch (err) {
            console.error(`   ❌ failed: ${err instanceof Error ? err.message : err}`);
            console.error(`   (Re-run the script to retry just this module.)`);
        }
    }
    console.log(`\n✅ Wrote ${modules.length} modules → ${outPath}`);
    console.log('   Restart the backend to serve them.');
}
main().catch((err) => {
    console.error('Generation failed:', err);
    process.exit(1);
});
