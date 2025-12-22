// src/lib/prisma.ts - ULTRA SIMPLE VERSION
import { PrismaClient } from '@prisma/client';

// Just create the Prisma client - let environment variables handle the connection
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export default prisma;