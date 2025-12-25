// backend/src/index.ts
import * as dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Server starting...');
console.log('📋 Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET ❌');
console.log('  PORT:', process.env.PORT);

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import jwt from 'jsonwebtoken';

// Try to import env config, but have fallback
let env;
try {
  const envModule = require('./core/config/env');
  env = envModule.env;
} catch (error) {
  console.warn('⚠️ env config not found, using process.env');
  env = {
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
    PORT: process.env.PORT || 3000,
    NODE_ENV: process.env.NODE_ENV || 'development'
  };
}

const app = express();

// ✅ Debug logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(helmet());

app.use(cors({
  origin: ["https://collaborative-task-manager-81xh.vercel.app",
    "https://collaborative-task-manager-81xh-d3swt3m6a-ganesh-naiks-projects.vercel.app",
    "https://collaborative-task-manager-81xh-p5epxvgg9-ganesh-naiks-projects.vercel.app"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH & TEST ENDPOINTS ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API',
    version: '1.0.0',
    status: 'running',
    environment: env.NODE_ENV,
    endpoints: {
      health: '/api/health',
      test: '/api/test'
    }
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    database: process.env.DATABASE_URL ? 'configured' : 'not configured'
  });
});

app.get('/api/test', (req, res) => {
  res.json({
    success: true,
    message: 'API test endpoint is working',
    timestamp: new Date().toISOString(),
    node: process.version
  });
});

app.get('/api/debug-prisma', async (req, res) => {
  try {
    const prisma = require('../lib/prisma').default;
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected');
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    res.json({
      success: true,
      message: 'Prisma is working',
      userCount: userCount,
      database: process.env.DATABASE_URL ? 'configured' : 'not configured'
    });
    
  } catch (error) {
    console.error('❌ Prisma debug error:', error);
    res.status(500).json({
      success: false,
      message: 'Prisma debug failed',
    });
  }
});

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========== TRY TO LOAD ROUTES (WITH ERROR HANDLING) ==========
try {
  const authRoutes = require('./modules/auth/auth.routes');
  app.use('/api/auth', authRoutes);
  console.log('✅ Auth routes loaded');
} catch (error: any) {
  console.error('❌ Failed to load auth routes:', error.message);
  console.error('Stack:', error.stack);
  
  // Create minimal working auth routes
  const authRouter = express.Router();
  
  authRouter.post('/register', async (req, res) => {
    try {
      console.log('🔄 Using direct database registration');
      
      // Direct database access
      const { PrismaClient } = await import('@prisma/client');
      const bcrypt = await import('bcryptjs');
      const jwt = await import('jsonwebtoken');
      
      const prisma = new PrismaClient();
      
      // Check existing user
      const existingUser = await prisma.user.findUnique({
        where: { email: req.body.email },
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'User already exists'
        });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(req.body.password, 12);
      
      // Create user
      const user = await prisma.user.create({
        data: {
          name: req.body.name,
          email: req.body.email,
          password: hashedPassword,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });
      
      // Generate token
      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || 'secret',
        { expiresIn: '7d' }
      );
      
      await prisma.$disconnect();
      
      res.status(201).json({
        success: true,
        data: { user, token }
      });
      
    } catch (error: any) {
      console.error('Direct registration error:', error);
      res.status(500).json({
        success: false,
        error: error.message
      });
    }
  });
  
  authRouter.post('/login', async (req, res) => {
    try {
      console.log('🔐 LOGIN request:', req.body.email);
      
      // Validate request
      if (!req.body.email || !req.body.password) {
        return res.status(400).json({
          success: false,
          error: 'Email and password are required'
        });
      }
      
      // Dynamically import required modules
      const { PrismaClient } = await import('@prisma/client');
      const bcrypt = await import('bcryptjs');
      const jwt = await import('jsonwebtoken');
      
      const prisma = new PrismaClient();
      
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: req.body.email },
        select: {
          id: true,
          name: true,
          email: true,
          password: true,
          createdAt: true,
        },
      });
      
      if (!user) {
        await prisma.$disconnect();
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
      
      // Verify password
      const isValidPassword = await bcrypt.compare(req.body.password, user.password);
      
      if (!isValidPassword) {
        await prisma.$disconnect();
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password'
        });
      }
      
      // Remove password from user object
      const { password, ...userWithoutPassword } = user;
      
      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
      const token = jwt.sign(
        { userId: user.id },
        jwtSecret,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions 
      );
      
      await prisma.$disconnect();
      
      console.log('✅ User logged in:', user.email);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: userWithoutPassword,
          token
        }
      });
      
    } catch (error: any) {
      console.error('❌ Login error:', error);
      res.status(500).json({
        success: false,
        error: 'Login failed: ' + error.message
      });
    }
  });
}

try {
  const taskRoutes = require('./modules/tasks/task.routes');
  app.use('/api/tasks', taskRoutes);
  console.log('✅ Task routes loaded');
} catch (error) {
  console.warn('⚠️ Task routes not found, creating fallback');
  const taskRouter = express.Router();
  taskRouter.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'Task routes loaded (fallback)',
      tasks: []
    });
  });
  app.use('/api/tasks', taskRouter);
}

try {
  const userRoutes = require('./modules/users/user.routes');
  app.use('/api/users', userRoutes);
  console.log('✅ User routes loaded');
} catch (error) {
  console.warn('⚠️ User routes not found, creating fallback');
  const userRouter = express.Router();
  userRouter.get('/', (req, res) => {
    res.json({
      success: true,
      message: 'User routes loaded (fallback)',
      users: []
    });
  });
  app.use('/api/users', userRouter);
}

// ========== ERROR HANDLERS ==========
// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: ['/', '/api/health', '/api/test', '/api/auth/register', '/api/auth/login']
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    error: 'Internal server error',
    message: err.message,
    ...(env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== VERCEL REQUIREMENT ==========
// Vercel Serverless Functions need this export
export default app;

// ========== LOCAL DEVELOPMENT ONLY ==========
// Only start HTTP server if running locally
if (require.main === module) {
  const PORT = env.PORT;
  
  // Don't create HTTP server or Socket.io for Vercel
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  });
}