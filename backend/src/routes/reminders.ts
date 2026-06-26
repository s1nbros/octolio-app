// ───────────────────────────────────────────────────────────────
// reminders.ts — smart, Duolingo-style reminder cadence.
//
// Hit ONCE PER DAY by an external scheduler (Render Cron / cron-job.org).
// Guarded by REMINDER_CRON_TOKEN. It decides, per user, whether to email:
//
//   • Active today          → no email (they're already here)
//   • 1–2 days inactive      → STREAK reminder ("keep your streak")  ← the daily window
//   • 3–29 days inactive     → silent (no nagging)
//   • 30+ days inactive      → WIN-BACK ("we miss you"), at most once a month
//
// `last_reminder_sent` (YYYY-MM-DD) prevents double-sends and rate-limits
// the win-back to ~monthly.
//
//   curl -X POST https://<backend>/api/reminders/send \
//     -H "X-Reminder-Token: $REMINDER_CRON_TOKEN"
//
// Test helpers (JSON body):
//   { "testEmail": "you@x.com" } → send one reminder to that user, bypass cadence
//   { "dryRun": true }           → report who WOULD be emailed, send nothing
// ───────────────────────────────────────────────────────────────
import { Router, Request, Response } from 'express';
import { getPool } from '../db';
import { sendStreakReminderEmail, sendWinbackEmail } from '../services/email';
import { todayStr } from '../services/streak';

export const remindersRouter = Router();

// Cadence tuning (days).
const STREAK_WINDOW_MAX = 2;   // 1–2 days inactive → streak reminder
const WINBACK_AFTER = 30;      // 30+ days inactive → win-back
const WINBACK_COOLDOWN = 28;   // …but only if the last reminder was ≥28 days ago

/** Whole-day diff between two 'YYYY-MM-DD' strings (b - a). */
function dayDiff(a: string, b: string): number {
  const da = new Date(a + 'T00:00:00').getTime();
  const db = new Date(b + 'T00:00:00').getTime();
  return Math.round((db - da) / 86400000);
}

type ReminderType = 'streak' | 'winback' | null;

/** Decide which (if any) email a user should get today. */
function decide(
  lastActive: string | null,
  lastReminder: string | null,
  today: string
): ReminderType {
  if (!lastActive) return null;
  const daysSince = dayDiff(lastActive, today);
  if (daysSince <= 0) return null;                 // active today
  if (lastReminder === today) return null;         // already emailed today

  if (daysSince >= 1 && daysSince <= STREAK_WINDOW_MAX) return 'streak';

  if (daysSince >= WINBACK_AFTER) {
    const sinceReminder = lastReminder ? dayDiff(lastReminder, today) : Infinity;
    if (sinceReminder >= WINBACK_COOLDOWN) return 'winback';
  }

  return null; // 3–29 days → silent
}

remindersRouter.post('/send', async (req: Request, res: Response): Promise<void> => {
  const expected = process.env.REMINDER_CRON_TOKEN;
  const provided = req.header('X-Reminder-Token');
  if (!expected || provided !== expected) {
    res.status(404).json({ error: 'Not found' });
    return;
  }

  const { testEmail, dryRun } = req.body ?? {};
  const pool = getPool();
  const today = todayStr();

  try {
    // ── Test mode: send one reminder to a specific user, bypass cadence ──
    if (testEmail) {
      const r = await pool.query<{ email: string; name: string; streak: number }>(
        'SELECT email, name, streak FROM users WHERE email = $1',
        [String(testEmail).toLowerCase()]
      );
      const u = r.rows[0];
      if (!u) { res.status(404).json({ error: 'No user with that email' }); return; }
      await sendStreakReminderEmail(u.email, u.name, u.streak ?? 0, 'en');
      res.json({ ok: true, test: true, sentTo: u.email });
      return;
    }

    // ── Normal run: fetch candidates, decide per user ──
    const result = await pool.query<{
      id: number; email: string; name: string; streak: number;
      last_active: string | null; last_reminder_sent: string | null;
    }>(
      `SELECT id, email, name, streak, last_active, last_reminder_sent
         FROM users
        WHERE email_verified = TRUE
          AND onboarding_done = TRUE
          AND last_active IS NOT NULL
          AND last_active <> $1
        ORDER BY last_active DESC
        LIMIT 2000`,
      [today]
    );

    const todo: { id: number; email: string; name: string; streak: number; type: ReminderType }[] = [];
    for (const u of result.rows) {
      const type = decide(u.last_active, u.last_reminder_sent, today);
      if (type) todo.push({ id: u.id, email: u.email, name: u.name, streak: u.streak ?? 0, type });
    }

    const breakdown = {
      streak: todo.filter(t => t.type === 'streak').length,
      winback: todo.filter(t => t.type === 'winback').length,
    };

    if (dryRun) {
      res.json({ ok: true, dryRun: true, candidates: result.rows.length, wouldSend: todo.length, breakdown });
      return;
    }

    let sent = 0, failed = 0;
    for (const t of todo) {
      try {
        if (t.type === 'winback') await sendWinbackEmail(t.email, t.name, 'en');
        else await sendStreakReminderEmail(t.email, t.name, t.streak, 'en');
        await pool.query('UPDATE users SET last_reminder_sent = $1 WHERE id = $2', [today, t.id]);
        sent++;
      } catch (e) {
        failed++;
        console.error(`[reminders] failed for ${t.email}:`, e instanceof Error ? e.message : e);
      }
    }

    res.json({ ok: true, candidates: result.rows.length, eligible: todo.length, breakdown, sent, failed });
  } catch (err) {
    console.error('Reminders send error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
