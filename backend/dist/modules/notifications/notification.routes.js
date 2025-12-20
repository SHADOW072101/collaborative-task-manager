"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/modules/notifications/notification.routes.ts
const express_1 = require("express");
const notification_controller_1 = require("./notification.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// All notification routes require authentication
router.use(auth_middleware_1.authenticate);
router.get('/', notification_controller_1.notificationController.getUserNotifications);
router.get('/unread/count', notification_controller_1.notificationController.getUnreadCount);
router.post('/', notification_controller_1.notificationController.createNotification);
router.put('/:id/read', notification_controller_1.notificationController.markAsRead);
router.put('/read-all', notification_controller_1.notificationController.markAllAsRead);
router.delete('/:id', notification_controller_1.notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=notification.routes.js.map