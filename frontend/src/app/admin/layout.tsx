"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { LayoutDashboard, Users, BookOpen, Layers, Settings, LogOut, Banknote } from "lucide-react";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/admin/dashboard" },
    { name: "Foydalanuvchilar", icon: Users, path: "/admin/users" },
    { name: "Guruhlar", icon: Layers, path: "/admin/groups" },
    { name: "Moliya", icon: Banknote, path: "/admin/finance" },
    { name: "Kurslar", icon: BookOpen, path: "/admin/courses" },
    { name: "Sozlamalar", icon: Settings, path: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex font-sans overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-900/20 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[60%] rounded-full bg-purple-900/20 blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <aside className="w-72 bg-slate-900/50 backdrop-blur-xl border-r border-slate-800/50 flex flex-col z-10 relative">
        <div className="p-8">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Mirazam
          </h1>
          <p className="text-slate-400 text-sm mt-1">Admin Boshqaruvi</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
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

        <div className="p-4 mt-auto">
          <Link href="/login">
            <motion.div 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Chiqish</span>
            </motion.div>
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden z-10 relative">
        <header className="h-20 bg-slate-900/30 backdrop-blur-md border-b border-slate-800/50 flex items-center justify-between px-10 sticky top-0 z-20">
          <h2 className="text-xl font-semibold text-white">
            {menuItems.find(i => i.path === pathname)?.name || "Boshqaruv"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">Mirazamxoja</p>
              <p className="text-xs text-slate-400">Asosiy Admin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center">
                <span className="font-bold text-sm text-white">MX</span>
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            {children}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
