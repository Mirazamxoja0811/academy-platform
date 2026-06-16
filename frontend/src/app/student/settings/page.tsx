"use client";

import { motion } from "framer-motion";

export default function StudentSettings() {
  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Sozlamalar</h1>
          <p className="text-slate-400 mt-2 text-sm">Profil ma'lumotlarini o'zgartirish</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-6">
          
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">F.I.SH</label>
            <input type="text" disabled value="Test O'quvchi" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Telefon raqam</label>
            <input type="text" disabled value="+998 90 123 45 67" className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Parolni o'zgartirish</label>
            <input type="password" placeholder="Yangi parol" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500/50 transition-colors" />
          </div>

          <button className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-colors mt-4">
            Saqlash
          </button>

        </div>
      </motion.div>
    </div>
  );
}
