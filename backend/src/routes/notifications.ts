import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';

export const notificationsRouter = Router();

/* ─── GET /api/notifications ────────────────────────────────────
 * Last 30, newest first.
 */
notificationsRouter.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const rows = (await pool.query(
      `SELECT id, type, title, body, link, metadata, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`,
      [req.userId]
    )).rows;
    res.json({ notifications: rows });
  } catch (err) {
    console.error('Notifications list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── GET /api/notifications/unread-count ─────────────────────── */
notificationsRouter.get('/unread-count', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const row = (await pool.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND read = FALSE`,
      [req.userId]
    )).rows[0] as { count: string };
    res.json({ count: Number(row?.count ?? 0) });
  } catch (err) {
    console.error('Notifications unread-count error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/notifications/:id/read ─────────────────────────
 * Mark a single notification as read.
 */
notificationsRouter.post('/:id/read', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    res.status(400).json({ error: 'id required' });
    return;
  }
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`,
      [id, req.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Notifications read error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/notifications/read-all ─────────────────────────
 * Mark every unread notification as read.
 */
notificationsRouter.post('/read-all', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    await pool.query(
      `UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`,
      [req.userId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Notifications read-all error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
