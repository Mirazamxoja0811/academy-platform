"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";
import { Coins, GraduationCap, CalendarDays, Star, Trophy } from "lucide-react";

interface Activity {
  id: number;
  activity_type: string;
  description: string;
  created_at: string;
  coin_amount?: number;
}

interface StudentData {
  full_name: string;
  total_coins: number;
  attendance_rate: number;
  average_grade: number;
  active_courses: number;
  recent_activities: Activity[];
  grades: { subject: string; grade: number; date: string }[];
  attendances: { status: string; date: string; group?: string }[];
  rank?: number;
  total_students?: number;
  group_name?: string;
  schedule?: string;
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
  const [data, setData] = useState<StudentData>({
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
    fetch('/api/me/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(user => setData(prev => ({...prev, full_name: user.full_name})));

    fetch('/api/students/me/dashboard/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(d => setData(prev => ({...prev, ...d})));
  }, []);

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-8 rounded-[2rem] relative overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <span className="bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-sm font-semibold tracking-wide border border-blue-500/20">
            O'QUVCHI
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mt-4">
            Xush kelibsiz, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">{data.full_name}</span> 👋
          </h1>
          <p className="text-slate-400 mt-2 text-lg">Bugungi o'qishlaringizga omad tilaymiz.</p>
          
          {data.group_name && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-wrap">
              <span className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 font-medium text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" /> {data.group_name}
              </span>
              {data.schedule && (
                <span className="px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20 font-medium text-purple-300 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" /> {data.schedule}
                </span>
              )}
              <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Guruh reytingi: {data.rank} / {data.total_students}
              </span>
            </div>
          )}
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-amber-500 to-orange-600 p-6 rounded-[2rem] shadow-xl relative overflow-hidden group">
          <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute -right-8 -top-8 opacity-20 text-9xl pointer-events-none">
            <Coins className="w-32 h-32 text-white" />
          </motion.div>
          <div className="relative z-10">
            <p className="text-orange-100 font-medium mb-1">Jami Coinlar</p>
            <h3 className="text-5xl font-black text-white">{data.total_coins}</h3>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium mb-1">O'rtacha Baho</p>
              <h3 className="text-4xl font-bold text-white">{data.average_grade || 0}</h3>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-500/20">
              <Star className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl group-hover:bg-blue-500/20 transition-opacity" />
          <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-400 font-medium mb-1">Davomat Darajasi</p>
              <h3 className="text-4xl font-bold text-white">{data.attendance_rate || 0}%</h3>
            </div>
            <div className="p-3 rounded-2xl bg-blue-500/20">
              <CalendarDays className="w-6 h-6 text-blue-400" />
            </div>
          </div>
        </motion.div>

      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Grades */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
        >
          <div className="flex items-center gap-2 mb-6">
            <Star className="w-6 h-6 text-yellow-500" />
            <h3 className="text-xl font-bold text-white">Oxirgi Baholar</h3>
          </div>
          
          <div className="space-y-4">
            {data.grades?.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Hali baholar olinmagan</p>
            ) : (
              data.grades?.slice(0, 3).map((g, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <span className="font-medium text-slate-200">{g.subject}</span>
                  <span className="px-4 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl font-bold border border-emerald-500/20">{g.grade} ball</span>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Attendance */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
        >
          <div className="flex items-center gap-2 mb-6">
            <CalendarDays className="w-6 h-6 text-blue-500" />
            <h3 className="text-xl font-bold text-white">Davomat Tarixi</h3>
          </div>
          
          <div className="space-y-4">
            {data.attendances?.length === 0 ? (
              <p className="text-slate-500 text-center py-4">Davomat ma'lumoti yo'q</p>
            ) : (
              data.attendances?.slice(0, 3).map((a, i) => (
                <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:bg-slate-800/50 transition-colors">
                  <span className="text-slate-300 font-medium">{a.date}</span>
                  {a.status === 'present' ? (
                    <span className="text-emerald-400 flex items-center gap-2 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 font-medium">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Keldi
                    </span>
                  ) : (
                    <span className="text-rose-400 flex items-center gap-2 bg-rose-500/10 px-3 py-1.5 rounded-xl border border-rose-500/20 font-medium">
                      <span className="w-2 h-2 rounded-full bg-rose-400"></span> Kelmadi
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
