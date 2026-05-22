"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.notificationsRouter = (0, express_1.Router)();
/* ─── GET /api/notifications ────────────────────────────────────
 * Last 30, newest first.
 */
exports.notificationsRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const rows = (await pool.query(`SELECT id, type, title, body, link, metadata, read, created_at
       FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 30`, [req.userId])).rows;
        res.json({ notifications: rows });
    }
    catch (err) {
        console.error('Notifications list error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── GET /api/notifications/unread-count ─────────────────────── */
exports.notificationsRouter.get('/unread-count', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const row = (await pool.query(`SELECT COUNT(*) AS count FROM notifications WHERE user_id = $1 AND read = FALSE`, [req.userId])).rows[0];
        res.json({ count: Number(row?.count ?? 0) });
    }
    catch (err) {
        console.error('Notifications unread-count error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/notifications/:id/read ─────────────────────────
 * Mark a single notification as read.
 */
exports.notificationsRouter.post('/:id/read', auth_1.authenticate, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
        res.status(400).json({ error: 'id required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        await pool.query(`UPDATE notifications SET read = TRUE WHERE id = $1 AND user_id = $2`, [id, req.userId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Notifications read error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/notifications/read-all ─────────────────────────
 * Mark every unread notification as read.
 */
exports.notificationsRouter.post('/read-all', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        await pool.query(`UPDATE notifications SET read = TRUE WHERE user_id = $1 AND read = FALSE`, [req.userId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Notifications read-all error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
