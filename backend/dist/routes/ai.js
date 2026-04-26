"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiRouter = void 0;
const express_1 = require("express");
const sdk_1 = __importDefault(require("@anthropic-ai/sdk"));
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.aiRouter = (0, express_1.Router)();
const anthropic = new sdk_1.default({ apiKey: process.env.ANTHROPIC_API_KEY });
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
    // Verify user is pro
    const pool = (0, db_1.getPool)();
    const result = await pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]);
    if (!result.rows[0]?.is_pro) {
        res.status(403).json({ error: 'Pro subscription required' });
        return;
    }
    // Stream the response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    try {
        const stream = anthropic.messages.stream({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            messages: messages.slice(-20),
        });
        stream.on('text', (text) => {
            res.write(`data: ${JSON.stringify({ text })}\n\n`);
        });
        await stream.done();
        res.write('data: [DONE]\n\n');
        res.end();
    }
    catch (err) {
        console.error('AI chat error:', err);
        res.write(`data: ${JSON.stringify({ error: 'AI error' })}\n\n`);
        res.end();
    }
});
