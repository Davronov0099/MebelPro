import { PrismaClient } from '@prisma/client';
import { CreateSaleInput } from '../validators/sale.validator';

const prisma = new PrismaClient();

/**
 * Sale Service
 */

export class SaleService {
  /**
   * Generate unique sale number
   */
  private async generateSaleNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Get today's sales count
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const count = await prisma.sale.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `S${year}${month}${day}-${sequence}`;
  }

  /**
   * Create new sale
   */
  async createSale(data: CreateSaleInput, sellerId: string, sellerName: string) {
    // Calculate total price
    const totalPrice = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate sale number
    const saleNumber = await this.generateSaleNumber();
    
    // Create sale with items in a transaction
    const sale = await prisma.$transaction(async (tx) => {
      // Create sale
      const newSale = await tx.sale.create({
        data: {
          saleNumber,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          totalPrice,
          sellerId,
          sellerName,
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          seller: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });

      // Update product quantities
      for (const item of data.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            quantity: {
              decrement: item.quantity,
            },
          },
        });
      }

      return newSale;
    });

    return sale;
  }

  /**
   * Get all sales
   */
  async getAllSales(filters?: {
    startDate?: Date;
    endDate?: Date;
    sellerId?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.sellerId) {
      where.sellerId = filters.sellerId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return sales;
  }

  /**
   * Get sale by ID
   */
  async getSaleById(id: string) {
    const sale = await prisma.sale.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return sale;
  }

  /**
   * Get sales statistics
   */
  async getSalesStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [totalSales, totalRevenue, salesCount] = await Promise.all([
      prisma.sale.count({ where }),
      prisma.sale.aggregate({
        where,
        _sum: {
          totalPrice: true,
        },
      }),
      prisma.sale.groupBy({
        by: ['sellerId', 'sellerName'],
        where,
        _count: {
          id: true,
        },
        _sum: {
          totalPrice: true,
        },
      }),
    ]);

    return {
      totalSales,
      totalRevenue: totalRevenue._sum.totalPrice || 0,
      salesBySeller: salesCount,
    };
  }
}
