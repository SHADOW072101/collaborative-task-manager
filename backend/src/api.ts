// backend/src/api.ts 
import { Router } from 'express';
import { authController } from './modules/controllers/auth.controller';
import { taskController } from './modules/tasks/task.controller';
import { authenticate } from './modules/auth/auth.middleware';
import { userController } from './modules/users/user.controller';
import { notificationController } from './modules/notifications/notification.controller';

const router = Router();

// ========== AUTH ROUTES ==========
// Remove "/api" prefix since it will be added when mounted
router.post('/auth/register', authController.register);  
router.post('/auth/login', authController.login);
router.post('/auth/logout', authenticate, authController.logout);
router.post('/auth/refresh-token', authController.refreshToken);
router.get('/auth/me', authenticate, authController.getCurrentUser);
router.put('/auth/profile', authenticate, authController.updateProfile);

// ========== TASK ROUTES ==========
router.post('/tasks', authenticate, taskController.createTask);
router.get('/tasks', authenticate, taskController.getTasks);
router.get('/tasks/my', authenticate, taskController.getMyTasks);
router.get('/tasks/overdue', authenticate, taskController.getOverdueTasks);
router.get('/tasks/dashboard/stats', authenticate, taskController.getDashboardStats);
router.get('/tasks/:id', authenticate, taskController.getTaskById);
router.put('/tasks/:id', authenticate, taskController.updateTask);
router.delete('/tasks/:id', authenticate, taskController.deleteTask);
router.patch('/tasks/:id/assign', authenticate, taskController.assignTask);
router.patch('/tasks/:id/status', authenticate, taskController.updateTaskStatus);

// ========== USER ROUTES ==========
router.get('/users', authenticate, userController.getUsers);
router.get('/users/search', authenticate, userController.searchUsers);
router.get('/users/me/profile', authenticate, userController.getMyProfile);
router.put('/users/me/profile', authenticate, userController.updateMyProfile);
router.get('/users/:id', authenticate, userController.getUserById);

// ========== NOTIFICATION ROUTES ==========
router.patch('/notifications/:id/read', authenticate, notificationController.markAsRead);
router.delete('/notifications/:id', authenticate, notificationController.deleteNotification);

export default router;