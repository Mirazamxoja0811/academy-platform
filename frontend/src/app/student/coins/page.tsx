"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

interface Transaction {
  amount: number;
  reason: string;
  date: string;
  given_by__first_name: string;
}

export default function StudentCoins() {
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    fetch('/api/students/me/coins/')
      .then(res => res.json())
      .then(data => {
        setBalance(data.balance || 0);
        setTransactions(data.transactions || []);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        
        <motion.div variants={itemVariants} className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Mening Coinlarim</h1>
            <p className="text-slate-400 mt-2 text-sm">Hamyon va xarajatlar tarixi</p>
          </div>
        </motion.div>

        {/* Balance Card */}
        <motion.div variants={itemVariants} className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl border border-yellow-500/30 rounded-[2rem] p-10 shadow-2xl overflow-hidden relative group">
           <div className="absolute top-0 right-0 p-8 text-8xl opacity-20 group-hover:scale-110 transition-transform duration-500">🪙</div>
           <h3 className="text-yellow-400 text-sm font-bold uppercase tracking-wider mb-2">Umumiy Balans</h3>
           <p className="text-6xl font-black text-white drop-shadow-lg">{balance} <span className="text-3xl text-yellow-500">Coin</span></p>
        </motion.div>

        {/* Transactions list */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-6">Tarix</h3>
          <div className="space-y-4">
            {transactions.map((tx, i) => (
              <div key={i} className="flex justify-between items-center p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                <div>
                  <h4 className="text-slate-200 font-medium">{tx.reason}</h4>
                  <p className="text-slate-400 text-xs mt-1">{tx.date}</p>
                </div>
                <div className={`text-xl font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
