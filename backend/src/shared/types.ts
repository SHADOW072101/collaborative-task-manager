// backend/src/shared/types.ts

// Common API response type
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

// Common pagination params
export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Common filter params
export interface FilterParams {
  search?: string;
  [key: string]: any;
}

// User type (shared across modules)
export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

// Request with user
export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

// Socket user data
export interface SocketUser {
  userId: string;
  email: string;
  name: string;
  socketId: string;
}