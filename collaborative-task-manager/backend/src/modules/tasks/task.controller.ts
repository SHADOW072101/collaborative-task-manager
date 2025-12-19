import { Request, Response } from 'express';
import { z } from 'zod';
import { taskService } from '../../services/task.service';
import { io } from '../../app';
import { Status } from '@prisma/client';

// Validation Schemas using Zod
export const createTaskSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().optional(),
  dueDate: z.string().or(z.date()),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).default('TODO'),
  assignedToId: z.string().optional(),
  projectId: z.string().optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  assignedToId: z.string().optional(),
});

const taskFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  assignedTo: z.string().optional(),
  createdBy: z.string().optional(),
  overdue: z.enum(['true', 'false']).optional(),
  sortBy: z.enum(['dueDate-asc', 'dueDate-desc', 'priority-asc', 'priority-desc', 'createdAt-desc']).optional(),
});

const assignTaskSchema = z.object({
  userId: z.string().min(1),
});

const updateStatusSchema = z.object({
  status: z.enum(['TODO', 'IN_PROGRESS', 'REVIEW', 'COMPLETED']),
});



export class TaskController {
  // Create a new task
  async createTask(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const validatedData = createTaskSchema.parse(req.body);
      
      // Fix the status if it's missing underscore
      let status = validatedData.status;
      if (status === 'IN_PROGRESS') {
        status = 'IN_PROGRESS' as Status;
      }
      
      const task = await taskService.createTask({
        ...validatedData,
        dueDate: new Date(validatedData.dueDate),
        creatorId: req.user.id,
        status, // Use corrected status
      });
    
      // Emit socket event
      io.emit('task:created', task);

      res.status(201).json({
        success: true,
        data: task,
        message: 'Task created successfully',
      });
    } catch (error: any) {
      // ... error handling
    }
  }

  // Get all tasks with filters
  async getTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const validatedFilters = taskFiltersSchema.parse(req.query);
      
      // If assignedTo is 'me', use current user's ID
      const filters = { ...validatedFilters };
      if (filters.assignedTo === 'me') {
        filters.assignedTo = req.user.id;
      }
      
      const tasks = await taskService.getTasks(filters, req.user.id);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
  async getTaskById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      const task = await taskService.getTaskById(id);

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
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch task',
      });
    }
  }

  // Update a task
  async updateTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if task exists
      const existingTask = await taskService.getTaskById(id);
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

    const updatedTask = await taskService.updateTask(id, updateData);

      // Emit socket event for real-time updates
      io.emit('task:updated', updatedTask);

      // Send notification if assignee changed
      if (validatedData.assignedToId && 
          validatedData.assignedToId !== existingTask.assignedToId) {
        io.to(`user:${validatedData.assignedToId}`).emit('task:assigned', {
          task: updatedTask,
          assignedBy: req.user.id,
        });
      }

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: 'Task updated successfully',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
  async deleteTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      // Check if task exists
      const existingTask = await taskService.getTaskById(id);
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

      await taskService.deleteTask(id);

      // Emit socket event for real-time updates
      io.emit('task:deleted', id);

      res.status(200).json({
        success: true,
        message: 'Task deleted successfully',
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete task',
      });
    }
  }

  // Assign task to user
  async assignTask(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if task exists
      const existingTask = await taskService.getTaskById(id);
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
      
      const updatedTask = await taskService.assignTask(id, validatedData.userId);

      // Emit socket event for real-time updates
      io.emit('task:updated', updatedTask);
      
      // Send notification to assignee
      io.to(`user:${validatedData.userId}`).emit('task:assigned', {
        task: updatedTask,
        assignedBy: req.user.id,
      });

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: 'Task assigned successfully',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
  async updateTaskStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      // Check if task exists
      const existingTask = await taskService.getTaskById(id);
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
      
      const updatedTask = await taskService.updateTaskStatus(id, validatedData.status);

      // Emit socket event for real-time updates
      io.emit('task:updated', updatedTask);

      // Send notification if task is completed
      if (validatedData.status === 'COMPLETED') {
        io.to(`user:${existingTask.creatorId}`).emit('task:COMPLETED', {
          task: updatedTask,
          completedBy: req.user.id,
        });
      }

      res.status(200).json({
        success: true,
        data: updatedTask,
        message: 'Task status updated successfully',
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
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
  async getDashboardStats(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const stats = await taskService.getDashboardStats(req.user.id);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch dashboard stats',
      });
    }
  }

  // Get tasks for current user (my tasks)
  async getMyTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tasks = await taskService.getMyTasks(req.user.id);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch your tasks',
      });
    }
  }

  // Get overdue tasks
  async getOverdueTasks(req: Request, res: Response) {
    try {
      if (!req.user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const tasks = await taskService.getOverdueTasks(req.user.id);

      res.status(200).json({
        success: true,
        data: tasks,
        count: tasks.length,
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to fetch overdue tasks',
      });
    }
  }
}

export const taskController = new TaskController();