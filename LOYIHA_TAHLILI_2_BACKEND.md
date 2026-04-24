# BACKEND API TAHLILI

## 📁 BACKEND STRUKTURA

```
backend/
├── src/
│   ├── config/          # Konfiguratsiya fayllari
│   │   ├── database.ts  # Prisma client
│   │   ├── env.ts       # Environment variables
│   │   └── socket.ts    # Socket.IO konfiguratsiyasi
│   ├── controllers/     # API controller'lar
│   │   ├── auth.controller.ts
│   │   ├── product.controller.ts
│   │   ├── queue.controller.ts
│   │   └── sale.controller.ts
│   ├── middleware/      # Express middleware'lar
│   │   ├── auth.middleware.ts    # JWT tekshirish
│   │   ├── error.middleware.ts   # Xatoliklarni boshqarish
│   │   └── role.middleware.ts    # Rol tekshirish
│   ├── routes/          # API yo'nalishlari
│   │   ├── auth.routes.ts
│   │   ├── product.routes.ts
│   │   ├── queue.routes.ts
│   │   └── sale.routes.ts
│   ├── services/        # Biznes logika
│   │   ├── auth.service.ts
│   │   ├── product.service.ts
│   │   ├── queue.service.ts
│   │   └── sale.service.ts
│   ├── utils/           # Yordamchi funksiyalar
│   │   ├── jwt.util.ts
│   │   ├── password.util.ts
│   │   └── response.util.ts
│   ├── validators/      # Zod validation
│   │   ├── auth.validator.ts
│   │   ├── product.validator.ts
│   │   ├── queue.validator.ts
│   │   └── sale.validator.ts
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   ├── seed.ts          # Seed data
│   └── migrations/      # Database migrations
├── .env                 # Environment variables
└── package.json
```

## 🔐 AUTHENTICATION API

### POST /api/auth/login
**Kirish:** email, password
**Chiqish:** user, token
**Funksiya:** Foydalanuvchini tizimga kiritish

### GET /api/auth/me
**Header:** Authorization: Bearer <token>
**Chiqish:** user
**Funksiya:** Joriy foydalanuvchi ma'lumotlarini olish

### POST /api/auth/logout
**Header:** Authorization: Bearer <token>
**Funksiya:** Tizimdan chiqish

## 📦 PRODUCTS API

### GET /api/products
**Ruxsat:** Barcha rollar
**Chiqish:** products[]
**Funksiya:** Barcha mahsulotlarni olish

### POST /api/products
**Ruxsat:** admin
**Kirish:** code, name, category, image, costPrice, salePrice, quantity, description
**Chiqish:** product
**Funksiya:** Yangi mahsulot qo'shish

### PUT /api/products/:id
**Ruxsat:** admin
**Kirish:** Yangilanadigan maydonlar
**Chiqish:** product
**Funksiya:** Mahsulotni yangilash

### DELETE /api/products/:id
**Ruxsat:** admin
**Funksiya:** Mahsulotni o'chirish

### PATCH /api/products/:id/quantity
**Ruxsat:** admin, omborchi
**Kirish:** quantity
**Chiqish:** product
**Funksiya:** Mahsulot miqdorini yangilash

## 🛒 QUEUE CARTS API (Navbat savatlari)

### GET /api/queue-carts
**Ruxsat:** admin, kassir
**Chiqish:** queueCarts[]
**Funksiya:** Barcha navbat savatlarini olish

### POST /api/queue-carts
**Ruxsat:** yordamchi
**Kirish:** items[], customerName?, customerPhone?
**Chiqish:** queueCart
**Funksiya:** Yangi navbat savati yaratish
**Socket Event:** 'new-cart' (admin va kassir'ga yuboriladi)

### PATCH /api/queue-carts/:id/status
**Ruxsat:** admin, kassir
**Kirish:** status (sent_to_cashier)
**Chiqish:** queueCart
**Funksiya:** Navbat savati statusini yangilash
**Socket Event:** 'cart-approved' (kassir'ga yuboriladi)

## 💰 SALES API

### GET /api/sales
**Ruxsat:** admin, kassir
**Query:** startDate?, endDate?, sellerId?
**Chiqish:** sales[]
**Funksiya:** Savdolarni olish (filter bilan)

### GET /api/sales/:id
**Ruxsat:** admin, kassir
**Chiqish:** sale
**Funksiya:** Bitta savdoni olish

### POST /api/sales
**Ruxsat:** admin, kassir
**Kirish:** customerName, customerPhone, items[]
**Chiqish:** sale
**Funksiya:** Yangi savdo yaratish
**Avtomatik:**
- Savdo raqami generatsiya (S260322-0001)
- Mahsulot miqdorini kamaytirish
- Transaction bilan atomik operatsiya

### GET /api/sales/stats
**Ruxsat:** admin
**Query:** startDate?, endDate?
**Chiqish:** totalRevenue, totalSales, salesBySeller[]
**Funksiya:** Savdo statistikasini olish

## 🔌 SOCKET.IO EVENTS

### Server → Client

**new-cart**
- **Qachon:** Yordamchi yangi savat yaratganda
- **Kimga:** admin va kassir
- **Data:** queueCart

**cart-approved**
- **Qachon:** Admin/Kassir savatni tasdiqlasa
- **Kimga:** kassir
- **Data:** queueCart

### Client → Server

**join-room**
- **Kirish:** roomName
- **Funksiya:** Foydalanuvchini xonaga qo'shish
- **Xonalar:** 
  - 'cashier-service' (admin, kassir)
  - 'admin' (admin)
  - 'kassir' (kassir)
  - 'yordamchi' (yordamchi)

## 🛡️ MIDDLEWARE

### authMiddleware
- JWT tokenni tekshirish
- req.user ga foydalanuvchi ma'lumotlarini qo'shish
- Token yo'q yoki noto'g'ri bo'lsa 401 qaytarish

### authorize(...roles)
- Foydalanuvchi rolini tekshirish
- Ruxsat yo'q bo'lsa 403 qaytarish

### errorMiddleware
- Barcha xatoliklarni ushlash
- Standart format bilan javob qaytarish
- Development rejimida stack trace ko'rsatish

## 📊 BIZNES LOGIKA

### Sale Number Generation
```typescript
Format: S{YYMMDD}-{XXXX}
Misol: S260322-0001
- S: Sale prefiksi
- 260322: 2026 yil 03 oy 22 kun
- 0001: Kun ichidagi tartib raqami
```

### Product Quantity Management
- Savdo yaratilganda avtomatik kamaytirish
- Transaction bilan atomik operatsiya
- Miqdor yetarli emasligini tekshirish

### Real-time Notifications
- Yordamchi savat yaratsa → Admin/Kassir ko'radi
- Admin/Kassir tasdiqlasa → Kassir savatiga qo'shiladi
- Socket.IO orqali real-time yangilanish
