// backend/src/shared/validation.ts

import { z } from 'zod';

// Common validation schemas
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20).optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('asc').optional(),
});

export const searchSchema = z.object({
  search: z.string().optional(),
});

export const idSchema = z.object({
  id: z.string().min(1, 'ID is required'),
});

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Password validation
export const passwordSchema = z
  .string()
  .min(6, 'Password must be at least 6 characters')
  .max(50, 'Password must be less than 50 characters');

// Name validation
export const nameSchema = z
  .string()
  .min(2, 'Name must be at least 2 characters')
  .max(50, 'Name must be less than 50 characters');

// Date validation
export const dateSchema = z.string().refine(
  (val) => {
    const date = new Date(val);
    return !isNaN(date.getTime());
  },
  { message: 'Invalid date format' }
);

// Optional string with max length
export const optionalStringSchema = (maxLength: number = 255) =>
  z.string().max(maxLength).optional();

// URL validation
export const urlSchema = z.string().url('Invalid URL');

// Phone validation (basic)
export const phoneSchema = z.string().regex(/^\+?[\d\s-]+$/, 'Invalid phone number');

// Validation helper functions
export const validate = <T>(schema: z.Schema<T>, data: any): T => {
  return schema.parse(data);
};

export const safeValidate = <T>(schema: z.Schema<T>, data: any) => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { 
        success: false, 
        error: 'Validation failed', 
        details: error.errors 
      };
    }
    throw error;
  }
};