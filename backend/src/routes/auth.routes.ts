import { Router } from 'express';
import {
  loginController,
  registerController,
  getMeController,
  logoutController,
} from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { adminOnly } from '../middleware/role.middleware';

const router = Router();

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', loginController);

/**
 * @route   POST /api/auth/register
 * @desc    Register new user
 * @access  Private (Admin only)
 */
router.post('/register', authenticate, adminOnly, registerController);

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, getMeController);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
router.post('/logout', authenticate, logoutController);

export default router;
