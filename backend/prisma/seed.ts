import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.util';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // ============================================
  // USERS
  // ============================================
  console.log('Creating users...');

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin01' },
      update: {},
      create: {
        name: 'Admin',
        email: 'admin01',
        password: await hashPassword('admin123'),
        role: 'admin',
      },
    }),
    prisma.user.upsert({
      where: { email: 'kassir01' },
      update: {},
      create: {
        name: 'Kassir',
        email: 'kassir01',
        password: await hashPassword('kassir123'),
        role: 'kassir',
      },
    }),
    prisma.user.upsert({
      where: { email: 'yordamchi01' },
      update: {},
      create: {
        name: 'Yordamchi',
        email: 'yordamchi01',
        password: await hashPassword('yordamchi123'),
        role: 'yordamchi',
      },
    }),
    prisma.user.upsert({
      where: { email: 'omborchi01' },
      update: {},
      create: {
        name: 'Omborchi',
        email: 'omborchi01',
        password: await hashPassword('omborchi123'),
        role: 'omborchi',
      },
    }),
  ]);

  console.log(`✅ Created ${users.length} users`);

  // ============================================
  // PRODUCTS
  // ============================================
  console.log('Creating products...');

  const products = await Promise.all([
    prisma.product.upsert({
      where: { code: '001' },
      update: {},
      create: {
        code: '001',
        name: 'Premium Divan "Comfort"',
        category: 'Divanlar',
        image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        costPrice: 2800000,
        salePrice: 4500000,
        quantity: 8,
        description: 'Yumshoq va qulay premium divan. 3 kishilik, zamonaviy dizayn.',
      },
    }),
    prisma.product.upsert({
      where: { code: '002' },
      update: {},
      create: {
        code: '002',
        name: 'Yog\'och Stol "Classic"',
        category: 'Stollar',
        image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=300&fit=crop',
        costPrice: 1200000,
        salePrice: 1950000,
        quantity: 15,
        description: 'Natural yog\'ochdan tayyorlangan klassik oshxona stoli.',
      },
    }),
    prisma.product.upsert({
      where: { code: '003' },
      update: {},
      create: {
        code: '003',
        name: 'Ergonomik Stul "Office Pro"',
        category: 'Stullar',
        image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop',
        costPrice: 800000,
        salePrice: 1350000,
        quantity: 22,
        description: 'Ofis uchun ergonomik stul, bel qo\'llab-quvvatlash bilan.',
      },
    }),
    prisma.product.upsert({
      where: { code: '004' },
      update: {},
      create: {
        code: '004',
        name: 'Shkaf "Grand"',
        category: 'Shkaflar',
        image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop',
        costPrice: 3500000,
        salePrice: 5200000,
        quantity: 5,
        description: 'Katta hajmli 3 eshikli shkaf, oyna bilan.',
      },
    }),
    prisma.product.upsert({
      where: { code: '005' },
      update: {},
      create: {
        code: '005',
        name: 'Karavot "Royal Sleep"',
        category: 'Karavotlar',
        image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop',
        costPrice: 4200000,
        salePrice: 6800000,
        quantity: 3,
        description: 'Premium karavot, ortopedik matras bilan.',
      },
    }),
    prisma.product.upsert({
      where: { code: '006' },
      update: {},
      create: {
        code: '006',
        name: 'Kofe Stoli "Mini"',
        category: 'Stollar',
        image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=300&fit=crop',
        costPrice: 450000,
        salePrice: 750000,
        quantity: 18,
        description: 'Zamonaviy kofe stoli, metall oyoqlar bilan.',
      },
    }),
    prisma.product.upsert({
      where: { code: '007' },
      update: {},
      create: {
        code: '007',
        name: 'Kreslo "Relax"',
        category: 'Divanlar',
        image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
        costPrice: 1800000,
        salePrice: 2900000,
        quantity: 12,
        description: 'Dam olish uchun qulay kreslo.',
      },
    }),
    prisma.product.upsert({
      where: { code: '008' },
      update: {},
      create: {
        code: '008',
        name: 'Kitob Javoni "Smart"',
        category: 'Shkaflar',
        image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop',
        costPrice: 900000,
        salePrice: 1450000,
        quantity: 9,
        description: '5 qavatli kitob javoni, zamonaviy dizayn.',
      },
    }),
  ]);

  console.log(`✅ Created ${products.length} products`);

  // ============================================
  // EMPLOYEES
  // ============================================
  console.log('Creating employees...');

  const employees = await Promise.all([
    prisma.employee.upsert({
      where: { id: 'E1' },
      update: {},
      create: {
        id: 'E1',
        name: 'Bobur Aliyev',
        phone: '+998901112233',
        address: 'Toshkent, Sergeli',
        salary: 3500000,
        hireDate: new Date('2023-06-15'),
        status: 'active',
      },
    }),
    prisma.employee.upsert({
      where: { id: 'E2' },
      update: {},
      create: {
        id: 'E2',
        name: 'Dilnoza Karimova',
        phone: '+998937778899',
        address: 'Toshkent, Mirzo Ulugbek',
        salary: 4200000,
        hireDate: new Date('2022-01-10'),
        status: 'active',
      },
    }),
    prisma.employee.upsert({
      where: { id: 'E3' },
      update: {},
      create: {
        id: 'E3',
        name: 'Jasur Rahmatov',
        phone: '+998881234567',
        address: 'Toshkent, Yakkasaroy',
        salary: 3000000,
        hireDate: new Date('2024-03-01'),
        status: 'rest',
      },
    }),
  ]);

  console.log(`✅ Created ${employees.length} employees`);

  console.log('');
  console.log('✅ Seeding completed successfully!');
  console.log('');
  console.log('📝 Test credentials:');
  console.log('   Admin:     admin01 / admin123');
  console.log('   Kassir:    kassir01 / kassir123');
  console.log('   Yordamchi: yordamchi01 / yordamchi123');
  console.log('   Omborchi:  omborchi01 / omborchi123');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
