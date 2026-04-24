import { z } from 'zod';

/**
 * Product validation schemas
 */

export const createProductSchema = z.object({
  body: z.object({
    code: z.string().min(1, 'Product code is required').optional(),
    name: z.string().min(1, 'Product name is required'),
    category: z.string().min(1, 'Category is required'),
    image: z.string().url('Invalid image URL').optional().default(''),
    costPrice: z.number().positive('Cost price must be positive'),
    salePrice: z.number().positive('Sale price must be positive'),
    quantity: z.number().int().min(0, 'Quantity cannot be negative').default(0),
    description: z.string().optional().default(''),
  }),
});

export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
  body: z.object({
    code: z.string().min(1).optional(),
    name: z.string().min(1).optional(),
    category: z.string().min(1).optional(),
    image: z.string().url().optional(),
    costPrice: z.number().positive().optional(),
    salePrice: z.number().positive().optional(),
    quantity: z.number().int().min(0).optional(),
    description: z.string().optional(),
  }),
});

export const getProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid product ID'),
  }),
});

export type CreateProductInput = z.infer<typeof createProductSchema>['body'];
export type UpdateProductInput = z.infer<typeof updateProductSchema>['body'];
