"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/index.ts
const dotenv = __importStar(require("dotenv"));
dotenv.config();
console.log('🚀 Server starting...');
console.log('📋 Environment check:');
console.log('  NODE_ENV:', process.env.NODE_ENV);
console.log('  DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET ❌');
console.log('  PORT:', process.env.PORT);
console.log('  FRONTEND_URL:', process.env.FRONTEND_URL || 'not set');
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
// ✅ Debug logging middleware
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});
// Middleware
app.use((0, helmet_1.default)());
// CORS configuration
const allowedOrigins = [
    '*', // Allow all origins - adjust as needed for production
];
app.options('*', (req, res) => {
    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
        res.header('Access-Control-Max-Age', '86400'); // 24 hours
        return res.status(200).end();
    }
    res.status(403).json({ error: 'Origin not allowed' });
});
// Regular CORS middleware
app.use((req, res, next) => {
    const origin = req.headers.origin || '';
    if (allowedOrigins.includes(origin) || !origin) {
        res.header('Access-Control-Allow-Origin', origin || '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    next();
}); // Enable preflight for all routes
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
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
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
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
    }
    catch (error) {
        console.error('❌ Prisma debug error:', error.message);
        res.status(500).json({
            success: false,
            error: error.message,
            message: 'Database connection failed'
        });
    }
});
// ========== STATIC FILES ==========
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ========== AUTH ROUTES ==========
const authRouter = express_1.default.Router();
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
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const jwt = await Promise.resolve().then(() => __importStar(require('jsonwebtoken')));
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
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        await prisma.$disconnect();
        console.log('✅ User registered:', user.email);
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: { user, token }
        });
    }
    catch (error) {
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
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const bcrypt = await Promise.resolve().then(() => __importStar(require('bcryptjs')));
        const jwt = await Promise.resolve().then(() => __importStar(require('jsonwebtoken')));
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
        const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
        await prisma.$disconnect();
        console.log('✅ User logged in:', user.email);
        res.json({
            success: true,
            message: 'Login successful',
            data: { user: userWithoutPassword, token }
        });
    }
    catch (error) {
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
        const jwt = await Promise.resolve().then(() => __importStar(require('jsonwebtoken')));
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
        const prisma = new PrismaClient();
        const jwtSecret = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
        const decoded = jwt.verify(token, jwtSecret);
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
    }
    catch (error) {
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
const taskRouter = express_1.default.Router();
taskRouter.get('/', async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
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
    }
    catch (error) {
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
const userRouter = express_1.default.Router();
userRouter.get('/', async (req, res) => {
    try {
        const { PrismaClient } = await Promise.resolve().then(() => __importStar(require('@prisma/client')));
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
    }
    catch (error) {
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
app.use((err, req, res, next) => {
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
exports.default = app;
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
//# sourceMappingURL=index.js.map