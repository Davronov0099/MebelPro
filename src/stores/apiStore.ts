import { create } from 'zustand';
import { authAPI, productsAPI, queueAPI, salesAPI, ordersAPI, usersAPI, User, Product, QueueCart, Sale, Order } from '../services/api';
import { initializeSocket, disconnectSocket } from '../services/socket';

/**
 * API-integrated Zustand Store
 */

interface ApiState {
  // Auth state
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;

  // Products state
  products: Product[];
  productsLoading: boolean;

  // Queue carts state
  queueCarts: QueueCart[];
  queueLoading: boolean;

  // Sales state
  sales: Sale[];
  salesLoading: boolean;

  // Orders state (for shop customers)
  orders: Order[];
  ordersLoading: boolean;

  // Users state
  users: User[];
  usersLoading: boolean;

  // Cart state (local only, not persisted to backend)
  cart: Array<{ product: Product; quantity: number }>;

  // Theme & Language
  theme: 'light' | 'dark';
  language: 'uz' | 'ru' | 'en';

  // Auth actions
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<void>;

  // Products actions
  fetchProducts: (search?: string) => Promise<void>;
  createProduct: (data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateProduct: (id: string, data: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  updateProductQuantity: (id: string, quantity: number) => Promise<void>;

  // Queue actions
  fetchQueueCarts: (status?: string) => Promise<void>;
  createQueueCart: (assistantId: string, items: Array<{ productId: string; quantity: number; price: number }>, customerName?: string, customerPhone?: string) => Promise<void>;
  updateQueueStatus: (id: string, status: QueueCart['status'], approvedBy?: 'admin' | 'kassir') => Promise<void>;
  deleteQueueCart: (id: string) => Promise<void>;

  // Sales actions
  fetchSales: (filters?: { startDate?: string; endDate?: string; sellerId?: string }) => Promise<void>;
  createSale: (data: { customerName: string; customerPhone: string; paymentType?: 'cash' | 'card' | 'debt'; items: Array<{ productId: string; quantity: number; price: number }> }) => Promise<Sale>;
  fetchSalesStats: (filters?: { startDate?: string; endDate?: string }) => Promise<any>;

  // Orders actions (for shop customers)
  createOrder: (data: { customerName: string; customerPhone: string; deliveryType: 'courier' | 'pickup'; address?: string; items: Array<{ productId: string; quantity: number; price: number }> }) => Promise<Order>;
  fetchOrdersByPhone: (phone: string) => Promise<void>;

  // Users actions
  fetchUsers: () => Promise<void>;
  createUser: (data: { name: string; email: string; password: string; role: User['role'] }) => Promise<void>;
  updateUser: (id: string, data: { name?: string; email?: string; password?: string; role?: User['role'] }) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;

  // Cart actions (local)
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;

  // Settings actions
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
}

export const useApiStore = create<ApiState>((set, get) => ({
  // Initial state
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  token: localStorage.getItem('token'),
  isAuthenticated: !!localStorage.getItem('token'),
  products: [],
  productsLoading: false,
  queueCarts: [],
  queueLoading: false,
  sales: [],
  salesLoading: false,
  orders: [],
  ordersLoading: false,
  users: [],
  usersLoading: false,
  cart: [],
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'dark',
  language: (localStorage.getItem('language') as 'uz' | 'ru' | 'en') || 'uz',

  // Auth actions
  login: async (email: string, password: string) => {
    try {
      const response = await authAPI.login(email, password);
      
      if (response.success) {
        const { user, token } = response.data;
        
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        
        set({
          user,
          token,
          isAuthenticated: true,
        });
        
        // Initialize socket connection
        initializeSocket(user.role);
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    
    // Disconnect socket
    disconnectSocket();
    
    set({
      user: null,
      token: null,
      isAuthenticated: false,
      cart: [],
    });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    try {
      const response = await authAPI.me();
      if (response.success) {
        set({ user: response.data, isAuthenticated: true });
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      get().logout();
    }
  },

  // Products actions
  fetchProducts: async (search?: string) => {
    set({ productsLoading: true });
    try {
      const products = await productsAPI.getAll(search);
      set({ products, productsLoading: false });
    } catch (error) {
      console.error('Fetch products error:', error);
      set({ productsLoading: false });
    }
  },

  createProduct: async (data) => {
    try {
      const newProduct = await productsAPI.create(data);
      set((state) => ({
        products: [...state.products, newProduct],
      }));
    } catch (error) {
      console.error('Create product error:', error);
      throw error;
    }
  },

  updateProduct: async (id, data) => {
    try {
      const updatedProduct = await productsAPI.update(id, data);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
      }));
    } catch (error) {
      console.error('Update product error:', error);
      throw error;
    }
  },

  deleteProduct: async (id) => {
    try {
      await productsAPI.delete(id);
      set((state) => ({
        products: state.products.filter((p) => p.id !== id),
      }));
    } catch (error) {
      console.error('Delete product error:', error);
      throw error;
    }
  },

  updateProductQuantity: async (id, quantity) => {
    try {
      const updatedProduct = await productsAPI.updateQuantity(id, quantity);
      set((state) => ({
        products: state.products.map((p) => (p.id === id ? updatedProduct : p)),
      }));
    } catch (error) {
      console.error('Update quantity error:', error);
      throw error;
    }
  },

  // Queue actions
  fetchQueueCarts: async (status?: string) => {
    set({ queueLoading: true });
    try {
      const queueCarts = await queueAPI.getAll(status);
      set({ queueCarts, queueLoading: false });
    } catch (error) {
      console.error('Fetch queue carts error:', error);
      set({ queueLoading: false });
    }
  },

  createQueueCart: async (assistantId, items, customerName, customerPhone) => {
    try {
      const newCart = await queueAPI.create({ 
        assistantId, 
        items,
        customerName,
        customerPhone,
      });
      set((state) => ({
        queueCarts: [...state.queueCarts, newCart],
      }));
    } catch (error) {
      console.error('Create queue cart error:', error);
      throw error;
    }
  },

  updateQueueStatus: async (id, status, approvedBy) => {
    try {
      const updatedCart = await queueAPI.updateStatus(id, status, approvedBy);
      set((state) => ({
        queueCarts: state.queueCarts.map((c) => (c.id === id ? updatedCart : c)),
      }));
    } catch (error) {
      console.error('Update queue status error:', error);
      throw error;
    }
  },

  deleteQueueCart: async (id) => {
    try {
      await queueAPI.delete(id);
      set((state) => ({
        queueCarts: state.queueCarts.filter((c) => c.id !== id),
      }));
    } catch (error) {
      console.error('Delete queue cart error:', error);
      throw error;
    }
  },

  // Sales actions
  fetchSales: async (filters) => {
    set({ salesLoading: true });
    try {
      const sales = await salesAPI.getAll(filters);
      set({ sales, salesLoading: false });
    } catch (error) {
      console.error('Fetch sales error:', error);
      set({ salesLoading: false });
    }
  },

  createSale: async (data) => {
    try {
      const newSale = await salesAPI.create(data);
      set((state) => ({
        sales: [newSale, ...state.sales],
      }));
      return newSale;
    } catch (error) {
      console.error('Create sale error:', error);
      throw error;
    }
  },

  fetchSalesStats: async (filters) => {
    try {
      const stats = await salesAPI.getStats(filters);
      return stats;
    } catch (error) {
      console.error('Fetch sales stats error:', error);
      throw error;
    }
  },

  // Orders actions (for shop customers)
  createOrder: async (data) => {
    try {
      const newOrder = await ordersAPI.create(data);
      set((state) => ({
        orders: [newOrder, ...state.orders],
      }));
      return newOrder;
    } catch (error) {
      console.error('Create order error:', error);
      throw error;
    }
  },

  fetchOrdersByPhone: async (phone) => {
    set({ ordersLoading: true });
    try {
      const orders = await ordersAPI.getByCustomerPhone(phone);
      set({ orders, ordersLoading: false });
    } catch (error) {
      console.error('Fetch orders error:', error);
      set({ ordersLoading: false });
    }
  },

  // Cart actions (local)
  addToCart: (product, quantity) => {
    set((state) => {
      const existingItem = state.cart.find((item) => item.product.id === product.id);
      
      if (existingItem) {
        return {
          cart: state.cart.map((item) =>
            item.product.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          ),
        };
      }
      
      return {
        cart: [...state.cart, { product, quantity }],
      };
    });
  },

  removeFromCart: (productId) => {
    set((state) => ({
      cart: state.cart.filter((item) => item.product.id !== productId),
    }));
  },

  updateCartQuantity: (productId, quantity) => {
    set((state) => ({
      cart: state.cart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      ),
    }));
  },

  clearCart: () => {
    set({ cart: [] });
  },

  // Settings actions
  setTheme: (theme) => {
    localStorage.setItem('theme', theme);
    set({ theme });
  },

  setLanguage: (language) => {
    localStorage.setItem('language', language);
    set({ language });
  },

  // Users actions
  fetchUsers: async () => {
    set({ usersLoading: true });
    try {
      const users = await usersAPI.getAll();
      set({ users, usersLoading: false });
    } catch (error) {
      console.error('Failed to fetch users:', error);
      set({ usersLoading: false });
      throw error;
    }
  },

  createUser: async (data) => {
    try {
      await usersAPI.create(data);
      await get().fetchUsers();
    } catch (error) {
      console.error('Failed to create user:', error);
      throw error;
    }
  },

  updateUser: async (id, data) => {
    try {
      await usersAPI.update(id, data);
      await get().fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  },

  deleteUser: async (id) => {
    try {
      await usersAPI.delete(id);
      await get().fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
}));
