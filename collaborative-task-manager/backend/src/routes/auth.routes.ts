import express from 'express';
import { register, login, logout, getProfile } from '../modules/controllers/auth.controller';
import { authenticate } from '../modules/auth/auth.middleware';

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticate, logout); // Now requires authentication
router.get('/profile', authenticate, getProfile); // Now requires authentication

export default router;