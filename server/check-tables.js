import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function checkTables() {
  try {
    const client = await pool.connect();
    
    // Check if badges table exists and its structure
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'badges'
      ORDER BY ordinal_position;
    `);
    
    console.log('Badges table columns:');
    console.log(result.rows);
    
    client.release();
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await pool.end();
  }
}

checkTables();
