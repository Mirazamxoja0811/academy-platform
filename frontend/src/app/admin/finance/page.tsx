"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

interface Payment {
  id: number;
  student__user__first_name: string;
  student__user__last_name: string;
  amount: number | string;
  payment_method: string;
  payment_date: string;
  description?: string;
}

interface Student {
  id: number;
  full_name: string;
}

export default function AdminFinance() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    student_id: "",
    amount: "",
    payment_method: "cash",
    description: "",
  });

  const loadData = () => {
    fetch('/api/finance/')
      .then(res => res.json())
      .then(data => setPayments(data))
      .catch(console.error);
    fetch('/api/students/')
      .then(res => res.json())
      .then(data => setStudents(data))
      .catch(console.error);
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/finance/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        student_id: Number(form.student_id),
        amount: form.amount,
        payment_method: form.payment_method,
        description: form.description,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ student_id: "", amount: "", payment_method: "cash", description: "" });
      loadData();
    }
  };

  const totalAmount = payments.reduce((acc, curr) => acc + Number(curr.amount), 0);

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Moliya bo'limi</h1>
            <p className="text-slate-400 mt-2 text-sm">To'lovlar va daromadlar nazorati</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-emerald-500/20 text-emerald-400 px-6 py-2 rounded-xl font-bold border border-emerald-500/30">
              Jami: {totalAmount.toLocaleString()} UZS
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl"
            >
              + To'lov qo'shish
            </button>
          </div>
        </div>

        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'quvchi</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Summa</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">To'lov Usuli</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Izoh</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Sana</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                  <td className="py-5 text-white font-medium">{p.student__user__first_name} {p.student__user__last_name}</td>
                  <td className="py-5 text-emerald-400 font-bold">{Number(p.amount).toLocaleString()} UZS</td>
                  <td className="py-5 text-slate-300">
                    <span className="px-3 py-1 bg-white/10 rounded-full text-xs border border-white/20">
                      {p.payment_method === 'cash' ? 'Naqd' : p.payment_method === 'card' ? 'Karta' : "O'tkazma"}
                    </span>
                  </td>
                  <td className="py-5 text-slate-400 text-sm">{p.description || "—"}</td>
                  <td className="py-5 text-right text-slate-400">{new Date(p.payment_date).toLocaleDateString()}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-slate-500">Hali to'lovlar mavjud emas</td>
                </tr>
              )}
            </tbody>
          </table>
        </motion.div>
      </motion.div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-md relative z-10 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Yangi To'lov</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">O'quvchi</label>
                <select
                  required
                  value={form.student_id}
                  onChange={e => setForm({ ...form, student_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white"
                >
                  <option value="">Tanlang...</option>
                  {students.map(s => <option key={s.id} value={s.id}>{s.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Summa (UZS)</label>
                <input type="number" required value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">To'lov usuli</label>
                <select value={form.payment_method} onChange={e => setForm({ ...form, payment_method: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white">
                  <option value="cash">Naqd</option>
                  <option value="card">Karta</option>
                  <option value="transfer">O'tkazma</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Izoh</label>
                <input type="text" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white" />
              </div>
              <div className="flex gap-4 mt-6">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300">Bekor</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
