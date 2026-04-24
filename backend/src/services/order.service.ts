import { PrismaClient } from '@prisma/client';
import { CreateOrderInput } from '../validators/order.validator';

const prisma = new PrismaClient();

/**
 * Order Service
 */

export class OrderService {
  /**
   * Generate unique order number
   */
  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const year = today.getFullYear().toString().slice(-2);
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    
    // Get today's orders count
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));
    
    const count = await prisma.order.count({
      where: {
        createdAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });
    
    const sequence = (count + 1).toString().padStart(4, '0');
    return `O${year}${month}${day}-${sequence}`;
  }

  /**
   * Create new order
   */
  async createOrder(data: CreateOrderInput) {
    // Calculate total price
    const totalPrice = data.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Generate order number
    const orderNumber = await this.generateOrderNumber();
    
    // Create order with items
    const order = await prisma.order.create({
      data: {
        orderNumber,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalPrice,
        deliveryType: data.deliveryType,
        address: data.address,
        status: 'new',
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
      },
    });

    return order;
  }

  /**
   * Get all orders
   */
  async getAllOrders(filters?: {
    startDate?: Date;
    endDate?: Date;
    status?: string;
    customerPhone?: string;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.customerPhone) {
      where.customerPhone = filters.customerPhone;
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }

  /**
   * Get order by ID
   */
  async getOrderById(id: string) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Update order status
   */
  async updateOrderStatus(id: string, status: 'new' | 'preparing' | 'ready' | 'onway' | 'delivered') {
    const order = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return order;
  }

  /**
   * Get orders by customer phone
   */
  async getOrdersByCustomerPhone(customerPhone: string) {
    const orders = await prisma.order.findMany({
      where: { customerPhone },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return orders;
  }
}
