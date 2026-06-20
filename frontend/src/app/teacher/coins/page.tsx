"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherCoins() {
  const [selectedStudent, setSelectedStudent] = useState("");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);

  const fetchHistory = () => {
    fetch("/api/teacher/history/coins/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => setHistory(data))
      .catch(e => console.error(e));
  };

  useEffect(() => {
    fetch("/api/students/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => setStudents(data))
      .catch(e => console.error(e));

    fetchHistory();
  }, []);

  const handleGive = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !amount || !reason) return;

    fetch('/api/teacher/coins/', { credentials: "include", 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: Number(selectedStudent),
        amount: Number(amount),
        reason,
      }),
    })
      .then(res => res.json())
      .then((data) => {
        const studentName = students.find(s => s.id.toString() === selectedStudent)?.full_name || '';
        setToastMsg(`${studentName} ga ${amount} coin yuborildi!`);
        setShowToast(true);
        setAmount("");
        setReason("");
        setSelectedStudent("");
        setTimeout(() => setShowToast(false), 3000);
        fetchHistory();
      });
  };

  const deleteCoin = (id: number) => {
    if(!confirm("Bu coinni o'chirishni xohlaysizmi?")) return;
    fetch(`/api/coins/${id}/delete/`, { credentials: "include",  method: "POST" })
      .then(res => {
        if(res.ok) fetchHistory();
      });
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        <div className="text-center mb-12">
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="text-8xl mb-4 drop-shadow-[0_0_30px_rgba(234,179,8,0.5)]"
          >
            🪙
          </motion.div>
          <h1 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-lg">
            Coin Tarqatish
          </h1>
          <p className="text-slate-400 mt-4 text-lg">Faol o'quvchilarni rag'batlantirish tizimi</p>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl border border-yellow-500/20 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden">
          <form onSubmit={handleGive} className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-yellow-500 mb-2">O'quvchini tanlang</label>
                <select
                  value={selectedStudent}
                  onChange={(e) => setSelectedStudent(e.target.value)}
                  className="w-full bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-4 text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors"
                >
                  <option value="" disabled>Tanlang...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name} ({s.group_name})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-yellow-500 mb-2">Coin miqdori</label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Masalan: 50"
                    className="w-full bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-4 text-yellow-500 font-bold text-xl focus:outline-none focus:border-yellow-500 transition-colors"
                  />
                  <button type="button" onClick={() => setAmount("50")} className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 font-bold px-4 rounded-xl transition-colors">+50</button>
                  <button type="button" onClick={() => setAmount("100")} className="bg-yellow-500/20 hover:bg-yellow-500/40 text-yellow-500 font-bold px-4 rounded-xl transition-colors">+100</button>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-500 mb-2">Sabab (Izoh)</label>
              <input
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Uy vazifasini a'lo bajargani uchun..."
                className="w-full bg-black/40 border border-yellow-500/30 rounded-xl px-4 py-4 text-slate-200 focus:outline-none focus:border-yellow-500 transition-colors"
              />
            </div>
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 text-black font-black text-lg py-4 px-4 rounded-xl shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all hover:scale-[1.02] active:scale-[0.98]">
              Coin Yuborish 🚀
            </button>
          </form>
        </div>

        <div className="bg-gradient-to-br from-yellow-500/5 to-orange-500/5 backdrop-blur-xl border border-yellow-500/20 rounded-[2rem] p-10 shadow-2xl relative overflow-hidden mt-8">
          <h2 className="text-xl font-bold text-yellow-500 mb-6 relative z-10">Tarix (Oxirgi tarqatilgan coinlar)</h2>
          <div className="overflow-x-auto relative z-10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-yellow-500/20">
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'quvchi</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Guruh</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Miqdor</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Sabab</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider">Sana</th>
                  <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Amal</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h, i) => (
                  <tr key={i} className="border-b border-yellow-500/10 hover:bg-yellow-500/5 transition-colors">
                    <td className="py-4 text-white">{h.student_name}</td>
                    <td className="py-4 text-slate-400">{h.group_name}</td>
                    <td className="py-4 font-black text-yellow-500">+{h.amount} 🪙</td>
                    <td className="py-4 text-slate-300">{h.reason}</td>
                    <td className="py-4 text-slate-400">{new Date(h.date).toLocaleDateString()}</td>
                    <td className="py-4 text-right">
                      <button onClick={() => deleteCoin(h.id)} className="text-red-400 hover:text-red-300 transition-colors text-sm font-medium">
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
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
        >
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-black px-10 py-6 rounded-3xl shadow-[0_0_100px_rgba(234,179,8,0.8)] font-black text-2xl flex flex-col items-center gap-4">
            <span className="text-6xl animate-bounce">🎉</span>
            {toastMsg}
          </div>
        </motion.div>
      )}
    </div>
  );
}
