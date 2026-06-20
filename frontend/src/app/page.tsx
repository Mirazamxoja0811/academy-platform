"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] text-slate-200 overflow-hidden relative">
      <div className="absolute top-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-600 rounded-full mix-blend-screen filter blur-[100px] opacity-20"
        ></motion.div>
        <motion.div 
          animate={{ scale: [1, 1.5, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[600px] h-[600px] bg-purple-600 rounded-full mix-blend-screen filter blur-[120px] opacity-20"
        ></motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="text-center max-w-3xl px-6 relative z-10"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-block px-4 py-1.5 mb-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <span className="text-sm font-semibold tracking-wider text-blue-300 uppercase">Yangi avlod ta'lim tizimi</span>
        </motion.div>
        
        <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight text-white drop-shadow-2xl">
          Mentor Academy <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
            Education Portal
          </span>
        </h1>
        <p className="text-lg md:text-xl text-slate-300 mb-10 leading-relaxed font-light">
          Bu tizim orqali o'quvchilar o'z natijalarini, ustozlar esa o'z guruhlarini shaffof va qulay tarzda boshqara oladi.
        </p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/login"
            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-400 hover:to-purple-500 text-white rounded-2xl font-bold transition-all transform hover:-translate-y-1 hover:shadow-xl shadow-blue-500/25 relative overflow-hidden group"
          >
            <span className="relative z-10">Tizimga Kirish ➡️</span>
            <div className="absolute inset-0 h-full w-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
          </Link>
          <a
            href="https://t.me/mentoracademy"
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto px-8 py-4 bg-slate-800/50 backdrop-blur-md text-white border border-slate-700/50 hover:bg-slate-700/50 rounded-2xl font-semibold transition-all hover:border-slate-600"
          >
            Biz bilan bog'lanish
          </a>
        </motion.div>
      </motion.div>
    </main>
  );
}
