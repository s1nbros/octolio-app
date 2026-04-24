import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getPool } from '../db';
import { signToken, authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

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

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (existing.rows.length > 0) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const today = new Date().toISOString().split('T')[0];

    const result = await pool.query(
      'INSERT INTO users (name, email, password_hash, xp, streak, last_active) VALUES ($1, $2, $3, 0, 1, $4) RETURNING id',
      [name.trim(), email.toLowerCase(), passwordHash, today]
    );

    const userId = result.rows[0].id;
    const token = signToken(userId);

    res.status(201).json({
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase(), xp: 0, streak: 1, avatar: '🦊' },
    });
  } catch (err) {
    console.error('Register error:', err);
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
      xp: number; streak: number; last_active: string;
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

authRouter.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();

    // Auto-refill energy if refill time has passed
    await pool.query(`
      UPDATE users
      SET energy = 12, energy_refill_at = NULL
      WHERE id = $1 AND energy_refill_at IS NOT NULL AND energy_refill_at <= NOW()
    `, [req.userId]);

    const result = await pool.query(
      'SELECT id, name, email, xp, streak, last_active, created_at, avatar, is_pro, energy, energy_refill_at, onboarding_done FROM users WHERE id = $1',
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

/* DEV ONLY — toggle Pro status without Stripe (remove before production) */
authRouter.post('/dev/toggle-pro', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  if (process.env.NODE_ENV === 'production') {
    res.status(403).json({ error: 'Not available in production' });
    return;
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      'UPDATE users SET is_pro = NOT is_pro WHERE id = $1 RETURNING is_pro',
      [req.userId]
    );
    res.json({ is_pro: result.rows[0].is_pro });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});
