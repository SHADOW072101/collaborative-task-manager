// backend/src/api.ts
import express, { Router } from 'express';
import { authController } from './modules/controllers/auth.controller';
import { taskController } from './modules/tasks/task.controller';
import { authenticate } from './modules/auth/auth.middleware';
import { userController } from './modules/users/user.controller';
import { notificationController } from './modules/notifications/notification.controller';

const router = Router();

// ========== AUTH ROUTES ==========
router.post('/api/auth/register', authController.register);
router.post('/api/auth/login', authController.login);
router.post('/api/auth/logout', authenticate, authController.logout);
router.post('/api/auth/refresh-token', authController.refreshToken);
router.get('/api/auth/me', authenticate, authController.getCurrentUser);
router.put('/api/auth/profile', authenticate, authController.updateProfile);

// ========== TASK ROUTES ==========
// Apply authentication middleware to all task routes
router.use('/api/tasks', authenticate);
router.post('/api/tasks', taskController.createTask);
router.get('/api/tasks', taskController.getTasks);
router.get('/api/tasks/my', taskController.getMyTasks);
router.get('/api/tasks/overdue', taskController.getOverdueTasks);
router.get('/api/tasks/dashboard/stats', taskController.getDashboardStats);
router.get('/api/tasks/:id', taskController.getTaskById);
router.put('/api/tasks/:id', taskController.updateTask);
router.delete('/api/tasks/:id', taskController.deleteTask);
router.patch('/api/tasks/:id/assign', taskController.assignTask);
router.patch('/api/tasks/:id/status', taskController.updateTaskStatus);

// ========== USER ROUTES ==========
router.use('/api/users', authenticate);

router.get('/api/users', userController.getUsers);
router.get('/api/users/search', userController.searchUsers);
router.get('/api/users/me/profile', userController.getMyProfile);
router.put('/api/users/me/profile', userController.updateMyProfile);
router.get('/api/users/:id', userController.getUserById);
// ========== NOTIFICATION ROUTES ==========
router.use('/api/notifications', authenticate);

// router.get('/api/notifications', notificationController.getNotifications);
router.patch('/api/notifications/:id/read', notificationController.markAsRead);
router.delete('/api/notifications/:id', notificationController.deleteNotification);

export default router;