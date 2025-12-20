"use strict";
// backend/src/shared/logger.ts
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const env_1 = require("../core/config/env");
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
// Define level based on environment
const level = () => {
    const isDevelopment = env_1.env.NODE_ENV === 'development';
    return isDevelopment ? 'debug' : 'warn';
};
// Define colors for each level
const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'white',
};
winston_1.default.addColors(colors);
// Define format
const format = winston_1.default.format.combine(winston_1.default.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston_1.default.format.colorize({ all: true }), winston_1.default.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
// Define transports
const transports = [
    new winston_1.default.transports.Console(),
    new winston_1.default.transports.File({
        filename: 'logs/error.log',
        level: 'error',
    }),
    new winston_1.default.transports.File({ filename: 'logs/all.log' }),
];
// Create the logger
exports.logger = winston_1.default.createLogger({
    level: level(),
    levels,
    format,
    transports,
});
// Custom logging methods
exports.log = {
    info: (message, meta) => exports.logger.info(message, meta),
    error: (message, error) => {
        if (error instanceof Error) {
            exports.logger.error(`${message}: ${error.message}\n${error.stack}`);
        }
        else {
            exports.logger.error(message, error);
        }
    },
    warn: (message, meta) => exports.logger.warn(message, meta),
    debug: (message, meta) => exports.logger.debug(message, meta),
    http: (message, meta) => exports.logger.http(message, meta),
};
//# sourceMappingURL=logger.js.map