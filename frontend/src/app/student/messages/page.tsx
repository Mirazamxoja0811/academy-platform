"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, MessageSquare, User } from "lucide-react";
import axios from "axios";

export default function StudentMessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [content, setContent] = useState("");
  const [selectedTeacher, setSelectedTeacher] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/students/me/messages/", { withCredentials: true });
      setMessages(res.data.messages || []);
      setTeachers(res.data.teachers || []);
      if (res.data.teachers && res.data.teachers.length > 0) {
        setSelectedTeacher(res.data.teachers[0].id.toString());
      }
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !selectedTeacher) return;
    
    try {
      await axios.post("/api/students/me/messages/", {
        teacher_id: parseInt(selectedTeacher),
        content: content
      }, { withCredentials: true });
      
      setContent("");
      fetchData();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/20 rounded-2xl">
            <MessageSquare className="w-6 h-6 text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-white">Ustozga Xabar Yuborish</h2>
        </div>

        <form onSubmit={handleSend} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Ustozni tanlang</label>
            <select
              value={selectedTeacher}
              onChange={(e) => setSelectedTeacher(e.target.value)}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors"
              required
            >
              <option value="">Tanlang...</option>
              {teachers.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Xabar matni</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-slate-950/50 border border-slate-800 text-white rounded-2xl px-4 py-3 focus:outline-none focus:border-blue-500/50 transition-colors resize-none"
              placeholder="Xabaringizni yozing..."
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!content.trim() || !selectedTeacher}
            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-2xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4" />
            Yuborish
          </button>
        </form>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
      >
        <h3 className="text-xl font-bold text-white mb-6">Yuborilgan Xabarlar</h3>
        <div className="space-y-4">
          {loading ? (
            <p className="text-slate-500 text-center py-4">Yuklanmoqda...</p>
          ) : messages.length === 0 ? (
            <p className="text-slate-500 text-center py-4">Hozircha xabarlar yo'q</p>
          ) : (
            messages.map((msg) => (
              <div key={msg.id} className="bg-slate-950/50 border border-slate-800 p-4 rounded-2xl">
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center gap-2 text-slate-300 font-medium">
                    <User className="w-4 h-4 text-slate-500" />
                    Kimga: {msg.teacher_name}
                  </div>
                  <span className="text-xs text-slate-500">{msg.created_at}</span>
                </div>
                <p className="text-slate-400 text-sm whitespace-pre-wrap">{msg.content}</p>
              </div>
            ))
          )}
        </div>
      </motion.div>
    </div>
  );
}
