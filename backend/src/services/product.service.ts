import { prisma } from '../config/database';
import { CreateProductInput, UpdateProductInput } from '../validators/product.validator';

/**
 * Product service - handles business logic
 */

export const productService = {
  /**
   * Get all products
   */
  async getAllProducts() {
    return await prisma.product.findMany({
      orderBy: { code: 'asc' },
    });
  },

  /**
   * Get product by ID
   */
  async getProductById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  },

  /**
   * Create new product
   */
  async createProduct(data: CreateProductInput) {
    // Auto-generate code if not provided
    let productCode: string;
    
    if (!data.code || data.code.trim() === '') {
      // Get the last product by code
      const lastProduct = await prisma.product.findFirst({
        orderBy: { code: 'desc' },
      });

      if (lastProduct && lastProduct.code) {
        // Extract number from code (e.g., "008" -> 8)
        const lastNumber = parseInt(lastProduct.code, 10);
        // Increment and pad with zeros (e.g., 9 -> "009")
        productCode = String(lastNumber + 1).padStart(3, '0');
      } else {
        // First product
        productCode = '001';
      }
    } else {
      productCode = data.code;
    }

    // Check if code already exists
    const existing = await prisma.product.findUnique({
      where: { code: productCode },
    });

    if (existing) {
      throw new Error('Product code already exists');
    }

    // Create product with guaranteed string code
    const { code: _, ...restData } = data;
    return await prisma.product.create({
      data: {
        ...restData,
        code: productCode,
      },
    });
  },

  /**
   * Update product
   */
  async updateProduct(id: string, data: UpdateProductInput) {
    // Check if product exists
    await this.getProductById(id);

    // If updating code, check if new code already exists
    if (data.code) {
      const existing = await prisma.product.findFirst({
        where: {
          code: data.code,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Product code already exists');
      }
    }

    return await prisma.product.update({
      where: { id },
      data,
    });
  },

  /**
   * Delete product (cascade delete all related items)
   */
  async deleteProduct(id: string) {
    // Check if product exists
    await this.getProductById(id);

    // Delete all related items first (cascade delete)
    await prisma.$transaction([
      // Delete from sale items
      prisma.saleItem.deleteMany({
        where: { productId: id },
      }),
      // Delete from order items
      prisma.orderItem.deleteMany({
        where: { productId: id },
      }),
      // Delete from queue cart items
      prisma.queueCartItem.deleteMany({
        where: { productId: id },
      }),
      // Finally delete the product
      prisma.product.delete({
        where: { id },
      }),
    ]);

    return { success: true };
  },

  /**
   * Update product quantity (for warehouse)
   */
  async updateQuantity(id: string, quantity: number) {
    // Check if product exists
    await this.getProductById(id);

    return await prisma.product.update({
      where: { id },
      data: { quantity },
    });
  },

  /**
   * Search products by name, code, or category
   */
  async searchProducts(query: string) {
    return await prisma.product.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { code: { contains: query, mode: 'insensitive' } },
          { category: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { code: 'asc' },
    });
  },
};
