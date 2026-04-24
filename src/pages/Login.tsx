import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiStore } from '@/stores/apiStore';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, Loader2, ArrowLeft } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useApiStore(s => s.login);
  const navigate = useNavigate();

  const handleSubmit = async (e?: any) => {
    if (e) {
      e.preventDefault?.();
      e.stopPropagation?.();
    }
    
    setError('');
    setLoading(true);
    
    try {
      const ok = await login(email, password);
      
      if (ok) {
        // All staff roles redirect to /admin
        navigate('/admin');
      } else {
        setError('Login yoki parol noto\'g\'ri');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Xatolik yuz berdi. Qaytadan urinib ko\'ring.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left branding */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex lg:w-1/2 sidebar-gradient items-center justify-center p-12 relative overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=1200&fit=crop)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div className="relative z-10 text-center max-w-md">
          <div className="w-20 h-20 gold-gradient rounded-2xl mx-auto mb-8 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">M</span>
          </div>
          <h1 className="text-4xl font-bold text-white mb-4" style={{ lineHeight: '1.15' }}>Mebel<span className="text-gold">Pro</span></h1>
          <p className="text-white/70 text-lg leading-relaxed">Professional mebel do'koni boshqaruv tizimi. Savdo, ombor, mijozlar — barchasi bir joyda.</p>
          <div className="mt-12 grid grid-cols-3 gap-6 text-center">
            {[['2,450+', 'Mahsulotlar'], ['1,200+', 'Mijozlar'], ['98%', 'Mamnunlik']].map(([v, l]) => (
              <div key={l}>
                <div className="text-2xl font-bold text-gold">{v}</div>
                <div className="text-sm text-white/50 mt-1">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Right form */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="flex-1 flex items-center justify-center p-8 bg-background"
      >
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-8 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            Bosh sahifaga qaytish
          </button>

          <div className="lg:hidden w-14 h-14 gold-gradient rounded-xl mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-primary">M</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground text-center lg:text-left">Tizimga kirish</h2>
          <p className="text-muted-foreground mt-2 text-center lg:text-left">Hisobingizga kiring davom etish uchun</p>

          <div className="mt-8 space-y-5">
            {error && (
              <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">{error}</div>
            )}
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin01"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                  className="w-full h-11 pl-10 pr-4 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  required
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Parol</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e as any)}
                  className="w-full h-11 pl-10 pr-10 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold transition-all"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <input type="checkbox" className="rounded border-border" />
                Eslab qol
              </label>
              <button type="button" className="text-sm text-gold hover:underline">Parolni unutdim?</button>
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full h-11 gold-gradient text-primary font-semibold rounded-lg hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {loading ? 'Kirish...' : 'Kirish'}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
