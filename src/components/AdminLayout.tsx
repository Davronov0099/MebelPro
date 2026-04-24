import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Package, TrendingUp, UserCheck,
  Warehouse, BarChart3, ClipboardList, LogOut, Menu,
  Mail, Sun, Moon, User, MessageSquare, ShoppingCart
} from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from '@/lib/translations';

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const user = useApiStore(s => s.user);
  const theme = useApiStore(s => s.theme);
  const logout = useApiStore(s => s.logout);
  const setTheme = useApiStore(s => s.setTheme);
  const navigate = useNavigate();
  const location = useLocation();
  const t = useTranslation('uz'); // Always use Uzbek

  const handleLogout = () => { logout(); navigate('/'); };

  // Hide sidebar for yordamchi and omborchi only
  const showSidebar = user?.role === 'admin' || user?.role === 'kassir';

  const navItems = [
    { icon: LayoutDashboard, label: t('dashboard'), path: '/admin', roles: ['admin'] },
    { icon: Users, label: t('employees'), path: '/admin/employees', roles: ['admin'] },
    { icon: Package, label: t('products'), path: '/admin/products', roles: ['admin'] },
    { icon: TrendingUp, label: t('sales'), path: '/admin/sales', roles: ['admin', 'kassir'] },
    { icon: UserCheck, label: t('customers'), path: '/admin/customers', roles: ['admin', 'kassir'] },
    { icon: Warehouse, label: t('warehouse'), path: '/admin/warehouse', roles: ['admin'] },
    { icon: ClipboardList, label: 'Kassa xizmati', path: '/admin/kassir-queue', roles: ['kassir'] },
    { icon: ShoppingCart, label: t('cashierQueue'), path: '/admin/cashier-queue', roles: ['admin'] },
    { icon: BarChart3, label: t('market'), path: '/admin/market', roles: ['admin'] },
    { icon: ClipboardList, label: t('orders'), path: '/admin/orders', roles: ['admin'] },
    { icon: MessageSquare, label: t('messages'), path: '/admin/messages', roles: ['admin'] },
  ].filter(item => item.roles.includes(user?.role || ''));

  const SidebarContent = () => {
    return (
      <div className="flex flex-col h-full">
      <div className="p-5 flex items-center gap-3">
        <div className="w-10 h-10 gold-gradient rounded-xl flex items-center justify-center shrink-0">
          <span className="text-lg font-bold text-primary">M</span>
        </div>
        {sidebarOpen && <span className="text-lg font-bold text-white">Mebel<span className="text-gold">Pro</span></span>}
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(item => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                active
                  ? 'bg-blue-500/20 text-blue-400 shadow-lg shadow-blue-500/10'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t border-sidebar-border">
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white hover:bg-white/5 w-full transition-colors">
          <LogOut className="h-5 w-5 shrink-0" />
          {sidebarOpen && <span>{t('logout')}</span>}
        </button>
      </div>
    </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Desktop sidebar - only show for admin */}
      {showSidebar && (
        <aside className={`hidden lg:block sidebar-gradient ${sidebarOpen ? 'w-64' : 'w-[72px]'} transition-all duration-300 shrink-0 sticky top-0 h-screen`}>
          <SidebarContent />
        </aside>
      )}

      {/* Mobile sidebar overlay - only show for admin */}
      {showSidebar && mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 sidebar-gradient animate-slide-in-right" style={{ animationDirection: 'normal' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0">
          <div className="flex items-center gap-3">
            {/* Logo - show for omborchi and yordamchi only */}
            {(user?.role === 'omborchi' || user?.role === 'yordamchi') && (
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 gold-gradient rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-base font-bold text-primary">M</span>
                </div>
                <span className="text-base font-bold text-foreground hidden sm:inline">Mebel<span className="text-gold">Pro</span></span>
              </div>
            )}
            
            {showSidebar && (
              <button onClick={() => { if (window.innerWidth < 1024) setMobileOpen(true); else setSidebarOpen(!sidebarOpen); }} className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Menu className="h-5 w-5" />
              </button>
            )}
            <h1 className="text-lg font-semibold text-foreground">
              {user?.role === 'kassir' ? navItems.find(n => n.path === location.pathname)?.label || 'Savdo' : user?.role === 'yordamchi' ? 'Yordamchi' : user?.role === 'omborchi' ? 'Ombor' : navItems.find(n => n.path === location.pathname)?.label || t('dashboard')}
            </h1>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowAccount(!showAccount)} className="h-9 w-9 rounded-full bg-gold/20 flex items-center justify-center hover:bg-gold/30 transition-colors">
              <span className="text-sm font-semibold text-gold">{user?.name?.[0] || 'A'}</span>
            </button>
          </div>
        </header>
        
        {/* Account Dropdown */}
        <AnimatePresence>
          {showAccount && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowAccount(false)} />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="fixed top-16 right-4 z-50 w-80 bg-card rounded-xl card-shadow border border-border overflow-hidden"
              >
                {/* User Info */}
                <div className="p-4 border-b border-border">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center">
                      <span className="text-lg font-bold text-gold">{user?.name?.[0] || 'A'}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-foreground">{user?.name}</h3>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-xs">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-muted-foreground capitalize">{user?.role}</span>
                    </div>
                  </div>
                </div>

                {/* Theme Toggle */}
                <div className="p-3 border-b border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{t('theme')}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setTheme('light')}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        theme === 'light' 
                          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10' 
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      <Sun className={`h-4 w-4 mx-auto ${theme === 'light' ? 'text-blue-400' : 'text-foreground'}`} />
                    </button>
                    <button
                      onClick={() => setTheme('dark')}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        theme === 'dark' 
                          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10' 
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      <Moon className={`h-4 w-4 mx-auto ${theme === 'dark' ? 'text-blue-400' : 'text-foreground'}`} />
                    </button>
                  </div>
                </div>

                {/* Logout */}
                <button onClick={handleLogout} className="w-full p-3 flex items-center gap-2 text-sm text-destructive hover:bg-destructive/10 transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>{t('logout')}</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
