"use client";

import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit, X, Shield, GraduationCap, UserCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import axios from "axios";

export default function UsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as any, message: "" });
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    username: "", password: "", first_name: "", last_name: "", phone: "", role: "student", date_of_birth: "", group_ids: [] as number[]
  });

  useEffect(() => {
    fetchData();
  }, [roleFilter]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [uRes, gRes] = await Promise.all([
        axios.get(`/api/users/?role=${roleFilter}`, { withCredentials: true }),
        axios.get(`/api/groups/`, { withCredentials: true })
      ]);
      setUsers(uRes.data);
      setGroups(gRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham ushbu foydalanuvchini o'chirmoqchimisiz?" });
  };
  
  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.post(`/api/users/${confirmModal.id}/delete/`, {}, { withCredentials: true });
      fetchData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const handleEdit = (u: any) => {
    setEditingId(u.id);
    setFormData({
      username: u.username,
      password: "", // do not populate password
      first_name: u.first_name || "",
      last_name: u.last_name || "",
      phone: u.phone || "",
      role: u.role,
      date_of_birth: u.date_of_birth || "",
      group_ids: u.group_ids || [] // if API returns group_ids
    });
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Create new user or update
      // Backend does not have PUT for api_users yet, so we will use POST and if editingId exists, send id
      const payload = { ...formData, id: editingId };
      const res = await axios.post("/api/users/", payload, { withCredentials: true });
      
      setIsDrawerOpen(false);
      setFormData({ username: "", password: "", first_name: "", last_name: "", phone: "", role: "student", date_of_birth: "", group_ids: [] });
      setEditingId(null);
      fetchData();
    } catch (e: any) {
      alert(e.response?.data?.error || "Xatolik yuz berdi");
    }
  };

  const filteredUsers = users.filter(u => 
    (u.first_name?.toLowerCase().includes(search.toLowerCase()) || 
     u.last_name?.toLowerCase().includes(search.toLowerCase()) ||
     u.username?.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Foydalanuvchi qidirish..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <select 
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-900/50 border border-slate-700/50 text-slate-300 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none backdrop-blur-sm w-full sm:w-auto"
          >
            <option value="">Barcha rollar</option>
            <option value="admin">Admin</option>
            <option value="teacher">O'qituvchi</option>
            <option value="student">O'quvchi</option>
          </select>
          <button 
            onClick={() => {
              setEditingId(null);
              setFormData({ username: "", password: "", first_name: "", last_name: "", phone: "", role: "student", date_of_birth: "", group_ids: [] });
              setIsDrawerOpen(true);
            }}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3.5 rounded-2xl font-medium transition-all shadow-lg shadow-blue-500/25"
          >
            <Plus className="w-5 h-5" />
            <span>Qo'shish</span>
          </button>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 text-sm">
                <th className="p-4 md:p-6 font-medium">Foydalanuvchi</th>
                <th className="p-4 md:p-6 font-medium">Username</th>
                <th className="p-4 md:p-6 font-medium">Telefon</th>
                <th className="p-4 md:p-6 font-medium">Rol</th>
                <th className="p-4 md:p-6 font-medium text-right">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Hech kim topilmadi.</td></tr>
              ) : (
                filteredUsers.map((user, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={user.id} 
                    className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 md:p-6">
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center font-bold text-xs md:text-sm shrink-0 ${
                          user.role === 'admin' ? 'bg-red-500/20 text-red-400' :
                          user.role === 'teacher' ? 'bg-purple-500/20 text-purple-400' :
                          'bg-blue-500/20 text-blue-400'
                        }`}>
                          {user.first_name?.[0] || user.username[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm md:text-base">{user.first_name} {user.last_name}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 md:p-6 text-slate-300 text-sm md:text-base">@{user.username}</td>
                    <td className="p-4 md:p-6 text-slate-400 text-sm md:text-base">{user.phone || "Kiritilmagan"}</td>
                    <td className="p-4 md:p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        user.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        user.role === 'teacher' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {user.role === 'admin' && <Shield className="w-3 h-3" />}
                        {user.role === 'teacher' && <GraduationCap className="w-3 h-3" />}
                        {user.role === 'student' && <UserCircle className="w-3 h-3" />}
                        {user.role === 'admin' ? "Admin" : user.role === 'teacher' ? "O'qituvchi" : "O'quvchi"}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEdit(user)} className="p-2 text-slate-400 hover:text-blue-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(user.id)} className="p-2 text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-all">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />
            <motion.div 
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed right-0 top-0 bottom-0 w-full md:max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col"
            >
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">{editingId ? "Tahrirlash" : "Yangi Foydalanuvchi"}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="add-user-form" onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Ism</label>
                      <input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Familiya</label>
                      <input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Username</label>
                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Parol {editingId && <span className="text-slate-500 text-xs">(o'zgartirish uchun kiriting)</span>}</label>
                    <input type="password" required={!editingId} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Telefon</label>
                      <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tug'ilgan sana</label>
                      <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Rol</label>
                    <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value, group_ids: []})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50">
                      <option value="student">O'quvchi</option>
                      <option value="teacher">O'qituvchi</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>

                  {["student", "teacher"].includes(formData.role) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="pt-2">
                      <label className="block text-sm font-medium text-slate-400 mb-3">
                        {formData.role === 'teacher' ? "O'qitadigan guruhlari" : "O'qiydigan guruhlari (majburiy)"}
                      </label>
                      
                      <div className="space-y-3">
                        {groups.map((g: any) => {
                          const isSelected = formData.group_ids.includes(g.id);
                          const isFull = formData.role === "student" && g.student_count >= g.max_seats;
                          const hasTeacher = g.teacher_name !== "Biriktirilmagan";
                          
                          return (
                            <div 
                              key={g.id}
                              onClick={() => {
                                if (isFull && !isSelected) return;
                                
                                let newIds = [...formData.group_ids];
                                if (isSelected) {
                                  newIds = newIds.filter(id => id !== g.id);
                                } else {
                                  if (formData.role === "teacher" && hasTeacher) {
                                    if (!window.confirm(`DIQQAT: Bu guruhda allaqachon "${g.teacher_name}" dars bermoqda!\n\nTasdiqlasangiz, eski o'qituvchi guruhdan olinib, o'rniga bu yangi o'qituvchi qo'yiladi. Rozimisiz?`)) {
                                      return;
                                    }
                                  }
                                  newIds.push(g.id);
                                }
                                setFormData({...formData, group_ids: newIds});
                              }}
                              className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                                isFull && !isSelected ? 'border-slate-800 bg-slate-950/50 opacity-50 cursor-not-allowed' :
                                isSelected ? 'border-blue-500/50 bg-blue-500/10' : 'border-slate-800 bg-slate-950 hover:border-slate-700'
                              }`}
                            >
                              <div className={`mt-0.5 w-5 h-5 rounded flex items-center justify-center border transition-colors shrink-0 ${
                                isSelected ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600 bg-slate-900'
                              }`}>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`font-medium truncate ${isSelected ? 'text-blue-400' : 'text-slate-200'}`}>{g.name}</p>
                                <div className="flex flex-wrap gap-3 mt-1">
                                  <span className="text-xs text-slate-500">Talabalar: {g.student_count}/{g.max_seats}</span>
                                  {formData.role === "teacher" && (
                                    <span className={`text-xs flex items-center gap-1 ${hasTeacher ? 'text-amber-500/90' : 'text-emerald-500/90'}`}>
                                      {hasTeacher ? <><AlertTriangle className="w-3 h-3"/> {g.teacher_name}</> : "Bo'sh guruh"}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" form="add-user-form" className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/25">
                  Saqlash
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        message={confirmModal.message}
      />
    </div>
  );
}
