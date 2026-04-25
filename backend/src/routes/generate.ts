import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { generateLesson } from '../services/lessonGenerator';

export const generateRouter = Router();

// POST /api/generate/lesson   body: { topic: string }
generateRouter.post('/lesson', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
  if (!topic) { res.status(400).json({ error: 'topic required' }); return; }

  try {
    const lesson = await generateLesson(topic);
    res.json({ lesson });
  } catch (err) {
    console.error('generate lesson error:', err);
    res.status(500).json({ error: 'generation_failed', detail: String(err) });
  }
});
