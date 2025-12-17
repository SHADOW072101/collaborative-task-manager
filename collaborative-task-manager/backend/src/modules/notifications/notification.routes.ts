// backend/src/modules/notifications/notification.routes.ts
import { Router } from 'express';
import { notificationController } from './notification.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

// All notification routes require authentication
router.use(authenticate);

router.get('/', notificationController.getUserNotifications);
router.get('/unread/count', notificationController.getUnreadCount);
router.post('/', notificationController.createNotification);
router.put('/:id/read', notificationController.markAsRead);
router.put('/read-all', notificationController.markAllAsRead);
router.delete('/:id', notificationController.deleteNotification);

export default router;