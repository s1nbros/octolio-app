"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FREEZE_MAX_STOCK = exports.FREEZE_COST_XP = exports.freezeRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.freezeRouter = (0, express_1.Router)();
exports.FREEZE_COST_XP = 100;
exports.FREEZE_MAX_STOCK = 3;
/**
 * POST /api/freeze/buy
 * Spend FREEZE_COST_XP to gain 1 streak freeze. Capped at FREEZE_MAX_STOCK.
 */
exports.freezeRouter.post('/buy', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const row = await pool.query('SELECT xp, streak_freezes FROM users WHERE id = $1', [req.userId]);
        const user = row.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.streak_freezes >= exports.FREEZE_MAX_STOCK) {
            res.status(400).json({ error: 'max_freezes', message: `Max ${exports.FREEZE_MAX_STOCK} freezes` });
            return;
        }
        if (user.xp < exports.FREEZE_COST_XP) {
            res.status(402).json({
                error: 'insufficient_xp',
                required: exports.FREEZE_COST_XP,
                have: user.xp,
            });
            return;
        }
        const newXp = user.xp - exports.FREEZE_COST_XP;
        const newFreezes = user.streak_freezes + 1;
        await pool.query('UPDATE users SET xp = $1, streak_freezes = $2 WHERE id = $3', [newXp, newFreezes, req.userId]);
        res.json({
            xp: newXp,
            streak_freezes: newFreezes,
            cost: exports.FREEZE_COST_XP,
        });
    }
    catch (err) {
        console.error('Freeze buy error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * GET /api/freeze/info
 * Return shop info: cost, max stock, current stock, current XP.
 */
exports.freezeRouter.get('/info', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const row = await pool.query('SELECT xp, streak_freezes FROM users WHERE id = $1', [req.userId]);
        const user = row.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        res.json({
            cost: exports.FREEZE_COST_XP,
            max: exports.FREEZE_MAX_STOCK,
            stock: user.streak_freezes,
            xp: user.xp,
            can_afford: user.xp >= exports.FREEZE_COST_XP && user.streak_freezes < exports.FREEZE_MAX_STOCK,
        });
    }
    catch (err) {
        console.error('Freeze info error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
