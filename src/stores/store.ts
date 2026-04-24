import { create } from 'zustand';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  image: string;
  costPrice: number;
  salePrice: number;
  quantity: number;
  description: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalPrice: number;
  deliveryType: 'courier' | 'pickup';
  address?: string;
  status: 'new' | 'preparing' | 'ready' | 'onway' | 'delivered';
  createdAt: string;
  sellerName?: string;
}

export interface Sale {
  id: string;
  customerName: string;
  customerPhone: string;
  items: CartItem[];
  totalPrice: number;
  sellerName: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  phone: string;
  address: string;
  salary: number;
  hireDate: string;
  status: 'active' | 'rest' | 'sick';
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  action: string;
  details: string;
  timestamp: string;
  type: 'login' | 'logout' | 'order' | 'cart' | 'view' | 'other';
}

export interface UserSession {
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  loginTime: string;
  logoutTime?: string;
  activities: ActivityLog[];
}

export interface QueueCart {
  id: string;
  assistantName: string;
  items: CartItem[];
  totalPrice: number;
  createdAt: string;
  status: 'pending' | 'sent_to_cashier';
}

interface AppState {
  user: { name: string; role: 'admin' | 'kassir' | 'yordamchi' | 'omborchi'; email: string; loginTime: string } | null;
  products: Product[];
  cart: CartItem[];
  orders: Order[];
  employees: Employee[];
  activityLogs: ActivityLog[];
  userSessions: UserSession[];
  sales: Sale[];
  queueCarts: QueueCart[];
  theme: 'light' | 'dark';
  language: 'uz' | 'ru' | 'en';
  login: (email: string, password: string) => boolean;
  logout: () => void;
  logActivity: (action: string, details: string, type: ActivityLog['type']) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  setLanguage: (lang: 'uz' | 'ru' | 'en') => void;
  addToCart: (product: Product, qty: number) => void;
  removeFromCart: (productId: string) => void;
  updateCartQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  placeOrder: (name: string, phone: string, deliveryType: 'courier' | 'pickup', address?: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  completeSale: (customerName: string, customerPhone: string, items: CartItem[]) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Omit<Product, 'id'>) => void;
  deleteProduct: (id: string) => void;
  updateProductQty: (id: string, qty: number) => void;
  addEmployee: (emp: Omit<Employee, 'id'>) => void;
  sendToQueue: (items: CartItem[]) => void;
  sendQueueToCashier: (queueId: string) => void;
  removeFromQueue: (queueId: string) => void;
}

const mockProducts: Product[] = [
  { id: '1', code: '001', name: 'Premium Divan "Comfort"', category: 'Divanlar', image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop', costPrice: 2800000, salePrice: 4500000, quantity: 8, description: 'Yumshoq va qulay premium divan. 3 kishilik, zamonaviy dizayn.' },
  { id: '2', code: '002', name: 'Yog\'och Stol "Classic"', category: 'Stollar', image: 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400&h=300&fit=crop', costPrice: 1200000, salePrice: 1950000, quantity: 15, description: 'Natural yog\'ochdan tayyorlangan klassik oshxona stoli.' },
  { id: '3', code: '003', name: 'Ergonomik Stul "Office Pro"', category: 'Stullar', image: 'https://images.unsplash.com/photo-1592078615290-033ee584e267?w=400&h=300&fit=crop', costPrice: 800000, salePrice: 1350000, quantity: 22, description: 'Ofis uchun ergonomik stul, bel qo\'llab-quvvatlash bilan.' },
  { id: '4', code: '004', name: 'Shkaf "Grand"', category: 'Shkaflar', image: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?w=400&h=300&fit=crop', costPrice: 3500000, salePrice: 5200000, quantity: 5, description: 'Katta hajmli 3 eshikli shkaf, oyna bilan.' },
  { id: '5', code: '005', name: 'Karavot "Royal Sleep"', category: 'Karavotlar', image: 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=400&h=300&fit=crop', costPrice: 4200000, salePrice: 6800000, quantity: 3, description: 'Premium karavot, ortopedik matras bilan.' },
  { id: '6', code: '006', name: 'Kofe Stoli "Mini"', category: 'Stollar', image: 'https://images.unsplash.com/photo-1532372576444-dda954194ad0?w=400&h=300&fit=crop', costPrice: 450000, salePrice: 750000, quantity: 18, description: 'Zamonaviy kofe stoli, metall oyoqlar bilan.' },
  { id: '7', code: '007', name: 'Kreslo "Relax"', category: 'Divanlar', image: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop', costPrice: 1800000, salePrice: 2900000, quantity: 12, description: 'Dam olish uchun qulay kreslo.' },
  { id: '8', code: '008', name: 'Kitob Javoni "Smart"', category: 'Shkaflar', image: 'https://images.unsplash.com/photo-1594620302200-9a762244a156?w=400&h=300&fit=crop', costPrice: 900000, salePrice: 1450000, quantity: 9, description: '5 qavatli kitob javoni, zamonaviy dizayn.' },
];

const mockOrders: Order[] = [
  { id: 'ORD-001', customerName: 'Aziz Karimov', customerPhone: '+998901234567', items: [{ product: mockProducts[0], quantity: 1 }], totalPrice: 4530000, deliveryType: 'courier', address: 'Toshkent, Yunusobod 4', status: 'new', createdAt: '2025-03-12T14:35:00' },
  { id: 'ORD-002', customerName: 'Nilufar Rahimova', customerPhone: '+998937654321', items: [{ product: mockProducts[2], quantity: 4 }], totalPrice: 5400000, deliveryType: 'pickup', status: 'preparing', createdAt: '2025-03-11T10:20:00' },
  { id: 'ORD-003', customerName: 'Sardor Toshmatov', customerPhone: '+998881112233', items: [{ product: mockProducts[4], quantity: 1 }, { product: mockProducts[5], quantity: 2 }], totalPrice: 8300000, deliveryType: 'courier', address: 'Toshkent, Chilonzor 9', status: 'ready', createdAt: '2025-03-10T09:15:00' },
];

const mockEmployees: Employee[] = [
  { id: 'E1', name: 'Bobur Aliyev', phone: '+998901112233', address: 'Toshkent, Sergeli', salary: 3500000, hireDate: '2023-06-15', status: 'active' },
  { id: 'E2', name: 'Dilnoza Karimova', phone: '+998937778899', address: 'Toshkent, Mirzo Ulugbek', salary: 4200000, hireDate: '2022-01-10', status: 'active' },
  { id: 'E3', name: 'Jasur Rahmatov', phone: '+998881234567', address: 'Toshkent, Yakkasaroy', salary: 3000000, hireDate: '2024-03-01', status: 'rest' },
];

// Load from localStorage or use mock data
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Migrate products to add code if missing and ensure all required fields exist
const migrateProducts = (products: Product[]): Product[] => {
  return products.map((p, index) => {
    const migrated = { ...p };
    
    // Add code if missing
    if (!migrated.code) {
      migrated.code = String(index + 1).padStart(3, '0');
    }
    
    // Ensure all required fields exist with defaults
    if (!migrated.name) migrated.name = 'Mahsulot';
    if (!migrated.category) migrated.category = 'Boshqa';
    if (!migrated.image) migrated.image = 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop';
    if (typeof migrated.costPrice !== 'number') migrated.costPrice = 0;
    if (typeof migrated.salePrice !== 'number') migrated.salePrice = 0;
    if (typeof migrated.quantity !== 'number') migrated.quantity = 0;
    if (!migrated.description) migrated.description = '';
    
    return migrated;
  });
};

// Initialize theme on load
if (typeof window !== 'undefined') {
  const savedTheme = loadFromStorage('theme', 'dark');
  document.documentElement.classList.remove('light', 'dark');
  document.documentElement.classList.add(savedTheme);
  
  // Migrate and save products if needed
  const loadedProducts = loadFromStorage('products', mockProducts);
  const migratedProducts = migrateProducts(loadedProducts);
  if (JSON.stringify(loadedProducts) !== JSON.stringify(migratedProducts)) {
    localStorage.setItem('products', JSON.stringify(migratedProducts));
  }
}

export const useStore = create<AppState>((set, get) => ({
  user: loadFromStorage('user', null),
  products: migrateProducts(loadFromStorage('products', mockProducts)),
  cart: [],
  orders: loadFromStorage('orders', mockOrders),
  employees: loadFromStorage('employees', mockEmployees),
  activityLogs: loadFromStorage('activityLogs', []),
  userSessions: loadFromStorage('userSessions', []),
  sales: loadFromStorage('sales', []),
  queueCarts: loadFromStorage('queueCarts', []),
  theme: loadFromStorage('theme', 'dark'),
  language: loadFromStorage('language', 'uz'),

  logActivity: (action, details, type) => {
    const user = get().user;
    if (!user) return;

    const activity: ActivityLog = {
      id: `ACT-${Date.now()}`,
      userId: user.email,
      userName: user.name,
      userEmail: user.email,
      userPhone: user.email.includes('@') ? undefined : user.email,
      action,
      details,
      type,
      timestamp: new Date().toISOString(),
    };

    const newLogs = [activity, ...get().activityLogs];
    set({ activityLogs: newLogs });
    localStorage.setItem('activityLogs', JSON.stringify(newLogs));

    // Update current session (immutable)
    const sessions = get().userSessions;
    const hasCurrentSession = sessions.some(s => s.userId === user.email && !s.logoutTime);
    if (hasCurrentSession) {
      const updatedSessions = sessions.map(s =>
        s.userId === user.email && !s.logoutTime
          ? { ...s, activities: [...s.activities, activity] }
          : s
      );
      set({ userSessions: updatedSessions });
      localStorage.setItem('userSessions', JSON.stringify(updatedSessions));
    }
  },

  login: (email, password) => {
    const loginTime = new Date().toISOString();
    let userData: { name: string; role: 'admin' | 'kassir' | 'yordamchi' | 'omborchi'; email: string; loginTime: string } | null = null;

    if (email === 'admin@mebel.uz' && password === 'admin123') {
      userData = { name: 'Admin', role: 'admin', email, loginTime };
    } else if (email === 'kassir@mebel.uz' && password === 'kassir123') {
      userData = { name: 'Kassir', role: 'kassir', email, loginTime };
    } else if (email === 'yordamchi@mebel.uz' && password === 'yordamchi123') {
      userData = { name: 'Yordamchi', role: 'yordamchi', email, loginTime };
    } else if (email === 'omborchi@mebel.uz' && password === 'omborchi123') {
      userData = { name: 'Omborchi', role: 'omborchi', email, loginTime };
    } else {
      return false;
    }

    set({ user: userData });
    localStorage.setItem('user', JSON.stringify(userData));

    // Create new session
    const newSession: UserSession = {
      userId: email,
      userName: userData.name,
      userEmail: email,
      userPhone: email.includes('@') ? undefined : email,
      loginTime,
      activities: [],
    };

    const sessions = [newSession, ...get().userSessions];
    set({ userSessions: sessions });
    localStorage.setItem('userSessions', JSON.stringify(sessions));

    // Log activity
    get().logActivity('Tizimga kirdi', `${userData.name} tizimga kirdi`, 'login');
    
    return true;
  },

  logout: () => {
    const user = get().user;
    if (user) {
      const logoutTime = new Date().toISOString();
      
      // Update session with logout time
      const sessions = get().userSessions.map(s => 
        s.userId === user.email && !s.logoutTime 
          ? { ...s, logoutTime } 
          : s
      );
      set({ userSessions: sessions });
      localStorage.setItem('userSessions', JSON.stringify(sessions));

      // Log activity
      get().logActivity('Tizimdan chiqdi', `${user.name} tizimdan chiqdi`, 'logout');
    }

    set({ user: null, cart: [] });
    localStorage.removeItem('user');
  },

  setTheme: (theme) => {
    set({ theme });
    localStorage.setItem('theme', JSON.stringify(theme));
    if (typeof window !== 'undefined') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
    }
  },

  setLanguage: (language) => {
    set({ language });
    localStorage.setItem('language', JSON.stringify(language));
  },

  addToCart: (product, qty) => {
    const cart = get().cart;
    const existing = cart.find(i => i.product.id === product.id);
    if (existing) {
      set({ cart: cart.map(i => i.product.id === product.id ? { ...i, quantity: i.quantity + qty } : i) });
    } else {
      set({ cart: [...cart, { product, quantity: qty }] });
    }
    get().logActivity('Savatga qo\'shdi', `${product.name} mahsulotidan ${qty} dona qo'shildi`, 'cart');
  },

  removeFromCart: (productId) => {
    const product = get().cart.find(i => i.product.id === productId)?.product;
    set({ cart: get().cart.filter(i => i.product.id !== productId) });
    if (product) {
      get().logActivity('Savatdan o\'chirdi', `${product.name} mahsuloti savatdan o'chirildi`, 'cart');
    }
  },

  updateCartQty: (productId, qty) => {
    if (qty <= 0) { get().removeFromCart(productId); return; }
    const product = get().cart.find(i => i.product.id === productId)?.product;
    set({ cart: get().cart.map(i => i.product.id === productId ? { ...i, quantity: qty } : i) });
    if (product) {
      get().logActivity('Savat miqdorini o\'zgartirdi', `${product.name} miqdori ${qty} ga o'zgartirildi`, 'cart');
    }
  },

  clearCart: () => set({ cart: [] }),

  placeOrder: (name, phone, deliveryType, address) => {
    const cart = get().cart;
    const total = cart.reduce((s, i) => s + i.product.salePrice * i.quantity, 0) + (deliveryType === 'courier' ? 30000 : 0);
    const order: Order = {
      id: `ORD-${String(get().orders.length + 1).padStart(3, '0')}`,
      customerName: name,
      customerPhone: phone,
      items: [...cart],
      totalPrice: total,
      deliveryType,
      address,
      status: 'new',
      createdAt: new Date().toISOString(),
    };
    // decrease product quantities
    const products = get().products.map(p => {
      const item = cart.find(i => i.product.id === p.id);
      return item ? { ...p, quantity: Math.max(0, p.quantity - item.quantity) } : p;
    });
    const newOrders = [order, ...get().orders];
    set({ orders: newOrders, cart: [], products });
    localStorage.setItem('orders', JSON.stringify(newOrders));
    localStorage.setItem('products', JSON.stringify(products));
    
    const itemsList = cart.map(i => `${i.product.name} (${i.quantity} dona)`).join(', ');
    get().logActivity('Buyurtma berdi', `Buyurtma #${order.id}: ${itemsList}. Jami: ${formatSom(total)}`, 'order');
  },

  updateOrderStatus: (orderId, status) => {
    const updatedOrders = get().orders.map(o => o.id === orderId ? { ...o, status } : o);
    set({ orders: updatedOrders });
    localStorage.setItem('orders', JSON.stringify(updatedOrders));
  },

  completeSale: (customerName, customerPhone, items) => {
    const user = get().user;
    if (!user) return;

    const total = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    
    const sale: Sale = {
      id: `SALE-${Date.now()}`,
      customerName,
      customerPhone,
      items: [...items],
      totalPrice: total,
      sellerName: user.name,
      createdAt: new Date().toISOString(),
    };

    // Decrease product quantities
    const products = get().products.map(p => {
      const item = items.find(i => i.product.id === p.id);
      return item ? { ...p, quantity: Math.max(0, p.quantity - item.quantity) } : p;
    });

    const newSales = [sale, ...get().sales];
    set({ sales: newSales, products });
    localStorage.setItem('sales', JSON.stringify(newSales));
    localStorage.setItem('products', JSON.stringify(products));

    // Log activity
    const itemsList = items.map(i => `${i.product.name} (${i.quantity} dona)`).join(', ');
    get().logActivity('Sotildi', `${customerName}ga sotildi: ${itemsList}. Jami: ${formatSom(total)}`, 'order');
  },

  addProduct: (product) => {
    const products = get().products;
    // Generate next code: find max code number and add 1
    const maxCode = products.reduce((max, p) => {
      const codeNum = parseInt(p.code);
      return codeNum > max ? codeNum : max;
    }, 0);
    const nextCode = String(maxCode + 1).padStart(3, '0');
    
    const newProducts = [...products, { ...product, id: `P${Date.now()}`, code: nextCode }];
    set({ products: newProducts });
    localStorage.setItem('products', JSON.stringify(newProducts));
  },

  updateProduct: (id, product) => {
    const updatedProducts = get().products.map(p => p.id === id ? { ...product, id, code: p.code } : p);
    set({ products: updatedProducts });
    localStorage.setItem('products', JSON.stringify(updatedProducts));
  },

  deleteProduct: (id) => {
    const filteredProducts = get().products.filter(p => p.id !== id);
    set({ products: filteredProducts });
    localStorage.setItem('products', JSON.stringify(filteredProducts));
  },

  updateProductQty: (id, qty) => {
    set({ products: get().products.map(p => p.id === id ? { ...p, quantity: qty } : p) });
  },

  addEmployee: (emp) => {
    const newEmployees = [...get().employees, { ...emp, id: `E${Date.now()}` }];
    set({ employees: newEmployees });
    localStorage.setItem('employees', JSON.stringify(newEmployees));
  },

  sendToQueue: (items) => {
    const user = get().user;
    if (!user || user.role !== 'yordamchi') return;

    const total = items.reduce((sum, item) => sum + item.product.salePrice * item.quantity, 0);
    const queueCart: QueueCart = {
      id: `QUEUE-${Date.now()}`,
      assistantName: user.name,
      items: [...items],
      totalPrice: total,
      createdAt: new Date().toISOString(),
      status: 'pending',
    };

    const newQueue = [queueCart, ...get().queueCarts];
    set({ queueCarts: newQueue });
    localStorage.setItem('queueCarts', JSON.stringify(newQueue));
  },

  sendQueueToCashier: (queueId) => {
    const updatedQueue = get().queueCarts.map(q => 
      q.id === queueId ? { ...q, status: 'sent_to_cashier' as const } : q
    );
    set({ queueCarts: updatedQueue });
    localStorage.setItem('queueCarts', JSON.stringify(updatedQueue));
  },

  removeFromQueue: (queueId) => {
    const filteredQueue = get().queueCarts.filter(q => q.id !== queueId);
    set({ queueCarts: filteredQueue });
    localStorage.setItem('queueCarts', JSON.stringify(filteredQueue));
  },
}));

export const formatSom = (n: number) => n.toLocaleString('uz-UZ') + ' so\'m';

export const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};
