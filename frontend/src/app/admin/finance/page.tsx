"use client";

import { motion } from "framer-motion";

export default function AdminFinance() {
  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Moliya va Coinlar</h1>
          <p className="text-slate-400 mt-2 text-sm">Tizimdagi virtual pullar nazorati</p>
        </div>
        
        <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 backdrop-blur-xl border border-emerald-500/20 rounded-[2rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="text-8xl mb-4 drop-shadow-lg">💰</div>
          <h2 className="text-3xl font-bold text-emerald-500">Moliya Bo'limi</h2>
          <p className="text-slate-300 mt-4 max-w-lg">Barcha berilgan coinlar va to'lovlar tarixi shu yerda shakllanadi.</p>
        </div>
      </motion.div>
    </div>
  );
}
