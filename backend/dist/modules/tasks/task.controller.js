"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskController = exports.TaskController = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
const task_service_1 = require("../../services/task.service");
const server_1 = require("../../server");
// Validation Schemas using Zod
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(200),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().or(zod_1.z.date()),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
    assignedToId: zod_1.z.string().optional(),
    projectId: zod_1.z.string().optional(),
});
const updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional(),
    dueDate: zod_1.z.string().refine((val) => !isNaN(Date.parse(val)), {
        message: 'Invalid date format',
    }).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
    assignedToId: zod_1.z.string().optional(),
});
const taskFiltersSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    assignedTo: zod_1.z.string().optional(),
    createdBy: zod_1.z.string().optional(),
    overdue: zod_1.z.enum(['true', 'false']).optional(),
    sortBy: zod_1.z.enum(['dueDate-asc', 'dueDate-desc', 'priority-asc', 'priority-desc', 'createdAt-desc']).optional(),
    view: zod_1.z.enum(['all', 'my', 'assigned']).optional(),
});
const assignTaskSchema = zod_1.z.object({
    userId: zod_1.z.string().min(1),
});
const updateStatusSchema = zod_1.z.object({
    status: zod_1.z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
});
class TaskController {
    // Create a new task
    async createTask(req, res) {
        try {
            if (!req.user) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const validatedData = exports.createTaskSchema.parse(req.body);
            // Fix the status if it's missing underscore
            let status = validatedData.status;
            if (status === 'IN_PROGRESS') {
                status = 'IN_PROGRESS';
            }
            const task = await task_service_1.taskService.createTask({
                ...validatedData,
                dueDate: new Date(validatedData.dueDate),
                creatorId: req.user.id,
                status, // Use corrected status
            });
            // Emit socket event
            server_1.io.emit('task:created', task);
            res.status(201).json({
                success: true,
                data: task,
                message: 'Task created successfully',
            });
        }
        catch (error) {
            // ... error handling
        }
    }
    // Get all tasks with filters
    async getTasks(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const validatedFilters = taskFiltersSchema.parse(req.query);
            // Handle view parameter
            const filters = { ...validatedFilters };
            // IMPORTANT: Set filters based on view parameter
            if (filters.view === 'my') {
                // For "my tasks", show tasks where user is creator OR assignee
                // We'll handle this in the service by not setting assignedTo/createdBy
                delete filters.assignedTo;
                delete filters.createdBy;
            }
            else if (filters.view === 'assigned') {
                // For "assigned tasks", filter by assignedTo = current user
                filters.assignedTo = req.user.id;
            }
            // For "all" view, use whatever filters are provided
            // Remove view from filters since service doesn't need it
            delete filters.view;
            const tasks = await task_service_1.taskService.getTasks(filters, req.user.id);
            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Invalid filters',
                    details: error.errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch tasks',
            });
        }
    }
    // Get a single task by ID
    async getTaskById(req, res) {
        try {
            const { id } = req.params;
            const task = await task_service_1.taskService.getTaskById(id);
            if (!task) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
                return;
            }
            res.status(200).json({
                success: true,
                data: task,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch task',
            });
        }
    }
    // Update a task
    async updateTask(req, res) {
        try {
            const { id } = req.params;
            // Check if task exists
            const existingTask = await task_service_1.taskService.getTaskById(id);
            if (!existingTask) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
                return;
            }
            // Check permissions (only creator or assignee can update)
            if (!req.user ||
                (existingTask.creatorId !== req.user.id &&
                    existingTask.assignedToId !== req.user.id)) {
                res.status(403).json({
                    success: false,
                    error: 'You do not have permission to update this task',
                });
                return;
            }
            const validatedData = updateTaskSchema.parse(req.body);
            // Convert dueDate string to Date object if provided
            const updateData = {
                title: validatedData.title,
                description: validatedData.description,
                dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
                priority: validatedData.priority,
                status: validatedData.status,
                assignedToId: validatedData.assignedToId
            };
            const updatedTask = await task_service_1.taskService.updateTask(id, updateData);
            // Emit socket event for real-time updates
            server_1.io.emit('task:updated', updatedTask);
            // Send notification if assignee changed
            if (validatedData.assignedToId &&
                validatedData.assignedToId !== existingTask.assignedToId) {
                server_1.io.to(`user:${validatedData.assignedToId}`).emit('task:assigned', {
                    task: updatedTask,
                    assignedBy: req.user.id,
                });
            }
            res.status(200).json({
                success: true,
                data: updatedTask,
                message: 'Task updated successfully',
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update task',
            });
        }
    }
    // Delete a task
    async deleteTask(req, res) {
        try {
            const { id } = req.params;
            // Check if task exists
            const existingTask = await task_service_1.taskService.getTaskById(id);
            if (!existingTask) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
                return;
            }
            // Check permissions (only creator can delete)
            if (!req.user || existingTask.creatorId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: 'You do not have permission to delete this task',
                });
                return;
            }
            await task_service_1.taskService.deleteTask(id);
            // Emit socket event for real-time updates
            server_1.io.emit('task:deleted', id);
            res.status(200).json({
                success: true,
                message: 'Task deleted successfully',
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to delete task',
            });
        }
    }
    // Assign task to user
    async assignTask(req, res) {
        try {
            const { id } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Check if task exists
            const existingTask = await task_service_1.taskService.getTaskById(id);
            if (!existingTask) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
                return;
            }
            // Check permissions (only creator can assign)
            if (existingTask.creatorId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: 'Only task creator can assign tasks',
                });
                return;
            }
            const validatedData = assignTaskSchema.parse(req.body);
            const updatedTask = await task_service_1.taskService.assignTask(id, validatedData.userId);
            // Emit socket event for real-time updates
            server_1.io.emit('task:updated', updatedTask);
            // Send notification to assignee
            server_1.io.to(`user:${validatedData.userId}`).emit('task:assigned', {
                task: updatedTask,
                assignedBy: req.user.id,
            });
            res.status(200).json({
                success: true,
                data: updatedTask,
                message: 'Task assigned successfully',
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to assign task',
            });
        }
    }
    // Update task status
    async updateTaskStatus(req, res) {
        try {
            const { id } = req.params;
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            // Check if task exists
            const existingTask = await task_service_1.taskService.getTaskById(id);
            if (!existingTask) {
                res.status(404).json({
                    success: false,
                    error: 'Task not found',
                });
                return;
            }
            // Check permissions (only assignee or creator can update status)
            if (existingTask.assignedToId !== req.user.id &&
                existingTask.creatorId !== req.user.id) {
                res.status(403).json({
                    success: false,
                    error: 'You do not have permission to update this task status',
                });
                return;
            }
            const validatedData = updateStatusSchema.parse(req.body);
            const updatedTask = await task_service_1.taskService.updateTaskStatus(id, validatedData.status);
            // Emit socket event for real-time updates
            server_1.io.emit('task:updated', updatedTask);
            // Send notification if task is completed
            if (validatedData.status === 'COMPLETED') {
                server_1.io.to(`user:${existingTask.creatorId}`).emit('task:COMPLETED', {
                    task: updatedTask,
                    completedBy: req.user.id,
                });
            }
            res.status(200).json({
                success: true,
                data: updatedTask,
                message: 'Task status updated successfully',
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors,
                });
                return;
            }
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to update task status',
            });
        }
    }
    // Get dashboard statistics
    async getDashboardStats(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const stats = await task_service_1.taskService.getDashboardStats(req.user.id);
            res.status(200).json({
                success: true,
                data: stats,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch dashboard stats',
            });
        }
    }
    // Get tasks for current user (my tasks)
    async getMyTasks(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const tasks = await task_service_1.taskService.getMyTasks(req.user.id);
            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch your tasks',
            });
        }
    }
    // Get overdue tasks
    async getOverdueTasks(req, res) {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Unauthorized' });
                return;
            }
            const tasks = await task_service_1.taskService.getOverdueTasks(req.user.id);
            res.status(200).json({
                success: true,
                data: tasks,
                count: tasks.length,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch overdue tasks',
            });
        }
    }
}
exports.TaskController = TaskController;
exports.taskController = new TaskController();
//# sourceMappingURL=task.controller.js.map