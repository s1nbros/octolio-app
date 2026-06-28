/**
 * Mirror of the backend cosmetics catalog for client-side rendering.
 * Keep in sync with backend/src/data/catalog.ts.
 */

export type Rarity = 'common' | 'rare' | 'epic' | 'legendary';
export type Slot = 'hat' | 'face' | 'body';

export interface CatalogItem {
  id: string;
  name: { en: string; bg: string };
  emoji: string;
  slot: Slot;
  rarity: Rarity;
  price: number;
  description: { en: string; bg: string };
}

export const CATALOG_ITEMS: CatalogItem[] = [
  { id: 'hat_baseball',   name: { en: 'Baseball Cap', bg: 'Бейзболна шапка' },          emoji: '🧢', slot: 'hat',  rarity: 'common',    price: 100,
    description: { en: 'Classic, comfortable, common.', bg: 'Класика, удобство, нищо особено.' } },
  { id: 'hat_tophat',     name: { en: 'Top Hat', bg: 'Цилиндър' },                       emoji: '🎩', slot: 'hat',  rarity: 'common',    price: 200,
    description: { en: 'For an octopus with class.', bg: 'За октопод с класа.' } },
  { id: 'hat_graduation', name: { en: 'Grad Cap', bg: 'Дипломна шапка' },                emoji: '🎓', slot: 'hat',  rarity: 'rare',      price: 300,
    description: { en: 'You finished the lesson, smart-pus.', bg: 'Завърши урока, умнопод.' } },
  { id: 'hat_hardhat',    name: { en: 'Hard Hat', bg: 'Строителна каска' },              emoji: '⛑️', slot: 'hat',  rarity: 'rare',      price: 350,
    description: { en: 'Safety first. Investing second.', bg: 'Първо безопасност. После инвестиции.' } },
  { id: 'hat_helmet',     name: { en: 'Military Helmet', bg: 'Военна каска' },           emoji: '🪖', slot: 'hat',  rarity: 'epic',      price: 600,
    description: { en: 'Battle-ready against market crashes.', bg: 'Готов за пазарни сривове.' } },
  { id: 'hat_pumpkin',    name: { en: 'Pumpkin Head', bg: 'Тиквена глава' },             emoji: '🎃', slot: 'hat',  rarity: 'epic',      price: 800,
    description: { en: 'Spooky season finance octopus.', bg: 'Октопод за страшен сезон.' } },
  { id: 'hat_crown',      name: { en: 'Royal Crown', bg: 'Корона' },                     emoji: '👑', slot: 'hat',  rarity: 'legendary', price: 1500,
    description: { en: 'Ruler of the deep.', bg: 'Господар на дълбините.' } },
  { id: 'hat_halo',       name: { en: 'Saint Halo', bg: 'Свещен ореол' },                emoji: '😇', slot: 'hat',  rarity: 'legendary', price: 2000,
    description: { en: 'Blessed by the markets.', bg: 'Благословен от пазарите.' } },

  { id: 'face_goggles',   name: { en: 'Goggles', bg: 'Очила за плуване' },               emoji: '🥽', slot: 'face', rarity: 'common',    price: 150,
    description: { en: 'For deep dives into the order book.', bg: 'За дълбоки гмуркания.' } },
  { id: 'face_glasses',   name: { en: 'Sunglasses', bg: 'Слънчеви очила' },              emoji: '🕶️', slot: 'face', rarity: 'rare',      price: 250,
    description: { en: 'When the market is too bright.', bg: 'Когато пазарът е твърде ярък.' } },
  { id: 'face_monocle',   name: { en: 'Monocle', bg: 'Монокъл' },                        emoji: '🧐', slot: 'face', rarity: 'epic',      price: 700,
    description: { en: 'Inspect every footnote.', bg: 'Виж всеки детайл.' } },
  { id: 'face_3d',        name: { en: '3D Glasses', bg: '3D очила' },                    emoji: '😎', slot: 'face', rarity: 'legendary', price: 1800,
    description: { en: 'See the matrix of the markets.', bg: 'Виж матрицата на пазара.' } },

  { id: 'body_scarf',     name: { en: 'Wool Scarf', bg: 'Вълнен шал' },                  emoji: '🧣', slot: 'body', rarity: 'common',    price: 200,
    description: { en: 'Warm 8-legged hug.', bg: 'Топла прегръдка с 8 крака.' } },
  { id: 'body_bowtie',    name: { en: 'Bow Tie', bg: 'Папийонка' },                      emoji: '🎀', slot: 'body', rarity: 'rare',      price: 400,
    description: { en: 'CFO of the sea.', bg: 'Финансов директор на морето.' } },
  { id: 'body_vest',      name: { en: 'Hi-Vis Vest', bg: 'Светлоотразителна жилетка' }, emoji: '🦺', slot: 'body', rarity: 'epic',      price: 500,
    description: { en: 'Visible from any timezone.', bg: 'Видим от всяка часова зона.' } },
  { id: 'body_rocket',    name: { en: 'Rocket Pack', bg: 'Ракетен раница' },             emoji: '🚀', slot: 'body', rarity: 'legendary', price: 2500,
    description: { en: 'To the moon. Literally.', bg: 'Към луната. Буквално.' } },

  // ── NEW: extra hats ──
  { id: 'hat_sunhat',     name: { en: 'Sun Hat', bg: 'Шапка за слънце' },               emoji: '👒', slot: 'hat',  rarity: 'common',    price: 150,
    description: { en: 'For sunny portfolio days.', bg: 'За слънчеви дни на портфейла.' } },
  { id: 'hat_lightbulb',  name: { en: 'Bright Idea', bg: 'Светла идея' },                emoji: '💡', slot: 'hat',  rarity: 'rare',      price: 350,
    description: { en: 'Ding! A new strategy appears.', bg: 'Дзън! Нова стратегия се появи.' } },
  { id: 'hat_flame',      name: { en: 'Hot Streak', bg: 'Гореща серия' },                emoji: '🔥', slot: 'hat',  rarity: 'epic',      price: 700,
    description: { en: 'Matches your streak — literally on fire.', bg: 'В тон с поредицата ти — буквално в огън.' } },
  { id: 'hat_star',       name: { en: 'Star Power', bg: 'Звездна сила' },                emoji: '⭐', slot: 'hat',  rarity: 'legendary', price: 1800,
    description: { en: 'Top of the class.', bg: 'Първи в класа.' } },

  // ── NEW: extra faces ──
  { id: 'face_nerd',      name: { en: 'Study Buddy', bg: 'Учебен другар' },              emoji: '🤓', slot: 'face', rarity: 'common',    price: 150,
    description: { en: 'Did the reading. Twice.', bg: 'Прочете урока. Два пъти.' } },
  { id: 'face_disguise',  name: { en: 'Incognito Investor', bg: 'Инкогнито инвеститор' }, emoji: '🥸', slot: 'face', rarity: 'rare',      price: 300,
    description: { en: 'Quietly compounding in the shadows.', bg: 'Тихо натрупва в сянка.' } },
  { id: 'face_starstruck', name: { en: 'Moon Eyes', bg: 'Лунни очи' },                   emoji: '🤩', slot: 'face', rarity: 'epic',      price: 650,
    description: { en: 'When the gains finally hit.', bg: 'Когато печалбите най-сетне дойдат.' } },
  { id: 'face_robot',     name: { en: 'Algo Mode', bg: 'Алго режим' },                   emoji: '🤖', slot: 'face', rarity: 'legendary', price: 1600,
    description: { en: 'Emotion-free trading engaged.', bg: 'Търговия без емоции — активирана.' } },

  // ── NEW: extra bodies ──
  { id: 'body_tie',       name: { en: 'Business Octopus', bg: 'Бизнес октопод' },        emoji: '👔', slot: 'body', rarity: 'common',    price: 200,
    description: { en: 'Means business. All eight arms.', bg: 'Сериозен бизнес. И с осемте ръце.' } },
  { id: 'body_medal',     name: { en: 'Lesson Champion', bg: 'Шампион на уроците' },     emoji: '🏅', slot: 'body', rarity: 'rare',      price: 400,
    description: { en: 'Earned, not bought. (Okay, bought.)', bg: 'Заслужен, не купен. (Е, купен.)' } },
  { id: 'body_guitar',    name: { en: 'Rockstar Saver', bg: 'Рокзвезда на спестяванията' }, emoji: '🎸', slot: 'body', rarity: 'epic',   price: 550,
    description: { en: 'Budgets hard, riffs harder.', bg: 'Бюджетира яко, свири още по-яко.' } },
  { id: 'body_trophy',    name: { en: 'Champion of the Deep', bg: 'Шампион на дълбините' }, emoji: '🏆', slot: 'body', rarity: 'legendary', price: 2000,
    description: { en: 'Defeated every boss in the sea.', bg: 'Победи всеки бос в морето.' } },
];

export function getCatalogItem(id: string | null | undefined): CatalogItem | undefined {
  if (!id) return undefined;
  return CATALOG_ITEMS.find((c) => c.id === id);
}

interface TileLike { id: string; emoji: string; label: string; rarity: string }

/** Pool of decoy XP tiles used in the spin reel. Chests are XP-only. */
export function ALL_REWARD_TILES(_lang: 'en' | 'bg'): TileLike[] {
  return [
    { id: 'xp-25',   emoji: '✨', label: '25 XP',   rarity: 'common' },
    { id: 'xp-50',   emoji: '✨', label: '50 XP',   rarity: 'common' },
    { id: 'xp-100',  emoji: '✨', label: '100 XP',  rarity: 'common' },
    { id: 'xp-200',  emoji: '✨', label: '200 XP',  rarity: 'rare' },
    { id: 'xp-500',  emoji: '✨', label: '500 XP',  rarity: 'epic' },
    { id: 'xp-1000', emoji: '✨', label: '1000 XP', rarity: 'legendary' },
    { id: 'xp-2500', emoji: '✨', label: '2500 XP', rarity: 'legendary' },
  ];
}
