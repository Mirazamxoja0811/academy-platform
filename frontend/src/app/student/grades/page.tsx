"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

interface Grade {
  subject: string;
  grade: number;
  date: string;
  teacher__first_name: string;
  teacher__last_name: string;
  comment?: string;
}

export default function StudentGrades() {
  const [grades, setGrades] = useState<Grade[]>([]);
  const [filterSubject, setFilterSubject] = useState<string>("Barchasi");

  useEffect(() => {
    fetch('/api/students/me/grades/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(data => setGrades(data))
      .catch(console.error);
  }, []);

  const subjects = ["Barchasi", ...Array.from(new Set(grades.map(g => g.subject)))];
  
  const filteredGrades = filterSubject === "Barchasi" 
    ? grades 
    : grades.filter(g => g.subject === filterSubject);

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Mening Baholarim</h1>
            <p className="text-slate-400 mt-2 text-sm">Joriy oydagi barcha o'zlashtirishlaringiz tarixi</p>
          </div>
          <select 
            value={filterSubject}
            onChange={(e) => setFilterSubject(e.target.value)}
            className="px-4 py-2 bg-slate-800 text-white rounded-xl border border-slate-700 outline-none"
          >
            {subjects.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
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
              {filteredGrades.map((g, i) => (
                <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-5 text-white font-medium">{g.subject}</td>
                  <td className="py-5 text-slate-300">{g.teacher__first_name} {g.teacher__last_name}</td>
                  <td className="py-5 text-slate-400">{g.date}</td>
                  <td className="py-5 text-right">
                    <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold shadow-lg ${g.grade >= 5 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                      {g.grade}
                    </span>
                  </td>
                </tr>
              ))}
              {filteredGrades.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-slate-500">Baholar mavjud emas</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>

      </motion.div>
    </div>
  );
}
