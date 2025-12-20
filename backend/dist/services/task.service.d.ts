import { Priority, Status } from '@prisma/client';
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
    createTask(data: CreateTaskData): Promise<{
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }>;
    getTasks(filters: TaskFilters, userId: string): Promise<({
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    })[]>;
    getTaskById(id: string): Promise<({
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }) | null>;
    updateTask(id: string, data: UpdateTaskData): Promise<{
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }>;
    deleteTask(id: string): Promise<{
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }>;
    assignTask(taskId: string, userId: string): Promise<{
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }>;
    updateTaskStatus(taskId: string, status: Status): Promise<{
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    }>;
    getDashboardStats(userId: string): Promise<{
        assignedTasks: number;
        createdTasks: number;
        overdueTasks: number;
        completedTasks: number;
        tasksCompletedToday: number;
        tasksCreatedThisWeek: number;
        tasksDueTomorrow: number;
    }>;
    getMyTasks(userId: string): Promise<({
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    })[]>;
    getOverdueTasks(userId: string): Promise<({
        creator: {
            name: string;
            email: string;
            id: string;
        };
        assignedTo: {
            name: string;
            email: string;
            id: string;
        } | null;
    } & {
        status: import(".prisma/client").$Enums.Status;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        title: string;
        description: string | null;
        dueDate: Date | null;
        startDate: Date | null;
        completedAt: Date | null;
        priority: import(".prisma/client").$Enums.Priority;
        estimatedTime: number | null;
        actualTime: number | null;
        order: number;
        projectId: string | null;
        creatorId: string;
        assignedToId: string | null;
        parentTaskId: string | null;
    })[]>;
}
export declare const taskService: TaskService;
//# sourceMappingURL=task.service.d.ts.map