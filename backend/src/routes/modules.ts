import { Router, Response } from 'express';
import { modules } from '../data/lessons';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';

export const modulesRouter = Router();

modulesRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const [progressResult, userResult] = await Promise.all([
      pool.query('SELECT lesson_id FROM progress WHERE user_id = $1', [req.userId]),
      pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]),
    ]);

    const completedSet = new Set(progressResult.rows.map((r: { lesson_id: string }) => r.lesson_id));
    const isPro: boolean = userResult.rows[0]?.is_pro ?? false;

    const output = modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      color: mod.color,
      order: mod.order,
      proOnly: mod.proOnly ?? false,
      lessons: mod.lessons.map((lesson) => ({
        id: lesson.id,
        moduleId: lesson.moduleId,
        title: lesson.title,
        description: lesson.description,
        icon: lesson.icon,
        xpReward: lesson.xpReward,
        order: lesson.order,
        exerciseCount: lesson.exercises.length,
        completed: completedSet.has(lesson.id),
      })),
    }));

    res.json({ modules: output, isPro });
  } catch (err) {
    console.error('Modules error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

modulesRouter.get('/:moduleId/lessons/:lessonId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { moduleId, lessonId } = req.params;

  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) { res.status(404).json({ error: 'Module not found' }); return; }

  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) { res.status(404).json({ error: 'Lesson not found' }); return; }

  try {
    const pool = getPool();
    const [progressResult, userResult] = await Promise.all([
      pool.query('SELECT id FROM progress WHERE user_id = $1 AND lesson_id = $2', [req.userId, lessonId]),
      pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]),
    ]);

    const isPro: boolean = userResult.rows[0]?.is_pro ?? false;

    // Block free users from accessing pro-only module lessons
    if (mod.proOnly && !isPro) {
      res.status(403).json({ error: 'pro_required' });
      return;
    }

    res.json({ lesson, completed: progressResult.rows.length > 0 });
  } catch (err) {
    console.error('Lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
