import { PaginationParams } from './types';
/**
 * Format API response
 */
export declare const formatResponse: <T>(data: T, message?: string, meta?: any) => {
    success: boolean;
    message?: string;
    data: T;
    meta?: any;
};
/**
 * Format error response
 */
export declare const formatError: (error: string, details?: any) => any;
/**
 * Calculate pagination metadata
 */
export declare const calculatePagination: (total: number, page?: number, limit?: number) => {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
    nextPage: number | null;
    prevPage: number | null;
};
/**
 * Parse pagination from query params
 */
export declare const parsePagination: (query: any) => PaginationParams;
/**
 * Generate random string
 */
export declare const generateRandomString: (length?: number) => string;
/**
 * Delay execution
 */
export declare const delay: (ms: number) => Promise<void>;
/**
 * Validate email format
 */
export declare const isValidEmail: (email: string) => boolean;
/**
 * Sanitize string (remove extra spaces, trim)
 */
export declare const sanitizeString: (str: string) => string;
/**
 * Format date to ISO string
 */
export declare const formatDate: (date: Date) => string;
/**
 * Check if date is valid
 */
export declare const isValidDate: (date: any) => boolean;
//# sourceMappingURL=utils.d.ts.map