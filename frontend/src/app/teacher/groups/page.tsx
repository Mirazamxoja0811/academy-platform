"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DashboardClock from "@/components/DashboardClock";

interface GroupStudent {
  id: number;
  full_name: string;
  student_id: string;
  total_coins: number;
  average_grade: number;
}

interface TeacherGroup {
  id: number;
  name: string;
  description: string;
  start_date: string;
  student_count: number;
  students: GroupStudent[];
}

export default function TeacherGroups() {
  const [groups, setGroups] = useState<TeacherGroup[]>([]);
  const [expanded, setExpanded] = useState<number | null>(null);

  useEffect(() => {
    fetch("/api/teacher/groups/", { credentials: "include",  credentials: "include" })
      .then(r => r.json())
      .then(data => setGroups(data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Guruhlarim</h1>
            <p className="text-slate-400 mt-2 text-sm">Sizga biriktirilgan barcha guruhlar</p>
          </div>
          <DashboardClock />
        </div>

        {groups.length === 0 ? (
          <div className="bg-white/5 border border-white/10 rounded-[2rem] p-12 text-center text-slate-400">
            Hozircha sizga biriktirilgan guruh yo'q
          </div>
        ) : (
          <div className="space-y-4">
            {groups.map(g => (
              <div key={g.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
                <button
                  onClick={() => setExpanded(expanded === g.id ? null : g.id)}
                  className="w-full p-8 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex justify-between items-start gap-4 flex-wrap">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{g.name}</h3>
                      {g.description && <p className="text-slate-400 text-sm mb-3">{g.description}</p>}
                      <div className="flex flex-wrap gap-4 text-slate-300 text-sm">
                        <span>👥 {g.student_count} o'quvchi</span>
                        <span>📅 Ochilgan: {g.start_date ? new Date(g.start_date).toLocaleDateString("uz-UZ") : "—"}</span>
                      </div>
                    </div>
                    <span className="text-indigo-400 text-2xl">{expanded === g.id ? "▲" : "▼"}</span>
                  </div>
                </button>

                {expanded === g.id && (
                  <div className="border-t border-white/10 px-8 pb-8">
                    {g.students.length === 0 ? (
                      <p className="text-slate-500 py-4">Guruhda o'quvchi yo'q</p>
                    ) : (
                      <div className="space-y-3 mt-4">
                        {g.students.map((s, i) => (
                          <div key={s.id} className="flex justify-between items-center p-4 rounded-xl bg-white/5 border border-white/5">
                            <div className="flex items-center gap-4">
                              <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-sm">{i + 1}</span>
                              <div>
                                <p className="text-white font-medium">{s.full_name}</p>
                                <p className="text-slate-500 text-xs">{s.student_id}</p>
                              </div>
                            </div>
                            <div className="text-right text-sm">
                              <p className="text-yellow-400 font-bold">{s.total_coins} 🪙</p>
                              <p className="text-slate-400">O'rtacha: {s.average_grade || "—"}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
