"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherGrading() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [subject, setSubject] = useState("Ingliz tili");
  const [showToast, setShowToast] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/students/")
      .then(r => r.json())
      .then(data => setStudents(data.map((s: any) => ({ ...s, grade: null }))))
      .catch(e => console.error(e));

    fetch("/api/groups/")
      .then(r => r.json())
      .then(data => {
        setGroups(data);
        if (data.length > 0) setSelectedGroup(String(data[0].id));
      })
      .catch(e => console.error(e));
  }, []);

  const filteredStudents = selectedGroup
    ? students.filter(s => String(s.group_id) === selectedGroup)
    : students;

  const handleGrade = (id: number, grade: number) => {
    setStudents(students.map(s => s.id === id ? { ...s, grade } : s));
  };

  const saveGrades = () => {
    const gradesToSave = filteredStudents
      .filter(s => s.grade !== null)
      .map(s => ({
        student_id: s.id,
        grade: s.grade,
        subject,
      }));

    if (gradesToSave.length === 0) return;

    fetch('/api/teacher/batch_grading/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ grades: gradesToSave, subject }),
    })
      .then(res => res.json())
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setStudents(students.map(s => ({ ...s, grade: null })));
      });
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Baholash</h1>
            <p className="text-slate-400 mt-2 text-sm">O'quvchilarga bugungi dars uchun baho qo'yish</p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Fan nomi"
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none"
            />
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="bg-white/10 border border-white/20 text-white px-4 py-2 rounded-xl focus:outline-none"
            >
              {groups.map((g) => (
                <option key={g.id} className="text-black" value={g.id}>{g.name}</option>
              ))}
            </select>
            <button
              onClick={saveGrades}
              className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-indigo-500/30 transition-colors"
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
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Baho Qo'yish</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((s, i) => (
                <tr key={s.id} className="border-b border-white/5 hover:bg-white/5 transition-colors group">
                  <td className="py-5 text-slate-400">{i + 1}</td>
                  <td className="py-5 text-white font-medium text-lg">{s.full_name}</td>
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan={3} className="text-center py-8 text-slate-500">Guruhda o'quvchi yo'q</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
        >
          <span>✅</span>
          Baho muvaffaqiyatli saqlandi!
        </motion.div>
      )}
    </div>
  );
}
