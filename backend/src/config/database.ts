import { PrismaClient } from '@prisma/client';
import { config } from './env';

// Prisma Client instance
const prisma = new PrismaClient({
  log: config.isDevelopment ? ['query', 'error', 'warn'] : ['error'],
});

// Test database connection
export const connectDatabase = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

// Disconnect database
export const disconnectDatabase = async (): Promise<void> => {
  await prisma.$disconnect();
  console.log('👋 Database disconnected');
};

export { prisma };
