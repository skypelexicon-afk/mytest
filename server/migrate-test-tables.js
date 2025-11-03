import { Pool } from 'pg';
import { config } from 'dotenv';

config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

async function createTestTables() {
  const client = await pool.connect();
  
  try {
    console.log("Creating test portal tables...");

    // Create enums
    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'test_status') THEN
          CREATE TYPE test_status AS ENUM ('draft', 'published', 'archived');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'question_type') THEN
          CREATE TYPE question_type AS ENUM ('mcq', 'multiple_correct', 'true_false', 'numerical');
        END IF;
      END $$;
    `);

    await client.query(`
      DO $$ BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'exam_status') THEN
          CREATE TYPE exam_status AS ENUM ('in_progress', 'submitted', 'completed');
        END IF;
      END $$;
    `);

    // Create tests table
    await client.query(`
      CREATE TABLE IF NOT EXISTS tests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        subject TEXT NOT NULL,
        duration INTEGER NOT NULL,
        total_marks INTEGER NOT NULL,
        num_questions INTEGER NOT NULL,
        description TEXT,
        instructions TEXT,
        status test_status NOT NULL DEFAULT 'draft',
        created_by INTEGER NOT NULL REFERENCES users(id),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create questions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS questions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER NOT NULL REFERENCES tests(id) ON DELETE CASCADE,
        question_text TEXT NOT NULL,
        question_type question_type NOT NULL,
        options JSONB,
        correct_answers JSONB NOT NULL,
        marks INTEGER NOT NULL DEFAULT 1,
        negative_marks DOUBLE PRECISION DEFAULT 0,
        explanation TEXT,
        "order" INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create exam_sessions table
    await client.query(`
      CREATE TABLE IF NOT EXISTS exam_sessions (
        id SERIAL PRIMARY KEY,
        test_id INTEGER NOT NULL REFERENCES tests(id),
        student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        answers JSONB,
        marked_for_review JSONB,
        start_time TIMESTAMP NOT NULL DEFAULT NOW(),
        end_time TIMESTAMP,
        score DOUBLE PRECISION,
        status exam_status NOT NULL DEFAULT 'in_progress',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // Create indexes for better query performance
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_tests_created_by ON tests(created_by);
      CREATE INDEX IF NOT EXISTS idx_tests_status ON tests(status);
      CREATE INDEX IF NOT EXISTS idx_questions_test_id ON questions(test_id);
      CREATE INDEX IF NOT EXISTS idx_exam_sessions_test_id ON exam_sessions(test_id);
      CREATE INDEX IF NOT EXISTS idx_exam_sessions_student_id ON exam_sessions(student_id);
    `);

    console.log("✅ Test portal tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

createTestTables().catch(console.error);
