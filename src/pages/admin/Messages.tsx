import { useState, useMemo, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, FileText, TrendingUp, DollarSign, ShoppingBag, Users, Download } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, LineChart, Line, CartesianGrid } from 'recharts';
import * as XLSX from 'xlsx';
import { getSocket } from '@/services/socket';

const Messages = () => {
  const { sales, fetchSales, users, fetchUsers, products, fetchProducts } = useApiStore();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'general' | 'employees' | 'products' | 'charts'>('general');
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);

  useEffect(() => {
    fetchSales();
    fetchUsers();
    fetchProducts();

    // Real-time updates via Socket.IO
    const socket = getSocket();
    
    // Check if socket exists before adding listeners
    if (socket) {
      socket.on('saleCompleted', () => {
        fetchSales();
      });

      socket.on('saleUpdated', () => {
        fetchSales();
      });

      socket.on('productUpdated', () => {
        fetchProducts();
      });

      return () => {
        socket.off('saleCompleted');
        socket.off('saleUpdated');
        socket.off('productUpdated');
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

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

  const filtered = sales.filter(sale => 
    sale.customerName.toLowerCase().includes(search.toLowerCase()) ||
    sale.customerPhone.includes(search) ||
    (sale.seller?.name || '').toLowerCase().includes(search.toLowerCase())
  );

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter(sale => {
      const saleDate = new Date(sale.createdAt);
      saleDate.setHours(0, 0, 0, 0);
      return saleDate.getTime() === today.getTime();
    });
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weekSales = sales.filter(sale => new Date(sale.createdAt) >= weekAgo);
    const monthAgo = new Date();
    monthAgo.setMonth(monthAgo.getMonth() - 1);
    const monthSales = sales.filter(sale => new Date(sale.createdAt) >= monthAgo);
    const productCounts: { [key: string]: { name: string; count: number } } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        if (!productCounts[item.product.id]) {
          productCounts[item.product.id] = { name: item.product.name, count: 0 };
        }
        productCounts[item.product.id].count += item.quantity;
      });
    });
    const mostSoldProduct = Object.values(productCounts).sort((a, b) => b.count - a.count)[0];
    const topProducts = Object.values(productCounts).sort((a, b) => b.count - a.count).slice(0, 5);
    const cashierSales: { [key: string]: { name: string; total: number; count: number } } = {};
    sales.forEach(sale => {
      const sellerName = sale.seller?.name || 'N/A';
      if (!cashierSales[sellerName]) {
        cashierSales[sellerName] = { name: sellerName, total: 0, count: 0 };
      }
      cashierSales[sellerName].total += Number(sale.totalPrice);
      cashierSales[sellerName].count += 1;
    });
    const bestCashier = Object.values(cashierSales).sort((a, b) => b.total - a.total)[0];
    const topCashiers = Object.values(cashierSales).sort((a, b) => b.total - a.total).slice(0, 5);
    
    // Calculate profit and loss
    let totalProfit = 0;
    let totalLoss = 0;
    let totalCost = 0;
    
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const salePrice = Number(item.price);
        const costPrice = Number(item.product.costPrice || 0);
        const quantity = item.quantity;
        const itemProfit = (salePrice - costPrice) * quantity;
        
        totalCost += costPrice * quantity;
        
        if (itemProfit > 0) {
          totalProfit += itemProfit;
        } else if (itemProfit < 0) {
          totalLoss += Math.abs(itemProfit);
        }
      });
    });
    
    const netProfit = totalProfit - totalLoss;
    
    return {
      todayCount: todaySales.length,
      todayTotal: todaySales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0),
      weekTotal: weekSales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0),
      monthTotal: monthSales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0),
      totalRevenue: sales.reduce((sum, sale) => sum + Number(sale.totalPrice), 0),
      totalCost,
      totalProfit,
      totalLoss,
      netProfit,
      mostSoldProduct,
      bestCashier,
      topProducts,
      topCashiers,
    };
  }, [sales]);

  // Gold theme colors - different shades of gold
  const COLORS = ['#D4AF37', '#C5A028', '#B69121', '#A7821A', '#987313'];

  // Prepare chart data
  const topProductsData = useMemo(() => {
    return stats.topProducts?.map((p, i) => ({
      name: p.name.length > 15 ? p.name.substring(0, 15) + '...' : p.name,
      count: p.count,
      fill: COLORS[i % COLORS.length]
    })) || [];
  }, [stats.topProducts]);

  const cashierPerformanceData = useMemo(() => {
    return stats.topCashiers?.map((c, i) => ({
      name: c.name,
      total: c.total,
      count: c.count,
      fill: COLORS[i % COLORS.length]
    })) || [];
  }, [stats.topCashiers]);

  const productShareData = useMemo(() => {
    const productRevenue: { [key: string]: { name: string; value: number } } = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        const productName = item.product.name;
        if (!productRevenue[productName]) {
          productRevenue[productName] = { name: productName, value: 0 };
        }
        productRevenue[productName].value += Number(item.price) * item.quantity;
      });
    });
    return Object.values(productRevenue)
      .sort((a, b) => b.value - a.value)
      .slice(0, 5)
      .map((p, i) => ({
        ...p,
        fill: COLORS[i % COLORS.length]
      }));
  }, [sales]);

  const exportToExcel = () => {
    const exportData = filtered.map(sale => ({
      'Chek №': sale.saleNumber,
      'Sana': formatDate(sale.createdAt),
      'Mijoz': sale.customerName,
      'Telefon': sale.customerPhone,
      'Kassir': sale.seller?.name || 'N/A',
      'Mahsulotlar': sale.items.map(item => `${item.product.name} (${item.quantity})`).join(', '),
      'Summa': Number(sale.totalPrice),
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sotuvlar');
    const summaryData = [
      { "Ko'rsatkich": 'Jami sotuvlar', 'Qiymat': sales.length },
      { "Ko'rsatkich": 'Bugungi sotuvlar', 'Qiymat': stats.todayCount },
      { "Ko'rsatkich": 'Haftalik daromad', 'Qiymat': stats.weekTotal },
      { "Ko'rsatkich": 'Oylik daromad', 'Qiymat': stats.monthTotal },
      { "Ko'rsatkich": 'Jami daromad', 'Qiymat': stats.totalRevenue },
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Umumiy');
    XLSX.writeFile(wb, `Hisobotlar_${new Date().toLocaleDateString('uz-UZ')}.xlsx`);
  };

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
    const count = daySales.length;
    return { day: dayName, revenue, count };
  });

  const handlePrint = (sale: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Chek ochilmadi. Popup blocker ni o\'chiring.');
      return;
    }

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Chek - ${sale.saleNumber}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          .header h1 {
            font-size: 20px;
            margin-bottom: 5px;
            color: #000;
            font-weight: 900;
          }
          .header p {
            font-size: 12px;
            color: #000;
            font-weight: 600;
          }
          .info {
            margin-bottom: 15px;
            font-size: 12px;
            color: #000;
            font-weight: 600;
          }
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 5px;
          }
          .items {
            margin-bottom: 15px;
            border-top: 1px dashed #000;
            border-bottom: 1px dashed #000;
            padding: 10px 0;
          }
          .item {
            margin-bottom: 10px;
            font-size: 12px;
            color: #000;
          }
          .item-name {
            font-weight: bold;
            margin-bottom: 3px;
            color: #000;
          }
          .item-details {
            display: flex;
            justify-content: space-between;
            color: #333;
            font-weight: 600;
          }
          .total {
            margin-top: 15px;
            padding-top: 10px;
            border-top: 2px solid #000;
          }
          .total-row {
            display: flex;
            justify-content: space-between;
            font-size: 16px;
            font-weight: 900;
            margin-bottom: 5px;
            color: #000;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px dashed #000;
            font-size: 11px;
            color: #000;
            font-weight: 600;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>MEBEL PRO</h1>
          <p>Mebel do'koni</p>
          <p>Tel: +998 90 123 45 67</p>
        </div>

        <div class="info">
          <div class="info-row">
            <span>Chek №:</span>
            <strong>${sale.saleNumber}</strong>
          </div>
          <div class="info-row">
            <span>Sana:</span>
            <span>${formatDate(sale.createdAt)}</span>
          </div>
          <div class="info-row">
            <span>Mijoz:</span>
            <span>${sale.customerName}</span>
          </div>
          <div class="info-row">
            <span>Telefon:</span>
            <span>${sale.customerPhone}</span>
          </div>
          <div class="info-row">
            <span>Sotuvchi:</span>
            <span>${sale.seller?.name || 'N/A'}</span>
          </div>
        </div>

        <div class="items">
          ${sale.items.map((item: any) => `
            <div class="item">
              <div class="item-name">${item.product.name}</div>
              <div class="item-details">
                <span>${item.quantity} × ${formatSom(Number(item.price))}</span>
                <strong>${formatSom(Number(item.price) * item.quantity)}</strong>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="total">
          <div class="total-row">
            <span>JAMI:</span>
            <span>${formatSom(Number(sale.totalPrice))}</span>
          </div>
        </div>

        <div class="footer">
          <p>Xaridingiz uchun rahmat!</p>
          <p>Yana tashrif buyuring!</p>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(receiptHTML);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hisobotlar</h1>
          <p className="text-sm text-muted-foreground mt-1">Moliyaviy hisobotlar va statistika</p>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 px-4 py-2 bg-gold/10 hover:bg-gold/20 text-gold rounded-lg transition-colors">
          <Download className="h-4 w-4" />
          <span className="text-sm font-medium">Excel</span>
        </button>
      </div>
      
      {/* Summary Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <DollarSign className="h-5 w-5 opacity-80" />
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Jami summa</span>
          </div>
          <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.totalRevenue)}</p>
          <p className="text-[10px] opacity-70">{sales.length} ta sotuv</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Sof foyda</span>
          </div>
          <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.netProfit)}</p>
          <p className="text-[10px] opacity-70">Foyda - Zarar</p>
        </div>
        
        <div className="bg-gradient-to-br from-gold to-yellow-500 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 opacity-80" />
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Jami foyda</span>
          </div>
          <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.totalProfit)}</p>
          <p className="text-[10px] opacity-70">Foydali sotuvlar</p>
        </div>
        
        <div className="bg-gradient-to-br from-red-500 to-red-600 rounded-xl p-4 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-5 w-5 opacity-80 rotate-180" />
            <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Zarar</span>
          </div>
          <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.totalLoss)}</p>
          <p className="text-[10px] opacity-70">Zararli sotuvlar</p>
        </div>
      </div>

      <div className="flex gap-2 border-b border-border">
        <button onClick={() => setActiveTab('general')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'general' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Umumiy hisobotlar
        </button>
        <button onClick={() => setActiveTab('employees')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'employees' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Xodimlar
        </button>
        <button onClick={() => setActiveTab('products')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'products' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Mahsulotlar
        </button>
        <button onClick={() => setActiveTab('charts')} className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${activeTab === 'charts' ? 'border-gold text-gold' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Diagrammalar
        </button>
      </div>
      {activeTab === 'general' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Barcha sotuvlar</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Chek №</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Sana</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mijoz</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Telefon</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mahsulotlar</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Sotuvchi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Summa</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Chop etish</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-12 text-center">
                        <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-3 opacity-30" />
                        <p className="text-muted-foreground">Hech qanday sotuv topilmadi</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((sale) => (
                      <tr key={sale.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-4 text-sm font-bold text-foreground font-mono">{sale.saleNumber}</td>
                        <td className="px-4 py-4 text-sm text-foreground whitespace-nowrap">{formatDate(sale.createdAt)}</td>
                        <td className="px-4 py-4 text-sm font-medium text-foreground">{sale.customerName}</td>
                        <td className="px-4 py-4 text-sm text-muted-foreground">{sale.customerPhone}</td>
                        <td className="px-4 py-4">
                          <div className="text-sm text-foreground">
                            {sale.items.map((item, i) => (
                              <div key={i} className="text-xs">
                                {item.product.name} ({item.quantity} dona)
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-4 text-sm text-foreground">{sale.seller?.name || 'N/A'}</td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-sm font-bold text-gold">{formatSom(Number(sale.totalPrice))}</span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          <button
                            onClick={() => handlePrint(sale)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-green-400 bg-green-500/10 hover:bg-green-500/20 rounded-lg transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Chop etish
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'employees' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Xodimlar ro'yxati</h3>
              <p className="text-xs text-muted-foreground mt-1">
                {users?.filter(u => u.role !== 'omborchi').length || 0} ta sotuvchi xodim
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Xodim</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Rol</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Sotuvlar</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Sotuv summasi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Jami bonus</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users && users.filter(u => u.role !== 'omborchi').length > 0 ? (
                    <>
                      {users.filter(u => u.role !== 'omborchi').map((user) => {
                        const userSales = sales.filter(s => s.seller?.name === user.name);
                        const totalSales = userSales.length;
                        const totalRevenue = userSales.reduce((sum, s) => sum + Number(s.totalPrice), 0);
                        const bonus = totalRevenue * 0.02;
                        
                        return (
                          <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                            <td className="px-4 py-4 text-sm font-medium text-foreground">{user.name}</td>
                            <td className="px-4 py-4 text-sm text-muted-foreground capitalize">{user.role}</td>
                            <td className="px-4 py-4 text-center">
                              <button
                                onClick={() => setSelectedEmployee({ user, sales: userSales, totalSales, totalRevenue })}
                                className="text-sm text-blue-500 hover:text-blue-600 font-medium hover:underline transition-colors"
                              >
                                {totalSales === 0 ? '—' : `${totalSales} ta`}
                              </button>
                            </td>
                            <td className="px-4 py-4 text-right text-sm font-semibold text-foreground">
                              {totalRevenue === 0 ? '—' : formatSom(totalRevenue)}
                            </td>
                            <td className="px-4 py-4 text-right">
                              <span className="text-sm font-bold text-gold">
                                {bonus === 0 ? '0 so\'m' : formatSom(bonus)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-muted/50 font-bold">
                        <td className="px-4 py-4 text-sm text-foreground" colSpan={2}>Jami</td>
                        <td className="px-4 py-4 text-center text-sm text-foreground">
                          {sales.length} ta
                        </td>
                        <td className="px-4 py-4 text-right text-sm font-bold text-foreground">
                          {formatSom(stats.totalRevenue)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <span className="text-base font-bold text-gold">{formatSom(stats.totalRevenue * 0.02)}</span>
                        </td>
                      </tr>
                    </>
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                        <Users className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Sotuvchi xodimlar yo'q</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'products' && (
        <div className="space-y-6">
          <div className="bg-card rounded-xl card-shadow overflow-hidden">
            <div className="p-5 border-b border-border">
              <h3 className="text-base font-semibold text-foreground">Mahsulotlar ro'yxati</h3>
              <p className="text-xs text-muted-foreground mt-1">{products?.length || 0} ta mahsulot</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase">Mahsulot nomi</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-muted-foreground uppercase">Miqdori</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Dona narxi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Sotuv narxi</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase">Foyda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products && products.length > 0 ? (
                    products.map((product) => {
                      const costPrice = Number(product.costPrice || 0);
                      const salePrice = Number(product.salePrice || 0);
                      const profit = salePrice - costPrice;
                      const profitPercent = costPrice > 0 ? ((profit / costPrice) * 100).toFixed(1) : '0';
                      
                      return (
                        <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-4">
                            <div className="flex items-center gap-3">
                              {product.image && (
                                <img 
                                  src={product.image} 
                                  alt={product.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="text-sm font-medium text-foreground">{product.name}</p>
                                <p className="text-xs text-muted-foreground">Kod: {product.code}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                              product.quantity > 10 
                                ? 'bg-green-500/10 text-green-500' 
                                : product.quantity > 0 
                                ? 'bg-yellow-500/10 text-yellow-500' 
                                : 'bg-red-500/10 text-red-500'
                            }`}>
                              {product.quantity} dona
                            </span>
                          </td>
                          <td className="px-4 py-4 text-right text-sm text-muted-foreground">
                            {costPrice > 0 ? formatSom(costPrice) : '0 so\'m'}
                          </td>
                          <td className="px-4 py-4 text-right text-sm font-semibold text-foreground">
                            {formatSom(salePrice)}
                          </td>
                          <td className="px-4 py-4 text-right">
                            <div className="text-right">
                              <p className="text-sm font-bold text-green-500">
                                {formatSom(profit)}
                              </p>
                              <p className="text-xs text-muted-foreground">+{profitPercent}%</p>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                        <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                        <p>Mahsulotlar yo'q</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      {activeTab === 'charts' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="h-5 w-5 opacity-80" />
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Bugun</span>
              </div>
              <p className="text-lg lg:text-xl font-bold mb-0.5">{stats.todayCount} ta</p>
              <p className="text-[10px] opacity-70">{formatSom(stats.todayTotal)}</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="h-5 w-5 opacity-80" />
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Haftalik</span>
              </div>
              <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.weekTotal)}</p>
              <p className="text-[10px] opacity-70">Daromad</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <ShoppingBag className="h-5 w-5 opacity-80" />
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Oylik</span>
              </div>
              <p className="text-lg lg:text-xl font-bold mb-0.5">{formatSom(stats.monthTotal)}</p>
              <p className="text-[10px] opacity-70">Daromad</p>
            </div>
            
            <div className="bg-gradient-to-br from-gold to-yellow-500 rounded-xl p-4 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <Users className="h-5 w-5 opacity-80" />
                <span className="text-[10px] font-medium opacity-80 uppercase tracking-wide">Jami</span>
              </div>
              <p className="text-lg lg:text-xl font-bold mb-0.5">{sales.length} ta</p>
              <p className="text-[10px] opacity-70">{formatSom(stats.totalRevenue)}</p>
            </div>
          </div>

          {/* Charts Grid - 2x2 Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Weekly Sales Line Chart */}
            <div className="bg-card rounded-xl card-shadow p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Haftalik sotuvlar dinamikasi</h3>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => formatSom(value)}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#D4AF37" 
                    strokeWidth={2}
                    dot={{ fill: '#D4AF37', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Top Products Bar Chart */}
            <div className="bg-card rounded-xl card-shadow p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Eng ko'p sotilgan mahsulotlar</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={topProductsData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="count" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Cashier Performance */}
            <div className="bg-card rounded-xl card-shadow p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Sotuvchilar samaradorligi</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cashierPerformanceData} barSize={40}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => formatSom(value)}
                  />
                  <Bar dataKey="total" fill="#D4AF37" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Product Revenue Share Pie Chart */}
            <div className="bg-card rounded-xl card-shadow p-5">
              <h3 className="text-base font-semibold text-foreground mb-3">Mahsulotlar daromad ulushi</h3>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={productShareData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={70}
                    dataKey="value"
                    fill="#D4AF37"
                  >
                    {productShareData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${45 + index * 15}, 70%, ${50 - index * 5}%)`} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                    formatter={(value: any) => formatSom(value)}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Employee Sales Detail Modal */}
      <AnimatePresence>
        {selectedEmployee && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            onClick={() => setSelectedEmployee(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-card rounded-2xl p-6 w-full max-w-3xl shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-foreground">{selectedEmployee.user.name}</h3>
                  <p className="text-sm text-muted-foreground capitalize">{selectedEmployee.user.role}</p>
                </div>
                <button 
                  onClick={() => setSelectedEmployee(null)} 
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Jami sotuvlar</p>
                  <p className="text-2xl font-bold text-foreground">{selectedEmployee.totalSales} ta</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Jami summa</p>
                  <p className="text-2xl font-bold text-gold">{formatSom(selectedEmployee.totalRevenue)}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-4">
                  <p className="text-xs text-muted-foreground mb-1">Bonus (2%)</p>
                  <p className="text-2xl font-bold text-green-500">{formatSom(selectedEmployee.totalRevenue * 0.02)}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-foreground mb-3">Sotilgan mahsulotlar</h4>
                {selectedEmployee.sales.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p>Hech qanday sotuv yo'q</p>
                  </div>
                ) : (
                  selectedEmployee.sales.map((sale: any) => (
                    <div key={sale.id} className="bg-muted/20 rounded-lg p-4 hover:bg-muted/30 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="text-sm font-semibold text-foreground">Chek #{sale.saleNumber}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(sale.createdAt)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-gold">{formatSom(Number(sale.totalPrice))}</p>
                          <p className="text-xs text-muted-foreground">{sale.customerName}</p>
                        </div>
                      </div>
                      <div className="space-y-1">
                        {sale.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-xs">
                            <span className="text-foreground">{item.product.name}</span>
                            <span className="text-muted-foreground">{item.quantity} x {formatSom(Number(item.price))}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <button 
                onClick={() => setSelectedEmployee(null)}
                className="w-full mt-6 h-11 bg-gradient-to-r from-gold to-yellow-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
              >
                Yopish
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Messages;