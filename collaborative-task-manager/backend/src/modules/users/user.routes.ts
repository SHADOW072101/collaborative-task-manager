import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../auth/auth.middleware';
import { upload } from '../../core/middleware/upload';
import { authorizeUser } from './user.middleware'; 

const router = Router();

// Public routes (no auth required for some actions)
router.get('/', authenticate, userController.getUsers); // Get users list/search

// All routes below require authentication
router.use(authenticate);

// Current user routes (uses :userId = 'me')
router.get('/me/profile', userController.getMyProfile);
router.put('/me/profile', userController.updateMyProfile);
router.patch('/me/preferences', userController.updateMyPreferences);
router.post('/me/avatar', upload.single('avatar'), userController.uploadAvatar);
router.post('/me/change-password', userController.changePassword);
router.post('/me/two-factor', userController.toggleTwoFactor);
router.post('/me/send-verification-email', userController.sendVerificationEmail);
router.get('/me/activity', userController.getMyActivityLogs);
router.delete('/me/account', userController.deleteMyAccount);

// Admin routes (require specific user ID)
router.get('/:userId/profile', authorizeUser, userController.getMyProfile);
router.put('/:userId/profile', authorizeUser, userController.updateMyProfile);
// router.get('/:userId/activity', authorizeUser, userController.getUserActivityLogs);

export default router;