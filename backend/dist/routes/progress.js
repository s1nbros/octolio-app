"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.progressRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const lessons_1 = require("../data/lessons");
const friends_1 = require("./friends");
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
/* POST /api/progress/energy/use — deduct energy for interactive exercises in a lesson */
exports.progressRouter.post('/energy/use', auth_1.authenticate, async (req, res) => {
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
    // Every lesson costs exactly 3 energy
    const cost = 3;
    try {
        const pool = (0, db_1.getPool)();
        const userResult = await pool.query('SELECT is_pro, energy, energy_refill_at FROM users WHERE id = $1', [req.userId]);
        const user = userResult.rows[0];
        // Pro users have unlimited energy — skip all deduction
        if (user.is_pro) {
            res.json({ energy: user.energy, cost: 0, unlimited: true });
            return;
        }
        // Apply incremental refill (+1 per 15 minutes) before deducting
        let currentEnergy = user.energy;
        let refillAt = user.energy_refill_at;
        if (currentEnergy < 12 && refillAt) {
            const REFILL_INTERVAL_MS = 15 * 60 * 1000;
            const refillAtMs = new Date(refillAt).getTime();
            const intervals = Math.floor((Date.now() - refillAtMs) / REFILL_INTERVAL_MS);
            if (intervals > 0) {
                const toAdd = Math.min(intervals, 12 - currentEnergy);
                currentEnergy += toAdd;
                refillAt = currentEnergy >= 12
                    ? null
                    : new Date(refillAtMs + toAdd * REFILL_INTERVAL_MS).toISOString();
            }
        }
        if (currentEnergy < cost) {
            res.status(402).json({
                error: 'no_energy',
                energy: currentEnergy,
                cost,
                refillAt: refillAt ?? null,
            });
            return;
        }
        const newEnergy = currentEnergy - cost;
        // Start refill timer from NOW when energy first drops below max
        const newRefillAt = (!refillAt && newEnergy < 12)
            ? new Date().toISOString()
            : refillAt;
        await pool.query('UPDATE users SET energy = $1, energy_refill_at = $2 WHERE id = $3', [newEnergy, newRefillAt, req.userId]);
        res.json({ energy: newEnergy, cost, refillAt: newRefillAt });
    }
    catch (err) {
        console.error('Energy use error:', err);
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
        const userResult = await pool.query('SELECT xp, streak, last_active, streak_freezes, name FROM users WHERE id = $1', [req.userId]);
        const currentUser = userResult.rows[0];
        // Calendar-day diff between today and last_active.
        // 0 = same day (no streak change). 1 = yesterday (+1). >1 = needs freezes or reset.
        let daysSince = Infinity;
        if (currentUser.last_active) {
            const lastDate = new Date(currentUser.last_active + 'T00:00:00');
            const todayDate = new Date(today + 'T00:00:00');
            daysSince = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
        }
        let newStreak = currentUser.streak;
        let newFreezes = currentUser.streak_freezes ?? 0;
        let freezesUsed = 0;
        if (daysSince === 0) {
            // already practiced today — no change
        }
        else if (daysSince === 1) {
            newStreak = newStreak + 1;
        }
        else if (daysSince > 1) {
            // Missed (daysSince - 1) days. Spend that many freezes to keep the streak alive.
            const missed = daysSince - 1;
            if (newFreezes >= missed) {
                newFreezes -= missed;
                freezesUsed = missed;
                newStreak = newStreak + 1;
            }
            else {
                newStreak = 1;
            }
        }
        else {
            // No prior activity — first lesson ever
            newStreak = 1;
        }
        const newXp = currentUser.xp + xpEarned;
        await pool.query('INSERT INTO progress (user_id, lesson_id, module_id, xp_earned) VALUES ($1, $2, $3, $4)', [req.userId, lessonId, moduleId, xpEarned]);
        await pool.query('UPDATE users SET xp = $1, streak = $2, last_active = $3, streak_freezes = $4 WHERE id = $5', [newXp, newStreak, today, newFreezes, req.userId]);
        // Fire-and-forget: notify friends we just overtook in XP.
        (0, friends_1.detectCrossesAndNotify)(req.userId, currentUser.name, currentUser.xp, newXp)
            .catch((e) => console.error('cross-XP notify failed:', e));
        res.json({
            alreadyCompleted: false,
            xpEarned,
            totalXp: newXp,
            streak: newStreak,
            streak_freezes: newFreezes,
            freezesUsed,
        });
    }
    catch (err) {
        console.error('Progress complete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
