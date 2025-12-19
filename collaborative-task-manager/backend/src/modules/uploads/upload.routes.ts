import { Router } from 'express';
import { uploadController } from './upload.controller';
import { 
  upload, 
  avatarUpload, 
  imageUpload, 
  documentUpload, 
  multipleUpload 
} from '../../core/middleware/upload';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

// Apply authentication to all upload routes (optional)
router.use(authenticate);

// Health check
router.get('/health', uploadController.healthCheck);

// Upload single file (generic)
router.post('/single', upload.single('file'), uploadController.uploadFile);

// Upload avatar
router.post('/avatar', avatarUpload.single('avatar'), uploadController.uploadFile);

// Upload image
router.post('/image', imageUpload.single('image'), uploadController.uploadFile);

// Upload document
router.post('/document', documentUpload.single('document'), uploadController.uploadFile);

// Upload multiple files
router.post('/multiple', multipleUpload.array('files', 10), uploadController.uploadMultipleFiles);

// File management
router.get('/files/:type/:filename', uploadController.getFileInfo);
router.delete('/files/:type/:filename', uploadController.deleteFile);
router.get('/files', uploadController.listFiles);

export default router;