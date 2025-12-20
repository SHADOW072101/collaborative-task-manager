"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/api.ts
const express_1 = require("express");
const auth_controller_1 = require("./modules/controllers/auth.controller");
const task_controller_1 = require("./modules/tasks/task.controller");
const auth_middleware_1 = require("./modules/auth/auth.middleware");
const user_controller_1 = require("./modules/users/user.controller");
const notification_controller_1 = require("./modules/notifications/notification.controller");
const router = (0, express_1.Router)();
// ========== AUTH ROUTES ==========
router.post('/auth/register', auth_controller_1.authController.register);
router.post('/auth/login', auth_controller_1.authController.login);
router.post('/auth/logout', auth_middleware_1.authenticate, auth_controller_1.authController.logout);
router.post('/auth/refresh-token', auth_controller_1.authController.refreshToken);
router.get('/auth/me', auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
router.put('/auth/profile', auth_middleware_1.authenticate, auth_controller_1.authController.updateProfile);
// ========== TASK ROUTES ==========
// Apply authentication middleware to all task routes
router.use('/tasks', auth_middleware_1.authenticate);
router.post('/tasks', task_controller_1.taskController.createTask);
router.get('/tasks', task_controller_1.taskController.getTasks);
router.get('/tasks/my', task_controller_1.taskController.getMyTasks);
router.get('/tasks/overdue', task_controller_1.taskController.getOverdueTasks);
router.get('/tasks/dashboard/stats', task_controller_1.taskController.getDashboardStats);
router.get('/tasks/:id', task_controller_1.taskController.getTaskById);
router.put('/tasks/:id', task_controller_1.taskController.updateTask);
router.delete('/tasks/:id', task_controller_1.taskController.deleteTask);
router.patch('/tasks/:id/assign', task_controller_1.taskController.assignTask);
router.patch('/tasks/:id/status', task_controller_1.taskController.updateTaskStatus);
// ========== USER ROUTES ==========
router.use('/users', auth_middleware_1.authenticate);
router.get('/users', user_controller_1.userController.getUsers);
router.get('/users/search', user_controller_1.userController.searchUsers);
router.get('/users/me/profile', user_controller_1.userController.getMyProfile);
router.put('/users/me/profile', user_controller_1.userController.updateMyProfile);
router.get('/users/:id', user_controller_1.userController.getUserById);
// ========== NOTIFICATION ROUTES ==========
router.use('/notifications', auth_middleware_1.authenticate);
// router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/:id/read', notification_controller_1.notificationController.markAsRead);
router.delete('/notifications/:id', notification_controller_1.notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=api.js.map