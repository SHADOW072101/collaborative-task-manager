"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/lib/prisma.ts - ULTRA SIMPLE VERSION
const client_1 = require("@prisma/client");
// Just create the Prisma client - let environment variables handle the connection
const prisma = new client_1.PrismaClient();
exports.default = prisma;
//# sourceMappingURL=prisma.js.map