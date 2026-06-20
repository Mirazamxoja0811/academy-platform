"use client";

import ConfirmModal from "@/components/ConfirmModal";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, CheckCircle, XCircle, Clock, User, Phone, BookOpen, AlertCircle } from "lucide-react";
import axios from "axios";

interface AdmissionRequest {
  id: number;
  full_name: string;
  phone: string;
  course_name: string;
  status: string;
  message: string;
  created_at: string;
}

export default function AdmissionsPage() {
  const [requests, setRequests] = useState<AdmissionRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null as number | null, action: null as 'approve' | 'reject' | null, message: "" });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await axios.get('/api/admissions/', { withCredentials: true });
      setRequests(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleActionClick = (id: number, action: 'approve' | 'reject') => {
    setConfirmModal({
      isOpen: true,
      id,
      action,
      message: `Rostdan ham ushbu so'rovni ${action === 'approve' ? 'qabul qilasizmi' : 'rad etasizmi'}?`
    });
  };

  const executeAction = async () => {
    const { id, action } = confirmModal;
    if (!id || !action) return;
    
    setActionLoading(id);
    try {
      const res = await axios.post(`/api/admissions/${id}/action/`, { action }, { withCredentials: true });
      if (action === 'approve') {
        alert(`Qabul qilindi! O'quvchi uchun login: ${res.data.username}, parol: ${res.data.password}`);
      }
      fetchRequests();
    } catch (e: any) {
      alert(e.response?.data?.detail || "Xatolik yuz berdi");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'new': return <span className="px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full text-xs font-medium border border-blue-500/20 flex items-center gap-1"><Clock className="w-3 h-3"/> Yangi</span>;
      case 'approved': return <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 rounded-full text-xs font-medium border border-emerald-500/20 flex items-center gap-1"><CheckCircle className="w-3 h-3"/> Qabul qilingan</span>;
      case 'rejected': return <span className="px-3 py-1 bg-rose-500/10 text-rose-400 rounded-full text-xs font-medium border border-rose-500/20 flex items-center gap-1"><XCircle className="w-3 h-3"/> Rad etilgan</span>;
      default: return null;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Mail className="w-6 h-6 text-blue-400" /> Qabul So'rovlari
        </h2>
        <p className="text-slate-400 text-sm mt-1">Saytdan kelgan yangi o'quvchilar so'rovlarini boshqarish</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-12 rounded-[2rem] text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-10 h-10 text-slate-500" />
          </div>
          <h3 className="text-xl font-medium text-white mb-2">Hozircha so'rovlar yo'q</h3>
          <p className="text-slate-400">Yangi o'quvchilardan kelgan so'rovlar shu yerda ko'rinadi.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req, idx) => (
            <motion.div
              key={req.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group hover:border-slate-700 transition-colors flex flex-col"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />
              
              <div className="flex justify-between items-start mb-4">
                {getStatusBadge(req.status)}
                <span className="text-xs text-slate-500">{new Date(req.created_at).toLocaleDateString()}</span>
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                  <User className="w-4 h-4 text-slate-400" /> {req.full_name}
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Phone className="w-4 h-4 text-slate-500" />
                    <span>{req.phone || "Kiritilmagan"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-300">
                    <BookOpen className="w-4 h-4 text-slate-500" />
                    <span>{req.course_name || "Barchasi"}</span>
                  </div>
                </div>
              </div>

              {req.message && (
                <div className="p-3 bg-slate-950/50 rounded-xl mb-6 text-sm text-slate-400 border border-slate-800/50 flex items-start gap-2 flex-1">
                  <AlertCircle className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
                  <p>{req.message}</p>
                </div>
              )}

              {req.status === 'new' && (
                <div className="grid grid-cols-2 gap-3 mt-auto">
                  <button 
                    onClick={() => handleActionClick(req.id, 'reject')}
                    disabled={actionLoading === req.id}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-rose-400 font-medium transition-colors disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" /> Rad etish
                  </button>
                  <button 
                    onClick={() => handleActionClick(req.id, 'approve')}
                    disabled={actionLoading === req.id}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-medium transition-colors disabled:opacity-50"
                  >
                    {actionLoading === req.id ? (
                      <div className="w-4 h-4 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                    ) : (
                      <><CheckCircle className="w-4 h-4" /> Qabul qilish</>
                    )}
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        onConfirm={executeAction}
        message={confirmModal.message}
        confirmText={confirmModal.action === 'approve' ? "Qabul qilish" : "Rad etish"}
      />
    </div>
  );
}
