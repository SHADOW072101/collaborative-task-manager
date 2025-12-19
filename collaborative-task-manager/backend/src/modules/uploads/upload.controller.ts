import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileUploadUtils } from '../../core/middleware/upload';
import type {Multer} from 'multer';

export class UploadController {
  /**
   * Upload single file
   */
  async uploadFile(req: Request, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No file uploaded'
        });
      }

      const fileUrl = fileUploadUtils.generateFileUrl(
        req.file.filename,
        req.file.fieldname as any
      );

      res.status(200).json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          size: req.file.size,
          mimetype: req.file.mimetype,
          url: fileUrl,
          metadata: fileUploadUtils.getFileMetadata(req.file)
        }
      });
    } catch (error: any) {
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
  async uploadMultipleFiles(req: Request, res: Response) {
    try {
      if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
        return res.status(400).json({
          success: false,
          error: 'No files uploaded'
        });
      }

      const files = req.files as Express.Multer.File[];
      const uploads = files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        size: file.size,
        mimetype: file.mimetype,
        url: fileUploadUtils.generateFileUrl(file.filename, file.fieldname as any),
        metadata: fileUploadUtils.getFileMetadata(file)
      }));

      res.status(200).json({
        success: true,
        message: 'Files uploaded successfully',
        data: {
          files: uploads,
          count: files.length
        }
      });
    } catch (error: any) {
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
  async deleteFile(req: Request, res: Response) {
    try {
      const { filename, type = 'images' } = req.params;
      const filePath = `uploads/${type}/${filename}`;

      await fileUploadUtils.deleteFile(filePath);

      res.status(200).json({
        success: true,
        message: 'File deleted successfully'
      });
    } catch (error: any) {
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
  async getFileInfo(req: Request, res: Response) {
    try {
      const { filename, type = 'images' } = req.params;
      const filePath = path.join(process.cwd(), 'uploads', type, filename);

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found'
        });
      }

      const stats = fs.statSync(filePath);
      const fileUrl = fileUploadUtils.generateFileUrl(filename, type as any);

      res.status(200).json({
        success: true,
        data: {
          filename,
          url: fileUrl,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime,
          type: path.extname(filename).replace('.', ''),
          path: `/uploads/${type}/${filename}`
        }
      });
    } catch (error: any) {
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
  async listFiles(req: Request, res: Response) {
    try {
      const { type = 'images' } = req.query;
      const dirPath = path.join(process.cwd(), 'uploads', type as string);

      if (!fs.existsSync(dirPath)) {
        return res.status(200).json({
          success: true,
          data: {
            files: [],
            count: 0,
            directory: type
          }
        });
      }

      const files = fs.readdirSync(dirPath)
        .filter(file => !file.startsWith('.')) // Exclude hidden files
        .map(file => {
          const filePath = path.join(dirPath, file);
          const stats = fs.statSync(filePath);
          return {
            filename: file,
            url: fileUploadUtils.generateFileUrl(file, type as any),
            size: stats.size,
            createdAt: stats.birthtime,
            modifiedAt: stats.mtime,
            type: path.extname(file).replace('.', '') || 'unknown'
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
    } catch (error: any) {
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
  async healthCheck(req: Request, res: Response) {
    try {
      const directories = ['avatars', 'images', 'documents', 'temp'];
      const stats: any = {};

      directories.forEach(dir => {
        const dirPath = path.join(process.cwd(), 'uploads', dir);
        if (fs.existsSync(dirPath)) {
          const files = fs.readdirSync(dirPath).filter(f => !f.startsWith('.'));
          stats[dir] = {
            exists: true,
            fileCount: files.length,
            totalSize: files.reduce((total, file) => {
              const filePath = path.join(dirPath, file);
              const fileStats = fs.statSync(filePath);
              return total + fileStats.size;
            }, 0)
          };
        } else {
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
    } catch (error: any) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed'
      });
    }
  }
}

export const uploadController = new UploadController();