import { Request, Response } from 'express';
export declare class UploadController {
    /**
     * Upload single file
     */
    uploadFile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Upload multiple files
     */
    uploadMultipleFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Delete uploaded file
     */
    deleteFile(req: Request, res: Response): Promise<void>;
    /**
     * Get file info
     */
    getFileInfo(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * List files in directory
     */
    listFiles(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
    /**
     * Health check for uploads directory
     */
    healthCheck(req: Request, res: Response): Promise<void>;
}
export declare const uploadController: UploadController;
//# sourceMappingURL=upload.controller.d.ts.map