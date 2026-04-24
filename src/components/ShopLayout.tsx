import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useStore } from '@/stores/store';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, User, LogOut, Package, Info, Menu, X, Mail, Clock, Sun, Moon, Globe } from 'lucide-react';
import { useState } from 'react';
import { formatDate } from '@/stores/store';
import { useTranslation } from '@/lib/translations';

const ShopLayout = () => {
  const cart = useStore(s => s.cart);
  const user = useStore(s => s.user);
  const theme = useStore(s => s.theme);
  const language = useStore(s => s.language);
  const logout = useStore(s => s.logout);
  const setTheme = useStore(s => s.setTheme);
  const setLanguage = useStore(s => s.setLanguage);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileNav, setMobileNav] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const cartCount = cart.reduce((s, i) => s + i.quantity, 0);
  const t = useTranslation(language);

  const handleLogout = () => { logout(); navigate('/'); };

  const links = [
    { path: '/shop', label: t('catalog'), icon: Package },
    { path: '/shop/cart', label: t('cart'), icon: ShoppingCart },
    { path: '/shop/orders', label: t('orders'), icon: Package },
    { path: '/shop/about', label: t('about'), icon: Info },
  ];

  const languages = [
    { code: 'uz', label: "O'zbek", flag: '🇺🇿' },
    { code: 'ru', label: 'Русский', flag: '🇷🇺' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/shop" className="flex items-center gap-2">
            <div className="w-9 h-9 gold-gradient rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-primary">M</span>
            </div>
            <span className="text-lg font-bold text-foreground">Mebel<span className="text-gold">Pro</span></span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {links.map(l => (
              <Link
                key={l.path}
                to={l.path}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  location.pathname === l.path ? 'bg-gold/10 text-gold' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button onClick={() => setShowAccount(!showAccount)} className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <User className="h-5 w-5 text-foreground" />
            </button>
            <Link to="/shop/cart" className="relative p-2 rounded-lg hover:bg-muted transition-colors">
              <ShoppingCart className="h-5 w-5 text-foreground" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-gold text-gold-foreground text-xs w-5 h-5 rounded-full flex items-center justify-center font-semibold">{cartCount}</span>
              )}
            </Link>
            <button onClick={() => setMobileNav(!mobileNav)} className="p-2 rounded-lg hover:bg-muted md:hidden">
              {mobileNav ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {mobileNav && (
          <motion.nav initial={{ height: 0 }} animate={{ height: 'auto' }} className="md:hidden border-t border-border overflow-hidden">
            <div className="p-2 space-y-1">
              {links.map(l => (
                <Link key={l.path} to={l.path} onClick={() => setMobileNav(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm ${location.pathname === l.path ? 'bg-gold/10 text-gold font-medium' : 'text-muted-foreground'}`}>
                  <l.icon className="h-4 w-4" />
                  {l.label}
                </Link>
              ))}
            </div>
          </motion.nav>
        )}
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
                    <span className="text-lg font-bold text-gold">{user?.name?.[0] || 'U'}</span>
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
                    <span className="text-muted-foreground">••••••••</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">{user?.loginTime ? formatDate(user.loginTime) : 'Noma\'lum'}</span>
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

              {/* Language */}
              <div className="p-3 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-muted-foreground">{t('language')}</span>
                </div>
                <div className="flex gap-2">
                  {languages.map(lang => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code as 'uz' | 'ru' | 'en')}
                      className={`flex-1 p-2 rounded-lg border-2 transition-all ${
                        language === lang.code 
                          ? 'border-blue-500 bg-blue-500/20 shadow-lg shadow-blue-500/10' 
                          : 'border-border hover:border-blue-500/50'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                    </button>
                  ))}
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

      <main className="flex-1">
        <motion.div key={location.pathname} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default ShopLayout;
