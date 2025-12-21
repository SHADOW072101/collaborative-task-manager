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
exports.io = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const path_1 = __importDefault(require("path"));
const env_1 = require("./core/config/env");
const errorHandler_1 = require("./core/middleware/errorHandler");
const notFoundHandler_1 = require("./core/middleware/notFoundHandler");
// Route imports
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const task_routes_1 = __importDefault(require("./modules/tasks/task.routes"));
const user_routes_1 = __importDefault(require("./modules/users/user.routes"));
const socketServer_1 = require("./core/socket/socketServer");
const app = (0, express_1.default)();
const httpServer = (0, http_1.createServer)(app);
// Socket.io setup
const io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: env_1.env.FRONTEND_URL,
        credentials: true,
        methods: ['GET', 'POST']
    },
    transports: ['websocket', 'polling'],
});
exports.io = io;
// ✅ Add debug logging middleware FIRST
app.use((req, res, next) => {
    console.log(`📥 ${new Date().toISOString()} ${req.method} ${req.originalUrl}`);
    next();
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: [env_1.env.FRONTEND_URL,
        'https://collaborative-task-manager-81xh.vercel.app/'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    exposedHeaders: ['Authorization'],
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.options('*', (0, cors_1.default)({
    origin: [env_1.env.FRONTEND_URL,
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
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// ✅ API Routes - NO DUPLICATES
app.use('/api/auth', auth_routes_1.default);
app.use('/api/tasks', task_routes_1.default);
app.use('/api/users', user_routes_1.default); // ✅ Only once!
app.use('/api/tasks', task_routes_1.default);
// Debug: Add a test route
app.get('/api/test-route', (req, res) => {
    console.log('✅ Test route reached');
    res.json({ success: true, message: 'Test route works' });
});
// Error handling
app.use(notFoundHandler_1.notFoundHandler);
app.use(errorHandler_1.errorHandler);
// Setup socket events
(0, socketServer_1.setupSocket)(io);
const PORT = env_1.env.PORT;
httpServer.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📁 Environment: ${env_1.env.NODE_ENV}`);
    console.log(`🔗 Frontend URL: ${env_1.env.FRONTEND_URL}`);
    console.log('✅ Registered routes:');
    console.log('   GET  /api/auth/*');
    console.log('   GET  /api/tasks/*');
    console.log('   GET  /api/users/*');
    console.log('   GET  /health');
    console.log('   GET  /api/test-route');
});
//# sourceMappingURL=app.js.map