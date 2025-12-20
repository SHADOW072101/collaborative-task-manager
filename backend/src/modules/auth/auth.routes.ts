import express from 'express';
import { authenticate } from '../auth/auth.middleware';
import { authController } from '../controllers/auth.controller';


const router = express.Router();

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getCurrentUser);
router.put('/profile', authenticate, authController.updateProfile);
router.post('/logout', authenticate, authController.logout);
router.post('/refresh-token', authController.refreshToken); // Optional


export default router;