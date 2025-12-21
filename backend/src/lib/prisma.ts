// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// NO CONFIGURATION - Prisma reads DATABASE_URL from env automatically
let prisma;

if (process.env.NODE_ENV === 'production') {
  // In production, require DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL is required in production');
    // Create a mock prisma client that throws meaningful errors
    prisma = {
      $connect: async () => { 
        throw new Error('DATABASE_URL not set in environment variables') 
      },
      user: {
        findFirst: async () => { 
          throw new Error('Database not configured. Set DATABASE_URL in Vercel environment variables.') 
        },
        create: async () => { 
          throw new Error('Database not configured. Set DATABASE_URL in Vercel environment variables.') 
        }
      }
    };
  } else {
    prisma = new PrismaClient({
      log: ['error'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
} else {
  // Development
  prisma = new PrismaClient({
    log: ['query', 'info', 'warn', 'error'],
  });
}

export default prisma;