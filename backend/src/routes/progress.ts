import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getDb } from '../db';
import { modules } from '../data/lessons';

export const progressRouter = Router();

progressRouter.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const db = getDb();
    const rows = db
      .prepare('SELECT lesson_id, module_id, xp_earned, completed_at FROM progress WHERE user_id = ? ORDER BY completed_at DESC')
      .all(req.userId) as { lesson_id: string; module_id: string; xp_earned: number; completed_at: string }[];

    const user = db
      .prepare('SELECT xp, streak FROM users WHERE id = ?')
      .get(req.userId) as { xp: number; streak: number } | undefined;

    res.json({ progress: rows, xp: user?.xp ?? 0, streak: user?.streak ?? 0 });
  } catch (err) {
    console.error('Progress get error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

progressRouter.post('/complete', authenticate, (req: AuthRequest, res: Response): void => {
  const { lessonId, moduleId } = req.body;

  if (!lessonId || !moduleId) {
    res.status(400).json({ error: 'lessonId and moduleId are required' });
    return;
  }

  // Validate lesson exists
  const mod = modules.find((m) => m.id === moduleId);
  const lesson = mod?.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  try {
    const db = getDb();

    // Check if already completed
    const existing = db
      .prepare('SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?')
      .get(req.userId, lessonId);

    if (existing) {
      const user = db.prepare('SELECT xp, streak FROM users WHERE id = ?').get(req.userId) as { xp: number; streak: number };
      res.json({ alreadyCompleted: true, xpEarned: 0, totalXp: user.xp, streak: user.streak });
      return;
    }

    const xpEarned = lesson.xpReward;

    // Update streak and XP
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const currentUser = db.prepare('SELECT xp, streak, last_active FROM users WHERE id = ?').get(req.userId) as {
      xp: number;
      streak: number;
      last_active: string;
    };

    let newStreak = currentUser.streak;
    if (currentUser.last_active !== today) {
      if (currentUser.last_active === yesterday) {
        newStreak += 1;
      } else {
        newStreak = 1;
      }
    }

    const newXp = currentUser.xp + xpEarned;

    db.prepare('INSERT INTO progress (user_id, lesson_id, module_id, xp_earned) VALUES (?, ?, ?, ?)').run(
      req.userId, lessonId, moduleId, xpEarned
    );

    db.prepare('UPDATE users SET xp = ?, streak = ?, last_active = ? WHERE id = ?').run(
      newXp, newStreak, today, req.userId
    );

    res.json({ alreadyCompleted: false, xpEarned, totalXp: newXp, streak: newStreak });
  } catch (err) {
    console.error('Progress complete error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
