"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("./upload.controller");
const upload_1 = require("../../core/middleware/upload");
const auth_middleware_1 = require("../auth/auth.middleware");
const router = (0, express_1.Router)();
// Apply authentication to all upload routes (optional)
router.use(auth_middleware_1.authenticate);
// Health check
router.get('/health', upload_controller_1.uploadController.healthCheck);
// Upload single file (generic)
router.post('/single', upload_1.upload.single('file'), upload_controller_1.uploadController.uploadFile);
// Upload avatar
router.post('/avatar', upload_1.avatarUpload.single('avatar'), upload_controller_1.uploadController.uploadFile);
// Upload image
router.post('/image', upload_1.imageUpload.single('image'), upload_controller_1.uploadController.uploadFile);
// Upload document
router.post('/document', upload_1.documentUpload.single('document'), upload_controller_1.uploadController.uploadFile);
// Upload multiple files
router.post('/multiple', upload_1.multipleUpload.array('files', 10), upload_controller_1.uploadController.uploadMultipleFiles);
// File management
router.get('/files/:type/:filename', upload_controller_1.uploadController.getFileInfo);
router.delete('/files/:type/:filename', upload_controller_1.uploadController.deleteFile);
router.get('/files', upload_controller_1.uploadController.listFiles);
exports.default = router;
//# sourceMappingURL=upload.routes.js.map