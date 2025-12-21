"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../core/config/env");
const prisma_1 = __importDefault(require("../../lib/prisma"));
class AuthService {
    async register(data) {
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findUnique({
            where: { email: data.email },
        });
        if (existingUser) {
            throw new Error('User with this email already exists');
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(data.password, 12);
        // Create user
        const user = await prisma_1.default.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
            },
        });
        // Generate JWT token
        const token = this.generateToken(user.id);
        return { user, token };
    }
    async login(data) {
        // Find user
        const user = await prisma_1.default.user.findUnique({
            where: { email: data.email },
            select: {
                id: true,
                name: true,
                email: true,
                password: true,
                createdAt: true,
            },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        // Verify password
        const isValidPassword = await bcryptjs_1.default.compare(data.password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid credentials');
        }
        // Remove password from response
        const { password, ...userWithoutPassword } = user;
        // Generate JWT token
        const token = this.generateToken(user.id);
        return { user: userWithoutPassword, token };
    }
    async getCurrentUser(userId) {
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    async updateProfile(userId, data) {
        // Check if email is being changed and if it's already taken
        if (data.email) {
            const existingUser = await prisma_1.default.user.findFirst({
                where: {
                    email: data.email,
                    NOT: { id: userId },
                },
            });
            if (existingUser) {
                throw new Error('Email already in use');
            }
        }
        const updatedUser = await prisma_1.default.user.update({
            where: { id: userId },
            data: {
                name: data.name,
                email: data.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        return updatedUser;
    }
    generateToken(userId) {
        // FIXED: Proper TypeScript typing for JWT sign
        const payload = { userId };
        // FIXED: Cast expiresIn to appropriate type
        const options = {
            expiresIn: env_1.env.JWT_EXPIRES_IN,
        };
        return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, options);
    }
    verifyToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            return decoded;
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                throw new Error('Invalid token');
            }
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                throw new Error('Token expired');
            }
            throw new Error('Token verification failed');
        }
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map