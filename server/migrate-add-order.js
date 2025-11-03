import { neon } from '@neondatabase/serverless';
import dotenv from 'dotenv';

dotenv.config();

const sql = neon(process.env.DATABASE_URL);

async function migrate() {
  try {
    console.log('Starting migration to add order columns...');
    
    // Add order column to sections table
    await sql`ALTER TABLE sections ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`;
    console.log('✅ Added order column to sections table');
    
    // Add order column to sub_sections table
    await sql`ALTER TABLE sub_sections ADD COLUMN IF NOT EXISTS "order" INTEGER NOT NULL DEFAULT 0`;
    console.log('✅ Added order column to sub_sections table');
    
    // Update existing records with sequential order based on id
    await sql`
      UPDATE sections 
      SET "order" = subquery.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY course_id ORDER BY id) as row_num
        FROM sections
      ) AS subquery
      WHERE sections.id = subquery.id
    `;
    console.log('✅ Updated order for existing sections');
    
    await sql`
      UPDATE sub_sections 
      SET "order" = subquery.row_num - 1
      FROM (
        SELECT id, ROW_NUMBER() OVER (PARTITION BY section_id ORDER BY id) as row_num
        FROM sub_sections
      ) AS subquery
      WHERE sub_sections.id = subquery.id
    `;
    console.log('✅ Updated order for existing sub_sections');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
  process.exit(0);
}

migrate();
