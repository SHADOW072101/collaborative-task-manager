// backend/src/shared/utils.ts

import { PaginationParams } from './types';

/**
 * Format API response
 */
export const formatResponse = <T>(
  data: T,
  message?: string,
  meta?: any
): { success: boolean; message?: string; data: T; meta?: any } => {
  return {
    success: true,
    message,
    data,
    ...(meta && { meta }),
  };
};

/**
 * Format error response
 */
export const formatError = (error: string, details?: any) => {
  return {
    success: false,
    error,
    ...(details && { details }),
  };
};

/**
 * Calculate pagination metadata
 */
export const calculatePagination = (
  total: number,
  page: number = 1,
  limit: number = 20
) => {
  const totalPages = Math.ceil(total / limit);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    page,
    limit,
    total,
    totalPages,
    hasNext,
    hasPrev,
    nextPage: hasNext ? page + 1 : null,
    prevPage: hasPrev ? page - 1 : null,
  };
};

/**
 * Parse pagination from query params
 */
export const parsePagination = (query: any): PaginationParams => {
  const page = query.page ? parseInt(query.page as string, 10) : 1;
  const limit = query.limit
    ? Math.min(parseInt(query.limit as string, 10), 100)
    : 20;
  const sortBy = query.sortBy as string;
  const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';

  return { page, limit, sortBy, sortOrder };
};

/**
 * Generate random string
 */
export const generateRandomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

/**
 * Delay execution
 */
export const delay = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Sanitize string (remove extra spaces, trim)
 */
export const sanitizeString = (str: string): string => {
  return str.replace(/\s+/g, ' ').trim();
};

/**
 * Format date to ISO string
 */
export const formatDate = (date: Date): string => {
  return date.toISOString();
};

/**
 * Check if date is valid
 */
export const isValidDate = (date: any): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};