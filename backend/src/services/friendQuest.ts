// ───────────────────────────────────────────────────────────────
// friendQuest.ts — weekly co-op quest logic.
//
// Each accepted friend pair shares a weekly quest: their combined XP earned
// during the ISO week counts toward a goal. When the combined total reaches
// the goal, each friend can claim a reward once. Progress is accumulated
// fire-and-forget whenever a user earns XP (lesson or Daily Workout).
// ───────────────────────────────────────────────────────────────

import { getPool } from '../db';

export const QUEST_GOAL = 500;         // combined XP needed
export const QUEST_REWARD_XP = 120;    // per-friend reward
export const QUEST_REWARD_COINS = 25;  // per-friend reward

/** Monday (UTC) of the ISO week containing `today` ('YYYY-MM-DD'). */
export function weekStartStr(today: string): string {
  const d = new Date(today + 'T00:00:00Z');
  const dow = d.getUTCDay();            // 0=Sun..6=Sat
  const back = (dow + 6) % 7;           // days since Monday
  d.setUTCDate(d.getUTCDate() - back);
  return d.toISOString().split('T')[0];
}

/**
 * Add `xpEarned` to the caller's side of the current-week co-op quest for every
 * accepted friend. Safe to call fire-and-forget; never throws to the caller path.
 */
export async function contributeToFriendQuests(userId: number, xpEarned: number, today: string): Promise<void> {
  if (xpEarned <= 0) return;
  const pool = getPool();
  const week = weekStartStr(today);

  const friendIds = (await pool.query(
    `SELECT CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END AS fid
       FROM friendships f
      WHERE f.status = 'accepted' AND (f.requester_id = $1 OR f.recipient_id = $1)`,
    [userId]
  )).rows as Array<{ fid: number }>;

  for (const { fid } of friendIds) {
    const low = Math.min(userId, fid);
    const high = Math.max(userId, fid);
    const isLow = userId === low;
    const addLow = isLow ? xpEarned : 0;
    const addHigh = isLow ? 0 : xpEarned;

    await pool.query(
      `INSERT INTO friend_quests (user_low, user_high, week_start, goal, xp_low, xp_high)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (user_low, user_high, week_start) DO UPDATE
         SET xp_low = friend_quests.xp_low + $5,
             xp_high = friend_quests.xp_high + $6,
             updated_at = NOW()`,
      [low, high, week, QUEST_GOAL, addLow, addHigh]
    );
  }
}
