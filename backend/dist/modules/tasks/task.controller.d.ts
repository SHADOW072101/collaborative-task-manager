import { Request, Response } from 'express';
import { z } from 'zod';
export declare const createTaskSchema: z.ZodObject<{
    title: z.ZodString;
    description: z.ZodOptional<z.ZodString>;
    dueDate: z.ZodUnion<[z.ZodString, z.ZodDate]>;
    priority: z.ZodDefault<z.ZodEnum<["LOW", "MEDIUM", "HIGH", "URGENT"]>>;
    status: z.ZodDefault<z.ZodEnum<["TODO", "IN_PROGRESS", "REVIEW", "COMPLETED"]>>;
    assignedToId: z.ZodOptional<z.ZodString>;
    projectId: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED";
    title: string;
    dueDate: string | Date;
    priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
    description?: string | undefined;
    projectId?: string | undefined;
    assignedToId?: string | undefined;
}, {
    title: string;
    dueDate: string | Date;
    status?: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED" | undefined;
    description?: string | undefined;
    priority?: "LOW" | "MEDIUM" | "HIGH" | "URGENT" | undefined;
    projectId?: string | undefined;
    assignedToId?: string | undefined;
}>;
export declare class TaskController {
    createTask(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getTasks(req: Request, res: Response): Promise<void>;
    getTaskById(req: Request, res: Response): Promise<void>;
    updateTask(req: Request, res: Response): Promise<void>;
    deleteTask(req: Request, res: Response): Promise<void>;
    assignTask(req: Request, res: Response): Promise<void>;
    updateTaskStatus(req: Request, res: Response): Promise<void>;
    getDashboardStats(req: Request, res: Response): Promise<void>;
    getMyTasks(req: Request, res: Response): Promise<void>;
    getOverdueTasks(req: Request, res: Response): Promise<void>;
}
export declare const taskController: TaskController;
//# sourceMappingURL=task.controller.d.ts.map