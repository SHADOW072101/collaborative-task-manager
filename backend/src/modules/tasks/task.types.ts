import { Priority, Status } from '@prisma/client';

export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: Priority;
  status: Status;
  createdAt: Date;
  updatedAt: Date;
  creatorId: string;
  assignedToId?: string;
  creator: {
    id: string;
    name: string;
    email: string;
  };
  assignedTo?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate: string;
  priority: Priority;
  status: Status;
  assignedToId?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  dueDate?: string;
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