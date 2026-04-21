"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
        res.status(400).json({ error: 'Name, email, and password are required' });
        return;
    }
    if (/\s/.test(name)) {
        res.status(400).json({ error: 'Username cannot contain spaces' });
        return;
    }
    if (name.trim().length < 2) {
        res.status(400).json({ error: 'Username must be at least 2 characters' });
        return;
    }
    if (password.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    if (!/[A-Z]/.test(password)) {
        res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ error: 'Invalid email address' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
        if (existing.rows.length > 0) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const today = new Date().toISOString().split('T')[0];
        const result = await pool.query('INSERT INTO users (name, email, password_hash, xp, streak, last_active) VALUES ($1, $2, $3, 0, 1, $4) RETURNING id', [name.trim(), email.toLowerCase(), passwordHash, today]);
        const userId = result.rows[0].id;
        const token = (0, auth_1.signToken)(userId);
        res.status(201).json({
            token,
            user: { id: userId, name: name.trim(), email: email.toLowerCase(), xp: 0, streak: 1, avatar: '🦊' },
        });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/login', async (req, res) => {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
        res.status(400).json({ error: 'Email and password are required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
        const user = result.rows[0];
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
        if (!valid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        let newStreak = user.streak;
        if (user.last_active === today) {
            // already active today
        }
        else if (user.last_active === yesterday) {
            newStreak += 1;
        }
        else {
            newStreak = 1;
        }
        await pool.query('UPDATE users SET streak = $1, last_active = $2 WHERE id = $3', [newStreak, today, user.id]);
        const token = (0, auth_1.signToken)(user.id, !!rememberMe);
        res.json({
            token,
            rememberMe: !!rememberMe,
            user: { id: user.id, name: user.name, email: user.email, xp: user.xp, streak: newStreak },
        });
    }
    catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT id, name, email, xp, streak, last_active, created_at, avatar FROM users WHERE id = $1', [req.userId]);
        const user = result.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({ user });
    }
    catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.get('/check-name', auth_1.authenticate, async (req, res) => {
    const name = req.query.name?.trim();
    if (!name || name.length < 2) {
        res.json({ available: false });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2', [name, req.userId]);
        res.json({ available: result.rows.length === 0 });
    }
    catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.patch('/profile', auth_1.authenticate, async (req, res) => {
    const { name, avatar } = req.body;
    if (!name && !avatar) {
        res.status(400).json({ error: 'Nothing to update' });
        return;
    }
    if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
        res.status(400).json({ error: 'Name must be at least 2 characters' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        if (name) {
            const taken = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2', [name.trim(), req.userId]);
            if (taken.rows.length > 0) {
                res.status(409).json({ error: 'Name already taken' });
                return;
            }
        }
        const fields = [];
        const values = [];
        let idx = 1;
        if (name) {
            fields.push(`name = $${idx++}`);
            values.push(name.trim());
        }
        if (avatar) {
            fields.push(`avatar = $${idx++}`);
            values.push(avatar);
        }
        values.push(req.userId);
        const result = await pool.query(`UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, xp, streak, avatar`, values);
        res.json({ user: result.rows[0] });
    }
    catch (err) {
        console.error('Profile update error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* League — top 10 users by XP, current user always included */
exports.authRouter.get('/league', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT id, name, xp, avatar FROM users ORDER BY xp DESC LIMIT 10');
        const leaderboard = result.rows.map((row, i) => ({
            rank: i + 1,
            id: row.id,
            name: row.name,
            xp: row.xp,
            avatar: row.avatar ?? null,
            isYou: row.id === req.userId,
        }));
        // If current user not in top 10, append their row with real rank
        const inTop = leaderboard.some((r) => r.isYou);
        if (!inTop) {
            const me = await pool.query('SELECT id, name, xp, avatar FROM users WHERE id = $1', [req.userId]);
            const rankRow = await pool.query('SELECT COUNT(*) FROM users WHERE xp > $1', [me.rows[0].xp]);
            leaderboard.push({
                rank: parseInt(rankRow.rows[0].count, 10) + 1,
                id: me.rows[0].id,
                name: me.rows[0].name,
                xp: me.rows[0].xp,
                avatar: me.rows[0].avatar ?? null,
                isYou: true,
            });
        }
        res.json({ leaderboard });
    }
    catch (err) {
        console.error('League error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.patch('/password', auth_1.authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
        res.status(400).json({ error: 'Current and new password are required' });
        return;
    }
    if (newPassword.length < 8) {
        res.status(400).json({ error: 'New password must be at least 8 characters' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
        const user = result.rows[0];
        const valid = await bcryptjs_1.default.compare(currentPassword, user.password_hash);
        if (!valid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }
        const newHash = await bcryptjs_1.default.hash(newPassword, 12);
        await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Password change error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
