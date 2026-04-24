import express, { Application } from 'express';
import cors from 'cors';
import { config } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import productRoutes from './routes/product.routes';
import queueRoutes from './routes/queue.routes';
import saleRoutes from './routes/sale.routes';
import orderRoutes from './routes/order.routes';
import userRoutes from './routes/user.routes';

/**
 * Create Express application
 */
export const createApp = (): Application => {
  const app = express();

  // ============================================
  // MIDDLEWARE
  // ============================================

  // CORS
  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, Postman)
        if (!origin) return callback(null, true);

        // In development: allow any localhost port
        if (config.isDevelopment && /^http:\/\/localhost(:\d+)?$/.test(origin)) {
          return callback(null, true);
        }

        // In production: only allow configured FRONTEND_URL
        if (origin === config.cors.origin) {
          return callback(null, true);
        }

        callback(new Error(`CORS: ${origin} ruxsat etilmagan`));
      },
      credentials: true,
    })
  );

  // Body parser
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Request logging (development only)
  if (config.isDevelopment) {
    app.use((req, _res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // ============================================
  // ROUTES
  // ============================================

  // Root route
  app.get('/', (_req, res) => {
    res.json({
      success: true,
      message: 'MebelPro Backend API',
      version: '1.0.0',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
      },
    });
  });

  // Health check
  app.get('/health', (_req, res) => {
    res.json({
      success: true,
      message: 'MebelPro API is running',
      timestamp: new Date().toISOString(),
    });
  });

  // API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/products', productRoutes);
  app.use('/api/queue', queueRoutes);
  app.use('/api/sales', saleRoutes);
  app.use('/api/orders', orderRoutes);
  app.use('/api/users', userRoutes);

  // TODO: Add more routes
  // app.use('/api/employees', employeeRoutes);
  // app.use('/api/customers', customerRoutes);
  // app.use('/api/activity', activityRoutes);
  // app.use('/api/sessions', sessionRoutes);

  // ============================================
  // ERROR HANDLING
  // ============================================

  // 404 handler
  app.use(notFoundHandler);

  // Global error handler
  app.use(errorHandler);

  return app;
};
