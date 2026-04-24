import { useStore, formatSom } from '@/stores/store';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Search } from 'lucide-react';
import { useState } from 'react';

const Market = () => {
  const products = useStore(s => s.products);
  const [search, setSearch] = useState('');

  const inStock = products.filter(p => p.quantity > 0);
  const filtered = inStock.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  // Mock market prices
  const getMarketPrice = (p: typeof products[0]) => {
    const variance = 0.85 + Math.random() * 0.3;
    return Math.round(p.salePrice * variance);
  };

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Mahsulot qidirish..." className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" />
      </div>
      <p className="text-xs text-muted-foreground">Faqat omborda mavjud mahsulotlar ko'rsatilgan</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => {
          const marketPrice = getMarketPrice(p);
          const diff = ((p.salePrice - marketPrice) / marketPrice * 100).toFixed(1);
          const isHigher = p.salePrice > marketPrice;
          return (
            <motion.div key={p.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="bg-card rounded-xl p-4 card-shadow">
              <div className="flex gap-3">
                <img src={p.image} alt={p.name} className="w-16 h-14 rounded-lg object-cover" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">Bizning: <span className="font-medium text-foreground">{formatSom(p.salePrice)}</span></p>
                  <p className="text-xs text-muted-foreground">Bozor: <span className="font-medium">{formatSom(marketPrice)}</span></p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <div className={`flex items-center gap-1 text-xs font-medium ${isHigher ? 'text-destructive' : 'text-success'}`}>
                  {isHigher ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {isHigher ? '+' : ''}{diff}%
                </div>
                <span className="text-xs text-muted-foreground">{isHigher ? '↑ Qimmatroq' : '↓ Arzonroq'}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Market;
