"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileUploadUtils = exports.getFilesArray = exports.multipleUpload = exports.documentUpload = exports.imageUpload = exports.avatarUpload = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define allowed file types
const ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml'
];
const ALLOWED_FILE_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];
// Define file size limits (in bytes)
const FILE_SIZE_LIMITS = {
    image: 5 * 1024 * 1024, // 5MB for images
    file: 10 * 1024 * 1024, // 10MB for other files
    avatar: 2 * 1024 * 1024, // 2MB for avatars
};
// Ensure upload directories exist
const createUploadDirectories = () => {
    const directories = [
        'uploads',
        'uploads/avatars',
        'uploads/images',
        'uploads/documents',
        'uploads/temp'
    ];
    directories.forEach(dir => {
        const dirPath = path_1.default.join(process.cwd(), dir);
        if (!fs_1.default.existsSync(dirPath)) {
            fs_1.default.mkdirSync(dirPath, { recursive: true });
        }
    });
};
createUploadDirectories();
// Configure storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        let uploadPath = 'uploads/temp';
        // Determine destination based on field name or file type
        if (file.fieldname === 'avatar') {
            uploadPath = 'uploads/avatars';
        }
        else if (file.fieldname === 'image' || file.mimetype.startsWith('image/')) {
            uploadPath = 'uploads/images';
        }
        else if (file.fieldname === 'document' || file.mimetype.includes('pdf') || file.mimetype.includes('word') || file.mimetype.includes('excel')) {
            uploadPath = 'uploads/documents';
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
        const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
        cb(null, fileName);
    }
});
// File filter function
const fileFilter = (req, file, cb) => {
    // Check file type
    if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
        const error = new Error(`File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
        error.status = 400;
        return cb(error);
    }
    // Check file size based on type
    let maxSize = FILE_SIZE_LIMITS.file;
    if (file.mimetype.startsWith('image/')) {
        maxSize = FILE_SIZE_LIMITS.image;
        if (file.fieldname === 'avatar') {
            maxSize = FILE_SIZE_LIMITS.avatar;
        }
    }
    if (file.size > maxSize) {
        const error = new Error(`File too large. Maximum size: ${maxSize / (1024 * 1024)}MB`);
        error.status = 400;
        return cb(error);
    }
    cb(null, true);
};
// Create upload instances for different use cases
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.file, // Default limit
    }
});
// Specialized upload instances
exports.avatarUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: 'uploads/avatars',
        filename: (req, file, cb) => {
            const userId = req.user?.id || 'unknown';
            const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `avatar-${userId}-${Date.now()}${fileExtension}`;
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            const error = new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
            error.status = 400;
            return cb(error);
        }
        if (file.size > FILE_SIZE_LIMITS.avatar) {
            const error = new Error(`Avatar too large. Maximum size: ${FILE_SIZE_LIMITS.avatar / (1024 * 1024)}MB`);
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    },
    limits: {
        fileSize: FILE_SIZE_LIMITS.avatar
    }
});
exports.imageUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: 'uploads/images',
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `image-${uniqueSuffix}${fileExtension}`;
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
            const error = new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
            error.status = 400;
            return cb(error);
        }
        if (file.size > FILE_SIZE_LIMITS.image) {
            const error = new Error(`Image too large. Maximum size: ${FILE_SIZE_LIMITS.image / (1024 * 1024)}MB`);
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    },
    limits: {
        fileSize: FILE_SIZE_LIMITS.image
    }
});
exports.documentUpload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: 'uploads/documents',
        filename: (req, file, cb) => {
            const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
            const fileExtension = path_1.default.extname(file.originalname).toLowerCase();
            const fileName = `doc-${uniqueSuffix}${fileExtension}`;
            cb(null, fileName);
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedDocs = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];
        if (!allowedDocs.includes(file.mimetype)) {
            const error = new Error(`Invalid document type. Allowed: PDF, Word, Excel, Text files`);
            error.status = 400;
            return cb(error);
        }
        if (file.size > FILE_SIZE_LIMITS.file) {
            const error = new Error(`Document too large. Maximum size: ${FILE_SIZE_LIMITS.file / (1024 * 1024)}MB`);
            error.status = 400;
            return cb(error);
        }
        cb(null, true);
    },
    limits: {
        fileSize: FILE_SIZE_LIMITS.file
    }
});
// Multiple file upload
exports.multipleUpload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: FILE_SIZE_LIMITS.file,
        files: 10 // Maximum 10 files
    }
});
// Helper function to handle different file array formats
const getFilesArray = (files) => {
    if (!files)
        return [];
    if (Array.isArray(files)) {
        return files;
    }
    // Convert object format to array
    return Object.values(files).flat();
};
exports.getFilesArray = getFilesArray;
// Utility functions
exports.fileUploadUtils = {
    /**
     * Generate file URL for frontend access
     */
    generateFileUrl: (filename, type = 'image') => {
        const baseUrl = process.env.API_URL || 'http://localhost:3000';
        const uploadPath = type === 'avatar' ? 'avatars' : type === 'document' ? 'documents' : 'images';
        return `${baseUrl}/uploads/${uploadPath}/${filename}`;
    },
    /**
     * Delete file from uploads directory
     */
    deleteFile: (filePath) => {
        return new Promise((resolve, reject) => {
            const fullPath = path_1.default.join(process.cwd(), filePath);
            fs_1.default.unlink(fullPath, (error) => {
                if (error) {
                    // If file doesn't exist, it's okay
                    if (error.code === 'ENOENT') {
                        resolve();
                    }
                    else {
                        reject(error);
                    }
                }
                else {
                    resolve();
                }
            });
        });
    },
    /**
     * Clean up temporary files older than 24 hours
     */
    cleanupTempFiles: () => {
        const tempDir = path_1.default.join(process.cwd(), 'uploads/temp');
        if (!fs_1.default.existsSync(tempDir))
            return;
        const files = fs_1.default.readdirSync(tempDir);
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        files.forEach(file => {
            const filePath = path_1.default.join(tempDir, file);
            const stats = fs_1.default.statSync(filePath);
            if (now - stats.mtime.getTime() > oneDay) {
                fs_1.default.unlinkSync(filePath);
            }
        });
    },
    /**
     * Validate file before saving
     */
    validateFile: (file) => {
        // Check file type
        if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
            return {
                isValid: false,
                error: `Invalid file type: ${file.mimetype}`
            };
        }
        // Check file size
        let maxSize = FILE_SIZE_LIMITS.file;
        if (file.mimetype.startsWith('image/')) {
            maxSize = FILE_SIZE_LIMITS.image;
        }
        if (file.size > maxSize) {
            return {
                isValid: false,
                error: `File too large: ${(file.size / (1024 * 1024)).toFixed(2)}MB (max: ${maxSize / (1024 * 1024)}MB)`
            };
        }
        return { isValid: true };
    },
    /**
     * Get file metadata
     */
    getFileMetadata: (file) => {
        return {
            originalName: file.originalname,
            filename: file.filename,
            size: file.size,
            mimetype: file.mimetype,
            encoding: file.encoding,
            fieldname: file.fieldname,
            destination: file.destination,
            path: file.path,
        };
    },
    /**
     * Handle files from request (supports both array and object formats)
     */
    getRequestFiles: (req) => {
        const files = req.files;
        if (!files) {
            return [];
        }
        if (Array.isArray(files)) {
            return files;
        }
        // Convert object { fieldname: File[] } to flat array
        return Object.values(files).flat();
    }
};
// Schedule temp file cleanup (run once per day)
if (process.env.NODE_ENV === 'production') {
    setInterval(exports.fileUploadUtils.cleanupTempFiles, 24 * 60 * 60 * 1000);
}
// Remove the problematic type declaration
// The types are already provided by @types/multer
exports.default = exports.upload;
//# sourceMappingURL=upload.js.map