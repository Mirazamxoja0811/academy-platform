"use client";

import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function StudentAttendance() {
  const attendance: any[] = [];

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Davomat</h1>
            <p className="text-slate-400 mt-2 text-sm">Darslarga qatnashish statistikangiz</p>
          </div>
          <div className="bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-6 py-2 rounded-xl text-sm font-bold shadow-lg">
            0% Davomat
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <div className="grid gap-4">
            {attendance.map((record, i) => (
              <div key={i} className="flex justify-between items-center p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div className="flex gap-4 items-center">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${record.status === 'Keldi' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'}`}>
                    {record.status === 'Keldi' ? '✔️' : '⚠️'}
                  </div>
                  <div>
                    <h3 className="text-white font-medium text-lg">{record.date}</h3>
                    <p className="text-slate-400 text-sm">{record.group}</p>
                  </div>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-semibold border ${record.status === 'Keldi' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                  {record.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
