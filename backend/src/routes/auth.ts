import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { getPool } from '../db';
import { signToken, authenticate, AuthRequest } from '../middleware/auth';
import { isNicknameBanned } from '../data/banned-words';
import { sendVerificationEmail, sendPasswordResetEmail, isEmailConfigured } from '../services/email';

/**
 * Fire an email send without blocking the API response. Email providers can
 * stall for tens of seconds on bad creds — that must not freeze the user.
 */
function fireEmail(p: Promise<void>, label: string): void {
  p.catch(err => console.error(`[email] ${label} failed:`, err));
}

export const authRouter = Router();

const VERIFICATION_TTL_MS = 30 * 60 * 1000; // 30 min
const RESET_TTL_MS = 60 * 60 * 1000; // 1 h

function generateVerificationCode(): string {
  // 6 digits, zero-padded
  return crypto.randomInt(0, 1_000_000).toString().padStart(6, '0');
}

function generateUrlToken(): string {
  return crypto.randomBytes(32).toString('hex');
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
authRouter.post('/email-diag', async (req: Request, res: Response): Promise<void> => {
  const { token, to } = req.body ?? {};
  const expected = process.env.EMAIL_DEBUG_TOKEN;
  if (!expected || token !== expected) {
    res.status(404).json({ error: 'Not found' });
    return;
  }
  if (!to) { res.status(400).json({ error: '"to" is required' }); return; }
  try {
    await sendVerificationEmail(String(to), 'Octolio diag', '000000', 'diag-token');
    res.json({ ok: true, smtpConfigured: isEmailConfigured() });
  } catch (err) {
    res.status(500).json({ ok: false, smtpConfigured: isEmailConfigured(), error: err instanceof Error ? err.message : String(err) });
  }
});

/* Public availability check used by the registration form for live hints. */
authRouter.get('/check-availability', async (req: Request, res: Response): Promise<void> => {
  const name = typeof req.query.name === 'string' ? req.query.name.trim() : '';
  const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';

  const out: {
    name?: { available: boolean; banned: boolean };
    email?: { available: boolean };
  } = {};

  try {
    const pool = getPool();
    if (name.length >= 2) {
      if (isNicknameBanned(name)) {
        out.name = { available: false, banned: true };
      } else {
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
  } catch (err) {
    console.error('check-availability error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
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
  if (isNicknameBanned(name)) {
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
    const pool = getPool();
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

    const passwordHash = await bcrypt.hash(password, 12);
    const code = generateVerificationCode();
    const token = generateUrlToken();
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);

    // Upsert: same email re-attempting registration overwrites the previous pending row.
    await pool.query(
      `INSERT INTO pending_registrations
         (email, name, password_hash, verification_code, verification_token, expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO UPDATE SET
         name = EXCLUDED.name,
         password_hash = EXCLUDED.password_hash,
         verification_code = EXCLUDED.verification_code,
         verification_token = EXCLUDED.verification_token,
         expires_at = EXCLUDED.expires_at,
         created_at = NOW()`,
      [lowerEmail, trimmedName, passwordHash, code, token, expires]
    );

    fireEmail(sendVerificationEmail(lowerEmail, trimmedName, code, token), 'verification');

    res.status(202).json({
      pending: true,
      email: lowerEmail,
      emailSent: isEmailConfigured(),
      // No SMTP configured → expose the code so dev flow isn't blocked.
      ...(isEmailConfigured() ? {} : { devCode: code }),
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/verify-email', async (req: Request, res: Response): Promise<void> => {
  const { email, code, token } = req.body;
  if (!token && !(email && code)) {
    res.status(400).json({ error: 'Provide either a token or email + code' });
    return;
  }
  try {
    const pool = getPool();
    const result = token
      ? await pool.query(
          `SELECT email, name, password_hash, expires_at FROM pending_registrations
             WHERE verification_token = $1`,
          [token]
        )
      : await pool.query(
          `SELECT email, name, password_hash, expires_at FROM pending_registrations
             WHERE email = $1 AND verification_code = $2`,
          [String(email).toLowerCase(), String(code)]
        );
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
    const inserted = await pool.query(
      `INSERT INTO users
         (name, email, password_hash, xp, streak, last_active, email_verified)
       VALUES ($1, $2, $3, 0, 1, $4, TRUE)
       RETURNING id, name, email`,
      [pending.name, pending.email, pending.password_hash, today]
    );
    await pool.query('DELETE FROM pending_registrations WHERE email = $1', [pending.email]);

    const user = inserted.rows[0];
    const jwt = signToken(user.id, true);
    res.json({
      token: jwt,
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error('Verify error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/resend-verification', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email is required' }); return; }
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT email, name FROM pending_registrations WHERE email = $1',
      [String(email).toLowerCase()]
    );
    const pending = result.rows[0];
    // Always respond ok to avoid leaking which emails are pending/verified.
    if (!pending) {
      res.json({ ok: true });
      return;
    }
    const code = generateVerificationCode();
    const token = generateUrlToken();
    const expires = new Date(Date.now() + VERIFICATION_TTL_MS);
    await pool.query(
      `UPDATE pending_registrations
         SET verification_code = $1, verification_token = $2, expires_at = $3
       WHERE email = $4`,
      [code, token, expires, pending.email]
    );
    fireEmail(sendVerificationEmail(pending.email, pending.name, code, token), 'verification');
    res.json({ ok: true, emailSent: isEmailConfigured(), ...(isEmailConfigured() ? {} : { devCode: code }) });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/login', async (req: Request, res: Response): Promise<void> => {
  const { email, password, rememberMe } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: 'Email and password are required' });
    return;
  }

  try {
    const pool = getPool();
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);
    const user = result.rows[0] as {
      id: number; name: string; email: string; password_hash: string;
      xp: number; streak: number; last_active: string; email_verified: boolean;
    } | undefined;

    if (!user) {
      res.status(401).json({ error: 'Invalid email or password' });
      return;
    }

    const valid = await bcrypt.compare(password, user.password_hash);
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
    } else if (user.last_active === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    await pool.query('UPDATE users SET streak = $1, last_active = $2 WHERE id = $3', [newStreak, today, user.id]);

    const token = signToken(user.id, !!rememberMe);
    res.json({
      token,
      rememberMe: !!rememberMe,
      user: { id: user.id, name: user.name, email: user.email, xp: user.xp, streak: newStreak },
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  const { email } = req.body;
  if (!email) { res.status(400).json({ error: 'Email is required' }); return; }
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, name, email, email_verified FROM users WHERE email = $1',
      [String(email).toLowerCase()]
    );
    const user = result.rows[0];
    // Respond ok regardless to avoid leaking which addresses are registered.
    if (user && user.email_verified) {
      const token = generateUrlToken();
      const expires = new Date(Date.now() + RESET_TTL_MS);
      await pool.query(
        `UPDATE users SET password_reset_token = $1, password_reset_expires_at = $2 WHERE id = $3`,
        [token, expires, user.id]
      );
      fireEmail(sendPasswordResetEmail(user.email, user.name, token), 'password reset');
    }
    res.json({ ok: true });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
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
    const pool = getPool();
    const result = await pool.query(
      `SELECT id, password_reset_expires_at FROM users WHERE password_reset_token = $1`,
      [token]
    );
    const user = result.rows[0];
    if (!user) {
      res.status(400).json({ error: 'Invalid or expired reset link' });
      return;
    }
    if (user.password_reset_expires_at && new Date(user.password_reset_expires_at).getTime() < Date.now()) {
      res.status(400).json({ error: 'Reset link expired — request a new one' });
      return;
    }
    const hash = await bcrypt.hash(newPassword, 12);
    await pool.query(
      `UPDATE users SET password_hash = $1,
         password_reset_token = NULL,
         password_reset_expires_at = NULL
       WHERE id = $2`,
      [hash, user.id]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Reset password error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();

    // Incremental energy refill: +1 per 15 minutes (full 0→12 in 3 hours)
    const energyRow = await pool.query(
      'SELECT energy, energy_refill_at FROM users WHERE id = $1',
      [req.userId]
    );
    const er = energyRow.rows[0] as { energy: number; energy_refill_at: string | null } | undefined;
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
        await pool.query(
          'UPDATE users SET energy = $1, energy_refill_at = $2 WHERE id = $3',
          [newEnergy, newRefillAt, req.userId]
        );
      }
    }

    const result = await pool.query(
      `SELECT id, name, email, xp, streak, last_active, created_at, avatar, is_pro,
              energy, energy_refill_at, onboarding_done, streak_freezes,
              coins, equipped_costume, equipped_hat, equipped_face, equipped_body,
              chests_opened
       FROM users WHERE id = $1`,
      [req.userId]
    );
    const user = result.rows[0];

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ user });
  } catch (err) {
    console.error('Me error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* Mark onboarding complete (user chose free plan) */
authRouter.post('/onboarding', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    await pool.query('UPDATE users SET onboarding_done = TRUE WHERE id = $1', [req.userId]);
    res.json({ success: true });
  } catch (err) {
    console.error('Onboarding error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.get('/check-name', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const name = (req.query.name as string)?.trim();
  if (!name || name.length < 2) { res.json({ available: false }); return; }
  if (isNicknameBanned(name)) { res.json({ available: false, banned: true }); return; }
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2',
      [name, req.userId]
    );
    res.json({ available: result.rows.length === 0 });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.patch('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { name, avatar } = req.body;

  if (!name && !avatar) {
    res.status(400).json({ error: 'Nothing to update' });
    return;
  }

  if (name !== undefined && (typeof name !== 'string' || name.trim().length < 2)) {
    res.status(400).json({ error: 'Name must be at least 2 characters' });
    return;
  }

  if (name !== undefined && isNicknameBanned(name)) {
    res.status(400).json({ error: 'This nickname is not allowed. Please choose another.' });
    return;
  }

  try {
    const pool = getPool();

    if (name) {
      const taken = await pool.query(
        'SELECT id FROM users WHERE LOWER(name) = LOWER($1) AND id != $2',
        [name.trim(), req.userId]
      );
      if (taken.rows.length > 0) {
        res.status(409).json({ error: 'Name already taken' });
        return;
      }
    }

    const fields: string[] = [];
    const values: (string | number)[] = [];
    let idx = 1;

    if (name) { fields.push(`name = $${idx++}`); values.push(name.trim()); }
    if (avatar) { fields.push(`avatar = $${idx++}`); values.push(avatar); }
    values.push(req.userId!);

    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, xp, streak, avatar`,
      values
    );

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* League — top 10 users by XP, current user always included */
authRouter.get('/league', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const result = await pool.query(
      'SELECT id, name, xp, avatar FROM users ORDER BY xp DESC LIMIT 10'
    );
    const leaderboard = result.rows.map((row: { id: number; name: string; xp: number; avatar: string | null }, i: number) => ({
      rank: i + 1,
      id: row.id,
      name: row.name,
      xp: row.xp,
      avatar: row.avatar ?? null,
      isYou: row.id === req.userId,
    }));

    // If current user not in top 10, append their row with real rank
    const inTop = leaderboard.some((r: { isYou: boolean }) => r.isYou);
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
  } catch (err) {
    console.error('League error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

authRouter.patch('/password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
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
    const pool = getPool();
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [req.userId]);
    const user = result.rows[0];

    const valid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!valid) {
      res.status(401).json({ error: 'Current password is incorrect' });
      return;
    }

    const newHash = await bcrypt.hash(newPassword, 12);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, req.userId]);

    res.json({ success: true });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});
