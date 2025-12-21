"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// backend/src/server.ts (for local development only)
const index_1 = __importDefault(require("./index"));
const PORT = process.env.PORT || 3000;
// Only start server if running locally
if (require.main === module) {
    index_1.default.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
        console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
        console.log(`📁 Health check: http://localhost:${PORT}/health`);
    });
}
//# sourceMappingURL=server.js.map