"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const banned_words_1 = require("../data/banned-words");
const email_1 = require("../services/email");
/**
 * Fire an email send without blocking the API response. Email providers can
 * stall for tens of seconds on bad creds — that must not freeze the user.
 */
function fireEmail(p, label) {
    p.catch(err => console.error(`[email] ${label} failed:`, err));
}
exports.authRouter = (0, express_1.Router)();
const VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 min
const RESET_TTL_MS = 60 * 60 * 1000; // 1 h
function generateVerificationCode() {
    // 6 digits, zero-padded
    return crypto_1.default.randomInt(0, 1000000).toString().padStart(6, '0');
}
function generateUrlToken() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
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
    if ((0, banned_words_1.isNicknameBanned)(name)) {
        res.status(400).json({ error: 'This nickname is not allowed. Please choose another.' });
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
        const lowerEmail = email.toLowerCase();
        const existing = await pool.query('SELECT id, email_verified FROM users WHERE email = $1', [lowerEmail]);
        if (existing.rows.length > 0) {
            const row = existing.rows[0];
            // If the existing record is unverified, we can re-issue a fresh code
            // instead of permanently blocking the email. Verified accounts must use login/forgot.
            if (row.email_verified) {
                res.status(409).json({ error: 'Email already registered' });
                return;
            }
            const passwordHash = await bcryptjs_1.default.hash(password, 12);
            const code = generateVerificationCode();
            const token = generateUrlToken();
            const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
            await pool.query(`UPDATE users SET name = $1, password_hash = $2,
           email_verification_code = $3, email_verification_token = $4,
           email_verification_expires_at = $5
         WHERE id = $6`, [name.trim(), passwordHash, code, token, expires, row.id]);
            fireEmail((0, email_1.sendVerificationEmail)(lowerEmail, name.trim(), code, token), 'verification');
            res.status(202).json({
                pending: true,
                email: lowerEmail,
                emailSent: (0, email_1.isSmtpConfigured)(),
                // When SMTP isn't configured the user cannot receive the email, so we
                // expose the code in the response to keep the dev flow unblocked.
                ...((0, email_1.isSmtpConfigured)() ? {} : { devCode: code }),
            });
            return;
        }
        // Reject if name is already taken (verified) — case-insensitive.
        const taken = await pool.query('SELECT id FROM users WHERE LOWER(name) = LOWER($1)', [name.trim()]);
        if (taken.rows.length > 0) {
            res.status(409).json({ error: 'Name already taken' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const today = new Date().toISOString().split('T')[0];
        const code = generateVerificationCode();
        const token = generateUrlToken();
        const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
        await pool.query(`INSERT INTO users
         (name, email, password_hash, xp, streak, last_active,
          email_verified, email_verification_code, email_verification_token, email_verification_expires_at)
       VALUES ($1, $2, $3, 0, 1, $4, FALSE, $5, $6, $7)`, [name.trim(), lowerEmail, passwordHash, today, code, token, expires]);
        fireEmail((0, email_1.sendVerificationEmail)(lowerEmail, name.trim(), code, token), 'verification');
        res.status(202).json({
            pending: true,
            email: lowerEmail,
            emailSent: (0, email_1.isSmtpConfigured)(),
            ...((0, email_1.isSmtpConfigured)() ? {} : { devCode: code }),
        });
    }
    catch (err) {
        console.error('Register error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/verify-email', async (req, res) => {
    const { email, code, token } = req.body;
    if (!token && !(email && code)) {
        res.status(400).json({ error: 'Provide either a token or email + code' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = token
            ? await pool.query(`SELECT id, name, email, email_verification_expires_at FROM users
             WHERE email_verification_token = $1`, [token])
            : await pool.query(`SELECT id, name, email, email_verification_expires_at FROM users
             WHERE email = $1 AND email_verification_code = $2`, [String(email).toLowerCase(), String(code)]);
        const user = result.rows[0];
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired verification' });
            return;
        }
        if (user.email_verification_expires_at && new Date(user.email_verification_expires_at).getTime() < Date.now()) {
            res.status(400).json({ error: 'Verification expired — request a new one' });
            return;
        }
        await pool.query(`UPDATE users SET email_verified = TRUE,
         email_verification_code = NULL,
         email_verification_token = NULL,
         email_verification_expires_at = NULL
       WHERE id = $1`, [user.id]);
        const jwt = (0, auth_1.signToken)(user.id, true);
        res.json({
            token: jwt,
            user: { id: user.id, name: user.name, email: user.email },
        });
    }
    catch (err) {
        console.error('Verify error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/resend-verification', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT id, name, email, email_verified FROM users WHERE email = $1', [String(email).toLowerCase()]);
        const user = result.rows[0];
        // Always respond ok to avoid leaking which emails are registered.
        if (!user || user.email_verified) {
            res.json({ ok: true });
            return;
        }
        const code = generateVerificationCode();
        const token = generateUrlToken();
        const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
        await pool.query(`UPDATE users SET email_verification_code = $1,
         email_verification_token = $2,
         email_verification_expires_at = $3
       WHERE id = $4`, [code, token, expires, user.id]);
        fireEmail((0, email_1.sendVerificationEmail)(user.email, user.name, code, token), 'verification');
        res.json({ ok: true, emailSent: (0, email_1.isSmtpConfigured)(), ...((0, email_1.isSmtpConfigured)() ? {} : { devCode: code }) });
    }
    catch (err) {
        console.error('Resend verification error:', err);
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
        if (!user.email_verified) {
            res.status(403).json({ error: 'Email not verified', emailNotVerified: true, email: user.email });
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
exports.authRouter.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query('SELECT id, name, email, email_verified FROM users WHERE email = $1', [String(email).toLowerCase()]);
        const user = result.rows[0];
        // Respond ok regardless to avoid leaking which addresses are registered.
        if (user && user.email_verified) {
            const token = generateUrlToken();
            const expires = new Date(Date.now() + RESET_TTL_MS);
            await pool.query(`UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3`, [token, expires, user.id]);
            fireEmail((0, email_1.sendPasswordResetEmail)(user.email, user.name, token), 'password reset');
        }
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
        res.status(400).json({ error: 'Token and new password are required' });
        return;
    }
    if (newPassword.length < 8) {
        res.status(400).json({ error: 'Password must be at least 8 characters' });
        return;
    }
    if (!/[A-Z]/.test(newPassword)) {
        res.status(400).json({ error: 'Password must contain at least one uppercase letter' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query(`SELECT id, password_reset_expires_at FROM users WHERE password_reset_token = $1`, [token]);
        const user = result.rows[0];
        if (!user) {
            res.status(400).json({ error: 'Invalid or expired reset link' });
            return;
        }
        if (user.password_reset_expires_at && new Date(user.password_reset_expires_at).getTime() < Date.now()) {
            res.status(400).json({ error: 'Reset link expired — request a new one' });
            return;
        }
        const hash = await bcryptjs_1.default.hash(newPassword, 12);
        await pool.query(`UPDATE users SET password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires_at = NULL
       WHERE id = $2`, [hash, user.id]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        // Incremental energy refill: +1 per 15 minutes (full 0→12 in 3 hours)
        const energyRow = await pool.query('SELECT energy, energy_refill_at FROM users WHERE id = $1', [req.userId]);
        const er = energyRow.rows[0];
        if (er && er.energy < 12 && er.energy_refill_at) {
            const REFILL_INTERVAL_MS = 15 * 60 * 1000;
            const refillAtMs = new Date(er.energy_refill_at).getTime();
            const intervals = Math.floor((Date.now() - refillAtMs) / REFILL_INTERVAL_MS);
            if (intervals > 0) {
                const toAdd = Math.min(intervals, 12 - er.energy);
                const newEnergy = er.energy + toAdd;
                const newRefillAt = newEnergy >= 12
                    ? null
                    : new Date(refillAtMs + toAdd * REFILL_INTERVAL_MS).toISOString();
                await pool.query('UPDATE users SET energy = $1, energy_refill_at = $2 WHERE id = $3', [newEnergy, newRefillAt, req.userId]);
            }
        }
        const result = await pool.query('SELECT id, name, email, xp, streak, last_active, created_at, avatar, is_pro, energy, energy_refill_at, onboarding_done FROM users WHERE id = $1', [req.userId]);
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
/* Mark onboarding complete (user chose free plan) */
exports.authRouter.post('/onboarding', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        await pool.query('UPDATE users SET onboarding_done = TRUE WHERE id = $1', [req.userId]);
        res.json({ success: true });
    }
    catch (err) {
        console.error('Onboarding error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.authRouter.get('/check-name', auth_1.authenticate, async (req, res) => {
    const name = req.query.name?.trim();
    if (!name || name.length < 2) {
        res.json({ available: false });
        return;
    }
    if ((0, banned_words_1.isNicknameBanned)(name)) {
        res.json({ available: false, banned: true });
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
    if (name !== undefined && (0, banned_words_1.isNicknameBanned)(name)) {
        res.status(400).json({ error: 'This nickname is not allowed. Please choose another.' });
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
