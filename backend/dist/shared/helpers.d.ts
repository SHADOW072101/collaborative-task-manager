/**
 * Hash password using bcrypt
 */
export declare const hashPassword: (password: string) => Promise<string>;
/**
 * Compare password with hash
 */
export declare const comparePassword: (password: string, hash: string) => Promise<boolean>;
/**
 * Generate JWT token
 */
export declare const generateToken: (payload: any) => string;
/**
 * Verify JWT token
 */
export declare const verifyToken: (token: string) => any;
/**
 * Generate random OTP/code
 */
export declare const generateOTP: (length?: number) => string;
/**
 * Format currency
 */
export declare const formatCurrency: (amount: number, currency?: string) => string;
/**
 * Truncate text
 */
export declare const truncateText: (text: string, maxLength: number) => string;
/**
 * Parse boolean from string
 */
export declare const parseBoolean: (value: any) => boolean;
/**
 * Deep clone object
 */
export declare const deepClone: <T>(obj: T) => T;
/**
 * Remove undefined/null values from object
 */
export declare const removeEmptyValues: <T extends Record<string, any>>(obj: T) => Partial<T>;
/**
 * Sleep for specified milliseconds
 */
export declare const sleep: (ms: number) => Promise<void>;
//# sourceMappingURL=helpers.d.ts.map