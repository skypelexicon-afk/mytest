import dotenv from 'dotenv';
import { defineConfig } from "drizzle-kit";

dotenv.config({ path: '.env' });

export default defineConfig({
  schema: "./schema/schema.js",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
