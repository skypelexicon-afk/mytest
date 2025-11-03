import { db } from './db/client.js';
import { sql } from 'drizzle-orm';

async function migrate() {
  try {
    console.log('Creating subsection_progress table...');
    
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS subsection_progress (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        subsection_id INTEGER NOT NULL REFERENCES sub_sections(id) ON DELETE CASCADE,
        is_completed BOOLEAN NOT NULL DEFAULT false,
        completed_at TIMESTAMP,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE(user_id, subsection_id)
      )
    `);
    
    console.log('✅ Migration completed successfully!');
    console.log('Table subsection_progress created.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

migrate();
