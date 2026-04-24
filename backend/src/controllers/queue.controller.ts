import { Request, Response, NextFunction } from 'express';
import { queueService } from '../services/queue.service';
import { sendSuccess } from '../utils/response.util';

/**
 * Queue cart controllers
 */

export const queueController = {
  /**
   * Get all queue carts
   */
  async getAllQueueCarts(req: Request, res: Response, next: NextFunction) {
    try {
      const { status } = req.query;
      const carts = await queueService.getAllQueueCarts(
        status as string | undefined
      );
      sendSuccess(res, carts, 'Queue carts retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get queue cart by ID
   */
  async getQueueCartById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const cart = await queueService.getQueueCartById(id);
      sendSuccess(res, cart, 'Queue cart retrieved successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Create new queue cart
   */
  async createQueueCart(req: Request, res: Response, next: NextFunction) {
    try {
      const cart = await queueService.createQueueCart(req.body);
      sendSuccess(res, cart, 'Queue cart created successfully', 201);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Update queue cart status
   */
  async updateQueueStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const cart = await queueService.updateQueueStatus(id, req.body);
      sendSuccess(res, cart, 'Queue cart status updated successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Delete queue cart
   */
  async deleteQueueCart(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      await queueService.deleteQueueCart(id);
      sendSuccess(res, null, 'Queue cart deleted successfully');
    } catch (error) {
      next(error);
    }
  },

  /**
   * Get queue carts by assistant
   */
  async getQueueCartsByAssistant(req: Request, res: Response, next: NextFunction) {
    try {
      const assistantId = req.params.assistantId as string;
      const carts = await queueService.getQueueCartsByAssistant(assistantId);
      sendSuccess(res, carts, 'Assistant queue carts retrieved successfully');
    } catch (error) {
      next(error);
    }
  },
};
