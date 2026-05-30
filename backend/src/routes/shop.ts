import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import {
  CATALOG, getCatalogItem,
  XP_PER_COIN_EXCHANGE_RATE, MIN_XP_EXCHANGE,
} from '../data/catalog';

export const shopRouter = Router();

/* ─── GET /api/shop/catalog ────────────────────────────────────
 * Returns the full catalog enriched with the user's ownership.
 */
shopRouter.get('/catalog', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const owned = new Set((await pool.query(
      `SELECT item_id FROM user_inventory WHERE user_id = $1`,
      [req.userId]
    )).rows.map((r: { item_id: string }) => r.item_id));

    const user = (await pool.query(
      'SELECT coins, equipped_hat, equipped_face, equipped_body FROM users WHERE id = $1',
      [req.userId]
    )).rows[0] as {
      coins: number;
      equipped_hat: string | null;
      equipped_face: string | null;
      equipped_body: string | null;
    };

    const equippedBySlot: Record<string, string | null> = {
      hat:  user?.equipped_hat  ?? null,
      face: user?.equipped_face ?? null,
      body: user?.equipped_body ?? null,
    };

    const items = CATALOG.map((c) => ({
      ...c,
      owned: owned.has(c.id),
      equipped: equippedBySlot[c.slot] === c.id,
    }));

    res.json({
      coins: user?.coins ?? 0,
      equipped: equippedBySlot,
      items,
    });
  } catch (err) {
    console.error('Shop catalog error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/shop/buy ───────────────────────────────────────
 * Body: { itemId }
 */
shopRouter.post('/buy', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { itemId } = req.body as { itemId?: string };
  if (!itemId) {
    res.status(400).json({ error: 'itemId required' });
    return;
  }
  const item = getCatalogItem(itemId);
  if (!item) {
    res.status(404).json({ error: 'item_not_found' });
    return;
  }
  if (item.price <= 0) {
    res.status(400).json({ error: 'item_not_for_sale' });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = (await client.query(
      'SELECT coins FROM users WHERE id = $1 FOR UPDATE',
      [req.userId]
    )).rows[0] as { coins: number } | undefined;
    if (!user) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.coins < item.price) {
      await client.query('ROLLBACK');
      res.status(402).json({
        error: 'insufficient_coins',
        required: item.price,
        have: user.coins,
      });
      return;
    }
    // Already owns?
    const owns = (await client.query(
      'SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [req.userId, itemId]
    )).rows.length > 0;
    if (owns) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'already_owned' });
      return;
    }

    await client.query(
      'UPDATE users SET coins = coins - $1 WHERE id = $2',
      [item.price, req.userId]
    );
    await client.query(
      'INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)',
      [req.userId, itemId]
    );
    await client.query('COMMIT');
    res.json({ ok: true, coins: user.coins - item.price });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Shop buy error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

/* ─── POST /api/shop/equip ─────────────────────────────────────
 * Equip an item into its slot. You can simultaneously equip one item
 * per slot (hat + face + body).
 * Body: { itemId }   — looks up the slot from the catalog
 * To unequip, call /api/shop/unequip with the slot name.
 */
shopRouter.post('/equip', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { itemId } = req.body as { itemId?: string };
  if (!itemId) {
    res.status(400).json({ error: 'itemId required' });
    return;
  }
  try {
    const pool = getPool();
    const item = getCatalogItem(itemId);
    if (!item) {
      res.status(404).json({ error: 'item_not_found' });
      return;
    }
    const owns = (await pool.query(
      'SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [req.userId, itemId]
    )).rows.length > 0;
    if (!owns) {
      res.status(403).json({ error: 'not_owned' });
      return;
    }
    // Map slot → column name
    const slotCol = item.slot === 'hat' ? 'equipped_hat'
                  : item.slot === 'face' ? 'equipped_face'
                  : 'equipped_body';
    await pool.query(`UPDATE users SET ${slotCol} = $1 WHERE id = $2`, [itemId, req.userId]);
    res.json({ ok: true, slot: item.slot, itemId });
  } catch (err) {
    console.error('Shop equip error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/shop/unequip ───────────────────────────────────
 * Body: { slot: 'hat' | 'face' | 'body' }
 */
shopRouter.post('/unequip', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { slot } = req.body as { slot?: string };
  if (slot !== 'hat' && slot !== 'face' && slot !== 'body') {
    res.status(400).json({ error: 'slot must be hat|face|body' });
    return;
  }
  try {
    const pool = getPool();
    const slotCol = slot === 'hat' ? 'equipped_hat' : slot === 'face' ? 'equipped_face' : 'equipped_body';
    await pool.query(`UPDATE users SET ${slotCol} = NULL WHERE id = $1`, [req.userId]);
    res.json({ ok: true, slot });
  } catch (err) {
    console.error('Shop unequip error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/shop/exchange ──────────────────────────────────
 * Exchange XP → coins. Body: { xpAmount }
 */
shopRouter.post('/exchange', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { xpAmount } = req.body as { xpAmount?: number };
  if (typeof xpAmount !== 'number' || xpAmount < MIN_XP_EXCHANGE) {
    res.status(400).json({ error: 'invalid_amount', minXp: MIN_XP_EXCHANGE });
    return;
  }
  const xpRounded = Math.floor(xpAmount);
  const coinsGained = Math.floor(xpRounded / XP_PER_COIN_EXCHANGE_RATE);
  if (coinsGained <= 0) {
    res.status(400).json({ error: 'invalid_amount' });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const user = (await client.query(
      'SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE',
      [req.userId]
    )).rows[0] as { xp: number; coins: number } | undefined;
    if (!user) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'User not found' });
      return;
    }
    if (user.xp < xpRounded) {
      await client.query('ROLLBACK');
      res.status(402).json({ error: 'insufficient_xp', have: user.xp, required: xpRounded });
      return;
    }
    await client.query(
      'UPDATE users SET xp = xp - $1, coins = coins + $2 WHERE id = $3',
      [xpRounded, coinsGained, req.userId]
    );
    await client.query('COMMIT');
    res.json({
      ok: true,
      xp: user.xp - xpRounded,
      coins: user.coins + coinsGained,
      coinsGained,
    });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Shop exchange error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

/* ─── GET /api/shop/inventory ──────────────────────────────────
 * Returns owned items (joined with catalog).
 */
shopRouter.get('/inventory', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const owned = (await pool.query(
      `SELECT item_id, acquired_at FROM user_inventory WHERE user_id = $1 ORDER BY acquired_at DESC`,
      [req.userId]
    )).rows as Array<{ item_id: string; acquired_at: string }>;
    const items = owned
      .map((r) => {
        const it = getCatalogItem(r.item_id);
        return it ? { ...it, acquired_at: r.acquired_at } : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    const user = (await pool.query(
      'SELECT equipped_costume FROM users WHERE id = $1',
      [req.userId]
    )).rows[0] as { equipped_costume: string | null };
    res.json({ items, equippedCostume: user?.equipped_costume ?? null });
  } catch (err) {
    console.error('Shop inventory error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
