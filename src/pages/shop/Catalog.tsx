import { useState, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ShoppingCart, X, Plus, Minus, Zap } from 'lucide-react';
import { toast } from 'sonner';
import type { Product } from '@/services/api';

const formatSom = (n: number) => n.toLocaleString('uz-UZ') + ' so\'m';

const categories = ['Barchasi', 'Divanlar', 'Stollar', 'Stullar', 'Shkaflar', 'Karavotlar'];

const Catalog = () => {
  const { products, fetchProducts, addToCart } = useApiStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Barchasi');
  const [selected, setSelected] = useState<any | null>(null);
  const [qty, setQty] = useState(1);

  // Fetch products on mount
  useEffect(() => {
    const loadProducts = async () => {
      try {
        await fetchProducts();
      } catch (error) {
        console.error('Failed to fetch products:', error);
        toast.error('Mahsulotlarni yuklashda xatolik');
      }
    };
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const filtered = products.filter(p =>
    (category === 'Barchasi' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = (product: Product, quantity: number) => {
    addToCart(product, quantity);
    toast.success(`${product.name} savatga qo'shildi!`);
    setSelected(null);
    setQty(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot qidirish..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all active:scale-[0.97] ${
                category === c ? 'gold-gradient text-primary' : 'bg-card text-muted-foreground hover:text-foreground border border-border'
              }`}>{c}</button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((p, i) => (
          <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, duration: 0.4 }}
            className="bg-card rounded-xl overflow-hidden card-shadow hover:card-shadow-hover transition-all cursor-pointer group"
            onClick={() => { setSelected(p); setQty(1); }}>
            <div className="aspect-[4/3] overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-4">
              <p className="text-xs text-muted-foreground">{p.category}</p>
              <h3 className="text-sm font-semibold text-foreground mt-1 line-clamp-1">{p.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <p className="text-lg font-bold text-gold format-som">{formatSom(p.salePrice)}</p>
                <button onClick={(e) => { e.stopPropagation(); handleAdd(p, 1); }}
                  className="w-9 h-9 rounded-lg bg-gold/10 text-gold hover:bg-gold/20 flex items-center justify-center active:scale-[0.95] transition-all">
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-20" />
          <p>Mahsulot topilmadi</p>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <motion.div initial={{ scale: 0.9, y: 30 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 30 }}
              className="bg-card rounded-2xl w-full max-w-lg card-shadow overflow-hidden max-h-[90vh] overflow-y-auto">
              <div className="relative">
                <img src={selected.image} alt={selected.name} className="w-full aspect-video object-cover" />
                <button onClick={() => setSelected(null)} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 text-white flex items-center justify-center hover:bg-black/60">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-6">
                <p className="text-xs text-muted-foreground">{selected.category}</p>
                <h2 className="text-xl font-bold text-foreground mt-1">{selected.name}</h2>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{selected.description}</p>
                <p className="text-2xl font-bold text-gold mt-4 format-som">{formatSom(selected.salePrice)}</p>
                <div className="flex items-center gap-4 mt-4">
                  <span className="text-sm text-muted-foreground">Miqdor:</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95"><Minus className="h-3.5 w-3.5" /></button>
                    <span className="w-8 text-center font-semibold">{qty}</span>
                    <button onClick={() => setQty(qty + 1)} className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center hover:bg-muted/80 active:scale-95"><Plus className="h-3.5 w-3.5" /></button>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button onClick={() => handleAdd(selected, qty)} className="h-11 gold-gradient text-primary font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                    <ShoppingCart className="h-4 w-4" /> Savatga
                  </button>
                  <button onClick={() => handleAdd(selected, qty)} className="h-11 bg-primary text-primary-foreground font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.97] transition-all flex items-center justify-center gap-2">
                    <Zap className="h-4 w-4" /> Buyurtma
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Catalog;
