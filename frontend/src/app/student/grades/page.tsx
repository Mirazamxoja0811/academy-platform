"use client";

import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function StudentGrades() {
  const grades = [
    { subject: "Matematika", grade: 5, date: "2026-06-15", teacher: "A. Aliyev" },
    { subject: "Ingliz tili", grade: 4, date: "2026-06-14", teacher: "B. Valiyeva" },
    { subject: "Fizika", grade: 5, date: "2026-06-12", teacher: "D. Karimov" }
  ];

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Mening Baholarim</h1>
            <p className="text-slate-400 mt-2 text-sm">Joriy oydagi barcha o'zlashtirishlaringiz tarixi</p>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Fan</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'qituvchi</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Sana</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Baho</th>
              </tr>
            </thead>
            <tbody>
              {grades.map((g, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-5 text-white font-medium">{g.subject}</td>
                  <td className="py-5 text-slate-300">{g.teacher}</td>
                  <td className="py-5 text-slate-400">{g.date}</td>
                  <td className="py-5 text-right">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg ${g.grade >= 5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {g.grade}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>

      </motion.div>
    </div>
  );
}
