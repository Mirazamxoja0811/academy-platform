"use client";

import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Plus, Search, Edit2, Trash2, X, GraduationCap, DollarSign } from "lucide-react";
import axios from "axios";

interface Course {
  id: number;
  name: string;
  price_per_month: number;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({ name: "", price_per_month: 0 });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as any, message: "" });

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await axios.get('/api/courses/', { withCredentials: true });
      setCourses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = editingId ? `/api/courses/${editingId}/` : '/api/courses/';
      const method = editingId ? 'put' : 'post';

      await axios[method](url, formData, { withCredentials: true });
      setIsModalOpen(false);
      setEditingId(null);
      setFormData({ name: "", price_per_month: 0 });
      fetchCourses();
    } catch (e) {
      console.error(e);
      alert("Saqlashda xatolik");
    }
  };

  const handleEdit = (course: Course) => {
    setEditingId(course.id);
    setFormData({ name: course.name, price_per_month: course.price_per_month });
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, id, message: "Rostdan ham ushbu kursni o'chirmoqchimisiz?" });
  };

  const executeDelete = async () => {
    if (!confirmModal.id) return;
    try {
      await axios.delete(`/api/courses/${confirmModal.id}/`, { withCredentials: true });
      fetchCourses();
    } catch (e) {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  const filteredCourses = courses.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-purple-400" /> Kurslar
          </h2>
          <p className="text-slate-400 text-sm mt-1">Akademiya kurslarini boshqarish</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setFormData({ name: "", price_per_month: 0 });
            setIsModalOpen(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_25px_rgba(168,85,247,0.4)] flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Yangi kurs
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-4 rounded-2xl flex items-center gap-3">
        <Search className="w-5 h-5 text-slate-400" />
        <input 
          type="text"
          placeholder="Kurs nomi bo'yicha qidirish..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-transparent border-none text-white outline-none w-full placeholder:text-slate-500"
        />
      </div>

      {/* Courses List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course, idx) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group hover:border-slate-700 transition-colors"
          >
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-colors" />
            
            <div className="flex justify-between items-start mb-6">
              <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                <GraduationCap className="w-6 h-6 text-purple-400" />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleEdit(course)} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300 transition-colors">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(course.id)} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-lg text-rose-400 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{course.name}</h3>
            
            <div className="flex items-center gap-2 text-emerald-400 bg-emerald-400/10 w-fit px-3 py-1.5 rounded-lg">
              <DollarSign className="w-4 h-4" />
              <span className="font-medium">{course.price_per_month.toLocaleString()} UZS / oy</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsModalOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md relative z-10 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white">{editingId ? "Kursni Tahrirlash" : "Yangi Kurs"}</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleCreateOrUpdate} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Kurs nomi</label>
                  <input 
                    type="text" required
                    value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="Masalan: Frontend Dasturlash"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Oylik to'lov (UZS)</label>
                  <input 
                    type="number" required
                    value={formData.price_per_month || ''} onChange={(e) => setFormData({...formData, price_per_month: Number(e.target.value)})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-colors"
                    placeholder="Masalan: 500000"
                  />
                </div>
                <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] mt-4">
                  Saqlash
                </button>
              </form>
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
