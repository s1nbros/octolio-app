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
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add avatar column to existing tables that predate this migration
  await pool.query(`
    ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar TEXT DEFAULT '🦊'
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
