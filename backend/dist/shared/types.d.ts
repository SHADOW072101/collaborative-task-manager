export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
    meta?: {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
    };
}
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}
export interface FilterParams {
    search?: string;
    [key: string]: any;
}
export interface AuthUser {
    id: string;
    email: string;
    name: string;
}
export interface AuthenticatedRequest extends Request {
    user?: AuthUser;
}
export interface SocketUser {
    userId: string;
    email: string;
    name: string;
    socketId: string;
}
//# sourceMappingURL=types.d.ts.map