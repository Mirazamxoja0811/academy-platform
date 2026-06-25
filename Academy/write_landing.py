import os

content = """\"use client\";

import Link from "next/link";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  BookOpen, Users, Star, Clock, Calendar, CheckCircle2, 
  ArrowRight, Code, Database, Palette, Globe, ChevronDown,
  Phone, Mail, MapPin, Send
} from "lucide-react";

// --- DUMMY DATA ---
const stats = [
  { label: "Faol o'quvchilar", value: "300+" },
  { label: "Muvaffaqiyatli bitiruvchilar", value: "100+" },
  { label: "Tajribali ustozlar", value: "15+" },
  { label: "Ish topganlar", value: "95%" },
];

const courses = [
  { id: 1, title: "Frontend Dasturlash", icon: <Globe className="w-6 h-6 text-blue-400"/>, price: "400,000 UZS", duration: "7 oy", color: "from-blue-500/20 to-cyan-500/20", border: "border-blue-500/30" },
  { id: 2, title: "Backend Dasturlash", icon: <Database className="w-6 h-6 text-purple-400"/>, price: "500,000 UZS", duration: "8 oy", color: "from-purple-500/20 to-fuchsia-500/20", border: "border-purple-500/30" },
  { id: 3, title: "UI/UX Dizayn", icon: <Palette className="w-6 h-6 text-pink-400"/>, price: "350,000 UZS", duration: "5 oy", color: "from-pink-500/20 to-rose-500/20", border: "border-pink-500/30" },
  { id: 4, title: "Foundation (Asosiy)", icon: <Code className="w-6 h-6 text-emerald-400"/>, price: "300,000 UZS", duration: "3 oy", color: "from-emerald-500/20 to-teal-500/20", border: "border-emerald-500/30" },
];

const teachers = [
  { name: "Alisher Rustamov", role: "Katta Frontend Dasturchi", exp: "5 yil tajriba", img: "https://ui-avatars.com/api/?name=Alisher+R&background=0D8ABC&color=fff&size=200" },
  { name: "Zuhra Aliyeva", role: "UI/UX Dizayner", exp: "3 yil tajriba", img: "https://ui-avatars.com/api/?name=Zuhra+A&background=8B5CF6&color=fff&size=200" },
  { name: "Bekzod Karimov", role: "Backend Dasturchi", exp: "4 yil tajriba", img: "https://ui-avatars.com/api/?name=Bekzod+K&background=10B981&color=fff&size=200" },
];

const schedule = [
  { course: "Frontend Dasturlash", days: "Dush, Chor, Juma", time: "14:00 - 16:00", status: "Qabul ochiq", statusColor: "text-emerald-400 bg-emerald-400/10" },
  { course: "Backend Dasturlash", days: "Sesh, Pay, Shanba", time: "16:30 - 18:30", status: "Qabul ochiq", statusColor: "text-emerald-400 bg-emerald-400/10" },
  { course: "UI/UX Design", days: "Dush, Chor, Juma", time: "18:30 - 20:30", status: "Joy qolmadi", statusColor: "text-rose-400 bg-rose-400/10" },
];

const testimonials = [
  { name: "Olimjon", course: "Frontend kursi", text: "Kurs juda zo'r! O'qituvchilar juda tushunarli tushuntirishadi. 5 oydan keyin o'z loyihalarimni qila boshladim.", rating: 5 },
  { name: "Sardor", course: "Backend kursi", text: "Python va Django ni chuqur o'rgandim. Muhit juda do'stona va amaliyotga boy.", rating: 5 },
  { name: "Malika", course: "UI/UX kursi", text: "Dizayn sirlarini noldan o'rgandim. Mentorlar doim yordam berishga tayyor.", rating: 5 },
];

const faqs = [
  { q: "Kursni boshlash uchun dastlabki bilim kerakmi?", a: "Yo'q, Foundation kursimiz noldan boshlovchilar uchun mo'ljallangan." },
  { q: "Kompyuterim bo'lishi shartmi?", a: "Akademiyamizda kuchli kompyuterlar bilan jihozlangan xonalar mavjud, ammo uyga vazifa uchun shaxsiy noutbuk bo'lishi tavsiya etiladi." },
  { q: "Sertifikat beriladimi?", a: "Ha, kursni muvaffaqiyatli tamomlagan o'quvchilarga maxsus sertifikat taqdim etiladi va ishga joylashishga yordam beriladi." },
];

// Background images for Hero Slider
const backgroundImages = [
  "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=2072&auto=format&fit=crop", // Coding/Laptop
  "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=2070&auto=format&fit=crop", // Students collaborating
  "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=2070&auto=format&fit=crop", // Mentoring/Teaching
];

// --- COMPONENTS ---

const SectionHeading = ({ title, subtitle }: { title: string, subtitle: string }) => (
  <div className="text-center mb-16 relative z-10">
    <motion.h2 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tight"
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
            <a href="#courses" className="hover:text-white transition-colors">Kurslar</a>
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
          {/* Gradients to darken background image and blend with content */}
          <div className="absolute inset-0 bg-[#0A0F1C]/80" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0A0F1C]/60 to-[#0A0F1C]" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 mix-blend-overlay" />
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
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-sm font-bold mb-8 shadow-[0_0_30px_rgba(59,130,246,0.3)]"
          >
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" /> Zamonaviy IT Kasblar Markazi
          </motion.div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[7rem] font-black mb-8 leading-[1.1] tracking-tighter text-white drop-shadow-2xl">
            Kelajak kasbini <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">
              biz bilan o'rganing
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
            Zamonaviy metodika, amaliy loyihalar va tajribali mentorlar yordamida IT olamiga ilk qadamingizni tashlang. O'zingizga qulay formatda, noldan boshlab professional darajagacha!
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-24">
            <a href="#courses" className="w-full sm:w-auto px-8 py-4 bg-white text-slate-900 hover:bg-slate-200 rounded-2xl font-black transition-all hover:scale-105 active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_40px_rgba(255,255,255,0.3)]">
              Kurslarni ko'rish <ArrowRight className="w-6 h-6" />
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
                className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-3 drop-shadow-sm">{s.value}</div>
                <div className="text-sm md:text-base font-semibold text-slate-300">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* COURSES SECTION */}
      <section id="courses" className="py-32 px-6 relative z-10 bg-[#0A0F1C]">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Bizning Kurslar" subtitle="O'zingizga mos eng zamonaviy IT yo'nalishini tanlang va professional darajaga chiqing." />
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {courses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
                whileHover={{ y: -15, scale: 1.02 }}
                className={`bg-slate-900/80 backdrop-blur-xl border ${course.border} p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${course.color} opacity-0 group-hover:opacity-100 transition-opacity duration-700`} />
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center mb-8 shadow-inner transform group-hover:scale-110 transition-transform duration-500">
                    {course.icon}
                  </div>
                  <h3 className="text-2xl md:text-3xl font-bold text-white mb-5">{course.title}</h3>
                  <div className="space-y-4 mb-10">
                    <div className="flex items-center gap-3 text-slate-300 font-medium bg-white/5 p-3 rounded-xl">
                      <Clock className="w-5 h-5 text-blue-400" /> Davomiylik: {course.duration}
                    </div>
                    <div className="flex items-center gap-3 text-white font-bold text-lg bg-white/5 p-3 rounded-xl border border-white/5">
                      Oylik to'lov: <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">{course.price}</span>
                    </div>
                  </div>
                  <button className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl font-bold text-white transition-all transform group-hover:shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                    Batafsil ma'lumot
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* TEACHERS SECTION */}
      <section id="teachers" className="py-32 px-6 relative z-10 bg-slate-950/50">
        <div className="absolute top-0 left-0 w-full h-[500px] bg-purple-900/10 blur-[150px] -z-10 rounded-full mix-blend-screen" />
        <div className="max-w-7xl mx-auto">
          <SectionHeading title="Kuchli Mentorlar" subtitle="O'z ishining mutlaq ustalari bo'lgan tajribali mutaxassislardan bilim oling." />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {teachers.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: i * 0.15, duration: 0.7 }}
                className="group relative rounded-[3rem] overflow-hidden aspect-[4/5] shadow-2xl"
              >
                <img src={t.img} alt={t.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1C] via-[#0A0F1C]/50 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-70" />
                
                <div className="absolute bottom-0 left-0 w-full p-10 translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-3xl font-black text-white mb-2 drop-shadow-lg">{t.name}</h3>
                  <p className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 font-black text-lg mb-3 uppercase tracking-wide">{t.role}</p>
                  <p className="text-slate-300 font-medium mb-8 flex items-center gap-2"><Star className="w-5 h-5 text-yellow-500 fill-yellow-500"/> {t.exp}</p>
                  <div className="flex gap-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-100 translate-y-4 group-hover:translate-y-0">
                    <a href="#" className="p-4 bg-white/20 hover:bg-white/30 backdrop-blur-xl border border-white/20 rounded-2xl text-white hover:scale-110 transition-transform"><Send className="w-6 h-6"/></a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ADMISSIONS & SCHEDULE SECTION */}
      <section id="schedule" className="py-32 px-6 relative z-10 bg-[#0A0F1C]">
        <div className="max-w-6xl mx-auto">
          <SectionHeading title="Qabul va Jadval" subtitle="Yangi o'quv kurslarimizga yozilish uchun joylar soni cheklangan. Ro'yxatdan o'tishga shoshiling!" />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="bg-slate-900/60 backdrop-blur-2xl border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl shadow-blue-900/20"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-white/5 text-slate-300 text-sm uppercase tracking-widest font-black border-b border-white/10">
                    <th className="p-8">Kurs Nomi</th>
                    <th className="p-8">Kunlar</th>
                    <th className="p-8">Vaqt</th>
                    <th className="p-8 text-right">Holat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {schedule.map((item, i) => (
                    <motion.tr 
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 }}
                      key={i} 
                      className="hover:bg-white/5 transition-colors group"
                    >
                      <td className="p-8 font-black text-white text-xl flex items-center gap-4">
                        <div className="w-3 h-3 rounded-full bg-blue-500 group-hover:scale-150 transition-transform"></div>
                        {item.course}
                      </td>
                      <td className="p-8 text-slate-300 font-medium flex items-center gap-3"><Calendar className="w-5 h-5 text-blue-400"/> {item.days}</td>
                      <td className="p-8 text-slate-300 font-mono text-lg bg-white/5 rounded-xl inline-block m-6 border border-white/5">{item.time}</td>
                      <td className="p-8 text-right">
                        <span className={`px-6 py-2.5 rounded-full text-sm font-black tracking-wide shadow-lg border border-white/10 ${item.statusColor}`}>
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-40 px-6 relative z-10 overflow-hidden flex items-center justify-center min-h-[70vh]">
        <div className="absolute inset-0">
          <img src="https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=2070&auto=format&fit=crop" alt="Code bg" className="w-full h-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-[#0A0F1C]/80 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900/50 to-purple-900/50" />
        </div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center relative z-10 bg-white/10 backdrop-blur-2xl border border-white/20 p-16 md:p-24 rounded-[4rem] max-w-5xl shadow-[0_0_100px_rgba(59,130,246,0.2)]"
        >
          <h2 className="text-5xl md:text-7xl font-black text-white mb-8 leading-tight">Kelajagingizni <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">bugundan</span> boshlang</h2>
          <p className="text-xl md:text-2xl text-slate-200 mb-12 max-w-3xl mx-auto font-light">
            Hozirroq ro'yxatdan o'ting va bepul konsultatsiya oling. <strong className="font-bold text-white">Joylar soni cheklangan!</strong>
          </p>
          <a href="https://t.me/mentoracademy" target="_blank" className="inline-flex items-center justify-center gap-3 px-12 py-6 bg-white text-slate-900 rounded-full font-black text-xl transition-all hover:scale-110 active:scale-95 shadow-[0_0_40px_rgba(255,255,255,0.4)] w-full sm:w-auto">
            Hoziroq ro'yxatdan o'tish <ArrowRight className="w-7 h-7" />
          </a>
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#030509] border-t border-white/10 pt-24 pb-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center font-black text-white text-2xl shadow-lg shadow-purple-500/20">M</div>
              <span className="font-black text-3xl tracking-wide text-white">Mentor Academy</span>
            </div>
            <p className="text-slate-400 mb-10 max-w-md leading-relaxed text-lg font-light">
              Zamonaviy IT ta'lim markazi. Dasturlash, dizayn va boshqa zamonaviy kasblarni biz bilan o'rganib kelajagingizni qurishni boshlang.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-14 h-14 bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center rounded-2xl text-slate-300 hover:text-white transition-all hover:-translate-y-2 hover:shadow-[0_10px_20px_rgba(255,255,255,0.1)]"><Send className="w-6 h-6"/></a>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">Menyular</h4>
            <ul className="space-y-5 text-slate-400 font-medium">
              <li><a href="#courses" className="hover:text-blue-400 transition-colors">Kurslar ro'yxati</a></li>
              <li><a href="#teachers" className="hover:text-blue-400 transition-colors">Bizning Ustozlar</a></li>
              <li><a href="#schedule" className="hover:text-blue-400 transition-colors">Qabul va Jadval</a></li>
              <li><Link href="/login" className="hover:text-blue-400 transition-colors">Tizimga kirish</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-black text-xl mb-8 uppercase tracking-widest">Bog'lanish</h4>
            <ul className="space-y-6 text-slate-400 font-medium">
              <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><Phone className="w-6 h-6 text-blue-400" /> +998 90 123 45 67</li>
              <li className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><Mail className="w-6 h-6 text-blue-400" /> info@mentor.uz</li>
              <li className="flex items-start gap-4 bg-white/5 p-4 rounded-2xl border border-white/5"><MapPin className="w-6 h-6 text-blue-400 shrink-0" /> Toshkent sh, Yunusobod tumani</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/10 text-center text-slate-500 font-medium flex flex-col md:flex-row justify-between items-center gap-6">
          <p>© {new Date().getFullYear()} Mentor Academy. Barcha huquqlar himoyalangan.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">Maxfiylik siyosati</a>
            <a href="#" className="hover:text-slate-300 transition-colors">Ommaviy oferta</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
"""

path = '../frontend/src/app/page.tsx'
with open(path, 'w', encoding='utf-8') as f:
    f.write(content)
print("page.tsx recreated")
