import { Router, Response } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth';
import { getPool } from '../db';
import { effectiveStreak } from '../services/friendStreak';
import { todayStr } from '../services/streak';
import { weekStartStr, QUEST_GOAL, QUEST_REWARD_XP, QUEST_REWARD_COINS } from '../services/friendQuest';

export const friendsRouter = Router();

/* ─── Helper: push a notification row ──────────────────────────── */
async function notify(
  userId: number,
  type: string,
  title: string,
  body: string | null,
  link: string | null,
  metadata: Record<string, unknown> | null,
): Promise<void> {
  const pool = getPool();
  await pool.query(
    `INSERT INTO notifications (user_id, type, title, body, link, metadata)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [userId, type, title, body, link, metadata ? JSON.stringify(metadata) : null]
  );
}

/* ─── GET /api/friends/list ─────────────────────────────────────
 * Accepted friends with their stats.
 */
friendsRouter.get('/list', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const rows = (await pool.query(
      `SELECT u.id, u.name, u.xp, u.streak, u.avatar, f.created_at AS friend_since,
              fs.streak_count AS fs_count, fs.last_incr_date AS fs_date
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
       LEFT JOIN friend_streaks fs
         ON fs.user_low = LEAST($1, u.id) AND fs.user_high = GREATEST($1, u.id)
       WHERE f.status = 'accepted'
         AND (f.requester_id = $1 OR f.recipient_id = $1)
       ORDER BY u.xp DESC`,
      [req.userId]
    )).rows as Array<{
      id: number; name: string; xp: number; streak: number; avatar: string | null;
      friend_since: string; fs_count: number | null; fs_date: string | null;
    }>;

    const today = todayStr();
    const friends = rows.map((r) => ({
      id: r.id,
      name: r.name,
      xp: r.xp,
      streak: r.streak,
      avatar: r.avatar,
      friend_since: r.friend_since,
      friend_streak: effectiveStreak(r.fs_count ?? 0, r.fs_date, today),
    }));
    res.json({ friends });
  } catch (err) {
    console.error('Friends list error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── GET /api/friends/pending ─────────────────────────────────
 * Incoming + outgoing pending requests.
 */
friendsRouter.get('/pending', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const incoming = (await pool.query(
      `SELECT f.id AS request_id, u.id, u.name, u.xp, u.avatar, f.created_at
       FROM friendships f
       JOIN users u ON u.id = f.requester_id
       WHERE f.recipient_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.userId]
    )).rows;
    const outgoing = (await pool.query(
      `SELECT f.id AS request_id, u.id, u.name, u.xp, u.avatar, f.created_at
       FROM friendships f
       JOIN users u ON u.id = f.recipient_id
       WHERE f.requester_id = $1 AND f.status = 'pending'
       ORDER BY f.created_at DESC`,
      [req.userId]
    )).rows;
    res.json({ incoming, outgoing });
  } catch (err) {
    console.error('Friends pending error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/request ────────────────────────────────
 * Body: { targetUserId } OR { targetName }
 */
friendsRouter.post('/request', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { targetUserId, targetName } = req.body as { targetUserId?: number; targetName?: string };
  if (!targetUserId && !targetName) {
    res.status(400).json({ error: 'targetUserId or targetName required' });
    return;
  }

  try {
    const pool = getPool();

    // Resolve target
    const userRow = targetUserId
      ? await pool.query('SELECT id, name FROM users WHERE id = $1', [targetUserId])
      : await pool.query('SELECT id, name FROM users WHERE LOWER(name) = LOWER($1)', [targetName]);
    const target = userRow.rows[0] as { id: number; name: string } | undefined;
    if (!target) {
      res.status(404).json({ error: 'user_not_found' });
      return;
    }
    if (target.id === req.userId) {
      res.status(400).json({ error: 'cannot_friend_self' });
      return;
    }

    // Check if any row already exists between these two users (either direction)
    const existing = (await pool.query(
      `SELECT id, requester_id, recipient_id, status FROM friendships
       WHERE (requester_id = $1 AND recipient_id = $2)
          OR (requester_id = $2 AND recipient_id = $1)`,
      [req.userId, target.id]
    )).rows[0] as { id: number; requester_id: number; recipient_id: number; status: string } | undefined;

    if (existing) {
      if (existing.status === 'accepted') {
        res.status(400).json({ error: 'already_friends' });
        return;
      }
      if (existing.status === 'pending') {
        // If the OTHER person already requested us, accept it automatically.
        if (existing.recipient_id === req.userId) {
          await pool.query(
            `UPDATE friendships SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
            [existing.id]
          );
          const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
          await notify(existing.requester_id, 'friend_accepted',
            `${me?.name ?? 'Someone'} accepted your friend request`,
            null, '/friends', { friendId: req.userId });
          res.json({ status: 'accepted', requestId: existing.id });
          return;
        }
        res.status(400).json({ error: 'request_already_pending' });
        return;
      }
      if (existing.status === 'declined') {
        // allow re-request
        await pool.query(
          `UPDATE friendships SET status = 'pending', requester_id = $1, recipient_id = $2, created_at = NOW(), responded_at = NULL WHERE id = $3`,
          [req.userId, target.id, existing.id]
        );
        const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
        await notify(target.id, 'friend_request',
          `${me?.name ?? 'Someone'} sent you a friend request`,
          null, '/friends', { requesterId: req.userId });
        res.json({ status: 'pending', requestId: existing.id });
        return;
      }
    }

    // Create fresh
    const inserted = (await pool.query(
      `INSERT INTO friendships (requester_id, recipient_id) VALUES ($1, $2) RETURNING id`,
      [req.userId, target.id]
    )).rows[0] as { id: number };
    const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
    await notify(target.id, 'friend_request',
      `${me?.name ?? 'Someone'} sent you a friend request`,
      null, '/friends', { requesterId: req.userId });

    res.json({ status: 'pending', requestId: inserted.id });
  } catch (err) {
    console.error('Friends request error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/accept ────────────────────────────────
 * Body: { requestId }
 */
friendsRouter.post('/accept', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { requestId } = req.body as { requestId?: number };
  if (typeof requestId !== 'number') {
    res.status(400).json({ error: 'requestId required' });
    return;
  }
  try {
    const pool = getPool();
    const row = (await pool.query(
      `SELECT requester_id, recipient_id, status FROM friendships WHERE id = $1`,
      [requestId]
    )).rows[0] as { requester_id: number; recipient_id: number; status: string } | undefined;
    if (!row || row.recipient_id !== req.userId) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    if (row.status !== 'pending') {
      res.status(400).json({ error: 'not_pending' });
      return;
    }
    await pool.query(
      `UPDATE friendships SET status = 'accepted', responded_at = NOW() WHERE id = $1`,
      [requestId]
    );
    const me = (await pool.query('SELECT name FROM users WHERE id = $1', [req.userId])).rows[0];
    await notify(row.requester_id, 'friend_accepted',
      `${me?.name ?? 'Someone'} accepted your friend request`,
      null, '/friends', { friendId: req.userId });
    res.json({ ok: true });
  } catch (err) {
    console.error('Friends accept error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/decline ────────────────────────────────
 * Body: { requestId }
 */
friendsRouter.post('/decline', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { requestId } = req.body as { requestId?: number };
  if (typeof requestId !== 'number') {
    res.status(400).json({ error: 'requestId required' });
    return;
  }
  try {
    const pool = getPool();
    const row = (await pool.query(
      `SELECT recipient_id, status FROM friendships WHERE id = $1`,
      [requestId]
    )).rows[0] as { recipient_id: number; status: string } | undefined;
    if (!row || row.recipient_id !== req.userId) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    if (row.status !== 'pending') {
      res.status(400).json({ error: 'not_pending' });
      return;
    }
    await pool.query(
      `UPDATE friendships SET status = 'declined', responded_at = NOW() WHERE id = $1`,
      [requestId]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error('Friends decline error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/cancel ─────────────────────────────────
 * Cancel your own outgoing pending request.
 */
friendsRouter.post('/cancel', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { requestId } = req.body as { requestId?: number };
  if (typeof requestId !== 'number') {
    res.status(400).json({ error: 'requestId required' });
    return;
  }
  try {
    const pool = getPool();
    const row = (await pool.query(
      `SELECT requester_id, status FROM friendships WHERE id = $1`,
      [requestId]
    )).rows[0] as { requester_id: number; status: string } | undefined;
    if (!row || row.requester_id !== req.userId) {
      res.status(404).json({ error: 'not_found' });
      return;
    }
    if (row.status !== 'pending') {
      res.status(400).json({ error: 'not_pending' });
      return;
    }
    await pool.query('DELETE FROM friendships WHERE id = $1', [requestId]);
    res.json({ ok: true });
  } catch (err) {
    console.error('Friends cancel error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/remove ─────────────────────────────────
 * Unfriend an accepted friend. Body: { friendUserId }
 */
friendsRouter.post('/remove', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { friendUserId } = req.body as { friendUserId?: number };
  if (typeof friendUserId !== 'number') {
    res.status(400).json({ error: 'friendUserId required' });
    return;
  }
  try {
    const pool = getPool();
    const result = await pool.query(
      `DELETE FROM friendships
       WHERE status = 'accepted'
         AND ((requester_id = $1 AND recipient_id = $2) OR (requester_id = $2 AND recipient_id = $1))`,
      [req.userId, friendUserId]
    );
    res.json({ ok: true, removed: result.rowCount ?? 0 });
  } catch (err) {
    console.error('Friends remove error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── GET /api/friends/preview/:id ──────────────────────────────
 * Lightweight public-ish snapshot of another user for the mini-profile
 * modal. Includes friendship status with the caller + any pending
 * request id so the modal can wire up Accept/Cancel/Add buttons.
 */
friendsRouter.get('/preview/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'invalid id' });
    return;
  }
  try {
    const pool = getPool();
    const userRow = (await pool.query(
      `SELECT id, name, xp, streak, avatar,
              equipped_hat, equipped_face, equipped_body, is_pro, created_at
       FROM users WHERE id = $1`,
      [id]
    )).rows[0] as {
      id: number; name: string; xp: number; streak: number; avatar: string | null;
      equipped_hat: string | null; equipped_face: string | null; equipped_body: string | null;
      is_pro: boolean; created_at: string;
    } | undefined;

    if (!userRow) {
      res.status(404).json({ error: 'user_not_found' });
      return;
    }

    // Lessons completed (for the small stats row)
    const lessonsRow = (await pool.query(
      `SELECT COUNT(*)::int AS n FROM progress WHERE user_id = $1`,
      [id]
    )).rows[0] as { n: number };

    // Friendship status with the caller
    let friendshipStatus: 'self' | 'friends' | 'pending_out' | 'pending_in' | 'none' = 'none';
    let requestId: number | null = null;
    let friendStreak = 0;
    if (id === req.userId) {
      friendshipStatus = 'self';
    } else {
      const f = (await pool.query(
        `SELECT id, requester_id, recipient_id, status FROM friendships
         WHERE (requester_id = $1 AND recipient_id = $2)
            OR (requester_id = $2 AND recipient_id = $1)`,
        [req.userId, id]
      )).rows[0] as { id: number; requester_id: number; recipient_id: number; status: string } | undefined;
      if (f) {
        requestId = f.id;
        if (f.status === 'accepted') {
          friendshipStatus = 'friends';
          const fs = (await pool.query(
            `SELECT streak_count, last_incr_date FROM friend_streaks
             WHERE user_low = LEAST($1, $2) AND user_high = GREATEST($1, $2)`,
            [req.userId, id]
          )).rows[0] as { streak_count: number; last_incr_date: string | null } | undefined;
          if (fs) friendStreak = effectiveStreak(fs.streak_count, fs.last_incr_date, todayStr());
        } else if (f.status === 'pending') {
          friendshipStatus = f.requester_id === req.userId ? 'pending_out' : 'pending_in';
        }
      }
    }

    res.json({
      id: userRow.id,
      name: userRow.name,
      avatar: userRow.avatar,
      xp: userRow.xp,
      streak: userRow.streak,
      isPro: userRow.is_pro,
      equippedHat:  userRow.equipped_hat,
      equippedFace: userRow.equipped_face,
      equippedBody: userRow.equipped_body,
      lessonsCompleted: lessonsRow?.n ?? 0,
      memberSince: userRow.created_at,
      friendshipStatus,
      requestId,
      friendStreak,
    });
  } catch (err) {
    console.error('Friends preview error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── GET /api/friends/search?q=... ────────────────────────────
 * Up to 10 users with names matching q, excluding self and existing
 * accepted friends. Returns { results: [{id, name, xp, avatar, status}] }
 * where status ∈ 'none' | 'pending_out' | 'pending_in' | 'friends'.
 */
friendsRouter.get('/search', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const q = (req.query.q as string | undefined)?.trim();
  if (!q || q.length < 2) {
    res.json({ results: [] });
    return;
  }
  try {
    const pool = getPool();
    const rows = (await pool.query(
      `SELECT u.id, u.name, u.xp, u.avatar,
              f.status AS f_status, f.requester_id, f.recipient_id
       FROM users u
       LEFT JOIN friendships f
         ON ((f.requester_id = $1 AND f.recipient_id = u.id)
          OR (f.recipient_id = $1 AND f.requester_id = u.id))
       WHERE u.id <> $1 AND LOWER(u.name) LIKE LOWER($2)
       ORDER BY u.xp DESC
       LIMIT 10`,
      [req.userId, `%${q}%`]
    )).rows as Array<{
      id: number; name: string; xp: number; avatar: string | null;
      f_status: string | null; requester_id: number | null; recipient_id: number | null;
    }>;

    const results = rows.map((r) => {
      let status: 'none' | 'pending_out' | 'pending_in' | 'friends' = 'none';
      if (r.f_status === 'accepted') status = 'friends';
      else if (r.f_status === 'pending') status = r.requester_id === req.userId ? 'pending_out' : 'pending_in';
      return { id: r.id, name: r.name, xp: r.xp, avatar: r.avatar, status };
    });

    res.json({ results });
  } catch (err) {
    console.error('Friends search error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── GET /api/friends/quests ──────────────────────────────────
 * This week's co-op quests. One per accepted friend, with combined XP
 * progress toward the shared goal and whether the caller can claim.
 */
friendsRouter.get('/quests', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const pool = getPool();
    const week = weekStartStr(todayStr());
    const rows = (await pool.query(
      `SELECT u.id AS friend_id, u.name AS friend_name, u.avatar AS friend_avatar,
              q.goal, q.xp_low, q.xp_high, q.claimed_low, q.claimed_high
       FROM friendships f
       JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
       LEFT JOIN friend_quests q
         ON q.user_low = LEAST($1, u.id) AND q.user_high = GREATEST($1, u.id)
        AND q.week_start = $2
       WHERE f.status = 'accepted'
         AND (f.requester_id = $1 OR f.recipient_id = $1)
       ORDER BY (COALESCE(q.xp_low, 0) + COALESCE(q.xp_high, 0)) DESC`,
      [req.userId, week]
    )).rows as Array<{
      friend_id: number; friend_name: string; friend_avatar: string | null;
      goal: number | null; xp_low: number | null; xp_high: number | null;
      claimed_low: boolean | null; claimed_high: boolean | null;
    }>;

    const quests = rows.map((r) => {
      const goal = r.goal ?? QUEST_GOAL;
      const yourIsLow = (req.userId as number) < r.friend_id;
      const yours = (yourIsLow ? r.xp_low : r.xp_high) ?? 0;
      const theirs = (yourIsLow ? r.xp_high : r.xp_low) ?? 0;
      const combined = yours + theirs;
      const youClaimed = (yourIsLow ? r.claimed_low : r.claimed_high) ?? false;
      const complete = combined >= goal;
      return {
        friendId: r.friend_id,
        friendName: r.friend_name,
        friendAvatar: r.friend_avatar,
        goal,
        combined,
        yourContribution: yours,
        friendContribution: theirs,
        complete,
        claimed: youClaimed,
        claimable: complete && !youClaimed,
        rewardXp: QUEST_REWARD_XP,
        rewardCoins: QUEST_REWARD_COINS,
      };
    });

    res.json({ weekStart: week, goal: QUEST_GOAL, quests });
  } catch (err) {
    console.error('Friend quests error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

/* ─── POST /api/friends/quests/claim ───────────────────────────
 * Body: { friendId }. Claim this week's co-op reward once the combined
 * goal is met. Transactional + FOR UPDATE so a double-tap can't double-pay.
 */
friendsRouter.post('/quests/claim', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  const { friendId } = req.body as { friendId?: number };
  if (typeof friendId !== 'number') {
    res.status(400).json({ error: 'friendId required' });
    return;
  }
  const pool = getPool();
  const client = await pool.connect();
  try {
    const me = req.userId as number;
    const low = Math.min(me, friendId);
    const high = Math.max(me, friendId);
    const isLow = me === low;
    const week = weekStartStr(todayStr());

    await client.query('BEGIN');

    const q = (await client.query(
      `SELECT goal, xp_low, xp_high, claimed_low, claimed_high
         FROM friend_quests
        WHERE user_low = $1 AND user_high = $2 AND week_start = $3
        FOR UPDATE`,
      [low, high, week]
    )).rows[0] as {
      goal: number; xp_low: number; xp_high: number; claimed_low: boolean; claimed_high: boolean;
    } | undefined;

    if (!q) {
      await client.query('ROLLBACK');
      res.status(404).json({ error: 'no_quest' });
      return;
    }
    if (q.xp_low + q.xp_high < q.goal) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'goal_not_met' });
      return;
    }
    if (isLow ? q.claimed_low : q.claimed_high) {
      await client.query('ROLLBACK');
      res.status(400).json({ error: 'already_claimed' });
      return;
    }

    await client.query(
      `UPDATE friend_quests SET ${isLow ? 'claimed_low' : 'claimed_high'} = TRUE, updated_at = NOW()
        WHERE user_low = $1 AND user_high = $2 AND week_start = $3`,
      [low, high, week]
    );

    const upd = (await client.query(
      `UPDATE users SET xp = xp + $2, coins = COALESCE(coins, 0) + $3 WHERE id = $1
       RETURNING xp, coins`,
      [me, QUEST_REWARD_XP, QUEST_REWARD_COINS]
    )).rows[0] as { xp: number; coins: number };

    await client.query('COMMIT');
    res.json({ ok: true, xp: upd.xp, coins: upd.coins, rewardXp: QUEST_REWARD_XP, rewardCoins: QUEST_REWARD_COINS });
  } catch (err) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Friend quest claim error:', err);
    res.status(500).json({ error: 'Server error' });
  } finally {
    client.release();
  }
});

/* ─── Internal helper used by other routes ────────────────────── */
export async function detectCrossesAndNotify(
  userId: number,
  userName: string,
  oldXp: number,
  newXp: number,
): Promise<number> {
  if (newXp <= oldXp) return 0;
  const pool = getPool();
  // Find accepted friends whose xp is strictly between oldXp and (newXp - 1) inclusive.
  // i.e. friend.xp >= oldXp AND friend.xp < newXp → user just crossed them.
  // Strict: friend was at or above us, now we're above them.
  // To avoid notifying when we were already ahead, require friend.xp >= oldXp.
  const crossed = (await pool.query(
    `SELECT u.id, u.name, u.xp FROM friendships f
     JOIN users u ON u.id = CASE WHEN f.requester_id = $1 THEN f.recipient_id ELSE f.requester_id END
     WHERE f.status = 'accepted'
       AND (f.requester_id = $1 OR f.recipient_id = $1)
       AND u.xp >= $2 AND u.xp < $3`,
    [userId, oldXp, newXp]
  )).rows as Array<{ id: number; name: string; xp: number }>;

  for (const c of crossed) {
    // Notify the friend that they just got overtaken.
    await pool.query(
      `INSERT INTO notifications (user_id, type, title, body, link, metadata)
       VALUES ($1, 'friend_overtook', $2, $3, '/league', $4)`,
      [
        c.id,
        `${userName} just overtook you in XP`,
        `They jumped from ${oldXp.toLocaleString()} to ${newXp.toLocaleString()} XP. Time to fight back!`,
        JSON.stringify({ overtakerId: userId, overtakerXp: newXp, yourXp: c.xp }),
      ]
    );
  }
  return crossed.length;
}
