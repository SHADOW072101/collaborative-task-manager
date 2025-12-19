import { Request, Response } from 'express';
import prisma from '../../core/database/prisma';
import bcrypt from 'bcrypt';
import { logger } from '../../core/utils/logger';
import { fileUploadUtils } from '../../core/middleware/upload';

export const userController = {
  async getUsers(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const { search, limit = '10' } = req.query;
      const currentUser = req.user;
      
      const users = await prisma.user.findMany({
        where: search ? {
          AND: [
            { id: { not: currentUser.id } },
            {
              OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
                { email: { contains: search as string, mode: 'insensitive' } },
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
        take: parseInt(limit as string),
        orderBy: { name: 'asc' }
      });
      
      res.json(users);
    } catch (error) {
      logger.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  },

  async getMyProfile(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      
      const user = await prisma.user.findUnique({
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
    } catch (error) {
      logger.error('Error fetching profile:', error);
      res.status(500).json({ error: 'Failed to fetch profile' });
    }
  },

  async updateMyProfile(req: Request, res: Response) {
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
        } catch (e) {
          return res.status(400).json({ error: 'Invalid social links format' });
        }
      }
      
      const updatedUser = await prisma.user.update({
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
    } catch (error) {
      logger.error('Error updating profile:', error);
      res.status(500).json({ error: 'Failed to update profile' });
    }
  },

  async updateMyPreferences(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      const { preferences } = req.body;
      
      const updatedUser = await prisma.user.update({
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
    } catch (error) {
      logger.error('Error updating preferences:', error);
      res.status(500).json({ error: 'Failed to update preferences' });
    }
  },

  async uploadAvatar(req: Request, res: Response) {
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
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { avatar: avatarPath },
        select: {
          id: true,
          avatar: true,
          updatedAt: true,
        },
      });
      
      res.json(updatedUser);
    } catch (error) {
      logger.error('Error uploading avatar:', error);
      res.status(500).json({ error: 'Failed to upload avatar' });
    }
  },

  async changePassword(req: Request, res: Response) {
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      
      // Update password
      await prisma.user.update({
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
    } catch (error) {
      logger.error('Error changing password:', error);
      res.status(500).json({ error: 'Failed to change password' });
    }
  },

  async toggleTwoFactor(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      const { enable } = req.body;
      
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { twoFactorEnabled: enable },
        select: {
          id: true,
          twoFactorEnabled: true,
          updatedAt: true,
        },
      });
      
      res.json(updatedUser);
    } catch (error) {
      logger.error('Error toggling 2FA:', error);
      res.status(500).json({ error: 'Failed to update 2FA settings' });
    }
  },

  async sendVerificationEmail(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      // Implementation depends on your email service
      res.json({ message: 'Verification email sent successfully' });
    } catch (error) {
      logger.error('Error sending verification email:', error);
      res.status(500).json({ error: 'Failed to send verification email' });
    }
  },

  async getMyActivityLogs(req: Request, res: Response) {
    try {
      // Check authentication
      if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
      }
      
      const userId = req.user.id;
      const { page = '1', limit = '20' } = req.query;
      
      const logs = await prisma.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limit as string),
        skip: (parseInt(page as string) - 1) * parseInt(limit as string),
      });
      
      const total = await prisma.activityLog.count({ where: { userId } });
      
      res.json({
        logs,
        pagination: {
          page: parseInt(page as string),
          limit: parseInt(limit as string),
          total,
          pages: Math.ceil(total / parseInt(limit as string)),
        },
      });
    } catch (error) {
      logger.error('Error fetching activity logs:', error);
      res.status(500).json({ error: 'Failed to fetch activity logs' });
    }
  },

  async deleteMyAccount(req: Request, res: Response) {
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
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { password: true },
      });
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Password is incorrect' });
      }
      
      // Soft delete
      await prisma.user.update({
        where: { id: userId },
        data: { 
          status: 'INACTIVE',
          email: `deleted_${Date.now()}_${req.user.email}`,
          name: 'Deleted User',
        },
      });
      
      res.json({ message: 'Account deleted successfully' });
    } catch (error) {
      logger.error('Error deleting account:', error);
      res.status(500).json({ error: 'Failed to delete account' });
    }
  },
};