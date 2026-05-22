"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reviewRouter = void 0;
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const lessons_1 = require("../data/lessons");
exports.reviewRouter = (0, express_1.Router)();
// Leitner box → days until next review. Box 5 = mastered.
const BOX_DAYS = {
    1: 1,
    2: 3,
    3: 7,
    4: 21,
    5: 60,
};
const MASTERED_BOX = 5;
function daysFromNow(days) {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}
function findExercise(moduleId, lessonId, exerciseId) {
    const mod = lessons_1.modules.find((m) => m.id === moduleId);
    const lesson = mod?.lessons.find((l) => l.id === lessonId);
    return lesson?.exercises.find((e) => e.id === exerciseId);
}
/**
 * POST /api/review/missed
 * Record that the user got an exercise wrong. Upserts into box 1.
 * Body: { moduleId, lessonId, exerciseId }
 */
exports.reviewRouter.post('/missed', auth_1.authenticate, async (req, res) => {
    const { moduleId, lessonId, exerciseId } = req.body;
    if (!moduleId || !lessonId || !exerciseId) {
        res.status(400).json({ error: 'moduleId, lessonId, exerciseId required' });
        return;
    }
    // Sanity check: skip theory exercises (no "wrong answer" possible).
    const ex = findExercise(moduleId, lessonId, exerciseId);
    if (!ex || ex.type === 'theory') {
        res.json({ skipped: true });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        // Upsert: if already in the table, reset to box 1 and bump times_reviewed.
        // If new, insert at box 1 due immediately.
        await pool.query(`INSERT INTO exercise_reviews (user_id, module_id, lesson_id, exercise_id, box_level, next_review_at)
       VALUES ($1, $2, $3, $4, 1, NOW())
       ON CONFLICT (user_id, module_id, lesson_id, exercise_id)
       DO UPDATE SET box_level = 1,
                     next_review_at = NOW(),
                     mastered = FALSE`, [req.userId, moduleId, lessonId, exerciseId]);
        res.json({ ok: true });
    }
    catch (err) {
        console.error('Review missed error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * GET /api/review/due
 * Return up to 20 due review cards (full exercise content embedded).
 */
exports.reviewRouter.get('/due', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const rows = (await pool.query(`SELECT id, module_id, lesson_id, exercise_id, box_level, times_reviewed, times_correct
       FROM exercise_reviews
       WHERE user_id = $1 AND mastered = FALSE AND next_review_at <= NOW()
       ORDER BY next_review_at ASC
       LIMIT 20`, [req.userId])).rows;
        // Hydrate with exercise data from lessons.ts. Drop any cards whose exercise no longer exists.
        const cards = rows
            .map((r) => {
            const exercise = findExercise(r.module_id, r.lesson_id, r.exercise_id);
            if (!exercise)
                return null;
            return {
                id: r.id,
                moduleId: r.module_id,
                lessonId: r.lesson_id,
                exerciseId: r.exercise_id,
                boxLevel: r.box_level,
                timesReviewed: r.times_reviewed,
                timesCorrect: r.times_correct,
                exercise,
            };
        })
            .filter((c) => c !== null);
        res.json({ cards });
    }
    catch (err) {
        console.error('Review due error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * POST /api/review/done
 * Body: { cardId, correct }
 * Correct → promote a box (mastered if box was already 4). Wrong → reset to box 1.
 */
exports.reviewRouter.post('/done', auth_1.authenticate, async (req, res) => {
    const { cardId, correct } = req.body;
    if (typeof cardId !== 'number' || typeof correct !== 'boolean') {
        res.status(400).json({ error: 'cardId (number) and correct (boolean) required' });
        return;
    }
    try {
        const pool = (0, db_1.getPool)();
        const row = (await pool.query('SELECT id, box_level FROM exercise_reviews WHERE id = $1 AND user_id = $2', [cardId, req.userId])).rows[0];
        if (!row) {
            res.status(404).json({ error: 'Card not found' });
            return;
        }
        let newBox = row.box_level;
        let mastered = false;
        if (correct) {
            newBox = Math.min(row.box_level + 1, MASTERED_BOX);
            if (newBox >= MASTERED_BOX) {
                mastered = true;
            }
        }
        else {
            newBox = 1;
        }
        const days = BOX_DAYS[newBox] ?? 1;
        const nextReview = daysFromNow(days);
        await pool.query(`UPDATE exercise_reviews SET
         box_level = $1,
         next_review_at = $2,
         last_reviewed_at = NOW(),
         times_reviewed = times_reviewed + 1,
         times_correct = times_correct + $3,
         mastered = $4
       WHERE id = $5`, [newBox, nextReview, correct ? 1 : 0, mastered, cardId]);
        res.json({ boxLevel: newBox, mastered, nextReviewAt: nextReview.toISOString() });
    }
    catch (err) {
        console.error('Review done error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/**
 * GET /api/review/stats
 * Counts: total tracked, currently due, mastered, by box.
 */
exports.reviewRouter.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const result = await pool.query(`SELECT
         COUNT(*) FILTER (WHERE mastered = FALSE) AS total,
         COUNT(*) FILTER (WHERE mastered = FALSE AND next_review_at <= NOW()) AS due,
         COUNT(*) FILTER (WHERE mastered = TRUE) AS mastered
       FROM exercise_reviews
       WHERE user_id = $1`, [req.userId]);
        const row = result.rows[0];
        res.json({
            total: Number(row.total ?? 0),
            due: Number(row.due ?? 0),
            mastered: Number(row.mastered ?? 0),
        });
    }
    catch (err) {
        console.error('Review stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
