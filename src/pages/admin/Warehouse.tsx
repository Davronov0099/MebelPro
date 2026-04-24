import { useState, useRef, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { formatSom } from '@/stores/store';
import { motion, AnimatePresence } from 'framer-motion';
import { Pencil, X, Warehouse as WarehouseIcon, Search } from 'lucide-react';
import { toast } from 'sonner';

const Warehouse = () => {
  const products = useApiStore(s => s.products);
  const fetchProducts = useApiStore(s => s.fetchProducts);
  const updateProductQuantity = useApiStore(s => s.updateProductQuantity);
  const [editId, setEditId] = useState<string | null>(null);
  const [newQty, setNewQty] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase())) ||
    (p.code && p.code.toLowerCase().includes(search.toLowerCase()))
  );

  // Auto-focus input when modal opens
  useEffect(() => {
    if (editId && inputRef.current) {
      const product = products.find(p => p.id === editId);
      if (product) {
        setNewQty(product.quantity.toString());
      }
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 100);
    }
  }, [editId, products]);

  const handleSave = async () => {
    if (!editId || !newQty) return;
    
    setLoading(true);
    try {
      await updateProductQuantity(editId, Number(newQty));
      toast.success('Miqdor yangilandi');
      setEditId(null);
      setNewQty('');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
      console.error('Update quantity error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (newQty && !loading) {
        handleSave();
      }
    }
  };

  const getStatus = (qty: number) => {
    if (qty < 5) return { label: 'Kritik', cls: 'bg-destructive/10 text-destructive', rowCls: 'bg-destructive/5' };
    if (qty <= 10) return { label: 'Kam', cls: 'bg-warning/10 text-warning', rowCls: '' };
    return { label: 'Yetarli', cls: 'bg-success/10 text-success', rowCls: '' };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{products.length} ta mahsulot omborda</p>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Mahsulot yoki kod qidirish..." 
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
          />
        </div>
      </div>
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Rasm</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Kod</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nomi</th>
              <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Kategoriya</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Miqdor</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Holat</th>
              <th className="text-center px-4 py-3 text-muted-foreground font-medium">Tahrirlash</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p, i) => {
              const s = getStatus(p.quantity);
              return (
                <motion.tr key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${s.rowCls}`}>
                  <td className="px-4 py-3"><img src={p.image} alt={p.name} className="w-10 h-8 rounded-lg object-cover" /></td>
                  <td className="px-4 py-3 font-mono text-sm text-gold font-semibold">{p.code || '---'}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-center font-semibold text-foreground">{p.quantity}</td>
                  <td className="px-4 py-3 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.cls}`}>{s.label}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => { setEditId(p.id); setNewQty(p.quantity.toString()); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"><Pencil className="h-3.5 w-3.5" /></button>
                  </td>
                </motion.tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {editId && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-card rounded-xl p-6 w-full max-w-sm card-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Miqdorni tahrirlash</h3>
                <button onClick={() => setEditId(null)} className="p-1.5 rounded-lg hover:bg-muted"><X className="h-4 w-4" /></button>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {products.find(p => p.id === editId)?.name}
              </p>
              <input 
                ref={inputRef}
                value={newQty} 
                onChange={e => setNewQty(e.target.value)} 
                onKeyDown={handleKeyDown}
                type="number" 
                placeholder="Yangi miqdor" 
                className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 mb-3" 
              />
              <button 
                onClick={handleSave} 
                disabled={!newQty || loading} 
                className="w-full h-10 gold-gradient text-primary font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
              >
                {loading ? 'Saqlanmoqda...' : 'Saqlash'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Warehouse;
