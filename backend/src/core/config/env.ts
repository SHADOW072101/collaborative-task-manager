import { z } from 'zod';

const envSchema = z.object({
  PORT: z.string().default('3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  DATABASE_URL: z.string().url(),
  
  JWT_SECRET: z.string().min(32),
  JWT_EXPIRES_IN: z.string().default('7d'),
  REFRESH_TOKEN_SECRET: z.string().min(32).default(""),
  REFRESH_TOKEN_EXPIRES_IN: z.string().default('30d'),
  
  FRONTEND_URL: z.string().url().default('http://localhost:5173'),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;

console.log('JWT_SECRET type:', typeof env.JWT_SECRET);
console.log('JWT_SECRET value:', env.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', env.JWT_EXPIRES_IN);
console.log('REFRESH_TOKEN_EXPIRES_IN:', env.REFRESH_TOKEN_EXPIRES_IN);
console.log('REFRESH_TOKEN_SECRET:', env.REFRESH_TOKEN_SECRET);