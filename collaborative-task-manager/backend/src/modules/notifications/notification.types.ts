// backend/src/modules/notifications/notification.types.ts
export interface Notification {
  id: string;
  userId: string;
  type: 'task_assigned' | 'task_updated' | 'task_due' | 'task_completed' | 'mention' | 'system';
  title: string;
  message: string;
  data?: Record<string, any>;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateNotificationDto {
  userId: string;
  type: Notification['type'];
  title: string;
  message: string;
  data?: Record<string, any>;
}

export interface UpdateNotificationDto {
  read?: boolean;
}