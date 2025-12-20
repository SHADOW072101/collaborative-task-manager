"use strict";
// backend/src/shared/constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.PAGINATION_DEFAULTS = exports.USER_ROLES = exports.NOTIFICATION_TYPES = exports.TASK_PRIORITY = exports.TASK_STATUS = void 0;
// Task constants
exports.TASK_STATUS = {
    TODO: 'ToDo',
    IN_PROGRESS: 'InProgress',
    REVIEW: 'Review',
    COMPLETED: 'Completed',
};
exports.TASK_PRIORITY = {
    LOW: 'Low',
    MEDIUM: 'Medium',
    HIGH: 'High',
    URGENT: 'Urgent',
};
// Notification types
exports.NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'task_assigned',
    TASK_UPDATED: 'task_updated',
    TASK_DUE: 'task_due',
    TASK_COMPLETED: 'task_completed',
    MENTION: 'mention',
    SYSTEM: 'system',
};
// User roles (if needed)
exports.USER_ROLES = {
    ADMIN: 'admin',
    USER: 'user',
};
// Pagination defaults
exports.PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 20,
    MAX_LIMIT: 100,
};
// Cache TTLs (in seconds)
exports.CACHE_TTL = {
    SHORT: 60, // 1 minute
    MEDIUM: 300, // 5 minutes
    LONG: 3600, // 1 hour
};
//# sourceMappingURL=constants.js.map