import { Request, Response, NextFunction } from 'express';
export declare const authorizeUser: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to check if user has specific role
 */
export declare const requireRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check if user is active
 */
export declare const requireActiveUser: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
/**
 * Middleware to check ownership of a resource
 * Useful for checking if user owns the resource they're trying to modify
 */
export declare const checkResourceOwnership: (resourceType: "task" | "project" | "comment" | "team", resourceIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
/**
 * Middleware to check if user can modify a specific field
 * Useful for preventing users from modifying certain fields (like role)
 */
export declare const restrictFieldModification: (restrictedFields: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Middleware to check if user can view sensitive information
 */
export declare const canViewSensitiveInfo: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
/**
 * Combined middleware for common authorization scenarios
 */
export declare const authMiddleware: {
    authorizeUser: (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    requireRole: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    requireActiveUser: (req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
    checkResourceOwnership: (resourceType: "task" | "project" | "comment" | "team", resourceIdParam?: string) => (req: Request, res: Response, next: NextFunction) => Promise<void | Response<any, Record<string, any>>>;
    restrictFieldModification: (restrictedFields: string[]) => (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
    canViewSensitiveInfo: (req: Request, res: Response, next: NextFunction) => void | Response<any, Record<string, any>>;
};
export default authMiddleware;
//# sourceMappingURL=user.middleware.d.ts.map