"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = void 0;
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const app_1 = __importDefault(require("./app"));
const socketServer_1 = require("./core/socket/socketServer");
const httpServer = (0, http_1.createServer)(app_1.default);
const io = new socket_io_1.Server(httpServer, { cors: { origin: "*" } });
exports.io = io;
(0, socketServer_1.setupSocket)(io);
httpServer.listen(3000, () => {
    console.log("🚀 Server running with sockets");
});
//# sourceMappingURL=server.js.map