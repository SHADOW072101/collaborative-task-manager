"use strict";
// backend/src/shared/utils.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDate = exports.formatDate = exports.sanitizeString = exports.isValidEmail = exports.delay = exports.generateRandomString = exports.parsePagination = exports.calculatePagination = exports.formatError = exports.formatResponse = void 0;
/**
 * Format API response
 */
const formatResponse = (data, message, meta) => {
    return {
        success: true,
        message,
        data,
        ...(meta && { meta }),
    };
};
exports.formatResponse = formatResponse;
/**
 * Format error response
 */
const formatError = (error, details) => {
    return {
        success: false,
        error,
        ...(details && { details }),
    };
};
exports.formatError = formatError;
/**
 * Calculate pagination metadata
 */
const calculatePagination = (total, page = 1, limit = 20) => {
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
exports.calculatePagination = calculatePagination;
/**
 * Parse pagination from query params
 */
const parsePagination = (query) => {
    const page = query.page ? parseInt(query.page, 10) : 1;
    const limit = query.limit
        ? Math.min(parseInt(query.limit, 10), 100)
        : 20;
    const sortBy = query.sortBy;
    const sortOrder = query.sortOrder === 'desc' ? 'desc' : 'asc';
    return { page, limit, sortBy, sortOrder };
};
exports.parsePagination = parsePagination;
/**
 * Generate random string
 */
const generateRandomString = (length = 8) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
};
exports.generateRandomString = generateRandomString;
/**
 * Delay execution
 */
const delay = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
};
exports.delay = delay;
/**
 * Validate email format
 */
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
exports.isValidEmail = isValidEmail;
/**
 * Sanitize string (remove extra spaces, trim)
 */
const sanitizeString = (str) => {
    return str.replace(/\s+/g, ' ').trim();
};
exports.sanitizeString = sanitizeString;
/**
 * Format date to ISO string
 */
const formatDate = (date) => {
    return date.toISOString();
};
exports.formatDate = formatDate;
/**
 * Check if date is valid
 */
const isValidDate = (date) => {
    return date instanceof Date && !isNaN(date.getTime());
};
exports.isValidDate = isValidDate;
//# sourceMappingURL=utils.js.map