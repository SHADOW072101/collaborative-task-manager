export declare const TASK_STATUS: {
    readonly TODO: "TODO";
    readonly IN_PROGRESS: "INPROGRESS";
    readonly REVIEW: "REVIEW";
    readonly COMPLETED: "COMPLETED";
};
export type TaskStatus = typeof TASK_STATUS[keyof typeof TASK_STATUS];
export declare const TASK_PRIORITY: {
    readonly LOW: "LOW";
    readonly MEDIUM: "MEDIUM";
    readonly HIGH: "HIGH";
    readonly URGENT: "URGENT";
};
export type TaskPriority = typeof TASK_PRIORITY[keyof typeof TASK_PRIORITY];
export declare const NOTIFICATION_TYPES: {
    readonly TASK_ASSIGNED: "TASK_ASSIGNED";
    readonly TASK_UPDATED: "TASK_UPDATED";
    readonly TASK_DUE: "TASK_DUE";
    readonly TASK_COMPLETED: "TASK_COMPLETED";
    readonly MENTION: "MENTION";
    readonly SYSTEM: "SYSTEM";
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