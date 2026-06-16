"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherAttendance() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/students/")
      .then(r => r.json())
      .then(data => setStudents(data.map((s:any) => ({...s, status: null}))))
      .catch(e => console.error(e));
      
    fetch("/api/groups/")
      .then(r => r.json())
      .then(data => setGroups(data))
      .catch(e => console.error(e));
  }, []);

  const handleStatus = (id: number, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
  };

  const saveAttendance = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Davomat</h1>
            <p className="text-slate-400 mt-2 text-sm">Guruhlar bo'yicha yo'qlama qilish</p>
          </div>
          <div className="flex gap-4">
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
            <button 
              onClick={saveAttendance}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-colors"
            >
              Yakunlash
            </button>
          </div>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">T/R</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">F.I.SH</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Holati</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s, i) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-5 text-slate-400">{i + 1}</td>
                  <td className="py-5 text-white font-medium text-lg">{s.full_name} <span className="text-sm text-slate-500 ml-2">({s.group_name})</span></td>
                  <td className="py-5 flex justify-end gap-3">
                    <button 
                      onClick={() => handleStatus(s.id, 'present')}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        s.status === 'present' 
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50' 
                          : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                      }`}
                    >
                      {s.status === 'present' ? '✔️ Keldi' : 'Keldi'}
                    </button>
                    <button 
                      onClick={() => handleStatus(s.id, 'absent')}
                      className={`px-4 py-2 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                        s.status === 'absent' 
                          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50' 
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                      }`}
                    >
                      {s.status === 'absent' ? '❌ Kelmadi' : 'Kelmadi'}
                    </button>
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
          className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
        >
          <span>✅</span>
          Davomat muvaffaqiyatli saqlandi!
        </motion.div>
      )}
    </div>
  );
}
