"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Banknote, CalendarDays, User, ArrowDownCircle, ArrowUpCircle, X, CreditCard, Wallet } from "lucide-react";
import axios from "axios";

export default function FinancePage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [formData, setFormData] = useState({ student_id: "", amount: "", method: "cash" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        axios.get("/api/finance/", { withCredentials: true }),
        axios.get("/api/users/?role=student", { withCredentials: true })
      ]);
      setPayments(pRes.data);
      setStudents(sRes.data);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post("/api/finance/", formData, { withCredentials: true });
      setIsDrawerOpen(false);
      setFormData({ student_id: "", amount: "", method: "cash" });
      fetchData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  const filteredPayments = payments.filter(p => 
    p.student_name.toLowerCase().includes(search.toLowerCase())
  );

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-slate-400 font-medium">Jami Tushum</p>
              <h3 className="text-3xl font-bold text-white mt-2">{(totalAmount || 0).toLocaleString()} UZS</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/20 text-emerald-400">
              <Banknote className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="O'quvchi ismi bo'yicha qidirish..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all backdrop-blur-sm"
          />
        </div>
        
        <button 
          onClick={() => setIsDrawerOpen(true)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-medium transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>To'lov qabul qilish</span>
        </button>
      </div>

      <div className="bg-slate-900/40 border border-slate-800/60 rounded-[2rem] overflow-hidden backdrop-blur-md">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800/60 text-slate-400 text-sm">
                <th className="p-4 md:p-6 font-medium">Sana</th>
                <th className="p-4 md:p-6 font-medium">O'quvchi</th>
                <th className="p-4 md:p-6 font-medium">To'lov usuli</th>
                <th className="p-4 md:p-6 font-medium">Qabul qildi</th>
                <th className="p-4 md:p-6 font-medium text-right">Summa</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">Yuklanmoqda...</td></tr>
              ) : filteredPayments.length === 0 ? (
                <tr><td colSpan={5} className="p-8 text-center text-slate-500">To'lovlar topilmadi.</td></tr>
              ) : (
                filteredPayments.map((p, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}
                    key={p.id} className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors"
                  >
                    <td className="p-4 md:p-6 text-slate-400 text-sm md:text-base">{p.date}</td>
                    <td className="p-4 md:p-6 font-medium text-white text-sm md:text-base">{p.student_name}</td>
                    <td className="p-4 md:p-6">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${
                        p.method === 'card' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        {p.method === 'card' ? <CreditCard className="w-3 h-3" /> : <Wallet className="w-3 h-3" />}
                        {p.method === 'card' ? 'Plastik karta' : 'Naqd pul'}
                      </span>
                    </td>
                    <td className="p-4 md:p-6 text-slate-400 text-sm md:text-base">{p.processed_by}</td>
                    <td className="p-4 md:p-6 text-right font-bold text-emerald-400 text-sm md:text-base">
                      + {Number(p.amount).toLocaleString()} UZS
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                <h3 className="text-xl font-bold text-white">To'lov qabul qilish</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="payment-form" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">O'quvchi</label>
                    <select required value={formData.student_id} onChange={e => setFormData({...formData, student_id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50">
                      <option value="">Tanlang...</option>
                      {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">To'lov summasi (UZS)</label>
                    <input type="number" required min="1000" value={formData.amount} onChange={e => setFormData({...formData, amount: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50" placeholder="Masalan: 500000" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">To'lov usuli</label>
                    <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50">
                      <option value="cash">Naqd pul</option>
                      <option value="card">Plastik karta</option>
                    </select>
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800 transition-colors">
                  Bekor qilish
                </button>
                <button type="submit" form="payment-form" className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/25">
                  Qabul qilish
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
