import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

/**
 * Product routes
 * Base path: /api/products
 */

// GET /api/products - Get all products (with optional search) - PUBLIC
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get product by ID - PUBLIC
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product (admin only)
router.post('/', authenticate, authorize('admin'), productController.createProduct);

// PUT /api/products/:id - Update product (admin only)
router.put('/:id', authenticate, authorize('admin'), productController.updateProduct);

// DELETE /api/products/:id - Delete product (admin only)
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

// PATCH /api/products/:id/quantity - Update quantity (admin, omborchi)
router.patch(
  '/:id/quantity',
  authenticate,
  authorize('admin', 'omborchi'),
  productController.updateQuantity
);

export default router;
