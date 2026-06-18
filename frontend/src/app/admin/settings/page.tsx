"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function AdminSettings() {
  const [user, setUser] = useState({ first_name: "Yuklanmoqda...", last_name: "", phone: "", email: "", avatar: null });
  const [formData, setFormData] = useState({ first_name: "", last_name: "", phone: "", email: "" });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/me/")
      .then(r => r.json())
      .then(d => {
        setUser(d);
        setFormData({
          first_name: d.first_name,
          last_name: d.last_name,
          phone: d.phone || "",
          email: d.email || ""
        });
      })
      .catch(console.error);
  }, []);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatar(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('first_name', formData.first_name);
      formDataToSend.append('last_name', formData.last_name);
      formDataToSend.append('phone', formData.phone);
      formDataToSend.append('email', formData.email);
      if (avatar) {
        formDataToSend.append('avatar', avatar);
      }

      const res = await fetch("/api/account/settings/", {
        method: "POST",
        body: formDataToSend
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("Sozlamalar saqlandi!");
        setUser({ ...formData, avatar: data.avatar });
        setAvatar(null);
        setAvatarPreview("");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setMessage(data.error || "Xatolik yuz berdi!");
      }
    } catch (e) {
      setMessage("Xatolik yuz berdi!");
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Tizim Sozlamalari</h1>
          <p className="text-slate-400 mt-2 text-sm">Markaz sozlamalari va admin profil</p>
        </div>

        {message && (
          <div className={`${message.includes("Xatolik") ? "bg-red-500/20 border-red-500/50 text-red-400" : "bg-green-500/20 border-green-500/50 text-green-400"} border px-4 py-3 rounded-xl text-sm`}>
            {message}
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 shadow-2xl space-y-8">
          <div className="flex flex-col items-center justify-center text-center pb-8 border-b border-white/10">
            <div className="relative mb-4">
              <div className="w-32 h-32 bg-gradient-to-br from-rose-500 to-pink-500 rounded-full flex items-center justify-center text-4xl font-bold text-white overflow-hidden">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                ) : (
                  user.first_name?.[0] || "A"
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full cursor-pointer transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            </div>
            <h2 className="text-2xl font-bold text-white">{user.first_name} {user.last_name}</h2>
            <p className="text-slate-400 mt-2">Rol: Administrator</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Ismi</label>
                <input
                  type="text"
                  value={formData.first_name}
                  onChange={e => setFormData({...formData, first_name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Familiyasi</label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={e => setFormData({...formData, last_name: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Telefon raqam</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={e => setFormData({...formData, phone: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-slate-300 focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-500/30 transition-colors disabled:opacity-50"
            >
              {loading ? "Saqlanmoqda..." : "Saqlash"}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
