import axios from 'axios';

/**
 * API Configuration
 */
const API_BASE_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Don't redirect on login endpoint 401 errors
    const isLoginEndpoint = error.config?.url?.includes('/auth/login');
    
    if (error.response?.status === 401 && !isLoginEndpoint) {
      // Token expired or invalid (but not login failure)
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

/**
 * API Types
 */
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'kassir' | 'yordamchi' | 'omborchi';
  createdAt: string;
}

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  image?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QueueCartItem {
  id: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
}

export interface QueueCart {
  id: string;
  assistantId: string;
  total: number;
  status: 'pending' | 'sent_to_cashier';
  customerName?: string;
  customerPhone?: string;
  createdAt: string;
  assistant: {
    id: string;
    name: string;
    email: string;
  };
  items: QueueCartItem[];
}

export interface SaleItem {
  id: string;
  saleId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  createdAt: string;
}

export interface Sale {
  id: string;
  saleNumber: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  paymentType?: 'cash' | 'card' | 'debt';
  sellerId: string;
  sellerName: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    email: string;
  };
  items: SaleItem[];
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  product: Product;
  createdAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  totalPrice: number;
  deliveryType: 'courier' | 'pickup';
  address?: string;
  status: 'new' | 'preparing' | 'ready' | 'onway' | 'delivered';
  createdAt: string;
  updatedAt: string;
  items: OrderItem[];
}

/**
 * Auth API
 */
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (data: { email: string; password: string; name: string; role: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

/**
 * Products API
 */
export const productsAPI = {
  getAll: async (search?: string) => {
    const response = await api.get<{ success: boolean; data: Product[] }>(
      '/products',
      { params: { search } }
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return response.data.data;
  },

  create: async (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const response = await api.post<{ success: boolean; data: Product }>('/products', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    const response = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  updateQuantity: async (id: string, quantity: number) => {
    const response = await api.patch<{ success: boolean; data: Product }>(
      `/products/${id}/quantity`,
      { quantity }
    );
    return response.data.data;
  },
};

/**
 * Queue Carts API
 */
export const queueAPI = {
  getAll: async (status?: string) => {
    const response = await api.get<{ success: boolean; data: QueueCart[] }>(
      '/queue',
      { params: { status } }
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: QueueCart }>(`/queue/${id}`);
    return response.data.data;
  },

  create: async (data: {
    assistantId: string;
    items: { productId: string; quantity: number; price: number }[];
    customerName?: string;
    customerPhone?: string;
  }) => {
    const response = await api.post<{ success: boolean; data: QueueCart }>('/queue', data);
    return response.data.data;
  },

  updateStatus: async (id: string, status: QueueCart['status'], approvedBy?: 'admin' | 'kassir') => {
    const response = await api.patch<{ success: boolean; data: QueueCart }>(
      `/queue/${id}/status`,
      { status, approvedBy }
    );
    return response.data.data;
  },

  delete: async (id: string) => {
    const response = await api.delete(`/queue/${id}`);
    return response.data;
  },

  getByAssistant: async (assistantId: string) => {
    const response = await api.get<{ success: boolean; data: QueueCart[] }>(
      `/queue/assistant/${assistantId}`
    );
    return response.data.data;
  },
};

/**
 * Sales API
 */
export const salesAPI = {
  getAll: async (filters?: { startDate?: string; endDate?: string; sellerId?: string }) => {
    const response = await api.get<{ success: boolean; data: Sale[] }>(
      '/sales',
      { params: filters }
    );
    return response.data.data;
  },

  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Sale }>(`/sales/${id}`);
    return response.data.data;
  },

  create: async (data: {
    customerName: string;
    customerPhone: string;
    paymentType?: 'cash' | 'card' | 'debt';
    items: { productId: string; quantity: number; price: number }[];
  }) => {
    const response = await api.post<{ success: boolean; data: Sale }>('/sales', data);
    return response.data.data;
  },

  getStats: async (filters?: { startDate?: string; endDate?: string }) => {
    const response = await api.get<{ 
      success: boolean; 
      data: {
        totalSales: number;
        totalRevenue: number;
        salesBySeller: Array<{
          sellerId: string;
          sellerName: string;
          _count: { id: number };
          _sum: { totalPrice: number | null };
        }>;
      }
    }>(
      '/sales/stats',
      { params: filters }
    );
    return response.data.data;
  },
};

/**
 * Orders API (PUBLIC - no auth required for shop customers)
 */
export const ordersAPI = {
  // PUBLIC: Create order from shop
  create: async (data: {
    customerName: string;
    customerPhone: string;
    deliveryType: 'courier' | 'pickup';
    address?: string;
    items: { productId: string; quantity: number; price: number }[];
  }) => {
    const response = await api.post<{ success: boolean; data: Order }>('/orders', data);
    return response.data.data;
  },

  // PUBLIC: Get orders by customer phone
  getByCustomerPhone: async (phone: string) => {
    const response = await api.get<{ success: boolean; data: Order[] }>(
      `/orders/customer/${phone}`
    );
    return response.data.data;
  },

  // ADMIN: Get all orders
  getAll: async (filters?: { 
    startDate?: string; 
    endDate?: string; 
    status?: string;
    customerPhone?: string;
  }) => {
    const response = await api.get<{ success: boolean; data: Order[] }>(
      '/orders',
      { params: filters }
    );
    return response.data.data;
  },

  // ADMIN: Get order by ID
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: Order }>(`/orders/${id}`);
    return response.data.data;
  },

  // ADMIN: Update order status
  updateStatus: async (id: string, status: Order['status']) => {
    const response = await api.patch<{ success: boolean; data: Order }>(
      `/orders/${id}/status`,
      { status }
    );
    return response.data.data;
  },
};

/**
 * Users API
 */
export const usersAPI = {
  // Get all users
  getAll: async () => {
    const response = await api.get<{ success: boolean; data: User[] }>('/users');
    return response.data.data;
  },

  // Get user by ID
  getById: async (id: string) => {
    const response = await api.get<{ success: boolean; data: User }>(`/users/${id}`);
    return response.data.data;
  },

  // Create new user
  create: async (data: { name: string; email: string; password: string; role: User['role'] }) => {
    const response = await api.post<{ success: boolean; data: User }>('/users', data);
    return response.data.data;
  },

  // Update user
  update: async (id: string, data: { name?: string; email?: string; password?: string; role?: User['role'] }) => {
    const response = await api.put<{ success: boolean; data: User }>(`/users/${id}`, data);
    return response.data.data;
  },

  // Delete user
  delete: async (id: string) => {
    const response = await api.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};
