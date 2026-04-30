"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPool = getPool;
exports.initDb = initDb;
const pg_1 = require("pg");
if (!process.env.DATABASE_URL) {
    console.error('ERROR: DATABASE_URL environment variable is not set');
    process.exit(1);
}
const pool = new pg_1.Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
});
function getPool() {
    return pool;
}
async function initDb() {
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
    console.log('Database initialized');
}
