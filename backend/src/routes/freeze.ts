import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';

export const freezeRouter = Router();

export const FREEZE_COST_XP = 100;
export const FREEZE_MAX_STOCK = 3;

/**
 * POST /api/freeze/buy
 * Spend FREEZE_COST_XP to gain 1 streak freeze. Capped at FREEZE_MAX_STOCK.
 */
freezeRouter.post('/buy', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const row = await pool.query(
      'SELECT xp, streak_freezes FROM users WHERE id = $1',
      [req.userId]
    );
    const user = row.rows[0] as { xp: number; streak_freezes: number } | undefined;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    if (user.streak_freezes >= FREEZE_MAX_STOCK) {
      res.status(400).json({ error: 'max_freezes', message: `Max ${FREEZE_MAX_STOCK} freezes` });
      return;
    }
    if (user.xp < FREEZE_COST_XP) {
      res.status(402).json({
        error: 'insufficient_xp',
        required: FREEZE_COST_XP,
        have: user.xp,
      });
      return;
    }

    const newXp = user.xp - FREEZE_COST_XP;
    const newFreezes = user.streak_freezes + 1;

    await pool.query(
      'UPDATE users SET xp = $1, streak_freezes = $2 WHERE id = $3',
      [newXp, newFreezes, req.userId]
    );

    res.json({
      xp: newXp,
      streak_freezes: newFreezes,
      cost: FREEZE_COST_XP,
    });
  } catch (err) {
    console.error('Freeze buy error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/**
 * GET /api/freeze/info
 * Return shop info: cost, max stock, current stock, current XP.
 */
freezeRouter.get('/info', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const row = await pool.query(
      'SELECT xp, streak_freezes FROM users WHERE id = $1',
      [req.userId]
    );
    const user = row.rows[0] as { xp: number; streak_freezes: number } | undefined;
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      cost: FREEZE_COST_XP,
      max: FREEZE_MAX_STOCK,
      stock: user.streak_freezes,
      xp: user.xp,
      can_afford: user.xp >= FREEZE_COST_XP && user.streak_freezes < FREEZE_MAX_STOCK,
    });
  } catch (err) {
    console.error('Freeze info error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
