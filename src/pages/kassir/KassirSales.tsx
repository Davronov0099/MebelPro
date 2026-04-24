import { useEffect, useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { getSocket } from '@/services/socket';
import { QueueCart } from '@/services/api';
import { motion } from 'framer-motion';
import { Send, Trash2, Package, Bell } from 'lucide-react';
import { toast } from 'sonner';

const formatSom = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
};

const KassirSales = () => {
  const [pendingCarts, setPendingCarts] = useState<QueueCart[]>([]);
  const [newNotification, setNewNotification] = useState(false);
  const { queueCarts, fetchQueueCarts, updateQueueStatus, deleteQueueCart } = useApiStore();
  const user = useApiStore(s => s.user);

  // Fetch initial data
  useEffect(() => {
    fetchQueueCarts('pending');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  // Update local state when store changes
  useEffect(() => {
    setPendingCarts(queueCarts.filter(q => q.status === 'pending'));
  }, [queueCarts]);

  // Setup socket listener for real-time updates
  useEffect(() => {
    const socket = getSocket();
    
    if (socket && user?.role === 'kassir') {
      const handleNewCart = (cart: QueueCart) => {
        console.log('📥 New queue cart received (Kassir):', cart);
        setPendingCarts(prev => [cart, ...prev]);
        setNewNotification(true);
        toast.success(`Yangi savat: ${cart.assistant.name}`, {
          description: `Jami: ${formatSom(cart.total)}`,
        });
        
        // Clear notification after 3 seconds
        setTimeout(() => setNewNotification(false), 3000);
      };

      const handleRemoveCart = (data: { cartId: string }) => {
        console.log('📥 Remove cart from queue (Kassir):', data.cartId);
        setPendingCarts(prev => prev.filter(q => q.id !== data.cartId));
      };

      socket.on('new-queue-cart', handleNewCart);
      socket.on('remove-cart-from-queue', handleRemoveCart);

      return () => {
        socket.off('new-queue-cart', handleNewCart);
        socket.off('remove-cart-from-queue', handleRemoveCart);
      };
    }
  }, [user]);

  const handleApprove = async (queueId: string) => {
    try {
      await updateQueueStatus(queueId, 'sent_to_cashier', 'kassir');
      setPendingCarts(prev => prev.filter(q => q.id !== queueId));
      toast.success('Savatga qo\'shildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  const handleRemove = async (queueId: string) => {
    try {
      await deleteQueueCart(queueId);
      setPendingCarts(prev => prev.filter(q => q.id !== queueId));
      toast.success('O\'chirildi');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-foreground">Savdo navbati</h2>
          {newNotification && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-1 bg-gold/20 text-gold px-3 py-1 rounded-full text-sm font-medium"
            >
              <Bell className="h-4 w-4" />
              Yangi
            </motion.div>
          )}
        </div>
        <span className="text-sm text-muted-foreground">{pendingCarts.length} ta navbatda</span>
      </div>

      {pendingCarts.length === 0 ? (
        <div className="bg-card rounded-xl card-shadow p-12 text-center">
          <Package className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-30" />
          <p className="text-muted-foreground">Navbatda savat yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pendingCarts.map((queue, index) => (
            <motion.div
              key={queue.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-card rounded-xl card-shadow overflow-hidden"
            >
              <div className="p-4 border-b border-border bg-muted/30">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-semibold text-foreground">{queue.assistant.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {new Date(queue.createdAt).toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <span className="text-lg font-bold text-gold">{formatSom(queue.total)}</span>
                </div>
                {queue.customerName && (
                  <div className="mt-2 pt-2 border-t border-border/50">
                    <p className="text-sm font-medium text-foreground">{queue.customerName}</p>
                    {queue.customerPhone && (
                      <p className="text-xs text-muted-foreground">{queue.customerPhone}</p>
                    )}
                  </div>
                )}
              </div>

              <div className="p-4 space-y-2 max-h-60 overflow-y-auto">
                {queue.items.map((item) => (
                  <div key={item.id} className="flex items-center gap-2 text-sm">
                    <img src={item.product.image} alt={item.product.name} className="w-10 h-10 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground line-clamp-1">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.quantity} x {formatSom(item.price)}</p>
                    </div>
                    <span className="text-sm font-semibold text-foreground">{formatSom(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-border flex gap-2">
                <button
                  onClick={() => handleApprove(queue.id)}
                  className="flex-1 h-10 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Savatga qo'shish
                </button>
                <button
                  onClick={() => handleRemove(queue.id)}
                  className="h-10 w-10 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 flex items-center justify-center"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KassirSales;
