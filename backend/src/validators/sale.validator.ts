import { z } from 'zod';

/**
 * Sale Validators
 */

// Create sale validation schema
export const createSaleSchema = z.object({
  customerName: z.string().min(2, 'Mijoz ismi kamida 2 ta belgidan iborat bo\'lishi kerak'),
  customerPhone: z.string().min(1, 'Telefon raqam kiritilishi shart'),
  items: z.array(
    z.object({
      productId: z.string().uuid('Product ID noto\'g\'ri'),
      quantity: z.number().int().positive('Miqdor musbat son bo\'lishi kerak'),
      price: z.number().positive('Narx musbat son bo\'lishi kerak'),
    })
  ).min(1, 'Kamida 1 ta mahsulot bo\'lishi kerak'),
});

export type CreateSaleInput = z.infer<typeof createSaleSchema>;
