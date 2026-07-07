import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import { todayStr } from '../services/streak';

export const aiRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/** Free users get this many "Explain my mistake" AI calls per calendar day. Pro = unlimited. */
export const DAILY_FREE_EXPLAINS = 3;

const SYSTEM_PROMPT = `You are Octolio's AI financial advisor — a knowledgeable, friendly expert in personal finance.
Your job: give clear, actionable, non-generic financial guidance.

Guidelines:
- Be specific and practical. Use real numbers and examples.
- Cover budgeting, investing, debt, taxes, real estate, retirement, and financial mindset.
- Never give legal or tax advice specific to a country unless asked. Mention to consult a local advisor for jurisdiction-specific questions.
- Keep answers concise but complete — use bullet points and structure for clarity.
- Speak like a smart friend, not a textbook.
- If the user asks something outside finance, politely redirect to financial topics.`;

aiRouter.post('/chat', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { messages } = req.body as { messages: { role: 'user' | 'assistant'; content: string }[] };

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    res.status(400).json({ error: 'messages required' });
    return;
  }

  const pool = getPool();
  const result = await pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]);
  if (!result.rows[0]?.is_pro) {
    res.status(403).json({ error: 'Pro subscription required' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('AI chat: ANTHROPIC_API_KEY missing');
    res.status(500).json({ error: 'AI service not configured' });
    return;
  }

  try {
    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-20),
    });

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('');

    res.json({ text });
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const detail = err?.error?.error?.message ?? err?.message ?? 'AI error';
    console.error('AI chat error:', status, detail, err);
    res.status(500).json({ error: detail });
  }
});

// ── AI "Explain my mistake" ──────────────────────────────────────────────
// Free users get DAILY_FREE_EXPLAINS/day; Pro is unlimited. The frontend sends
// a compact, already-localized description of the exercise the user just got
// wrong (so we don't have to know every one of the ~25 exercise schemas here).
const EXPLAIN_SYSTEM = `You are Octolio's friendly finance tutor octopus. A learner just answered a
personal-finance exercise incorrectly. Explain, warmly and simply, WHY their answer was wrong and
what the correct reasoning is.

Rules:
- Answer in the SAME language the exercise is written in (English or Bulgarian). Match it exactly.
- Keep it under 90 words. No headings, no markdown bullets — 1–2 short paragraphs of plain text.
- Be encouraging, never condescending. Focus on the underlying money concept so it sticks.
- Use a concrete number or quick example when it helps. Do not invent facts not implied by the exercise.`;

aiRouter.post('/explain', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { context, userAnswer } = req.body as { context?: string; userAnswer?: string };

  if (!context || typeof context !== 'string' || !context.trim()) {
    res.status(400).json({ error: 'context required' });
    return;
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    res.status(500).json({ error: 'AI service not configured' });
    return;
  }

  const pool = getPool();
  const today = todayStr();
  const row = (
    await pool.query(
      'SELECT is_pro, ai_explain_date, ai_explain_count FROM users WHERE id = $1',
      [req.userId]
    )
  ).rows[0] as { is_pro: boolean; ai_explain_date: string | null; ai_explain_count: number } | undefined;

  if (!row) {
    res.status(404).json({ error: 'User not found' });
    return;
  }

  const isPro = !!row.is_pro;
  const usedToday = row.ai_explain_date === today ? row.ai_explain_count ?? 0 : 0;

  if (!isPro && usedToday >= DAILY_FREE_EXPLAINS) {
    res.status(403).json({ error: 'daily_limit', remaining: 0, limit: DAILY_FREE_EXPLAINS });
    return;
  }

  try {
    const userMsg =
      `Exercise the learner got wrong:\n${context.slice(0, 4000)}` +
      (userAnswer ? `\n\nThe learner's (incorrect) answer: ${String(userAnswer).slice(0, 300)}` : '');

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: EXPLAIN_SYSTEM,
      messages: [{ role: 'user', content: userMsg }],
    });

    const text = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim();

    let remaining: number | null = null;
    if (!isPro) {
      // Atomically bump the counter, resetting it when the calendar day has rolled over.
      await pool.query(
        `UPDATE users
            SET ai_explain_date = $2,
                ai_explain_count = CASE WHEN ai_explain_date = $2 THEN ai_explain_count + 1 ELSE 1 END
          WHERE id = $1`,
        [req.userId, today]
      );
      remaining = Math.max(0, DAILY_FREE_EXPLAINS - (usedToday + 1));
    }

    res.json({ text, remaining, limit: DAILY_FREE_EXPLAINS, unlimited: isPro });
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status;
    const detail = err?.error?.error?.message ?? err?.message ?? 'AI error';
    console.error('AI explain error:', status, detail);
    res.status(500).json({ error: detail });
  }
});
