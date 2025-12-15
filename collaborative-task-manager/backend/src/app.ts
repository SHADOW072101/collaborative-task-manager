import * as dotenv from 'dotenv';
dotenv.config();

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

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: env.FRONTEND_URL,
    credentials: true,
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);

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