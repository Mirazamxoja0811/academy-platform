"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminGroups() {
  const [groups, setGroups] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    start_date: "",
    max_seats: 15,
    teacher_id: ""
  });
  const [loading, setLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      const res = await fetch("/api/groups/");
      const data = await res.json();
      setGroups(data);
    } catch (e) {
      console.error(e);
    }
  };

  const fetchTeachers = async () => {
    try {
      const res = await fetch("/api/users/?role=teacher");
      const data = await res.json();
      setTeachers(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchGroups();
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const submitData = {
        name: formData.name,
        description: formData.description,
        start_date: formData.start_date,
        max_seats: formData.max_seats,
        teacher_id: formData.teacher_id ? parseInt(formData.teacher_id) : null
      };

      const res = await fetch("/api/groups/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submitData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ name: "", description: "", start_date: "", max_seats: 15, teacher_id: "" });
        fetchGroups();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl mx-auto space-y-8">

        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Guruhlar</h1>
            <p className="text-slate-400 mt-2 text-sm">Guruhni bosib o'quvchilarni ko'ring</p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg shadow-blue-500/30 transition-colors"
          >
            + Yangi qo'shish
          </button>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-slate-400 border-b border-white/10">
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Guruh Nomi</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'qituvchi</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">Tavsif</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider">O'quvchilar</th>
                <th className="pb-4 font-medium uppercase text-xs tracking-wider text-right">Boshlanish Sanasi</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((g, i) => (
                <tr
                  key={i}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                  onClick={() => setSelectedGroup(g)}
                >
                  <td className="py-5 text-white font-medium">{g.name}</td>
                  <td className="py-5 text-indigo-400 font-medium">{g.teacher_name}</td>
                  <td className="py-5 text-slate-300">{g.description}</td>
                  <td className="py-5 text-slate-300 font-bold text-blue-400">{g.student_count} / {g.max_seats}</td>
                  <td className="py-5 text-right text-slate-400">{g.start_date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </motion.div>

      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedGroup(null)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-2xl relative z-50 shadow-2xl max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedGroup.name}</h2>
                  <p className="text-slate-400 mt-1">{selectedGroup.description}</p>
                </div>
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="text-slate-400 hover:text-white text-2xl font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">O'qituvchi</p>
                    <p className="text-white font-bold text-lg mt-2">{selectedGroup.teacher_name}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">O'quvchilar soni</p>
                    <p className="text-blue-400 font-bold text-lg mt-2">{selectedGroup.student_count}</p>
                  </div>
                  <div className="bg-slate-900/50 p-4 rounded-xl">
                    <p className="text-slate-400 text-sm">Maksimal o'rinlar</p>
                    <p className="text-slate-300 font-bold text-lg mt-2">{selectedGroup.max_seats}</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-white mb-3">O'quvchilar ro'yxati</h3>
                  {selectedGroup.students && selectedGroup.students.length > 0 ? (
                    <div className="bg-slate-900/50 rounded-lg divide-y divide-slate-700 max-h-64 overflow-y-auto">
                      {selectedGroup.students.map((student: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center px-4 py-3 hover:bg-slate-800/50">
                          <div>
                            <p className="text-white font-medium">{student.name}</p>
                            <p className="text-slate-500 text-sm">{student.student_id}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-slate-400 italic py-8 text-center">O'quvchilar yo'q</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setSelectedGroup(null)}
                className="w-full mt-6 py-3 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-colors"
              >
                Yopish
              </button>
            </motion.div>
          </div>
        )}

        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={() => setIsModalOpen(false)}
            />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-800 border border-slate-700 p-8 rounded-[2rem] w-full max-w-md relative z-50 shadow-2xl"
            >
              <h2 className="text-2xl font-bold text-white mb-6">Yangi Guruh</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Guruh Nomi</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">O'qituvchi</label>
                  <select value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500">
                    <option value="">Tanlang...</option>
                    {teachers.map((t: any) => (
                      <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tavsif</label>
                  <input type="text" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Boshlanish Sanasi</label>
                  <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Maksimal o'rinlar soni</label>
                  <input type="number" min="1" required value={formData.max_seats} onChange={e => setFormData({...formData, max_seats: parseInt(e.target.value) || 15})} className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500" />
                </div>
                <div className="flex gap-4 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors">Bekor qilish</button>
                  <button type="submit" disabled={loading} className="flex-1 py-3 rounded-xl bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors disabled:opacity-50">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
