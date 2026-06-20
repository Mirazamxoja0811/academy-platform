import re

with open('src/app/teacher/attendance/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add clear function
clear_func = """  const handleClearOld = async () => {
    if (!confirm("Haqiqatan ham 30 kundan eski bo'lgan barcha davomatlarni tozalab tashlamoqchimisiz?")) return;
    try {
      const res = await fetch('/api/teacher/attendance/clear-old/', { method: 'DELETE', credentials: "include" });
      const data = await res.json();
      alert(data.message || "Tozalandi");
      fetchHistory();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };
"""

content = content.replace('const [history, setHistory] = useState<any[]>([]);', 'const [history, setHistory] = useState<any[]>([]);\n' + clear_func)

# Add clear button next to the group selector or in the header
header_old = '          <div className="flex gap-4">'

header_new = """          <div className="flex gap-4">
            <button onClick={handleClearOld} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 font-bold py-2 px-4 rounded-xl border border-rose-500/30 transition-colors">
              1 Oylik tozalash
            </button>"""

if header_old in content:
    content = content.replace(header_old, header_new)
else:
    print("Warning: header_old not found!")

with open('src/app/teacher/attendance/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/attendance updated correctly")
