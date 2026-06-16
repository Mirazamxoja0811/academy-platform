"use client";

import { motion } from "framer-motion";

export default function StudentTests() {
  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Testlar va Vazifalar</h1>
          <p className="text-slate-400 mt-2 text-sm">Tez kunda sizga bu yerda vazifalar ko'rinadi!</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-2xl font-bold text-slate-300">Hozircha vazifalar yo'q</h2>
          <p className="text-slate-400 mt-2">O'qituvchingiz vazifa yuklaganda shu yerda ko'rinadi.</p>
        </div>
      </motion.div>
    </div>
  );
}
