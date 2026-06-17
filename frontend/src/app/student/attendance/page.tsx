"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

interface AttendanceRecord {
  date: string;
  status: string;
  group__name: string;
  note?: string;
}

export default function StudentAttendance() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    fetch('/api/students/me/attendance/')
      .then(res => res.json())
      .then(data => setAttendance(data))
      .catch(console.error);
  }, []);

  const total = attendance.length;
  const attended = attendance.filter(a => a.status === 'present' || a.status === 'late').length;
  const rate = total > 0 ? Math.round((attended / total) * 100) : 0;

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Davomat</h1>
            <p className="text-slate-400 mt-2 text-sm">Darslarga qatnashish statistikangiz</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-xl text-sm font-bold shadow-lg">
            {rate}% Davomat
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <div className="grid gap-4">
            {attendance.map((record, i) => (
              <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${record.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' : record.status === 'late' ? 'bg-yellow-500/20 text-yellow-400' : record.status === 'excused' ? 'bg-blue-500/20 text-blue-400' : 'bg-rose-500/20 text-rose-400'}`}>
                    {record.status === 'present' ? '✔️' : record.status === 'late' ? '⏱️' : record.status === 'excused' ? 'ℹ️' : '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{record.date}</h3>
                    <p className="text-slate-400 text-sm">{record.group__name}</p>
                    {record.status === 'excused' && record.note && (
                      <p className="text-blue-300 text-xs mt-1">Sabab: {record.note}</p>
                    )}
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${record.status === 'present' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : record.status === 'late' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' : record.status === 'excused' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {record.status === 'present' ? 'Keldi' : record.status === 'late' ? 'Kech qoldi' : record.status === 'excused' ? 'Sababli' : 'Kelmadi'}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
