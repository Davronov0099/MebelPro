import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BarChart3, Package, Users, ShoppingCart, Shield, Zap,
  Star, ArrowRight, Menu, X, Send,
  TrendingUp, Clock, Award, CheckCircle,
  Phone, Mail, MapPin, ChevronDown, Loader2, AlertCircle,
} from 'lucide-react';
import { sendToTelegram } from '@/services/telegram';

// ─── Animated counter hook ────────────────────────────────────────────────────
function useCounter(end: number, started: boolean, duration = 2000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!started) return;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [end, started, duration]);
  return val;
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface NavItem { id: string; label: string }
interface Feature { icon: React.ReactNode; title: string; desc: string }
interface Testimonial { name: string; role: string; company: string; text: string; rating: number }

// ─── Static data ──────────────────────────────────────────────────────────────
const NAV_ITEMS: NavItem[] = [
  { id: 'hero',         label: 'Bosh sahifa' },
  { id: 'features',    label: "Ma'lumotlar" },
  { id: 'stats',       label: 'Statistika' },
  { id: 'testimonials',label: 'Sharhlar' },
  { id: 'contact',     label: 'Aloqa' },
];

const FEATURES: Feature[] = [
  {
    icon: <Package className="h-6 w-6" />,
    title: 'Mahsulot Boshqaruvi',
    desc: "2,450+ mebel mahsulotini oson boshqaring. Toifalar, narxlar va ombor holati real vaqtda.",
  },
  {
    icon: <ShoppingCart className="h-6 w-6" />,
    title: 'Buyurtma Tizimi',
    desc: "Buyurtmalarni qabul qilish, kuzatish va yetkazib berish jarayonini to'liq avtomatlashtiring.",
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Mijozlar Bazasi',
    desc: "1,200+ mijoz ma'lumotlari. Xarid tarixi, maxsus takliflar — barchasi qulay bir joyda.",
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Savdo Tahlili',
    desc: "Kunlik, oylik va yillik savdo hisobotlari. Tendentsiyalar va prognozlar bilan ishlang.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Ko'p Darajali Rollar",
    desc: "Admin, kassir, omborchi — har bir xodim faqat o'z vakolati doirasida ishlaydi.",
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Real Vaqt Sinxronizatsiya',
    desc: "WebSocket texnologiyasi: barcha o'zgarishlar darhol barcha qurilmalarda aks etadi.",
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Akbar Toshmatov',
    role: "Do'kon Egasi",
    company: 'Comfort Mebel, Toshkent',
    text: "MebelPro savdolarimizni 40% ga oshirdi. Ombor nazorati va buyurtma tizimi ayniqsa qulay. Har kuni ishlatamiz.",
    rating: 5,
  },
  {
    name: 'Nilufar Yusupova',
    role: 'Bosh Buxgalter',
    company: 'Royal Furniture, Samarqand',
    text: "Hisobotlar tizimi ajoyib. Avval hamma narsani qo'lda qilardik, endi bir tugma bilan barcha moliyaviy ma'lumotlar oldimda.",
    rating: 5,
  },
  {
    name: 'Jasur Nazarov',
    role: 'Savdo Menejeri',
    company: 'Premium Home, Namangan',
    text: "Kassir interfeysi juda sodda. Yangi xodimlar bir kunda o'rganib oladi. Texnik yordam ham tez javob beradi.",
    rating: 5,
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const SectionHeader = ({
  badge, title, subtitle, dark,
}: { badge: string; title: string; subtitle: string; dark: boolean }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6 }}
    className="text-center max-w-2xl mx-auto"
  >
    <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold tracking-widest uppercase mb-4 ${
      dark
        ? 'border border-gold/30 bg-gold/10 text-gold'
        : 'border border-gold/40 bg-gold/10 text-gold'
    }`}>
      {badge}
    </div>
    <h2
      className={`text-3xl lg:text-4xl font-bold mb-4 ${dark ? 'text-white' : 'text-foreground'}`}
      style={{ fontFamily: "'Playfair Display', serif", lineHeight: 1.2 }}
    >
      {title}
    </h2>
    <p className={`text-base leading-relaxed ${dark ? 'text-white/55' : 'text-muted-foreground'}`}>
      {subtitle}
    </p>
  </motion.div>
);

const FeatureCard = ({ feature, index }: { feature: Feature; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.08 }}
    whileHover={{ y: -5, transition: { duration: 0.2 } }}
    className="group p-6 rounded-2xl border border-border bg-card hover:border-gold/40 hover:shadow-lg transition-all cursor-default"
  >
    <div className="w-12 h-12 rounded-xl gold-gradient flex items-center justify-center text-primary mb-5 group-hover:scale-110 transition-transform duration-200">
      {feature.icon}
    </div>
    <h3 className="text-foreground font-semibold text-base mb-2">{feature.title}</h3>
    <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
  </motion.div>
);

const AnimatedStat = ({ value, suffix, label }: { value: number; suffix: string; label: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const count = useCounter(value, inView);
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
    >
      <div
        className="text-4xl lg:text-5xl font-bold text-gold mb-2"
        style={{ fontFamily: "'Playfair Display', serif" }}
      >
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-white/50 text-xs uppercase tracking-widest">{label}</div>
    </motion.div>
  );
};

const TestimonialCard = ({ testimonial, index }: { testimonial: Testimonial; index: number }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="flex flex-col p-6 rounded-2xl border border-border bg-card hover:border-gold/30 hover:shadow-md transition-all"
  >
    <div className="flex gap-0.5 mb-4">
      {Array.from({ length: testimonial.rating }).map((_, i) => (
        <Star key={i} className="h-4 w-4 text-gold" style={{ fill: 'hsl(var(--accent-gold))' }} />
      ))}
    </div>
    <blockquote className="text-foreground/80 text-sm leading-relaxed flex-1 mb-5">
      "{testimonial.text}"
    </blockquote>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-full gold-gradient flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
        {testimonial.name[0]}
      </div>
      <div>
        <p className="text-foreground font-semibold text-sm">{testimonial.name}</p>
        <p className="text-muted-foreground text-xs">{testimonial.role} · {testimonial.company}</p>
      </div>
    </div>
  </motion.div>
);

const ContactInfoCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: string }) => (
  <div className="flex items-start gap-4 p-4 rounded-2xl border border-border bg-card">
    <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center text-primary flex-shrink-0">
      {icon}
    </div>
    <div>
      <p className="text-muted-foreground text-xs mb-0.5">{title}</p>
      <p className="text-foreground font-medium text-sm">{value}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const LandingPage = () => {
  const [menuOpen,   setMenuOpen]  = useState(false);
  const [scrolled,   setScrolled]  = useState(false);
  const [formData,   setFormData]  = useState({ name: '', email: '', message: '' });
  const [formState,  setFormState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [formError,  setFormError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState('loading');
    setFormError('');
    try {
      await sendToTelegram(formData);
      setFormState('success');
      setFormData({ name: '', email: '', message: '' });
      setTimeout(() => setFormState('idle'), 6000);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
      setFormState('error');
      setTimeout(() => setFormState('idle'), 5000);
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">

      {/* ══════════════════════════════════════════════════════════════
          HEADER
      ══════════════════════════════════════════════════════════════ */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-background/95 backdrop-blur-md border-b border-border shadow-sm'
            : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <button onClick={() => scrollTo('hero')} className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <span className="text-lg font-bold text-primary">M</span>
            </div>
            <span
              className={`text-xl font-bold transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Mebel<span className="text-gold">Pro</span>
            </span>
          </button>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map(item => (
              <button
                key={item.id}
                onClick={() => scrollTo(item.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all hover:text-gold ${
                  scrolled
                    ? 'text-muted-foreground hover:bg-muted'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/login')}
              className="hidden md:flex items-center gap-2 px-5 py-2.5 gold-gradient rounded-xl text-sm font-semibold text-primary hover:opacity-90 active:scale-95 transition-all"
              style={{ boxShadow: '0 4px 16px rgba(201,168,76,0.35)' }}
            >
              Kirish
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
            <button
              className={`md:hidden p-2 rounded-lg transition-colors ${scrolled ? 'text-foreground' : 'text-white'}`}
              onClick={() => setMenuOpen(v => !v)}
              aria-label="Menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-background/98 backdrop-blur-md border-b border-border"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
                {NAV_ITEMS.map(item => (
                  <button
                    key={item.id}
                    onClick={() => scrollTo(item.id)}
                    className="text-left px-4 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 pb-1">
                  <button
                    onClick={() => navigate('/login')}
                    className="w-full px-5 py-2.5 gold-gradient rounded-xl text-sm font-semibold text-primary hover:opacity-90 transition-all"
                  >
                    Tizimga Kirish
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ══════════════════════════════════════════════════════════════
          HERO
      ══════════════════════════════════════════════════════════════ */}
      <section
        id="hero"
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background: 'linear-gradient(150deg, hsl(240,33%,9%) 0%, hsl(230,40%,13%) 40%, hsl(220,50%,16%) 100%)',
        }}
      >
        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: [
              'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)',
              'linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            ].join(','),
            backgroundSize: '60px 60px',
          }}
        />
        {/* Glow blobs */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[120px]"
          style={{ background: 'hsl(43,52%,54%)', opacity: 0.07 }}
        />
        <div
          className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px]"
          style={{ background: 'hsl(220,50%,30%)', opacity: 0.2 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* ── Left ─────────────────────────────────── */}
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-gold/30 bg-gold/10 mb-8"
              >
                <Award className="h-3.5 w-3.5 text-gold" />
                <span className="text-xs font-semibold text-gold tracking-wide">
                  O'zbekistondagi #1 Mebel Boshqaruv Tizimi
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.1 }}
                className="text-5xl lg:text-[3.6rem] font-bold text-white leading-[1.1] mb-6"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                Mebel Biznesingizni{' '}
                <span className="relative">
                  <span className="text-gold">Professional</span>
                  {/* Underline accent */}
                  <svg
                    className="absolute -bottom-1 left-0 w-full"
                    height="5"
                    viewBox="0 0 300 5"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M0 3 Q150 0 300 3"
                      stroke="hsl(43,52%,54%)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.55"
                    />
                  </svg>
                </span>{' '}
                Darajaga Olib Chiqing
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-lg text-white/60 leading-relaxed mb-10 max-w-xl"
              >
                Savdo, ombor, mijozlar va xodimlarni boshqarish — barchasi bitta qulay tizimda.
                Real vaqt ma'lumotlari bilan biznesingizni yangi bosqichga olib chiqing.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex flex-wrap gap-4 mb-12"
              >
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-2 px-7 py-3.5 gold-gradient rounded-xl font-semibold text-primary text-base hover:opacity-90 active:scale-95 transition-all"
                  style={{ boxShadow: '0 8px 32px rgba(201,168,76,0.35)' }}
                >
                  Tizimga Kirish
                  <ArrowRight className="h-4 w-4" />
                </button>
                <button
                  onClick={() => scrollTo('features')}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-white/80 border border-white/20 hover:border-gold/40 hover:text-gold hover:bg-gold/5 text-base transition-all"
                >
                  Ko'proq bilish
                  <ChevronDown className="h-4 w-4" />
                </button>
              </motion.div>

              {/* Trust pills */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                className="flex flex-wrap items-center gap-5"
              >
                {[
                  ["500+", "Do'kon foydalanadi"],
                  ["99.9%", 'Uptime kafolati'],
                  ["24/7",  'Texnik yordam'],
                ].map(([v, l]) => (
                  <div key={l} className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                    <span className="text-sm text-white/55">
                      <strong className="text-white/90">{v}</strong> {l}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* ── Right: dashboard preview ─────────────── */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.35 }}
              className="hidden lg:block relative"
            >
              {/* Main card */}
              <div
                className="rounded-2xl p-6 border border-white/10 backdrop-blur-sm"
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <p className="text-white/45 text-xs uppercase tracking-widest mb-1">Bugungi Savdo</p>
                    <p
                      className="text-3xl font-bold text-white"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      12 450 000 so'm
                    </p>
                    <p className="text-gold text-xs mt-1.5 flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      +18.5% o'tgan haftaga nisbatan
                    </p>
                  </div>
                  <div className="w-12 h-12 gold-gradient rounded-xl flex items-center justify-center flex-shrink-0">
                    <BarChart3 className="h-6 w-6 text-primary" />
                  </div>
                </div>

                {/* Mini bar chart */}
                <div className="flex items-end gap-1.5 h-16">
                  {[40,60,45,78,55,88,65,82,58,92,72,100].map((h, i) => (
                    <motion.div
                      key={i}
                      initial={{ scaleY: 0, originY: 1 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.4, delay: 0.6 + i * 0.045 }}
                      className="flex-1 rounded-sm origin-bottom"
                      style={{
                        height: `${h}%`,
                        background: i === 11
                          ? 'hsl(43,52%,54%)'
                          : 'rgba(255,255,255,0.14)',
                      }}
                    />
                  ))}
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                  {[['48', 'Buyurtmalar'], ['24', 'Yangi Mijozlar'], ['6', 'Xodimlar']].map(([v, l]) => (
                    <div key={l} className="text-center">
                      <p className="text-white text-base font-bold">{v}</p>
                      <p className="text-white/40 text-xs">{l}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Floating card — top right */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute -top-7 -right-7 rounded-2xl p-4 border border-white/15 backdrop-blur-md shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <Package className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">2,450+</p>
                    <p className="text-white/40 text-xs">Mahsulotlar</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — bottom left */}
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
                className="absolute -bottom-7 -left-7 rounded-2xl p-4 border border-white/15 backdrop-blur-md shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Users className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">1,200+</p>
                    <p className="text-white/40 text-xs">Mijozlar</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating card — mid right */}
              <motion.div
                animate={{ y: [0, -7, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1.2 }}
                className="absolute top-1/2 -translate-y-1/2 -right-10 rounded-2xl p-4 border border-gold/25 backdrop-blur-md shadow-xl"
                style={{ background: 'rgba(201,168,76,0.1)' }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg gold-gradient flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">98%</p>
                    <p className="text-white/40 text-xs">Mamnunlik</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          onClick={() => scrollTo('features')}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 hover:text-white/60 transition-colors"
        >
          <span className="text-[10px] tracking-widest uppercase">Pastga</span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            className="w-5 h-8 rounded-full border border-current flex items-start justify-center pt-1.5"
          >
            <div className="w-1 h-1.5 rounded-full bg-current" />
          </motion.div>
        </motion.button>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FEATURES
      ══════════════════════════════════════════════════════════════ */}
      <section id="features" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Ma'lumotlar"
            title="Biznesingiz Uchun Barcha Zarur Vositalar"
            subtitle="MebelPro — mebel sohasiga maxsus yaratilgan to'liq boshqaruv tizimi. Har bir xususiyat sizning vaqtingizni tejashga mo'ljallangan."
            dark={false}
          />
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
            {FEATURES.map((feature, i) => (
              <FeatureCard key={i} feature={feature} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          STATS
      ══════════════════════════════════════════════════════════════ */}
      <section id="stats" className="py-24 sidebar-gradient relative overflow-hidden">
        {/* Dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-[120px]"
          style={{ background: 'hsl(43,52%,54%)', opacity: 0.1 }}
        />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Statistika"
            title="Raqamlarda MebelPro"
            subtitle="500 dan ortiq mebel do'konlari ishonch bilan foydalanayotgan yagona tizim"
            dark={true}
          />

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mt-14">
            <AnimatedStat value={500}   suffix="+"  label="Faol Do'konlar" />
            <AnimatedStat value={2450}  suffix="+"  label="Mahsulotlar" />
            <AnimatedStat value={45000} suffix="+"  label="Buyurtmalar" />
            <AnimatedStat value={98}    suffix="%"  label="Mamnunlik Darajasi" />
          </div>

          {/* Process cards */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Clock className="h-5 w-5" />,
                title: '5 Daqiqada Boshlang',
                desc: "Ro'yxatdan o'ting va darhol ishlashni boshlang. Murakkab sozlashlar kerak emas.",
              },
              {
                icon: <Shield className="h-5 w-5" />,
                title: "Ma'lumotlar Xavfsiz",
                desc: "Barcha ma'lumotlar shifrlangan va muntazam zahira nusxalari avtomatik olinadi.",
              },
              {
                icon: <TrendingUp className="h-5 w-5" />,
                title: "Doim O'sib Boring",
                desc: 'Oylik hisobotlar va tahlillar orqali biznesingizni kengaytiring.',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex gap-4 p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm"
              >
                <div className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center flex-shrink-0 text-primary">
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">{item.title}</h3>
                  <p className="text-white/50 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          TESTIMONIALS
      ══════════════════════════════════════════════════════════════ */}
      <section id="testimonials" className="py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Sharhlar"
            title="Mijozlarimiz Nima Deydi"
            subtitle="O'zbekiston bo'ylab 500+ mebel do'koni egalarining fikrlari"
            dark={false}
          />
          <div className="grid md:grid-cols-3 gap-6 mt-14">
            {TESTIMONIALS.map((t, i) => (
              <TestimonialCard key={i} testimonial={t} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          CONTACT
      ══════════════════════════════════════════════════════════════ */}
      <section id="contact" className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <SectionHeader
            badge="Aloqa"
            title="Biz Bilan Bog'laning"
            subtitle="Savollaringiz bormi? Xabar yuboring — 24 soat ichida javob beramiz."
            dark={false}
          />

          <div className="grid lg:grid-cols-5 gap-10 mt-14">
            {/* Info column */}
            <div className="lg:col-span-2 space-y-4">
              <ContactInfoCard icon={<Phone className="h-5 w-5" />}  title="Telefon"    value="+998 71 200-00-00" />
              <ContactInfoCard icon={<Mail className="h-5 w-5" />}   title="Email"      value="info@mebelpro.uz" />
              <ContactInfoCard icon={<MapPin className="h-5 w-5" />} title="Manzil"     value="Toshkent, Amir Temur ko'chasi, 108" />
              <ContactInfoCard icon={<Clock className="h-5 w-5" />}  title="Ish Vaqti"  value="Dushanba – Shanba: 09:00 – 18:00" />

              <div className="pt-2">
                <p className="text-sm text-muted-foreground mb-3">Ijtimoiy tarmoqlar</p>
                <div className="flex gap-3">
                  {[
                    { label: 'T', title: 'Telegram' },
                    { label: 'I', title: 'Instagram' },
                    { label: 'F', title: 'Facebook' },
                  ].map(s => (
                    <div
                      key={s.label}
                      title={s.title}
                      className="w-10 h-10 rounded-xl gold-gradient flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <span className="text-sm font-bold text-primary">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Form column */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3 bg-card rounded-2xl p-8 border border-border shadow-sm"
            >
              <AnimatePresence mode="wait">
                {formState === 'success' ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="flex flex-col items-center justify-center h-64 gap-4"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-green-500/15 flex items-center justify-center"
                    >
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    </motion.div>
                    <h3 className="text-xl font-semibold text-foreground">Xabaringiz yuborildi!</h3>
                    <p className="text-muted-foreground text-center text-sm">
                      Telegram orqali qabul qildik. Tez orada javob beramiz.
                    </p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="space-y-5"
                  >
                    {/* Error banner */}
                    <AnimatePresence>
                      {formState === 'error' && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          className="flex items-start gap-3 p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-sm"
                        >
                          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                          <span>{formError || "Xabar yuborishda xatolik. Qayta urinib ko'ring."}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Ismingiz</label>
                        <input
                          type="text"
                          required
                          disabled={formState === 'loading'}
                          value={formData.name}
                          onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                          placeholder="Akbar Toshmatov"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all text-sm disabled:opacity-60"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Email</label>
                        <input
                          type="email"
                          required
                          disabled={formState === 'loading'}
                          value={formData.email}
                          onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                          placeholder="email@mebel.uz"
                          className="w-full h-11 px-4 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all text-sm disabled:opacity-60"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-foreground mb-1.5 block">Xabar</label>
                      <textarea
                        required
                        rows={5}
                        disabled={formState === 'loading'}
                        value={formData.message}
                        onChange={e => setFormData(p => ({ ...p, message: e.target.value }))}
                        placeholder="Savol yoki taklifingizni yozing..."
                        className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold transition-all text-sm resize-none disabled:opacity-60"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={formState === 'loading'}
                      className="w-full h-12 gold-gradient rounded-xl font-semibold text-primary flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{ boxShadow: '0 4px 20px rgba(201,168,76,0.25)' }}
                    >
                      {formState === 'loading' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Yuborilmoqda...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Xabar Yuborish
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════════════════════ */}
      <footer className="sidebar-gradient border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">

            {/* Brand */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 gold-gradient rounded-xl flex items-center justify-center">
                  <span className="text-lg font-bold text-primary">M</span>
                </div>
                <span
                  className="text-xl font-bold text-white"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  Mebel<span className="text-gold">Pro</span>
                </span>
              </div>
              <p className="text-white/45 text-sm leading-relaxed max-w-xs">
                Professional mebel do'koni boshqaruv tizimi. Savdo, ombor, mijozlar — barchasi bir joyda.
              </p>
            </div>

            {/* Quick links */}
            <div>
              <p className="text-white/60 font-medium text-xs mb-4 uppercase tracking-widest">
                Tezkor Havolalar
              </p>
              <ul className="space-y-2.5">
                {NAV_ITEMS.map(item => (
                  <li key={item.id}>
                    <button
                      onClick={() => scrollTo(item.id)}
                      className="text-white/40 text-sm hover:text-gold transition-colors"
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-white/60 font-medium text-xs mb-4 uppercase tracking-widest">
                Aloqa
              </p>
              <ul className="space-y-2.5 text-white/40 text-sm">
                <li>+998 71 200-00-00</li>
                <li>info@mebelpro.uz</li>
                <li>Toshkent, O'zbekiston</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-white/25 text-sm">© 2024 MebelPro. Barcha huquqlar himoyalangan.</p>
            <div className="flex items-center gap-4">
              <span className="text-white/25 text-xs cursor-pointer hover:text-white/50 transition-colors">
                Maxfiylik siyosati
              </span>
              <span className="text-white/15">·</span>
              <span className="text-white/25 text-xs cursor-pointer hover:text-white/50 transition-colors">
                Foydalanish shartlari
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
