import { useState, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Pencil, Trash2, X, Package, Upload, QrCode } from 'lucide-react';
import { toast } from 'sonner';

const Products = () => {
  const { products, fetchProducts, createProduct, updateProduct, deleteProduct } = useApiStore();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingProduct, setDeletingProduct] = useState<{ id: string; name: string } | null>(null);
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    code: '',
    name: '', 
    category: 'Divanlar', 
    image: '', 
    costPrice: '', 
    salePrice: '', 
    quantity: '', 
    description: '' 
  });
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [showPrintConfirm, setShowPrintConfirm] = useState(false);
  const [productToPrint, setProductToPrint] = useState<any>(null);
  const [printQuantity, setPrintQuantity] = useState(1);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const formatSom = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + ' so\'m';
  };

  const handlePrintQR = (product: any) => {
    setProductToPrint(product);
    setPrintQuantity(1);
    setShowPrintConfirm(true);
  };

  const confirmPrintQR = () => {
    if (!productToPrint) return;

    // Create print window for each copy
    for (let i = 0; i < printQuantity; i++) {
      setTimeout(() => {
        const printWindow = window.open('', '_blank', 'width=600,height=400');
        if (!printWindow) {
          alert('Oyna ochilmadi. Popup blocker ni o\'chiring.');
          return;
        }

        // Generate QR code data as JSON (pipe-delimited format breaks on product names with | character)
        const qrData = JSON.stringify({
          code: productToPrint.code,
          name: productToPrint.name,
          price: Number(productToPrint.salePrice),
        });
        
        const qrHTML = `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>QR Label - ${productToPrint.name}</title>
            <style>
              * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
              }
              
              body {
                font-family: Arial, sans-serif;
                background: white;
                padding: 0;
                margin: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 3cm;
              }
              
              @page {
                size: 6cm 3cm;
                margin: 0;
              }
              
              .label-container {
                width: 6cm;
                height: 3cm;
                background: white;
                padding: 2mm;
                display: flex;
                flex-direction: row;
                align-items: center;
                justify-content: center;
                gap: 3mm;
              }
              
              .qr-section {
                width: 2.3cm;
                height: 2.3cm;
                min-width: 2.3cm;
                flex-shrink: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                background: white;
                padding: 1mm;
              }
              
              .qr-section img {
                width: 100%;
                height: 100%;
                display: block;
              }
              
              .info-section {
                flex: 1;
                display: flex;
                flex-direction: column;
                justify-content: center;
                gap: 0.5mm;
                overflow: hidden;
              }
              
              .product-name {
                font-size: 9pt;
                font-weight: 900;
                color: #000;
                line-height: 1;
                margin: 0;
                padding: 0;
                word-wrap: break-word;
                overflow: hidden;
                text-overflow: ellipsis;
                display: -webkit-box;
                -webkit-line-clamp: 2;
                -webkit-box-orient: vertical;
              }
              
              .product-code {
                font-size: 7pt;
                font-weight: 900;
                color: #000;
                line-height: 1.1;
                margin: 0;
                padding: 0;
              }
              
              .product-price {
                font-size: 10pt;
                font-weight: 900;
                color: #000;
                line-height: 1.1;
                margin: 0;
                padding: 0;
              }
              
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                
                .label-container {
                  page-break-after: avoid;
                }
              }
            </style>
          </head>
          <body>
            <div class="label-container">
              <div class="qr-section">
                <img src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}" alt="QR Code" />
              </div>
              <div class="info-section">
                <div class="product-name">${productToPrint.name}</div>
                <div class="product-code">BARCODE: ${productToPrint.code}</div>
                <div class="product-price">${formatSom(Number(productToPrint.salePrice))}</div>
              </div>
            </div>
            
            <script>
              // Wait for image to load, then print
              const img = document.querySelector('.qr-section img');
              img.onload = function() {
                setTimeout(function() {
                  window.print();
                  setTimeout(function() {
                    window.close();
                  }, 500);
                }, 300);
              };
              
              // Fallback if image fails to load
              img.onerror = function() {
                alert('QR kod yuklanmadi. Internetga ulanganingizni tekshiring.');
                window.close();
              };
            </script>
          </body>
          </html>
        `;

        printWindow.document.write(qrHTML);
        printWindow.document.close();
      }, i * 2000); // 2 second delay between each print
    }

    setShowPrintConfirm(false);
    setProductToPrint(null);
  };

  const filtered = products.filter(p => 
    (p.name && p.name.toLowerCase().includes(search.toLowerCase())) || 
    (p.code && p.code.toLowerCase().includes(search.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(search.toLowerCase()))
  );
  
  const categories = ['Divanlar', 'Stollar', 'Stullar', 'Shkaflar', 'Karavotlar', 'Boshqa'];

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Rasm hajmi 5MB dan kichik bo\'lishi kerak');
      return;
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Faqat rasm fayllarini yuklash mumkin');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setForm({ ...form, image: base64String });
      setImagePreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleAdd = async () => {
    if (!form.name || !form.salePrice || !form.costPrice) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (Number(form.costPrice) < 0 || Number(form.salePrice) < 0) {
      toast.error('Narx manfiy bo\'lishi mumkin emas');
      return;
    }
    if (Number(form.salePrice) < Number(form.costPrice)) {
      toast.error('Sotuv narxi tan narxidan kam bo\'lmasligi kerak');
      return;
    }

    setLoading(true);
    try {
      await createProduct({
        code: form.code.trim() || undefined, // Agar bo'sh bo'lsa, backend avtomatik generatsiya qiladi
        name: form.name,
        category: form.category,
        image: form.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        costPrice: Number(form.costPrice),
        salePrice: Number(form.salePrice),
        quantity: Number(form.quantity) || 0,
        description: form.description || '',
      });
      
      setForm({ code: '', name: '', category: 'Divanlar', image: '', costPrice: '', salePrice: '', quantity: '', description: '' });
      setImagePreview('');
      setShowAdd(false);
      toast.success('Mahsulot qo\'shildi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: typeof products[0]) => {
    setEditingProduct(product.id);
    setForm({
      code: product.code,
      name: product.name,
      category: product.category,
      image: product.image || '',
      costPrice: String(product.costPrice),
      salePrice: String(product.salePrice),
      quantity: String(product.quantity),
      description: product.description || '',
    });
    setImagePreview(product.image || '');
    setShowEdit(true);
  };

  const handleUpdate = async () => {
    if (!form.name || !form.code || !form.salePrice || !form.costPrice || !editingProduct) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (Number(form.costPrice) < 0 || Number(form.salePrice) < 0) {
      toast.error('Narx manfiy bo\'lishi mumkin emas');
      return;
    }
    if (Number(form.salePrice) < Number(form.costPrice)) {
      toast.error('Sotuv narxi tan narxidan kam bo\'lmasligi kerak');
      return;
    }

    setLoading(true);
    try {
      await updateProduct(editingProduct, {
        code: form.code,
        name: form.name,
        category: form.category,
        image: form.image || 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
        costPrice: Number(form.costPrice),
        salePrice: Number(form.salePrice),
        quantity: Number(form.quantity) || 0,
        description: form.description || '',
      });
      
      setForm({ code: '', name: '', category: 'Divanlar', image: '', costPrice: '', salePrice: '', quantity: '', description: '' });
      setImagePreview('');
      setShowEdit(false);
      setEditingProduct(null);
      toast.success('Mahsulot yangilandi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (product: typeof products[0]) => {
    setDeletingProduct({ id: product.id, name: product.name });
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingProduct) return;

    setLoading(true);
    try {
      await deleteProduct(deletingProduct.id);
      setShowDeleteConfirm(false);
      setDeletingProduct(null);
      toast.success('Mahsulot o\'chirildi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Mahsulot qidirish..." 
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
          />
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="h-10 px-4 gold-gradient text-primary text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Mahsulot qo'shish
        </button>
      </div>

      <div className="bg-card rounded-xl card-shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Rasm</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Kod</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Nomi</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden md:table-cell">Kategoriya</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Tan narxi</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Sotuv narxi</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Miqdor</th>
                <th className="text-center px-4 py-3 text-muted-foreground font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p, i) => (
                <motion.tr 
                  key={p.id} 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <img src={p.image} alt={p.name} className="w-12 h-10 rounded-lg object-cover" />
                  </td>
                  <td className="px-4 py-3 font-mono text-sm text-gold font-semibold">{p.code}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{p.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.category}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground hidden sm:table-cell">
                    {formatSom(Number(p.costPrice))}
                  </td>
                  <td className="px-4 py-3 text-right font-medium text-foreground">
                    {formatSom(Number(p.salePrice))}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      p.quantity < 5 ? 'bg-destructive/10 text-destructive' : 
                      p.quantity < 10 ? 'bg-warning/10 text-warning' : 
                      'bg-success/10 text-success'
                    }`}>
                      {p.quantity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <button 
                        onClick={() => handlePrintQR(p)} 
                        className="p-1.5 rounded-lg hover:bg-blue-500/10 transition-colors text-muted-foreground hover:text-blue-500"
                        title="QR kod chop etish"
                      >
                        <QrCode className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleEdit(p)} 
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(p)} 
                        className="p-1.5 rounded-lg hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground">
                    <Package className="h-10 w-10 mx-auto mb-2 opacity-30" />
                    Mahsulot topilmadi
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              className="bg-card rounded-xl p-6 w-full max-w-md card-shadow max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Yangi mahsulot</h3>
                <button 
                  onClick={() => { setShowAdd(false); setImagePreview(''); }} 
                  className="p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <input 
                    value={form.code} 
                    onChange={e => setForm({ ...form, code: e.target.value })} 
                    placeholder="Mahsulot kodi (bo'sh qoldiring - avtomatik)" 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                  />
                  <p className="text-xs text-muted-foreground mt-1 ml-1">Bo'sh qoldirsangiz, avtomatik generatsiya qilinadi</p>
                </div>
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Mahsulot nomi *" 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                />
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Mahsulot rasmi</label>
                  <div className="flex gap-3">
                    <label className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Rasm yuklash</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={() => { setForm({ ...form, image: '' }); setImagePreview(''); }} 
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:opacity-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    value={form.costPrice} 
                    onChange={e => setForm({ ...form, costPrice: e.target.value })} 
                    placeholder="Tan narxi *" 
                    type="number" 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                  />
                  <input 
                    value={form.salePrice} 
                    onChange={e => setForm({ ...form, salePrice: e.target.value })} 
                    placeholder="Sotuv narxi *" 
                    type="number" 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                  />
                </div>
                <input 
                  value={form.quantity} 
                  onChange={e => setForm({ ...form, quantity: e.target.value })} 
                  placeholder="Miqdor" 
                  type="number" 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                />
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Tavsif" 
                  rows={3} 
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none" 
                />
                <button 
                  onClick={handleAdd} 
                  disabled={!form.name || !form.salePrice || !form.costPrice || loading} 
                  className="w-full h-10 gold-gradient text-primary font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.95, y: 20 }} 
              className="bg-card rounded-xl p-6 w-full max-w-md card-shadow max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-foreground">Mahsulotni tahrirlash</h3>
                <button 
                  onClick={() => { setShowEdit(false); setEditingProduct(null); setImagePreview(''); }} 
                  className="p-1.5 rounded-lg hover:bg-muted"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="space-y-4">
                <input 
                  value={form.code} 
                  onChange={e => setForm({ ...form, code: e.target.value })} 
                  placeholder="Mahsulot kodi *" 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                />
                <input 
                  value={form.name} 
                  onChange={e => setForm({ ...form, name: e.target.value })} 
                  placeholder="Mahsulot nomi *" 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                />
                <select 
                  value={form.category} 
                  onChange={e => setForm({ ...form, category: e.target.value })} 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50"
                >
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                
                {/* Image Upload */}
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Mahsulot rasmi</label>
                  <div className="flex gap-3">
                    <label className="flex-1 h-10 px-3 rounded-lg border border-border bg-background text-sm flex items-center justify-center gap-2 cursor-pointer hover:bg-muted transition-colors">
                      <Upload className="h-4 w-4" />
                      <span>Rasm yuklash</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageChange} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                  {imagePreview && (
                    <div className="mt-3 relative">
                      <img src={imagePreview} alt="Preview" className="w-full h-32 object-cover rounded-lg" />
                      <button 
                        onClick={() => { setForm({ ...form, image: '' }); setImagePreview(''); }} 
                        className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground hover:opacity-90"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <input 
                    value={form.costPrice} 
                    onChange={e => setForm({ ...form, costPrice: e.target.value })} 
                    placeholder="Tan narxi *" 
                    type="number" 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                  />
                  <input 
                    value={form.salePrice} 
                    onChange={e => setForm({ ...form, salePrice: e.target.value })} 
                    placeholder="Sotuv narxi *" 
                    type="number" 
                    className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                  />
                </div>
                <input 
                  value={form.quantity} 
                  onChange={e => setForm({ ...form, quantity: e.target.value })} 
                  placeholder="Miqdor" 
                  type="number" 
                  className="w-full h-10 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50" 
                />
                <textarea 
                  value={form.description} 
                  onChange={e => setForm({ ...form, description: e.target.value })} 
                  placeholder="Tavsif" 
                  rows={3} 
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none" 
                />
                <button 
                  onClick={handleUpdate} 
                  disabled={!form.name || !form.code || !form.salePrice || !form.costPrice || loading} 
                  className="w-full h-10 gold-gradient text-primary font-semibold text-sm rounded-lg hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {loading ? 'Yangilanmoqda...' : 'Yangilash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && deletingProduct && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="bg-card rounded-xl p-6 w-full max-w-md card-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                  <Trash2 className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Mahsulotni o'chirish</h3>
                  <p className="text-sm text-muted-foreground mt-1">Bu amalni qaytarib bo'lmaydi</p>
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-3 mb-5">
                <p className="text-sm text-foreground">
                  <span className="font-semibold">{deletingProduct.name}</span> mahsulotini o'chirishni xohlaysizmi?
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => { setShowDeleteConfirm(false); setDeletingProduct(null); }} 
                  disabled={loading}
                  className="flex-1 h-10 px-4 rounded-lg border border-border bg-background text-foreground text-sm font-medium hover:bg-muted transition-colors disabled:opacity-40"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={handleDeleteConfirm} 
                  disabled={loading}
                  className="flex-1 h-10 px-4 rounded-lg bg-destructive text-destructive-foreground text-sm font-semibold hover:opacity-90 active:scale-[0.97] transition-all disabled:opacity-40"
                >
                  {loading ? 'O\'chirilmoqda...' : 'O\'chirish'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Print QR Confirmation Modal */}
      <AnimatePresence>
        {showPrintConfirm && productToPrint && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }} 
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-card rounded-2xl p-6 w-full max-w-md shadow-2xl"
            >
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <QrCode className="h-8 w-8 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2">QR kod chop etish</h3>
                <p className="text-sm text-muted-foreground">
                  {productToPrint.name} mahsuloti uchun QR kod chop etmoqchimisiz?
                </p>
              </div>

              <div className="bg-muted/30 rounded-lg p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Mahsulot:</span>
                  <span className="font-medium text-foreground">{productToPrint.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kod:</span>
                  <span className="font-mono font-medium text-foreground">{productToPrint.code}</span>
                </div>
                <div className="flex justify-between text-sm pt-2 border-t border-border">
                  <span className="text-muted-foreground">Narx:</span>
                  <span className="text-lg font-bold text-gold">{formatSom(Number(productToPrint.salePrice))}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground">Nechta chop etish:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPrintQuantity(Math.max(1, printQuantity - 1))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-foreground"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={printQuantity}
                      onChange={(e) => setPrintQuantity(Math.max(1, Math.min(100, Number(e.target.value) || 1)))}
                      className="w-16 h-8 text-center border border-border rounded-lg bg-background text-foreground font-semibold"
                    />
                    <button
                      onClick={() => setPrintQuantity(Math.min(100, printQuantity + 1))}
                      className="w-8 h-8 rounded-lg bg-muted hover:bg-muted/80 flex items-center justify-center font-bold text-foreground"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setShowPrintConfirm(false);
                    setProductToPrint(null);
                  }}
                  className="flex-1 h-11 border border-border rounded-xl font-semibold hover:bg-muted transition-colors"
                >
                  Bekor qilish
                </button>
                <button 
                  onClick={confirmPrintQR}
                  className="flex-1 h-11 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity shadow-lg"
                >
                  Chop etish
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Products;
