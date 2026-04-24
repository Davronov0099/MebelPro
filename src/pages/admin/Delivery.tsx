import { useStore, formatDate } from '@/stores/store';
import { motion } from 'framer-motion';
import { Truck, CheckCircle, Package } from 'lucide-react';

const Delivery = () => {
  const orders = useStore(s => s.orders);
  const updateStatus = useStore(s => s.updateOrderStatus);

  const active = orders.filter(o => ['ready', 'onway'].includes(o.status) && o.deliveryType === 'courier');
  const done = orders.filter(o => o.status === 'delivered');

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Truck className="h-4 w-4 text-gold" /> Faol yetkazuvlar ({active.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {active.map(o => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-4 card-shadow">
              <p className="text-sm font-medium text-foreground">👤 {o.customerName}</p>
              <p className="text-xs text-muted-foreground mb-2">{o.customerPhone}</p>
              {o.items.map((it, i) => <p key={i} className="text-xs text-muted-foreground">📦 {it.product.name} × {it.quantity}</p>)}
              <p className="text-xs text-muted-foreground mt-2">📍 {o.address}</p>
              <p className="text-xs text-muted-foreground">🕐 {formatDate(o.createdAt)}</p>
              <div className="flex gap-2 mt-3">
                {o.status === 'ready' && (
                  <button onClick={() => updateStatus(o.id, 'onway')} className="flex-1 h-9 text-xs font-medium rounded-lg bg-warning/10 text-warning hover:bg-warning/20 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
                    <Truck className="h-3.5 w-3.5" /> Yo'lda
                  </button>
                )}
                <button onClick={() => updateStatus(o.id, 'delivered')} className="flex-1 h-9 text-xs font-medium rounded-lg bg-success/10 text-success hover:bg-success/20 active:scale-[0.97] transition-all flex items-center justify-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5" /> Yetib keldi
                </button>
              </div>
            </motion.div>
          ))}
          {active.length === 0 && <p className="text-sm text-muted-foreground col-span-full py-8 text-center">Faol yetkazuvlar yo'q</p>}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-muted-foreground mb-3">Yakunlangan ({done.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {done.map(o => (
            <div key={o.id} className="bg-muted/30 rounded-xl p-4 opacity-60">
              <p className="text-sm font-medium">{o.customerName} · {o.customerPhone}</p>
              <p className="text-xs text-muted-foreground">{formatDate(o.createdAt)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
