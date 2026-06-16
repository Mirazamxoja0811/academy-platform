"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherGrading() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/students/")
      .then(r => r.json())
      .then(data => setStudents(data.map((s:any) => ({...s, grade: null}))))
      .catch(e => console.error(e));
      
    fetch("/api/groups/")
      .then(r => r.json())
      .then(data => setGroups(data))
      .catch(e => console.error(e));
  }, []);

  const handleGrade = (id: number, grade: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, grade } : s));
    setShowToast(true);
    setTimeout(() => setShowToast(false), 2000);
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Baholash</h1>
            <p className="text-slate-400 mt-2 text-sm">O'quvchilarga bugungi dars uchun baho qo'yish</p>
          </div>
          <select 
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none"
          >
            <option value="" disabled>Guruhni tanlang</option>
            {groups.map((g, i) => (
              <option key={i} className="text-black" value={g.name}>{g.name}</option>
            ))}
          </select>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">T/R</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">F.I.SH</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Baho Qo'yish</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-5 text-slate-400">{i + 1}</td>
                  <td className="py-5 text-white font-medium text-lg">{s.full_name} <span className="text-sm text-slate-500 ml-2">({s.group_name})</span></td>
                  <td className="py-5 flex justify-end gap-2">
                    {[2, 3, 4, 5].map(num => (
                      <button 
                        key={num}
                        onClick={() => handleGrade(s.id, num)}
                        className={`w-10 h-10 rounded-full font-bold transition-all ${
                          s.grade === num 
                            ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/50 scale-110' 
                            : 'bg-white/5 text-slate-300 hover:bg-white/20'
                        }`}
                      >
                        {num}
                      </button>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 right-10 bg-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
        >
          <span>✅</span>
          Baho muvaffaqiyatli saqlandi!
        </motion.div>
      )}
    </div>
  );
}
