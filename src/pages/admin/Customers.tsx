import { useEffect, useMemo, useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Edit, Trash2, X, Plus } from 'lucide-react';

const formatSom = (n: number) => new Intl.NumberFormat('uz-UZ').format(n) + " so'm";
const formatDate = (dateStr: string) => {
  const d = new Date(dateStr);
  const months = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
};

interface ManualCustomer { name: string; phone: string; createdAt: string; }

const Customers = () => {
  const { sales, fetchSales, salesLoading } = useApiStore();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<{ phone: string; name: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [addForm, setAddForm] = useState({ name: '', phone: '', createdAt: new Date().toISOString().split('T')[0] });

  const [manualCustomers, setManualCustomers] = useState<ManualCustomer[]>(() => {
    try { return JSON.parse(localStorage.getItem('customersData') || '[]'); } catch { return []; }
  });

  useEffect(() => { fetchSales(); }, []);

  const allCustomers = useMemo(() => {
    const map: Record<string, { name: string; phone: string; orderCount: number; totalSpent: number; lastOrder: string; createdAt: string }> = {};

    sales.forEach(s => {
      if (!map[s.customerPhone]) {
        map[s.customerPhone] = { name: s.customerName, phone: s.customerPhone, orderCount: 0, totalSpent: 0, lastOrder: s.createdAt, createdAt: s.createdAt };
      }
      map[s.customerPhone].orderCount++;
      map[s.customerPhone].totalSpent += Number(s.totalPrice);
      if (new Date(s.createdAt) > new Date(map[s.customerPhone].lastOrder)) {
        map[s.customerPhone].lastOrder = s.createdAt;
      }
    });

    manualCustomers.forEach(c => {
      if (!map[c.phone]) {
        map[c.phone] = { name: c.name, phone: c.phone, orderCount: 0, totalSpent: 0, lastOrder: c.createdAt, createdAt: c.createdAt };
      }
    });

    return Object.values(map).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [sales, manualCustomers]);

  const saveManual = (data: ManualCustomer[]) => {
    setManualCustomers(data);
    localStorage.setItem('customersData', JSON.stringify(data));
  };

  const handleAdd = () => {
    if (!addForm.name.trim() || !addForm.phone.trim()) return;
    saveManual([...manualCustomers, { name: addForm.name, phone: addForm.phone, createdAt: addForm.createdAt }]);
    setAddForm({ name: '', phone: '', createdAt: new Date().toISOString().split('T')[0] });
    setShowAddModal(false);
  };

  const handleSaveEdit = () => {
    if (!editingCustomer || !editName.trim() || !editPhone.trim()) return;
    saveManual(manualCustomers.map(c => c.phone === editingCustomer.phone ? { ...c, name: editName, phone: editPhone } : c));
    setEditingCustomer(null);
  };

  const handleDelete = (phone: string) => {
    saveManual(manualCustomers.filter(c => c.phone !== phone));
    setDeleteConfirm(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{allCustomers.length} ta mijoz</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Mijoz qo'shish
        </button>
      </div>

      {salesLoading ? (
        <div className="bg-card rounded-xl card-shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto" />
          <p className="text-sm text-muted-foreground mt-4">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ism</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Telefon</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Sotuvlar</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Jami summa</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Sana</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {allCustomers.map((c, i) => (
                <motion.tr key={c.phone} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className="border-b border-border last:border-0 hover:bg-muted/20">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{c.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.phone}</td>
                  <td className="px-4 py-3 text-center"><span className="bg-gold/10 text-gold text-xs px-2 py-0.5 rounded-full">{c.orderCount}</span></td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">{formatSom(c.totalSpent)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground text-xs hidden md:table-cell">{formatDate(c.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => { setEditingCustomer(c); setEditName(c.name); setEditPhone(c.phone); }} className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(c.phone)} className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors">
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
      )}

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setShowAddModal(false)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Mijoz qo'shish</h3>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-muted rounded-lg"><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Mijoz ismi</label>
                    <input type="text" value={addForm.name} onChange={e => setAddForm({ ...addForm, name: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Ism Familiya" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon raqami</label>
                    <input type="text" value={addForm.phone} onChange={e => setAddForm({ ...addForm, phone: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="+998901234567" />
                  </div>
                </div>
                <div className="p-4 border-t border-border flex gap-3">
                  <button onClick={() => setShowAddModal(false)} className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors">Bekor qilish</button>
                  <button onClick={handleAdd} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Qo'shish</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editingCustomer && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setEditingCustomer(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">Mijozni tahrirlash</h3>
                  <button onClick={() => setEditingCustomer(null)} className="p-2 hover:bg-muted rounded-lg"><X className="h-5 w-5 text-muted-foreground" /></button>
                </div>
                <div className="p-4 space-y-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Ism</label>
                    <input type="text" value={editName} onChange={e => setEditName(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Telefon</label>
                    <input type="text" value={editPhone} onChange={e => setEditPhone(e.target.value)} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>
                <div className="p-4 border-t border-border flex gap-3">
                  <button onClick={() => setEditingCustomer(null)} className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors">Bekor qilish</button>
                  <button onClick={handleSaveEdit} className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors">Saqlash</button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(null)} />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed inset-0 flex items-center justify-center z-50 p-4">
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4"><Trash2 className="h-6 w-6 text-red-500" /></div>
                  <h3 className="text-lg font-semibold text-foreground text-center mb-2">Mijozni o'chirish</h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    <span className="font-medium text-foreground">{allCustomers.find(c => c.phone === deleteConfirm)?.name}</span> mijozini o'chirmoqchimisiz?
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setDeleteConfirm(null)} className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors">Bekor qilish</button>
                    <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors">O'chirish</button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Customers;
