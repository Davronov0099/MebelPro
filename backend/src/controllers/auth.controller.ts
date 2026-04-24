import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess, sendError, sendCreated } from '../utils/response.util';
import { loginSchema, registerSchema } from '../validators/auth.validator';

/**
 * POST /api/auth/login
 * Login user
 */
export const loginController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { body } = loginSchema.parse({ body: req.body });

    // Login user
    const result = await authService.login(body);

    sendSuccess(res, result, 'Login successful');
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, error.message, 401);
    } else {
      next(error);
    }
  }
};

/**
 * POST /api/auth/register
 * Register new user (Admin only)
 */
export const registerController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Validate request
    const { body } = registerSchema.parse({ body: req.body });

    // Register user
    const result = await authService.register(body);

    sendCreated(res, result, 'User registered successfully');
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, error.message, 400);
    } else {
      next(error);
    }
  }
};

/**
 * GET /api/auth/me
 * Get current user
 */
export const getMeController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);

    sendSuccess(res, user);
  } catch (error) {
    if (error instanceof Error) {
      sendError(res, error.message, 404);
    } else {
      next(error);
    }
  }
};

/**
 * POST /api/auth/logout
 * Logout user
 */
export const logoutController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    if (!req.user) {
      sendError(res, 'Unauthorized', 401);
      return;
    }

    await authService.logout(req.user.userId);

    sendSuccess(res, null, 'Logout successful');
  } catch (error) {
    next(error);
  }
};
