import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Edit, Trash2, X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface Customer {
  name: string;
  phone: string;
  createdAt: string;
}

const formatSom = (amount: number) => {
  return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleString('uz-UZ', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const KassirCustomers = () => {
  const { sales, fetchSales } = useApiStore();
  const [editingCustomer, setEditingCustomer] = useState<{ phone: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  // Load customers from localStorage
  const [customersData, setCustomersData] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem('customersData');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading customers data:', error);
      return [];
    }
  });

  // Fetch sales on mount
  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const saveCustomersData = (data: Customer[]) => {
    setCustomersData(data);
    localStorage.setItem('customersData', JSON.stringify(data));
  };

  // Merge customers from sales and manually added customers
  const allCustomers = Object.values(
    [...sales, ...customersData.map(c => ({ 
      customerName: c.name, 
      customerPhone: c.phone, 
      totalPrice: 0, 
      createdAt: c.createdAt 
    }))].reduce((acc, sale) => {
      const key = sale.customerPhone;
      if (!acc[key]) {
        acc[key] = { 
          name: sale.customerName, 
          phone: sale.customerPhone, 
          orderCount: 0, 
          totalSpent: 0, 
          lastOrder: sale.createdAt,
          createdAt: sale.createdAt
        };
      }
      if (sale.totalPrice) {
        acc[key].orderCount++;
        acc[key].totalSpent += Number(sale.totalPrice);
      }
      if (new Date(sale.createdAt) > new Date(acc[key].lastOrder)) {
        acc[key].lastOrder = sale.createdAt;
      }
      return acc;
    }, {} as Record<string, { name: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string; createdAt: string }>)
  );

  const handleEdit = (customer: { name: string; phone: string }) => {
    setEditingCustomer(customer);
    setEditName(customer.name);
    setEditPhone(customer.phone);
  };

  const handleSaveEdit = () => {
    if (!editingCustomer || !editName.trim() || !editPhone.trim()) return;
    
    // Update customersData
    const updatedCustomersData = customersData.map(c => 
      c.phone === editingCustomer.phone 
        ? { ...c, name: editName, phone: editPhone }
        : c
    );
    saveCustomersData(updatedCustomersData);
    
    setEditingCustomer(null);
    fetchSales(); // Refresh to show updated data
  };

  const handleDelete = (phone: string) => {
    // Delete from customersData
    const updatedCustomersData = customersData.filter(c => c.phone !== phone);
    saveCustomersData(updatedCustomersData);
    
    setDeleteConfirm(null);
    fetchSales(); // Refresh to show updated data
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{allCustomers.length} ta mijoz</p>
      </div>
      <div className="bg-card rounded-xl card-shadow">
        <div className="overflow-x-auto overflow-y-visible">
          <table className="w-full text-sm" style={{ minWidth: '800px' }}>
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Ism</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Telefon</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Buyurtmalar</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Jami summa</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Kiritilgan sana</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium whitespace-nowrap">Amallar</th>
              </tr>
            </thead>
          <tbody>
            {allCustomers.map((c, i) => (
              <motion.tr 
                key={c.phone} 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: i * 0.05 }} 
                className="border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer md:cursor-default"
                onClick={() => setSelectedCustomer(c)}
              >
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{i + 1}</td>
                <td className="px-4 py-3 font-medium text-foreground whitespace-nowrap">{c.name}</td>
                <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{c.phone}</td>
                <td className="px-4 py-3 text-center whitespace-nowrap"><span className="bg-gold/10 text-gold text-xs px-2 py-0.5 rounded-full">{c.orderCount}</span></td>
                <td className="px-4 py-3 text-right font-medium format-som whitespace-nowrap">{formatSom(c.totalSpent)}</td>
                <td className="px-4 py-3 text-right text-muted-foreground text-xs whitespace-nowrap">{formatDate(c.createdAt)}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() => handleEdit(c)}
                      className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"
                      title="Tahrirlash"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(c.phone)}
                      className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                      title="O'chirish"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
            {allCustomers.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground"><UserCheck className="h-10 w-10 mx-auto mb-2 opacity-30" />Mijozlar yo'q</td></tr>
            )}
          </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingCustomer(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Mijozni tahrirlash</h3>
                  <button onClick={() => setEditingCustomer(null)} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Ism</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Mijoz ismi"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon</label>
                    <input
                      type="text"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="+998901234567"
                    />
                  </div>
                </div>
                <div className="p-4 border-t border-border flex gap-3">
                  <button
                    onClick={() => setEditingCustomer(null)}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={handleSaveEdit}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                  >
                    Saqlash
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                    Mijozni o'chirish
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    <span className="font-medium text-foreground">
                      {allCustomers.find(c => c.phone === deleteConfirm)?.name}
                    </span>{' '}
                    mijozini va uning barcha buyurtmalarini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                    >
                      O'chirish
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Mobile Action Menu */}
      <AnimatePresence>
        {selectedCustomer && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSelectedCustomer(null)} />
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
            >
              <div className="bg-card rounded-t-2xl card-shadow border-t border-border p-4">
                <div className="w-12 h-1 bg-muted rounded-full mx-auto mb-4" />
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-foreground">{selectedCustomer.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    <span>{selectedCustomer.orderCount} ta buyurtma</span>
                    <span>{formatSom(selectedCustomer.totalSpent)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      handleEdit(selectedCustomer);
                      setSelectedCustomer(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 rounded-lg transition-colors"
                  >
                    <Edit className="h-5 w-5" />
                    <span className="font-medium">Tahrirlash</span>
                  </button>
                  <button
                    onClick={() => {
                      setDeleteConfirm(selectedCustomer.phone);
                      setSelectedCustomer(null);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-5 w-5" />
                    <span className="font-medium">O'chirish</span>
                  </button>
                  <button
                    onClick={() => setSelectedCustomer(null)}
                    className="w-full px-4 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors font-medium"
                  >
                    Bekor qilish
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default KassirCustomers;
