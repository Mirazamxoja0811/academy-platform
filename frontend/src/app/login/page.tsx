"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        setError(`Server xatosi: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      if (res.ok) {
        if (data.role === "student") {
          localStorage.setItem("student_id", data.student_id);
          router.push("/student/dashboard");
        } else if (data.role === "teacher") {
          router.push("/teacher/dashboard");
        } else if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          setError("Ruxsat aniqlanmadi.");
        }
      } else {
        setError(data.detail || "Login yoki parol noto'g'ri");
      }
    } catch (err) {
      setError("Tarmoq xatosi. Sizda yoki serverda muammo mavjud (CORS yoki Server o'chgan).");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[20%] w-72 h-72 bg-blue-500 rounded-full mix-blend-screen filter blur-[100px] opacity-20"></div>
        <div className="absolute bottom-[10%] right-[20%] w-80 h-80 bg-purple-500 rounded-full mix-blend-screen filter blur-[120px] opacity-20"></div>
      </div>

      <div className="w-full max-w-md mb-4 flex justify-start">
        <Link href="/" className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/40 hover:bg-slate-800/80 backdrop-blur-md border border-slate-700/50 rounded-xl text-slate-300 hover:text-white transition-all text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Bosh sahifaga qaytish
        </Link>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
        className="w-full max-w-md bg-slate-800/40 backdrop-blur-2xl border border-slate-700/50 rounded-[2rem] p-8 shadow-2xl relative"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-[2rem] pointer-events-none"></div>
        
        <div className="text-center mb-8 relative z-10">
          <motion.div 
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-purple-500/30"
          >
            <span className="text-2xl font-bold text-white">M</span>
          </motion.div>
          <h1 className="text-3xl font-bold text-white mb-2">Xush Kelibsiz</h1>
          <p className="text-slate-400">Tizimga kirish uchun ma'lumotlarni kiriting</p>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl mb-6 text-sm relative z-10 backdrop-blur-sm">
            {error}
          </motion.div>
        )}

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
              placeholder="O'quvchi yoki O'qituvchi logini"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Parol</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700/50 text-white rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all backdrop-blur-sm"
              placeholder="••••••••"
              required
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-4 rounded-2xl transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-4 shadow-lg shadow-blue-500/25"
          >
            {loading ? "Kirilmoqda..." : "Tizimga Kirish"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
