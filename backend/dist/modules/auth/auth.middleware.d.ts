import { Request, Response, NextFunction } from 'express';
export interface TokenPayload {
    userId: string;
    email: string;
    iat?: number;
    exp?: number;
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.middleware.d.ts.map