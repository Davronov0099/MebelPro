import { Router } from 'express';
import { queueController } from '../controllers/queue.controller';
import { authenticate } from '../middleware/auth.middleware';
import { authorize } from '../middleware/role.middleware';

const router = Router();

/**
 * Queue cart routes
 * Base path: /api/queue
 */

// All routes require authentication
router.use(authenticate);

// GET /api/queue - Get all queue carts (admin, kassir)
router.get(
  '/',
  authorize('admin', 'kassir'),
  queueController.getAllQueueCarts
);

// GET /api/queue/:id - Get queue cart by ID
router.get('/:id', queueController.getQueueCartById);

// POST /api/queue - Create new queue cart (yordamchi)
router.post(
  '/',
  authorize('yordamchi', 'admin'),
  queueController.createQueueCart
);

// PATCH /api/queue/:id/status - Update queue cart status (admin, kassir)
router.patch(
  '/:id/status',
  authorize('admin', 'kassir'),
  queueController.updateQueueStatus
);

// DELETE /api/queue/:id - Delete queue cart (admin)
router.delete('/:id', authorize('admin'), queueController.deleteQueueCart);

// GET /api/queue/assistant/:assistantId - Get carts by assistant
router.get('/assistant/:assistantId', queueController.getQueueCartsByAssistant);

export default router;
