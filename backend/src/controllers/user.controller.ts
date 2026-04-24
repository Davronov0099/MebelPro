import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { sendSuccess, sendError } from '../utils/response.util';

/**
 * User controller - handles HTTP requests
 */

export const userController = {
  /**
   * Get all users
   */
  async getAllUsers(_req: Request, res: Response) {
    try {
      const users = await userService.getAllUsers();
      return sendSuccess(res, users, 'Users fetched successfully');
    } catch (error: any) {
      return sendError(res, error.message);
    }
  },

  /**
   * Get user by ID
   */
  async getUserById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const user = await userService.getUserById(id as string);
      return sendSuccess(res, user, 'User fetched successfully');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  },

  /**
   * Create new user
   */
  async createUser(req: Request, res: Response) {
    try {
      const validatedData = createUserSchema.parse(req.body);
      const user = await userService.createUser(validatedData);
      return sendSuccess(res, user, 'User created successfully', 201);
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400);
      }
      return sendError(res, error.message, 400);
    }
  },

  /**
   * Update user
   */
  async updateUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validatedData = updateUserSchema.parse(req.body);
      const user = await userService.updateUser(id as string, validatedData);
      return sendSuccess(res, user, 'User updated successfully');
    } catch (error: any) {
      if (error.name === 'ZodError') {
        return sendError(res, error.errors[0].message, 400);
      }
      return sendError(res, error.message, 400);
    }
  },

  /**
   * Delete user
   */
  async deleteUser(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const result = await userService.deleteUser(id as string);
      return sendSuccess(res, result, 'User deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message, 404);
    }
  },
};
