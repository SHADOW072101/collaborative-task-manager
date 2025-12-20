import { Request, Response } from 'express';
export declare const userController: {
    getUsers(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getUserById: (req: Request, res: Response, next: import("express").NextFunction) => void;
    getMyProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    updateMyProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    searchUsers: (req: Request, res: Response, next: import("express").NextFunction) => void;
    updateMyPreferences(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    uploadAvatar(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    changePassword(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    toggleTwoFactor(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    sendVerificationEmail(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    getMyActivityLogs(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    deleteMyAccount(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
};
//# sourceMappingURL=user.controller.d.ts.map