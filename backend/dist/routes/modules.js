"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modulesRouter = void 0;
const express_1 = require("express");
const lessons_1 = require("../data/lessons");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.modulesRouter = (0, express_1.Router)();
exports.modulesRouter.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const [progressResult, userResult] = await Promise.all([
            pool.query('SELECT lesson_id FROM progress WHERE user_id = $1', [req.userId]),
            pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]),
        ]);
        const completedSet = new Set(progressResult.rows.map((r) => r.lesson_id));
        const isPro = userResult.rows[0]?.is_pro ?? false;
        const output = lessons_1.modules.map((mod) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            icon: mod.icon,
            color: mod.color,
            order: mod.order,
            proOnly: mod.proOnly ?? false,
            lessons: mod.lessons.map((lesson) => ({
                id: lesson.id,
                moduleId: lesson.moduleId,
                title: lesson.title,
                description: lesson.description,
                icon: lesson.icon,
                xpReward: lesson.xpReward,
                order: lesson.order,
                exerciseCount: lesson.exercises.length,
                completed: completedSet.has(lesson.id),
            })),
        }));
        res.json({ modules: output, isPro });
    }
    catch (err) {
        console.error('Modules error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
exports.modulesRouter.get('/:moduleId/lessons/:lessonId', auth_1.authenticate, async (req, res) => {
    const { moduleId, lessonId } = req.params;
    const mod = lessons_1.modules.find((m) => m.id === moduleId);
    if (!mod) {
        res.status(404).json({ error: 'Module not found' });
        return;
    }
    const lesson = mod.lessons.find((l) => l.id === lessonId);
    if (!lesson) {
        res.status(404).json({ error: 'Lesson not found' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const [progressResult, userResult] = await Promise.all([
            pool.query('SELECT id FROM progress WHERE user_id = $1 AND lesson_id = $2', [req.userId, lessonId]),
            pool.query('SELECT is_pro FROM users WHERE id = $1', [req.userId]),
        ]);
        const isPro = userResult.rows[0]?.is_pro ?? false;
        // Block free users from accessing pro-only module lessons
        if (mod.proOnly && !isPro) {
            res.status(403).json({ error: 'pro_required' });
            return;
        }
        res.json({ lesson, completed: progressResult.rows.length > 0 });
    }
    catch (err) {
        console.error('Lesson error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
