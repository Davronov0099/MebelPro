import { useState, useRef, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Minus, X, QrCode, CheckCircle, User, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { getSocket } from '@/services/socket';

interface CartItem {
  product: any;
  quantity: number;
}

const Sales = () => {
  const { products, fetchProducts, createSale } = useApiStore();
  const user = useApiStore(s => s.user);
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentType, setPaymentType] = useState<'cash' | 'card' | 'debt'>('cash');
  const [showCustomerSelect, setShowCustomerSelect] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const customerNameInputRef = useRef<HTMLInputElement>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Handle approved cart from navigation state
  useEffect(() => {
    const state = location.state as { approvedCart?: any };
    if (state?.approvedCart) {
      const approvedCart = state.approvedCart;
      
      // Add approved cart items to current cart
      const newItems: CartItem[] = approvedCart.items.map((item: any) => ({
        product: item.product,
        quantity: item.quantity,
      }));
      
      setCart(prev => {
        const updated = [...prev];
        newItems.forEach(newItem => {
          const existingIndex = updated.findIndex(i => i.product.id === newItem.product.id);
          if (existingIndex >= 0) {
            updated[existingIndex].quantity += newItem.quantity;
          } else {
            updated.push(newItem);
          }
        });
        return updated;
      });
      
      // Auto-populate customer info if available
      if (approvedCart.customerName) {
        setCustomerName(approvedCart.customerName);
      }
      if (approvedCart.customerPhone) {
        setCustomerPhone(approvedCart.customerPhone);
      }
      
      toast.success(`Savatga qo'shildi`, {
        description: `${approvedCart.assistant.name} dan`,
      });
      
      // Clear navigation state
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Setup socket listener for approved carts (admin and kassir)
  useEffect(() => {
    const socket = getSocket();
    
    if (socket && (user?.role === 'admin' || user?.role === 'kassir')) {
      const handleCartApproved = (approvedCart: any) => {
        
        // Add approved cart items to current cart
        const newItems: CartItem[] = approvedCart.items.map((item: any) => ({
          product: item.product,
          quantity: item.quantity,
        }));
        
        setCart(prev => {
          const updated = [...prev];
          newItems.forEach(newItem => {
            const existingIndex = updated.findIndex(i => i.product.id === newItem.product.id);
            if (existingIndex >= 0) {
              updated[existingIndex].quantity += newItem.quantity;
            } else {
              updated.push(newItem);
            }
          });
          return updated;
        });
        
        // Auto-populate customer info if available
        if (approvedCart.customerName) {
          setCustomerName(approvedCart.customerName);
        }
        if (approvedCart.customerPhone) {
          setCustomerPhone(approvedCart.customerPhone);
        }
        
        toast.success(`Savatga qo'shildi`, {
          description: `${approvedCart.assistant.name} dan`,
        });
      };

      // Listen to role-specific events
      if (user.role === 'admin') {
        socket.on('cart-approved-by-admin', handleCartApproved);
      } else if (user.role === 'kassir') {
        socket.on('cart-approved-by-kassir', handleCartApproved);
      }

      return () => {
        if (user.role === 'admin') {
          socket.off('cart-approved-by-admin', handleCartApproved);
        } else if (user.role === 'kassir') {
          socket.off('cart-approved-by-kassir', handleCartApproved);
        }
      };
    }
  }, [user]);

  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
    (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Customers list - sample data (can be fetched from API later)
  const customers: Array<{ name: string; phone: string }> = [
    { name: 'Alisher Karimov', phone: '+998901234567' },
    { name: 'Dilnoza Rahimova', phone: '+998907654321' },
    { name: 'Bobur Toshmatov', phone: '+998909876543' },
    { name: 'Malika Yusupova', phone: '+998905551234' },
    { name: 'Jasur Abdullayev', phone: '+998903334455' },
  ];

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);

  // Auto-focus quantity input when modal opens
  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      setTimeout(() => {
        quantityInputRef.current?.focus();
        quantityInputRef.current?.select();
      }, 100);
    }
  }, [selectedProduct]);

  const handleAddToCart = () => {
    if (!selectedProduct || quantity <= 0) return;
    
    const existing = cart.find(item => item.product.id === selectedProduct.id);
    if (existing) {
      setCart(cart.map(item => 
        item.product.id === selectedProduct.id 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { product: selectedProduct, quantity }]);
    }
    
    setSelectedProduct(null);
    setQuantity(1);
    toast.success('Savatga qo\'shildi!', {
      description: `${selectedProduct.name} — ${quantity} dona`,
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(cart.filter(item => item.product.id !== productId));
  };

  const handleUpdateQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveFromCart(productId);
      return;
    }
    setCart(cart.map(item => 
      item.product.id === productId ? { ...item, quantity: newQty } : item
    ));
  };

  const handleSell = () => {
    if (cart.length === 0) {
      toast.error('Savat bo\'sh!');
      return;
    }
    // Mijoz ma'lumotlari majburiy emas - bo'sh bo'lsa "Oddiy mijoz" sifatida ketadi
    setShowQR(true);
  };

  const handleCompleteSale = async () => {
    try {
      // Prepare sale data - agar mijoz ma'lumotlari bo'sh bo'lsa, "Oddiy mijoz" qo'yamiz
      const finalCustomerName = customerName || 'Oddiy mijoz';
      const finalCustomerPhone = customerPhone || '-';
      
      const saleData = {
        customerName: finalCustomerName,
        customerPhone: finalCustomerPhone,
        paymentType,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.salePrice),
        })),
      };
      
      
      // Save customer data to localStorage if name or phone is provided
      if (customerName || customerPhone) {
        const customersData = JSON.parse(localStorage.getItem('customersData') || '[]');
        const existingCustomer = customersData.find((c: any) => c.phone === finalCustomerPhone);
        
        if (!existingCustomer) {
          customersData.push({
            name: finalCustomerName,
            phone: finalCustomerPhone,
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('customersData', JSON.stringify(customersData));
        }
      }
      
      // Create sale via API
      const newSale = await createSale(saleData);

      setShowQR(false);
      setShowSuccess(true);
      
      // Print receipt
      if (newSale) {
        printReceipt(newSale, cart);
      }
      
      // Clear cart and customer info
      setTimeout(() => {
        setCart([]);
        setCustomerName('');
        setCustomerPhone('');
        setPaymentType('cash');
        setShowSuccess(false);
        toast.success('Sotildi!');
      }, 2000);
    } catch (error: any) {
      setShowQR(false);
      
      // Show detailed error message
      const errorMessage = error?.response?.data?.message || error?.message || 'Xatolik yuz berdi';
      
      toast.error(errorMessage);
    }
  };

  const printReceipt = (sale: any, cartItems: CartItem[]) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast.error('Chek ochilmadi. Popup blocker ni o\'chiring.');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Chek - ${sale.saleNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
            color: #000;
            font-weight: 900;
          }
          .header p {
            font-size: 12px;
            color: #000;
            font-weight: 600;
          }
          .info {
            margin-bottom: 15px;
            font-size: 12px;
            color: #000;
            font-weight: 600;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .items {
            margin-bottom: 15px;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
          }
          .item {
            margin-bottom: 10px;
            font-size: 12px;
            color: #000;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 3px;
            color: #000;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            color: #333;
            font-weight: 600;
          }
          .total {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 5px;
            color: #000;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 11px;
            color: #000;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEBEL PRO</h1>
          <p>Mebel do'koni</p>
          <p>Tel: +998 90 123 45 67</p>
        </div>

        <div class="info">
          <div class="info-row">
            <span>Chek №:</span>
            <strong>${sale.saleNumber}</strong>
          </div>
          <div class="info-row">
            <span>Sana:</span>
            <span>${new Date(sale.createdAt).toLocaleString('uz-UZ')}</span>
          </div>
          <div class="info-row">
            <span>Mijoz:</span>
            <span>${customerName || 'Oddiy mijoz'}</span>
          </div>
          <div class="info-row">
            <span>Telefon:</span>
            <span>${customerPhone || '-'}</span>
          </div>
          <div class="info-row">
            <span>Sotuvchi:</span>
            <span>${user?.name || 'N/A'}</span>
          </div>
        </div>

        <div class="items">
          ${cartItems.map(item => `
            <div class="item">
              <div class="item-name">${item.product.name}</div>
              <div class="item-details">
                <span>${item.quantity} × ${formatSom(item.product.salePrice)}</span>
                <strong>${formatSom(item.product.salePrice * item.quantity)}</strong>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="total">
          <div class="total-row">
            <span>JAMI:</span>
            <span>${formatSom(cartTotal)}</span>
          </div>
        </div>

        <div class="footer">
          <p>Xaridingiz uchun rahmat!</p>
          <p>Yana tashrif buyuring!</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
            // Auto close after print (optional)
            // setTimeout(() => window.close(), 1000);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  // Handle Enter key for modals
  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddToCart();
    }
  };

  // Close customer select when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showCustomerSelect && customerNameInputRef.current && !customerNameInputRef.current.contains(e.target as Node)) {
        setShowCustomerSelect(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCustomerSelect]);

  // Handle customer selection
  const handleSelectCustomer = (customer: { name: string; phone: string }) => {
    setCustomerName(customer.name);
    setCustomerPhone(customer.phone);
    setShowCustomerSelect(false);
  };

  const handleCustomerKeyDown = (e: React.KeyboardEvent, field: 'name' | 'phone') => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (field === 'name' && customerName) {
        // Move to phone input
        const phoneInput = document.querySelector('input[placeholder="Telefon raqam"]') as HTMLInputElement;
        phoneInput?.focus();
      } else if (field === 'phone' && customerName && customerPhone) {
        // Submit sale
        handleSell();
      }
    }
  };

  const handleQRKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCompleteSale();
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Cart - Sticky on mobile, Fixed width on desktop */}
      <div className="lg:order-2 w-full lg:w-96 lg:sticky lg:top-4 lg:self-start">
        <div className="bg-card rounded-xl card-shadow overflow-hidden flex flex-col max-h-[70vh] lg:max-h-[calc(100vh-6rem)]">
          <div className="p-4 border-b border-border bg-card sticky top-0 z-10">
            <h2 className="text-lg font-semibold text-foreground">Savat</h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[200px]">
          {cart.map(item => (
            <div key={item.product.id} className="bg-background rounded-lg p-3">
              <div className="flex items-start gap-2 mb-2">
                <img src={item.product.image} alt={item.product.name} className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground line-clamp-1">{item.product.name}</h4>
                  <p className="text-xs text-muted-foreground">{formatSom(item.product.salePrice)}</p>
                </div>
                <button onClick={() => handleRemoveFromCart(item.product.id)} className="p-1 hover:bg-destructive/10 rounded text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleUpdateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80">
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                  <button onClick={() => handleUpdateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded bg-muted flex items-center justify-center hover:bg-muted/80">
                    <Plus className="h-3 w-3" />
                  </button>
                </div>
                <span className="text-sm font-bold text-foreground">{formatSom(item.product.salePrice * item.quantity)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-border space-y-3">
          {/* Customer Selection */}
          <div className="relative">
            <input
              ref={customerNameInputRef}
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              onKeyDown={e => handleCustomerKeyDown(e, 'name')}
              placeholder="Mijoz ismi"
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <div className="relative">
            <input
              value={customerPhone}
              onChange={e => setCustomerPhone(e.target.value)}
              onKeyDown={e => handleCustomerKeyDown(e, 'phone')}
              placeholder="Telefon raqam"
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          {/* Payment Type Selection */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-muted-foreground">To'lov turi:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType('cash')}
                className={`h-9 rounded-lg text-sm font-medium transition-all ${
                  paymentType === 'cash'
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Naqd
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('card')}
                className={`h-9 rounded-lg text-sm font-medium transition-all ${
                  paymentType === 'card'
                    ? 'bg-blue-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Karta
              </button>
              <button
                type="button"
                onClick={() => setPaymentType('debt')}
                className={`h-9 rounded-lg text-sm font-medium transition-all ${
                  paymentType === 'debt'
                    ? 'bg-red-500 text-white'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                Qarz
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between py-2">
            <span className="text-sm text-muted-foreground">Jami:</span>
            <span className="text-xl font-bold text-foreground">{formatSom(cartTotal)}</span>
          </div>

          <button
            onClick={handleSell}
            disabled={cart.length === 0}
            className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            Sotish
          </button>
        </div>
        </div>
      </div>

      {/* Products - Separate section, not inside a card */}
      <div className="lg:order-1 flex-1 flex flex-col">
        {/* Sticky Search Bar */}
        <div className="bg-card rounded-xl card-shadow p-4 mb-4 sticky top-0 z-10">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Mahsulot qidirish..."
              className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
            />
          </div>
        </div>

        {/* Products Grid - Not inside card, scrollable */}
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
          {filtered.map(product => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-card rounded-lg p-3 cursor-pointer hover:ring-2 hover:ring-gold transition-all card-shadow"
              onClick={() => { setSelectedProduct(product); setQuantity(1); }}
            >
              <div className="relative">
                <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-lg mb-2" />
                {product.code && <span className="absolute top-1 left-1 bg-gold/90 text-primary text-xs font-mono font-bold px-2 py-0.5 rounded">{product.code}</span>}
              </div>
              <h3 className="text-sm font-medium text-foreground line-clamp-1">{product.name}</h3>
              <p className="text-xs text-muted-foreground">{product.category}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm font-bold text-gold">{formatSom(product.salePrice)}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${product.quantity > 10 ? 'bg-success/10 text-success' : product.quantity > 0 ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>
                  {product.quantity}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Product Quantity Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-xl p-6 w-full max-w-sm card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">Miqdor kiriting</h3>
                <button onClick={() => setSelectedProduct(null)} className="p-1 hover:bg-muted rounded">
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-4">
                <p className="text-sm font-medium text-foreground mb-1">{selectedProduct.name}</p>
                <p className="text-sm text-muted-foreground">{formatSom(selectedProduct.salePrice)}</p>
              </div>

              <div className="flex items-center justify-center gap-4 mb-6">
                <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                  <Minus className="h-5 w-5" />
                </button>
                <input
                  ref={quantityInputRef}
                  type="number"
                  value={quantity}
                  onChange={e => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  onKeyDown={handleQuantityKeyDown}
                  className="w-20 h-12 text-center text-2xl font-bold rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <button onClick={() => setQuantity(quantity + 1)} className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80">
                  <Plus className="h-5 w-5" />
                </button>
              </div>

              <button onClick={handleAddToCart} className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90">
                Savatga qo'shish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Code Modal */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
            onKeyDown={handleQRKeyDown}
          >
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-card rounded-xl p-6 w-full max-w-sm card-shadow text-center relative">
              <button onClick={() => setShowQR(false)} className="absolute top-4 right-4 p-1 hover:bg-muted rounded">
                <X className="h-5 w-5" />
              </button>
              
              <QrCode className="h-16 w-16 mx-auto mb-4 text-gold" />
              <h3 className="text-xl font-bold text-foreground mb-2">To'lov</h3>
              <p className="text-sm text-muted-foreground mb-4">QR kodni skanerlang</p>
              
              <div className="w-48 h-48 mx-auto mb-4 bg-white rounded-lg flex items-center justify-center">
                <div className="text-6xl">📱</div>
              </div>

              <p className="text-2xl font-bold text-foreground mb-6">{formatSom(cartTotal)}</p>

              <button onClick={handleCompleteSale} className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90">
                To'lov qabul qilindi
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-card rounded-2xl p-8 text-center card-shadow">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <CheckCircle className="h-20 w-20 text-success mx-auto" />
              </motion.div>
              <h3 className="text-2xl font-bold text-foreground mt-4">Sotildi!</h3>
              <p className="text-muted-foreground mt-2">{formatSom(cartTotal)}</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sales;
