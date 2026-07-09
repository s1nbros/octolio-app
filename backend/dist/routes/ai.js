"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DAILY_FREE_EXPLAINS = exports.aiRouter = void 0;
const express_1 = require("express");
const generative_ai_1 = require("@google/generative-ai");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const streak_1 = require("../services/streak");
exports.aiRouter = (0, express_1.Router)();
// Both the Pro advisor (/chat) and the free "Explain my mistake" tutor (/explain)
// run on Google Gemini's free tier.
const gemini = process.env.GEMINI_API_KEY ? new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';
/** Free users get this many "Explain my mistake" AI calls per calendar day. Pro = unlimited. */
exports.DAILY_FREE_EXPLAINS = 3;
const SYSTEM_PROMPT = `You are Octolio's AI financial advisor — a knowledgeable, friendly expert in personal finance.
Your job: give clear, actionable, non-generic financial guidance.

Guidelines:
- Be specific and practical. Use real numbers and examples.
- Cover budgeting, investing, debt, taxes, real estate, retirement, and financial mindset.
- Never give legal or tax advice specific to a country unless asked. Mention to consult a local advisor for jurisdiction-specific questions.
- Keep answers concise but complete — use bullet points and structure for clarity.
- Speak like a smart friend, not a textbook.
- If the user asks something outside finance, politely redirect to financial topics.`;
exports.aiRouter.post('/chat', auth_1.authenticate, async (req, res) => {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
        res.status(400).json({ error: 'messages required' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const result = await pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0]?.is_pro) {
        res.status(403).json({ error: 'Pro subscription required' });
        return;
    }
    if (!gemini) {
        console.error('AI chat: GEMINI_API_KEY missing');
        res.status(500).json({ error: 'AI service not configured' });
        return;
    }
    try {
        // Map the advisor transcript to Gemini's format ('assistant' → 'model').
        const contents = messages.slice(-20).map((m) => ({
            role: m.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: m.content }],
        }));
        const model = gemini.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: SYSTEM_PROMPT,
            generationConfig: { maxOutputTokens: 1024 },
        });
        const result = await model.generateContent({ contents });
        const text = result.response.text();
        res.json({ text });
    }
    catch (err) {
        const status = err?.status ?? err?.response?.status;
        const detail = err?.error?.error?.message ?? err?.message ?? 'AI error';
        console.error('AI chat error:', status, detail);
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
exports.aiRouter.post('/explain', auth_1.authenticate, async (req, res) => {
    const { context, userAnswer } = req.body;
    if (!context || typeof context !== 'string' || !context.trim()) {
        res.status(400).json({ error: 'context required' });
        return;
    }
    if (!gemini) {
        console.error('AI explain: GEMINI_API_KEY missing');
        res.status(500).json({ error: 'AI service not configured' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const today = (0, streak_1.todayStr)();
    const row = (await pool.query('SELECT is_pro, ai_explain_date, ai_explain_count FROM users WHERE id = $1', [req.userId])).rows[0];
    if (!row) {
        res.status(404).json({ error: 'User not found' });
        return;
    }
    const isPro = !!row.is_pro;
    const usedToday = row.ai_explain_date === today ? row.ai_explain_count ?? 0 : 0;
    if (!isPro && usedToday >= exports.DAILY_FREE_EXPLAINS) {
        res.status(403).json({ error: 'daily_limit', remaining: 0, limit: exports.DAILY_FREE_EXPLAINS });
        return;
    }
    try {
        const userMsg = `Exercise the learner got wrong:\n${context.slice(0, 4000)}` +
            (userAnswer ? `\n\nThe learner's (incorrect) answer: ${String(userAnswer).slice(0, 300)}` : '');
        const model = gemini.getGenerativeModel({
            model: GEMINI_MODEL,
            systemInstruction: EXPLAIN_SYSTEM,
            generationConfig: { maxOutputTokens: 400, temperature: 0.6 },
        });
        const result = await model.generateContent(userMsg);
        const text = result.response.text().trim();
        if (!text) {
            res.status(500).json({ error: 'empty response' });
            return;
        }
        let remaining = null;
        if (!isPro) {
            // Atomically bump the counter, resetting it when the calendar day has rolled over.
            await pool.query(`UPDATE users
            SET ai_explain_date = $2,
                ai_explain_count = CASE WHEN ai_explain_date = $2 THEN ai_explain_count + 1 ELSE 1 END
          WHERE id = $1`, [req.userId, today]);
            remaining = Math.max(0, exports.DAILY_FREE_EXPLAINS - (usedToday + 1));
        }
        res.json({ text, remaining, limit: exports.DAILY_FREE_EXPLAINS, unlimited: isPro });
    }
    catch (err) {
        const status = err?.status ?? err?.response?.status;
        const detail = err?.error?.error?.message ?? err?.message ?? 'AI error';
        console.error('AI explain error:', status, detail);
        res.status(500).json({ error: detail });
    }
});
