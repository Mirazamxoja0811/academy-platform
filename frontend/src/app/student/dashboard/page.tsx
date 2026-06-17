"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, Variants } from "framer-motion";
import DashboardClock from "@/components/DashboardClock";

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
  coin_amount?: number;
}

interface StudentData {
  full_name: string;
  avatar?: string;
  total_coins: number;
  attendance_rate: number;
  average_grade: number;
  active_courses: number;
  recent_activities: Activity[];
  grades: { subject: string; grade: number; date: string }[];
  attendances: { status: string; date: string; group?: string }[];
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

export default function StudentDashboard() {
  const [data, setData] = useState<StudentData & {rank?: number, total_students?: number, group_name?: string}>({
    full_name: "Yuklanmoqda...",
    total_coins: 0,
    attendance_rate: 0,
    average_grade: 0,
    active_courses: 0,
    grades: [],
    attendances: [],
    recent_activities: []
  });

  useEffect(() => {
    fetch('/api/me/')
      .then(res => res.json())
      .then(user => {
        setData(prev => ({...prev, full_name: user.full_name}));
      });

    fetch('/api/students/me/dashboard/')
      .then(res => res.json())
      .then(d => {
        setData(prev => ({...prev, ...d}));
      });
  }, []);
  const router = useRouter();

  return (
    <div className="text-slate-200 p-4 md:p-8 relative">

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-6xl mx-auto space-y-8"
      >
        
        {/* Header Section */}
        <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-8 md:p-10 rounded-[2rem] flex flex-col md:flex-row justify-between items-center gap-6 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 pointer-events-none"></div>
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 w-full">
          <div>
            <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-blue-500/20 shadow-inner">O'QUVCHI PANEL</span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mt-5 drop-shadow-lg">
              Salom, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{data.full_name}</span> 👋
            </h1>
            <p className="text-slate-300 mt-3 text-lg font-light">Bugungi o'qishlaringizga omad tilaymiz.</p>
            {data.group_name && (
              <div className="mt-4 flex gap-4 flex-wrap">
                <span className="px-4 py-2 bg-white/10 rounded-xl border border-white/10 font-medium">🏫 {data.group_name}</span>
                <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-bold">🏆 Reyting: {data.rank} / {data.total_students}</span>
              </div>
            )}
          </div>
          <DashboardClock />
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div variants={itemVariants} whileHover={{ y: -5 }} className="bg-gradient-to-br from-amber-500 to-orange-600 p-8 rounded-[2rem] shadow-2xl shadow-orange-500/20 border border-white/20 relative overflow-hidden">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-8 -top-8 opacity-20 text-9xl pointer-events-none">🪙</motion.div>
            <h2 className="text-xl font-medium text-orange-100 relative z-10">Jami Coinlar</h2>
            <p className="text-6xl font-black text-white mt-2 relative z-10 drop-shadow-md">{data.total_coins}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-medium text-slate-300 mb-2">O'rtacha Baho</h2>
            <p className="text-5xl font-black text-emerald-400">{data.average_grade || 0}</p>
            <p className="text-slate-500 text-sm mt-2">Guruh reytingi: {data.rank || '-'} / {data.total_students || 0}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-medium text-slate-300 mb-6 flex items-center gap-2"><span className="text-yellow-500">⭐</span> Oxirgi Baholar</h2>
            <ul className="space-y-4">
              {data.grades?.length === 0 ? <p className="text-slate-500 italic">Hali baholar olinmagan</p> : 
                data.grades?.slice(0, 3).map((g, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex justify-between items-center pb-3 border-b border-slate-700/50 last:border-0 last:pb-0 transition-transform">
                    <span className="font-medium text-slate-200">{g.subject}</span>
                    <span className="px-4 py-1.5 bg-green-500/10 text-green-400 rounded-xl font-bold border border-green-500/20">{g.grade} ball</span>
                  </motion.li>
                ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-slate-800/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700/50 shadow-xl">
            <h2 className="text-xl font-medium text-slate-300 mb-6 flex items-center gap-2"><span className="text-blue-500">📅</span> Davomat Tarixi</h2>
            <ul className="space-y-4">
              {data.attendances?.length === 0 ? <p className="text-slate-500 italic">Davomat ma'lumoti yo'q</p> : 
                data.attendances?.slice(0, 3).map((a, i) => (
                  <motion.li key={i} whileHover={{ x: 5 }} className="flex justify-between items-center pb-3 border-b border-slate-700/50 last:border-0 last:pb-0 transition-transform">
                    <span className="text-slate-300 font-medium">{a.date}</span>
                    {a.status === 'present' ? (
                      <span className="text-green-400 flex items-center gap-2 bg-green-500/10 px-3 py-1 rounded-xl border border-green-500/20"><span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span> Keldi</span>
                    ) : (
                      <span className="text-red-400 flex items-center gap-2 bg-red-500/10 px-3 py-1 rounded-xl border border-red-500/20"><span className="w-2 h-2 rounded-full bg-red-400"></span> Kelmadi</span>
                    )}
                  </motion.li>
                ))}
            </ul>
          </motion.div>
        </div>
        
      </motion.div>
    </div>
  );
}
