"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const lessons_1 = require("../data/lessons");
exports.progressRouter = (0, express_1.Router)();
exports.progressRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const progressResult = await pool.query('SELECT lesson_id, module_id, xp_earned, completed_at FROM progress WHERE user_id = $1 ORDER BY completed_at DESC', [req.userId]);
        const userResult = await pool.query('SELECT xp, streak FROM users WHERE id = $1', [req.userId]);
        const user = userResult.rows[0];
        res.json({ progress: progressResult.rows, xp: user?.xp ?? 0, streak: user?.streak ?? 0 });
    }
    catch (err) {
        console.error('Progress get error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.progressRouter.post('/complete', auth_1.authenticate, async (req, res) => {
    const { lessonId, moduleId } = req.body;
    if (!lessonId || !moduleId) {
        res.status(400).json({ error: 'lessonId and moduleId are required' });
        return;
    }
    const mod = lessons_1.modules.find((m) => m.id === moduleId);
    const lesson = mod?.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const existing = await pool.query('SELECT id FROM progress WHERE user_id = $1 AND lesson_id = $2', [req.userId, lessonId]);
        if (existing.rows.length > 0) {
            const userResult = await pool.query('SELECT xp, streak FROM users WHERE id = $1', [req.userId]);
            const user = userResult.rows[0];
            res.json({ alreadyCompleted: true, xpEarned: 0, totalXp: user.xp, streak: user.streak });
            return;
        }
        const xpEarned = lesson.xpReward;
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
        const userResult = await pool.query('SELECT xp, streak, last_active FROM users WHERE id = $1', [req.userId]);
        const currentUser = userResult.rows[0];
        let newStreak = currentUser.streak;
        if (currentUser.last_active !== today) {
            newStreak = currentUser.last_active === yesterday ? newStreak + 1 : 1;
        }
        const newXp = currentUser.xp + xpEarned;
        await pool.query('INSERT INTO progress (user_id, lesson_id, module_id, xp_earned) VALUES ($1, $2, $3, $4)', [req.userId, lessonId, moduleId, xpEarned]);
        await pool.query('UPDATE users SET xp = $1, streak = $2, last_active = $3 WHERE id = $4', [newXp, newStreak, today, req.userId]);
        res.json({ alreadyCompleted: false, xpEarned, totalXp: newXp, streak: newStreak });
    }
    catch (err) {
        console.error('Progress complete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
