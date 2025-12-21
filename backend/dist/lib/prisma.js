"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/prisma.ts
const client_1 = require("@prisma/client");
// NO CONFIGURATION - Prisma reads DATABASE_URL from env automatically
const prisma = new client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map