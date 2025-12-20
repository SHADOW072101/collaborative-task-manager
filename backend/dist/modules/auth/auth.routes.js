"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_middleware_1 = require("../auth/auth.middleware");
const auth_controller_1 = require("../controllers/auth.controller");
const router = express_1.default.Router();
// Public routes
router.post('/register', auth_controller_1.authController.register);
router.post('/login', auth_controller_1.authController.login);
// Protected routes (require authentication)
router.get('/me', auth_middleware_1.authenticate, auth_controller_1.authController.getCurrentUser);
router.put('/profile', auth_middleware_1.authenticate, auth_controller_1.authController.updateProfile);
router.post('/logout', auth_middleware_1.authenticate, auth_controller_1.authController.logout);
router.post('/refresh-token', auth_controller_1.authController.refreshToken); // Optional
exports.default = router;
//# sourceMappingURL=auth.routes.js.map