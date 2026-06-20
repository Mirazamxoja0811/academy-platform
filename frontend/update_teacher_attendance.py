import re

with open('src/app/teacher/attendance/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add clear function
clear_func = """  const handleClearOld = async () => {
    if (!confirm("Haqiqatan ham 30 kundan eski bo'lgan barcha davomatlarni tozalab tashlamoqchimisiz?")) return;
    try {
      const res = await axios.delete('/api/teacher/attendance/clear-old/', { withCredentials: true });
      alert(res.data.message || "Tozalandi");
      fetchGroups();
    } catch (e) {
      alert("Xatolik yuz berdi");
    }
  };
"""

content = content.replace('const [loading, setLoading] = useState(true);', 'const [loading, setLoading] = useState(true);\n' + clear_func)

# Add clear button next to the group selector or in the header
header_old = """      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Davomat Belgilash</h2>"""

header_new = """      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Davomat Belgilash</h2>
        <button onClick={handleClearOld} className="flex items-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 px-4 py-2 rounded-xl transition-all border border-rose-500/20 text-sm font-medium">
          1 Oylik tozalash
        </button>"""

if header_old in content:
    content = content.replace(header_old, header_new)
else:
    print("Warning: header_old not found!")

with open('src/app/teacher/attendance/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("teacher/attendance updated")
