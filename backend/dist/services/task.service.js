"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskService = exports.TaskService = void 0;
const prisma_1 = __importDefault(require("../core/database/prisma"));
class TaskService {
    // Create a new task
    async createTask(data) {
        return prisma_1.default.task.create({
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                priority: data.priority,
                status: data.status,
                creatorId: data.creatorId,
                assignedToId: data.assignedToId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Get tasks with filters
    async getTasks(filters, userId) {
        const baseCondition = {
            OR: [
                { creatorId: userId },
                { assignedToId: userId },
            ]
        };
        // Build additional filter conditions
        const filterConditions = [];
        if (filters.search) {
            filterConditions.push({
                OR: [
                    { title: { contains: filters.search, mode: 'insensitive' } },
                    { description: { contains: filters.search, mode: 'insensitive' } },
                ]
            });
        }
        if (filters.status) {
            filterConditions.push({ status: filters.status });
        }
        if (filters.priority) {
            filterConditions.push({ priority: filters.priority });
        }
        if (filters.assignedTo) {
            filterConditions.push({ assignedToId: filters.assignedTo });
        }
        if (filters.createdBy) {
            filterConditions.push({ creatorId: filters.createdBy });
        }
        if (filters.overdue === 'true') {
            filterConditions.push({
                dueDate: { lt: new Date() },
                status: { not: 'COMPLETED' },
            });
        }
        // Combine base condition with additional filters
        const where = filterConditions.length > 0
            ? {
                AND: [
                    baseCondition,
                    ...filterConditions,
                ]
            }
            : baseCondition;
        // Determine sort order
        let orderBy = {};
        switch (filters.sortBy) {
            case 'dueDate-asc':
                orderBy = { dueDate: 'asc' };
                break;
            case 'dueDate-desc':
                orderBy = { dueDate: 'desc' };
                break;
            case 'priority-asc':
                orderBy = { priority: 'asc' };
                break;
            case 'priority-desc':
                orderBy = { priority: 'desc' };
                break;
            case 'createdAt-desc':
                orderBy = { createdAt: 'desc' };
                break;
            default:
                orderBy = { dueDate: 'asc' };
        }
        return prisma_1.default.task.findMany({
            where,
            orderBy,
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Get a single task by ID
    async getTaskById(id) {
        return prisma_1.default.task.findUnique({
            where: { id },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Update a task
    async updateTask(id, data) {
        return prisma_1.default.task.update({
            where: { id },
            data: {
                title: data.title,
                description: data.description,
                dueDate: data.dueDate,
                priority: data.priority,
                status: data.status,
                assignedToId: data.assignedToId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Delete a task
    async deleteTask(id) {
        return prisma_1.default.task.delete({
            where: { id },
        });
    }
    // Assign task to user
    async assignTask(taskId, userId) {
        // Check if user exists
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user) {
            throw new Error('User not found');
        }
        return prisma_1.default.task.update({
            where: { id: taskId },
            data: {
                assignedToId: userId,
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Update task status
    async updateTaskStatus(taskId, status) {
        return prisma_1.default.task.update({
            where: { id: taskId },
            data: { status },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
    // Get dashboard statistics
    async getDashboardStats(userId) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);
        const [assignedTasks, createdTasks, overdueTasks, completedTasks, tasksCompletedToday, tasksCreatedThisWeek, tasksDueTomorrow,] = await Promise.all([
            // Count assigned tasks
            prisma_1.default.task.count({
                where: {
                    assignedToId: userId,
                    status: { not: 'COMPLETED' },
                },
            }),
            // Count created tasks
            prisma_1.default.task.count({
                where: {
                    creatorId: userId,
                },
            }),
            // Count overdue tasks
            prisma_1.default.task.count({
                where: {
                    assignedToId: userId,
                    dueDate: { lt: new Date() },
                    status: { not: 'COMPLETED' },
                },
            }),
            // Count completed tasks
            prisma_1.default.task.count({
                where: {
                    assignedToId: userId,
                    status: 'COMPLETED',
                },
            }),
            // Tasks completed today
            prisma_1.default.task.count({
                where: {
                    assignedToId: userId,
                    status: 'COMPLETED',
                    updatedAt: {
                        gte: today,
                    },
                },
            }),
            // Tasks created this week
            prisma_1.default.task.count({
                where: {
                    creatorId: userId,
                    createdAt: {
                        gte: weekAgo,
                    },
                },
            }),
            // Tasks due tomorrow
            prisma_1.default.task.count({
                where: {
                    assignedToId: userId,
                    status: { not: 'COMPLETED' },
                    dueDate: {
                        gte: tomorrow,
                        lt: dayAfterTomorrow,
                    },
                },
            }),
        ]);
        return {
            assignedTasks,
            createdTasks,
            overdueTasks,
            completedTasks,
            tasksCompletedToday,
            tasksCreatedThisWeek,
            tasksDueTomorrow,
        };
    }
    // Get tasks for current user
    async getMyTasks(userId) {
        return prisma_1.default.task.findMany({
            where: {
                OR: [
                    { creatorId: userId },
                    { assignedToId: userId },
                ]
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    }
    // Get overdue tasks
    async getOverdueTasks(userId) {
        return prisma_1.default.task.findMany({
            where: {
                assignedToId: userId,
                dueDate: { lt: new Date() },
                status: { not: 'COMPLETED' },
            },
            include: {
                creator: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                assignedTo: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                dueDate: 'asc',
            },
        });
    }
}
exports.TaskService = TaskService;
exports.taskService = new TaskService();
//# sourceMappingURL=task.service.js.map