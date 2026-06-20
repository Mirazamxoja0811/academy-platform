import re

with open('src/app/teacher/tests/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add handleDelete
delete_func = """  const handleDelete = async (id: number) => {
    if (!confirm("Haqiqatan ham bu testni o'chirmoqchimisiz?")) return;
    try {
      await axios.delete(`/api/teacher/tests/${id}/`, { withCredentials: true });
      fetchTests();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };
"""

content = content.replace('const [tests, setTests] = useState<any[]>([]);', 'const [tests, setTests] = useState<any[]>([]);\n' + delete_func)

# Add Trash2 to imports
content = content.replace('import { Plus, Clock, FileText, X, Check, Users, ShieldAlert } from "lucide-react";', 'import { Plus, Clock, FileText, X, Check, Users, ShieldAlert, Trash2 } from "lucide-react";')

# Add delete button next to test title
test_old = """                  <div>
                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{test.title}</h3>
                    <p className="text-slate-400 text-sm mt-1">{test.description}</p>
                  </div>"""

test_new = """                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{test.title}</h3>
                      <p className="text-slate-400 text-sm mt-1">{test.description}</p>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(test.id); }} className="p-2 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 rounded-xl transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>"""

if test_old in content:
    content = content.replace(test_old, test_new)

with open('src/app/teacher/tests/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/tests updated")
