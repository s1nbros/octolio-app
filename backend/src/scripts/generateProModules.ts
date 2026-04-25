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

import * as fs from 'fs';
import * as path from 'path';
import { generateModule, type ModuleSpec } from '../services/lessonGenerator';

const SPECS: ModuleSpec[] = [
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
      'Retirement accounts: IRA, 401k, pension pillars',
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
    for (const t of spec.lessonTopics) console.log(`   • ${t}`);
    const mod = await generateModule(spec);
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
