import prisma from '../core/database/prisma';
import { Prisma, Priority, Status } from '@prisma/client';

export interface CreateTaskData {
  title: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  creatorId: string;
  assignedToId?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  dueDate?: Date;
  priority?: Priority;
  status?: Status;
  assignedToId?: string;
}

export interface TaskFilters {
  search?: string;
  status?: Status;
  priority?: Priority;
  assignedTo?: string;
  createdBy?: string;
  overdue?: 'true' | 'false';
  sortBy?: 'dueDate-asc' | 'dueDate-desc' | 'priority-asc' | 'priority-desc' | 'createdAt-desc';
}

export class TaskService {
  // Create a new task
  async createTask(data: CreateTaskData) {
    return prisma.task.create({
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
  async getTasks(filters: TaskFilters, userId: string) {
    const where: Prisma.TaskWhereInput = {};

    // Apply filters
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.assignedTo) {
      where.assignedToId = filters.assignedTo;
    }

    if (filters.createdBy) {
      where.creatorId = filters.createdBy;
    }

    if (filters.overdue === 'true') {
      where.dueDate = { lt: new Date() };
      where.status = { not: 'Completed' };
    }

    // Ensure user can only see tasks they created or are assigned to
    where.OR = [
      { creatorId: userId },
      { assignedToId: userId },
    ];

    // Determine sort order
    let orderBy: Prisma.TaskOrderByWithRelationInput = {};
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

    return prisma.task.findMany({
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
  async getTaskById(id: string) {
    return prisma.task.findUnique({
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
  async updateTask(id: string, data: UpdateTaskData) {
    return prisma.task.update({
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
  async deleteTask(id: string) {
    return prisma.task.delete({
      where: { id },
    });
  }

  // Assign task to user
  async assignTask(taskId: string, userId: string) {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return prisma.task.update({
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
  async updateTaskStatus(taskId: string, status: Status) {
    return prisma.task.update({
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
  async getDashboardStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const dayAfterTomorrow = new Date(tomorrow);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

    const [
      assignedTasks,
      createdTasks,
      overdueTasks,
      completedTasks,
      tasksCompletedToday,
      tasksCreatedThisWeek,
      tasksDueTomorrow,
    ] = await Promise.all([
      // Count assigned tasks
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: { not: 'Completed' },
        },
      }),

      // Count created tasks
      prisma.task.count({
        where: {
          creatorId: userId,
        },
      }),

      // Count overdue tasks
      prisma.task.count({
        where: {
          assignedToId: userId,
          dueDate: { lt: new Date() },
          status: { not: 'Completed' },
        },
      }),

      // Count completed tasks
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: 'Completed',
        },
      }),

      // Tasks completed today
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: 'Completed',
          updatedAt: {
            gte: today,
          },
        },
      }),

      // Tasks created this week
      prisma.task.count({
        where: {
          creatorId: userId,
          createdAt: {
            gte: weekAgo,
          },
        },
      }),

      // Tasks due tomorrow
      prisma.task.count({
        where: {
          assignedToId: userId,
          status: { not: 'Completed' },
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
  async getMyTasks(userId: string) {
    return prisma.task.findMany({
      where: {
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
      orderBy: {
        dueDate: 'asc',
      },
    });
  }

  // Get overdue tasks
  async getOverdueTasks(userId: string) {
    return prisma.task.findMany({
      where: {
        assignedToId: userId,
        dueDate: { lt: new Date() },
        status: { not: 'Completed' },
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

export const taskService = new TaskService();