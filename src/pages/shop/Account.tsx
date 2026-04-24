import { useApiStore } from '@/stores/apiStore';
import { motion } from 'framer-motion';
import { User, Mail, Sun, Moon } from 'lucide-react';

const Account = () => {
  const user = useApiStore(s => s.user);
  const theme = useApiStore(s => s.theme);
  const setTheme = useApiStore(s => s.setTheme);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <h2 className="text-2xl font-bold text-foreground">Hisob ma'lumotlari</h2>

      {/* User Info Card */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 card-shadow">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center">
            <span className="text-2xl font-bold text-gold">{user?.name?.[0] || 'U'}</span>
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground capitalize">{user?.role === 'admin' ? 'Administrator' : 'Foydalanuvchi'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <User className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">Rol</p>
              <p className="text-sm font-medium text-foreground capitalize">
                {user?.role === 'admin' ? 'Administrator' :
                 user?.role === 'kassir' ? 'Kassir' :
                 user?.role === 'yordamchi' ? 'Yordamchi' :
                 user?.role === 'omborchi' ? 'Omborchi' : 'Foydalanuvchi'}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Theme Settings */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-6 card-shadow">
        <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          {theme === 'dark' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          Mavzu
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setTheme('light')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'light'
                ? 'border-gold bg-gold/10'
                : 'border-border hover:border-gold/50'
            }`}
          >
            <Sun className="h-6 w-6 mx-auto mb-2 text-foreground" />
            <p className="text-sm font-medium text-foreground">Yorug'</p>
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={`p-4 rounded-lg border-2 transition-all ${
              theme === 'dark'
                ? 'border-gold bg-gold/10'
                : 'border-border hover:border-gold/50'
            }`}
          >
            <Moon className="h-6 w-6 mx-auto mb-2 text-foreground" />
            <p className="text-sm font-medium text-foreground">Qorong'i</p>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Account;
