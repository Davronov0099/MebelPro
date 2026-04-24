import { useEffect, useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { formatSom, formatDate } from '@/stores/store';
import { motion } from 'framer-motion';
import { Package, X } from 'lucide-react';
import { toast } from 'sonner';

const statusMap: Record<string, { label: string; color: string }> = {
  new: { label: 'Yangi', color: 'bg-surface/10 text-surface' },
  preparing: { label: 'Tayyorlanmoqda', color: 'bg-warning/10 text-warning' },
  ready: { label: 'Tayyor', color: 'bg-success/10 text-success' },
  onway: { label: 'Yo\'lda', color: 'bg-gold/10 text-gold' },
  delivered: { label: 'Yetib keldi', color: 'bg-success/10 text-success' },
};

const ShopOrders = () => {
  const orders = useApiStore(s => s.orders);
  const ordersLoading = useApiStore(s => s.ordersLoading);
  const fetchOrdersByPhone = useApiStore(s => s.fetchOrdersByPhone);
  const [showPhoneModal, setShowPhoneModal] = useState(true);
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFetchOrders = async () => {
    if (!phone.trim()) {
      toast.error('Telefon raqamni kiriting');
      return;
    }

    setLoading(true);
    try {
      await fetchOrdersByPhone(phone);
      setShowPhoneModal(false);
      localStorage.setItem('shopCustomerPhone', phone);
    } catch (error) {
      console.error('Fetch orders error:', error);
      toast.error('Buyurtmalarni yuklashda xatolik');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPhone = localStorage.getItem('shopCustomerPhone');
    if (savedPhone) {
      setPhone(savedPhone);
      fetchOrdersByPhone(savedPhone);
      setShowPhoneModal(false);
    }
  }, []);

  if (showPhoneModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
        <motion.div 
          initial={{ scale: 0.95 }} 
          animate={{ scale: 1 }} 
          className="bg-card rounded-xl p-6 w-full max-w-md card-shadow"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Buyurtmalaringizni ko'rish</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Buyurtmalaringizni ko'rish uchun telefon raqamingizni kiriting
          </p>
          <input 
            value={phone} 
            onChange={e => setPhone(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleFetchOrders()}
            placeholder="+998 90 123 45 67" 
            className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 mb-4" 
          />
          <button 
            onClick={handleFetchOrders}
            disabled={loading || !phone.trim()}
            className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
          >
            {loading ? 'Yuklanmoqda...' : 'Ko\'rish'}
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Buyurtmalarim</h2>
        <button
          onClick={() => {
            localStorage.removeItem('shopCustomerPhone');
            setShowPhoneModal(true);
            setPhone('');
          }}
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          Telefon raqamni o'zgartirish
        </button>
      </div>
      
      {ordersLoading ? (
        <div className="text-center py-16 text-muted-foreground">
          <p>Yuklanmoqda...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Package className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Buyurtmalar yo'q</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Sana</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Mahsulotlar</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Summa</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Holat</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o, i) => (
                <motion.tr key={o.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(o.createdAt)}</td>
                  <td className="px-4 py-3">{o.items.map(it => <p key={it.id} className="text-xs">{it.product.name} × {it.quantity}</p>)}</td>
                  <td className="px-4 py-3 text-right font-medium format-som">{formatSom(o.totalPrice)}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusMap[o.status]?.color}`}>{statusMap[o.status]?.label}</span></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ShopOrders;
