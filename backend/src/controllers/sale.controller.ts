import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';
import { createSaleSchema } from '../validators/sale.validator';
import { sendSuccess, sendError } from '../utils/response.util';

const saleService = new SaleService();

/**
 * Sale Controller
 */

export class SaleController {
  /**
   * Create new sale
   */
  async createSale(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const validatedData = createSaleSchema.parse(req.body);

      // Get seller info from authenticated user
      const sellerId = req.user!.userId;
      const sellerName = req.user!.name;

      // Create sale
      const sale = await saleService.createSale(validatedData, sellerId, sellerName);

      sendSuccess(res, sale, 'Savdo muvaffaqiyatli yaratildi', 201);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all sales
   */
  async getAllSales(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate, sellerId } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);
      if (sellerId) filters.sellerId = sellerId as string;

      const sales = await saleService.getAllSales(filters);

      sendSuccess(res, sales, 'Savdolar ro\'yxati');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sale by ID
   */
  async getSaleById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      const sale = await saleService.getSaleById(id as string);

      if (!sale) {
        sendError(res, 'Savdo topilmadi', 404);
        return;
      }

      sendSuccess(res, sale, 'Savdo ma\'lumotlari');
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get sales statistics
   */
  async getSalesStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { startDate, endDate } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = new Date(startDate as string);
      if (endDate) filters.endDate = new Date(endDate as string);

      const stats = await saleService.getSalesStats(filters);

      sendSuccess(res, stats, 'Savdo statistikasi');
    } catch (error) {
      next(error);
    }
  }
}
