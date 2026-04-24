import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();
const orderController = new OrderController();

/**
 * Order Routes
 */

// PUBLIC routes (no authentication required for shop customers)
router.post('/', orderController.createOrder.bind(orderController));
router.get('/customer/:phone', orderController.getOrdersByCustomerPhone.bind(orderController));

// PROTECTED routes (admin only)
router.get('/', authenticate, authorize('admin', 'kassir'), orderController.getAllOrders.bind(orderController));
router.get('/:id', authenticate, authorize('admin', 'kassir'), orderController.getOrderById.bind(orderController));
router.patch('/:id/status', authenticate, authorize('admin', 'kassir'), orderController.updateOrderStatus.bind(orderController));

export default router;
