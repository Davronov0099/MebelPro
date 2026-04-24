import { motion } from 'framer-motion';
import { MapPin, Phone, Clock } from 'lucide-react';

const About = () => (
  <div className="max-w-3xl mx-auto px-4 py-8 space-y-8">
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      <h1 className="text-3xl font-bold text-foreground" style={{ lineHeight: '1.15' }}>Mebel<span className="text-gold">Pro</span> haqida</h1>
      <p className="text-muted-foreground mt-3 leading-relaxed">MebelPro — O'zbekistondagi eng ishonchli va sifatli mebel brendlaridan biri. 2018-yildan beri mijozlarimizga premium sifatli mebellarni yetkazib kelmoqdamiz.</p>
    </motion.div>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { icon: MapPin, label: 'Manzil', value: 'Toshkent sh., Chilonzor tumani, 9-mavze, 15-uy' },
        { icon: Phone, label: 'Telefon', value: '+998 (90) 123-45-67\n+998 (93) 765-43-21' },
        { icon: Clock, label: 'Ish vaqti', value: 'Du-Shan: 09:00 — 20:00\nYakshanba: 10:00 — 18:00' },
      ].map((item, i) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
          className="bg-card rounded-xl p-5 card-shadow">
          <item.icon className="h-6 w-6 text-gold mb-3" />
          <h3 className="text-sm font-semibold text-foreground">{item.label}</h3>
          <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{item.value}</p>
        </motion.div>
      ))}
    </div>

    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
      className="bg-card rounded-xl p-6 card-shadow">
      <h2 className="text-lg font-bold text-foreground mb-3">Bizning missiya</h2>
      <p className="text-muted-foreground leading-relaxed">
        Har bir uyni qulay va chiroyli mebel bilan ta'minlash — bu bizning asosiy maqsadimiz. Biz faqat sifatli materiallardan foydalanib, zamonaviy dizayn va arzon narxda eng yaxshi mebellarni taklif etamiz.
      </p>
      <p className="text-muted-foreground leading-relaxed mt-3">
        7 yillik tajribamiz davomida 1,200 dan ortiq mijozlarga xizmat ko'rsatdik va 2,450 dan ortiq mahsulotni muvaffaqiyatli sotdik. Bizning har bir mahsulot 2 yil kafolat bilan ta'minlanadi.
      </p>
    </motion.div>
  </div>
);

export default About;
