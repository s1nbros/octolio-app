"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workoutRouter = void 0;
// ───────────────────────────────────────────────────────────────
// workout.ts — the Daily Money Workout.
//
// A 60-second, single-question daily action that:
//   • costs NO energy
//   • awards a small XP + coin reward (once per calendar day)
//   • counts as "active today" → keeps the user's streak alive
//
// This is the low-friction daily habit: on a busy day a 60-second workout
// protects the streak just like a full lesson would.
// ───────────────────────────────────────────────────────────────
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const db_1 = require("../db");
const workouts_1 = require("../data/workouts");
const streak_1 = require("../services/streak");
exports.workoutRouter = (0, express_1.Router)();
/* ── GET /api/workout/today ──────────────────────────────────
 * Returns today's question (without the answer) + whether the user
 * has already completed it today. */
exports.workoutRouter.get('/today', auth_1.authenticate, async (req, res) => {
    try {
        const pool = (0, db_1.getPool)();
        const today = (0, streak_1.todayStr)();
        const r = await pool.query('SELECT last_workout_date FROM users WHERE id = $1', [req.userId]);
        const alreadyDone = r.rows[0]?.last_workout_date === today;
        const { question } = (0, workouts_1.getTodaysWorkout)();
        res.json({
            alreadyDone,
            rewardXp: workouts_1.WORKOUT_REWARD_CORRECT.xp,
            rewardCoins: workouts_1.WORKOUT_REWARD_CORRECT.coins,
            question: {
                id: question.id,
                question: question.question,
                options: question.options, // correctIndex intentionally omitted
            },
        });
    }
    catch (err) {
        console.error('Workout today error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});
/* ── POST /api/workout/answer { choice } ─────────────────────
 * Validates, awards once per day, bumps the streak. */
exports.workoutRouter.post('/answer', auth_1.authenticate, async (req, res) => {
    const choice = Number(req.body?.choice);
    if (!Number.isInteger(choice) || choice < 0) {
        res.status(400).json({ error: 'Invalid choice' });
        return;
    }
    const pool = (0, db_1.getPool)();
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        const u = await client.query(`SELECT xp, coins, streak, last_active, streak_freezes, last_workout_date
       FROM users WHERE id = $1 FOR UPDATE`, [req.userId]);
        const user = u.rows[0];
        if (!user) {
            await client.query('ROLLBACK');
            res.status(404).json({ error: 'User not found' });
            return;
        }
        const today = (0, streak_1.todayStr)();
        const { index, question } = (0, workouts_1.getTodaysWorkout)();
        const correct = choice === question.correctIndex;
        // Already did today's workout — return the answer/explanation but no reward.
        if (user.last_workout_date === today) {
            await client.query('ROLLBACK');
            res.json({
                alreadyDone: true,
                correct,
                correctIndex: question.correctIndex,
                explanation: question.explanation,
                xpAwarded: 0,
                coinsAwarded: 0,
                streak: user.streak,
            });
            return;
        }
        const reward = correct ? workouts_1.WORKOUT_REWARD_CORRECT : workouts_1.WORKOUT_REWARD_WRONG;
        // Streak: a workout counts as "active today" exactly like a lesson.
        const { newStreak, newFreezes } = (0, streak_1.computeStreakUpdate)({ streak: user.streak, last_active: user.last_active, streak_freezes: user.streak_freezes ?? 0 }, today);
        const newXp = user.xp + reward.xp;
        const newCoins = (user.coins ?? 0) + reward.coins;
        await client.query(`UPDATE users
         SET xp = $1, coins = $2, streak = $3, streak_freezes = $4,
             last_active = $5, last_workout_date = $5
       WHERE id = $6`, [newXp, newCoins, newStreak, newFreezes, today, req.userId]);
        await client.query('COMMIT');
        res.json({
            alreadyDone: false,
            correct,
            correctIndex: question.correctIndex,
            explanation: question.explanation,
            xpAwarded: reward.xp,
            coinsAwarded: reward.coins,
            totalXp: newXp,
            coins: newCoins,
            streak: newStreak,
            workoutIndex: index,
        });
    }
    catch (err) {
        await client.query('ROLLBACK').catch(() => { });
        console.error('Workout answer error:', err);
        res.status(500).json({ error: 'Server error' });
    }
    finally {
        client.release();
    }
});
