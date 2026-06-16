"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface TeacherData {
  full_name: string;
  avatar?: string;
  total_groups: number;
  total_students: number;
  total_given_coins: number;
  today_classes: number;
  pending_homeworks: number;
  groups: Array<{
    id: number;
    name: string;
    student_count: number;
  }>;
  recent_activities: Array<{
    id: number;
    activity_type: string;
    description: string;
    created_at: string;
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

export default function TeacherDashboard() {
  const [data, setData] = useState<TeacherData>({
    full_name: "O'qituvchi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Teacher",
    total_groups: 0,
    total_students: 0,
    total_given_coins: 0,
    today_classes: 0,
    pending_homeworks: 0,
    groups: [],
    recent_activities: []
  });
  const router = useRouter();

  return (
    <div className="p-8 relative">

      <motion.div
        className="max-w-6xl mx-auto relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400">
              O'qituvchi Paneli
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Xush kelibsiz, {data?.full_name}</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="px-6 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full backdrop-blur-md transition-all text-sm font-medium"
          >
            Chiqish
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-slate-400 text-sm font-medium mb-1">Guruhlarim</h3>
            <p className="text-4xl font-bold text-white">{data?.total_groups}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-slate-400 text-sm font-medium mb-1">Jami o'quvchilarim</h3>
            <p className="text-4xl font-bold text-white">{data?.total_students}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-slate-400 text-sm font-medium mb-1">Tarqatilgan Coinlar</h3>
            <p className="text-4xl font-bold text-yellow-400">{data?.total_given_coins} 🪙</p>
          </motion.div>
        </div>

        {/* Two Columns Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Groups List */}
          <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Guruhlarim</h2>
              <button className="text-indigo-400 hover:text-indigo-300 text-sm font-medium transition-colors">Barchasi</button>
            </div>
            <div className="space-y-4">
              {data?.groups.map((group, index) => (
                <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold shadow-lg">
                      {group.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-200">{group.name}</h4>
                      <p className="text-sm text-slate-400">{group.student_count} o'quvchi</p>
                    </div>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/40" title="Davomat">📅</button>
                     <button className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 flex items-center justify-center hover:bg-yellow-500/40" title="Coin berish">🪙</button>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Quick Actions & Recent Activity */}
          <motion.div variants={itemVariants} className="space-y-8">
            
            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-indigo-600/30 to-purple-600/30 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-xl">
               <h2 className="text-xl font-bold text-white mb-6">Tezkor amallar</h2>
               <div className="grid grid-cols-2 gap-4">
                  <button className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-center font-medium shadow-lg hover:shadow-indigo-500/20">
                     ✨ Davomat olish
                  </button>
                  <button className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-center font-medium shadow-lg hover:shadow-purple-500/20">
                     📝 Baholash
                  </button>
                  <button className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-center font-medium shadow-lg hover:shadow-blue-500/20">
                     🪙 Coin tarqatish
                  </button>
                  <button className="py-4 px-6 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 transition-all text-center font-medium shadow-lg hover:shadow-pink-500/20">
                     📊 Analitika
                  </button>
               </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 shadow-xl">
              <h2 className="text-xl font-bold text-white mb-6">So'nggi harakatlar</h2>
              <div className="space-y-4">
                {data?.recent_activities.map((act, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]" />
                    <div>
                      <h4 className="font-medium text-slate-200">{act.activity_type}</h4>
                      <p className="text-sm text-slate-400 mt-1">{act.description}</p>
                      <p className="text-xs text-slate-500 mt-1">{act.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
