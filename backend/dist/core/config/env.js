"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const zod_1 = require("zod");
const envSchema = zod_1.z.object({
    PORT: zod_1.z.string().default('3000'),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    DATABASE_URL: zod_1.z.string().url(),
    JWT_SECRET: zod_1.z.string().min(32),
    JWT_EXPIRES_IN: zod_1.z.string().default('7d'),
    REFRESH_TOKEN_SECRET: zod_1.z.string().min(32).default(""),
    REFRESH_TOKEN_EXPIRES_IN: zod_1.z.string().default('30d'),
    FRONTEND_URL: zod_1.z.string().url().default('https://collaborative-task-manager-81xh.vercel.app/'),
});
exports.env = envSchema.parse(process.env);
console.log('JWT_SECRET type:', typeof exports.env.JWT_SECRET);
console.log('JWT_SECRET value:', exports.env.JWT_SECRET ? 'Set' : 'Not set');
console.log('JWT_EXPIRES_IN:', exports.env.JWT_EXPIRES_IN);
console.log('REFRESH_TOKEN_EXPIRES_IN:', exports.env.REFRESH_TOKEN_EXPIRES_IN);
console.log('REFRESH_TOKEN_SECRET:', exports.env.REFRESH_TOKEN_SECRET);
//# sourceMappingURL=env.js.map