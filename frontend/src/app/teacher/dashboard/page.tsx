"use client";

import { motion, Variants } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, Coins, AlertTriangle, UserCheck, Edit3, MessageSquare, ClipboardList } from "lucide-react";

interface TeacherData {
  full_name: string;
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
  passive_students?: {id: number, name: string, avg: number}[];
  active_students?: {id: number, name: string, avg: number, coins: number}[];
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
    full_name: "Yuklanmoqda...",
    total_groups: 0,
    total_students: 0,
    total_given_coins: 0,
    today_classes: 0,
    pending_homeworks: 0,
    groups: [],
    recent_activities: [],
    passive_students: [],
    active_students: []
  });
  const [recentMsgs, setRecentMsgs] = useState<{id:number, student_name:string, content:string, created_at:string}[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/me/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(user => setData(prev => ({...prev, full_name: user.full_name})));

    fetch('/api/teacher/dashboard/stats/', { credentials: "include" })
      .then(res => res.json())
      .then(d => setData(prev => ({...prev, ...d})));

    fetch('/api/teacher/messages/', { credentials: "include" })
      .then(res => res.json())
      .then(d => setRecentMsgs((d.messages || []).slice(0, 5)));
  }, []);

  const stats = [
    { title: "Guruhlarim", value: data.total_groups, icon: Users, color: "from-blue-500 to-cyan-500" },
    { title: "Jami o'quvchilarim", value: data.total_students, icon: UserCheck, color: "from-purple-500 to-pink-500" },
    { title: "Tarqatilgan Coinlar", value: data.total_given_coins, icon: Coins, color: "from-emerald-500 to-teal-500" },
  ];

  return (
    <div className="space-y-6">
      
      {/* Stats Grid */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem] relative overflow-hidden group"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-10 rounded-full blur-2xl group-hover:opacity-20 transition-opacity`} />
            
            <div className="flex justify-between items-start mb-4 relative z-10">
              <div>
                <p className="text-slate-400 font-medium">{stat.title}</p>
                <h3 className="text-3xl font-bold text-white mt-2">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-2xl bg-gradient-to-br ${stat.color} bg-opacity-20`}>
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
                {/* Right Column */}
        <div className="space-y-6">
          
          {/* Recent Messages */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35 }}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-purple-400" /> Oxirgi Xabarlar
              </h3>
              <button onClick={() => router.push('/teacher/messages')} className="text-purple-400 hover:text-purple-300 text-sm font-medium transition-colors">
                Barchasini ko'rish
              </button>
            </div>
            <div className="space-y-3">
              {recentMsgs.length === 0 ? (
                <p className="text-slate-500 text-center py-4">Hali xabar kelmagan</p>
              ) : (
                recentMsgs.map((msg) => (
                  <div key={msg.id} className="p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors">
                    <div className="flex justify-between items-start">
                      <span className="text-white font-semibold text-sm">{msg.student_name}</span>
                      <span className="text-xs text-slate-500">{msg.created_at}</span>
                    </div>
                    <p className="text-slate-400 text-sm mt-1 line-clamp-2">{msg.content}</p>
                  </div>
                ))
              )}
            </div>
          </motion.div>

          {/* Active Students */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
          >
            <h3 className="text-xl font-bold text-white mb-6">Eng faol 3 ta o'quvchi</h3>
            <div className="space-y-4">
              {data.active_students?.map((student, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500 h-fit flex items-center justify-center font-bold w-10 h-10">
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{student.name}</h4>
                    <div className="flex items-center gap-4 mt-1">
                      <p className="text-sm text-slate-400">O'rtacha baho: <span className="text-emerald-400 font-bold">{student.avg}</span></p>
                      <p className="text-sm text-slate-400 flex items-center gap-1">
                        <Coins className="w-3 h-3 text-yellow-400" /> <span className="text-yellow-400 font-bold">{student.coins}</span>
                      </p>
                    </div>
                  </div>
                </div>
              ))}
              {(!data.active_students || data.active_students.length === 0) && (
                <p className="text-slate-500 text-center py-4">Faol o'quvchilar yo'q</p>
              )}
            </div>
          </motion.div>


          
        </div>
{/* Groups List */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-900/40 backdrop-blur-md border border-slate-800/60 p-6 rounded-[2rem]"
        >
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-white">Guruhlarim</h3>
            <button onClick={() => router.push('/teacher/groups')} className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
              Barchasini ko'rish
            </button>
          </div>
          
          <div className="space-y-4">
            {data.groups.map((group, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-2xl bg-slate-950/50 border border-slate-800 hover:bg-slate-800/50 transition-colors group cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg">
                    {group.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-200">{group.name}</h4>
                    <p className="text-sm text-slate-400">{group.student_count} o'quvchi</p>
                  </div>
                </div>
                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => router.push('/teacher/attendance')} className="w-9 h-9 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/40 transition-colors" title="Davomat">
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button onClick={() => router.push('/teacher/coins')} className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center hover:bg-emerald-500/40 transition-colors" title="Coin berish">
                    <Coins className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {data.groups.length === 0 && (
              <p className="text-slate-500 text-center py-4">Sizda hali guruhlar yo'q</p>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}
