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
// Remove "/api" prefix since it will be added when mounted
router.post('/auth/register', auth_controller_1.authController.register); // ✅ Fixed
router.post('/auth/login', auth_controller_1.authController.login);
router.post('/auth/logout', auth_middleware_1.authenticate, auth_controller_1.authController.logout);
router.post('/auth/refresh-token', auth_controller_1.authController.refreshToken);
router.get('/auth/me', auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
router.put('/auth/profile', auth_middleware_1.authenticate, auth_controller_1.authController.updateProfile);
// ========== TASK ROUTES ==========
router.post('/tasks', auth_middleware_1.authenticate, task_controller_1.taskController.createTask);
router.get('/tasks', auth_middleware_1.authenticate, task_controller_1.taskController.getTasks);
router.get('/tasks/my', auth_middleware_1.authenticate, task_controller_1.taskController.getMyTasks);
router.get('/tasks/overdue', auth_middleware_1.authenticate, task_controller_1.taskController.getOverdueTasks);
router.get('/tasks/dashboard/stats', auth_middleware_1.authenticate, task_controller_1.taskController.getDashboardStats);
router.get('/tasks/:id', auth_middleware_1.authenticate, task_controller_1.taskController.getTaskById);
router.put('/tasks/:id', auth_middleware_1.authenticate, task_controller_1.taskController.updateTask);
router.delete('/tasks/:id', auth_middleware_1.authenticate, task_controller_1.taskController.deleteTask);
router.patch('/tasks/:id/assign', auth_middleware_1.authenticate, task_controller_1.taskController.assignTask);
router.patch('/tasks/:id/status', auth_middleware_1.authenticate, task_controller_1.taskController.updateTaskStatus);
// ========== USER ROUTES ==========
router.get('/users', auth_middleware_1.authenticate, user_controller_1.userController.getUsers);
router.get('/users/search', auth_middleware_1.authenticate, user_controller_1.userController.searchUsers);
router.get('/users/me/profile', auth_middleware_1.authenticate, user_controller_1.userController.getMyProfile);
router.put('/users/me/profile', auth_middleware_1.authenticate, user_controller_1.userController.updateMyProfile);
router.get('/users/:id', auth_middleware_1.authenticate, user_controller_1.userController.getUserById);
// ========== NOTIFICATION ROUTES ==========
router.patch('/notifications/:id/read', auth_middleware_1.authenticate, notification_controller_1.notificationController.markAsRead);
router.delete('/notifications/:id', auth_middleware_1.authenticate, notification_controller_1.notificationController.deleteNotification);
exports.default = router;
//# sourceMappingURL=api.js.map