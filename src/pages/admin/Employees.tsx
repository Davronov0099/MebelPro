import { useState, useEffect } from 'react';
import { useApiStore } from '@/stores/apiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Users, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const Employees = () => {
  const { users, usersLoading, fetchUsers, createUser, updateUser, deleteUser } = useApiStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    password: '',
    role: 'yordamchi' as 'admin' | 'yordamchi' | 'kassir' | 'omborchi'
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array - only run once on mount

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }
    if (form.password.length < 4) {
      toast.error('Parol kamida 4 ta belgidan iborat bo\'lishi kerak');
      return;
    }

    setLoading(true);
    try {
      await createUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });
      setForm({ name: '', email: '', password: '', role: 'yordamchi' });
      setShowAdd(false);
      toast.success('Ishchi qo\'shildi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: any) => {
    setEditingUser(user);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
    });
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !form.name || !form.email) {
      toast.error('Barcha majburiy maydonlarni to\'ldiring');
      return;
    }

    setLoading(true);
    try {
      const updateData: any = {
        name: form.name,
        email: form.email,
        role: form.role,
      };
      
      // Only include password if it's not empty
      if (form.password) {
        updateData.password = form.password;
      }

      await updateUser(editingUser.id, updateData);
      setEditingUser(null);
      setForm({ name: '', email: '', password: '', role: 'yordamchi' });
      toast.success('Ishchi yangilandi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setLoading(true);
    try {
      await deleteUser(id);
      setDeleteConfirm(null);
      toast.success('Ishchi o\'chirildi');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Xatolik yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const positionLabels: Record<string, string> = { 
    admin: 'Admin', 
    yordamchi: 'Yordamchi', 
    kassir: 'Kassir',
    omborchi: 'Omborchi'
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{users.length} ta ishchi</p>
        <button onClick={() => setShowAdd(true)} className="h-10 px-4 gold-gradient text-primary text-sm font-semibold rounded-lg hover:opacity-90 active:scale-[0.97] transition-all flex items-center gap-2">
          <Plus className="h-4 w-4" /> Ishchi qo'shish
        </button>
      </div>

      {usersLoading ? (
        <div className="bg-card rounded-xl card-shadow p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold mx-auto"></div>
          <p className="text-sm text-muted-foreground mt-4">Yuklanmoqda...</p>
        </div>
      ) : (
        <div className="bg-card rounded-xl card-shadow overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">#</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Ism Familiya</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium hidden sm:table-cell">Login</th>
                <th className="text-left px-4 py-3 text-muted-foreground font-medium">Lavozim</th>
                <th className="text-right px-4 py-3 text-muted-foreground font-medium">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, i) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-muted-foreground">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-foreground">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-blue-500/10 text-blue-400">
                      {positionLabels[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleEdit(user)}
                        className="p-1.5 hover:bg-blue-500/10 text-blue-400 rounded transition-colors"
                        title="Tahrirlash"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(user.id)}
                        className="p-1.5 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                        title="O'chirish"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {users.length === 0 && (
                <tr><td colSpan={5} className="px-4 py-12 text-center text-muted-foreground"><Users className="h-10 w-10 mx-auto mb-2 opacity-30" />Ishchilar yo'q</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {(showAdd || editingUser) && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => { setShowAdd(false); setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'yordamchi' }); }} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-foreground">
                    {editingUser ? 'Ishchini tahrirlash' : 'Yangi ishchi'}
                  </h3>
                  <button onClick={() => { setShowAdd(false); setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'yordamchi' }); }} className="p-2 hover:bg-muted rounded-lg transition-colors">
                    <X className="h-5 w-5 text-muted-foreground" />
                  </button>
                </div>
                <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Ism Familiya *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={e => setForm({ ...form, name: e.target.value })}
                      placeholder="Ism Familiya"
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-1.5 block">Lavozim *</label>
                    <select
                      value={form.role}
                      onChange={e => setForm({ ...form, role: e.target.value as any })}
                      className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="admin">Admin</option>
                      <option value="yordamchi">Yordamchi</option>
                      <option value="kassir">Kassir</option>
                      <option value="omborchi">Omborchi</option>
                    </select>
                  </div>
                  
                  {/* Login va Parol */}
                  <div className="pt-3 border-t border-border">
                    <h4 className="text-sm font-semibold text-foreground mb-3">Kirish ma'lumotlari</h4>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">Login *</label>
                        <input
                          type="text"
                          value={form.email}
                          onChange={e => setForm({ ...form, email: e.target.value })}
                          placeholder="Login"
                          className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {!editingUser && (
                          <p className="text-xs text-muted-foreground mt-1">Bu login kirish uchun ishlatiladi</p>
                        )}
                        {editingUser && (
                          <p className="text-xs text-muted-foreground mt-1">Loginni o'zgartirish mumkin</p>
                        )}
                      </div>
                      <div>
                        <label className="text-sm font-medium text-foreground mb-1.5 block">
                          Parol {editingUser ? '' : '*'}
                        </label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            placeholder={editingUser ? "Bo'sh qoldiring - o'zgarmaydi" : "Parol"}
                            className="w-full px-3 py-2 pr-10 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                          >
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        {!editingUser && (
                          <p className="text-xs text-muted-foreground mt-1">Kamida 4 ta belgi</p>
                        )}
                        {editingUser && (
                          <p className="text-xs text-muted-foreground mt-1">Bo'sh qoldiring - parol o'zgarmaydi</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-border flex gap-3">
                  <button
                    onClick={() => { setShowAdd(false); setEditingUser(null); setForm({ name: '', email: '', password: '', role: 'yordamchi' }); }}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors disabled:opacity-40"
                  >
                    Bekor qilish
                  </button>
                  <button
                    onClick={editingUser ? handleSaveEdit : handleAdd}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-40"
                  >
                    {loading ? 'Saqlanmoqda...' : (editingUser ? 'Saqlash' : 'Qo\'shish')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setDeleteConfirm(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 flex items-center justify-center z-50 p-4"
            >
              <div className="w-full max-w-md bg-card rounded-xl card-shadow border border-border overflow-hidden">
                <div className="p-6">
                  <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                    <Trash2 className="h-6 w-6 text-red-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                    Ishchini o'chirish
                  </h3>
                  <p className="text-sm text-muted-foreground text-center mb-6">
                    <span className="font-medium text-foreground">
                      {users.find(u => u.id === deleteConfirm)?.name}
                    </span>{' '}
                    ishchini o'chirmoqchimisiz? Bu amalni qaytarib bo'lmaydi.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-muted hover:bg-muted/80 text-foreground rounded-lg transition-colors disabled:opacity-40"
                    >
                      Bekor qilish
                    </button>
                    <button
                      onClick={() => handleDelete(deleteConfirm)}
                      disabled={loading}
                      className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-40"
                    >
                      {loading ? 'O\'chirilmoqda...' : 'O\'chirish'}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Employees;
