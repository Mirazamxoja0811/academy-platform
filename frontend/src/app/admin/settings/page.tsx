"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Settings, User, Phone, Mail, Shield, Save, Lock, Building, MapPin } from "lucide-react";
import axios from "axios";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [message, setMessage] = useState("");

  const [profileData, setProfileData] = useState({
    first_name: "", last_name: "", email: "", phone: "",
  });

  const [systemData, setSystemData] = useState({
    academy_name: "", phone: "", address: "", currency: "UZS"
  });

  useEffect(() => {
    // Fetch Profile
    axios.get('/api/me/', { withCredentials: true })
      .then(res => {
        setProfileData({
          first_name: res.data.first_name || "",
          last_name: res.data.last_name || "",
          email: res.data.email || "",
          phone: res.data.phone || "",
        });
      }).catch(console.error);

    // Fetch System Settings
    axios.get('/api/system/settings/', { withCredentials: true })
      .then(res => {
        setSystemData(res.data);
      }).catch(console.error);
  }, []);

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saqlanmoqda...");
    try {
      await axios.post('/api/account/settings/', profileData, { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage("Profil muvaffaqiyatli saqlandi!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("Xatolik yuz berdi.");
    }
  };

  const handleSystemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("Saqlanmoqda...");
    try {
      await axios.post('/api/system/settings/', systemData, { 
        withCredentials: true,
        headers: { 'Content-Type': 'application/json' }
      });
      setMessage("Tizim sozlamalari saqlandi!");
      setTimeout(() => setMessage(""), 3000);
    } catch (e) {
      setMessage("Xatolik yuz berdi.");
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Settings className="w-6 h-6 text-blue-400" /> Sozlamalar
        </h2>
        <p className="text-slate-400 text-sm mt-1">Admin profil va tizim parametrlarini boshqarish</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left Column - Navigation */}
        <div className="col-span-1 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          <button 
            onClick={() => {setActiveTab('profile'); setMessage("");}}
            className={`w-full flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${activeTab === 'profile' ? 'bg-blue-500/10 border border-blue-500/20 text-blue-400' : 'bg-slate-900/40 border border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <User className="w-5 h-5" /> Profil Ma'lumotlari
          </button>
          <button 
            onClick={() => {setActiveTab('system'); setMessage("");}}
            className={`w-full flex-shrink-0 flex items-center gap-3 px-4 py-3 rounded-2xl font-medium transition-all ${activeTab === 'system' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-slate-900/40 border border-slate-800/60 text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'}`}
          >
            <Building className="w-5 h-5" /> Tizim Sozlamalari
          </button>
        </div>

        {/* Right Column - Form */}
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="col-span-1 md:col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 md:p-8 rounded-[2rem] relative overflow-hidden"
        >
          <div className={`absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none ${activeTab === 'profile' ? 'bg-blue-500/10' : 'bg-emerald-500/10'}`} />
          
          <h3 className="text-xl font-bold text-white mb-6">
            {activeTab === 'profile' ? "Shaxsiy profil" : "Akademiya ma'lumotlari"}
          </h3>
          
          {activeTab === 'profile' ? (
            <form onSubmit={handleProfileSubmit} className="space-y-5 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Ism</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input 
                      type="text" value={profileData.first_name} onChange={e => setProfileData({...profileData, first_name: e.target.value})}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Familiya</label>
                  <input 
                    type="text" value={profileData.last_name} onChange={e => setProfileData({...profileData, last_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Telefon raqam</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" value={profileData.phone} onChange={e => setProfileData({...profileData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Email manzili</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="email" value={profileData.email} onChange={e => setProfileData({...profileData, email: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('Xatolik') ? 'bg-red-500/10 text-red-400' : 'bg-blue-500/10 text-blue-400'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3.5 rounded-xl font-medium transition-all mt-6">
                <Save className="w-5 h-5" /> Profilni saqlash
              </button>
            </form>
          ) : (
            <form onSubmit={handleSystemSubmit} className="space-y-5 relative z-10">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Akademiya nomi</label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" value={systemData.academy_name} onChange={e => setSystemData({...systemData, academy_name: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Asosiy aloqa raqami</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" value={systemData.phone} onChange={e => setSystemData({...systemData, phone: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Manzil</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input 
                    type="text" value={systemData.address} onChange={e => setSystemData({...systemData, address: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              {message && (
                <div className={`p-3 rounded-xl text-sm font-medium ${message.includes('Xatolik') ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {message}
                </div>
              )}

              <button type="submit" className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white py-3.5 rounded-xl font-medium transition-all mt-6">
                <Save className="w-5 h-5" /> Tizim sozlamalarini saqlash
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  );
}
