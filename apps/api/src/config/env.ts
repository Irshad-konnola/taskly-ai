import { z } from 'zod';
import dotenv from 'dotenv';

// Load variables from the .env file into process.env
dotenv.config();

// 1. Define the exact shape and requirements of our environment variables
const envSchema = z.object({
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  DATABASE_URL: z.string().url("Database URL must be a valid URL"),
  REDIS_URL: z.string().url("Redis URL must be a valid URL"),
});

// 2. Safely parse process.env against our schema
const _env = envSchema.safeParse(process.env);

// 3. If validation fails, log the exact errors and crash the app immediately (Crash-Fast)
if (!_env.success) {
  console.error("❌ Invalid environment variables:");
  console.error(_env.error.format());
  process.exit(1); 
}

// 4. Export the validated, strictly-typed variables
export const env = _env.data;