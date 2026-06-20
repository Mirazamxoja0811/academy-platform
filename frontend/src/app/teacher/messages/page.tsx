"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function TeacherMessages() {
  const [target, setTarget] = useState("all");
  const [message, setMessage] = useState("");
  const [sentMessages, setSentMessages] = useState<any[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [groups, setGroups] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/groups/")
      .then(r => r.json())
      .then(data => setGroups(data))
      .catch(e => console.error(e));
  }, []);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    const newMsg = {
      id: Date.now(),
      target: target === "all" ? "Barcha o'quvchilar" : target,
      text: message,
      date: "Hozirgina"
    };

    setSentMessages([newMsg, ...sentMessages]);
    setMessage("");
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Xabarlar</h1>
          <p className="text-slate-400 mt-2 text-sm">O'quvchilar bilan muloqot va e'lonlar</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Send Message Form */}
          <div className="lg:col-span-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">Yangi Xabar</h2>
            <form onSubmit={handleSend} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Kimga</label>
                <select 
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500/50"
                >
                  <option value="all">Barcha o'quvchilarim</option>
                  {groups.map((g, i) => (
                    <option key={i} value={g.name}>{g.name}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Xabar matni</label>
                <textarea 
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Xabaringizni kiriting..."
                  rows={4}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-indigo-500/50 resize-none"
                />
              </div>

              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-colors flex justify-center items-center gap-2">
                <span>Yuborish</span>
                <span>✈️</span>
              </button>
            </form>
          </div>

          {/* Sent Messages List */}
          <div className="lg:col-span-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Yuborilgan xabarlar tarixi</h2>
            <div className="space-y-4">
              {sentMessages.map((msg) => (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={msg.id} 
                  className="p-5 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-lg text-xs font-semibold">
                      Kimga: {msg.target}
                    </span>
                    <span className="text-slate-500 text-xs">{msg.date}</span>
                  </div>
                  <p className="text-slate-300">{msg.text}</p>
                </motion.div>
              ))}
            </div>
          </div>

        </div>
      </motion.div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div 
          initial={{ opacity: 0, y: 50 }} 
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-10 right-10 bg-emerald-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold flex items-center gap-3 z-50"
        >
          <span>✅</span>
          Xabar muvaffaqiyatli yuborildi!
        </motion.div>
      )}
    </div>
  );
}
