"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const lessonGenerator_1 = require("../services/lessonGenerator");
exports.generateRouter = (0, express_1.Router)();
// POST /api/generate/lesson   body: { topic: string }
exports.generateRouter.post('/lesson', auth_1.authenticate, async (req, res) => {
    const topic = typeof req.body?.topic === 'string' ? req.body.topic.trim() : '';
    if (!topic) {
        res.status(400).json({ error: 'topic required' });
        return;
    }
    try {
        const lesson = await (0, lessonGenerator_1.generateLesson)(topic);
        res.json({ lesson });
    }
    catch (err) {
        console.error('generate lesson error:', err);
        res.status(500).json({ error: 'generation_failed', detail: String(err) });
    }
});
