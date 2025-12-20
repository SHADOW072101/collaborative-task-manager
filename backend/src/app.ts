import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path'; 

import { env } from './core/config/env';
import { errorHandler } from './core/middleware/errorHandler';
import { notFoundHandler } from './core/middleware/notFoundHandler';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import taskRoutes from './modules/tasks/task.routes';
import userRoutes from './modules/users/user.routes';

import { setupSocket } from './core/socket/socketServer';

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL, 
    credentials: true,
    methods: ['GET', 'POST']
  },
  transports: ['websocket', 'polling'],
});

// ✅ Add debug logging middleware FIRST
app.use((req, res, next) => {
  console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware
app.use(helmet());

app.use(cors({
  origin: [env.FRONTEND_URL,
    'https://collaborative-task-manager-81xh.vercel.app/'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors({
  origin:[env.FRONTEND_URL,
    'https://collaborative-task-manager-81xh.vercel.app/'
  ], 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

// Health check
app.get('/api/health', (req, res) => {
  console.log('✅ Health check called');
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ✅ API Routes - NO DUPLICATES
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/users', userRoutes); // ✅ Only once!

app.use('/tasks', taskRoutes);

// Debug: Add a test route
app.get('/test-route', (req, res) => {
  console.log('✅ Test route reached');
  res.json({ success: true, message: 'Test route works' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Setup socket events
setupSocket(io);

const PORT = env.PORT;

httpServer.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📁 Environment: ${env.NODE_ENV}`);
  console.log(`🔗 Frontend URL: ${env.FRONTEND_URL}`);
  console.log('✅ Registered routes:');
  console.log('   GET  /api/auth/*');
  console.log('   GET  /api/tasks/*');
  console.log('   GET  /api/users/*');
  console.log('   GET  /health');
  console.log('   GET  /api/test-route');
});

export { io };