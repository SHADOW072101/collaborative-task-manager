import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import prisma from '../../lib/prisma'

export const setupSocket = (io: Server) => {
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (!token) return next(new Error("AUTH_FAILED"));

      const decoded = jwt.verify(token, env.JWT_SECRET) as {
        userId: string;
        email: string;
        exp?: number;
      };

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, email: true, name: true },
      });

      if (!user) return next(new Error("AUTH_FAILED"));

      socket.data.user = user;

      if (decoded.exp) {
        const ttl = decoded.exp * 1000 - Date.now();
        if (ttl <= 0) return next(new Error("TOKEN_EXPIRED"));
        setTimeout(() => socket.disconnect(true), ttl);
      }

      next();
    } catch {
      next(new Error("AUTH_FAILED"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user!;
    socket.join(`user:${user.id}`);

    socket.on("task:create", (task) => {
      io.emit("task:created", task);
    });

    socket.on("task:update", (task) => {
      io.emit("task:updated", task);
    });

    socket.on("task:delete", (taskId) => {
      io.emit("task:deleted", taskId);
    });

    socket.on("task:assign", ({ task, assignedToId }) => {
      io.to(`user:${assignedToId}`).emit("task:assigned", task);
    });

    socket.on("disconnect", () => {
      socket.leave(`user:${user.id}`);
    });
  });
};
