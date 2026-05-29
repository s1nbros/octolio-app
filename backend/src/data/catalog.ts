/**
 * Cosmetics catalog + chest reward pool.
 *
 * Item IDs are stable strings (used as DB keys).
 * `slot` controls layered rendering on the octopus avatar; only ONE item
 * per slot can be equipped at a time.
 */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Slot   = 'hat' | 'face' | 'body';

export interface CatalogItem {
  id: string;
  name: { en: string; bg: string };
  emoji: string;
  slot: Slot;
  rarity: Rarity;
  price: number;          // in coins (0 = chest-only)
  description: { en: string; bg: string };
}

export const CATALOG: CatalogItem[] = [
  // ── HAT slot ──
  { id: 'hat_baseball', name: { en: 'Baseball Cap', bg: 'Бейзболна шапка' }, emoji: '🧢', slot: 'hat', rarity: 'common', price: 100,
    description: { en: 'Classic, comfortable, common.', bg: 'Класика, удобство, нищо особено.' } },
  { id: 'hat_tophat', name: { en: 'Top Hat', bg: 'Цилиндър' }, emoji: '🎩', slot: 'hat', rarity: 'common', price: 200,
    description: { en: 'For an octopus with class.', bg: 'За октопод с класа.' } },
  { id: 'hat_graduation', name: { en: 'Grad Cap', bg: 'Дипломна шапка' }, emoji: '🎓', slot: 'hat', rarity: 'rare', price: 300,
    description: { en: 'You finished the lesson, smart-pus.', bg: 'Завърши урока, умнопод.' } },
  { id: 'hat_hardhat', name: { en: 'Hard Hat', bg: 'Строителна каска' }, emoji: '⛑️', slot: 'hat', rarity: 'rare', price: 350,
    description: { en: 'Safety first. Investing second.', bg: 'Първо безопасност. После инвестиции.' } },
  { id: 'hat_helmet', name: { en: 'Military Helmet', bg: 'Военна каска' }, emoji: '🪖', slot: 'hat', rarity: 'epic', price: 600,
    description: { en: 'Battle-ready against market crashes.', bg: 'Готов за пазарни сривове.' } },
  { id: 'hat_pumpkin', name: { en: 'Pumpkin Head', bg: 'Тиквена глава' }, emoji: '🎃', slot: 'hat', rarity: 'epic', price: 800,
    description: { en: 'Spooky season finance octopus.', bg: 'Октопод за страшен сезон.' } },
  { id: 'hat_crown', name: { en: 'Royal Crown', bg: 'Корона' }, emoji: '👑', slot: 'hat', rarity: 'legendary', price: 1500,
    description: { en: 'Ruler of the deep.', bg: 'Господар на дълбините.' } },
  { id: 'hat_halo', name: { en: 'Saint Halo', bg: 'Свещен ореол' }, emoji: '😇', slot: 'hat', rarity: 'legendary', price: 2000,
    description: { en: 'Blessed by the markets.', bg: 'Благословен от пазарите.' } },

  // ── FACE slot ──
  { id: 'face_goggles', name: { en: 'Goggles', bg: 'Очила за плуване' }, emoji: '🥽', slot: 'face', rarity: 'common', price: 150,
    description: { en: 'For deep dives into the order book.', bg: 'За дълбоки гмуркания.' } },
  { id: 'face_glasses', name: { en: 'Sunglasses', bg: 'Слънчеви очила' }, emoji: '🕶️', slot: 'face', rarity: 'rare', price: 250,
    description: { en: 'When the market is too bright.', bg: 'Когато пазарът е твърде ярък.' } },
  { id: 'face_monocle', name: { en: 'Monocle', bg: 'Монокъл' }, emoji: '🧐', slot: 'face', rarity: 'epic', price: 700,
    description: { en: 'Inspect every footnote.', bg: 'Виж всеки детайл.' } },
  { id: 'face_3d', name: { en: '3D Glasses', bg: '3D очила' }, emoji: '😎', slot: 'face', rarity: 'legendary', price: 1800,
    description: { en: 'See the matrix of the markets.', bg: 'Виж матрицата на пазара.' } },

  // ── BODY slot ──
  { id: 'body_scarf', name: { en: 'Wool Scarf', bg: 'Вълнен шал' }, emoji: '🧣', slot: 'body', rarity: 'common', price: 200,
    description: { en: 'Warm 8-legged hug.', bg: 'Топла прегръдка с 8 крака.' } },
  { id: 'body_bowtie', name: { en: 'Bow Tie', bg: 'Папийонка' }, emoji: '🎀', slot: 'body', rarity: 'rare', price: 400,
    description: { en: 'CFO of the sea.', bg: 'Финансов директор на морето.' } },
  { id: 'body_vest', name: { en: 'Hi-Vis Vest', bg: 'Светлоотразителна жилетка' }, emoji: '🦺', slot: 'body', rarity: 'epic', price: 500,
    description: { en: 'Visible from any timezone.', bg: 'Видим от всяка часова зона.' } },
  { id: 'body_rocket', name: { en: 'Rocket Pack', bg: 'Ракетен раница' }, emoji: '🚀', slot: 'body', rarity: 'legendary', price: 2500,
    description: { en: 'To the moon. Literally.', bg: 'Към луната. Буквално.' } },
];

export function getCatalogItem(id: string): CatalogItem | undefined {
  return CATALOG.find((c) => c.id === id);
}

/* ─── Chest reward pool ────────────────────────────────────────
 * A draw returns a weighted reward. Weights are not %; the picker
 * does sum-of-weights logic.
 */
export type ChestReward =
  | { type: 'xp';     amount: number }
  | { type: 'coins';  amount: number }
  | { type: 'freeze'; amount: number }
  | { type: 'energy'; amount: number }
  | { type: 'item';   itemId: string };

interface WeightedReward {
  weight: number;
  reward: () => ChestReward;
}

/** Pick one of the cosmetic IDs the user doesn't yet own, weighted by rarity. */
function randomCosmeticFor(ownedIds: Set<string>): ChestReward | null {
  const available = CATALOG.filter((c) => !ownedIds.has(c.id));
  if (available.length === 0) return null;
  // Higher rarity → lower weight
  const rarityWeights: Record<Rarity, number> = { common: 60, rare: 25, epic: 10, legendary: 5 };
  const total = available.reduce((s, c) => s + rarityWeights[c.rarity], 0);
  let r = Math.random() * total;
  for (const c of available) {
    r -= rarityWeights[c.rarity];
    if (r <= 0) return { type: 'item', itemId: c.id };
  }
  return { type: 'item', itemId: available[0].id };
}

const POOL: WeightedReward[] = [
  // Coins (40% total)
  { weight: 18, reward: () => ({ type: 'coins',  amount: 25  }) },
  { weight: 12, reward: () => ({ type: 'coins',  amount: 75  }) },
  { weight: 8,  reward: () => ({ type: 'coins',  amount: 200 }) },
  { weight: 2,  reward: () => ({ type: 'coins',  amount: 1000 }) }, // jackpot
  // XP (25%)
  { weight: 12, reward: () => ({ type: 'xp',     amount: 20  }) },
  { weight: 8,  reward: () => ({ type: 'xp',     amount: 50  }) },
  { weight: 5,  reward: () => ({ type: 'xp',     amount: 150 }) },
  // Streak freezes (10%)
  { weight: 10, reward: () => ({ type: 'freeze', amount: 1   }) },
  // Energy (10%)
  { weight: 10, reward: () => ({ type: 'energy', amount: 3   }) },
  // Cosmetic (15% — filled at draw-time, depends on ownership)
];

const COSMETIC_WEIGHT = 15;

export function drawReward(ownedItemIds: Set<string>): ChestReward {
  // Try cosmetic with weight; fall back to other pool if user owns everything.
  const cosmetic = randomCosmeticFor(ownedItemIds);
  const expanded = cosmetic
    ? [...POOL, { weight: COSMETIC_WEIGHT, reward: () => cosmetic }]
    : POOL;
  const total = expanded.reduce((s, e) => s + e.weight, 0);
  let r = Math.random() * total;
  for (const e of expanded) {
    r -= e.weight;
    if (r <= 0) return e.reward();
  }
  return expanded[0].reward();
}

/** XP exchange rate: 1 XP → 0.5 coins, min exchange 100 XP. */
export const XP_PER_COIN_EXCHANGE_RATE = 2;      // 2 XP = 1 coin
export const MIN_XP_EXCHANGE = 100;              // floor on a single tx

/** How many chests the user has earned in total (1 per 3 lessons completed). */
export const LESSONS_PER_CHEST = 3;
