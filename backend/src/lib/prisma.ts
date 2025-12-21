// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client'

// NO CONFIGURATION - Prisma reads DATABASE_URL from env automatically
const prisma = new PrismaClient()

export default prisma