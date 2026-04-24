import { Request, Response, NextFunction } from 'express';
import { OrderService } from '../services/order.service';
import { createOrderSchema, updateOrderStatusSchema } from '../validators/order.validator';
import { sendSuccess, sendError } from '../utils/response.util';

const orderService = new OrderService();

/**
 * Order Controller
 */

export class OrderController {
  /**
   * Create new order (PUBLIC - no auth required for shop customers)
   */
  async createOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = createOrderSchema.parse(req.body);

      // Create order
      const order = await orderService.createOrder(validatedData);

      sendSuccess(res, order, 'Buyurtma muvaffaqiyatli yaratildi', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all orders (ADMIN only)
   */
  async getAllOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, status, customerPhone } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (status) filters.status = status as string;
      if (customerPhone) filters.customerPhone = customerPhone as string;

      const orders = await orderService.getAllOrders(filters);

      sendSuccess(res, orders, 'Buyurtmalar ro\'yxati');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get order by ID
   */
  async getOrderById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const order = await orderService.getOrderById(id as string);

      if (!order) {
        sendError(res, 'Buyurtma topilmadi', 404);
        return;
      }

      sendSuccess(res, order, 'Buyurtma ma\'lumotlari');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update order status (ADMIN only)
   */
  async updateOrderStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const validatedData = updateOrderStatusSchema.parse(req.body);

      const order = await orderService.updateOrderStatus(id as string, validatedData.status);

      sendSuccess(res, order, 'Buyurtma holati yangilandi');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get orders by customer phone (PUBLIC - for shop customers to view their orders)
   */
  async getOrdersByCustomerPhone(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { phone } = req.params;

      const orders = await orderService.getOrdersByCustomerPhone(phone as string);

      sendSuccess(res, orders, 'Buyurtmalar ro\'yxati');
    } catch (error) {
      next(error);
    }
  }
}
