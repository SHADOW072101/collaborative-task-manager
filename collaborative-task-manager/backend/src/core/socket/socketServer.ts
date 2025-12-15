import { Server, Socket } from 'socket.io';
import { authService } from '../../modules/auth/auth.service';

export const setupSocket = (io: Server) => {
  // Authentication middleware for sockets
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication error'));
      }

      const payload = authService.verifyToken(token);
      socket.data.userId = payload.userId;
      
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = socket.data.userId;
    console.log(`User ${userId} connected with socket ${socket.id}`);

    // Join user to their personal room
    socket.join(`user:${userId}`);

    // Task events
    socket.on('task:create', (task) => {
      console.log('Task created:', task);
      socket.broadcast.emit('task:created', task);
    });

    socket.on('task:update', (task) => {
      console.log('Task updated:', task);
      io.emit('task:updated', task);
    });

    socket.on('task:delete', (taskId) => {
      console.log('Task deleted:', taskId);
      io.emit('task:deleted', taskId);
    });

    socket.on('task:assign', (data) => {
      console.log('Task assigned:', data);
      
      // Notify the assignee
      io.to(`user:${data.assignedToId}`).emit('task:assigned', data.task);
      
      // Notify everyone else
      socket.broadcast.emit('task:assignedToOthers', data.task);
    });

    socket.on('disconnect', () => {
      console.log(`User ${userId} disconnected`);
    });
  });
};