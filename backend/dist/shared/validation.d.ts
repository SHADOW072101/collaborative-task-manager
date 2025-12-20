import { z } from 'zod';
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    limit: z.ZodOptional<z.ZodDefault<z.ZodNumber>>;
    sortBy: z.ZodOptional<z.ZodString>;
    sortOrder: z.ZodOptional<z.ZodDefault<z.ZodEnum<["asc", "desc"]>>>;
}, "strip", z.ZodTypeAny, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}, {
    page?: number | undefined;
    limit?: number | undefined;
    sortBy?: string | undefined;
    sortOrder?: "asc" | "desc" | undefined;
}>;
export declare const searchSchema: z.ZodObject<{
    search: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    search?: string | undefined;
}, {
    search?: string | undefined;
}>;
export declare const idSchema: z.ZodObject<{
    id: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const emailSchema: z.ZodString;
export declare const passwordSchema: z.ZodString;
export declare const nameSchema: z.ZodString;
export declare const dateSchema: z.ZodEffects<z.ZodString, string, string>;
export declare const optionalStringSchema: (maxLength?: number) => z.ZodOptional<z.ZodString>;
export declare const urlSchema: z.ZodString;
export declare const phoneSchema: z.ZodString;
export declare const validate: <T>(schema: z.Schema<T>, data: any) => T;
export declare const safeValidate: <T>(schema: z.Schema<T>, data: any) => {
    success: boolean;
    data: T;
    error?: undefined;
    details?: undefined;
} | {
    success: boolean;
    error: string;
    details: z.ZodIssue[];
    data?: undefined;
};
//# sourceMappingURL=validation.d.ts.map