import { useEffect, useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion } from 'framer-motion';
import { Search, FileText, Eye } from 'lucide-react';

const Orders = () => {
  const { sales, fetchSales } = useApiStore();
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<any>(null);

  useEffect(() => {
    const loadSales = async () => {
      setLoading(true);
      try {
        await fetchSales();
      } catch (error) {
        console.error('Failed to fetch sales:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('uz-UZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Filter sales by search query
  const filtered = sales.filter(sale =>
    sale.saleNumber.toLowerCase().includes(search.toLowerCase()) ||
    sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
    sale.customerPhone.includes(search)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gold border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Buyurtmalar</h1>
          <p className="text-sm text-muted-foreground mt-1">Barcha sotuvlar ro'yxati</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-card rounded-xl card-shadow p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Savdo raqami, mijoz ismi yoki telefon..."
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
          />
        </div>
      </div>

      {/* Professional Table */}
      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Chek №</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sana</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mijoz</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telefon</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mahsulotlar</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Sotuvchi</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Summa</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Batafsil</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
                    <p className="text-muted-foreground">
                      {search ? 'Savdo topilmadi' : 'Hali savdo yo\'q'}
                    </p>
                  </td>
                </tr>
              ) : (
                filtered.map((sale) => (
                  <motion.tr
                    key={sale.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="text-sm font-bold text-foreground font-mono">{sale.saleNumber}</span>
                    </td>
                    <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">
                      {formatDate(sale.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm font-medium text-foreground">{sale.customerName}</span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-foreground">{sale.customerPhone}</span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-foreground">
                        {sale.items.slice(0, 2).map((item, i) => (
                          <div key={i} className="text-xs">
                            {item.product.name} ({item.quantity})
                          </div>
                        ))}
                        {sale.items.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            +{sale.items.length - 2} ta yana
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-foreground">{sale.seller.name}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm font-bold text-gold">{formatSom(Number(sale.totalPrice))}</span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 rounded-lg transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                        Ko'rish
                      </button>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedSale && (
        <div 
          onClick={() => setSelectedSale(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card rounded-xl p-6 w-full max-w-2xl card-shadow relative max-h-[90vh] overflow-y-auto"
          >
            <button 
              onClick={() => setSelectedSale(null)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors"
            >
              <span className="text-xl text-muted-foreground">×</span>
            </button>

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-1">Savdo tafsilotlari</h2>
              <p className="text-sm text-muted-foreground">Chek #{selectedSale.saleNumber}</p>
            </div>

            {/* Customer & Sale Info */}
            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Mijoz</p>
                <p className="text-sm font-medium text-foreground">{selectedSale.customerName}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Telefon</p>
                <p className="text-sm font-medium text-foreground">{selectedSale.customerPhone}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sotuvchi</p>
                <p className="text-sm font-medium text-foreground">{selectedSale.seller.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Sana</p>
                <p className="text-sm font-medium text-foreground">{formatDate(selectedSale.createdAt)}</p>
              </div>
            </div>

            {/* Products */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-foreground mb-3">Mahsulotlar</h3>
              <div className="space-y-2">
                {selectedSale.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between bg-muted/30 rounded-lg p-3"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {item.quantity} × {formatSom(Number(item.price))}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {formatSom(Number(item.price) * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-base font-semibold text-foreground">Jami summa:</span>
                <span className="text-2xl font-bold text-gold">{formatSom(Number(selectedSale.totalPrice))}</span>
              </div>
            </div>

            <button
              onClick={() => setSelectedSale(null)}
              className="w-full mt-6 h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 transition-opacity"
            >
              Yopish
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Orders;
