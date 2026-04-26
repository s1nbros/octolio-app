import { Router, Response } from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';

export const aiRouter = Router();

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

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

  // Verify user is pro
  const pool = getPool();
  const result = await pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]);
  if (!result.rows[0]?.is_pro) {
    res.status(403).json({ error: 'Pro subscription required' });
    return;
  }

  // Stream the response
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await anthropic.messages.stream({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: messages.slice(-20), // last 20 messages to keep context window sane
    });

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        res.write(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    res.write(`data: ${JSON.stringify({ error: 'AI error' })}\n\n`);
    res.end();
  }
});
