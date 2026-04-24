import { Router } from 'express';
import { userController } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/role.middleware';

const router = Router();

/**
 * User routes - all routes require authentication and admin role
 */

// Get all users
router.get('/', authenticate, adminOnly, userController.getAllUsers);

// Get user by ID
router.get('/:id', authenticate, adminOnly, userController.getUserById);

// Create new user
router.post('/', authenticate, adminOnly, userController.createUser);

// Update user
router.put('/:id', authenticate, adminOnly, userController.updateUser);

// Delete user
router.delete('/:id', authenticate, adminOnly, userController.deleteUser);

export default router;
