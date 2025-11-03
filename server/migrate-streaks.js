import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { sql } from 'drizzle-orm';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const db = drizzle(pool);

async function migrateStreaks() {
  try {
    console.log('Creating streak tables...');

    // Create streaks table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS streaks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
        current_streak INTEGER NOT NULL DEFAULT 0,
        longest_streak INTEGER NOT NULL DEFAULT 0,
        last_activity_date TIMESTAMP,
        freeze_used BOOLEAN NOT NULL DEFAULT false,
        total_active_days INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Streaks table created');

    // Create badges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS badges (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        milestone_days INTEGER NOT NULL UNIQUE,
        icon_emoji TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Badges table created');

    // Create user_badges table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_badges (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        badge_id INTEGER NOT NULL REFERENCES badges(id) ON DELETE CASCADE,
        earned_at TIMESTAMP NOT NULL DEFAULT NOW(),
        is_new BOOLEAN NOT NULL DEFAULT true
      );
    `);
    console.log('✓ User badges table created');

    // Create streak_history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS streak_history (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        activity_date TIMESTAMP NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log('✓ Streak history table created');

    console.log('All streak tables created successfully!');
  } catch (error) {
    console.error('Error creating streak tables:', error);
  } finally {
    await pool.end();
  }
}

migrateStreaks();
