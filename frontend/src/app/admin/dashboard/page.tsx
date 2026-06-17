"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import DashboardClock from "@/components/DashboardClock";

interface AdminData {
  full_name: string;
  total_users: number;
  total_students: number;
  total_teachers: number;
  total_groups: number;
  total_coins: number;
  new_admissions: number;
  total_revenue: string;
  top_students_coins: Array<{ name: string; group: string; coins: number }>;
  top_students_grades: Array<{ name: string; group: string; average_grade: number }>;
  recent_requests: Array<{ name: string; course: string; status: string; message?: string }>;
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
    full_name: "Yuklanmoqda...",
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_groups: 0,
    total_coins: 0,
    new_admissions: 0,
    total_revenue: "0",
    top_students_coins: [],
    top_students_grades: [],
    recent_requests: [],
  });

  useEffect(() => {
    fetch('/api/admin/dashboard/stats/')
      .then(res => res.json())
      .then(d => setData(d))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 relative">
      <motion.div className="max-w-7xl mx-auto relative z-10" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex justify-between items-start mb-12 gap-4 flex-wrap">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
              Admin Dashboard
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Markaz boshqaruvi: {data.full_name}</p>
          </div>
          <DashboardClock />
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {[
            { label: "Foydalanuvchilar", val: data.total_users },
            { label: "O'quvchilar", val: data.total_students },
            { label: "O'qituvchilar", val: data.total_teachers },
            { label: "Guruhlar", val: data.total_groups },
            { label: "Jami Coinlar", val: data.total_coins },
            { label: "Yangi qabullar", val: data.new_admissions },
          ].map((stat, idx) => (
            <motion.div key={idx} variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-5 shadow-xl">
              <h3 className="text-slate-400 text-xs font-medium uppercase tracking-wider mb-2">{stat.label}</h3>
              <p className="text-2xl font-bold text-white">{stat.val}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div variants={itemVariants} className="lg:col-span-2 space-y-8">
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">🏆 Top 3 — Eng yuqori baho</h2>
              <div className="space-y-4">
                {data.top_students_grades.length === 0 ? (
                  <p className="text-slate-500">Hali baholar yo'q</p>
                ) : data.top_students_grades.map((s, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                    <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? "bg-yellow-500/30 text-yellow-400" : i === 1 ? "bg-slate-400/30 text-slate-300" : "bg-amber-700/30 text-amber-500"}`}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="font-medium text-white">{s.name}</p>
                      <p className="text-xs text-slate-400">{s.group}</p>
                    </div>
                    <span className="text-emerald-400 font-bold text-lg">{s.average_grade} ball</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">Yangi qabul so'rovlari</h2>
              <div className="space-y-4">
                {data.recent_requests.length === 0 ? (
                  <p className="text-slate-500">Yangi so'rovlar yo'q</p>
                ) : data.recent_requests.map((req, i) => (
                  <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <h4 className="font-medium text-slate-200">{req.name}</h4>
                        <p className="text-sm text-slate-400">{req.course}</p>
                        {req.message && <p className="text-xs text-slate-500 mt-1">{req.message}</p>}
                      </div>
                      <span className="px-3 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full shrink-0">{req.status}</span>
                    </div>
                  </div>
                ))}
              </div>
              <a href="/admin/admissions/" className="block w-full mt-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-sm font-medium text-center text-slate-300 transition-colors">
                Barcha so'rovlarni ko'rish
              </a>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl h-fit">
            <h2 className="text-xl font-bold text-white mb-6">🪙 Top 3 — Coinlar</h2>
            <div className="space-y-6">
              {data.top_students_coins.length === 0 ? (
                <p className="text-slate-500">Coinlar yo'q</p>
              ) : data.top_students_coins.map((s, i) => (
                <div key={i} className="flex items-center gap-4">
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${i === 0 ? "bg-yellow-500/30 text-yellow-400" : "bg-white/10 text-slate-400"}`}>{i + 1}</span>
                  <div className="flex-1">
                    <h4 className="font-semibold text-slate-200">{s.name}</h4>
                    <p className="text-xs text-slate-400">{s.group}</p>
                  </div>
                  <span className="font-bold text-yellow-400">{s.coins} 🪙</span>
                </div>
              ))}
            </div>
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-slate-400 text-sm">Jami daromad</p>
              <p className="text-2xl font-bold text-emerald-400">{Number(data.total_revenue).toLocaleString()} UZS</p>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
