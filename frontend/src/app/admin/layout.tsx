"use client";

import { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const menuItems = [
  { name: "Asosiy", path: "/admin/dashboard/", icon: "🏠" },
  { name: "Foydalanuvchilar", path: "/admin/users/", icon: "👥" },
  { name: "Guruhlar", path: "/admin/groups/", icon: "📚" },
  { name: "Qabul", path: "/admin/admissions/", icon: "📩" },
  { name: "Moliya", path: "/admin/finance/", icon: "💰" },
  { name: "Sozlamalar", path: "/admin/settings/", icon: "⚙️" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/login/";
  };


  return (
    <div className="flex h-screen bg-[#0f172a] text-white overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-white/5 border-r border-white/10 backdrop-blur-xl flex flex-col relative z-20">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-400 to-orange-400">
            Academy
          </h1>
          <p className="text-xs text-slate-400 mt-1">Admin Paneli</p>
        </div>

        <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = pathname === item.path || pathname === item.path.slice(0, -1);
            return (
              <a key={item.path} href={item.path} className="block">
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${
                  isActive 
                    ? "bg-gradient-to-r from-rose-500/20 to-orange-500/20 border border-rose-500/30 text-white shadow-lg shadow-rose-500/10" 
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                }`}>
                  <span className="text-xl">{item.icon}</span>
                  <span className="font-medium">{item.name}</span>
                </div>
              </a>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 transition-colors">
            <span>🚪</span> Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-y-auto overflow-x-hidden">
        {/* Background Blobs */}
        <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-rose-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob pointer-events-none" />
        <div className="absolute bottom-[20%] left-[-10%] w-96 h-96 bg-orange-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000 pointer-events-none" />
        <div className="absolute top-[40%] left-[40%] w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000 pointer-events-none" />
        
        <div className="relative z-10 min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
