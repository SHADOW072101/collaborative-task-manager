import * as dotenv from 'dotenv';
dotenv.config();

import taskRoutes from './modules/tasks/task.routes';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { env } from './core/config/env';
import { errorHandler } from './core/middleware/errorHandler';
import { notFoundHandler } from './core/middleware/notFoundHandler';
import authRoutes from './modules/auth/auth.routes';
import { setupSocket } from './core/socket/socketServer';
import userRoutes from './modules/users/user.routes';

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

// Middleware
app.use(helmet());


app.use(cors({
  origin: env.FRONTEND_URL, 
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  exposedHeaders: ['Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.options('*', cors({
  origin: env.FRONTEND_URL,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);


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
});

export { io };