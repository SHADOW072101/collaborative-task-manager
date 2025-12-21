// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';

console.log('🔧 Prisma initialization started');
console.log('📋 Environment check at Prisma init:');
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET (' + process.env.DATABASE_URL.length + ' chars)' : 'NOT SET ❌');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  All DB-related env vars:');
for (const key in process.env) {
  if (key.includes('DATABASE') || key.includes('URL')) {
    console.log('    ', key, ':', process.env[key] ? '***' + process.env[key].substring(process.env[key].length - 20) : 'NOT SET');
  }
}

// Declare prisma variable
let prismaInstance: PrismaClient;

// Check if DATABASE_URL is actually set
if (!process.env.DATABASE_URL) {
  console.error('❌ FATAL: DATABASE_URL is not set in environment variables!');
  console.error('   Current environment keys:', Object.keys(process.env).join(', '));
  
  // Create a mock client that won't crash
  prismaInstance = {
    $connect: async () => { 
      console.log('⚠️ Mock: Database connection skipped - DATABASE_URL not set');
    },
    $disconnect: async () => {
      console.log('⚠️ Mock: Database disconnect skipped');
    }
    // Add other Prisma methods as needed...
  } as unknown as PrismaClient;
} else {
  console.log('✅ DATABASE_URL found, creating real Prisma client');
  prismaInstance = new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

// Export the prisma instance
const prisma = prismaInstance;
export default prisma;