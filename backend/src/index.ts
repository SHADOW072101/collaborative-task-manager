// backend/src/index.ts
import * as dotenv from 'dotenv';
dotenv.config();

console.log('🚀 Server starting...');
console.log('📋 Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET ❌');
console.log('  PORT:', process.env.PORT);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import jwt  from 'jsonwebtoken';

const app = express();

// ✅ Debug logging middleware
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(helmet());

// CORS configuration
const allowedOrigins = [
  'https://collaborative-task-manager-81xh.vercel.app',
  'https://collaborative-task-manager-81xh-d3swt3m6a-ganesh-naiks-projects.vercel.app',
  'https://collaborative-task-manager-81xh-p5epxvgg9-ganesh-naiks-projects.vercel.app',
  'http://localhost:5173',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.warn(`⚠️ Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization']
}));

app.options('*', cors()); // Enable preflight for all routes

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========== HEALTH & TEST ENDPOINTS ==========
app.get('/', (req, res) => {
  res.json({
    message: 'Task Manager API',
    version: '1.0.0',
    status: 'running',
    environment: process.env.NODE_ENV || 'development',
    endpoints: {
      health: '/api/health',
      test: '/api/test',
      debug: '/api/debug-prisma',
      register: '/api/auth/register',
      login: '/api/auth/login',
      tasks: '/api/tasks',
      users: '/api/users'
    },
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    database: process.env.DATABASE_URL ? 'configured' : 'not configured',
    serverTime: new Date().toISOString()
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

// Database debug endpoint
app.get('/api/debug-prisma', async (req, res) => {
  try {
    // Dynamic import to avoid startup failures
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    await prisma.$connect();
    console.log('✅ Prisma connected');
    
    const userCount = await prisma.user.count();
    const taskCount = await prisma.task.count();
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        taskCount,
        database: process.env.DATABASE_URL ? 'connected' : 'not configured'
      }
    });
    
  } catch (error: any) {
    console.error('❌ Prisma debug error:', error.message);
    res.status(500).json({
      success: false,
      error: error.message,
      message: 'Database connection failed'
    });
  }
});

// ========== STATIC FILES ==========
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ========== AUTH ROUTES ==========
const authRouter = express.Router();

// REGISTER endpoint
authRouter.post('/register', async (req, res) => {
  try {
    console.log('🔄 REGISTER request for:', req.body.email);
    
    // Validate request
    if (!req.body.email || !req.body.password || !req.body.name) {
      return res.status(400).json({
        success: false,
        error: 'Name, email and password are required'
      });
    }
    
    // Dynamically import modules
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    
    const prisma = new PrismaClient();
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: req.body.email },
    });
    
    if (existingUser) {
      await prisma.$disconnect();
      return res.status(400).json({
        success: false,
        error: 'User with this email already exists'
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
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const token = jwt.sign(
      { userId: user.id },
      jwtSecret,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
    );
    
    await prisma.$disconnect();
    
    console.log('✅ User registered:', user.email);
    
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: { user, token }
    });
    
  } catch (error: any) {
    console.error('❌ Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed: ' + error.message
    });
  }
});

// LOGIN endpoint
authRouter.post('/login', async (req, res) => {
  try {
    console.log('🔐 LOGIN request for:', req.body.email);
    
    // Validate request
    if (!req.body.email || !req.body.password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      });
    }
    
    // Dynamically import modules
    const { PrismaClient } = await import('@prisma/client');
    const bcrypt = await import('bcryptjs');
    const jwt = await import('jsonwebtoken');
    
    const prisma = new PrismaClient();
    
    // Find user
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
    
    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    
    // Generate token
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
      data: { user: userWithoutPassword, token }
    });
    
  } catch (error: any) {
    console.error('❌ Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed: ' + error.message
    });
  }
});

// Current user endpoint (requires token)
authRouter.get('/me', async (req, res) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'No token provided'
      });
    }
    
    const jwt = await import('jsonwebtoken');
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
    const decoded = jwt.verify(token, jwtSecret) as { userId: string };
    
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    
    await prisma.$disconnect();
    
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    res.json({
      success: true,
      data: { user }
    });
    
  } catch (error: any) {
    console.error('❌ Get me error:', error.message);
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token'
    });
  }
});

// Simple logout endpoint
authRouter.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Mount auth router
app.use('/api/auth', authRouter);
console.log('✅ Auth routes mounted at /api/auth');

// ========== TASK ROUTES ==========
const taskRouter = express.Router();

taskRouter.get('/', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const tasks = await prisma.task.findMany({
      include: {
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 20
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: { tasks },
      count: tasks.length
    });
    
  } catch (error: any) {
    console.error('❌ Get tasks error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tasks'
    });
  }
});

// Mount task router
app.use('/api/tasks', taskRouter);
console.log('✅ Task routes mounted at /api/tasks');

// ========== USER ROUTES ==========
const userRouter = express.Router();

userRouter.get('/', async (req, res) => {
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
      orderBy: {
        name: 'asc'
      },
      take: 50
    });
    
    await prisma.$disconnect();
    
    res.json({
      success: true,
      data: { users },
      count: users.length
    });
    
  } catch (error: any) {
    console.error('❌ Get users error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch users'
    });
  }
});

// Mount user router
app.use('/api/users', userRouter);
console.log('✅ User routes mounted at /api/users');

// ========== ERROR HANDLERS ==========
// 404 Handler
app.use('*', (req, res) => {
  console.log(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    error: 'Route not found',
    path: req.originalUrl,
    method: req.method,
    availableRoutes: [
      '/',
      '/api/health',
      '/api/test',
      '/api/debug-prisma',
      '/api/auth/register',
      '/api/auth/login',
      '/api/auth/me',
      '/api/auth/logout',
      '/api/tasks',
      '/api/users'
    ]
  });
});

// Global error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Server error:', err.message);
  console.error(err.stack);
  
  res.status(err.status || 500).json({
    success: false,
    error: 'Internal server error',
    message: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// ========== VERCEL REQUIREMENT ==========
export default app;

// ========== LOCAL DEVELOPMENT ONLY ==========
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🔗 Test register: http://localhost:${PORT}/api/auth/register`);
    console.log(`🔗 Test login: http://localhost:${PORT}/api/auth/login`);
  });
}