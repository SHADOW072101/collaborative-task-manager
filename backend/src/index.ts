import express from 'express';
import cors from 'cors';
import path from 'path';
import * as dotenv from 'dotenv';
import apiRouter from './api';

// Load environment variables
dotenv.config();

const app = express();

// ========== MIDDLEWARE ==========

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

//Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// Health check routes 
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'API is healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Documentation/root
app.get('/', (req, res) => {
  res.json({ 
    message: 'Task Manager API',
    version: '1.0.0',
    endpoints: {
      health: ['/health', '/api/health'],
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login',
      docs: 'https://github.com/your-username/your-repo'
    },
    environment: process.env.NODE_ENV || 'development'
  });
});

// Mount API router
app.use('/api', apiRouter);

// ========== ERROR HANDLERS ==========
// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ['/', '/health', '/api/health', 'POST /api/auth/register', 'POST /api/auth/login']
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// Vercel requires this export
export default app;