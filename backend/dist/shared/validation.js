"use strict";
// backend/src/shared/validation.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.safeValidate = exports.validate = exports.phoneSchema = exports.urlSchema = exports.optionalStringSchema = exports.dateSchema = exports.nameSchema = exports.passwordSchema = exports.emailSchema = exports.idSchema = exports.searchSchema = exports.paginationSchema = void 0;
const zod_1 = require("zod");
// Common validation schemas
exports.paginationSchema = zod_1.z.object({
    page: zod_1.z.coerce.number().int().positive().default(1).optional(),
    limit: zod_1.z.coerce.number().int().positive().max(100).default(20).optional(),
    sortBy: zod_1.z.string().optional(),
    sortOrder: zod_1.z.enum(['asc', 'desc']).default('asc').optional(),
});
exports.searchSchema = zod_1.z.object({
    search: zod_1.z.string().optional(),
});
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string().min(1, 'ID is required'),
});
// Email validation
exports.emailSchema = zod_1.z.string().email('Invalid email format');
// Password validation
exports.passwordSchema = zod_1.z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters');
// Name validation
exports.nameSchema = zod_1.z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters');
// Date validation
exports.dateSchema = zod_1.z.string().refine((val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
}, { message: 'Invalid date format' });
// Optional string with max length
const optionalStringSchema = (maxLength = 255) => zod_1.z.string().max(maxLength).optional();
exports.optionalStringSchema = optionalStringSchema;
// URL validation
exports.urlSchema = zod_1.z.string().url('Invalid URL');
// Phone validation (basic)
exports.phoneSchema = zod_1.z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number');
// Validation helper functions
const validate = (schema, data) => {
    return schema.parse(data);
};
exports.validate = validate;
const safeValidate = (schema, data) => {
    try {
        return { success: true, data: schema.parse(data) };
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return {
                success: false,
                error: 'Validation failed',
                details: error.errors
            };
        }
        throw error;
    }
};
exports.safeValidate = safeValidate;
//# sourceMappingURL=validation.js.map