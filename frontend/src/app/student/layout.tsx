"use client";

import { ReactNode, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, CheckSquare, Calendar, Coins, ClipboardList, Settings, LogOut, MessageSquare, Menu, X } from "lucide-react";
import DashboardClock from "@/components/DashboardClock";

export default function StudentLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<{full_name: string, role: string} | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/me/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.detail) { window.location.href = '/login/'; return; }
        const name = data.full_name || `${data.first_name || ''} ${data.last_name || ''}`.trim() || data.username;
        if (name) setUser({ full_name: name, role: data.role });
      })
      .catch(() => window.location.href = '/login/');
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login/";
  };

  const menuItems = [
    { name: "Dashboard", path: "/student/dashboard", icon: LayoutDashboard },
    { name: "Baholarim", path: "/student/grades", icon: CheckSquare },
    { name: "Davomat", path: "/student/attendance", icon: Calendar },
    { name: "Coinlar", path: "/student/coins", icon: Coins },
    { name: "Testlar", path: "/student/tests", icon: ClipboardList },
    { name: "Xabarlar", path: "/student/messages", icon: MessageSquare },
    { name: "Sozlamalar", path: "/student/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]"></div>
      </div>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900/90 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-50 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 md:p-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              Academy
            </h1>
            <p className="text-slate-400 text-sm mt-1">O'quvchi Paneli</p>
          </div>
          <button className="md:hidden text-slate-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname === item.path + '/';
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path} onClick={() => setIsMobileMenuOpen(false)}>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all cursor-pointer relative overflow-hidden group ${
                    isActive 
                      ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)] border border-white/5" 
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="activeIndicator"
                      className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-blue-400 to-purple-500 rounded-r-full"
                    />
                  )}
                  <Icon className={`w-5 h-5 ${isActive ? "text-blue-400" : "group-hover:text-purple-400 transition-colors"}`} />
                  <span className="font-medium text-[15px]">{item.name}</span>
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 mt-auto border-t border-slate-800/50">
          <div className="mb-4 text-center">
             <DashboardClock />
          </div>
          <button onClick={handleLogout} className="w-full">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center justify-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer border border-red-500/10"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Chiqish</span>
            </motion.div>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-[100dvh] overflow-hidden z-10 relative w-full">
        <header className="h-16 md:h-20 bg-slate-900/50 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-4 md:px-10 sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-300 hover:text-white rounded-lg hover:bg-slate-800/50 transition-colors"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">
              {menuItems.find(i => pathname.includes(i.path))?.name || "O'quvchi Paneli"}
            </h2>
          </div>
          {user && (
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-white line-clamp-1">{user.full_name}</p>
                <p className="text-xs text-slate-400">O'quvchi</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                  <span className="font-bold text-sm text-white">
                    {user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          )}
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="max-w-7xl mx-auto"
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
