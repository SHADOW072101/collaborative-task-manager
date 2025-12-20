"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const auth_middleware_1 = require("../auth/auth.middleware");
const upload_1 = require("../../core/middleware/upload");
const router = (0, express_1.Router)();
// ========== PUBLIC ROUTES (if any) ==========
// ========== PROTECTED ROUTES ==========
router.use(auth_middleware_1.authenticate); // All routes below require auth
// ========== CURRENT USER ROUTES ==========
router.get('/me/profile', user_controller_1.userController.getMyProfile);
router.put('/me/profile', user_controller_1.userController.updateMyProfile);
router.patch('/me/preferences', user_controller_1.userController.updateMyPreferences);
router.post('/me/avatar', upload_1.upload.single('avatar'), user_controller_1.userController.uploadAvatar);
router.post('/me/change-password', user_controller_1.userController.changePassword);
router.post('/me/two-factor', user_controller_1.userController.toggleTwoFactor);
router.post('/me/send-verification-email', user_controller_1.userController.sendVerificationEmail);
router.get('/me/activity', user_controller_1.userController.getMyActivityLogs);
router.delete('/me/account', user_controller_1.userController.deleteMyAccount);
// ========== USER SEARCH ROUTES (MUST come before /:id) ==========
router.get('/search', user_controller_1.userController.searchUsers);
router.get('/', user_controller_1.userController.getUsers); // For getting all users
// ========== SPECIFIC USER ROUTES (DYNAMIC - MUST come last) ==========
router.get('/:id', user_controller_1.userController.getUserById);
exports.default = router;
//# sourceMappingURL=user.routes.js.map