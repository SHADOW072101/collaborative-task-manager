export interface Notification {
  id: string;
  type: 'TASK_ASSIGNED' | 'TASK_UPDATED' | 'TASK_OVERDUE' | 'SYSTEM';
  message: string;
  metadata: {
    taskId?: string;
    taskTitle?: string;
    updatedBy?: string;
  };
  read: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}