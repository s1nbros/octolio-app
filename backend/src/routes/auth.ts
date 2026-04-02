import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { getDb } from '../db';
import { signToken, authenticate, AuthRequest } from '../middleware/auth';

export const authRouter = Router();

authRouter.post('/register', async (req: Request, res: Response): Promise<void> => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    res.status(400).json({ error: 'Name, email, and password are required' });
    return;
  }

  if (password.length < 6) {
    res.status(400).json({ error: 'Password must be at least 6 characters' });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ error: 'Invalid email address' });
    return;
  }

  try {
    const db = getDb();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());

    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const today = new Date().toISOString().split('T')[0];

    const result = db.prepare(
      'INSERT INTO users (name, email, password_hash, xp, streak, last_active) VALUES (?, ?, ?, 0, 1, ?)'
    ).run(name.trim(), email.toLowerCase(), passwordHash, today);

    const userId = result.lastInsertRowid as number;
    const token = signToken(userId);

    res.status(201).json({
      token,
      user: { id: userId, name: name.trim(), email: email.toLowerCase(), xp: 0, streak: 1 },
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
    const db = getDb();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase()) as {
      id: number;
      name: string;
      email: string;
      password_hash: string;
      xp: number;
      streak: number;
      last_active: string;
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

    // Update streak logic
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    let newStreak = user.streak;

    if (user.last_active === today) {
      // Already active today, streak unchanged
    } else if (user.last_active === yesterday) {
      newStreak += 1;
    } else {
      newStreak = 1; // Reset streak
    }

    db.prepare('UPDATE users SET streak = ?, last_active = ? WHERE id = ?').run(newStreak, today, user.id);

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

authRouter.get('/me', authenticate, (req: AuthRequest, res: Response): void => {
  try {
    const db = getDb();
    const user = db.prepare('SELECT id, name, email, xp, streak, last_active, created_at FROM users WHERE id = ?').get(req.userId) as {
      id: number;
      name: string;
      email: string;
      xp: number;
      streak: number;
      last_active: string;
      created_at: string;
    } | undefined;

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
