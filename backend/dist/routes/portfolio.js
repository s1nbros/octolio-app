"use strict";
// ───────────────────────────────────────────────────────────────
// portfolio.ts — virtual portfolio simulator.
//
// Every user gets a €10,000 play-money account to practice investing on a
// SIMULATED market — no external price feed, no cost, works offline. Prices
// are computed deterministically from the asset catalog + the calendar day, so
// every user sees the same price on the same day and prices drift day-to-day.
// Nothing about prices is stored; holdings + a trade log live in Postgres.
// ───────────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.ASSETS = exports.STARTING_CASH = exports.portfolioRouter = void 0;
exports.dayNumber = dayNumber;
exports.priceOn = priceOn;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.portfolioRouter = (0, express_1.Router)();
exports.STARTING_CASH = 10000;
// Reference day the trend is measured from (a recent-ish absolute unix day).
const BASE_DAY = 20200;
const DAY_MS = 86400000;
exports.ASSETS = [
    { id: 'atlas', symbol: 'ATLS', name: 'Atlas Tech', emoji: '💻', category: 'stock', base: 180, drift: 0.14, vol: 0.10, period: 34, phase: 0.0 },
    { id: 'nimbus', symbol: 'NMBS', name: 'Nimbus Cloud', emoji: '☁️', category: 'stock', base: 96, drift: 0.11, vol: 0.13, period: 21, phase: 1.1 },
    { id: 'verde', symbol: 'VRDE', name: 'Verde Energy', emoji: '🔋', category: 'stock', base: 48, drift: 0.08, vol: 0.16, period: 27, phase: 2.4 },
    { id: 'orion', symbol: 'ORN', name: 'Orion Motors', emoji: '🚗', category: 'stock', base: 62, drift: 0.05, vol: 0.18, period: 18, phase: 3.7 },
    { id: 'world', symbol: 'WRLD', name: 'World Index ETF', emoji: '🌍', category: 'etf', base: 320, drift: 0.09, vol: 0.05, period: 40, phase: 0.6 },
    { id: 'divs', symbol: 'DIVS', name: 'Dividend ETF', emoji: '💵', category: 'etf', base: 140, drift: 0.06, vol: 0.04, period: 46, phase: 1.9 },
    { id: 'bond', symbol: 'BND', name: 'Govt Bond ETF', emoji: '🏦', category: 'bond', base: 100, drift: 0.03, vol: 0.02, period: 60, phase: 0.3 },
    { id: 'gold', symbol: 'GOLD', name: 'Gold', emoji: '🥇', category: 'commodity', base: 210, drift: 0.05, vol: 0.07, period: 33, phase: 2.0 },
    { id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin', emoji: '₿', category: 'crypto', base: 340, drift: 0.20, vol: 0.28, period: 15, phase: 4.2 },
    { id: 'nova', symbol: 'NOVA', name: 'Nova Coin', emoji: '🪙', category: 'crypto', base: 12, drift: 0.10, vol: 0.40, period: 11, phase: 5.5 },
];
const ASSET_BY_ID = new Map(exports.ASSETS.map((a) => [a.id, a]));
/** Deterministic pseudo-random in [0,1) from a string (FNV-1a). */
function hash01(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return (h >>> 0) / 4294967296;
}
/** Today's absolute unix day number (UTC). */
function dayNumber() {
    return Math.floor(Date.now() / DAY_MS);
}
/** Price of an asset on a given absolute day — trend + smooth wave + small daily jitter. */
function priceOn(asset, day) {
    const t = day - BASE_DAY;
    const trend = 1 + asset.drift * (t / 365);
    const wave = asset.vol * Math.sin(t / asset.period + asset.phase);
    const jitter = asset.vol * 0.4 * (hash01(`${asset.id}:${day}`) * 2 - 1);
    return Math.max(0.01, asset.base * trend * (1 + wave + jitter));
}
function marketToday() {
    const day = dayNumber();
    return exports.ASSETS.map((a) => {
        const price = priceOn(a, day);
        const prev = priceOn(a, day - 1);
        return {
            id: a.id,
            symbol: a.symbol,
            name: a.name,
            emoji: a.emoji,
            category: a.category,
            price: Math.round(price * 100) / 100,
            changePct: Math.round((price / prev - 1) * 10000) / 100,
        };
    });
}
async function ensureAccount(userId) {
    const pool = (0, db_1.getPool)();
    await pool.query(`INSERT INTO portfolio_accounts (user_id, cash) VALUES ($1, $2) ON CONFLICT (user_id) DO NOTHING`, [userId, exports.STARTING_CASH]);
    const row = (await pool.query('SELECT cash FROM portfolio_accounts WHERE user_id = $1', [userId])).rows[0];
    return Number(row.cash);
}
/* ─── GET /api/portfolio — account + market snapshot ───────────── */
exports.portfolioRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const cash = await ensureAccount(req.userId);
        const holdingsRows = (await pool.query('SELECT asset_id, shares, avg_cost FROM portfolio_holdings WHERE user_id = $1 AND shares > 0', [req.userId])).rows;
        const day = dayNumber();
        let holdingsValue = 0;
        const holdings = holdingsRows.map((h) => {
            const asset = ASSET_BY_ID.get(h.asset_id);
            const shares = Number(h.shares);
            const avgCost = Number(h.avg_cost);
            const price = asset ? priceOn(asset, day) : 0;
            const value = shares * price;
            holdingsValue += value;
            return {
                assetId: h.asset_id,
                symbol: asset?.symbol ?? h.asset_id,
                name: asset?.name ?? h.asset_id,
                emoji: asset?.emoji ?? '❓',
                shares: Math.round(shares * 1e6) / 1e6,
                avgCost: Math.round(avgCost * 100) / 100,
                price: Math.round(price * 100) / 100,
                value: Math.round(value * 100) / 100,
                plPct: avgCost > 0 ? Math.round((price / avgCost - 1) * 10000) / 100 : 0,
            };
        });
        const totalValue = cash + holdingsValue;
        res.json({
            cash: Math.round(cash * 100) / 100,
            startingCash: exports.STARTING_CASH,
            holdingsValue: Math.round(holdingsValue * 100) / 100,
            totalValue: Math.round(totalValue * 100) / 100,
            totalReturnPct: Math.round((totalValue / exports.STARTING_CASH - 1) * 10000) / 100,
            holdings,
            market: marketToday(),
        });
    }
    catch (err) {
        console.error('Portfolio GET error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ─── POST /api/portfolio/trade { assetId, side, shares } ──────── */
exports.portfolioRouter.post('/trade', auth_1.authenticate, async (req, res) => {
    const { assetId, side, shares } = req.body;
    const asset = assetId ? ASSET_BY_ID.get(assetId) : undefined;
    const qty = Number(shares);
    if (!asset || (side !== 'buy' && side !== 'sell') || !Number.isFinite(qty) || qty <= 0) {
        res.status(400).json({ error: 'invalid_trade' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await ensureAccount(req.userId);
        await client.query('BEGIN');
        const acct = (await client.query('SELECT cash FROM portfolio_accounts WHERE user_id = $1 FOR UPDATE', [req.userId])).rows[0];
        let cash = Number(acct.cash);
        const price = priceOn(asset, dayNumber());
        const holdRow = (await client.query('SELECT shares, avg_cost FROM portfolio_holdings WHERE user_id = $1 AND asset_id = $2 FOR UPDATE', [req.userId, asset.id])).rows[0];
        const heldShares = holdRow ? Number(holdRow.shares) : 0;
        const heldAvg = holdRow ? Number(holdRow.avg_cost) : 0;
        if (side === 'buy') {
            const cost = qty * price;
            if (cost > cash + 1e-6) {
                await client.query('ROLLBACK');
                res.status(400).json({ error: 'insufficient_funds' });
                return;
            }
            cash -= cost;
            const newShares = heldShares + qty;
            const newAvg = newShares > 0 ? (heldShares * heldAvg + qty * price) / newShares : price;
            await client.query(`INSERT INTO portfolio_holdings (user_id, asset_id, shares, avg_cost) VALUES ($1,$2,$3,$4)
         ON CONFLICT (user_id, asset_id) DO UPDATE SET shares = $3, avg_cost = $4`, [req.userId, asset.id, newShares, newAvg]);
        }
        else {
            if (qty > heldShares + 1e-6) {
                await client.query('ROLLBACK');
                res.status(400).json({ error: 'insufficient_shares' });
                return;
            }
            cash += qty * price;
            const newShares = heldShares - qty;
            await client.query(`UPDATE portfolio_holdings SET shares = $3 WHERE user_id = $1 AND asset_id = $2`, [req.userId, asset.id, newShares]);
        }
        await client.query('UPDATE portfolio_accounts SET cash = $2 WHERE user_id = $1', [req.userId, cash]);
        await client.query('INSERT INTO portfolio_trades (user_id, asset_id, side, shares, price) VALUES ($1,$2,$3,$4,$5)', [req.userId, asset.id, side, qty, price]);
        await client.query('COMMIT');
        res.json({ ok: true, cash: Math.round(cash * 100) / 100, price: Math.round(price * 100) / 100 });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Portfolio trade error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
