import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../auth/auth.middleware';
import { upload } from '../../core/middleware/upload';
import { authorizeUser } from './user.middleware'; 

const router = Router();

// ========== PUBLIC ROUTES (if any) ==========

// ========== PROTECTED ROUTES ==========
router.use(authenticate); // All routes below require auth

// ========== CURRENT USER ROUTES ==========
router.get('/me/profile', userController.getMyProfile);
router.put('/me/profile', userController.updateMyProfile);
router.patch('/me/preferences', userController.updateMyPreferences);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/me/change-password', userController.changePassword);
router.post('/me/two-factor', userController.toggleTwoFactor);
router.post('/me/send-verification-email', userController.sendVerificationEmail);
router.get('/me/activity', userController.getMyActivityLogs);
router.delete('/me/account', userController.deleteMyAccount);

// ========== USER SEARCH ROUTES (MUST come before /:id) ==========
router.get('/search', userController.searchUsers);
router.get('/', userController.getUsers); // For getting all users

// ========== SPECIFIC USER ROUTES (DYNAMIC - MUST come last) ==========
router.get('/:id', userController.getUserById);


export default router;