"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authMiddleware = exports.canViewSensitiveInfo = exports.restrictFieldModification = exports.checkResourceOwnership = exports.requireActiveUser = exports.requireRole = exports.authorizeUser = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
const logger_1 = require("../../core/utils/logger");
const authorizeUser = async (req, res, next) => {
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
        const user = await prisma_1.default.user.findUnique({
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
        // const isTeamLeader = await isUserTeamLeader(currentUser.id, userId);
        // if (isTeamLeader) {
        //   return next();
        // }
        // Deny access for all other cases
        return res.status(403).json({
            error: 'Unauthorized to access this resource',
            message: 'You can only access your own data'
        });
    }
    catch (error) {
        logger_1.logger.error('Authorization error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
};
exports.authorizeUser = authorizeUser;
// /**
//  * Check if current user is a team leader of the target user
//  */
// const isUserTeamLeader = async (currentUserId: string, targetUserId: string): Promise<boolean> => {
//   try {
//     // Find teams where current user is a leader/admin and target user is a member
//     const teamMemberships = await prisma.teamMember.findMany({
//       where: {
//         userId: currentUserId,
//         role: { in: ['LEADER', 'ADMIN'] }
//       },
//       include: {
//         team: {
//           include: {
//             members: {
//               where: { userId: targetUserId }
//             }
//           }
//         }
//       }
//     });
//     // Check if target user is in any of these teams
//     return teamMemberships.some(membership => 
//       membership.team.members.length > 0
//     );
//   } catch (error) {
//     logger.error('Team leader check error:', error);
//     return false;
//   }
// };
/**
 * Middleware to check if user has specific role
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
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
        }
        catch (error) {
            logger_1.logger.error('Role check error:', error);
            res.status(500).json({ error: 'Permission check failed' });
        }
    };
};
exports.requireRole = requireRole;
/**
 * Middleware to check if user is active
 */
const requireActiveUser = (req, res, next) => {
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
    }
    catch (error) {
        logger_1.logger.error('Active user check error:', error);
        res.status(500).json({ error: 'User status check failed' });
    }
};
exports.requireActiveUser = requireActiveUser;
/**
 * Middleware to check ownership of a resource
 * Useful for checking if user owns the resource they're trying to modify
 */
const checkResourceOwnership = (resourceType, resourceIdParam = 'id') => {
    return async (req, res, next) => {
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
            const user = await prisma_1.default.user.findUnique({
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
        }
        catch (error) {
            logger_1.logger.error('Resource ownership check error:', error);
            res.status(500).json({ error: 'Ownership check failed' });
        }
    };
};
exports.checkResourceOwnership = checkResourceOwnership;
/**
 * Helper function to check task ownership
 */
const checkTaskOwnership = async (userId, taskId) => {
    try {
        const task = await prisma_1.default.task.findUnique({
            where: { id: taskId },
            select: { creatorId: true, assignedToId: true },
        });
        if (!task)
            return false;
        // User owns the task if they created it or are assigned to it
        return task.creatorId === userId || task.assignedToId === userId;
    }
    catch (error) {
        logger_1.logger.error('Task ownership check error:', error);
        return false;
    }
};
/**
 * Helper function to check project ownership
 */
const checkProjectOwnership = async (userId, projectId) => {
    try {
        const project = await prisma_1.default.project.findUnique({
            where: { id: projectId },
            select: { creatorId: true },
        });
        return project?.creatorId === userId;
    }
    catch (error) {
        logger_1.logger.error('Project ownership check error:', error);
        return false;
    }
};
/**
 * Helper function to check comment ownership
 */
const checkCommentOwnership = async (userId, commentId) => {
    try {
        const comment = await prisma_1.default.comment.findUnique({
            where: { id: commentId },
            select: { userId: true },
        });
        return comment?.userId === userId;
    }
    catch (error) {
        logger_1.logger.error('Comment ownership check error:', error);
        return false;
    }
};
/**
 * Helper function to check team membership
 */
const checkTeamMembership = async (userId, teamId) => {
    try {
        const membership = await prisma_1.default.teamMember.findUnique({
            where: {
                userId_teamId: {
                    userId,
                    teamId,
                },
            },
        });
        return !!membership;
    }
    catch (error) {
        logger_1.logger.error('Team membership check error:', error);
        return false;
    }
};
/**
 * Middleware to check if user can modify a specific field
 * Useful for preventing users from modifying certain fields (like role)
 */
const restrictFieldModification = (restrictedFields) => {
    return (req, res, next) => {
        try {
            const currentUser = req.user;
            if (!currentUser) {
                return res.status(401).json({ error: 'Authentication required' });
            }
            // Check if user is trying to modify restricted fields
            const modifiedFields = Object.keys(req.body);
            const attemptedRestrictedFields = modifiedFields.filter(field => restrictedFields.includes(field));
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
        }
        catch (error) {
            logger_1.logger.error('Field restriction check error:', error);
            res.status(500).json({ error: 'Field restriction check failed' });
        }
    };
};
exports.restrictFieldModification = restrictFieldModification;
/**
 * Middleware to check if user can view sensitive information
 */
const canViewSensitiveInfo = (req, res, next) => {
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
    }
    catch (error) {
        logger_1.logger.error('Sensitive info check error:', error);
        res.status(500).json({ error: 'Sensitive info check failed' });
    }
};
exports.canViewSensitiveInfo = canViewSensitiveInfo;
/**
 * Combined middleware for common authorization scenarios
 */
exports.authMiddleware = {
    authorizeUser: exports.authorizeUser,
    requireRole: exports.requireRole,
    requireActiveUser: exports.requireActiveUser,
    checkResourceOwnership: exports.checkResourceOwnership,
    restrictFieldModification: exports.restrictFieldModification,
    canViewSensitiveInfo: exports.canViewSensitiveInfo,
};
exports.default = exports.authMiddleware;
//# sourceMappingURL=user.middleware.js.map