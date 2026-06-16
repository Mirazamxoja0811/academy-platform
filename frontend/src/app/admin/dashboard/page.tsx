"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
  amount?: number;
}

interface AdminData {
  full_name: string;
  avatar?: string;
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_revenue: number;
  new_admissions: number;
  active_teachers: number;
  total_groups: number;
  total_coins: number;
  recent_activities: Activity[];
  top_students: Array<{
    name: string;
    group: string;
    coins: number;
  }>;
  recent_requests: Array<{
    name: string;
    course: string;
    status: string;
  }>;
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function AdminDashboard() {
  const [data, setData] = useState<AdminData>({
    full_name: "Akmal Rahimov",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Akmal",
    total_users: 1450,
    total_students: 1200,
    total_teachers: 150,
    total_revenue: 125000000,
    new_admissions: 24,
    active_teachers: 32,
    total_groups: 22,
    total_coins: 45000,
    top_students: [],
    recent_requests: [],
    recent_activities: [
      {
        id: 1,
        activity_type: "payment",
        description: "12 ta o'quvchidan to'lov qabul qilindi",
        created_at: "2 soat oldin",
        amount: 4500000,
      },
      {
        id: 2,
        activity_type: "admission",
        description: "Yangi IELTS guruhi ochildi",
        created_at: "4 soat oldin",
      },
      {
        id: 3,
        activity_type: "system",
        description: "Tizim sozlamalari yangilandi",
        created_at: "Kecha",
      },
    ],
  });
  const router = useRouter();

  return (
    <div className="p-8 relative">

      <motion.div
        className="max-w-7xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
              Admin Paneli
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Markaz boshqaruvi: {data?.full_name}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all text-sm font-medium"
          >
            Chiqish
          </button>
        </motion.div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12">
          {[
            { label: "Jami Foydalanuvchilar", val: data?.total_users, color: "from-blue-500/20" },
            { label: "O'quvchilar", val: data?.total_students, color: "from-emerald-500/20" },
            { label: "O'qituvchilar", val: data?.total_teachers, color: "from-amber-500/20" },
            { label: "Guruhlar", val: data?.total_groups, color: "from-purple-500/20" },
            { label: "Tizimdagi Coinlar", val: data?.total_coins, color: "from-rose-500/20" }
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
               <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} to-transparent opacity-0 group-hover:opacity-100 transition-opacity`} />
               <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{stat.label}</h3>
               <p className="text-3xl font-bold text-white">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Quick Management Cards */}
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-rose-600/20 to-orange-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">👥</div>
                <h2 className="text-xl font-bold text-white mb-2">Foydalanuvchilarni Boshqarish</h2>
                <p className="text-sm text-slate-400">Yangi o'quvchi yoki o'qituvchi qo'shish, ro'yxatni ko'rish</p>
              </div>
              <div className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">📚</div>
                <h2 className="text-xl font-bold text-white mb-2">Guruhlar Boshqaruvi</h2>
                <p className="text-sm text-slate-400">Yangi guruh ochish va o'qituvchi biriktirish</p>
              </div>
              <div className="bg-gradient-to-br from-emerald-600/20 to-teal-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">📢</div>
                <h2 className="text-xl font-bold text-white mb-2">Xabar va E'lonlar</h2>
                <p className="text-sm text-slate-400">Markaz bo'ylab ommaviy SMS yoki tizimli xabar yuborish</p>
              </div>
              <div className="bg-gradient-to-br from-purple-600/20 to-pink-600/20 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl cursor-pointer hover:scale-[1.02] transition-transform">
                <div className="text-4xl mb-4">⚙️</div>
                <h2 className="text-xl font-bold text-white mb-2">Tizim Sozlamalari</h2>
                <p className="text-sm text-slate-400">Coin tizimini reset qilish va umumiy sozlamalar</p>
              </div>
            </div>

            {/* Recent Admission Requests */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Yangi qabul so'rovlari</h2>
              <div className="space-y-4">
                {data?.recent_requests.map((req, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                    <div>
                      <h4 className="font-medium text-slate-200">{req.name}</h4>
                      <p className="text-sm text-slate-400">{req.course}</p>
                    </div>
                    <span className="px-3 py-1 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/20">
                      {req.status}
                    </span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium transition-colors text-slate-300">Barcha so'rovlarni ko'rish</button>
            </div>
          </motion.div>

          {/* Sidebar - Top Students */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">🏆 Top O'quvchilar</h2>
            <div className="space-y-6">
              {data?.top_students.map((student, index) => (
                <div key={index} className="flex items-center gap-4 relative">
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-lg ${index === 0 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' : index === 1 ? 'bg-gradient-to-br from-slate-300 to-slate-500 text-white' : index === 2 ? 'bg-gradient-to-br from-amber-600 to-amber-800 text-white' : 'bg-white/10 text-slate-400'}`}>
                     {index + 1}
                   </div>
                   <div>
                     <h4 className="font-semibold text-slate-200">{student.name}</h4>
                     <p className="text-xs text-slate-400">{student.group}</p>
                   </div>
                   <div className="ml-auto font-bold text-yellow-400">
                     {student.coins} 🪙
                   </div>
                </div>
              ))}
            </div>
          </motion.div>

        </div>
      </motion.div>
    </div>
  );
}
