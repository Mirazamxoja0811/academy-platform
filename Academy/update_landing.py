import os

content = """\"use client\";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  BookOpen, Users, Star, Clock, Calendar, CheckCircle2, 
  ArrowRight, Code, Database, Palette, Globe, ChevronDown,
  Phone, Mail, MapPin, Send, Languages, Calculator, FlaskConical, Atom
} from "lucide-react";

// --- DUMMY DATA ---
const stats = [
  { label: "Faol o'quvchilar", value: "300+" },
  { label: "Muvaffaqiyatli bitiruvchilar", value: "100+" },
  { label: "Tajribali ustozlar", value: "15+" },
  { label: "Oliygohga kirganlar", value: "95%" },
];

const courses = [
  { id: 1, title: "Ingliz & Arab tili", icon: <Languages className="w-6 h-6 text-blue-400"/>, price: "300,000 UZS", duration: "6 oy", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
  { id: 2, title: "Aniq fanlar (Matematika)", icon: <Calculator className="w-6 h-6 text-purple-400"/>, price: "250,000 UZS", duration: "10 oy", color: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/30" },
  { id: 3, title: "IT Dasturlash", icon: <Code className="w-6 h-6 text-emerald-400"/>, price: "400,000 UZS", duration: "8 oy", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
  { id: 4, title: "Tabiiy fanlar (Kimyo, Bio)", icon: <FlaskConical className="w-6 h-6 text-pink-400"/>, price: "250,000 UZS", duration: "10 oy", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
];

const teachers = [
  { name: "Alisher Rustamov", role: "Matematika o'qituvchisi", exp: "5 yil tajriba", img: "https://ui-avatars.com/api/?name=Alisher+R&background=0D8ABC&color=fff&size=200" },
  { name: "Zuhra Aliyeva", role: "Ingliz tili o'qituvchisi", exp: "3 yil tajriba", img: "https://ui-avatars.com/api/?name=Zuhra+A&background=8B5CF6&color=fff&size=200" },
  { name: "Bekzod Karimov", role: "IT Dasturlash Mentori", exp: "4 yil tajriba", img: "https://ui-avatars.com/api/?name=Bekzod+K&background=10B981&color=fff&size=200" },
];

const schedule = [
  { course: "Ingliz tili (IELTS)", days: "Dush, Chor, Juma", time: "14:00 - 16:00", status: "Qabul ochiq", statusColor: "text-emerald-400 bg-emerald-400/10" },
  { course: "Matematika", days: "Sesh, Pay, Shanba", time: "16:30 - 18:30", status: "Qabul ochiq", statusColor: "text-emerald-400 bg-emerald-400/10" },
  { course: "IT Dasturlash", days: "Dush, Chor, Juma", time: "18:30 - 20:30", status: "Joy qolmadi", statusColor: "text-rose-400 bg-rose-400/10" },
  { course: "Arab tili", days: "Sesh, Pay, Shanba", time: "14:00 - 16:00", status: "Qabul ochiq", statusColor: "text-emerald-400 bg-emerald-400/10" },
];

const testimonials = [
  { name: "Olimjon", course: "Ingliz tili", text: "Kurs juda zo'r! O'qituvchilar juda tushunarli tushuntirishadi. 6 oydan keyin IELTS dan 7.0 oldim.", rating: 5 },
  { name: "Sardor", course: "Matematika", text: "Matematikani noldan o'rgandim va oliygohga muvaffaqiyatli qabul qilindim.", rating: 5 },
  { name: "Malika", course: "IT Dasturlash", text: "Dasturlash sirlarini noldan o'rgandim. Mentorlar doim yordam berishga tayyor.", rating: 5 },
];

const faqs = [
  { q: "Kursni boshlash uchun dastlabki bilim kerakmi?", a: "Yo'q, ko'pgina kurslarimiz noldan boshlovchilar uchun mo'ljallangan." },
  { q: "Akademiyada qanday tillar o'rgatiladi?", a: "Bizda Ingliz, Arab, Turk, Koreys va Xitoy tillari malakali ustozlar tomonidan o'rgatiladi." },
  { q: "Sertifikat beriladimi?", a: "Ha, kursni muvaffaqiyatli tamomlagan o'quvchilarga maxsus sertifikat taqdim etiladi." },
];

// Background images for Hero Slider (General education vibe)
const backgroundImages = [
  "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?q=80&w=2071&auto=format&fit=crop", // General students studying
  "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=2073&auto=format&fit=crop", // Books/Library
  "https://images.unsplash.com/photo-1577896851231-70ef18881754?q=80&w=2070&auto=format&fit=crop", // Education environment
];

// --- COMPONENTS ---

const SectionHeading = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-16 relative z-10">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight"
    >
      {title}
    </motion.h2>
    <motion.p 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
      className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto font-light"
    >
      {subtitle}
    </motion.p>
  </div>
);

export default function Home() {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  
  // Image Slider state
  const [currentImage, setCurrentImage] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % backgroundImages.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <main className="min-h-screen bg-[#0A0F1C] text-slate-200 overflow-hidden font-sans selection:bg-purple-500/30">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0F1C]/40 backdrop-blur-2xl border-b border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center font-black text-white text-xl shadow-lg shadow-purple-500/20">M</div>
            <span className="font-bold text-xl tracking-wide text-white">Mentor Academy</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-300">
            <a href="#courses" className="hover:text-white transition-colors">Yo'nalishlar</a>
            <a href="#teachers" className="hover:text-white transition-colors">Ustozlar</a>
            <a href="#schedule" className="hover:text-white transition-colors">Qabul</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </div>
          <Link href="/login" className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 rounded-full text-white font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-purple-500/25">
            Tizimga kirish
          </Link>
        </div>
      </nav>

      {/* HERO SECTION WITH ANIMATED BACKGROUND SLIDER */}
      <section className="relative min-h-screen flex flex-col justify-center items-center px-6 pt-20">
        {/* Slider Background */}
        <div className="absolute inset-0 z-0">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentImage}
              src={backgroundImages[currentImage]}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full object-cover"
              alt="Academy Background"
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-[#0A0F1C]/85" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1C]/60 to-[#0A0F1C]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/20 to-purple-900/20 mix-blend-overlay" />
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2, type: "spring" }}
          className="text-center max-w-5xl mx-auto z-10 mt-10"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Keng qamrovli ta'lim markazi
          </motion.div>
          
          <h1 className="text-5xl md:text-7xl lg:text-[6rem] font-extrabold mb-8 leading-[1.1] tracking-tight text-white drop-shadow-2xl">
            Kelajak bilimlari <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              biz bilan boshlanadi
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
            Chet tillari, IT dasturlash va aniq fanlarni tajribali ustozlar yordamida o'rganing. Eng yaxshi natijalarga biz bilan erishing!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <a href="#courses" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl font-bold transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              Yo'nalishlarni ko'rish <ArrowRight className="w-6 h-6" />
            </a>
            <a href="https://t.me/mentoracademy" target="_blank" className="w-full sm:w-auto px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 text-white hover:bg-white/20 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-xl">
              <Send className="w-5 h-5" /> Telegram orqali bog'lanish
            </a>
          </div>

          {/* STATS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((s, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + (i * 0.1), type: "spring" }}
                key={i} 
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-2xl relative overflow-hidden group"
              >
                <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-2">{s.value}</div>
                <div className="text-sm font-medium text-slate-300">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* COURSES SECTION */}
      <section id="courses" className="py-24 px-6 relative z-10 bg-[#0A0F1C]">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="O'quv Yo'nalishlari" subtitle="Tillar, Aniq fanlar yoki IT - o'zingizga qulay va kerakli yo'nalishni tanlang." />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -5 }}
                className={`bg-slate-900/60 backdrop-blur-lg border ${course.border} p-8 rounded-3xl relative overflow-hidden group transition-all`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-6">
                    {course.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">{course.title}</h3>
                  <div className="space-y-3 mb-8 text-sm">
                    <div className="flex items-center gap-3 text-slate-300">
                      <Clock className="w-4 h-4 text-blue-400" /> Davomiylik: {course.duration}
                    </div>
                    <div className="flex items-center gap-3 text-white font-semibold">
                      Oylik to'lov: <span className="text-emerald-400">{course.price}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS SECTION */}
      <section id="teachers" className="py-24 px-6 relative z-10 bg-slate-950/50 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Tajribali Ustozlar" subtitle="Sizni maqsadga yetaklovchi, ko'p yillik tajribaga ega bo'lgan kuchli mutaxassislar." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teachers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                className="bg-slate-900/40 border border-white/5 rounded-3xl p-6 flex flex-col items-center text-center hover:bg-slate-800/50 transition-colors"
              >
                <img src={t.img} alt={t.name} className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-white/5" />
                <h3 className="text-xl font-bold text-white mb-1">{t.name}</h3>
                <p className="text-blue-400 font-medium mb-2">{t.role}</p>
                <p className="text-slate-400 text-sm">{t.exp}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADMISSIONS & SCHEDULE SECTION */}
      <section id="schedule" className="py-24 px-6 relative z-10 bg-[#0A0F1C] border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <SectionHeading title="Qabul va Jadval" subtitle="Yangi guruhlarimiz uchun qabul boshlangan." />
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-slate-900/40 border border-white/10 rounded-2xl overflow-hidden"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 text-slate-300 text-sm font-semibold border-b border-white/10">
                    <th className="p-4 md:p-6">Kurs / Fan</th>
                    <th className="p-4 md:p-6">Kunlar</th>
                    <th className="p-4 md:p-6">Vaqt</th>
                    <th className="p-4 md:p-6 text-right">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm md:text-base">
                  {schedule.map((item, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 md:p-6 font-medium text-white">{item.course}</td>
                      <td className="p-4 md:p-6 text-slate-400">{item.days}</td>
                      <td className="p-4 md:p-6 text-slate-400 font-mono">{item.time}</td>
                      <td className="p-4 md:p-6 text-right">
                        <span className={`px-3 py-1 md:px-4 md:py-1.5 rounded-full text-xs font-semibold ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-32 px-6 relative z-10 overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="text-center relative z-10 bg-[#0A0F1C]/80 backdrop-blur-md border border-white/10 p-12 rounded-3xl max-w-4xl"
        >
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ta'limni biz bilan boshlang</h2>
          <p className="text-lg text-slate-300 mb-10 max-w-2xl mx-auto">
            Hozirroq ro'yxatdan o'ting va bepul konsultatsiya oling.
          </p>
          <a href="https://t.me/mentoracademy" target="_blank" className="inline-flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-xl font-bold hover:bg-slate-200 transition-colors">
            Bog'lanish <ArrowRight className="w-5 h-5" />
          </a>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030509] border-t border-white/10 pt-16 pb-8 px-6 relative z-10">
        <div className="max-w-7xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-white mb-4">Mentor Academy</h3>
            <p className="text-slate-400 mb-8 max-w-md mx-auto">Zamonaviy va ko'p tarmoqli ta'lim markazi.</p>
            <div className="flex justify-center gap-6 text-slate-400 mb-8">
                <a href="#" className="hover:text-white transition-colors">Kurslar</a>
                <a href="#" className="hover:text-white transition-colors">Ustozlar</a>
                <a href="/login" className="hover:text-white transition-colors">Tizimga kirish</a>
            </div>
            <p className="text-slate-500 text-sm">© {new Date().getFullYear()} Mentor Academy. Barcha huquqlar himoyalangan.</p>
        </div>
      </footer>
    </main>
  );
}
"""

path = '../frontend/src/app/page.tsx'
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx updated")
