"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userController = void 0;
const prisma_1 = __importDefault(require("../../core/database/prisma"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const logger_1 = require("../../core/utils/logger");
const shared_1 = require("../../shared");
exports.userController = {
    async getUsers(req, res) {
        console.log('🚨🚨🚨 getUsers FUNCTION CALLED 🚨🚨🚨');
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    error: 'Authentication required'
                });
            }
            const { search, limit = '10' } = req.query;
            const currentUser = req.user;
            const users = await prisma_1.default.user.findMany({
                where: search ? {
                    AND: [
                        { id: { not: currentUser.id } },
                        {
                            OR: [
                                { name: { contains: search, mode: 'insensitive' } },
                                { email: { contains: search, mode: 'insensitive' } },
                            ]
                        }
                    ]
                } : {
                    id: { not: currentUser.id }
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    jobTitle: true,
                    department: true,
                    createdAt: true,
                },
                take: parseInt(limit),
                orderBy: { name: 'asc' }
            });
            // ✅ Always return 200, even for empty results
            res.status(200).json({
                success: true,
                data: users,
                count: users.length,
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching users:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch users'
            });
        }
    },
    getUserById: (0, shared_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const user = await prisma_1.default.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                createdAt: true,
                updatedAt: true,
            },
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }
        res.status(200).json({
            success: true,
            data: user,
        });
    }),
    async getMyProfile(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    bio: true,
                    avatar: true,
                    phone: true,
                    location: true,
                    jobTitle: true,
                    department: true,
                    company: true,
                    website: true,
                    socialLinks: true,
                    preferences: true,
                    emailVerified: true,
                    twoFactorEnabled: true,
                    role: true,
                    status: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
        catch (error) {
            logger_1.logger.error('Error fetching profile:', error);
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    },
    async updateMyProfile(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { name, bio, phone, location, jobTitle, department, company, website, socialLinks } = req.body;
            // Validate socialLinks if provided
            if (socialLinks) {
                try {
                    JSON.parse(socialLinks);
                }
                catch (e) {
                    return res.status(400).json({ error: 'Invalid social links format' });
                }
            }
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    name,
                    bio,
                    phone,
                    location,
                    jobTitle,
                    department,
                    company,
                    website,
                    socialLinks: socialLinks ? JSON.parse(socialLinks) : undefined,
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    bio: true,
                    avatar: true,
                    phone: true,
                    location: true,
                    jobTitle: true,
                    department: true,
                    company: true,
                    website: true,
                    socialLinks: true,
                    updatedAt: true,
                },
            });
            // Log activity
            // await prisma.activityLog.create({
            //   data: {
            //     action: 'PROFILE_UPDATED',
            //     entityType: 'user',
            //     entityId: userId,
            //     details: { updatedFields: Object.keys(req.body) },
            //     ipAddress: req.ip,
            //     userAgent: req.headers['user-agent'],
            //     userId,
            //   },
            // });
            res.json(updatedUser);
        }
        catch (error) {
            logger_1.logger.error('Error updating profile:', error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    },
    searchUsers: (0, shared_1.asyncHandler)(async (req, res) => {
        console.log('🚨🚨🚨 searchUsers FUNCTION CALLED 🚨🚨🚨');
        console.log('Full request query:', req.query);
        console.log('Query parameter:', req.query.query);
        console.log('Limit parameter:', req.query.limit);
        const { query, limit = 10 } = req.query;
        console.log('Extracted query:', query);
        console.log('Type of query:', typeof query);
        if (!query || typeof query !== 'string') {
            console.log('❌ Query validation failed');
            return res.status(400).json({
                success: false,
                message: 'Search query is required'
            });
        }
        const searchTerm = query.trim();
        console.log('Search term after trim:', searchTerm);
        if (searchTerm.length < 1) {
            console.log('❌ Search term is empty after trim');
            return res.status(400).json({
                success: false,
                message: 'Search query cannot be empty'
            });
        }
        console.log('🔍 Searching for:', searchTerm);
        try {
            const users = await prisma_1.default.user.findMany({
                where: {
                    OR: [
                        { name: { contains: searchTerm, mode: 'insensitive' } },
                        { email: { contains: searchTerm, mode: 'insensitive' } },
                    ],
                },
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                    createdAt: true,
                },
                take: parseInt(limit) || 10,
                orderBy: { name: 'asc' },
            });
            console.log('✅ Found users:', users.length);
            console.log('Users:', JSON.stringify(users, null, 2));
            // ✅ Make sure this is ALWAYS 200, even for empty results
            return res.status(200).json({
                success: true,
                data: users,
                count: users.length,
            });
        }
        catch (error) {
            console.error('❌ Database error:', error);
            return res.status(500).json({
                success: false,
                message: 'Database error occurred'
            });
        }
    }),
    async updateMyPreferences(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { preferences } = req.body;
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    preferences: preferences ? JSON.parse(preferences) : undefined,
                },
                select: {
                    id: true,
                    preferences: true,
                    updatedAt: true,
                },
            });
            res.json(updatedUser);
        }
        catch (error) {
            logger_1.logger.error('Error updating preferences:', error);
            res.status(500).json({ error: 'Failed to update preferences' });
        }
    },
    async uploadAvatar(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            if (!req.file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            // Save avatar path
            const avatarPath = `/uploads/avatars/${req.file.filename}`;
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: { avatar: avatarPath },
                select: {
                    id: true,
                    avatar: true,
                    updatedAt: true,
                },
            });
            res.json(updatedUser);
        }
        catch (error) {
            logger_1.logger.error('Error uploading avatar:', error);
            res.status(500).json({ error: 'Failed to upload avatar' });
        }
    },
    async changePassword(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { currentPassword, newPassword } = req.body;
            // Validate input
            if (!currentPassword || !newPassword) {
                return res.status(400).json({ error: 'Current password and new password are required' });
            }
            if (newPassword.length < 6) {
                return res.status(400).json({ error: 'New password must be at least 6 characters' });
            }
            // Get current user with password
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { password: true },
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            // Verify current password
            const isValidPassword = await bcrypt_1.default.compare(currentPassword, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }
            // Hash new password
            const hashedPassword = await bcrypt_1.default.hash(newPassword, 10);
            // Update password
            await prisma_1.default.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
            // Log activity
            // await prisma.activityLog.create({
            //   data: {
            //     action: 'PASSWORD_CHANGED',
            //     details: {},
            //     ipAddress: req.ip,
            //     userAgent: req.headers['user-agent'],
            //     userId,
            //   },
            // });
            res.json({ message: 'Password updated successfully' });
        }
        catch (error) {
            logger_1.logger.error('Error changing password:', error);
            res.status(500).json({ error: 'Failed to change password' });
        }
    },
    async toggleTwoFactor(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { enable } = req.body;
            const updatedUser = await prisma_1.default.user.update({
                where: { id: userId },
                data: { twoFactorEnabled: enable },
                select: {
                    id: true,
                    twoFactorEnabled: true,
                    updatedAt: true,
                },
            });
            res.json(updatedUser);
        }
        catch (error) {
            logger_1.logger.error('Error toggling 2FA:', error);
            res.status(500).json({ error: 'Failed to update 2FA settings' });
        }
    },
    async sendVerificationEmail(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            // Implementation depends on your email service
            res.json({ message: 'Verification email sent successfully' });
        }
        catch (error) {
            logger_1.logger.error('Error sending verification email:', error);
            res.status(500).json({ error: 'Failed to send verification email' });
        }
    },
    async getMyActivityLogs(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { page = '1', limit = '20' } = req.query;
            const logs = await prisma_1.default.activityLog.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: parseInt(limit),
                skip: (parseInt(page) - 1) * parseInt(limit),
            });
            const total = await prisma_1.default.activityLog.count({ where: { userId } });
            res.json({
                logs,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / parseInt(limit)),
                },
            });
        }
        catch (error) {
            logger_1.logger.error('Error fetching activity logs:', error);
            res.status(500).json({ error: 'Failed to fetch activity logs' });
        }
    },
    async deleteMyAccount(req, res) {
        try {
            // Check authentication
            if (!req.user) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            const userId = req.user.id;
            const { confirmation, password } = req.body;
            if (confirmation !== 'DELETE MY ACCOUNT') {
                return res.status(400).json({ error: 'Confirmation phrase is required' });
            }
            // Verify password
            const user = await prisma_1.default.user.findUnique({
                where: { id: userId },
                select: { password: true },
            });
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isValidPassword = await bcrypt_1.default.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Password is incorrect' });
            }
            // Soft delete
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    status: 'INACTIVE',
                    email: `deleted_${Date.now()}_${req.user.email}`,
                    name: 'Deleted User',
                },
            });
            res.json({ message: 'Account deleted successfully' });
        }
        catch (error) {
            logger_1.logger.error('Error deleting account:', error);
            res.status(500).json({ error: 'Failed to delete account' });
        }
    },
};
//# sourceMappingURL=user.controller.js.map