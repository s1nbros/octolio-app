// ───────────────────────────────────────────────────────────────
// streak.ts — shared streak-update logic.
//
// Both lesson completion (/api/progress/complete) and the Daily Money
// Workout (/api/workout/answer) count as "active today" and run the same
// calendar-day streak rules through this helper, so a 60-second workout
// keeps a streak alive exactly like a full lesson does.
// ───────────────────────────────────────────────────────────────

export interface StreakInput {
  streak: number;
  last_active: string | null; // 'YYYY-MM-DD'
  streak_freezes: number;
}

export interface StreakResult {
  newStreak: number;
  newFreezes: number;
  freezesUsed: number;
  /** True if this action bumped the streak (first activity on a new day). */
  bumped: boolean;
}

/** Today's date as 'YYYY-MM-DD' (UTC, matching the rest of the codebase). */
export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

/**
 * Compute the streak/freeze update for an action happening `today`.
 * Mirrors the original inline logic from /api/progress/complete:
 *   daysSince 0 → already active today, no change
 *   daysSince 1 → +1
 *   daysSince >1 → spend (daysSince-1) freezes to save it, else reset to 1
 *   no prior activity → 1
 */
export function computeStreakUpdate(u: StreakInput, today: string): StreakResult {
  let daysSince = Infinity;
  if (u.last_active) {
    const lastDate = new Date(u.last_active + 'T00:00:00');
    const todayDate = new Date(today + 'T00:00:00');
    daysSince = Math.round((todayDate.getTime() - lastDate.getTime()) / 86400000);
  }

  let newStreak = u.streak;
  let newFreezes = u.streak_freezes ?? 0;
  let freezesUsed = 0;
  let bumped = false;

  if (daysSince === 0) {
    // already practiced today — no change
  } else if (daysSince === 1) {
    newStreak = newStreak + 1;
    bumped = true;
  } else if (daysSince > 1) {
    const missed = daysSince - 1;
    if (newFreezes >= missed) {
      newFreezes -= missed;
      freezesUsed = missed;
      newStreak = newStreak + 1;
      bumped = true;
    } else {
      newStreak = 1;
      bumped = true;
    }
  } else {
    // No prior activity — first action ever
    newStreak = 1;
    bumped = true;
  }

  return { newStreak, newFreezes, freezesUsed, bumped };
}
