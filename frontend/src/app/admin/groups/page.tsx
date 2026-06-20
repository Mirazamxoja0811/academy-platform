"use client";

import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Trash2, Edit, X, Users, BookOpen, Clock, CalendarDays } from "lucide-react";

export default function GroupsPage() {
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as any, message: "" });
  const [search, setSearch] = useState("");
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [selectedGroup, setSelectedGroup] = useState<any | null>(null);

  const [formData, setFormData] = useState({
    name: "", course_id: "", teacher_id: "",
    schedule_days: "", start_time: "", end_time: "",
    start_date: "", max_seats: 15, status: "active"
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [gRes, cRes, tRes] = await Promise.all([
        fetch(`/api/groups/`),
        fetch(`/api/courses/`),
        fetch(`/api/users/?role=teacher`)
      ]);
      setGroups(await gRes.json());
      setCourses(await cRes.json());
      setTeachers(await tRes.json());
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/groups/${editingId}/` : "/api/groups/";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error("Xatolik yuz berdi");
      
      setIsDrawerOpen(false);
      setEditingId(null);
      setFormData({ name: "", course_id: "", teacher_id: "", schedule_days: "", start_time: "", end_time: "", start_date: "", max_seats: 15, status: "active" });
      fetchData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleEdit = (g: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(g.id);
    setFormData({
      name: g.name || "",
      course_id: courses.find(c => c.name === g.course)?.id || "",
      teacher_id: g.teacher_id || "",
      schedule_days: g.schedule_days || "",
      start_time: g.start_time || "",
      end_time: g.end_time || "",
      start_date: g.start_date || "",
      max_seats: g.max_seats || 15,
      status: g.status || "active"
    });
    setIsDrawerOpen(true);
  };

  const handleDelete = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham guruhni o'chirmoqchimisiz?" });
  };
  
  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await fetch(`/api/groups/${confirmModal.id}/`, { method: "DELETE" });
      fetchData();
    } catch (e) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Guruh izlash..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-sm"
          />
        </div>
        
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", course_id: "", teacher_id: "", schedule_days: "", start_time: "", end_time: "", start_date: "", max_seats: 15, status: "active" });
            setIsDrawerOpen(true);
          }}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-6 py-3.5 rounded-2xl font-medium transition-all shadow-lg shadow-emerald-500/25"
        >
          <Plus className="w-5 h-5" />
          <span>Guruh yaratish</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {loading ? (
          <p className="text-slate-400">Yuklanmoqda...</p>
        ) : filteredGroups.length === 0 ? (
          <p className="text-slate-400">Guruhlar topilmadi.</p>
        ) : (
          filteredGroups.map((group, idx) => (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.05 }}
              key={group.id} 
              onClick={() => setSelectedGroup(group)}
              className="bg-slate-900/40 border border-slate-800/60 p-6 rounded-[2rem] hover:border-slate-700 transition-colors backdrop-blur-md relative overflow-hidden group-card cursor-pointer"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${
                    group.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                    group.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                  }`}>
                    {group.status}
                  </span>
                  <h3 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{group.name}</h3>
                  <p className="text-slate-400 text-sm mt-1 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4" /> {group.course}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button onClick={(e) => handleEdit(group, e)} className="p-2 bg-slate-800/50 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 rounded-xl transition-all"><Edit className="w-4 h-4"/></button>
                  <button onClick={(e) => handleDelete(group.id, e)} className="p-2 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-xl transition-all"><Trash2 className="w-4 h-4"/></button>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span className="flex-1">O'qituvchi:</span>
                  <span className="font-semibold text-white">{group.teacher_name}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-300 bg-slate-950/50 p-3 rounded-xl border border-slate-800/50">
                  <Clock className="w-5 h-5 text-purple-400" />
                  <span className="flex-1">Vaqti:</span>
                  <span className="font-semibold text-white">{group.schedule_days} • {group.start_time}-{group.end_time}</span>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">O'quvchilar bandligi</span>
                  <span className="text-white font-medium">{group.student_count} / {group.max_seats}</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div 
                    className={`h-2 rounded-full ${group.student_count >= group.max_seats ? 'bg-red-500' : 'bg-gradient-to-r from-emerald-400 to-teal-500'}`}
                    style={{ width: `${Math.min(100, (group.student_count / group.max_seats) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Drawer */}
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsDrawerOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" />
            <motion.div initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", bounce: 0, duration: 0.4 }} className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl z-50 flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-slate-800">
                <h3 className="text-xl font-bold text-white">{editingId ? "Guruhni Tahrirlash" : "Yangi Guruh"}</h3>
                <button onClick={() => setIsDrawerOpen(false)} className="p-2 text-slate-400 hover:text-white bg-slate-800/50 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                <form id="add-group-form" onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Guruh nomi</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Kurs</label>
                      <select value={formData.course_id} onChange={e => setFormData({...formData, course_id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
                        <option value="">Tanlang...</option>
                        {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">O'qituvchi</label>
                      <select value={formData.teacher_id} onChange={e => setFormData({...formData, teacher_id: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none">
                        <option value="">Tanlang...</option>
                        {teachers.map(t => <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Max. joylar</label>
                    <input type="number" required value={formData.max_seats} onChange={e => setFormData({...formData, max_seats: parseInt(e.target.value)})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Kunlar (masalan: Du-Chor-Jum)</label>
                    <input type="text" value={formData.schedule_days} onChange={e => setFormData({...formData, schedule_days: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Boshlanish vaqti</label>
                      <input type="time" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tugash vaqti</label>
                      <input type="time" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Ochilish sanasi</label>
                    <input type="date" value={formData.start_date?.split('T')[0]} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white outline-none focus:border-emerald-500/50" />
                  </div>
                </form>
              </div>

              <div className="p-6 border-t border-slate-800 bg-slate-900/80 backdrop-blur-sm flex gap-3">
                <button type="button" onClick={() => setIsDrawerOpen(false)} className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-medium hover:bg-slate-800">Bekor qilish</button>
                <button type="submit" form="add-group-form" className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/25">Saqlash</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Student List Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedGroup(null)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/50">
                <div>
                  <h3 className="text-xl font-bold text-white">{selectedGroup.name} O'quvchilari</h3>
                  <p className="text-sm text-slate-400 mt-1">{selectedGroup.students?.length || 0} ta o'quvchi</p>
                </div>
                <button onClick={() => setSelectedGroup(null)} className="p-2 text-slate-400 hover:text-white bg-slate-900 rounded-full"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                {selectedGroup.students?.length > 0 ? (
                  <div className="space-y-3">
                    {selectedGroup.students.map((student: any, idx: number) => (
                      <div key={student.id} className="flex items-center gap-4 bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                        <div className="w-10 h-10 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-medium text-white">{student.name}</p>
                          <p className="text-sm text-slate-500">ID: {student.student_id}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-slate-400 text-center py-10">Bu guruhda hozircha o'quvchilar yo'q.</p>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeDelete}
        message={confirmModal.message}
      />
    </div>
  );
}
