import { useState, useEffect, useRef } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Package, Search, Plus, Minus, X, Send, User, Phone } from 'lucide-react';
import { toast } from 'sonner';

interface CartItem {
  product: any;
  quantity: number;
}

const Assistant = () => {
  const { products, fetchProducts, createQueueCart } = useApiStore();
  const user = useApiStore(s => s.user);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);
  
  const quantityInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Auto-focus quantity input when modal opens
  useEffect(() => {
    if (selectedProduct && quantityInputRef.current) {
      setTimeout(() => {
        quantityInputRef.current?.focus();
        quantityInputRef.current?.select();
      }, 100);
    }
  }, [selectedProduct]);

  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
    (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
  );

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.salePrice * item.quantity), 0);

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
    toast.success('Savatga qo\'shildi!');
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

  const handleSendToQueue = async () => {
    if (cart.length === 0) {
      toast.error('Savat bo\'sh!');
      return;
    }

    if (!user) {
      toast.error('Foydalanuvchi topilmadi!');
      return;
    }

    setLoading(true);
    try {
      const items = cart.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: Number(item.product.salePrice),
      }));

      await createQueueCart(
        user.id,
        items,
        customerName || undefined,
        customerPhone || undefined
      );

      toast.success('Navbatga yuborildi!');
      setCart([]);
      setCustomerName('');
      setCustomerPhone('');
    } catch (error: any) {
      console.error('Queue cart error:', error);
      toast.error(error?.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleQuantityKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddToCart();
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
            {cart.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Savat bo'sh</p>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border space-y-3">
            {/* Customer Info (Optional) */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Mijoz ma'lumotlari (ixtiyoriy):</p>
              <div className="relative">
                <input
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  placeholder="Mijoz ismi"
                  className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
              <div className="relative">
                <input
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  placeholder="Telefon raqam"
                  className="w-full h-9 pl-9 pr-4 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                />
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>

            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Jami:</span>
              <span className="text-xl font-bold text-foreground">{formatSom(cartTotal)}</span>
            </div>

            <button
              onClick={handleSendToQueue}
              disabled={cart.length === 0 || loading}
              className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Send className="h-4 w-4" />
              {loading ? 'Yuborilmoqda...' : 'Navbatga yuborish'}
            </button>
          </div>
        </div>
      </div>

      {/* Products - Separate section */}
      <div className="lg:order-1 flex-1 flex flex-col space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Yordamchi Panel</h1>
          <p className="text-sm text-muted-foreground mt-1">Mahsulotlarni qidiring va savatga qo'shing</p>
        </div>

        {/* Search Bar */}
        <div className="bg-card rounded-xl card-shadow p-4">
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

        {/* Products Grid */}
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

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
            <p className="text-muted-foreground">Mahsulot topilmadi</p>
          </div>
        )}
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
    </div>
  );
};

export default Assistant;
