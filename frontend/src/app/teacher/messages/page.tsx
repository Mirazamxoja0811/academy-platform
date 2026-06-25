"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MessageSquare, User, Calendar, Search, Send, X } from "lucide-react";
import axios from "axios";

export default function TeacherMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);
  const [announcement, setAnnouncement] = useState({ group_id: "", message: "" });
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    fetchData();
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    try {
      const res = await axios.get("/api/groups/", { withCredentials: true });
      setGroups(res.data);
    } catch(e) {}
  };

  const handleSendAnnouncement = async (e: any) => {
    e.preventDefault();
    if(!announcement.group_id || !announcement.message) return;
    setSending(true);
    try {
      const res = await axios.post("/api/teacher/announcement/", announcement, { withCredentials: true });
      setToast(res.data.message);
      setShowModal(false);
      setAnnouncement({ group_id: "", message: "" });
      setTimeout(() => setToast(""), 3000);
    } catch(e) {
      alert("Xatolik yuz berdi");
    }
    setSending(false);
  };


  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/teacher/messages/", { withCredentials: true });
      setMessages(res.data.messages || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const filteredMessages = messages.filter(msg => 
    msg.student_name.toLowerCase().includes(search.toLowerCase()) || 
    msg.content.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-500/20 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">O'quvchilardan Xabarlar</h2>
        </div>
        
        <div className="relative w-full sm:w-auto flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Xabar izlash..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl pl-12 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all backdrop-blur-sm"
            />
          </div>
          <button onClick={() => setShowModal(true)} className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-purple-500/20">
            <Send className="w-5 h-5" />
            E'lon yuborish
          </button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
      >
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-8 h-8 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-slate-300 mb-2">Xabarlar yo'q</h3>
              <p className="text-slate-500">Hozircha o'quvchilardan hech qanday xabar kelmagan.</p>
            </div>
          ) : (
            filteredMessages.map((msg, idx) => (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
                key={msg.id} 
                className="bg-slate-950/50 hover:bg-slate-900/80 transition-colors border border-slate-800 p-5 rounded-2xl flex flex-col sm:flex-row gap-4 sm:gap-6"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl flex items-center justify-center border border-purple-500/30">
                    <User className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-2 gap-2">
                    <h4 className="text-lg font-semibold text-white">{msg.student_name}</h4>
                    <span className="flex items-center gap-1.5 text-xs font-medium text-slate-400 bg-slate-900 px-3 py-1.5 rounded-full border border-slate-800">
                      <Calendar className="w-3.5 h-3.5" />
                      {msg.created_at}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)}></div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-[2rem] p-8 relative z-10 shadow-2xl"
          >
            <button onClick={() => setShowModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-white">
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-bold text-white mb-6">Guruhga E'lon Yuborish</h3>
            
            <form onSubmit={handleSendAnnouncement} className="space-y-5">
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Guruhni tanlang</label>
                <select 
                  required
                  value={announcement.group_id}
                  onChange={e => setAnnouncement({...announcement, group_id: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50"
                >
                  <option value="">Tanlang...</option>
                  {groups.map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-slate-400 text-sm font-medium mb-2">Xabar matni</label>
                <textarea 
                  required
                  rows={4}
                  placeholder="Masalan: Bugun biroz toblim qochganligi sababli darsimiz bo'lmaydi..."
                  value={announcement.message}
                  onChange={e => setAnnouncement({...announcement, message: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 resize-none"
                ></textarea>
              </div>
              
              <button 
                type="submit" 
                disabled={sending}
                className="w-full bg-purple-500 hover:bg-purple-600 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex justify-center items-center gap-2 mt-4"
              >
                {sending ? "Yuborilmoqda..." : "Yuborish"}
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50 flex items-center gap-3"
        >
          <span>✅</span>
          {toast}
        </motion.div>
      )}
    </div>
  );
}
