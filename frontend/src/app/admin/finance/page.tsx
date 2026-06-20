"use client";
import { motion } from "framer-motion";

export default function FinancePage() {
  return (
    <div className="flex items-center justify-center h-[70vh]">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">💸</span>
        </div>
        <h2 className="text-3xl font-bold text-white mb-2">Moliya bo'limi</h2>
        <p className="text-slate-400 max-w-md mx-auto">Tez orada ushbu bo'limda o'quvchilarning to'lovlari, o'qituvchilar oyliklari va umumiy tushumlarni boshqarish imkoniyati qo'shiladi.</p>
      </motion.div>
    </div>
  );
}
