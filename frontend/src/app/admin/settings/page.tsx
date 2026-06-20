"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Phone, Mail, Shield, Save, Lock } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [message, setMessage] = useState("");

  useEffect(() => {
    // Fetch current user data
    axios.get('/api/me/', { withCredentials: true })
      .then(res => {
        setFormData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saqlanmoqda...");
    try {
      await axios.post('/api/account/settings/', formData, { 
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage("Sozlamalar muvaffaqiyatli saqlandi!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("Xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" /> Tizim Sozlamalari
        </h2>
        <p className="text-slate-400 text-sm mt-1">Admin profil ma'lumotlarini tahrirlash</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Navigation */}
        <div className="col-span-1 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-medium transition-all">
            <User className="w-5 h-5" /> Profil Ma'lumotlari
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
            <Lock className="w-5 h-5" /> Xavfsizlik & Parol
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-slate-900/40 border border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 transition-all">
            <Shield className="w-5 h-5" /> Tizim Ruxsatlari
          </button>
        </div>

        {/* Right Column - Form */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2rem] relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <h3 className="text-xl font-bold text-white mb-6">Asosiy ma'lumotlar</h3>
          
          <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Ism</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Familiya</label>
                <input 
                  type="text" 
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Telefon raqam</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="+998 90 123 45 67"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-1">Email manzili</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {message && (
              <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('Xatolik') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                {message}
              </div>
            )}

            <button type="submit" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-medium transition-all shadow-[0_0_20px_rgba(59,130,246,0.2)] mt-6">
              <Save className="w-5 h-5" /> Ma'lumotlarni saqlash
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
