"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chestsRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const catalog_1 = require("../data/catalog");
exports.chestsRouter = (0, express_1.Router)();
/* ─── GET /api/chests/info ─────────────────────────────────────
 * { available, opened, earned, nextChestInLessons, recentOpens[] }
 */
exports.chestsRouter.get('/info', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const stats = (await pool.query(`SELECT (SELECT COUNT(*) FROM progress WHERE user_id = $1) AS completed_lessons,
              (SELECT chests_opened FROM users WHERE id = $1) AS chests_opened`, [req.userId])).rows[0];
        const completed = Number(stats?.completed_lessons ?? 0);
        const opened = Number(stats?.chests_opened ?? 0);
        const earned = Math.floor(completed / catalog_1.LESSONS_PER_CHEST);
        const available = Math.max(0, earned - opened);
        const nextInLessons = catalog_1.LESSONS_PER_CHEST - (completed % catalog_1.LESSONS_PER_CHEST);
        const recent = (await pool.query(`SELECT reward_type, reward_value, coins_delta, xp_delta, opened_at
       FROM chest_opens
       WHERE user_id = $1
       ORDER BY opened_at DESC
       LIMIT 5`, [req.userId])).rows;
        res.json({
            available,
            opened,
            earned,
            completedLessons: completed,
            nextChestInLessons: available > 0 ? 0 : nextInLessons,
            recentOpens: recent,
        });
    }
    catch (err) {
        console.error('Chests info error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/chests/open ────────────────────────────────────
 * Atomically draws a reward, persists it, returns it.
 */
exports.chestsRouter.post('/open', auth_1.authenticate, async (req, res) => {
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const userRow = (await client.query(`SELECT xp, coins, chests_opened, streak_freezes, energy, is_pro
       FROM users WHERE id = $1 FOR UPDATE`, [req.userId])).rows[0];
        const completed = Number((await client.query(`SELECT COUNT(*)::int AS n FROM progress WHERE user_id = $1`, [req.userId])).rows[0]?.n ?? 0);
        const earned = Math.floor(completed / catalog_1.LESSONS_PER_CHEST);
        const available = earned - (userRow?.chests_opened ?? 0);
        if (available <= 0) {
            await client.query('ROLLBACK');
            res.status(400).json({
                error: 'no_chest',
                message: `Complete ${catalog_1.LESSONS_PER_CHEST - (completed % catalog_1.LESSONS_PER_CHEST)} more lessons to earn a chest.`,
            });
            return;
        }
        // Get owned items so cosmetic draw skips duplicates
        const owned = new Set((await client.query(`SELECT item_id FROM user_inventory WHERE user_id = $1`, [req.userId])).rows.map((r) => r.item_id));
        const reward = (0, catalog_1.drawReward)(owned);
        // Apply reward
        let coinsDelta = 0;
        let xpDelta = 0;
        let rewardValue = '';
        if (reward.type === 'coins') {
            coinsDelta = reward.amount;
            rewardValue = String(reward.amount);
        }
        else if (reward.type === 'xp') {
            xpDelta = reward.amount;
            rewardValue = String(reward.amount);
        }
        else if (reward.type === 'freeze') {
            await client.query(`UPDATE users SET streak_freezes = LEAST(streak_freezes + $1, 3) WHERE id = $2`, [reward.amount, req.userId]);
            rewardValue = String(reward.amount);
        }
        else if (reward.type === 'energy') {
            // bump energy, capped at 12 (no-op for Pro users since they're unlimited)
            await client.query(`UPDATE users SET energy = LEAST(energy + $1, 12) WHERE id = $2`, [reward.amount, req.userId]);
            rewardValue = String(reward.amount);
        }
        else if (reward.type === 'item') {
            await client.query(`INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)
         ON CONFLICT (user_id, item_id) DO NOTHING`, [req.userId, reward.itemId]);
            rewardValue = reward.itemId;
        }
        // Apply coins/xp + bump opened counter
        await client.query(`UPDATE users SET coins = coins + $1, xp = xp + $2, chests_opened = chests_opened + 1 WHERE id = $3`, [coinsDelta, xpDelta, req.userId]);
        await client.query(`INSERT INTO chest_opens (user_id, reward_type, reward_value, coins_delta, xp_delta)
       VALUES ($1, $2, $3, $4, $5)`, [req.userId, reward.type, rewardValue, coinsDelta, xpDelta]);
        await client.query('COMMIT');
        // Optional: include item details if it's a cosmetic so the client can render it.
        let item = null;
        if (reward.type === 'item') {
            const it = (0, catalog_1.getCatalogItem)(reward.itemId);
            if (it)
                item = { id: it.id, name: it.name, emoji: it.emoji, rarity: it.rarity, slot: it.slot };
        }
        res.json({
            reward,
            item,
            coinsDelta,
            xpDelta,
            availableChestsRemaining: available - 1,
        });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Chest open error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
