"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.friendsRouter = void 0;
exports.detectCrossesAndNotify = detectCrossesAndNotify;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.friendsRouter = (0, express_1.Router)();
/* ─── Helper: push a notification row ──────────────────────────── */
async function notify(userId, type, title, body, link, metadata) {
    const pool = (0, db_1.getPool)();
    await pool.query(`INSERT INTO notifications (user_id, type, title, body, link, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`, [userId, type, title, body, link, metadata ? JSON.stringify(metadata) : null]);
}
/* ─── GET /api/friends/list ─────────────────────────────────────
 * Accepted friends with their stats.
 */
exports.friendsRouter.get('/list', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const rows = (await pool.query(`SELECT u.id, u.name, u.xp, u.streak, u.avatar, f.created_at AS friend_since
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
       WHERE f.status = 'accepted'
         AND (f.requester_id = $1 OR f.recipient_id = $1)
       ORDER BY u.xp DESC`, [req.userId])).rows;
        res.json({ friends: rows });
    }
    catch (err) {
        console.error('Friends list error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── GET /api/friends/pending ─────────────────────────────────
 * Incoming + outgoing pending requests.
 */
exports.friendsRouter.get('/pending', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const incoming = (await pool.query(`SELECT f.id AS request_id, u.id, u.name, u.xp, u.avatar, f.created_at
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.recipient_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`, [req.userId])).rows;
        const outgoing = (await pool.query(`SELECT f.id AS request_id, u.id, u.name, u.xp, u.avatar, f.created_at
       FROM friendships f
       JOIN users u ON u.id = f.recipient_id
       WHERE f.requester_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`, [req.userId])).rows;
        res.json({ incoming, outgoing });
    }
    catch (err) {
        console.error('Friends pending error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/friends/request ────────────────────────────────
 * Body: { targetUserId } OR { targetName }
 */
exports.friendsRouter.post('/request', auth_1.authenticate, async (req, res) => {
    const { targetUserId, targetName } = req.body;
    if (!targetUserId && !targetName) {
        res.status(400).json({ error: 'targetUserId or targetName required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        // Resolve target
        const userRow = targetUserId
            ? await pool.query('SELECT id, name FROM users WHERE id = $1', [targetUserId])
            : await pool.query('SELECT id, name FROM users WHERE LOWER(name) = LOWER($1)', [targetName]);
        const target = userRow.rows[0];
        if (!target) {
            res.status(404).json({ error: 'user_not_found' });
            return;
        }
        if (target.id === req.userId) {
            res.status(400).json({ error: 'cannot_friend_self' });
            return;
        }
        // Check if any row already exists between these two users (either direction)
        const existing = (await pool.query(`SELECT id, requester_id, recipient_id, status FROM friendships
       WHERE (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)`, [req.userId, target.id])).rows[0];
        if (existing) {
            if (existing.status === 'accepted') {
                res.status(400).json({ error: 'already_friends' });
                return;
            }
            if (existing.status === 'pending') {
                // If the OTHER person already requested us, accept it automatically.
                if (existing.recipient_id === req.userId) {
                    await pool.query(`UPDATE friendships SET status = 'accepted', responded_at = NOW() WHERE id = $1`, [existing.id]);
                    const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
                    await notify(existing.requester_id, 'friend_accepted', `${me?.name ?? 'Someone'} accepted your friend request`, null, '/friends', { friendId: req.userId });
                    res.json({ status: 'accepted', requestId: existing.id });
                    return;
                }
                res.status(400).json({ error: 'request_already_pending' });
                return;
            }
            if (existing.status === 'declined') {
                // allow re-request
                await pool.query(`UPDATE friendships SET status = 'pending', requester_id = $1, recipient_id = $2, created_at = NOW(), responded_at = NULL WHERE id = $3`, [req.userId, target.id, existing.id]);
                const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
                await notify(target.id, 'friend_request', `${me?.name ?? 'Someone'} sent you a friend request`, null, '/friends', { requesterId: req.userId });
                res.json({ status: 'pending', requestId: existing.id });
                return;
            }
        }
        // Create fresh
        const inserted = (await pool.query(`INSERT INTO friendships (requester_id, recipient_id) VALUES ($1, $2) RETURNING id`, [req.userId, target.id])).rows[0];
        const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
        await notify(target.id, 'friend_request', `${me?.name ?? 'Someone'} sent you a friend request`, null, '/friends', { requesterId: req.userId });
        res.json({ status: 'pending', requestId: inserted.id });
    }
    catch (err) {
        console.error('Friends request error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/friends/accept ────────────────────────────────
 * Body: { requestId }
 */
exports.friendsRouter.post('/accept', auth_1.authenticate, async (req, res) => {
    const { requestId } = req.body;
    if (typeof requestId !== 'number') {
        res.status(400).json({ error: 'requestId required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const row = (await pool.query(`SELECT requester_id, recipient_id, status FROM friendships WHERE id = $1`, [requestId])).rows[0];
        if (!row || row.recipient_id !== req.userId) {
            res.status(404).json({ error: 'not_found' });
            return;
        }
        if (row.status !== 'pending') {
            res.status(400).json({ error: 'not_pending' });
            return;
        }
        await pool.query(`UPDATE friendships SET status = 'accepted', responded_at = NOW() WHERE id = $1`, [requestId]);
        const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
        await notify(row.requester_id, 'friend_accepted', `${me?.name ?? 'Someone'} accepted your friend request`, null, '/friends', { friendId: req.userId });
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Friends accept error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/friends/decline ────────────────────────────────
 * Body: { requestId }
 */
exports.friendsRouter.post('/decline', auth_1.authenticate, async (req, res) => {
    const { requestId } = req.body;
    if (typeof requestId !== 'number') {
        res.status(400).json({ error: 'requestId required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const row = (await pool.query(`SELECT recipient_id, status FROM friendships WHERE id = $1`, [requestId])).rows[0];
        if (!row || row.recipient_id !== req.userId) {
            res.status(404).json({ error: 'not_found' });
            return;
        }
        if (row.status !== 'pending') {
            res.status(400).json({ error: 'not_pending' });
            return;
        }
        await pool.query(`UPDATE friendships SET status = 'declined', responded_at = NOW() WHERE id = $1`, [requestId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Friends decline error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/friends/cancel ─────────────────────────────────
 * Cancel your own outgoing pending request.
 */
exports.friendsRouter.post('/cancel', auth_1.authenticate, async (req, res) => {
    const { requestId } = req.body;
    if (typeof requestId !== 'number') {
        res.status(400).json({ error: 'requestId required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const row = (await pool.query(`SELECT requester_id, status FROM friendships WHERE id = $1`, [requestId])).rows[0];
        if (!row || row.requester_id !== req.userId) {
            res.status(404).json({ error: 'not_found' });
            return;
        }
        if (row.status !== 'pending') {
            res.status(400).json({ error: 'not_pending' });
            return;
        }
        await pool.query('DELETE FROM friendships WHERE id = $1', [requestId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Friends cancel error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/friends/remove ─────────────────────────────────
 * Unfriend an accepted friend. Body: { friendUserId }
 */
exports.friendsRouter.post('/remove', auth_1.authenticate, async (req, res) => {
    const { friendUserId } = req.body;
    if (typeof friendUserId !== 'number') {
        res.status(400).json({ error: 'friendUserId required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query(`DELETE FROM friendships
       WHERE status = 'accepted'
         AND ((requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1))`, [req.userId, friendUserId]);
        res.json({ ok: true, removed: result.rowCount ?? 0 });
    }
    catch (err) {
        console.error('Friends remove error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── GET /api/friends/preview/:id ──────────────────────────────
 * Lightweight public-ish snapshot of another user for the mini-profile
 * modal. Includes friendship status with the caller + any pending
 * request id so the modal can wire up Accept/Cancel/Add buttons.
 */
exports.friendsRouter.get('/preview/:id', auth_1.authenticate, async (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
        res.status(400).json({ error: 'invalid id' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const userRow = (await pool.query(`SELECT id, name, xp, streak, avatar,
              equipped_hat, equipped_face, equipped_body, is_pro, created_at
       FROM users WHERE id = $1`, [id])).rows[0];
        if (!userRow) {
            res.status(404).json({ error: 'user_not_found' });
            return;
        }
        // Lessons completed (for the small stats row)
        const lessonsRow = (await pool.query(`SELECT COUNT(*)::int AS n FROM progress WHERE user_id = $1`, [id])).rows[0];
        // Friendship status with the caller
        let friendshipStatus = 'none';
        let requestId = null;
        if (id === req.userId) {
            friendshipStatus = 'self';
        }
        else {
            const f = (await pool.query(`SELECT id, requester_id, recipient_id, status FROM friendships
         WHERE (requester_id = $1 AND recipient_id = $2)
            OR (requester_id = $2 AND recipient_id = $1)`, [req.userId, id])).rows[0];
            if (f) {
                requestId = f.id;
                if (f.status === 'accepted')
                    friendshipStatus = 'friends';
                else if (f.status === 'pending') {
                    friendshipStatus = f.requester_id === req.userId ? 'pending_out' : 'pending_in';
                }
            }
        }
        res.json({
            id: userRow.id,
            name: userRow.name,
            avatar: userRow.avatar,
            xp: userRow.xp,
            streak: userRow.streak,
            isPro: userRow.is_pro,
            equippedHat: userRow.equipped_hat,
            equippedFace: userRow.equipped_face,
            equippedBody: userRow.equipped_body,
            lessonsCompleted: lessonsRow?.n ?? 0,
            memberSince: userRow.created_at,
            friendshipStatus,
            requestId,
        });
    }
    catch (err) {
        console.error('Friends preview error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── GET /api/friends/search?q=... ────────────────────────────
 * Up to 10 users with names matching q, excluding self and existing
 * accepted friends. Returns { results: [{id, name, xp, avatar, status}] }
 * where status ∈ 'none' | 'pending_out' | 'pending_in' | 'friends'.
 */
exports.friendsRouter.get('/search', auth_1.authenticate, async (req, res) => {
    const q = req.query.q?.trim();
    if (!q || q.length < 2) {
        res.json({ results: [] });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const rows = (await pool.query(`SELECT u.id, u.name, u.xp, u.avatar,
              f.status AS f_status, f.requester_id, f.recipient_id
       FROM users u
       LEFT JOIN friendships f
         ON ((f.requester_id = $1 AND f.recipient_id = u.id)
          OR (f.recipient_id = $1 AND f.requester_id = u.id))
       WHERE u.id <> $1 AND LOWER(u.name) LIKE LOWER($2)
       ORDER BY u.xp DESC
       LIMIT 10`, [req.userId, `%${q}%`])).rows;
        const results = rows.map((r) => {
            let status = 'none';
            if (r.f_status === 'accepted')
                status = 'friends';
            else if (r.f_status === 'pending')
                status = r.requester_id === req.userId ? 'pending_out' : 'pending_in';
            return { id: r.id, name: r.name, xp: r.xp, avatar: r.avatar, status };
        });
        res.json({ results });
    }
    catch (err) {
        console.error('Friends search error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── Internal helper used by other routes ────────────────────── */
async function detectCrossesAndNotify(userId, userName, oldXp, newXp) {
    if (newXp <= oldXp)
        return 0;
    const pool = (0, db_1.getPool)();
    // Find accepted friends whose xp is strictly between oldXp and (newXp - 1) inclusive.
    // i.e. friend.xp >= oldXp AND friend.xp < newXp → user just crossed them.
    // Strict: friend was at or above us, now we're above them.
    // To avoid notifying when we were already ahead, require friend.xp >= oldXp.
    const crossed = (await pool.query(`SELECT u.id, u.name, u.xp FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
     WHERE f.status = 'accepted'
       AND (f.requester_id = $1 OR f.recipient_id = $1)
       AND u.xp >= $2 AND u.xp < $3`, [userId, oldXp, newXp])).rows;
    for (const c of crossed) {
        // Notify the friend that they just got overtaken.
        await pool.query(`INSERT INTO notifications (user_id, type, title, body, link, metadata)
       VALUES ($1, 'friend_overtook', $2, $3, '/league', $4)`, [
            c.id,
            `${userName} just overtook you in XP`,
            `They jumped from ${oldXp.toLocaleString()} to ${newXp.toLocaleString()} XP. Time to fight back!`,
            JSON.stringify({ overtakerId: userId, overtakerXp: newXp, yourXp: c.xp }),
        ]);
    }
    return crossed.length;
}
