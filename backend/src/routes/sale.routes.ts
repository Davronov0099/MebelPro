import { Router } from 'express';
import { SaleController } from '../controllers/sale.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
const saleController = new SaleController();

/**
 * Sale Routes
 * Base path: /api/sales
 */

// Create sale (kassir, admin)
router.post(
  '/',
  authenticate,
  authorize('admin', 'kassir'),
  saleController.createSale.bind(saleController)
);

// Get all sales (admin, kassir)
router.get(
  '/',
  authenticate,
  authorize('admin', 'kassir'),
  saleController.getAllSales.bind(saleController)
);

// Get sales statistics (admin)
router.get(
  '/stats',
  authenticate,
  authorize('admin'),
  saleController.getSalesStats.bind(saleController)
);

// Get sale by ID (admin, kassir)
router.get(
  '/:id',
  authenticate,
  authorize('admin', 'kassir'),
  saleController.getSaleById.bind(saleController)
);

export default router;
