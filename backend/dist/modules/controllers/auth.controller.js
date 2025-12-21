"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = exports.AuthController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../../core/config/env");
const prisma_1 = __importDefault(require("../../lib/prisma"));
// const prisma = new PrismaClient();
// declare global {
//   namespace Express {
//     interface Request {
//       user?: {
//         id: string;
//         email: string;
//         name?: string;
//         role: string;
//         status: string
//       };
//     }
//   }
// }
class AuthController {
    // Register user
    async register(req, res) {
        try {
            const { name, email, password, confirmPassword } = req.body;
            // Validation
            if (!name || !email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Name, email, and password are required'
                });
            }
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    error: 'Password must be at least 6 characters'
                });
            }
            if (confirmPassword && password !== confirmPassword) {
                return res.status(400).json({
                    success: false,
                    error: 'Passwords do not match'
                });
            }
            // Check if user already exists
            const existingUser = await prisma_1.default.user.findUnique({
                where: { email }
            });
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'User with this email already exists'
                });
            }
            // Hash password
            const salt = await bcryptjs_1.default.genSalt(10);
            const hashedPassword = await bcryptjs_1.default.hash(password, salt);
            // Create user
            const user = await prisma_1.default.user.create({
                data: {
                    name,
                    email,
                    password: hashedPassword,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                }
            });
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
            }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
            // Generate refresh token (if using)
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, // Or separate refresh token secret
            { expiresIn: '30d' });
            // Store refresh token in database (optional)
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { refreshToken }
            });
            // Set refresh token as HTTP-only cookie (optional)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            // Send response
            return res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user,
                    token,
                }
            });
        }
        catch (error) {
            console.error('Registration error:', error);
            return res.status(500).json({
                success: false,
                error: 'Registration failed. Please try again.'
            });
        }
    }
    // Login user
    async login(req, res) {
        try {
            const { email, password } = req.body;
            // Validation
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    error: 'Email and password are required'
                });
            }
            // Find user
            const user = await prisma_1.default.user.findUnique({
                where: { email }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            // Verify password
            const isPasswordValid = await bcryptjs_1.default.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password'
                });
            }
            // Generate JWT token
            const token = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
            }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
            // Generate refresh token (optional)
            const refreshToken = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.env.JWT_SECRET, { expiresIn: '30d' });
            // Update refresh token in database (optional)
            await prisma_1.default.user.update({
                where: { id: user.id },
                data: { refreshToken }
            });
            // Set refresh token as HTTP-only cookie (optional)
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
            });
            // Prepare user data (exclude password)
            const userData = {
                id: user.id,
                name: user.name,
                email: user.email,
                createdAt: user.createdAt,
            };
            // Send response
            return res.status(200).json({
                success: true,
                message: 'Login successful',
                data: {
                    user: userData,
                    token,
                }
            });
        }
        catch (error) {
            console.error('Login error:', error);
            return res.status(500).json({
                success: false,
                error: 'Login failed. Please try again.'
            });
        }
    }
    // Get current user profile
    async getCurrentUser(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found'
                });
            }
            return res.status(200).json({
                success: true,
                data: user
            });
        }
        catch (error) {
            console.error('Get profile error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get user profile'
            });
        }
    }
    // Update user profile
    async updateProfile(req, res) {
        try {
            const userId = req.user?.id;
            const { name, email } = req.body;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            // Check if email is already taken by another user
            if (email) {
                const existingUser = await prisma_1.default.user.findFirst({
                    where: {
                        email,
                        NOT: { id: userId }
                    }
                });
                if (existingUser) {
                    return res.status(409).json({
                        success: false,
                        error: 'Email already in use'
                    });
                }
            }
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    name,
                    email,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    createdAt: true,
                    updatedAt: true,
                }
            });
            return res.status(200).json({
                success: true,
                message: 'Profile updated successfully',
                data: updatedUser
            });
        }
        catch (error) {
            console.error('Update profile error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update profile'
            });
        }
    }
    // Logout user
    async logout(req, res) {
        try {
            const userId = req.user?.id;
            if (userId) {
                // Clear refresh token from database
                await prisma_1.default.user.update({
                    where: { id: userId },
                    data: { refreshToken: null }
                });
            }
            // Clear refresh token cookie
            res.clearCookie('refreshToken');
            return res.status(200).json({
                success: true,
                message: 'Logged out successfully'
            });
        }
        catch (error) {
            console.error('Logout error:', error);
            return res.status(500).json({
                success: false,
                error: 'Logout failed'
            });
        }
    }
    // Refresh token (optional)
    async refreshToken(req, res) {
        try {
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    success: false,
                    error: 'Refresh token not found'
                });
            }
            // Verify refresh token
            const decoded = jsonwebtoken_1.default.verify(refreshToken, env_1.env.JWT_SECRET);
            // Find user with this refresh token
            const user = await prisma_1.default.user.findUnique({
                where: {
                    id: decoded.userId,
                    refreshToken
                }
            });
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid refresh token'
                });
            }
            // Generate new access token
            const newAccessToken = jsonwebtoken_1.default.sign({
                userId: user.id,
                email: user.email,
            }, env_1.env.JWT_SECRET, { expiresIn: env_1.env.JWT_EXPIRES_IN });
            return res.status(200).json({
                success: true,
                data: {
                    token: newAccessToken
                }
            });
        }
        catch (error) {
            console.error('Refresh token error:', error);
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired refresh token'
            });
        }
    }
}
exports.AuthController = AuthController;
// Export instance
exports.authController = new AuthController();
//# sourceMappingURL=auth.controller.js.map