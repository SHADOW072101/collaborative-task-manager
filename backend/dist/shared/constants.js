"use strict";
// backend/src/shared/constants.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_TTL = exports.PAGINATION_DEFAULTS = exports.USER_ROLES = exports.NOTIFICATION_TYPES = exports.TASK_PRIORITY = exports.TASK_STATUS = void 0;
// Task constants
exports.TASK_STATUS = {
    TODO: 'TODO',
    IN_PROGRESS: 'INPROGRESS',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
};
exports.TASK_PRIORITY = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    URGENT: 'URGENT',
};
// Notification types
exports.NOTIFICATION_TYPES = {
    TASK_ASSIGNED: 'TASK_ASSIGNED',
    TASK_UPDATED: 'TASK_UPDATED',
    TASK_DUE: 'TASK_DUE',
    TASK_COMPLETED: 'TASK_COMPLETED',
    MENTION: 'MENTION',
    SYSTEM: 'SYSTEM',
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