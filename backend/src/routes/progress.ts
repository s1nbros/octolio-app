import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import { modules } from '../data/lessons';
import { detectCrossesAndNotify } from './friends';
import { computeStreakUpdate } from '../services/streak';
import { updateFriendStreaksForUser } from '../services/friendStreak';

export const progressRouter = Router();

progressRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();

    const progressResult = await pool.query(
      'SELECT lesson_id, module_id, xp_earned, completed_at FROM progress WHERE user_id = $1 ORDER BY completed_at DESC',
      [req.userId]
    );

    const userResult = await pool.query(
      'SELECT xp, streak FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0];

    res.json({ progress: progressResult.rows, xp: user?.xp ?? 0, streak: user?.streak ?? 0 });
  } catch (err) {
    console.error('Progress get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* POST /api/progress/energy/use — deduct energy for interactive exercises in a lesson */
progressRouter.post('/energy/use', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { lessonId, moduleId } = req.body;

  if (!lessonId || !moduleId) {
    res.status(400).json({ error: 'lessonId and moduleId are required' });
    return;
  }

  const mod = modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  // Every lesson costs exactly 3 energy
  const cost = 3;

  try {
    const pool = getPool();

    const userResult = await pool.query(
      'SELECT is_pro, energy, energy_refill_at FROM users WHERE id = $1',
      [req.userId]
    );
    const user = userResult.rows[0] as { is_pro: boolean; energy: number; energy_refill_at: string | null };

    // Pro users have unlimited energy — skip all deduction
    if (user.is_pro) {
      res.json({ energy: user.energy, cost: 0, unlimited: true });
      return;
    }

    // Apply incremental refill (+1 per 15 minutes) before deducting
    let currentEnergy = user.energy;
    let refillAt = user.energy_refill_at;
    if (currentEnergy < 12 && refillAt) {
      const REFILL_INTERVAL_MS = 15 * 60 * 1000;
      const refillAtMs = new Date(refillAt).getTime();
      const intervals = Math.floor((Date.now() - refillAtMs) / REFILL_INTERVAL_MS);
      if (intervals > 0) {
        const toAdd = Math.min(intervals, 12 - currentEnergy);
        currentEnergy += toAdd;
        refillAt = currentEnergy >= 12
          ? null
          : new Date(refillAtMs + toAdd * REFILL_INTERVAL_MS).toISOString();
      }
    }

    if (currentEnergy < cost) {
      res.status(402).json({
        error: 'no_energy',
        energy: currentEnergy,
        cost,
        refillAt: refillAt ?? null,
      });
      return;
    }

    const newEnergy = currentEnergy - cost;
    // Start refill timer from NOW when energy first drops below max
    const newRefillAt = (!refillAt && newEnergy < 12)
      ? new Date().toISOString()
      : refillAt;

    await pool.query(
      'UPDATE users SET energy = $1, energy_refill_at = $2 WHERE id = $3',
      [newEnergy, newRefillAt, req.userId]
    );

    res.json({ energy: newEnergy, cost, refillAt: newRefillAt });
  } catch (err) {
    console.error('Energy use error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

progressRouter.post('/complete', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { lessonId, moduleId } = req.body;

  if (!lessonId || !moduleId) {
    res.status(400).json({ error: 'lessonId and moduleId are required' });
    return;
  }

  const mod = modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  try {
    const pool = getPool();

    const existing = await pool.query(
      'SELECT id FROM progress WHERE user_id = $1 AND lesson_id = $2',
      [req.userId, lessonId]
    );

    if (existing.rows.length > 0) {
      const userResult = await pool.query('SELECT xp, streak FROM users WHERE id = $1', [req.userId]);
      const user = userResult.rows[0];
      res.json({ alreadyCompleted: true, xpEarned: 0, totalXp: user.xp, streak: user.streak });
      return;
    }

    const xpEarned = lesson.xpReward;
    const today = new Date().toISOString().split('T')[0];

    const userResult = await pool.query(
      'SELECT xp, streak, last_active, streak_freezes, name FROM users WHERE id = $1',
      [req.userId]
    );
    const currentUser = userResult.rows[0] as { xp: number; streak: number; last_active: string | null; streak_freezes: number; name: string };

    // Shared calendar-day streak logic (also used by the Daily Money Workout).
    const { newStreak, newFreezes, freezesUsed } = computeStreakUpdate(
      { streak: currentUser.streak, last_active: currentUser.last_active, streak_freezes: currentUser.streak_freezes ?? 0 },
      today
    );

    const newXp = currentUser.xp + xpEarned;

    await pool.query(
      'INSERT INTO progress (user_id, lesson_id, module_id, xp_earned) VALUES ($1, $2, $3, $4)',
      [req.userId, lessonId, moduleId, xpEarned]
    );

    await pool.query(
      'UPDATE users SET xp = $1, streak = $2, last_active = $3, streak_freezes = $4 WHERE id = $5',
      [newXp, newStreak, today, newFreezes, req.userId]
    );

    // Fire-and-forget: notify friends we just overtook in XP.
    detectCrossesAndNotify(req.userId!, currentUser.name, currentUser.xp, newXp)
      .catch((e) => console.error('cross-XP notify failed:', e));

    // Fire-and-forget: bump shared friend streaks for any friend also active today.
    updateFriendStreaksForUser(req.userId!, today)
      .catch((e) => console.error('friend-streak update failed:', e));

    res.json({
      alreadyCompleted: false,
      xpEarned,
      totalXp: newXp,
      streak: newStreak,
      streak_freezes: newFreezes,
      freezesUsed,
    });
  } catch (err) {
    console.error('Progress complete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
