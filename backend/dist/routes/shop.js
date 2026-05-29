"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shopRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const catalog_1 = require("../data/catalog");
exports.shopRouter = (0, express_1.Router)();
/* ─── GET /api/shop/catalog ────────────────────────────────────
 * Returns the full catalog enriched with the user's ownership.
 */
exports.shopRouter.get('/catalog', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const owned = new Set((await pool.query(`SELECT item_id FROM user_inventory WHERE user_id = $1`, [req.userId])).rows.map((r) => r.item_id));
        const user = (await pool.query('SELECT coins, equipped_costume FROM users WHERE id = $1', [req.userId])).rows[0];
        const items = catalog_1.CATALOG.map((c) => ({
            ...c,
            owned: owned.has(c.id),
            equipped: user?.equipped_costume === c.id,
        }));
        res.json({
            coins: user?.coins ?? 0,
            equippedCostume: user?.equipped_costume ?? null,
            items,
        });
    }
    catch (err) {
        console.error('Shop catalog error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/shop/buy ───────────────────────────────────────
 * Body: { itemId }
 */
exports.shopRouter.post('/buy', auth_1.authenticate, async (req, res) => {
    const { itemId } = req.body;
    if (!itemId) {
        res.status(400).json({ error: 'itemId required' });
        return;
    }
    const item = (0, catalog_1.getCatalogItem)(itemId);
    if (!item) {
        res.status(404).json({ error: 'item_not_found' });
        return;
    }
    if (item.price <= 0) {
        res.status(400).json({ error: 'item_not_for_sale' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const user = (await client.query('SELECT coins FROM users WHERE id = $1 FOR UPDATE', [req.userId])).rows[0];
        if (!user) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.coins < item.price) {
            await client.query('ROLLBACK');
            res.status(402).json({
                error: 'insufficient_coins',
                required: item.price,
                have: user.coins,
            });
            return;
        }
        // Already owns?
        const owns = (await client.query('SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2', [req.userId, itemId])).rows.length > 0;
        if (owns) {
            await client.query('ROLLBACK');
            res.status(400).json({ error: 'already_owned' });
            return;
        }
        await client.query('UPDATE users SET coins = coins - $1 WHERE id = $2', [item.price, req.userId]);
        await client.query('INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)', [req.userId, itemId]);
        await client.query('COMMIT');
        res.json({ ok: true, coins: user.coins - item.price });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Shop buy error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
/* ─── POST /api/shop/equip ─────────────────────────────────────
 * Body: { itemId | null }   (null = unequip)
 */
exports.shopRouter.post('/equip', auth_1.authenticate, async (req, res) => {
    const { itemId } = req.body;
    try {
        const pool = (0, db_1.getPool)();
        if (itemId === null || itemId === undefined) {
            await pool.query('UPDATE users SET equipped_costume = NULL WHERE id = $1', [req.userId]);
            res.json({ ok: true, equippedCostume: null });
            return;
        }
        const item = (0, catalog_1.getCatalogItem)(itemId);
        if (!item) {
            res.status(404).json({ error: 'item_not_found' });
            return;
        }
        const owns = (await pool.query('SELECT 1 FROM user_inventory WHERE user_id = $1 AND item_id = $2', [req.userId, itemId])).rows.length > 0;
        if (!owns) {
            res.status(403).json({ error: 'not_owned' });
            return;
        }
        await pool.query('UPDATE users SET equipped_costume = $1 WHERE id = $2', [itemId, req.userId]);
        res.json({ ok: true, equippedCostume: itemId });
    }
    catch (err) {
        console.error('Shop equip error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/shop/exchange ──────────────────────────────────
 * Exchange XP → coins. Body: { xpAmount }
 */
exports.shopRouter.post('/exchange', auth_1.authenticate, async (req, res) => {
    const { xpAmount } = req.body;
    if (typeof xpAmount !== 'number' || xpAmount < catalog_1.MIN_XP_EXCHANGE) {
        res.status(400).json({ error: 'invalid_amount', minXp: catalog_1.MIN_XP_EXCHANGE });
        return;
    }
    const xpRounded = Math.floor(xpAmount);
    const coinsGained = Math.floor(xpRounded / catalog_1.XP_PER_COIN_EXCHANGE_RATE);
    if (coinsGained <= 0) {
        res.status(400).json({ error: 'invalid_amount' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const user = (await client.query('SELECT xp, coins FROM users WHERE id = $1 FOR UPDATE', [req.userId])).rows[0];
        if (!user) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (user.xp < xpRounded) {
            await client.query('ROLLBACK');
            res.status(402).json({ error: 'insufficient_xp', have: user.xp, required: xpRounded });
            return;
        }
        await client.query('UPDATE users SET xp = xp - $1, coins = coins + $2 WHERE id = $3', [xpRounded, coinsGained, req.userId]);
        await client.query('COMMIT');
        res.json({
            ok: true,
            xp: user.xp - xpRounded,
            coins: user.coins + coinsGained,
            coinsGained,
        });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Shop exchange error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
/* ─── GET /api/shop/inventory ──────────────────────────────────
 * Returns owned items (joined with catalog).
 */
exports.shopRouter.get('/inventory', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const owned = (await pool.query(`SELECT item_id, acquired_at FROM user_inventory WHERE user_id = $1 ORDER BY acquired_at DESC`, [req.userId])).rows;
        const items = owned
            .map((r) => {
            const it = (0, catalog_1.getCatalogItem)(r.item_id);
            return it ? { ...it, acquired_at: r.acquired_at } : null;
        })
            .filter((x) => x !== null);
        const user = (await pool.query('SELECT equipped_costume FROM users WHERE id = $1', [req.userId])).rows[0];
        res.json({ items, equippedCostume: user?.equipped_costume ?? null });
    }
    catch (err) {
        console.error('Shop inventory error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
