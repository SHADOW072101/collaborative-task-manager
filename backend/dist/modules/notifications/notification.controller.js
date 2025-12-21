"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationController = exports.NotificationController = void 0;
const prisma_1 = __importDefault(require("../../lib/prisma"));
class NotificationController {
    // Get user's notifications
    async getUserNotifications(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const notifications = await prisma_1.default.notification.findMany({
                where: { userId },
                orderBy: { createdAt: 'desc' },
                take: 50 // Limit to 50 most recent
            });
            return res.status(200).json({
                success: true,
                data: notifications
            });
        }
        catch (error) {
            console.error('Get notifications error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to fetch notifications'
            });
        }
    }
    // Create notification (admin/system use)
    async createNotification(req, res) {
        try {
            const { userId, type, title, message, data } = req.body;
            // Validation
            if (!userId || !type || !title || !message) {
                return res.status(400).json({
                    success: false,
                    error: 'userId, type, title, and message are required'
                });
            }
            const notification = await prisma_1.default.notification.create({
                data: {
                    userId,
                    type,
                    title,
                    message,
                    read: false
                }
            });
            return res.status(201).json({
                success: true,
                data: notification
            });
        }
        catch (error) {
            console.error('Create notification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to create notification'
            });
        }
    }
    // Mark notification as read
    async markAsRead(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            // Verify notification belongs to user
            const notification = await prisma_1.default.notification.findFirst({
                where: {
                    id,
                    userId
                }
            });
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }
            const updatedNotification = await prisma_1.default.notification.update({
                where: { id },
                data: { read: true }
            });
            return res.status(200).json({
                success: true,
                data: updatedNotification
            });
        }
        catch (error) {
            console.error('Mark as read error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update notification'
            });
        }
    }
    // Mark all notifications as read
    async markAllAsRead(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            await prisma_1.default.notification.updateMany({
                where: {
                    userId,
                    read: false
                },
                data: {
                    read: true
                }
            });
            return res.status(200).json({
                success: true,
                message: 'All notifications marked as read'
            });
        }
        catch (error) {
            console.error('Mark all as read error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to update notifications'
            });
        }
    }
    // Delete notification
    async deleteNotification(req, res) {
        try {
            const userId = req.user?.id;
            const { id } = req.params;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            // Verify notification belongs to user
            const notification = await prisma_1.default.notification.findFirst({
                where: {
                    id,
                    userId
                }
            });
            if (!notification) {
                return res.status(404).json({
                    success: false,
                    error: 'Notification not found'
                });
            }
            await prisma_1.default.notification.delete({
                where: { id }
            });
            return res.status(200).json({
                success: true,
                message: 'Notification deleted'
            });
        }
        catch (error) {
            console.error('Delete notification error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to delete notification'
            });
        }
    }
    // Get unread notification count
    async getUnreadCount(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({
                    success: false,
                    error: 'User not authenticated'
                });
            }
            const count = await prisma_1.default.notification.count({
                where: {
                    userId,
                    read: false
                }
            });
            return res.status(200).json({
                success: true,
                data: { count }
            });
        }
        catch (error) {
            console.error('Get unread count error:', error);
            return res.status(500).json({
                success: false,
                error: 'Failed to get unread count'
            });
        }
    }
}
exports.NotificationController = NotificationController;
// Export instance
exports.notificationController = new NotificationController();
//# sourceMappingURL=notification.controller.js.map