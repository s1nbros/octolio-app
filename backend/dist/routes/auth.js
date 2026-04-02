"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const db_1 = require("../db");
const auth_1 = require("../middleware/auth");
exports.authRouter = (0, express_1.Router)();
exports.authRouter.post('/register', async (req, res) => {
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
        const db = (0, db_1.getDb)();
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
        if (existing) {
            res.status(409).json({ error: 'Email already registered' });
            return;
        }
        const passwordHash = await bcryptjs_1.default.hash(password, 12);
        const today = new Date().toISOString().split('T')[0];
        const result = db.prepare('INSERT INTO users (name, email, password_hash, xp, streak, last_active) VALUES (?, ?, ?, 0, 1, ?)').run(name.trim(), email.toLowerCase(), passwordHash, today);
        const userId = result.lastInsertRowid;
        const token = (0, auth_1.signToken)(userId);
        res.status(201).json({
            token,
            user: { id: userId, name: name.trim(), email: email.toLowerCase(), xp: 0, streak: 1 },
        });
    }
    catch (err) {
        console.error('Register error:', err);
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
        const db = (0, db_1.getDb)();
        const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }
        const valid = await bcryptjs_1.default.compare(password, user.password_hash);
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
        }
        else if (user.last_active === yesterday) {
            newStreak += 1;
        }
        else {
            newStreak = 1; // Reset streak
        }
        db.prepare('UPDATE users SET streak = ?, last_active = ? WHERE id = ?').run(newStreak, today, user.id);
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
exports.authRouter.get('/me', auth_1.authenticate, (req, res) => {
    try {
        const db = (0, db_1.getDb)();
        const user = db.prepare('SELECT id, name, email, xp, streak, last_active, created_at FROM users WHERE id = ?').get(req.userId);
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
