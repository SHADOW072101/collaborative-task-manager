import { Router } from 'express';
import { taskController } from './task.controller';
import { authenticate } from '../../modules/auth/auth.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);


router.use((req, res, next) => {
  console.log('🔍 [Tasks Route] Request reached tasks router');
  console.log('🔍 [Tasks Route] URL:', req.url);
  console.log('🔍 [Tasks Route] Method:', req.method);
  next();
});

// All task routes require authentication
router.use(authenticate); // This should add req.user

// Add logging after authenticate
router.use((req, res, next) => {
  console.log('🔍 [Tasks Route] After auth - User:', req.user);
  next();
});



// Task CRUD operations
router.post('/', taskController.createTask);
router.get('/', taskController.getTasks);
router.get('/my', taskController.getMyTasks);
router.get('/overdue', taskController.getOverdueTasks);
router.get('/dashboard/stats', taskController.getDashboardStats);
router.get('/:id', taskController.getTaskById);
router.put('/:id', taskController.updateTask);
router.delete('/:id', taskController.deleteTask);

router.get('/', taskController.getTasks);
router.get('/dashboard/stats', taskController.getDashboardStats);
router.get('/my-tasks', taskController.getMyTasks);
router.get('/overdue', taskController.getOverdueTasks);

// Task-specific operations
router.patch('/:id/assign', taskController.assignTask);
router.patch('/:id/status', taskController.updateTaskStatus);

export default router;