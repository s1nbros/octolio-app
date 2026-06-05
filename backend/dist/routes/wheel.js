"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PRO_TRIAL_DAYS = exports.CUP_TOTAL_SUPPLY = exports.wheelRouter = void 0;
// ───────────────────────────────────────────────────────────────
// Wheel of Luck — one spin per account, ever.
// All prize logic lives server-side; the frontend only animates.
// ───────────────────────────────────────────────────────────────
const express_1 = require("express");
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const catalog_1 = require("../data/catalog");
exports.wheelRouter = (0, express_1.Router)();
/** Maximum number of physical Octolio cups that can ever be awarded across all users. */
exports.CUP_TOTAL_SUPPLY = 3;
/** Length of the Pro trial granted by the wheel. */
exports.PRO_TRIAL_DAYS = 14;
/**
 * Slot order on the visual wheel (clockwise). Frontend renders these in this
 * order, the backend returns the matching `slotIndex` so the wheel animates
 * to the correct slice.
 *
 * Weights are tuned so the user has a high chance of a small-to-medium win,
 * a small chance of a rare prize, and a tiny chance of the legendary cup
 * (which is also globally capped at CUP_TOTAL_SUPPLY).
 *   25 XP   →  22.0%
 *   50 XP   →  18.0%
 *  100 XP   →  15.0%
 *  200 XP   →  13.0%
 *  500 XP   →  10.0%
 * 1000 XP   →   7.0%
 *  Common cosmetic →  8.0%
 *  Rare cosmetic   →  4.0%
 *  Pro trial (14d) →  2.5%
 *  Octolio cup     →  0.5%  (then falls back to 1000 XP after global cap)
 */
const SLOTS = [
    { id: 'xp_25', weight: 220, type: 'xp', value: 25 },
    { id: 'cosmetic_common', weight: 80, type: 'cosmetic', value: 'common' },
    { id: 'xp_100', weight: 150, type: 'xp', value: 100 },
    { id: 'pro_trial', weight: 25, type: 'pro_trial' },
    { id: 'xp_50', weight: 180, type: 'xp', value: 50 },
    { id: 'xp_500', weight: 100, type: 'xp', value: 500 },
    { id: 'cosmetic_rare', weight: 40, type: 'cosmetic', value: 'rare' },
    { id: 'xp_200', weight: 130, type: 'xp', value: 200 },
    { id: 'cup', weight: 5, type: 'cup' },
    { id: 'xp_1000', weight: 70, type: 'xp', value: 1000 },
];
/** Pretty labels + emojis for the UI to render. */
const SLOT_LABELS = {
    xp_25: { en: '25 XP', bg: '25 XP', emoji: '✨' },
    xp_50: { en: '50 XP', bg: '50 XP', emoji: '⭐' },
    xp_100: { en: '100 XP', bg: '100 XP', emoji: '💫' },
    xp_200: { en: '200 XP', bg: '200 XP', emoji: '🌟' },
    xp_500: { en: '500 XP', bg: '500 XP', emoji: '💥' },
    xp_1000: { en: '1000 XP', bg: '1000 XP', emoji: '🎆' },
    cosmetic_common: { en: 'Cosmetic', bg: 'Козметика', emoji: '🎁' },
    cosmetic_rare: { en: 'Rare Item', bg: 'Рядък предмет', emoji: '💎' },
    pro_trial: { en: '14d PRO', bg: '14д PRO', emoji: '👑' },
    cup: { en: 'Octolio Cup', bg: 'Чаша Octolio', emoji: '🏆' },
};
/**
 * Weighted draw. Uses Node's crypto RNG so the result is uniform and
 * unguessable by a tampered client.
 */
function drawSlotIndex() {
    const total = SLOTS.reduce((s, slot) => s + slot.weight, 0);
    // Random integer in [0, total).
    const r = crypto_1.default.randomInt(0, total);
    let acc = 0;
    for (let i = 0; i < SLOTS.length; i++) {
        acc += SLOTS[i].weight;
        if (r < acc)
            return i;
    }
    return SLOTS.length - 1; // unreachable, but TS-safe
}
/** Pick a random cosmetic of the requested rarity that the user does NOT already own. */
async function pickRandomCosmetic(userId, rarity) {
    const pool = (0, db_1.getPool)();
    const owned = await pool.query('SELECT item_id FROM user_inventory WHERE user_id = $1', [userId]);
    const ownedSet = new Set(owned.rows.map(r => r.item_id));
    const candidates = catalog_1.CATALOG.filter(c => c.rarity === rarity && !ownedSet.has(c.id));
    if (candidates.length === 0) {
        // Fallback to any rarity they don't own.
        const allUnowned = catalog_1.CATALOG.filter(c => !ownedSet.has(c.id));
        if (allUnowned.length === 0)
            return null;
        return allUnowned[crypto_1.default.randomInt(0, allUnowned.length)].id;
    }
    return candidates[crypto_1.default.randomInt(0, candidates.length)].id;
}
/* ─────────────────────────────────────────────────────────────
 * GET /api/wheel/info
 * Returns whether the user is eligible to spin, and the slot list
 * the frontend should render (with localized labels).
 * ───────────────────────────────────────────────────────────── */
exports.wheelRouter.get('/info', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const r = await pool.query('SELECT wheel_spun FROM users WHERE id = $1', [req.userId]);
        const canSpin = !r.rows[0]?.wheel_spun;
        // Strip weights from the public payload — client doesn't need them and
        // exposing them would let cheaters predict odds.
        const slots = SLOTS.map(s => ({
            id: s.id,
            type: s.type,
            label: SLOT_LABELS[s.id],
        }));
        res.json({ canSpin, slots, cupSupplyTotal: exports.CUP_TOTAL_SUPPLY });
    }
    catch (err) {
        console.error('Wheel info error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─────────────────────────────────────────────────────────────
 * POST /api/wheel/spin
 * Single-shot. Transactional. Server picks the prize, applies it,
 * marks the user as spun, returns the slot index for animation.
 * ───────────────────────────────────────────────────────────── */
exports.wheelRouter.post('/spin', auth_1.authenticate, async (req, res) => {
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        // Lock the user row for the duration of the spin.
        const u = await client.query('SELECT wheel_spun, xp FROM users WHERE id = $1 FOR UPDATE', [req.userId]);
        if (!u.rows[0]) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'User not found' });
            return;
        }
        if (u.rows[0].wheel_spun) {
            await client.query('ROLLBACK');
            res.status(409).json({ error: 'You already spun the wheel.', alreadySpun: true });
            return;
        }
        let slotIndex = drawSlotIndex();
        let slot = SLOTS[slotIndex];
        // ── Cup global supply check ──
        // If the draw landed on the cup but global supply is exhausted, swap to
        // the next-best prize (1000 XP) so the user still gets something nice.
        if (slot.id === 'cup') {
            const cupCount = await client.query("SELECT COUNT(*)::text AS count FROM wheel_prizes WHERE reward_type = 'cup'");
            const taken = parseInt(cupCount.rows[0].count, 10);
            if (taken >= exports.CUP_TOTAL_SUPPLY) {
                // Find the xp_1000 slot to swap to.
                const xp1000Index = SLOTS.findIndex(s => s.id === 'xp_1000');
                slotIndex = xp1000Index;
                slot = SLOTS[xp1000Index];
            }
        }
        // ── Apply the reward ──
        const reward = { slotId: slot.id, type: slot.type };
        if (slot.type === 'xp') {
            const amount = slot.value;
            await client.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [amount, req.userId]);
            reward.xpDelta = amount;
            await client.query(`INSERT INTO wheel_prizes (user_id, reward_type, reward_value) VALUES ($1, 'xp', $2)`, [req.userId, String(amount)]);
        }
        else if (slot.type === 'cosmetic') {
            const rarity = slot.value;
            const itemId = await pickRandomCosmetic(req.userId, rarity);
            if (itemId) {
                await client.query(`INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)
           ON CONFLICT (user_id, item_id) DO NOTHING`, [req.userId, itemId]);
                reward.cosmeticId = itemId;
                await client.query(`INSERT INTO wheel_prizes (user_id, reward_type, reward_value) VALUES ($1, 'cosmetic', $2)`, [req.userId, itemId]);
            }
            else {
                // User owns every cosmetic already — give them 500 XP instead.
                await client.query('UPDATE users SET xp = xp + 500 WHERE id = $1', [req.userId]);
                reward.type = 'xp';
                reward.xpDelta = 500;
                await client.query(`INSERT INTO wheel_prizes (user_id, reward_type, reward_value) VALUES ($1, 'xp', '500')`, [req.userId]);
            }
        }
        else if (slot.type === 'pro_trial') {
            // Grant Pro immediately + record the trial end. Lazy downgrade in /me.
            await client.query(`UPDATE users SET is_pro = TRUE,
                          pro_trial_ends_at = NOW() + INTERVAL '${exports.PRO_TRIAL_DAYS} days'
         WHERE id = $1`, [req.userId]);
            const endRow = await client.query('SELECT pro_trial_ends_at FROM users WHERE id = $1', [req.userId]);
            reward.proTrialEndsAt = endRow.rows[0].pro_trial_ends_at;
            await client.query(`INSERT INTO wheel_prizes (user_id, reward_type, reward_value)
         VALUES ($1, 'pro_trial', $2)`, [req.userId, `${exports.PRO_TRIAL_DAYS}d`]);
        }
        else if (slot.type === 'cup') {
            // No automatic action — we ship manually. The audit row is the source
            // of truth: queries against wheel_prizes(reward_type='cup') give us the
            // winners list (join with users for name/email).
            reward.isCup = true;
            await client.query(`INSERT INTO wheel_prizes (user_id, reward_type, reward_value)
         VALUES ($1, 'cup', 'cup')`, [req.userId]);
        }
        // Mark user as spun — never again.
        await client.query('UPDATE users SET wheel_spun = TRUE WHERE id = $1', [req.userId]);
        await client.query('COMMIT');
        res.json({
            slotIndex,
            slot: { id: slot.id, type: slot.type, label: SLOT_LABELS[slot.id] },
            reward,
        });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Wheel spin error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
