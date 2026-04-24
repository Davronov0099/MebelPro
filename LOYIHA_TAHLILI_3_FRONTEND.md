# FRONTEND TAHLILI

## 📁 FRONTEND STRUKTURA

```
src/
├── components/
│   ├── ui/              # shadcn/ui komponentlari (50+ komponent)
│   ├── AdminLayout.tsx  # Admin panel layout
│   ├── NavLink.tsx      # Navigation link komponenti
│   └── ShopLayout.tsx   # Do'kon layout
├── hooks/
│   ├── use-mobile.tsx   # Mobile detection hook
│   └── use-toast.ts     # Toast notification hook
├── lib/
│   ├── translations.ts  # Tarjimalar (uz, ru, en)
│   └── utils.ts         # Yordamchi funksiyalar
├── pages/
│   ├── admin/           # Admin panel sahifalari
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── Orders.tsx (Sales History)
│   │   ├── Sales.tsx
│   │   ├── CashierQueue.tsx
│   │   ├── Assistant.tsx
│   │   ├── Employees.tsx
│   │   ├── Customers.tsx
│   │   ├── Warehouse.tsx
│   │   ├── Market.tsx
│   │   ├── Delivery.tsx
│   │   └── Messages.tsx
│   ├── shop/            # Do'kon sahifalari
│   │   ├── Catalog.tsx
│   │   ├── Cart.tsx
│   │   ├── Orders.tsx
│   │   ├── About.tsx
│   │   └── Account.tsx
│   ├── Index.tsx        # Bosh sahifa
│   ├── Login.tsx        # Kirish sahifasi
│   └── NotFound.tsx     # 404 sahifa
├── services/
│   ├── api.ts           # API client (Axios)
│   └── socket.ts        # Socket.IO client
├── stores/
│   ├── apiStore.ts      # API state management (Zustand)
│   └── store.ts         # Local state (eski, ishlatilmaydi)
├── App.tsx              # Main app component
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## 🎨 DIZAYN TIZIMI

### Ranglar (Light Mode)
- **Background:** #F5F5F5 (och kulrang)
- **Card:** #FFFFFF (oq)
- **Primary:** #1A1F2E (qora-ko'k)
- **Gold:** #D4AF37 (oltin)
- **Success:** #10B981 (yashil)
- **Warning:** #F59E0B (sariq)
- **Destructive:** #EF4444 (qizil)

### Ranglar (Dark Mode)
- **Background:** #141414 (qora)
- **Card:** #1F1F1F (qoramtir)
- **Foreground:** #F2F2F2 (och)

### Shriftlar
- **Font Family:** Inter (Google Fonts)
- **Weights:** 300, 400, 500, 600, 700, 800

### Animatsiyalar
- **Library:** Framer Motion
- **Transitions:** Smooth, 0.3s ease
- **Hover effects:** Scale, opacity
- **Page transitions:** Fade, slide

## 🔐 AUTHENTICATION FLOW

### Login Process
1. Foydalanuvchi login sahifasiga kiradi
2. Email va parol kiritadi
3. API ga POST /api/auth/login so'rovi yuboriladi
4. Token va user ma'lumotlari qaytadi
5. Token localStorage ga saqlanadi
6. Socket.IO connection ochiladi
7. Foydalanuvchi roliga qarab yo'naltiriladi

### Protected Routes
- Admin → /admin/*
- Kassir → /admin/sales, /admin/cashier-queue
- Yordamchi → /admin/assistant
- Omborchi → /admin/warehouse

### Logout Process
1. API ga POST /api/auth/logout so'rovi
2. localStorage dan token o'chiriladi
3. Socket.IO connection yopiladi
4. Login sahifasiga yo'naltiriladi

## 📄 SAHIFALAR TAHLILI

### 1. Dashboard (Bosh sahifa)
**Rol:** Admin
**Funksiyalar:**
- Bugungi savdo statistikasi
- Jami daromad
- Mahsulotlar soni
- Savdolar soni
- Haftalik savdo grafigi (LineChart)
- Sotuvchilar bo'yicha statistika
- Eng ko'p sotilgan mahsulotlar (BarChart)
- Oxirgi savdolar ro'yxati

**API Calls:**
- GET /api/products
- GET /api/sales
- GET /api/sales/stats

**Real-time:** Yo'q

### 2. Products (Mahsulotlar)
**Rol:** Admin
**Funksiyalar:**
- Mahsulotlar ro'yxati (jadval)
- Qidiruv (kod, nom, kategoriya)
- Mahsulot qo'shish (modal)
- Mahsulot tahrirlash (modal)
- Mahsulot o'chirish (tasdiqlash modali)
- Miqdor ko'rsatkichi (rang kodlari)

**API Calls:**
- GET /api/products
- POST /api/products
- PUT /api/products/:id
- DELETE /api/products/:id

**Real-time:** Yo'q

### 3. Sales (Savdo)
**Rol:** Admin, Kassir
**Funksiyalar:**
- Mahsulotlar grid (qidiruv bilan)
- Savat (o'ng tomonda)
- Mahsulot qo'shish (miqdor modali)
- Mijoz ma'lumotlari (ism, telefon)
- Mijoz tanlash (dropdown)
- QR kod to'lov modali
- Chek chop etish (avtomatik)
- Muvaffaqiyat modali

**API Calls:**
- GET /api/products
- POST /api/sales

**Real-time:** 
- Socket: 'cart-approved' (kassir uchun)
- Tasdiqlangan savatni avtomatik qo'shish

**Print Receipt:**
- Yangi oyna ochiladi
- Thermal printer uchun optimallashtirilgan
- Avtomatik print dialog

### 4. Orders (Savdolar tarixi)
**Rol:** Admin, Kassir
**Funksiyalar:**
- Barcha savdolar ro'yxati
- Qidiruv (savdo raqami, mijoz, telefon)
- Har bir savdo uchun:
  - Savdo raqami va sana
  - Mijoz ma'lumotlari
  - Mahsulotlar ro'yxati
  - Jami summa
  - Sotuvchi

**API Calls:**
- GET /api/sales

**Real-time:** Yo'q

### 5. CashierQueue (Kassa xizmati)
**Rol:** Admin, Kassir
**Funksiyalar:**
- Navbatdagi savatlar ro'yxati
- Har bir savat uchun:
  - Yordamchi nomi
  - Mijoz ma'lumotlari
  - Mahsulotlar ro'yxati
  - Jami summa
- Tasdiqlash tugmasi
- Rad etish tugmasi

**API Calls:**
- GET /api/queue-carts
- PATCH /api/queue-carts/:id/status

**Real-time:**
- Socket: 'new-cart' (yangi savat kelganda)
- Avtomatik ro'yxatni yangilash

### 6. Assistant (Yordamchi)
**Rol:** Yordamchi
**Funksiyalar:**
- Mahsulotlar grid
- Savat
- Mijoz tanlash
- Kassaga yuborish

**API Calls:**
- GET /api/products
- POST /api/queue-carts

**Real-time:**
- Socket: Savat yuborilganda 'new-cart' event

### 7. Employees (Xodimlar)
**Rol:** Admin
**Funksiya:** CRUD operatsiyalar
**Ma'lumotlar:** localStorage (API yo'q)

### 8. Customers (Mijozlar)
**Rol:** Admin
**Funksiya:** CRUD operatsiyalar
**Ma'lumotlar:** localStorage + orders dan (API yo'q)

### 9. Warehouse (Ombor)
**Rol:** Admin, Omborchi
**Funksiyalar:**
- Mahsulotlar ro'yxati
- Miqdor ko'rsatkichi (rang kodlari)
- Miqdor qo'shish (modal)
- Qidiruv

**API Calls:**
- GET /api/products
- PATCH /api/products/:id/quantity (kelgusida)

**Hozirgi holat:** localStorage (API integratsiya kerak)

### 10. Market (Bozor tahlili)
**Rol:** Admin
**Funksiya:** Bozor narxlari bilan taqqoslash
**Ma'lumotlar:** Mock data (API yo'q)

### 11. Delivery (Yetkazib berish)
**Rol:** Admin
**Funksiya:** Yetkazib berish buyurtmalarini boshqarish
**Ma'lumotlar:** localStorage (API yo'q)

### 12. Messages (Xabarlar)
**Rol:** Admin
**Funksiya:** Placeholder (ishlamaydi)
