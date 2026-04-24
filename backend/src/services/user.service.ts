import { prisma } from '../config/database';
import { hashPassword } from '../utils/password.util';
import { CreateUserInput, UpdateUserInput } from '../validators/user.validator';

/**
 * User service - handles user management
 */

export const userService = {
  /**
   * Get all users
   */
  async getAllUsers() {
    return await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  },

  /**
   * Create new user
   */
  async createUser(data: CreateUserInput) {
    // Check if email already exists
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new Error('Bu email allaqachon mavjud');
    }

    // Hash password
    const hashedPassword = await hashPassword(data.password);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        role: data.role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  /**
   * Update user
   */
  async updateUser(id: string, data: UpdateUserInput) {
    // Check if user exists
    await this.getUserById(id);

    // If updating email, check if new email already exists
    if (data.email) {
      const existing = await prisma.user.findFirst({
        where: {
          email: data.email,
          NOT: { id },
        },
      });

      if (existing) {
        throw new Error('Bu email allaqachon mavjud');
      }
    }

    // Prepare update data
    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.email) updateData.email = data.email;
    if (data.role) updateData.role = data.role;
    if (data.password) {
      updateData.password = await hashPassword(data.password);
    }

    // Update user
    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  },

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    // Check if user exists
    await this.getUserById(id);

    // Delete user
    await prisma.user.delete({
      where: { id },
    });

    return { message: 'User deleted successfully' };
  },
};
