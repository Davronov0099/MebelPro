import { useEffect, useState } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Package, ShoppingCart, ArrowUpRight, DollarSign } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from 'recharts';

const Dashboard = () => {
  const { products, sales, fetchProducts, fetchSales, fetchSalesStats } = useApiStore();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchProducts(),
          fetchSales(),
          fetchSalesStats().then(setStats),
        ]);
      } catch (error) {
        console.error('Dashboard data load error:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  // Calculate today's sales
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todaySales = sales.filter(s => new Date(s.createdAt) >= today);
  const todayRevenue = todaySales.reduce((sum, s) => sum + Number(s.totalPrice), 0);

  // Low stock products
  const lowStock = products.filter(p => p.quantity < 10).length;

  // Total products
  const totalProducts = products.length;

  const kpis = [
    { 
      label: 'Bugungi savdo', 
      value: formatSom(todayRevenue), 
      icon: TrendingUp, 
      color: 'bg-gold/10 text-gold',
      subtext: `${todaySales.length} ta savdo`
    },
    { 
      label: 'Jami daromad', 
      value: stats ? formatSom(Number(stats.totalRevenue)) : '0 so\'m', 
      icon: DollarSign, 
      color: 'bg-success/10 text-success',
      subtext: stats ? `${stats.totalSales} ta savdo` : '0 ta savdo'
    },
    { 
      label: 'Mahsulotlar', 
      value: String(totalProducts), 
      icon: Package, 
      color: 'bg-blue-500/10 text-blue-500',
      subtext: `${lowStock} ta kam qolgan`
    },
    { 
      label: 'Savdolar soni', 
      value: String(sales.length), 
      icon: ShoppingCart, 
      color: 'bg-purple-500/10 text-purple-500',
      subtext: 'Jami savdolar'
    },
  ];

  // Last 7 days sales
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    date.setHours(0, 0, 0, 0);
    return date;
  });

  const weeklyData = last7Days.map(date => {
    const dayName = date.toLocaleDateString('uz-UZ', { weekday: 'short' });
    const daySales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === date.getTime();
    });
    const revenue = daySales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
    return { day: dayName, sales: revenue };
  });

  // Top selling products
  const productSales = new Map<string, { name: string; sold: number }>();
  sales.forEach(sale => {
    sale.items.forEach(item => {
      const existing = productSales.get(item.productId);
      if (existing) {
        existing.sold += item.quantity;
      } else {
        productSales.set(item.productId, {
          name: item.product.name,
          sold: item.quantity,
        });
      }
    });
  });

  const topProducts = Array.from(productSales.values())
    .sort((a, b) => b.sold - a.sold)
    .slice(0, 5);

  // Sales by seller
  const sellerSales = stats?.salesBySeller || [];

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
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="bg-card rounded-xl p-4 card-shadow hover:card-shadow-hover transition-shadow"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                <p className="text-lg md:text-2xl font-bold text-foreground truncate">{kpi.value}</p>
              </div>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${kpi.color}`}>
                <kpi.icon className="h-4 w-4" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">{kpi.subtext}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Sales Chart */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.3 }} 
          className="lg:col-span-2 bg-card rounded-xl p-5 card-shadow"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Haftalik savdo</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,13%,88%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
              <YAxis 
                tick={{ fontSize: 12 }} 
                stroke="hsl(220,9%,46%)" 
                tickFormatter={v => v >= 1000000 ? `${(v / 1000000).toFixed(1)}M` : `${(v / 1000).toFixed(0)}K`} 
              />
              <Tooltip formatter={(v: number) => formatSom(v)} />
              <Line 
                type="monotone" 
                dataKey="sales" 
                stroke="hsl(43,52%,54%)" 
                strokeWidth={2.5} 
                dot={{ r: 4, fill: 'hsl(43,52%,54%)' }} 
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Sales by Seller */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.4 }} 
          className="bg-card rounded-xl p-5 card-shadow"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Sotuvchilar</h3>
          <div className="space-y-3">
            {sellerSales.length > 0 ? (
              sellerSales.map((seller: any) => (
                <div key={seller.sellerId ?? seller.sellerName} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{seller.sellerName}</p>
                    <p className="text-xs text-muted-foreground">{seller._count.id} ta savdo</p>
                  </div>
                  <p className="text-sm font-semibold text-gold">{formatSom(Number(seller._sum.totalPrice || 0))}</p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Hali savdo yo'q</p>
            )}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top products */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.5 }} 
          className="bg-card rounded-xl p-5 card-shadow"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Eng ko'p sotilgan</h3>
          {topProducts.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={topProducts} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 12 }} stroke="hsl(220,9%,46%)" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  tick={{ fontSize: 11 }} 
                  stroke="hsl(220,9%,46%)" 
                  width={110} 
                />
                <Tooltip />
                <Bar dataKey="sold" fill="hsl(43,52%,54%)" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-16">Hali savdo yo'q</p>
          )}
        </motion.div>

        {/* Recent sales */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.6 }} 
          className="bg-card rounded-xl p-5 card-shadow"
        >
          <h3 className="text-base font-semibold text-foreground mb-4">Oxirgi savdolar</h3>
          <div className="space-y-3">
            {sales.length > 0 ? (
              sales.slice(0, 5).map(sale => (
                <div key={sale.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sale.customerName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sale.createdAt).toLocaleString('uz-UZ', { 
                        day: '2-digit', 
                        month: '2-digit', 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">{formatSom(Number(sale.totalPrice))}</p>
                    <p className="text-xs text-muted-foreground">{sale.saleNumber}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Hali savdo yo'q</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Sales Table */}
      <motion.div 
        initial={{ opacity: 0, y: 16 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.7 }} 
        className="bg-card rounded-xl p-5 card-shadow"
      >
        <h3 className="text-base font-semibold text-foreground mb-4">Barcha savdolar</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Chek №</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Mijoz</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Telefon</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Mahsulotlar</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Sotuvchi</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Summa</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Sana</th>
              </tr>
            </thead>
            <tbody>
              {sales.length > 0 ? (
                sales.map((sale, index) => (
                  <tr key={sale.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${index % 2 === 0 ? 'bg-muted/10' : ''}`}>
                    <td className="py-3 px-4 text-sm text-foreground font-mono">{sale.saleNumber}</td>
                    <td className="py-3 px-4 text-sm text-foreground">{sale.customerName}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{sale.customerPhone}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">
                      <div className="max-w-xs">
                        {sale.items.map((item) => (
                          <div key={item.id} className="text-xs">
                            {item.product.name} × {item.quantity}
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{sale.seller?.name || 'N/A'}</td>
                    <td className="py-3 px-4 text-sm text-foreground font-semibold text-right">{formatSom(Number(sale.totalPrice))}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground text-right">
                      {new Date(sale.createdAt).toLocaleString('uz-UZ', { 
                        day: '2-digit', 
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-sm text-muted-foreground">
                    Hali savdo yo'q
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;
