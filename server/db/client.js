import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../schema/schema.js';
import { config } from 'dotenv';

config({ path: ".env" });

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 20,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 10000
});

export const db = drizzle(pool, { schema });
