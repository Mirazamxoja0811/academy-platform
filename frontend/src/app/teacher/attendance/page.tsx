"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherAttendance() {
  const [selectedGroup, setSelectedGroup] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [editingNote, setEditingNote] = useState<number | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const handleClearOld = async () => {
    if (!confirm("Haqiqatan ham 30 kundan eski bo'lgan barcha davomatlarni tozalab tashlamoqchimisiz?")) return;
    try {
      const res = await fetch('/api/teacher/attendance/clear-old/', { method: 'DELETE', credentials: "include" });
      const data = await res.json();
      alert(data.message || "Tozalandi");
      fetchHistory();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };


  const fetchHistory = () => {
    fetch("/api/teacher/history/attendance/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => setHistory(data))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetch("/api/students/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => setStudents(data.map((s: any) => ({ ...s, status: null, note: "" }))))
      .catch(e => console.error(e));

    fetch("/api/groups/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => {
        setGroups(data);
        if (data.length > 0) setSelectedGroup(String(data[0].id));
      })
      .catch(e => console.error(e));

    fetchHistory();
  }, []);

  const filteredStudents = selectedGroup
    ? students.filter(s => s.group_ids && s.group_ids.includes(Number(selectedGroup)))
    : students;

  const handleStatus = (id: number, status: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, status } : s));
    if (status === 'excused') setEditingNote(id);
  };

  const handleNote = (id: number, note: string) => {
    setStudents(students.map(s => s.id === id ? { ...s, note } : s));
  };

  const saveAttendance = () => {
    const records = filteredStudents
      .filter(s => s.status)
      .map(s => ({
        student_id: s.id,
        status: s.status,
        note: s.note || "",
      }));

    if (!selectedGroup || records.length === 0) return;

    fetch('/api/teacher/batch_attendance/', { credentials: "include", 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        group_id: Number(selectedGroup),
        records,
      }),
    })
      .then(res => res.json())
      .then(() => {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        setStudents(students.map(s => ({ ...s, status: null, note: "" })));
        setEditingNote(null);
        fetchHistory();
      });
  };

  const deleteAttendance = (id: number) => {
    if(!confirm("Bu yo'qlamani o'chirishni xohlaysizmi?")) return;
    fetch(`/api/attendance/${id}/delete/`, { credentials: "include",  method: "POST" })
      .then(res => {
        if(res.ok) fetchHistory();
      });
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Davomat</h1>
            <p className="text-slate-400 mt-2 text-sm">Guruhlar bo'yicha yo'qlama qilish</p>
          </div>
          <div className="flex gap-4">
            <button onClick={handleClearOld} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 px-4 rounded-xl border border-rose-500/30 transition-colors">
              1 Oylik tozalash
            </button>
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
              onClick={saveAttendance}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-emerald-500/30 transition-colors"
            >
              Yakunlash
            </button>
          </div>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl space-y-4">
          {filteredStudents.map((s, i) => (
            <div key={s.id} className="p-4 rounded-2xl bg-white/5 border border-white/5">
              <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <span className="text-slate-400 mr-3">{i + 1}.</span>
                  <span className="text-white font-medium text-lg">{s.full_name}</span>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => handleStatus(s.id, 'present')}
                    className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                      s.status === 'present'
                        ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                        : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
                    }`}
                  >
                    Keldi
                  </button>
                  <button
                    onClick={() => handleStatus(s.id, 'excused')}
                    className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                      s.status === 'excused'
                        ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20'
                    }`}
                  >
                    Sababli
                  </button>
                  <button
                    onClick={() => handleStatus(s.id, 'absent')}
                    className={`px-3 py-2 rounded-xl font-bold text-sm transition-all ${
                      s.status === 'absent'
                        ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/50'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
                    }`}
                  >
                    Kelmadi
                  </button>
                </div>
              </div>
              {(s.status === 'excused' || editingNote === s.id) && (
                <input
                  type="text"
                  value={s.note}
                  onChange={(e) => handleNote(s.id, e.target.value)}
                  placeholder="Sababni yozing (masalan: kasallik, oilaviy)"
                  className="mt-3 w-full bg-black/30 border border-blue-500/30 rounded-xl px-4 py-2 text-white text-sm focus:outline-none"
                />
              )}
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <p className="text-center py-8 text-slate-500">Guruhda o'quvchi yo'q</p>
          )}
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl mt-8">
          <h2 className="text-xl font-bold text-white mb-6">Tarix (Oxirgi yo'qlamalar)</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-white/10">
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'quvchi</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Guruh</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Status</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Izoh</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Sana</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="py-4 text-white">{h.student_name}</td>
                    <td className="py-4 text-slate-400">{h.group_name}</td>
                    <td className="py-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        h.status === 'present' ? 'bg-emerald-500/20 text-emerald-400' :
                        h.status === 'absent' ? 'bg-rose-500/20 text-rose-400' :
                        h.status === 'late' ? 'bg-amber-500/20 text-amber-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {h.status === 'present' ? 'Kelgan' : h.status === 'absent' ? "Kelmagan" : h.status === 'late' ? "Kech qolgan" : "Sababli"}
                      </span>
                    </td>
                    <td className="py-4 text-slate-400">{h.note || '-'}</td>
                    <td className="py-4 text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => deleteAttendance(h.id)} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
                        🗑 O'chirish
                      </button>
                    </td>
                  </tr>
                ))}
                {history.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-slate-500">Tarix bo'sh</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
        >
          <span>✅</span>
          Davomat muvaffaqiyatli saqlandi!
        </motion.div>
      )}
    </div>
  );
}
