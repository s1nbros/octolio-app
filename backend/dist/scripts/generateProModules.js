"use strict";
// ───────────────────────────────────────────────────────────────
// generateProModules.ts
//
// One-off script: generates 2 NEW pro-only modules using Claude
// and writes the result to src/data/generated-modules.json.
//
// Run:
//   cd octolio-app/backend
//   ANTHROPIC_API_KEY=sk-ant-... npx ts-node src/scripts/generateProModules.ts
//
// lessons.ts will automatically pick up the JSON file and append
// the new modules to the `modules` array.
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
const SPECS = [
    {
        id: 'crypto',
        title: { en: 'Cryptocurrency & Web3', bg: 'Криптовалути и Web3' },
        description: {
            en: 'Understand Bitcoin, blockchain, DeFi — and the real risks behind the hype.',
            bg: 'Разбери Bitcoin, блокчейн, DeFi — и реалните рискове зад шумотевицата.',
        },
        icon: '₿',
        color: 'yellow',
        order: 8,
        proOnly: true,
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
        description: {
            en: 'Engineer your exit — the FIRE movement, retirement accounts, and safe withdrawal math.',
            bg: 'Планирай изхода си — FIRE движението, пенсионни сметки и безопасно теглене.',
        },
        icon: '🏖️',
        color: 'green',
        order: 9,
        proOnly: true,
        lessonTopics: [
            'FIRE movement and financial independence',
            'EU retirement accounts: workplace pension (Pillar 2), voluntary private pension (Pillar 3), national variants (ISA, PEA, etc.)',
            'Safe withdrawal rate and the 4% rule',
        ],
        lessonIcons: ['🔥', '🏦', '📉'],
    },
];
async function main() {
    if (!process.env.ANTHROPIC_API_KEY) {
        console.error('❌ ANTHROPIC_API_KEY is not set. Aborting.');
        process.exit(1);
    }
    console.log(`Generating ${SPECS.length} pro modules…`);
    const modules = [];
    for (const spec of SPECS) {
        console.log(`\n── ${spec.title.en} (${spec.lessonTopics.length} lessons) ──`);
        for (const t of spec.lessonTopics)
            console.log(`   • ${t}`);
        const mod = await (0, lessonGenerator_1.generateModule)(spec);
        modules.push(mod);
        const exerciseCount = mod.lessons.reduce((n, l) => n + l.exercises.length, 0);
        console.log(`   ✓ done — ${mod.lessons.length} lessons, ${exerciseCount} exercises total`);
    }
    const outPath = path.resolve(__dirname, '../data/generated-modules.json');
    fs.writeFileSync(outPath, JSON.stringify(modules, null, 2));
    console.log(`\n✅ Wrote ${modules.length} modules → ${outPath}`);
    console.log('   Restart the backend to serve them.');
}
main().catch((err) => {
    console.error('Generation failed:', err);
    process.exit(1);
});
