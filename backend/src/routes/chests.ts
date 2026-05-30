import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import { drawReward, getCatalogItem } from '../data/catalog';
import { modules } from '../data/lessons';

export const chestsRouter = Router();

type Position = 'mid' | 'end';

/* ─── Helpers ────────────────────────────────────────────────── */

/** For a module of N lessons, which lesson index (0-based) is the chest tied to?
 *  - 'mid' unlocks after the lesson at index floor(N/2) − 1 (i.e. after half done)
 *  - 'end' unlocks after the last lesson (index N − 1)
 */
function chestUnlockAfterLessonIdx(numLessons: number, pos: Position): number {
  if (pos === 'end') return numLessons - 1;
  // For modules with 1–2 lessons we skip 'mid' entirely (only 'end' exists).
  return Math.max(0, Math.floor(numLessons / 2) - 1);
}

/** Modules with 1 lesson get only an 'end' chest; everyone else gets both. */
function chestPositionsFor(numLessons: number): Position[] {
  if (numLessons <= 1) return ['end'];
  return ['mid', 'end'];
}

interface ModuleChestState {
  moduleId: string;
  position: Position;
  /** lesson index after which this chest sits in the path */
  afterLessonIdx: number;
  status: 'locked' | 'available' | 'opened';
}

async function buildChestStates(userId: number): Promise<ModuleChestState[]> {
  const pool = getPool();

  // Get all completed lesson IDs for the user, indexed by module
  const progressRows = (await pool.query(
    `SELECT lesson_id, module_id FROM progress WHERE user_id = $1`,
    [userId]
  )).rows as Array<{ lesson_id: string; module_id: string }>;

  const completedByModule = new Map<string, Set<string>>();
  for (const r of progressRows) {
    if (!completedByModule.has(r.module_id)) completedByModule.set(r.module_id, new Set());
    completedByModule.get(r.module_id)!.add(r.lesson_id);
  }

  // Get all already-opened chest positions
  const openedRows = (await pool.query(
    `SELECT module_id, position FROM module_chests WHERE user_id = $1`,
    [userId]
  )).rows as Array<{ module_id: string; position: Position }>;

  const openedSet = new Set(openedRows.map((r) => `${r.module_id}:${r.position}`));

  const out: ModuleChestState[] = [];
  for (const mod of modules) {
    const lessons = mod.lessons;
    const completedLessonIds = completedByModule.get(mod.id) ?? new Set<string>();
    const positions = chestPositionsFor(lessons.length);
    for (const pos of positions) {
      const afterIdx = chestUnlockAfterLessonIdx(lessons.length, pos);
      // Unlocked when every lesson up to and including afterIdx is completed
      const unlocked = lessons.slice(0, afterIdx + 1).every((l) => completedLessonIds.has(l.id));
      const key = `${mod.id}:${pos}`;
      const opened = openedSet.has(key);
      out.push({
        moduleId: mod.id,
        position: pos,
        afterLessonIdx: afterIdx,
        status: opened ? 'opened' : unlocked ? 'available' : 'locked',
      });
    }
  }
  return out;
}

/* ─── GET /api/chests/info ─────────────────────────────────────
 * Returns full per-module chest map plus aggregate counters and
 * the user's most recent opens.
 */
chestsRouter.get('/info', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const states = await buildChestStates(req.userId!);
    const pool = getPool();
    const recent = (await pool.query(
      `SELECT reward_type, reward_value, coins_delta, xp_delta, opened_at
       FROM chest_opens
       WHERE user_id = $1
       ORDER BY opened_at DESC
       LIMIT 5`,
      [req.userId]
    )).rows;

    const available = states.filter((s) => s.status === 'available').length;
    const opened = states.filter((s) => s.status === 'opened').length;
    const total = states.length;

    res.json({
      chests: states,
      available,
      opened,
      total,
      recentOpens: recent,
    });
  } catch (err) {
    console.error('Chests info error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/chests/open ────────────────────────────────────
 * Body: { moduleId, position }
 * Atomically opens the specified chest if it's currently available.
 */
chestsRouter.post('/open', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { moduleId, position } = req.body as { moduleId?: string; position?: Position };
  if (!moduleId || (position !== 'mid' && position !== 'end')) {
    res.status(400).json({ error: 'moduleId and position (mid|end) required' });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Validate via re-check
    const states = await buildChestStates(req.userId!);
    const target = states.find((s) => s.moduleId === moduleId && s.position === position);
    if (!target) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'chest_not_found' });
      return;
    }
    if (target.status === 'opened') {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'already_opened' });
      return;
    }
    if (target.status === 'locked') {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'locked' });
      return;
    }

    // Get owned items so cosmetic draw skips duplicates
    const owned = new Set((await client.query(
      `SELECT item_id FROM user_inventory WHERE user_id = $1`,
      [req.userId]
    )).rows.map((r: { item_id: string }) => r.item_id));

    const reward = drawReward(owned);

    let coinsDelta = 0;
    let xpDelta = 0;
    let rewardValue = '';

    if (reward.type === 'coins') {
      coinsDelta = reward.amount;
      rewardValue = String(reward.amount);
    } else if (reward.type === 'xp') {
      xpDelta = reward.amount;
      rewardValue = String(reward.amount);
    } else if (reward.type === 'freeze') {
      await client.query(
        `UPDATE users SET streak_freezes = LEAST(streak_freezes + $1, 3) WHERE id = $2`,
        [reward.amount, req.userId]
      );
      rewardValue = String(reward.amount);
    } else if (reward.type === 'energy') {
      await client.query(
        `UPDATE users SET energy = LEAST(energy + $1, 12) WHERE id = $2`,
        [reward.amount, req.userId]
      );
      rewardValue = String(reward.amount);
    } else if (reward.type === 'item') {
      await client.query(
        `INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)
         ON CONFLICT (user_id, item_id) DO NOTHING`,
        [req.userId, reward.itemId]
      );
      rewardValue = reward.itemId;
    }

    await client.query(
      `UPDATE users SET coins = coins + $1, xp = xp + $2, chests_opened = chests_opened + 1 WHERE id = $3`,
      [coinsDelta, xpDelta, req.userId]
    );

    await client.query(
      `INSERT INTO chest_opens (user_id, reward_type, reward_value, coins_delta, xp_delta)
       VALUES ($1, $2, $3, $4, $5)`,
      [req.userId, reward.type, rewardValue, coinsDelta, xpDelta]
    );

    // Mark this specific chest position as opened
    await client.query(
      `INSERT INTO module_chests (user_id, module_id, position) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, module_id, position) DO NOTHING`,
      [req.userId, moduleId, position]
    );

    await client.query('COMMIT');

    let item: { id: string; name: { en: string; bg: string }; emoji: string; rarity: string; slot: string } | null = null;
    if (reward.type === 'item') {
      const it = getCatalogItem(reward.itemId);
      if (it) item = { id: it.id, name: it.name, emoji: it.emoji, rarity: it.rarity, slot: it.slot };
    }

    res.json({
      reward,
      item,
      coinsDelta,
      xpDelta,
      moduleId,
      position,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Chest open error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
