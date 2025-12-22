import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { setupSocket } from "./core/socket/socketServer";
import e from "express";

const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: "*" } });

setupSocket(io);

httpServer.listen(3000, () => {
  console.log("🚀 Server running with sockets");
});

export { io };