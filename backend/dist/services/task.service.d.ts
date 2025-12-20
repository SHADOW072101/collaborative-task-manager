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
export declare class TaskService {
    createTask(data: CreateTaskData): Promise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "create">>;
    getTasks(filters: TaskFilters, userId: string): Promise<$Public.PrismaPromise<T>>;
    getTaskById(id: string): Promise<any>;
    updateTask(id: string, data: UpdateTaskData): Promise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update">>;
    deleteTask(id: string): Promise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "delete">>;
    assignTask(taskId: string, userId: string): Promise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update">>;
    updateTaskStatus(taskId: string, status: Status): Promise<$Result.GetResult<Prisma.$TaskPayload<ExtArgs>, T, "update">>;
    getDashboardStats(userId: string): Promise<{
        assignedTasks: any;
        createdTasks: any;
        overdueTasks: any;
        completedTasks: any;
        tasksCompletedToday: any;
        tasksCreatedThisWeek: any;
        tasksDueTomorrow: any;
    }>;
    getMyTasks(userId: string): Promise<$Public.PrismaPromise<T>>;
    getOverdueTasks(userId: string): Promise<$Public.PrismaPromise<T>>;
}
export declare const taskService: TaskService;
//# sourceMappingURL=task.service.d.ts.map