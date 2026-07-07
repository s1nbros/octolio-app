import { Pool } from 'pg';

if (!process.env.DATABASE_URL) {
  console.error('ERROR: DATABASE_URL environment variable is not set');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

export function getPool(): Pool {
  return pool;
}

export async function initDb(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      name TEXT NOT NULL,
      xp INTEGER DEFAULT 0,
      streak INTEGER DEFAULT 0,
      last_active TEXT,
      avatar TEXT DEFAULT '🦊',
      created_at TIMESTAMP DEFAULT NOW(),
      is_pro BOOLEAN DEFAULT FALSE,
      energy INTEGER DEFAULT 12,
      energy_refill_at TIMESTAMP,
      stripe_customer_id TEXT,
      stripe_subscription_id TEXT,
      onboarding_done BOOLEAN DEFAULT FALSE
    )
  `);

  // Migrations for existing tables
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🦊'`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_pro BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS energy INTEGER DEFAULT 12`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS energy_refill_at TIMESTAMP`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_done BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_token TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_code TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verification_expires_at TIMESTAMP`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_token TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS password_reset_expires_at TIMESTAMP`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS streak_freezes INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_costume TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_hat TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_face TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS equipped_body TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS chests_opened INTEGER DEFAULT 0`);

  // Google OAuth — google_id links the account to a verified Google user.
  // We allow it to be NULL for legacy email/password accounts that never logged in via Google.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id TEXT`);
  await pool.query(`CREATE UNIQUE INDEX IF NOT EXISTS users_google_id_uniq ON users (google_id) WHERE google_id IS NOT NULL`);
  // Google-only accounts have no password. Drop the NOT NULL constraint if it's still present
  // (pre-existing rows always have a hash; new Google-only rows insert NULL).
  await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`).catch(() => {});

  // Wheel of Luck — one spin per account, ever. Pro trial is granted in-app
  // (no Stripe involvement); pro_trial_ends_at marks when to lazily downgrade.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wheel_spun BOOLEAN DEFAULT FALSE`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS pro_trial_ends_at TIMESTAMP`);
  // Convert pro_trial_ends_at to TIMESTAMPTZ so NOW()-vs-stored comparisons in
  // the lazy-downgrade query are timezone-safe. Safe to run repeatedly — Postgres
  // no-ops if the column is already TIMESTAMPTZ.
  await pool.query(`
    ALTER TABLE users
      ALTER COLUMN pro_trial_ends_at TYPE TIMESTAMPTZ
      USING pro_trial_ends_at AT TIME ZONE 'UTC'
  `).catch(() => {});
  await pool.query(`
    CREATE TABLE IF NOT EXISTS wheel_prizes (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      reward_type TEXT NOT NULL,          -- 'xp' | 'cosmetic' | 'pro_trial' | 'cup'
      reward_value TEXT,                  -- amount as string, item id, '14d', or 'cup'
      won_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS wheel_prizes_type_idx ON wheel_prizes (reward_type)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS wheel_prizes_user_idx ON wheel_prizes (user_id)`);

  // Onboarding profile — captured by the goal-based onboarding wizard.
  //   goal             — what the user wants to achieve (save/debt/invest/understand/budget)
  //   experience_level — beginner/intermediate/advanced, derived from the diagnostic
  //   daily_goal_min   — chosen daily commitment in minutes (3/5/10) → drives streak target
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS goal TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS experience_level TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS daily_goal_min INTEGER DEFAULT 5`);

  // Daily Money Workout — one bite-sized question per calendar day.
  // last_workout_date ('YYYY-MM-DD') gates the once-per-day reward.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_workout_date TEXT`);

  // AI "Explain my mistake" — free users get a small daily quota of AI-generated
  // explanations of why an answer was wrong; Pro users are unlimited.
  //   ai_explain_date  ('YYYY-MM-DD') — the day ai_explain_count applies to
  //   ai_explain_count — explanations used on ai_explain_date (reset lazily when the day rolls over)
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_explain_date TEXT`);
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS ai_explain_count INTEGER DEFAULT 0`);

  // Reminder-email cadence — last date we emailed this user a reminder, so the
  // cron can avoid daily nagging and rate-limit win-back emails to ~monthly.
  await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_reminder_sent TEXT`);

  // Backfill the new per-slot columns from the old single equipped_costume
  // for accounts created before multi-slot equip existed. Safe to run on
  // every boot: we only write if the new column is NULL.
  await pool.query(`
    UPDATE users u
    SET equipped_hat  = CASE WHEN u.equipped_hat  IS NULL AND ci.slot = 'hat'  THEN u.equipped_costume ELSE u.equipped_hat  END,
        equipped_face = CASE WHEN u.equipped_face IS NULL AND ci.slot = 'face' THEN u.equipped_costume ELSE u.equipped_face END,
        equipped_body = CASE WHEN u.equipped_body IS NULL AND ci.slot = 'body' THEN u.equipped_costume ELSE u.equipped_body END
    FROM (VALUES
      ('hat_baseball','hat'),('hat_tophat','hat'),('hat_graduation','hat'),('hat_hardhat','hat'),
      ('hat_helmet','hat'),('hat_pumpkin','hat'),('hat_crown','hat'),('hat_halo','hat'),
      ('face_goggles','face'),('face_glasses','face'),('face_monocle','face'),('face_3d','face'),
      ('body_scarf','body'),('body_bowtie','body'),('body_vest','body'),('body_rocket','body')
    ) AS ci(item_id, slot)
    WHERE u.equipped_costume IS NOT NULL AND ci.item_id = u.equipped_costume
  `);

  // Existing accounts predate the verification flow — grandfather them in so the
  // upgrade doesn't lock active users out.
  await pool.query(`
    UPDATE users SET email_verified = TRUE
    WHERE email_verified = FALSE AND (xp > 0 OR last_active IS NOT NULL)
  `);

  // Mark existing users (with any XP or existing activity) as onboarding complete
  // so they don't get stuck on the plan selection page after the upgrade
  await pool.query(`
    UPDATE users SET onboarding_done = TRUE
    WHERE onboarding_done = FALSE AND (xp > 0 OR last_active IS NOT NULL)
  `);

  // Holds registrations that haven't been email-verified yet. The actual
  // `users` row is only created once the verification code/link is consumed.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS pending_registrations (
      email TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      password_hash TEXT NOT NULL,
      verification_code TEXT NOT NULL,
      verification_token TEXT NOT NULL UNIQUE,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS pending_registrations_name_lower_idx ON pending_registrations (LOWER(name))`);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS progress (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      lesson_id TEXT NOT NULL,
      module_id TEXT NOT NULL,
      xp_earned INTEGER DEFAULT 0,
      completed_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, lesson_id)
    )
  `);

  // Spaced-repetition table: tracks exercises the user got wrong + their
  // Leitner-box level. Exercise content is looked up from lessons.ts at
  // review time via (module_id, lesson_id, exercise_id).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS exercise_reviews (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      module_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      exercise_id TEXT NOT NULL,
      box_level INTEGER NOT NULL DEFAULT 1,
      first_missed_at TIMESTAMP DEFAULT NOW(),
      last_reviewed_at TIMESTAMP,
      next_review_at TIMESTAMP NOT NULL DEFAULT NOW(),
      times_reviewed INTEGER NOT NULL DEFAULT 0,
      times_correct INTEGER NOT NULL DEFAULT 0,
      mastered BOOLEAN NOT NULL DEFAULT FALSE,
      UNIQUE(user_id, module_id, lesson_id, exercise_id)
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS exercise_reviews_due_idx ON exercise_reviews (user_id, next_review_at) WHERE mastered = FALSE`);

  // Friendships: directed request rows. status moves pending → accepted | declined.
  // requester_id ALWAYS < recipient_id on the wire? No — we keep direction so we
  // know who initiated. Uniqueness via (requester, recipient).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS friendships (
      id SERIAL PRIMARY KEY,
      requester_id INTEGER NOT NULL REFERENCES users(id),
      recipient_id INTEGER NOT NULL REFERENCES users(id),
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TIMESTAMP DEFAULT NOW(),
      responded_at TIMESTAMP,
      UNIQUE(requester_id, recipient_id),
      CHECK(requester_id <> recipient_id)
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS friendships_recipient_idx ON friendships(recipient_id, status)`);
  await pool.query(`CREATE INDEX IF NOT EXISTS friendships_requester_idx ON friendships(requester_id, status)`);

  // Friend streaks — a shared streak between two friends that grows on every
  // calendar day BOTH were active, and breaks if a day passes without both.
  // The pair is stored normalized (user_low < user_high) so there is exactly
  // one row per friendship regardless of who requested it.
  //   last_incr_date — 'YYYY-MM-DD' the streak was last bumped (both active)
  //   streak_count   — current run length; considered broken (effectively 0)
  //                    on read once last_incr_date is older than yesterday
  await pool.query(`
    CREATE TABLE IF NOT EXISTS friend_streaks (
      user_low INTEGER NOT NULL REFERENCES users(id),
      user_high INTEGER NOT NULL REFERENCES users(id),
      streak_count INTEGER NOT NULL DEFAULT 0,
      best_streak INTEGER NOT NULL DEFAULT 0,
      last_incr_date TEXT,
      updated_at TIMESTAMP DEFAULT NOW(),
      PRIMARY KEY (user_low, user_high),
      CHECK (user_low < user_high)
    )
  `);

  // Notifications: in-app feed. read flag drives the unread badge.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      body TEXT,
      link TEXT,
      metadata JSONB,
      read BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS notifications_user_unread_idx ON notifications(user_id, read, created_at DESC)`);

  // Inventory: cosmetic items the user owns. Items are identified by string ID
  // (defined in src/data/catalog.ts). Equipped is a duplicated flag for fast
  // lookup; the single equipped item also lives on users.equipped_costume.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS user_inventory (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      item_id TEXT NOT NULL,
      acquired_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, item_id)
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS user_inventory_user_idx ON user_inventory(user_id)`);

  // Chest opens (audit log + rng record).
  await pool.query(`
    CREATE TABLE IF NOT EXISTS chest_opens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      reward_type TEXT NOT NULL,
      reward_value TEXT NOT NULL,
      coins_delta INTEGER NOT NULL DEFAULT 0,
      xp_delta INTEGER NOT NULL DEFAULT 0,
      opened_at TIMESTAMP DEFAULT NOW()
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS chest_opens_user_idx ON chest_opens(user_id, opened_at DESC)`);

  // Per-module chest positions. Each module gets two chests (mid and end);
  // a row here means the user has already opened that specific chest.
  await pool.query(`
    CREATE TABLE IF NOT EXISTS module_chests (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id),
      module_id TEXT NOT NULL,
      position TEXT NOT NULL,
      opened_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, module_id, position)
    )
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS module_chests_user_idx ON module_chests(user_id)`);

  console.log('Database initialized');
}
