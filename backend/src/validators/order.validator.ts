import { z } from 'zod';

/**
 * Order Validators
 */

export const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Ism kiritilishi shart'),
  customerPhone: z.string().min(1, 'Telefon raqam kiritilishi shart'),
  deliveryType: z.enum(['courier', 'pickup']),
  address: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().uuid(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ).min(1, 'Kamida bitta mahsulot bo\'lishi kerak'),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(['new', 'preparing', 'ready', 'onway', 'delivered']),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
