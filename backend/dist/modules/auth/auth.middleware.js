"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../core/config/env");
// import { PrismaClient } from '@prisma/client';
const prisma_1 = __importDefault(require("../../lib/prisma"));
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         name?: string;
//         role: string;
//         status: string;
//       };
//     }
//   }
// }
// Authentication middleware
const authenticate = async (req, res, next) => {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                error: 'Access denied. No token provided.'
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        if (!token) {
            res.status(401).json({
                success: false,
                error: 'Access denied. Invalid token format.'
            });
            return;
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
        // Check if user still exists in database
        const user = await prisma_1.default.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                status: true
            }
        });
        if (!user) {
            res.status(401).json({
                success: false,
                error: 'User not found. Token is invalid.'
            });
            return;
        }
        // Attach user to request object
        req.user = {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            status: user.status
        };
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token.'
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                error: 'Token has expired.'
            });
            return;
        }
        res.status(500).json({
            success: false,
            error: 'Internal server error during authentication.'
        });
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=auth.middleware.js.map