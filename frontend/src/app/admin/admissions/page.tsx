"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminAdmissions() {
  const [admissions, setAdmissions] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    course_name: ""
  });
  const [loading, setLoading] = useState(false);

  const fetchAdmissions = async () => {
    try {
      const res = await fetch("/api/admissions/");
      const data = await res.json();
      setAdmissions(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAdmissions();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/admissions/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ full_name: "", phone: "", course_name: "" });
        fetchAdmissions();
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
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Qabul Jarayoni</h1>
            <p className="text-slate-400 mt-2 text-sm">Markazga o'qish istagini bildirganlar ro'yxati</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-colors"
          >
            + Yangi qo'shish
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">F.I.SH</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Telefon</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Kurs nomi</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Holat</th>
              </tr>
            </thead>
            <tbody>
              {admissions.map((a, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 text-white font-medium">{a.full_name}</td>
                  <td className="py-5 text-slate-300">{a.phone}</td>
                  <td className="py-5 text-slate-300">{a.course_name}</td>
                  <td className="py-5 text-right">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${a.status === 'new' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-green-500/10 text-green-400 border-green-500/20'}`}>
                      {a.status === 'new' ? "Yangi" : a.status}
                    </span>
                  </td>
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
              className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Yangi Qabul So'rovi</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">F.I.SH</label>
                  <input type="text" required value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Telefon</label>
                  <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Kurs Nomi</label>
                  <input type="text" required value={formData.course_name} onChange={e => setFormData({...formData, course_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
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
