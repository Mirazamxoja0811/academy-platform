"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Banknote, Shield, AlertTriangle } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { name: 'Yan', total: 400 },
  { name: 'Fev', total: 300 },
  { name: 'Mar', total: 500 },
  { name: 'Apr', total: 800 },
  { name: 'May', total: 1200 },
  { name: 'Iyun', total: 1000 },
  { name: 'Iyul', total: 1500 },
];

export default function DashboardPage() {
  const [stats, setStats] = useState({
    total_users: 0,
    total_students: 0,
    total_teachers: 0,
    total_groups: 0,
  });

  useEffect(() => {
    fetch('/api/admin/dashboard/stats/')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(e => console.error(e));
  }, []);

  const cards = [
    { title: "Jami O'quvchilar", value: stats.total_students, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Jami O'qituvchilar", value: stats.total_teachers, icon: BookOpen, color: "from-purple-500 to-pink-500" },
    { title: "Jami Guruhlar", value: stats.total_groups, icon: Shield, color: "from-emerald-500 to-teal-500" },
    { title: "Umumiy Tushum", value: "34,500,000 UZS", icon: Banknote, color: "from-orange-500 to-red-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-4">
              <div>
                <p className="text-slate-400 font-medium">{card.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{card.value || "0"}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${card.color} bg-opacity-20`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-emerald-400">
              <span className="bg-emerald-500/10 px-2 py-1 rounded-full">+12.5%</span>
              <span className="text-slate-500">O'tgan oyga nisbatan</span>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="col-span-2 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
        >
          <h3 className="text-xl font-bold text-white mb-6">Tushumlar grafigi</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#475569" tick={{fill: '#94a3b8'}} />
                <YAxis stroke="#475569" tick={{fill: '#94a3b8'}} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '1rem', color: '#fff' }}
                  itemStyle={{ color: '#60a5fa' }}
                />
                <Area type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
        >
          <h3 className="text-xl font-bold text-white mb-6">Muhim ogohlantirishlar</h3>
          
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium">To'lov kechikmoqda</h4>
                  <p className="text-sm text-slate-400 mt-1">Azizbek Rustamov 2 oydan beri to'lov qilmadi</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
