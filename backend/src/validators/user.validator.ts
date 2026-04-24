import { z } from 'zod';

/**
 * User validation schemas
 */

export const createUserSchema = z.object({
  name: z.string().min(1, 'Ism kiritilishi shart'),
  email: z.string().min(1, 'Login kiritilishi shart'),
  password: z.string().min(4, 'Parol kamida 4 ta belgidan iborat bo\'lishi kerak'),
  role: z.enum(['admin', 'kassir', 'yordamchi', 'omborchi']),
});

export const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().min(1).optional(),
  password: z.string().min(4).optional(),
  role: z.enum(['admin', 'kassir', 'yordamchi', 'omborchi']).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
