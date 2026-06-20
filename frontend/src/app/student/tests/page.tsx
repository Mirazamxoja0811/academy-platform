"use client";

import { useEffect, useState } from "react";
import { motion, Variants } from "framer-motion";

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
};

interface Test {
  id: number;
  title: string;
  description: string;
  duration: number;
  total_marks: number;
  deadline: string | null;
  teacher__first_name: string;
  teacher__last_name: string;
  is_submitted: boolean;
  score: number | null;
}

interface Question {
  id: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  marks: number;
}

export default function StudentTests() {
  const [tests, setTests] = useState<Test[]>([]);
  const [activeTest, setActiveTest] = useState<{ id: number; title: string; questions: Question[] } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ score: number; total: number } | null>(null);

  const loadTests = () => {
    fetch('/api/students/me/tests/', { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(data => setTests(data))
      .catch(console.error);
  };

  useEffect(() => { loadTests(); }, []);

  const startTest = (testId: number) => {
    fetch(`/api/students/me/tests/${testId}/`, { credentials: "include",  credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.detail) {
          alert(data.detail);
          return;
        }
        setActiveTest({ id: data.id, title: data.title, questions: data.questions });
        setAnswers({});
        setResult(null);
      });
  };

  const submitTest = () => {
    if (!activeTest) return;
    fetch(`/api/students/me/tests/${activeTest.id}/submit/`, { credentials: "include", 
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    })
      .then(res => res.json())
      .then(data => {
        setResult({ score: data.score, total: data.total_marks });
        loadTests();
      });
  };

  const closeModal = () => {
    setActiveTest(null);
    setAnswers({});
    setResult(null);
  };

  return (
    <div className="p-8 relative">
      <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }} className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-white drop-shadow-lg">Testlar va Vazifalar</h1>
          <p className="text-slate-400 mt-2 text-sm">O'qituvchi tomonidan biriktirilgan vazifalar</p>
        </div>

        {tests.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] p-12 shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="text-6xl mb-4">📝</div>
            <h2 className="text-2xl font-bold text-slate-300">Hozircha vazifalar yo'q</h2>
            <p className="text-slate-400 mt-2">O'qituvchingiz vazifa yuklaganda shu yerda ko'rinadi.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tests.map(test => (
              <motion.div key={test.id} variants={itemVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-3xl shadow-xl flex flex-col justify-between group hover:bg-white/10 transition-colors">
                <div>
                  <h3 className="text-xl font-bold text-white mb-2">{test.title}</h3>
                  <p className="text-sm text-slate-400 mb-4 line-clamp-2">{test.description || "Tavsif yo'q"}</p>
                  <div className="flex gap-4 text-sm text-slate-300 mb-4">
                    <span>⏱️ {test.duration} daqiqa</span>
                    <span>🎯 {test.total_marks} ball</span>
                  </div>
                  {test.is_submitted && (
                    <p className="text-emerald-400 font-bold mb-4">✅ Topshirilgan: {test.score}/{test.total_marks} ball</p>
                  )}
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-white/10">
                  <div className="text-xs text-slate-400">
                    Muddati: {test.deadline ? new Date(test.deadline).toLocaleDateString() : "Cheklanmagan"}
                  </div>
                  {!test.is_submitted ? (
                    <button
                      onClick={() => startTest(test.id)}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-xl font-semibold shadow-lg shadow-blue-500/30 transition-all"
                    >
                      Boshlash
                    </button>
                  ) : (
                    <span className="text-slate-500 text-sm">Yakunlangan</span>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {activeTest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={closeModal} />
          <div className="bg-slate-900 border border-slate-700 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto relative z-10 p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-white mb-6">{activeTest.title}</h2>

            {result ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-3xl font-bold text-emerald-400">{result.score} / {result.total} ball</p>
                <p className="text-slate-400 mt-4">Test muvaffaqiyatli topshirildi!</p>
                <button onClick={closeModal} className="mt-8 bg-blue-500 text-white px-8 py-3 rounded-xl font-bold">Yopish</button>
              </div>
            ) : (
              <div className="space-y-6">
                {activeTest.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 bg-white/5 rounded-2xl border border-white/10">
                    <p className="text-white font-medium mb-4">{idx + 1}. {q.question_text}</p>
                    <div className="space-y-2">
                      {(['a', 'b', 'c', 'd'] as const).map(key => (
                        <label key={key} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer border transition-colors ${answers[String(q.id)] === key ? 'bg-blue-500/20 border-blue-500/50' : 'border-white/10 hover:bg-white/5'}`}>
                          <input
                            type="radio"
                            name={`q-${q.id}`}
                            checked={answers[String(q.id)] === key}
                            onChange={() => setAnswers({ ...answers, [String(q.id)]: key })}
                            className="accent-blue-500"
                          />
                          <span className="text-slate-200">{q[`option_${key}` as keyof Question] as string}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
                <button
                  onClick={submitTest}
                  disabled={activeTest.questions.some(q => !answers[String(q.id)])}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white font-bold py-4 rounded-xl"
                >
                  Topshirish
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
