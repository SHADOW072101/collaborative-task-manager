// backend/src/modules/users/user.middleware.ts
import { Request, Response, NextFunction } from 'express';
import prisma from '../../core/database/prisma';
import { logger } from '../../core/utils/logger';

export const authorizeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const currentUser = req.user;

    // Check if user is authenticated
    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // If userId is 'me', replace with current user's ID
    if (userId === 'me') {
      req.params.userId = currentUser.id;
      return next();
    }

    // Allow users to access their own data
    if (userId === currentUser.id) {
      return next();
    }

    // Check if current user is admin
    const user = await prisma.user.findUnique({
      where: { id: currentUser.id },
      select: { role: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Allow admin and super_admin to access any user's data
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return next();
    }

    // For team leaders, check if they're in the same team
    const isTeamLeader = await isUserTeamLeader(currentUser.id, userId);
    if (isTeamLeader) {
      return next();
    }

    // Deny access for all other cases
    return res.status(403).json({ 
      error: 'Unauthorized to access this resource',
      message: 'You can only access your own data'
    });

  } catch (error) {
    logger.error('Authorization error:', error);
    res.status(500).json({ error: 'Authorization failed' });
  }
};

/**
 * Check if current user is a team leader of the target user
 */
const isUserTeamLeader = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
  try {
    // Find teams where current user is a leader/admin and target user is a member
    const teamMemberships = await prisma.teamMember.findMany({
      where: {
        userId: currentUserId,
        role: { in: ['LEADER', 'ADMIN'] }
      },
      include: {
        team: {
          include: {
            members: {
              where: { userId: targetUserId }
            }
          }
        }
      }
    });

    // Check if target user is in any of these teams
    return teamMemberships.some(membership => 
      membership.team.members.length > 0
    );
  } catch (error) {
    logger.error('Team leader check error:', error);
    return false;
  }
};

/**
 * Middleware to check if user has specific role
 */
export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      if (!roles.includes(currentUser.role)) {
        return res.status(403).json({ 
          error: 'Insufficient permissions',
          message: `Required roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      logger.error('Role check error:', error);
      res.status(500).json({ error: 'Permission check failed' });
    }
  };
};

/**
 * Middleware to check if user is active
 */
export const requireActiveUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user;

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    if (!currentUser.status) {
      return res.status(403).json({ 
        error: 'Account inactive',
        message: 'Your account has been deactivated'
      });
    }

    next();
  } catch (error) {
    logger.error('Active user check error:', error);
    res.status(500).json({ error: 'User status check failed' });
  }
};

/**
 * Middleware to check ownership of a resource
 * Useful for checking if user owns the resource they're trying to modify
 */
export const checkResourceOwnership = (
  resourceType: 'task' | 'project' | 'comment' | 'team',
  resourceIdParam: string = 'id'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;
      const resourceId = req.params[resourceIdParam];

      if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      let isOwner = false;

      switch (resourceType) {
        case 'task':
          isOwner = await checkTaskOwnership(currentUser.id, resourceId);
          break;
        case 'project':
          isOwner = await checkProjectOwnership(currentUser.id, resourceId);
          break;
        case 'comment':
          isOwner = await checkCommentOwnership(currentUser.id, resourceId);
          break;
        case 'team':
          isOwner = await checkTeamMembership(currentUser.id, resourceId);
          break;
      }

      if (isOwner) {
        return next();
      }

      // If not owner, check if user is admin
      const user = await prisma.user.findUnique({
        where: { id: currentUser.id },
        select: { role: true },
      });

      if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
        return next();
      }

      return res.status(403).json({ 
        error: 'Access denied',
        message: `You don't have permission to modify this ${resourceType}`
      });

    } catch (error) {
      logger.error('Resource ownership check error:', error);
      res.status(500).json({ error: 'Ownership check failed' });
    }
  };
};

/**
 * Helper function to check task ownership
 */
const checkTaskOwnership = async (userId: string, taskId: string): Promise<boolean> => {
  try {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { creatorId: true, assignedToId: true },
    });

    if (!task) return false;

    // User owns the task if they created it or are assigned to it
    return task.creatorId === userId || task.assignedToId === userId;
  } catch (error) {
    logger.error('Task ownership check error:', error);
    return false;
  }
};

/**
 * Helper function to check project ownership
 */
const checkProjectOwnership = async (userId: string, projectId: string): Promise<boolean> => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { creatorId: true },
    });

    return project?.creatorId === userId;
  } catch (error) {
    logger.error('Project ownership check error:', error);
    return false;
  }
};

/**
 * Helper function to check comment ownership
 */
const checkCommentOwnership = async (userId: string, commentId: string): Promise<boolean> => {
  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      select: { userId: true },
    });

    return comment?.userId === userId;
  } catch (error) {
    logger.error('Comment ownership check error:', error);
    return false;
  }
};

/**
 * Helper function to check team membership
 */
const checkTeamMembership = async (userId: string, teamId: string): Promise<boolean> => {
  try {
    const membership = await prisma.teamMember.findUnique({
      where: {
        userId_teamId: {
          userId,
          teamId,
        },
      },
    });

    return !!membership;
  } catch (error) {
    logger.error('Team membership check error:', error);
    return false;
  }
};

/**
 * Middleware to check if user can modify a specific field
 * Useful for preventing users from modifying certain fields (like role)
 */
export const restrictFieldModification = (restrictedFields: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const currentUser = req.user;

      if (!currentUser) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      // Check if user is trying to modify restricted fields
      const modifiedFields = Object.keys(req.body);
      const attemptedRestrictedFields = modifiedFields.filter(field => 
        restrictedFields.includes(field)
      );

      if (attemptedRestrictedFields.length === 0) {
        return next();
      }

      // Check if user is admin
      if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') {
        return next();
      }

      return res.status(403).json({
        error: 'Field modification restricted',
        message: `You cannot modify the following fields: ${attemptedRestrictedFields.join(', ')}`,
        restrictedFields: attemptedRestrictedFields,
      });

    } catch (error) {
      logger.error('Field restriction check error:', error);
      res.status(500).json({ error: 'Field restriction check failed' });
    }
  };
};

/**
 * Middleware to check if user can view sensitive information
 */
export const canViewSensitiveInfo = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUser = req.user;
    const { userId } = req.params;

    if (!currentUser) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    // Users can always view their own sensitive info
    if (userId === currentUser.id || userId === 'me') {
      return next();
    }

    // Admins can view anyone's sensitive info
    if (currentUser.role === 'ADMIN' || currentUser.role === 'SUPER_ADMIN') {
      return next();
    }

    // For other users, remove sensitive fields from response
    req.query.hideSensitive = 'true';
    next();

  } catch (error) {
    logger.error('Sensitive info check error:', error);
    res.status(500).json({ error: 'Sensitive info check failed' });
  }
};

/**
 * Combined middleware for common authorization scenarios
 */
export const authMiddleware = {
  authorizeUser,
  requireRole,
  requireActiveUser,
  checkResourceOwnership,
  restrictFieldModification,
  canViewSensitiveInfo,
};

export default authMiddleware;