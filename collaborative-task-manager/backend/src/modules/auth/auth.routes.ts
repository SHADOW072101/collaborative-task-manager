import { Router } from 'express';
import { login, logout, getProfile,register } from '../controllers/auth.controller';
import { authenticate } from './auth.middleware';

const router = Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes
router.get('/me', authenticate, login);
router.put('/profile', authenticate, getProfile);
router.post('/logout', authenticate, logout);

export default router;