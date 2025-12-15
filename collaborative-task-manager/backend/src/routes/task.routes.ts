// src/routes/auth.routes.ts
import express from 'express';
import { login, register } from '../modules/controllers/auth.controller'; // You'll need to create this too

const router = express.Router();

// Authentication routes
router.post('/register', register);
router.post('/login', login);
router.post('/logout', (req, res) => {
  // Logout logic
  res.json({ message: 'Logged out successfully' });
});

// Protected routes example
router.get('/profile', (req, res) => {
  // Add authentication middleware here
  res.json({ message: 'User profile' });
});

export default router;