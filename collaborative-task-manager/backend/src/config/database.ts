import { z } from 'zod';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // For PostgreSQL
  DATABASE_URL: z.string().url(),
  
  JWT_SECRET: z.string().min(10), // Changed from min(32) for development
  JWT_EXPIRES_IN: z.string().default('7d'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:5432'),
});

// Parse with fallbacks for development
const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  
  // Provide helpful error messages
  if (!process.env.DATABASE_URL) {
    console.error('💡 DATABASE_URL is required. Set it in your .env file.');
    console.error('   Example for PostgreSQL: DATABASE_URL="postgresql://username:password@localhost:5432/dbname"');
    console.error('   Example for SQLite: DATABASE_URL="file:./dev.db" (for quick testing)');
  }
  
  if (!process.env.JWT_SECRET) {
    console.error('💡 JWT_SECRET is required. Set it in your .env file.');
    console.error('   Run: node -e "console.log(require(\'crypto\').randomBytes(32).toString(\'hex\'))"');
  }
  
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;