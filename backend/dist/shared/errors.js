"use strict";
// backend/src/shared/errors.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleError = exports.ConflictError = exports.NotFoundError = exports.AuthorizationError = exports.AuthenticationError = exports.ValidationError = exports.AppError = void 0;
// Custom error classes
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = true;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message = 'Validation failed') {
        super(message, 400);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends AppError {
    constructor(message = 'Authentication failed') {
        super(message, 401);
    }
}
exports.AuthenticationError = AuthenticationError;
class AuthorizationError extends AppError {
    constructor(message = 'Not authorized') {
        super(message, 403);
    }
}
exports.AuthorizationError = AuthorizationError;
class NotFoundError extends AppError {
    constructor(resource = 'Resource') {
        super(`${resource} not found`, 404);
    }
}
exports.NotFoundError = NotFoundError;
class ConflictError extends AppError {
    constructor(message = 'Resource already exists') {
        super(message, 409);
    }
}
exports.ConflictError = ConflictError;
// Error handler utility
const handleError = (error) => {
    if (error instanceof AppError) {
        return error;
    }
    // Handle Zod validation errors
    if (error.name === 'ZodError') {
        return new ValidationError('Validation failed');
    }
    // Handle JWT errors
    if (error.name === 'JsonWebTokenError') {
        return new AuthenticationError('Invalid token');
    }
    if (error.name === 'TokenExpiredError') {
        return new AuthenticationError('Token expired');
    }
    // Handle database errors
    if (error.code === 'P2002') {
        return new ConflictError('Unique constraint violation');
    }
    // Default to internal server error
    return new AppError('Internal server error', 500);
};
exports.handleError = handleError;
//# sourceMappingURL=errors.js.map