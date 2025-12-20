"use strict";
// backend/src/shared/middleware.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateRequest = exports.rateLimiter = exports.asyncHandler = exports.errorHandler = exports.requestLogger = void 0;
const errors_1 = require("./errors");
const logger_1 = require("./logger");
// Request logging middleware
const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        const message = `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`;
        if (res.statusCode >= 400) {
            logger_1.log.warn(message, {
                body: req.body,
                query: req.query,
                params: req.params,
                ip: req.ip,
                userAgent: req.get('user-agent'),
            });
        }
        else {
            logger_1.log.info(message);
        }
    });
    next();
};
exports.requestLogger = requestLogger;
// Error handling middleware
const errorHandler = (error, req, res, next) => {
    const appError = (0, errors_1.handleError)(error);
    logger_1.log.error(appError.message, error);
    res.status(appError.statusCode).json({
        success: false,
        error: appError.message,
        ...(process.env.NODE_ENV === 'development' && {
            stack: appError.stack,
            originalError: error.message,
        }),
    });
};
exports.errorHandler = errorHandler;
// Async handler wrapper (no try-catch needed in controllers)
const asyncHandler = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};
exports.asyncHandler = asyncHandler;
// Rate limiting middleware (simple version)
const rateLimiter = (requestsPerMinute = 60) => {
    const requests = new Map();
    return (req, res, next) => {
        const ip = req.ip;
        const now = Date.now();
        const windowStart = now - 60000; // 1 minute
        // Clean old requests
        requests.forEach((timestamps, key) => {
            const validTimestamps = timestamps.filter((t) => t > windowStart);
            if (validTimestamps.length === 0) {
                requests.delete(key);
            }
            else {
                requests.set(key, validTimestamps);
            }
        });
        // Check current IP
        const ipRequests = requests.get(ip) || [];
        if (ipRequests.length >= requestsPerMinute) {
            return res.status(429).json({
                success: false,
                error: 'Too many requests',
            });
        }
        ipRequests.push(now);
        requests.set(ip, ipRequests);
        next();
    };
};
exports.rateLimiter = rateLimiter;
// Validate request body middleware
const validateRequest = (schema) => {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error.name === 'ZodError') {
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: error.errors,
                });
            }
            next(error);
        }
    };
};
exports.validateRequest = validateRequest;
//# sourceMappingURL=middleware.js.map