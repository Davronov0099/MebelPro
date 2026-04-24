# MEBELPRO LOYIHASI - TO'LIQ TAHLIL HISOBOTI

## 📋 UMUMIY MA'LUMOT

### Loyiha nomi
**MebelPro** - Mebel do'koni boshqaruv tizimi

### Texnologiyalar

**Frontend:**
- React 18.3.1 + TypeScript
- Vite (build tool)
- TailwindCSS + shadcn/ui
- Framer Motion (animatsiyalar)
- Zustand (state management)
- React Router v6
- Axios (HTTP client)
- Socket.IO Client (real-time)
- Recharts (grafiklar)
- Zod (validation)

**Backend:**
- Node.js + Express.js
- TypeScript
- PostgreSQL 15+
- Prisma ORM
- JWT + bcrypt (authentication)
- Socket.IO (real-time)
- Zod (validation)

### Arxitektura
- **Frontend:** SPA (Single Page Application)
- **Backend:** RESTful API + WebSocket
- **Database:** PostgreSQL (relational)
- **Authentication:** JWT token-based
- **Real-time:** Socket.IO

### Portlar
- Frontend: `http://localhost:8080`
- Backend: `http://localhost:5000`

---

## 🗄️ MA'LUMOTLAR BAZASI STRUKTURASI

### 1. Users (Foydalanuvchilar)
```prisma
model User {
  id        String   @id @default(uuid())
  name      String
  email     String   @unique
  password  String   (bcrypt hashed)
  role      UserRole (admin, kassir, yordamchi, omborchi)
  createdAt DateTime
  updatedAt DateTime
}
```

**Test foydalanuvchilar:**
- admin01 / admin123
- kassir01 / kassir123
- yordamchi01 / yordamchi123
- omborchi01 / omborchi123

### 2. Products (Mahsulotlar)
```prisma
model Product {
  id          String
  code        String   @unique
  name        String
  category    String
  image       String
  costPrice   Decimal  (tan narxi)
  salePrice   Decimal  (sotuv narxi)
  quantity    Int      (miqdor)
  description String
}
```

**Kategoriyalar:** Divanlar, Stollar, Stullar, Shkaflar, Karavotlar, Boshqa

### 3. Sales (Savdolar)
```prisma
model Sale {
  id            String
  saleNumber    String   @unique (S260322-0001 format)
  customerName  String
  customerPhone String
  totalPrice    Decimal
  sellerId      String
  sellerName    String
  createdAt     DateTime
  items         SaleItem[]
}
```

### 4. QueueCart (Navbat savatlari)
```prisma
model QueueCart {
  id            String
  assistantId   String
  assistantName String
  customerName  String?
  customerPhone String?
  totalPrice    Decimal
  status        QueueCartStatus (pending, sent_to_cashier)
  items         QueueCartItem[]
}
```

### 5. Orders (Buyurtmalar)
```prisma
model Order {
  id            String
  orderNumber   String   @unique
  customerName  String
  customerPhone String
  totalPrice    Decimal
  deliveryType  DeliveryType (courier, pickup)
  address       String?
  status        OrderStatus (new, preparing, ready, onway, delivered)
  items         OrderItem[]
}
```

### 6. Employees (Xodimlar)
```prisma
model Employee {
  id        String
  name      String
  phone     String
  address   String
  salary    Decimal
  hireDate  DateTime
  status    EmployeeStatus (active, rest, sick)
}
```

### 7. ActivityLog (Faoliyat jurnali)
```prisma
model ActivityLog {
  id        String
  userId    String
  userName  String
  userEmail String
  action    String
  details   String
  type      ActivityLogType (login, logout, order, cart, view, other)
}
```

### 8. UserSession (Foydalanuvchi seanslari)
```prisma
model UserSession {
  id         String
  userId     String
  userName   String
  userEmail  String
  loginTime  DateTime
  logoutTime DateTime?
}
```
