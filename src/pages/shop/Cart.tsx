import { useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { formatSom } from '@/stores/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Plus, Minus, X, ShoppingBag, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

const Cart = () => {
  const cart = useApiStore(s => s.cart);
  const updateQty = useApiStore(s => s.updateCartQuantity);
  const removeFromCart = useApiStore(s => s.removeFromCart);
  const clearCart = useApiStore(s => s.clearCart);
  const createOrder = useApiStore(s => s.createOrder);
  const [showOrder, setShowOrder] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });

  const subtotal = cart.reduce((s, i) => s + i.product.salePrice * i.quantity, 0);
  const total = subtotal;

  const handleOrder = async () => {
    if (!form.name || !form.phone) return;
    
    setLoading(true);
    try {
      await createOrder({
        customerName: form.name,
        customerPhone: form.phone,
        deliveryType: 'pickup',
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: Number(item.product.salePrice),
        })),
      });
      
      clearCart();
      setShowOrder(false);
      setShowSuccess(true);
      setForm({ name: '', phone: '' });
      setTimeout(() => setShowSuccess(false), 3000);
      toast.success('Buyurtmangiz qabul qilindi!');
    } catch (error) {
      console.error('Order error:', error);
      toast.error('Buyurtma yaratishda xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0 && !showSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
        <h2 className="text-xl font-semibold text-foreground">Savatcha bo'sh</h2>
        <p className="text-muted-foreground mt-1">Katalogdan mahsulot qo'shing</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
      <h2 className="text-xl font-bold text-foreground">Savatcha ({cart.length})</h2>

      <div className="space-y-3">
        {cart.map(item => (
          <motion.div key={item.product.id} layout initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }}
            className="bg-card rounded-xl p-4 card-shadow flex gap-4 items-center">
            <img src={item.product.image} alt={item.product.name} className="w-16 h-14 rounded-lg object-cover" />
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-medium text-foreground truncate">{item.product.name}</h4>
              <p className="text-sm font-semibold text-gold format-som mt-0.5">{formatSom(item.product.salePrice)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => updateQty(item.product.id, item.quantity - 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95"><Minus className="h-3 w-3" /></button>
              <span className="w-6 text-center text-sm font-semibold">{item.quantity}</span>
              <button onClick={() => updateQty(item.product.id, item.quantity + 1)} className="w-7 h-7 rounded-md bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95"><Plus className="h-3 w-3" /></button>
            </div>
            <p className="text-sm font-semibold text-foreground w-24 text-right format-som">{formatSom(item.product.salePrice * item.quantity)}</p>
            <button onClick={() => removeFromCart(item.product.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="bg-card rounded-xl p-4 card-shadow">
        <div className="flex justify-between text-sm"><span className="text-muted-foreground">Jami:</span><span className="font-semibold format-som">{formatSom(subtotal)}</span></div>
        <button onClick={() => setShowOrder(true)} className="w-full h-11 mt-4 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all">
          Buyurtma berish
        </button>
      </div>

      {/* Order Modal */}
      <AnimatePresence>
        {showOrder && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-xl p-6 w-full max-w-md card-shadow">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Buyurtma berish</h3>
                <button onClick={() => setShowOrder(false)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <div className="space-y-4">
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Ismingiz" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
                <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="Telefon raqam" className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
                <div className="bg-muted/50 rounded-lg p-3 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Jami:</span><span className="font-semibold format-som">{formatSom(total)}</span></div>
                </div>
                <button onClick={handleOrder} disabled={!form.name || !form.phone || loading}
                  className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40">
                  {loading ? 'Yuklanmoqda...' : 'Buyurtmani tasdiqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} className="bg-card rounded-2xl p-8 text-center card-shadow">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <CheckCircle className="h-16 w-16 text-success mx-auto" />
              </motion.div>
              <h3 className="text-xl font-bold text-foreground mt-4">Buyurtmangiz qabul qilindi!</h3>
              <p className="text-muted-foreground mt-1">Tez orada siz bilan bog'lanamiz</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Cart;
