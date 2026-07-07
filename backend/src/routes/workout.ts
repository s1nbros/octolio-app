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
import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import {
  getTodaysWorkout,
  WORKOUT_REWARD_CORRECT,
  WORKOUT_REWARD_WRONG,
} from '../data/workouts';
import { computeStreakUpdate, todayStr } from '../services/streak';
import { updateFriendStreaksForUser } from '../services/friendStreak';

export const workoutRouter = Router();

/* ── GET /api/workout/today ──────────────────────────────────
 * Returns today's question (without the answer) + whether the user
 * has already completed it today. */
workoutRouter.get('/today', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const today = todayStr();
    const r = await pool.query<{ last_workout_date: string | null }>(
      'SELECT last_workout_date FROM users WHERE id = $1', [req.userId]
    );
    const alreadyDone = r.rows[0]?.last_workout_date === today;
    const { question } = getTodaysWorkout();

    res.json({
      alreadyDone,
      rewardXp: WORKOUT_REWARD_CORRECT.xp,
      rewardCoins: WORKOUT_REWARD_CORRECT.coins,
      question: {
        id: question.id,
        question: question.question,
        options: question.options, // correctIndex intentionally omitted
      },
    });
  } catch (err) {
    console.error('Workout today error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ── POST /api/workout/answer { choice } ─────────────────────
 * Validates, awards once per day, bumps the streak. */
workoutRouter.post('/answer', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const choice = Number(req.body?.choice);
  if (!Number.isInteger(choice) || choice < 0) {
    res.status(400).json({ error: 'Invalid choice' });
    return;
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const u = await client.query<{
      xp: number; coins: number; streak: number; last_active: string | null;
      streak_freezes: number; last_workout_date: string | null;
    }>(
      `SELECT xp, coins, streak, last_active, streak_freezes, last_workout_date
       FROM users WHERE id = $1 FOR UPDATE`,
      [req.userId]
    );
    const user = u.rows[0];
    if (!user) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const today = todayStr();
    const { index, question } = getTodaysWorkout();
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

    const reward = correct ? WORKOUT_REWARD_CORRECT : WORKOUT_REWARD_WRONG;

    // Streak: a workout counts as "active today" exactly like a lesson.
    const { newStreak, newFreezes } = computeStreakUpdate(
      { streak: user.streak, last_active: user.last_active, streak_freezes: user.streak_freezes ?? 0 },
      today
    );

    const newXp = user.xp + reward.xp;
    const newCoins = (user.coins ?? 0) + reward.coins;

    await client.query(
      `UPDATE users
         SET xp = $1, coins = $2, streak = $3, streak_freezes = $4,
             last_active = $5, last_workout_date = $5
       WHERE id = $6`,
      [newXp, newCoins, newStreak, newFreezes, today, req.userId]
    );

    await client.query('COMMIT');

    // Fire-and-forget: the workout counts as "active today", so bump shared
    // friend streaks for any friend also active today.
    updateFriendStreaksForUser(req.userId!, today)
      .catch((e) => console.error('friend-streak update failed:', e));

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
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Workout answer error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});
