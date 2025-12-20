import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../database/prisma';

export const setupSocket = (io: Server) => {
  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        console.log('❌ No token provided for socket connection');
        return next(new Error('Authentication error: No token'));
      }

      // Verify token
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; email: string };
      
      // Verify user exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true }
      });

      if (!user) {
        console.log('❌ User not found for socket connection');
        return next(new Error('Authentication error: User not found'));
      }

      // Attach user to socket
      socket.data.user = user;
      console.log(`✅ Socket authenticated for user: ${user.name} (${user.id})`);
      
      next();
    } catch (error) {
      console.error('❌ Socket auth error:', error);
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const user = socket.data.user;
    
    if (!user) {
      console.log('❌ No user data on socket, disconnecting');
      socket.disconnect();
      return;
    }

    console.log(`👤 User ${user.name} (${user.id}) connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${user.id}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`👋 User ${user.name} (${user.id}) disconnected. Reason: ${reason}`);
    });

    // Handle custom events
    socket.on('task:create', (task) => {
      console.log('📝 Task created via socket:', task.title);
      socket.broadcast.emit('task:created', task);
    });

    socket.on('task:update', (task) => {
      console.log('✏️ Task updated via socket:', task.title);
      io.emit('task:updated', task);
    });

    socket.on('task:delete', (taskId) => {
      console.log('🗑️ Task deleted via socket:', taskId);
      io.emit('task:deleted', taskId);
    });

    socket.on('task:assign', (data) => {
      console.log('👥 Task assigned via socket:', data.task.title);
      
      // Notify the assignee
      io.to(`user:${data.assignedToId}`).emit('task:assigned', data.task);
      
      // Notify everyone else
      socket.broadcast.emit('task:assignedToOthers', data.task);
    });
  });
};