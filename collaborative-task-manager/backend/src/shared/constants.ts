// backend/src/shared/constants.ts

// Task constants
export const TASK_STATUS = {
  TODO: 'ToDo',
  IN_PROGRESS: 'InProgress',
  REVIEW: 'Review',
  COMPLETED: 'Completed',
} as const;

export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];

export const TASK_PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
  URGENT: 'Urgent',
} as const;

export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];

// Notification types
export const NOTIFICATION_TYPES = {
  TASK_ASSIGNED: 'task_assigned',
  TASK_UPDATED: 'task_updated',
  TASK_DUE: 'task_due',
  TASK_COMPLETED: 'task_completed',
  MENTION: 'mention',
  SYSTEM: 'system',
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];

// User roles (if needed)
export const USER_ROLES = {
  ADMIN: 'admin',
  USER: 'user',
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Pagination defaults
export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
};

// Cache TTLs (in seconds)
export const CACHE_TTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
};