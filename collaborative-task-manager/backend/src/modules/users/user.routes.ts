import { Router } from 'express';
import { userController } from './user.controller';
import { authenticate } from '../auth/auth.middleware';

const router = Router();

// All user routes require authentication
router.use(authenticate);

router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

export default router;