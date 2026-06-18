"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    role: "student",
    phone: "",
    date_of_birth: "",
    group_id: ""
  });
  const [loading, setLoading] = useState(false);
  const [filterRole, setFilterRole] = useState("all");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/users/");
      const data = await res.json();
      setUsers(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/");
      const data = await res.json();
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchGroups();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/users/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ first_name: "", last_name: "", username: "", password: "", role: "student", phone: "", date_of_birth: "", group_id: "" });
        fetchUsers();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Xatolik yuz berdi");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">
        
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Foydalanuvchilar</h1>
            <p className="text-slate-400 mt-2 text-sm">O'quvchilar va O'qituvchilar ro'yxati</p>
          </div>
          <div className="flex items-center gap-4">
            <select 
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
              className="px-4 py-2 bg-slate-800 text-white rounded-xl border border-slate-700 outline-none"
            >
              <option value="all">Barchasi</option>
              <option value="student">O'quvchilar</option>
              <option value="teacher">O'qituvchilar</option>
              <option value="admin">Adminlar</option>
            </select>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-colors"
            >
              + Yangi qo'shish
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">F.I.SH</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Username</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Rol</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Telefon</th>
              </tr>
            </thead>
            <tbody>
              {users.filter(u => filterRole === "all" || u.role === filterRole).map((u, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 text-white font-medium">{u.first_name} {u.last_name}</td>
                  <td className="py-5 text-slate-300">{u.username}</td>
                  <td className="py-5">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${u.role === "teacher" ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                      {u.role === "teacher" ? "O'qituvchi" : (u.role === "admin" ? "Admin" : "O'quvchi")}
                    </span>
                  </td>
                  <td className="py-5 text-right text-slate-400">{u.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </motion.div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-lg relative z-10 shadow-2xl max-h-[90vh] overflow-y-auto"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Yangi Foydalanuvchi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Ism</label>
                    <input type="text" required value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Familiya</label>
                    <input type="text" required value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Username</label>
                    <input type="text" required value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Parol</label>
                    <input type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Telefon</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tug'ilgan sana (yoshi)</label>
                    <input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rol</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="student">O'quvchi</option>
                    <option value="teacher">O'qituvchi</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                
                {["student", "teacher"].includes(formData.role) && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
                    <label className="block text-sm text-slate-400 mb-1">Guruhni tanlang (O'quvchi va O'qituvchilar uchun)</label>
                    <select value={formData.group_id} onChange={e => setFormData({...formData, group_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                      <option value="">Guruhsiz</option>
                      {groups.map((g, i) => {
                        const isFull = formData.role === "student" && g.student_count >= g.max_seats;
                        return (
                          <option key={i} value={g.id} disabled={isFull}>
                            {g.name} {isFull ? "(To'lgan)" : ""}
                          </option>
                        );
                      })}
                    </select>
                  </motion.div>
                )}

                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">Bekor qilish</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
