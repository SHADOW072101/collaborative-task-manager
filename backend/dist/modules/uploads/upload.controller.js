"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.UploadController = void 0;
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const upload_1 = require("../../core/middleware/upload");
class UploadController {
    /**
     * Upload single file
     */
    async uploadFile(req, res) {
        try {
            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    error: 'No file uploaded'
                });
            }
            const fileUrl = upload_1.fileUploadUtils.generateFileUrl(req.file.filename, req.file.fieldname);
            res.status(200).json({
                success: true,
                message: 'File uploaded successfully',
                data: {
                    filename: req.file.filename,
                    originalName: req.file.originalname,
                    size: req.file.size,
                    mimetype: req.file.mimetype,
                    url: fileUrl,
                    metadata: upload_1.fileUploadUtils.getFileMetadata(req.file)
                }
            });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload file'
            });
        }
    }
    /**
     * Upload multiple files
     */
    async uploadMultipleFiles(req, res) {
        try {
            if (!req.files || req.files.length === 0) {
                return res.status(400).json({
                    success: false,
                    error: 'No files uploaded'
                });
            }
            const files = req.files;
            const uploads = files.map(file => ({
                filename: file.filename,
                originalName: file.originalname,
                size: file.size,
                mimetype: file.mimetype,
                url: upload_1.fileUploadUtils.generateFileUrl(file.filename, file.fieldname),
                metadata: upload_1.fileUploadUtils.getFileMetadata(file)
            }));
            res.status(200).json({
                success: true,
                message: 'Files uploaded successfully',
                data: {
                    files: uploads,
                    count: files.length
                }
            });
        }
        catch (error) {
            console.error('Multiple upload error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to upload files'
            });
        }
    }
    /**
     * Delete uploaded file
     */
    async deleteFile(req, res) {
        try {
            const { filename, type = 'images' } = req.params;
            const filePath = `uploads/${type}/${filename}`;
            await upload_1.fileUploadUtils.deleteFile(filePath);
            res.status(200).json({
                success: true,
                message: 'File deleted successfully'
            });
        }
        catch (error) {
            console.error('Delete file error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete file'
            });
        }
    }
    /**
     * Get file info
     */
    async getFileInfo(req, res) {
        try {
            const { filename, type = 'images' } = req.params;
            const filePath = path_1.default.join(process.cwd(), 'uploads', type, filename);
            if (!fs_1.default.existsSync(filePath)) {
                return res.status(404).json({
                    success: false,
                    error: 'File not found'
                });
            }
            const stats = fs_1.default.statSync(filePath);
            const fileUrl = upload_1.fileUploadUtils.generateFileUrl(filename, type);
            res.status(200).json({
                success: true,
                data: {
                    filename,
                    url: fileUrl,
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                    type: path_1.default.extname(filename).replace('.', ''),
                    path: `/uploads/${type}/${filename}`
                }
            });
        }
        catch (error) {
            console.error('Get file info error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to get file info'
            });
        }
    }
    /**
     * List files in directory
     */
    async listFiles(req, res) {
        try {
            const { type = 'images' } = req.query;
            const dirPath = path_1.default.join(process.cwd(), 'uploads', type);
            if (!fs_1.default.existsSync(dirPath)) {
                return res.status(200).json({
                    success: true,
                    data: {
                        files: [],
                        count: 0,
                        directory: type
                    }
                });
            }
            const files = fs_1.default.readdirSync(dirPath)
                .filter(file => !file.startsWith('.')) // Exclude hidden files
                .map(file => {
                const filePath = path_1.default.join(dirPath, file);
                const stats = fs_1.default.statSync(filePath);
                return {
                    filename: file,
                    url: upload_1.fileUploadUtils.generateFileUrl(file, type),
                    size: stats.size,
                    createdAt: stats.birthtime,
                    modifiedAt: stats.mtime,
                    type: path_1.default.extname(file).replace('.', '') || 'unknown'
                };
            });
            res.status(200).json({
                success: true,
                data: {
                    files,
                    count: files.length,
                    directory: type
                }
            });
        }
        catch (error) {
            console.error('List files error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to list files'
            });
        }
    }
    /**
     * Health check for uploads directory
     */
    async healthCheck(req, res) {
        try {
            const directories = ['avatars', 'images', 'documents', 'temp'];
            const stats = {};
            directories.forEach(dir => {
                const dirPath = path_1.default.join(process.cwd(), 'uploads', dir);
                if (fs_1.default.existsSync(dirPath)) {
                    const files = fs_1.default.readdirSync(dirPath).filter(f => !f.startsWith('.'));
                    stats[dir] = {
                        exists: true,
                        fileCount: files.length,
                        totalSize: files.reduce((total, file) => {
                            const filePath = path_1.default.join(dirPath, file);
                            const fileStats = fs_1.default.statSync(filePath);
                            return total + fileStats.size;
                        }, 0)
                    };
                }
                else {
                    stats[dir] = { exists: false };
                }
            });
            res.status(200).json({
                success: true,
                message: 'Uploads health check',
                data: {
                    directories: stats,
                    timestamp: new Date().toISOString()
                }
            });
        }
        catch (error) {
            console.error('Health check error:', error);
            res.status(500).json({
                success: false,
                error: 'Health check failed'
            });
        }
    }
}
exports.UploadController = UploadController;
exports.uploadController = new UploadController();
//# sourceMappingURL=upload.controller.js.map