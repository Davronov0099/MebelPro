import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateUsers() {
  console.log('🔄 Updating user emails...');

  try {
    // Update admin
    await prisma.user.updateMany({
      where: { email: 'admin@mebel.uz' },
      data: { email: 'admin01' },
    });
    console.log('✅ Updated admin email');

    // Update kassir
    await prisma.user.updateMany({
      where: { email: 'kassir@mebel.uz' },
      data: { email: 'kassir01' },
    });
    console.log('✅ Updated kassir email');

    // Update yordamchi
    await prisma.user.updateMany({
      where: { email: 'yordamchi@mebel.uz' },
      data: { email: 'yordamchi01' },
    });
    console.log('✅ Updated yordamchi email');

    // Update omborchi
    await prisma.user.updateMany({
      where: { email: 'omborchi@mebel.uz' },
      data: { email: 'omborchi01' },
    });
    console.log('✅ Updated omborchi email');

    console.log('✅ All users updated successfully!');
  } catch (error) {
    console.error('❌ Error updating users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateUsers();
