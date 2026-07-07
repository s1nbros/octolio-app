// ───────────────────────────────────────────────────────────────
// friendStreak.ts — shared "friend streak" logic.
//
// A friend streak grows by 1 on every calendar day that BOTH friends were
// active (completed a lesson or the Daily Money Workout), and breaks once a
// day passes without both being active. It mirrors Duolingo's Friend Streak.
//
// The heavy lifting is a single atomic upsert per pair so two friends
// finishing at the same moment can't double-count the day.
// ───────────────────────────────────────────────────────────────

import { getPool } from '../db';

/** Milestones that trigger a celebratory notification to both friends. */
const MILESTONES = new Set([3, 7, 14, 30, 50, 100, 200, 365]);

/** The 'YYYY-MM-DD' calendar day before `today`. */
function prevDay(today: string): string {
  const d = new Date(today + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().split('T')[0];
}

/**
 * Called after `userId` has been marked active on `today`. For every accepted
 * friend who is ALSO active today, bump the shared friend streak. Safe to call
 * fire-and-forget; never throws to the caller path.
 */
export async function updateFriendStreaksForUser(userId: number, today: string): Promise<void> {
  const pool = getPool();
  const yesterday = prevDay(today);

  // Friends (accepted) who were also active today. `last_active` is stored as a
  // 'YYYY-MM-DD' string, so an equality check against today is sufficient.
  const friends = (await pool.query(
    `SELECT u.id, u.name
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
      WHERE f.status = 'accepted'
        AND (f.requester_id = $1 OR f.recipient_id = $1)
        AND u.last_active = $2`,
    [userId, today]
  )).rows as Array<{ id: number; name: string }>;

  if (friends.length === 0) return;

  const meName = (await pool.query('SELECT name FROM users WHERE id = $1', [userId])).rows[0]?.name ?? 'Your friend';

  for (const friend of friends) {
    const low = Math.min(userId, friend.id);
    const high = Math.max(userId, friend.id);

    // Atomic once-per-day bump. The WHERE guard on the conflict path means a
    // second call on the same day is a no-op (returns no row).
    const bumped = (await pool.query(
      `INSERT INTO friend_streaks (user_low, user_high, streak_count, best_streak, last_incr_date)
       VALUES ($1, $2, 1, 1, $3)
       ON CONFLICT (user_low, user_high) DO UPDATE
         SET streak_count = CASE
               WHEN friend_streaks.last_incr_date = $4 THEN friend_streaks.streak_count + 1
               ELSE 1
             END,
             best_streak = GREATEST(
               friend_streaks.best_streak,
               CASE WHEN friend_streaks.last_incr_date = $4 THEN friend_streaks.streak_count + 1 ELSE 1 END
             ),
             last_incr_date = $3,
             updated_at = NOW()
         WHERE friend_streaks.last_incr_date IS DISTINCT FROM $3
       RETURNING streak_count`,
      [low, high, today, yesterday]
    )).rows[0] as { streak_count: number } | undefined;

    if (!bumped) continue; // already counted today

    const count = bumped.streak_count;
    if (MILESTONES.has(count)) {
      // Congratulate both sides.
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, link, metadata)
         VALUES ($1, 'friend_streak', $2, $3, '/profile?tab=friends', $4)`,
        [
          userId,
          `🤝 ${count}-day streak with ${friend.name}!`,
          `You and ${friend.name} have both practiced ${count} days in a row. Keep it alive!`,
          JSON.stringify({ friendId: friend.id, streak: count }),
        ]
      );
      await pool.query(
        `INSERT INTO notifications (user_id, type, title, body, link, metadata)
         VALUES ($1, 'friend_streak', $2, $3, '/profile?tab=friends', $4)`,
        [
          friend.id,
          `🤝 ${count}-day streak with ${meName}!`,
          `You and ${meName} have both practiced ${count} days in a row. Keep it alive!`,
          JSON.stringify({ friendId: userId, streak: count }),
        ]
      );
    }
  }
}

/**
 * Effective (display) streak for a pair given its stored state: alive if the
 * last bump was today or yesterday, otherwise the run has broken → 0.
 */
export function effectiveStreak(streakCount: number, lastIncrDate: string | null, today: string): number {
  if (!lastIncrDate) return 0;
  if (lastIncrDate === today || lastIncrDate === prevDay(today)) return streakCount;
  return 0;
}
