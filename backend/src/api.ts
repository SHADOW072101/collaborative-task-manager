// backend/src/api.ts
import express, { Router } from 'express';
import { authController } from './modules/controllers/auth.controller';
import { taskController } from './modules/tasks/task.controller';
import { authenticate } from './modules/auth/auth.middleware';
import { userController } from './modules/users/user.controller';
import { notificationController } from './modules/notifications/notification.controller';

const router = Router();

// ========== AUTH ROUTES ==========
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticate, authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);
router.get('/auth/me', authenticate, authController.getCurrentUser);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ========== TASK ROUTES ==========
// Apply authentication middleware to all task routes
router.use('/tasks', authenticate);

router.post('/tasks', taskController.createTask);
router.get('/tasks', taskController.getTasks);
router.get('/tasks/my', taskController.getMyTasks);
router.get('/tasks/overdue', taskController.getOverdueTasks);
router.get('/tasks/dashboard/stats', taskController.getDashboardStats);
router.get('/tasks/:id', taskController.getTaskById);
router.put('/tasks/:id', taskController.updateTask);
router.delete('/tasks/:id', taskController.deleteTask);
router.patch('/tasks/:id/assign', taskController.assignTask);
router.patch('/tasks/:id/status', taskController.updateTaskStatus);

// ========== USER ROUTES ==========
router.use('/users', authenticate);

router.get('/users', userController.getUsers);
router.get('/users/search', userController.searchUsers);
router.get('/users/me/profile', userController.getMyProfile);
router.put('/users/me/profile', userController.updateMyProfile);
router.get('/users/:id', userController.getUserById);

// ========== NOTIFICATION ROUTES ==========
router.use('/notifications', authenticate);

// router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/:id/read', notificationController.markAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

export default router;