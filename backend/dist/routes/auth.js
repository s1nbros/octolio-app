"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const crypto_1 = __importDefault(require("crypto"));
const google_auth_library_1 = require("google-auth-library");
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
const banned_words_1 = require("../data/banned-words");
const email_1 = require("../services/email");
const streak_1 = require("../services/streak");
const ai_1 = require("./ai");
// Google ID-token verifier. Audience must match the OAuth client ID we used
// in the frontend; tokens minted for any other audience are rejected.
const googleClient = new google_auth_library_1.OAuth2Client(process.env.GOOGLE_CLIENT_ID);
/**
 * Derive an available nickname from a Google profile.
 * Strategy: strip the email's local-part to [a-z0-9_], cap at 16 chars,
 * then suffix with 2..99 on collision. Banned nicks get random digits.
 */
async function generateAvailableNickname(email, fallback) {
    const pool = (0, db_1.getPool)();
    const base = (email.split('@')[0] || fallback || 'user')
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '')
        .slice(0, 16) || 'user';
    const isFree = async (n) => {
        if ((0, banned_words_1.isNicknameBanned)(n))
            return false;
        const [u, p] = await Promise.all([
            pool.query('SELECT 1 FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1', [n]),
            pool.query('SELECT 1 FROM pending_registrations WHERE LOWER(name) = LOWER($1) LIMIT 1', [n]),
        ]);
        return u.rowCount === 0 && p.rowCount === 0;
    };
    if (await isFree(base))
        return base;
    for (let i = 2; i < 100; i++) {
        const candidate = `${base}${i}`.slice(0, 20);
        if (await isFree(candidate))
            return candidate;
    }
    // Worst case: append 4 random digits.
    const rand = `${base}${crypto_1.default.randomInt(1000, 9999)}`.slice(0, 20);
    return rand;
}
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
/**
 * Diagnostic endpoint — hits SMTP and reports the result. Guarded by the
 * EMAIL_DEBUG_TOKEN env var so it can't be abused. Use it to confirm that
 * the configured SMTP creds actually work from the deployed environment:
 *
 *   curl -X POST https://<api>/api/auth/email-diag \
 *     -H 'Content-Type: application/json' \
 *     -d '{"token":"<EMAIL_DEBUG_TOKEN>","to":"you@example.com"}'
 */
exports.authRouter.post('/email-diag', async (req, res) => {
    const { token, to } = req.body ?? {};
    const expected = process.env.EMAIL_DEBUG_TOKEN;
    if (!expected || token !== expected) {
        res.status(404).json({ error: 'Not found' });
        return;
    }
    if (!to) {
        res.status(400).json({ error: '"to" is required' });
        return;
    }
    try {
        await (0, email_1.sendVerificationEmail)(String(to), 'Octolio diag', '000000', 'diag-token');
        res.json({ ok: true, smtpConfigured: (0, email_1.isEmailConfigured)() });
    }
    catch (err) {
        res.status(500).json({ ok: false, smtpConfigured: (0, email_1.isEmailConfigured)(), error: err instanceof Error ? err.message : String(err) });
    }
});
/* Public availability check used by the registration form for live hints. */
exports.authRouter.get('/check-availability', async (req, res) => {
    const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    const out = {};
    try {
        const pool = (0, db_1.getPool)();
        if (name.length >= 2) {
            if ((0, banned_words_1.isNicknameBanned)(name)) {
                out.name = { available: false, banned: true };
            }
            else {
                const [u, p] = await Promise.all([
                    pool.query('SELECT 1 FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]),
                    pool.query('SELECT 1 FROM pending_registrations WHERE LOWER(name) = LOWER($1) LIMIT 1', [name]),
                ]);
                out.name = { available: u.rowCount === 0 && p.rowCount === 0, banned: false };
            }
        }
        if (email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            // Only verified, real accounts block re-registration. A pending row for the
            // same address is fine — register will refresh it.
            const u = await pool.query('SELECT 1 FROM users WHERE email = $1 LIMIT 1', [email]);
            out.email = { available: u.rowCount === 0 };
        }
        res.json(out);
    }
    catch (err) {
        console.error('check-availability error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
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
        const trimmedName = name.trim();
        // Block only if a verified account already owns this email.
        const verified = await pool.query('SELECT 1 FROM users WHERE email = $1 LIMIT 1', [lowerEmail]);
        if ((verified.rowCount ?? 0) > 0) {
            res.status(409).json({ error: 'Email already registered', field: 'email' });
            return;
        }
        // Name uniqueness across both real users AND other pending registrations.
        const [nameInUsers, nameInPending] = await Promise.all([
            pool.query('SELECT 1 FROM users WHERE LOWER(name) = LOWER($1) LIMIT 1', [trimmedName]),
            pool.query('SELECT 1 FROM pending_registrations WHERE LOWER(name) = LOWER($1) AND email != $2 LIMIT 1', [trimmedName, lowerEmail]),
        ]);
        if ((nameInUsers.rowCount ?? 0) > 0 || (nameInPending.rowCount ?? 0) > 0) {
            res.status(409).json({ error: 'Name already taken', field: 'name' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const code = generateVerificationCode();
        const token = generateUrlToken();
        const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
        // Upsert: same email re-attempting registration overwrites the previous pending row.
        await pool.query(`INSERT INTO pending_registrations
         (email, name, password_hash, verification_code, verification_token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         verification_code = EXCLUDED.verification_code,
         verification_token = EXCLUDED.verification_token,
         expires_at = EXCLUDED.expires_at,
         created_at = NOW()`, [lowerEmail, trimmedName, passwordHash, code, token, expires]);
        fireEmail((0, email_1.sendVerificationEmail)(lowerEmail, trimmedName, code, token), 'verification');
        res.status(202).json({
            pending: true,
            email: lowerEmail,
            emailSent: (0, email_1.isEmailConfigured)(),
            // No SMTP configured → expose the code so dev flow isn't blocked.
            ...((0, email_1.isEmailConfigured)() ? {} : { devCode: code }),
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
            ? await pool.query(`SELECT email, name, password_hash, expires_at FROM pending_registrations
             WHERE verification_token = $1`, [token])
            : await pool.query(`SELECT email, name, password_hash, expires_at FROM pending_registrations
             WHERE email = $1 AND verification_code = $2`, [String(email).toLowerCase(), String(code)]);
        const pending = result.rows[0];
        if (!pending) {
            res.status(400).json({ error: 'Invalid or expired verification' });
            return;
        }
        if (new Date(pending.expires_at).getTime() < Date.now()) {
            res.status(400).json({ error: 'Verification expired — request a new one' });
            return;
        }
        // Race-safe: in case someone else verified or registered in the meantime.
        const dup = await pool.query('SELECT 1 FROM users WHERE email = $1 OR LOWER(name) = LOWER($2) LIMIT 1', [pending.email, pending.name]);
        if ((dup.rowCount ?? 0) > 0) {
            await pool.query('DELETE FROM pending_registrations WHERE email = $1', [pending.email]);
            res.status(409).json({ error: 'Email or name was just claimed by another account. Please register again.' });
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const inserted = await pool.query(`INSERT INTO users
         (name, email, password_hash, xp, streak, last_active, email_verified)
       VALUES ($1, $2, $3, 0, 1, $4, TRUE)
       RETURNING id, name, email`, [pending.name, pending.email, pending.password_hash, today]);
        await pool.query('DELETE FROM pending_registrations WHERE email = $1', [pending.email]);
        const user = inserted.rows[0];
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
        const result = await pool.query('SELECT email, name FROM pending_registrations WHERE email = $1', [String(email).toLowerCase()]);
        const pending = result.rows[0];
        // Always respond ok to avoid leaking which emails are pending/verified.
        if (!pending) {
            res.json({ ok: true });
            return;
        }
        const code = generateVerificationCode();
        const token = generateUrlToken();
        const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
        await pool.query(`UPDATE pending_registrations
         SET verification_code = $1, verification_token = $2, expires_at = $3
       WHERE email = $4`, [code, token, expires, pending.email]);
        fireEmail((0, email_1.sendVerificationEmail)(pending.email, pending.name, code, token), 'verification');
        res.json({ ok: true, emailSent: (0, email_1.isEmailConfigured)(), ...((0, email_1.isEmailConfigured)() ? {} : { devCode: code }) });
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
/**
 * POST /api/auth/google
 *
 * Body: { credential: string (Google ID token JWT), rememberMe?: boolean }
 *
 * Behavior:
 *   1. Verify the ID token's signature + audience against GOOGLE_CLIENT_ID.
 *   2. If a user already has google_id = sub  → returning login.
 *      Else if a verified email matches an existing account → link google_id and log in.
 *      Else → create a new account with auto-generated nickname, password_hash = NULL,
 *             email_verified = TRUE, onboarding_done = FALSE.
 *   3. Bump streak the same way /login does.
 *   4. Respond with the standard { token, user } shape.
 */
exports.authRouter.post('/google', async (req, res) => {
    const { credential, rememberMe } = req.body ?? {};
    if (!credential || typeof credential !== 'string') {
        res.status(400).json({ error: 'Missing Google credential' });
        return;
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
        console.error('[google-auth] GOOGLE_CLIENT_ID is not configured');
        res.status(500).json({ error: 'Google sign-in is not configured on this server' });
        return;
    }
    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        if (!payload || !payload.sub || !payload.email) {
            res.status(400).json({ error: 'Invalid Google token' });
            return;
        }
        if (!payload.email_verified) {
            res.status(400).json({ error: 'Google account email is not verified' });
            return;
        }
        const googleId = payload.sub;
        const lowerEmail = payload.email.toLowerCase();
        const googleName = payload.name?.trim() || payload.given_name?.trim() || '';
        const pool = (0, db_1.getPool)();
        // 1) Returning Google user.
        let result = await pool.query('SELECT id, name, email, xp, streak, last_active FROM users WHERE google_id = $1 LIMIT 1', [googleId]);
        let user = result.rows[0];
        // 2) Existing email/password account — link this Google identity to it.
        if (!user) {
            result = await pool.query('SELECT id, name, email, xp, streak, last_active FROM users WHERE email = $1 LIMIT 1', [lowerEmail]);
            user = result.rows[0];
            if (user) {
                await pool.query('UPDATE users SET google_id = $1, email_verified = TRUE WHERE id = $2', [googleId, user.id]);
            }
        }
        // 3) Brand-new user — create.
        if (!user) {
            const nickname = await generateAvailableNickname(lowerEmail, googleName);
            const today = new Date().toISOString().split('T')[0];
            const inserted = await pool.query(`INSERT INTO users
           (name, email, password_hash, xp, streak, last_active, email_verified, google_id, onboarding_done)
         VALUES ($1, $2, NULL, 0, 1, $3, TRUE, $4, FALSE)
         RETURNING id, name, email, xp, streak, last_active`, [nickname, lowerEmail, today, googleId]);
            user = inserted.rows[0];
            // Drop any stale pending registration for this email.
            await pool.query('DELETE FROM pending_registrations WHERE email = $1', [lowerEmail]).catch(() => { });
        }
        else {
            // Streak bump for returning users (mirrors /login).
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
            if (newStreak !== user.streak || user.last_active !== today) {
                await pool.query('UPDATE users SET streak = $1, last_active = $2 WHERE id = $3', [newStreak, today, user.id]);
                user.streak = newStreak;
            }
        }
        const token = (0, auth_1.signToken)(user.id, !!rememberMe);
        res.json({
            token,
            rememberMe: !!rememberMe,
            user: { id: user.id, name: user.name, email: user.email, xp: user.xp, streak: user.streak },
        });
    }
    catch (err) {
        console.error('Google auth error:', err);
        res.status(401).json({ error: 'Google sign-in failed' });
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
        // Lazy Pro-trial downgrade: if the user is on a wheel-granted trial that
        // has now expired AND they don't also have a real Stripe subscription,
        // demote them back to free. Done here so no cron task is needed.
        await pool.query(`UPDATE users
         SET is_pro = FALSE
       WHERE id = $1
         AND is_pro = TRUE
         AND pro_trial_ends_at IS NOT NULL
         AND pro_trial_ends_at < NOW()
         AND (stripe_subscription_id IS NULL OR stripe_subscription_id = '')`, [req.userId]);
        const result = await pool.query(`SELECT id, name, email, xp, streak, last_active, created_at, avatar, is_pro,
              energy, energy_refill_at, onboarding_done, streak_freezes,
              coins, equipped_costume, equipped_hat, equipped_face, equipped_body,
              chests_opened, wheel_spun, pro_trial_ends_at,
              goal, experience_level, daily_goal_min,
              ai_explain_date, ai_explain_count
       FROM users WHERE id = $1`, [req.userId]);
        const user = result.rows[0];
        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }
        // "Explain my mistake" daily quota — null means unlimited (Pro).
        const explainUsedToday = user.ai_explain_date === (0, streak_1.todayStr)() ? (user.ai_explain_count ?? 0) : 0;
        user.ai_explains_remaining = user.is_pro
            ? null
            : Math.max(0, ai_1.DAILY_FREE_EXPLAINS - explainUsedToday);
        delete user.ai_explain_date;
        delete user.ai_explain_count;
        res.json({ user });
    }
    catch (err) {
        console.error('Me error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * DELETE /api/auth/account — permanent account deletion.
 * Required by App Store guideline 5.1.1(v): apps that let users create an
 * account must let them delete it in-app. Removes the user and every row that
 * references them, in one transaction. If the account has a password and the
 * caller supplies one, it's verified first.
 */
exports.authRouter.delete('/account', auth_1.authenticate, async (req, res) => {
    const { password } = (req.body ?? {});
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        const u = (await client.query('SELECT email, password_hash FROM users WHERE id = $1', [req.userId])).rows[0];
        if (!u) {
            res.status(404).json({ error: 'not_found' });
            return;
        }
        if (u.password_hash && password) {
            const ok = await bcryptjs_1.default.compare(password, u.password_hash);
            if (!ok) {
                res.status(400).json({ error: 'wrong_password' });
                return;
            }
        }
        await client.query('BEGIN');
        const uid = req.userId;
        // Delete every table that references users(id) before the user row itself.
        await client.query('DELETE FROM progress WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM exercise_reviews WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM notifications WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM user_inventory WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM chest_opens WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM module_chests WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM wheel_prizes WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM friendships WHERE requester_id = $1 OR recipient_id = $1', [uid]);
        await client.query('DELETE FROM friend_streaks WHERE user_low = $1 OR user_high = $1', [uid]);
        await client.query('DELETE FROM friend_quests WHERE user_low = $1 OR user_high = $1', [uid]);
        await client.query('DELETE FROM portfolio_trades WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM portfolio_holdings WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM portfolio_accounts WHERE user_id = $1', [uid]);
        await client.query('DELETE FROM pending_registrations WHERE email = $1', [u.email]);
        await client.query('DELETE FROM users WHERE id = $1', [uid]);
        await client.query('COMMIT');
        res.json({ ok: true });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Account delete error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
/**
 * Save the goal-based onboarding profile. Called from the onboarding wizard
 * AFTER the user picks a goal + completes the diagnostic + chooses a daily
 * goal, but BEFORE they pick free/pro — so the profile persists regardless
 * of plan choice. Does NOT mark onboarding_done (that's /onboarding or the
 * Stripe webhook).
 */
exports.authRouter.post('/onboarding-profile', auth_1.authenticate, async (req, res) => {
    const { goal, experienceLevel, dailyGoalMin } = req.body ?? {};
    const VALID_GOALS = ['save', 'debt', 'invest', 'understand', 'budget'];
    const VALID_LEVELS = ['beginner', 'intermediate', 'advanced'];
    const VALID_MINS = [3, 5, 10];
    const g = VALID_GOALS.includes(goal) ? goal : null;
    const lvl = VALID_LEVELS.includes(experienceLevel) ? experienceLevel : 'beginner';
    const mins = VALID_MINS.includes(Number(dailyGoalMin)) ? Number(dailyGoalMin) : 5;
    try {
        const pool = (0, db_1.getPool)();
        await pool.query('UPDATE users SET goal = $1, experience_level = $2, daily_goal_min = $3 WHERE id = $4', [g, lvl, mins, req.userId]);
        res.json({ success: true, goal: g, experienceLevel: lvl, dailyGoalMin: mins });
    }
    catch (err) {
        console.error('Onboarding profile error:', err);
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
        // Google-only accounts have no password to verify. They have to set one via
        // /forgot-password (reset link goes to their verified Google email) before
        // they can use this endpoint, since we can't validate `currentPassword`.
        if (!user.password_hash) {
            res.status(400).json({ error: 'This account uses Google sign-in. Set a password via "Forgot password" first.', googleAccount: true });
            return;
        }
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
