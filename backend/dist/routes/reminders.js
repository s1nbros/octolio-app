"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.remindersRouter = void 0;
// ───────────────────────────────────────────────────────────────
// reminders.ts — daily streak-reminder emails.
//
// This endpoint is meant to be hit ONCE PER DAY by an external scheduler
// (Render Cron Job, cron-job.org, GitHub Actions, etc.) — not by the app.
// It finds verified users who haven't been active today and emails them a
// nudge. Guarded by the REMINDER_CRON_TOKEN env var.
//
//   curl -X POST https://<backend>/api/reminders/send \
//     -H "X-Reminder-Token: $REMINDER_CRON_TOKEN"
// ───────────────────────────────────────────────────────────────
const express_1 = require("express");
const db_1 = require("../db");
const email_1 = require("../services/email");
const streak_1 = require("../services/streak");
exports.remindersRouter = (0, express_1.Router)();
exports.remindersRouter.post('/send', async (req, res) => {
    const expected = process.env.REMINDER_CRON_TOKEN;
    const provided = req.header('X-Reminder-Token');
    if (!expected || provided !== expected) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const today = (0, streak_1.todayStr)();
        // Candidates: verified accounts that have onboarded, finished at least one
        // lesson (have a streak to protect / habit to keep), and have NOT been
        // active today. Cap the batch so a single run can't fan out unbounded.
        const result = await pool.query(`SELECT id, email, name, streak
         FROM users
        WHERE email_verified = TRUE
          AND onboarding_done = TRUE
          AND (last_active IS NULL OR last_active <> $1)
          AND last_active IS NOT NULL
        ORDER BY streak DESC
        LIMIT 500`, [today]);
        let sent = 0;
        let failed = 0;
        // Send sequentially with a tiny gap to stay within provider rate limits.
        for (const u of result.rows) {
            try {
                await (0, email_1.sendStreakReminderEmail)(u.email, u.name, u.streak ?? 0, 'en');
                sent++;
            }
            catch (e) {
                failed++;
                console.error(`[reminders] failed for ${u.email}:`, e instanceof Error ? e.message : e);
            }
        }
        res.json({ ok: true, candidates: result.rows.length, sent, failed });
    }
    catch (err) {
        console.error('Reminders send error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
