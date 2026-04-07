import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import { modules } from '../data/lessons';

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
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    const userResult = await pool.query(
      'SELECT xp, streak, last_active FROM users WHERE id = $1',
      [req.userId]
    );
    const currentUser = userResult.rows[0] as { xp: number; streak: number; last_active: string };

    let newStreak = currentUser.streak;
    if (currentUser.last_active !== today) {
      newStreak = currentUser.last_active === yesterday ? newStreak + 1 : 1;
    }

    const newXp = currentUser.xp + xpEarned;

    await pool.query(
      'INSERT INTO progress (user_id, lesson_id, module_id, xp_earned) VALUES ($1, $2, $3, $4)',
      [req.userId, lessonId, moduleId, xpEarned]
    );

    await pool.query(
      'UPDATE users SET xp = $1, streak = $2, last_active = $3 WHERE id = $4',
      [newXp, newStreak, today, req.userId]
    );

    res.json({ alreadyCompleted: false, xpEarned, totalXp: newXp, streak: newStreak });
  } catch (err) {
    console.error('Progress complete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
