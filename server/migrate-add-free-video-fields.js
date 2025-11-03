import { Pool } from 'pg';
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000
});

async function addFreeVideoFields() {
  const client = await pool.connect();
  
  try {
    console.log("🔄 Starting migration: Adding free video fields to sub_sections table...");

    // Add youtube_video_url column
    await client.query(`
      ALTER TABLE sub_sections 
      ADD COLUMN IF NOT EXISTS youtube_video_url TEXT;
    `);
    console.log("✅ Added youtube_video_url column");

    // Add is_free column with default false
    await client.query(`
      ALTER TABLE sub_sections 
      ADD COLUMN IF NOT EXISTS is_free BOOLEAN DEFAULT false;
    `);
    console.log("✅ Added is_free column");

    // Set existing records to have is_free = false (just to be explicit)
    await client.query(`
      UPDATE sub_sections 
      SET is_free = false 
      WHERE is_free IS NULL;
    `);
    console.log("✅ Set default values for existing records");

    console.log("🎉 Migration completed successfully!");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

addFreeVideoFields()
  .then(() => {
    console.log("✅ All migrations completed");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Migration error:", err);
    process.exit(1);
  });
