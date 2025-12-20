"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const task_controller_1 = require("./task.controller");
const auth_middleware_1 = require("../../modules/auth/auth.middleware");
const router = (0, express_1.Router)();
// All task routes require authentication
router.use(auth_middleware_1.authenticate);
router.use((req, res, next) => {
    console.log('🔍 [Tasks Route] Request reached tasks router');
    console.log('🔍 [Tasks Route] URL:', req.url);
    console.log('🔍 [Tasks Route] Method:', req.method);
    next();
});
// All task routes require authentication
router.use(auth_middleware_1.authenticate); // This should add req.user
// Add logging after authenticate
router.use((req, res, next) => {
    console.log('🔍 [Tasks Route] After auth - User:', req.user);
    next();
});
// Task CRUD operations
router.post('/', task_controller_1.taskController.createTask);
router.get('/', task_controller_1.taskController.getTasks);
router.get('/my', task_controller_1.taskController.getMyTasks);
router.get('/overdue', task_controller_1.taskController.getOverdueTasks);
router.get('/dashboard/stats', task_controller_1.taskController.getDashboardStats);
router.get('/:id', task_controller_1.taskController.getTaskById);
router.put('/:id', task_controller_1.taskController.updateTask);
router.delete('/:id', task_controller_1.taskController.deleteTask);
router.get('/', task_controller_1.taskController.getTasks);
router.get('/dashboard/stats', task_controller_1.taskController.getDashboardStats);
router.get('/my-tasks', task_controller_1.taskController.getMyTasks);
router.get('/overdue', task_controller_1.taskController.getOverdueTasks);
// Task-specific operations
router.patch('/:id/assign', task_controller_1.taskController.assignTask);
router.patch('/:id/status', task_controller_1.taskController.updateTaskStatus);
exports.default = router;
//# sourceMappingURL=task.routes.js.map