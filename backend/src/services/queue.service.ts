import { prisma } from '../config/database';
import { getIO } from '../config/socket';
import { CreateQueueCartInput, UpdateQueueStatusInput } from '../validators/queue.validator';

/**
 * Queue cart service
 */

export const queueService = {
  /**
   * Get all queue carts
   */
  async getAllQueueCarts(status?: string) {
    const where = status ? { status: status as 'pending' | 'sent_to_cashier' } : {};

    return await prisma.queueCart.findMany({
      where,
      include: {
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get queue cart by ID
   */
  async getQueueCartById(id: string) {
    const cart = await prisma.queueCart.findUnique({
      where: { id },
      include: {
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      throw new Error('Queue cart not found');
    }

    return cart;
  },

  /**
   * Create new queue cart
   */
  async createQueueCart(data: CreateQueueCartInput) {
    // Calculate total
    let totalPrice = 0;
    for (const item of data.items) {
      totalPrice += item.price * item.quantity;
    }

    // Get assistant info
    const assistant = await prisma.user.findUnique({
      where: { id: data.assistantId },
      select: { name: true },
    });

    if (!assistant) {
      throw new Error('Assistant not found');
    }

    const cart = await prisma.queueCart.create({
      data: {
        assistantId: data.assistantId,
        assistantName: assistant.name,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        totalPrice,
        status: 'pending',
        items: {
          create: data.items,
        },
      },
      include: {
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // Emit socket event to cashier service room
    try {
      const io = getIO();
      io.to('cashier-service').emit('new-queue-cart', cart);
      console.log('📤 Socket event emitted: new-queue-cart');
    } catch (error) {
      console.error('Socket emit error:', error);
    }

    return cart;
  },

  /**
   * Update queue cart status
   */
  async updateQueueStatus(id: string, data: UpdateQueueStatusInput) {
    // Check if cart exists
    await this.getQueueCartById(id);

    // Build update data object
    const updateData: any = { 
      status: data.status,
    };
    
    // Add approvedBy if provided
    if (data.approvedBy) {
      updateData.approvedBy = data.approvedBy;
    }

    const updatedCart = await prisma.queueCart.update({
      where: { id },
      data: updateData,
      include: {
        assistant: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    // If status changed to 'sent_to_cashier', emit socket event
    if (data.status === 'sent_to_cashier') {
      try {
        const io = getIO();
        
        // Emit to specific role based on who approved
        if (data.approvedBy === 'admin') {
          // Admin tasdiqladi - admin Sales savatiga qo'shish + kassir navbatidan o'chirish
          io.to('admin-sales').emit('cart-approved-by-admin', updatedCart);
          io.to('kassir-sales').emit('remove-cart-from-queue', { cartId: id });
          console.log('📤 Socket event: cart-approved-by-admin');
        } else if (data.approvedBy === 'kassir') {
          // Kassir tasdiqladi - kassir Sales savatiga qo'shish + admin navbatidan o'chirish
          io.to('kassir-sales').emit('cart-approved-by-kassir', updatedCart);
          io.to('admin-sales').emit('remove-cart-from-queue', { cartId: id });
          console.log('📤 Socket event: cart-approved-by-kassir');
        }
      } catch (error) {
        console.error('Socket emit error:', error);
      }
    }

    return updatedCart;
  },

  /**
   * Delete queue cart
   */
  async deleteQueueCart(id: string) {
    // Check if cart exists
    await this.getQueueCartById(id);

    return await prisma.queueCart.delete({
      where: { id },
    });
  },

  /**
   * Get queue carts by assistant
   */
  async getQueueCartsByAssistant(assistantId: string) {
    return await prisma.queueCart.findMany({
      where: { assistantId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  },
};
