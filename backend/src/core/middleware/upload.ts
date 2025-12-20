import multer, { FileFilterCallback } from 'multer';
import { Request } from 'express';
import path from 'path';
import fs from 'fs';

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
    const dirPath = path.join(process.cwd(), dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });
};

createUploadDirectories();

// Configure storage
const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    let uploadPath = 'uploads/temp';
    
    // Determine destination based on field name or file type
    if (file.fieldname === 'avatar') {
      uploadPath = 'uploads/avatars';
    } else if (file.fieldname === 'image' || file.mimetype.startsWith('image/')) {
      uploadPath = 'uploads/images';
    } else if (file.fieldname === 'document' || file.mimetype.includes('pdf') || file.mimetype.includes('word') || file.mimetype.includes('excel')) {
      uploadPath = 'uploads/documents';
    }
    
    cb(null, uploadPath);
  },
  
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    // Generate unique filename
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileName = `${file.fieldname}-${uniqueSuffix}${fileExtension}`;
    cb(null, fileName);
  }
});

// File filter function
const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: FileFilterCallback
) => {
  // Check file type
  if (!ALLOWED_FILE_TYPES.includes(file.mimetype)) {
    const error = new Error(`File type not allowed. Allowed types: ${ALLOWED_FILE_TYPES.join(', ')}`);
    (error as any).status = 400;
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
    (error as any).status = 400;
    return cb(error);
  }

  cb(null, true);
};

// Create upload instances for different use cases
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.file, // Default limit
  }
});

// Specialized upload instances
export const avatarUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/avatars',
    filename: (req, file, cb) => {
      const userId = (req as any).user?.id || 'unknown';
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const fileName = `avatar-${userId}-${Date.now()}${fileExtension}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      const error = new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      (error as any).status = 400;
      return cb(error);
    }
    
    if (file.size > FILE_SIZE_LIMITS.avatar) {
      const error = new Error(`Avatar too large. Maximum size: ${FILE_SIZE_LIMITS.avatar / (1024 * 1024)}MB`);
      (error as any).status = 400;
      return cb(error);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: FILE_SIZE_LIMITS.avatar
  }
});

export const imageUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/images',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const fileExtension = path.extname(file.originalname).toLowerCase();
      const fileName = `image-${uniqueSuffix}${fileExtension}`;
      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      const error = new Error(`Invalid image type. Allowed: ${ALLOWED_IMAGE_TYPES.join(', ')}`);
      (error as any).status = 400;
      return cb(error);
    }
    
    if (file.size > FILE_SIZE_LIMITS.image) {
      const error = new Error(`Image too large. Maximum size: ${FILE_SIZE_LIMITS.image / (1024 * 1024)}MB`);
      (error as any).status = 400;
      return cb(error);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: FILE_SIZE_LIMITS.image
  }
});

export const documentUpload = multer({
  storage: multer.diskStorage({
    destination: 'uploads/documents',
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
      const fileExtension = path.extname(file.originalname).toLowerCase();
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
      (error as any).status = 400;
      return cb(error);
    }
    
    if (file.size > FILE_SIZE_LIMITS.file) {
      const error = new Error(`Document too large. Maximum size: ${FILE_SIZE_LIMITS.file / (1024 * 1024)}MB`);
      (error as any).status = 400;
      return cb(error);
    }
    
    cb(null, true);
  },
  limits: {
    fileSize: FILE_SIZE_LIMITS.file
  }
});

// Multiple file upload
export const multipleUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: FILE_SIZE_LIMITS.file,
    files: 10 // Maximum 10 files
  }
});

// Helper function to handle different file array formats
export const getFilesArray = (files: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] } | undefined): Express.Multer.File[] => {
  if (!files) return [];
  
  if (Array.isArray(files)) {
    return files;
  }
  
  // Convert object format to array
  return Object.values(files).flat();
};

// Utility functions
export const fileUploadUtils = {
  /**
   * Generate file URL for frontend access
   */
  generateFileUrl: (filename: string, type: 'avatar' | 'image' | 'document' = 'image'): string => {
    const baseUrl = process.env.API_URL || 'http://localhost:3000';
    const uploadPath = type === 'avatar' ? 'avatars' : type === 'document' ? 'documents' : 'images';
    return `${baseUrl}/uploads/${uploadPath}/${filename}`;
  },

  /**
   * Delete file from uploads directory
   */
  deleteFile: (filePath: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const fullPath = path.join(process.cwd(), filePath);
      
      fs.unlink(fullPath, (error) => {
        if (error) {
          // If file doesn't exist, it's okay
          if (error.code === 'ENOENT') {
            resolve();
          } else {
            reject(error);
          }
        } else {
          resolve();
        }
      });
    });
  },

  /**
   * Clean up temporary files older than 24 hours
   */
  cleanupTempFiles: (): void => {
    const tempDir = path.join(process.cwd(), 'uploads/temp');
    
    if (!fs.existsSync(tempDir)) return;
    
    const files = fs.readdirSync(tempDir);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    
    files.forEach(file => {
      const filePath = path.join(tempDir, file);
      const stats = fs.statSync(filePath);
      
      if (now - stats.mtime.getTime() > oneDay) {
        fs.unlinkSync(filePath);
      }
    });
  },

  /**
   * Validate file before saving
   */
  validateFile: (file: Express.Multer.File): { isValid: boolean; error?: string } => {
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
  getFileMetadata: (file: Express.Multer.File) => {
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
  getRequestFiles: (req: Request): Express.Multer.File[] => {
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
  setInterval(fileUploadUtils.cleanupTempFiles, 24 * 60 * 60 * 1000);
}

// Remove the problematic type declaration
// The types are already provided by @types/multer
export default upload;