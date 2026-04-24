import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🗑️  Clearing old users and related data...');

  // Delete in correct order (child tables first)
  await prisma.activityLog.deleteMany({});
  console.log('✅ Deleted activity logs');
  
  await prisma.userSession.deleteMany({});
  console.log('✅ Deleted user sessions');
  
  const deleted = await prisma.user.deleteMany({});
  console.log(`✅ Deleted ${deleted.count} users`);
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
