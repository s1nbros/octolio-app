"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.modulesRouter = void 0;
const express_1 = require("express");
const lessons_1 = require("../data/lessons");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
exports.modulesRouter = (0, express_1.Router)();
// Get all modules (strip exercises for the list view)
exports.modulesRouter.get('/', auth_1.authenticate, (req, res) => {
    try {
        const db = (0, db_1.getDb)();
        const completedLessons = db
            .prepare('SELECT lesson_id FROM progress WHERE user_id = ?')
            .all(req.userId);
        const completedSet = new Set(completedLessons.map((r) => r.lesson_id));
        const result = lessons_1.modules.map((mod) => ({
            id: mod.id,
            title: mod.title,
            description: mod.description,
            icon: mod.icon,
            color: mod.color,
            order: mod.order,
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
        res.json({ modules: result });
    }
    catch (err) {
        console.error('Modules error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
// Get a specific lesson with exercises
exports.modulesRouter.get('/:moduleId/lessons/:lessonId', auth_1.authenticate, (req, res) => {
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
        const db = (0, db_1.getDb)();
        const completed = db
            .prepare('SELECT id FROM progress WHERE user_id = ? AND lesson_id = ?')
            .get(req.userId, lessonId);
        res.json({ lesson, completed: !!completed });
    }
    catch (err) {
        console.error('Lesson error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
