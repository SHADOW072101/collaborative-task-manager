// backend/src/modules/users/user.controller.ts
import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class UserController {
  // Get all users (excluding current user)
  async getAllUsers(req: Request, res: Response) {
    try {
      const currentUserId = req.user?.id;
      
      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      const users = await prisma.user.findMany({
        where: {
          id: { not: currentUserId }
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        },
        orderBy: { name: 'asc' }
      });

      return res.status(200).json({
        success: true,
        data: users
      });

    } catch (error) {
      console.error('Get users error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch users'
      });
    }
  }

  // Get user by ID
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
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

    } catch (error) {
      console.error('Get user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user'
      });
    }
  }

  // Update user profile
  async updateUser(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { name, email } = req.body;

      if (!userId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Users can only update their own profile
      if (userId !== id) {
        return res.status(403).json({
          success: false,
          error: 'You can only update your own profile'
        });
      }

      // Check if email is already taken by another user
      if (email) {
        const existingUser = await prisma.user.findFirst({
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

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          name,
          email
        },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          updatedAt: true
        }
      });

      return res.status(200).json({
        success: true,
        data: updatedUser
      });

    } catch (error) {
      console.error('Update user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user'
      });
    }
  }

  // Delete user (admin only - optional)
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const currentUserId = req.user?.id;

      if (!currentUserId) {
        return res.status(401).json({
          success: false,
          error: 'User not authenticated'
        });
      }

      // Users can only delete their own account
      if (currentUserId !== id) {
        return res.status(403).json({
          success: false,
          error: 'You can only delete your own account'
        });
      }

      await prisma.user.delete({
        where: { id: currentUserId }
      });

      return res.status(200).json({
        success: true,
        message: 'User account deleted'
      });

    } catch (error) {
      console.error('Delete user error:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to delete user'
      });
    }
  }
}

// Export instance
export const userController = new UserController();