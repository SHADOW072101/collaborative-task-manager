export declare const TASK_STATUS: {
    readonly TODO: "ToDo";
    readonly IN_PROGRESS: "InProgress";
    readonly REVIEW: "Review";
    readonly COMPLETED: "Completed";
};
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export declare const TASK_PRIORITY: {
    readonly LOW: "Low";
    readonly MEDIUM: "Medium";
    readonly HIGH: "High";
    readonly URGENT: "Urgent";
};
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export declare const NOTIFICATION_TYPES: {
    readonly TASK_ASSIGNED: "task_assigned";
    readonly TASK_UPDATED: "task_updated";
    readonly TASK_DUE: "task_due";
    readonly TASK_COMPLETED: "task_completed";
    readonly MENTION: "mention";
    readonly SYSTEM: "system";
};
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export declare const USER_ROLES: {
    readonly ADMIN: "admin";
    readonly USER: "user";
};
export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];
export declare const PAGINATION_DEFAULTS: {
    PAGE: number;
    LIMIT: number;
    MAX_LIMIT: number;
};
export declare const CACHE_TTL: {
    SHORT: number;
    MEDIUM: number;
    LONG: number;
};
//# sourceMappingURL=constants.d.ts.map