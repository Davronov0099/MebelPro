# MebelPro Backend API

Professional backend API for MebelPro furniture management system.

## 🚀 Tech Stack

- **Runtime:** Node.js v20+
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL 15+
- **ORM:** Prisma
- **Authentication:** JWT + bcrypt
- **Validation:** Zod

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- Node.js v20 or higher
- PostgreSQL 15 or higher
- npm or yarn or bun

## 🛠️ Installation

### 1. Install dependencies

```bash
npm install
```

### 2. Setup environment variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/mebelpro?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### 3. Setup PostgreSQL database

Create a new PostgreSQL database:

```sql
CREATE DATABASE mebelpro;
```

### 4. Run Prisma migrations

```bash
npm run prisma:migrate
```

### 5. Seed the database

```bash
npm run prisma:seed
```

## 🚀 Running the Server

### Development mode (with hot reload)

```bash
npm run dev
```

Server will start at: `http://localhost:5000`

### Production mode

```bash
npm run build
npm start
```

## 📚 API Documentation

### Base URL

```
http://localhost:5000/api
```

### Authentication Endpoints

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "admin@mebel.uz",
  "password": "admin123"
}
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@mebel.uz",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

#### Logout
```http
POST /api/auth/logout
Authorization: Bearer <token>
```

### Test Credentials

```
Admin:     admin@mebel.uz / admin123
Kassir:    kassir@mebel.uz / kassir123
Yordamchi: yordamchi@mebel.uz / yordamchi123
Omborchi:  omborchi@mebel.uz / omborchi123
```

## 🗄️ Database Schema

### Users
- id, name, email, password, role, created_at, updated_at

### Products
- id, code, name, category, image, cost_price, sale_price, quantity, description

### Orders
- id, order_number, customer_name, customer_phone, total_price, delivery_type, address, status

### Sales
- id, sale_number, customer_name, customer_phone, total_price, seller_id, seller_name

### Employees
- id, name, phone, address, salary, hire_date, status

### Queue Carts
- id, assistant_id, assistant_name, total_price, status

### Activity Logs
- id, user_id, user_name, user_email, action, details, type

### User Sessions
- id, user_id, user_name, user_email, login_time, logout_time

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## 🛡️ Role-Based Access Control

- **Admin:** Full access to all endpoints
- **Kassir:** Only sales endpoints
- **Yordamchi:** Only products (read) + queue endpoints
- **Omborchi:** Only products (read/update quantity)

## 📦 Project Structure

```
backend/
├── src/
│   ├── config/          # Configuration files
│   ├── controllers/     # Route controllers
│   ├── middleware/      # Express middleware
│   ├── routes/          # API routes
│   ├── services/        # Business logic
│   ├── utils/           # Utility functions
│   ├── validators/      # Request validation
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema
│   └── seed.ts          # Seed data
├── .env                 # Environment variables
├── package.json
└── tsconfig.json
```

## 🧪 Prisma Commands

```bash
# Generate Prisma Client
npm run prisma:generate

# Create migration
npm run prisma:migrate

# Open Prisma Studio (Database GUI)
npm run prisma:studio

# Seed database
npm run prisma:seed
```

## 🐛 Debugging

Enable detailed logging by setting in `.env`:

```env
NODE_ENV=development
```

## 📝 TODO

- [ ] Add Products API endpoints
- [ ] Add Orders API endpoints
- [ ] Add Sales API endpoints
- [ ] Add Employees API endpoints
- [ ] Add Customers API endpoints
- [ ] Add Queue Carts API endpoints
- [ ] Add Activity Logs API endpoints
- [ ] Add User Sessions API endpoints
- [ ] Add pagination
- [ ] Add search and filtering
- [ ] Add unit tests
- [ ] Add API documentation (Swagger)

## 📄 License

MIT
