"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSocket = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const prisma_1 = __importDefault(require("../../lib/prisma"));
const setupSocket = (io) => {
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth?.token;
            if (!token)
                return next(new Error("AUTH_FAILED"));
            const decoded = jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
            const user = await prisma_1.default.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, name: true },
            });
            if (!user)
                return next(new Error("AUTH_FAILED"));
            socket.data.user = user;
            if (decoded.exp) {
                const ttl = decoded.exp * 1000 - Date.now();
                if (ttl <= 0)
                    return next(new Error("TOKEN_EXPIRED"));
                setTimeout(() => socket.disconnect(true), ttl);
            }
            next();
        }
        catch {
            next(new Error("AUTH_FAILED"));
        }
    });
    io.on("connection", (socket) => {
        const user = socket.data.user;
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
exports.setupSocket = setupSocket;
//# sourceMappingURL=socketServer.js.map