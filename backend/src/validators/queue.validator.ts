import { z } from 'zod';

/**
 * Queue cart validation schemas
 */

const queueItemSchema = z.object({
  productId: z.string().uuid('Invalid product ID'),
  quantity: z.number().int().positive('Quantity must be positive'),
  price: z.number().positive('Price must be positive'),
});

export const createQueueCartSchema = z.object({
  body: z.object({
    assistantId: z.string().uuid('Invalid assistant ID'),
    customerName: z.string().min(1, 'Customer name is required').optional(),
    customerPhone: z.string().min(1, 'Customer phone is required').optional(),
    items: z.array(queueItemSchema).min(1, 'At least one item is required'),
  }),
});

export const updateQueueStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid queue cart ID'),
  }),
  body: z.object({
    status: z.enum(['pending', 'sent_to_cashier']),
    approvedBy: z.enum(['admin', 'kassir']).optional(),
  }),
});

export const getQueueCartSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid queue cart ID'),
  }),
});

export type CreateQueueCartInput = z.infer<typeof createQueueCartSchema>['body'];
export type UpdateQueueStatusInput = z.infer<typeof updateQueueStatusSchema>['body'];
