import multer from 'multer';
import { Request } from 'express';
export declare const upload: multer.Multer;
export declare const avatarUpload: multer.Multer;
export declare const imageUpload: multer.Multer;
export declare const documentUpload: multer.Multer;
export declare const multipleUpload: multer.Multer;
export declare const getFilesArray: (files: Express.Multer.File[] | {
    [fieldname: string]: Express.Multer.File[];
} | undefined) => Express.Multer.File[];
export declare const fileUploadUtils: {
    /**
     * Generate file URL for frontend access
     */
    generateFileUrl: (filename: string, type?: "avatar" | "image" | "document") => string;
    /**
     * Delete file from uploads directory
     */
    deleteFile: (filePath: string) => Promise<void>;
    /**
     * Clean up temporary files older than 24 hours
     */
    cleanupTempFiles: () => void;
    /**
     * Validate file before saving
     */
    validateFile: (file: Express.Multer.File) => {
        isValid: boolean;
        error?: string;
    };
    /**
     * Get file metadata
     */
    getFileMetadata: (file: Express.Multer.File) => {
        originalName: string;
        filename: string;
        size: number;
        mimetype: string;
        encoding: string;
        fieldname: string;
        destination: string;
        path: string;
    };
    /**
     * Handle files from request (supports both array and object formats)
     */
    getRequestFiles: (req: Request) => Express.Multer.File[];
};
export default upload;
//# sourceMappingURL=upload.d.ts.map