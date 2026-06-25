"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import DashboardClock from "@/components/DashboardClock";

interface QuestionForm {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  marks: number;
}

interface Group {
  id: number;
  name: string;
}

interface TestItem {
  id: number;
  title: string;
  group_name: string;
  question_count: number;
  total_marks: number;
  duration: number;
  is_active: boolean;
}

const emptyQuestion = (): QuestionForm => ({
  question_text: "",
  option_a: "",
  option_b: "",
  option_c: "",
  option_d: "",
  correct_answer: "a",
  marks: 1,
});

export default function TeacherTests() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [tests, setTests] = useState<TestItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [questionCount, setQuestionCount] = useState(5);
  const [questions, setQuestions] = useState<QuestionForm[]>(Array.from({ length: 5 }, emptyQuestion));
  const [form, setForm] = useState({ title: "", description: "", group_id: "", duration: "30" });
  const [toast, setToast] = useState("");

  const load = () => {
    fetch("/api/groups/", { credentials: "include",  credentials: "include" }).then(r => r.json()).then(setGroups);
    fetch("/api/teacher/tests/", { credentials: "include",  credentials: "include" }).then(r => r.json()).then(setTests);
  };

  useEffect(() => { load(); }, []);

  const applyQuestionCount = (count: number) => {
    const n = Math.max(1, Math.min(50, count));
    setQuestionCount(n);
    setQuestions(prev => {
      const next = [...prev];
      while (next.length < n) next.push(emptyQuestion());
      return next.slice(0, n);
    });
  };

  const updateQuestion = (idx: number, field: keyof QuestionForm, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => i === idx ? { ...q, [field]: value } : q));
  };

  const viewResults = async (testId: number) => {
    try {
      const res = await fetch(`/api/teacher/tests/${testId}/`, { credentials: "include" });
      const data = await res.json();
      setResultsTest(data);
      setShowResults(true);
    } catch (e) {
      console.error(e);
    }
  };

  const deleteTest = async (testId: number) => {
    if (!confirm("Haqiqatan ham bu testni o'chirib tashlamoqchimisiz?")) return;
    try {
      const res = await fetch(`/api/teacher/tests/${testId}/delete/`, { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        setToast("Test muvaffaqiyatli o'chirildi");
        load();
        setTimeout(() => setToast(''), 3000);
      }
    } catch(e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.group_id || !form.title) return;

    const res = await fetch("/api/teacher/tests/", { credentials: "include", 
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        description: form.description,
        group_id: Number(form.group_id),
        duration: Number(form.duration),
        questions,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      setToast(`Test yaratildi: ${data.question_count} ta savol, ${data.total_marks} ball`);
      setShowForm(false);
      setForm({ title: "", description: "", group_id: "", duration: "30" });
      applyQuestionCount(5);
      load();
      setTimeout(() => setToast(""), 3000);
    }
  };

  return (
    <div className="p-8 relative">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto space-y-8">
        <div className="flex justify-between items-start gap-4 flex-wrap">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Testlar</h1>
            <p className="text-slate-400 mt-2 text-sm">Guruh uchun test tuzish va boshqarish</p>
          </div>
          <div className="flex items-center gap-4">
            <DashboardClock />
            <button onClick={() => setShowForm(true)} className="bg-indigo-500 hover:bg-indigo-600 text-white font-bold py-2 px-6 rounded-xl">
              + Test tuzish
            </button>
          </div>
        </div>

        <div className="space-y-4">
          {tests.map(t => (
            <div key={t.id} className="bg-white/5 border border-white/10 rounded-2xl p-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-bold text-white">{t.title}</h3>
                <p className="text-slate-400 text-sm mt-1">{t.group_name} · {t.question_count} savol · {t.total_marks} ball · {t.duration} daq</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold ${t.is_active ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>
                {t.is_active ? "Faol" : "Nofaol"}
              </span>
            </div>
          ))}
          {tests.length === 0 && <p className="text-slate-500 text-center py-8">Hali test yaratilmagan</p>}
        </div>
      </motion.div>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="bg-slate-900 border border-slate-700 rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">Yangi Test</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input required placeholder="Test nomi" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" />
                <select required value={form.group_id} onChange={e => setForm({ ...form, group_id: e.target.value })} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white">
                  <option value="">Guruhni tanlang</option>
                  {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <textarea placeholder="Tavsif (ixtiyoriy)" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white" rows={2} />
              <div className="flex gap-4 items-center flex-wrap">
                <label className="text-slate-300 text-sm">Savollar soni:</label>
                <input type="number" min={1} max={50} value={questionCount} onChange={e => applyQuestionCount(Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                <label className="text-slate-300 text-sm ml-4">Vaqt (daq):</label>
                <input type="number" min={5} value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
              </div>

              <div className="space-y-6 max-h-[50vh] overflow-y-auto pr-2">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-3">
                    <p className="text-indigo-400 font-bold">Savol {idx + 1}</p>
                    <input required placeholder="Savol matni" value={q.question_text} onChange={e => updateQuestion(idx, "question_text", e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" />
                    {(["a", "b", "c", "d"] as const).map(key => (
                      <input key={key} required placeholder={`Variant ${key.toUpperCase()}`} value={q[`option_${key}`]} onChange={e => updateQuestion(idx, `option_${key}`, e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm" />
                    ))}
                    <div className="flex gap-4">
                      <select value={q.correct_answer} onChange={e => updateQuestion(idx, "correct_answer", e.target.value)} className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white">
                        <option value="a">To'g'ri: A</option>
                        <option value="b">To'g'ri: B</option>
                        <option value="c">To'g'ri: C</option>
                        <option value="d">To'g'ri: D</option>
                      </select>
                      <input type="number" min={1} value={q.marks} onChange={e => updateQuestion(idx, "marks", Number(e.target.value))} className="w-24 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2 text-white" title="Ball" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-4">
                <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300">Bekor</button>
                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-500 text-white font-bold">Saqlash</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-10 right-10 bg-indigo-500 text-white px-6 py-4 rounded-2xl shadow-2xl font-bold z-50">{toast}</div>
      )}
    </div>
  );
}
