"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const zod_1 = require("zod");
const errorHandler = (error, req, res, next) => {
    console.error('Error:', error);
    // Handle Zod validation errors
    if (error instanceof zod_1.ZodError) {
        res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: error.errors,
        });
        return;
    }
    // Handle known error types
    if (error.message.includes('not found')) {
        res.status(404).json({
            success: false,
            error: error.message,
        });
        return;
    }
    if (error.message.includes('Invalid credentials') || error.message.includes('Invalid token')) {
        res.status(401).json({
            success: false,
            error: error.message,
        });
        return;
    }
    // Default error
    res.status(500).json({
        success: false,
        error: 'Internal server error',
    });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=errorHandler.js.map