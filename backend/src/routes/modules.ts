import { Router, Response } from 'express';
import { modules } from '../data/lessons';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getDb } from '../db';

export const modulesRouter = Router();

// Get all modules (strip exercises for the list view)
modulesRouter.get('/', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const db = getDb();
    const completedLessons = db
      .prepare('SELECT lesson_id FROM progress WHERE user_id = ?')
      .all(req.userId) as { lesson_id: string }[];

    const completedSet = new Set(completedLessons.map((r) => r.lesson_id));

    const result = modules.map((mod) => ({
      id: mod.id,
      title: mod.title,
      description: mod.description,
      icon: mod.icon,
      color: mod.color,
      order: mod.order,
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

    res.json({ modules: result });
  } catch (err) {
    console.error('Modules error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get a specific lesson with exercises
modulesRouter.get('/:moduleId/lessons/:lessonId', authenticate, (req: AuthRequest, res: Response): void => {
  const { moduleId, lessonId } = req.params;

  const mod = modules.find((m) => m.id === moduleId);
  if (!mod) {
    res.status(404).json({ error: 'Module not found' });
    return;
  }

  const lesson = mod.lessons.find((l) => l.id === lessonId);
  if (!lesson) {
    res.status(404).json({ error: 'Lesson not found' });
    return;
  }

  try {
    const db = getDb();
    const completed = db
      .prepare('SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?')
      .get(req.userId, lessonId);

    res.json({ lesson, completed: !!completed });
  } catch (err) {
    console.error('Lesson error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
