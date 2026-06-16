"use client";

import { motion } from "framer-motion";

export default function TeacherGroups() {
  const groups = [
    { name: "IELTS Intensive 12", students: 12, time: "14:00 - 16:00", days: "Toq kunlar" },
    { name: "General English B2", students: 14, time: "16:00 - 18:00", days: "Juft kunlar" }
  ];

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Guruhlarim</h1>
          <p className="text-slate-400 mt-2 text-sm">Sizga biriktirilgan barcha guruhlar ro'yxati</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groups.map((g, i) => (
            <div key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl hover:bg-white/10 transition-colors cursor-pointer group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{g.name}</h3>
              <div className="space-y-2 text-slate-300 relative z-10">
                <p>👥 O'quvchilar soni: <span className="font-bold text-white">{g.students}</span></p>
                <p>🕒 Vaqti: <span className="font-bold text-white">{g.time}</span></p>
                <p>📅 Kunlari: <span className="font-bold text-white">{g.days}</span></p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
