import re

with open('src/app/admin/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update the state to hold chart_data and top_students
content = content.replace('recent_alerts: [] as Array<{id: number, title: string, description: string}>,',
    'chart_data: [] as Array<{name: string, total: number}>,\n    top_students: [] as Array<{id: number, name: string, coins: number}>,')

# 2. Update the AreaChart data source
# Find: <AreaChart data={data} margin=
content = content.replace('<AreaChart data={data}', '<AreaChart data={stats.chart_data && stats.chart_data.length > 0 ? stats.chart_data : data}')

# 3. Update the alerts mapping to top_students
alerts_old = """          <div className="space-y-4">
            {stats.recent_alerts && stats.recent_alerts.length > 0 ? stats.recent_alerts.map((alert: any) => (
              <div key={alert.id} className="flex gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium">{alert.title}</h4>
                  <p className="text-sm text-slate-400 mt-1">{alert.description}</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">Hozircha yangi ogohlantirishlar yo'q</p>
            )}
          </div>"""

# Replace AlertTriangle with Trophy for students? Wait, I need to make sure I import Trophy if I use it.
alerts_new = """          <div className="space-y-4">
            {stats.top_students && stats.top_students.length > 0 ? stats.top_students.map((student: any, idx: number) => (
              <div key={student.id} className="flex gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors">
                <div className="p-2 rounded-xl bg-yellow-500/10 text-yellow-500 h-fit w-10 h-10 flex items-center justify-center font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-medium">{student.name}</h4>
                  <p className="text-sm text-yellow-400 mt-1 font-semibold">{student.coins} coin</p>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">O'quvchilar topilmadi</p>
            )}
          </div>"""

content = content.replace(alerts_old, alerts_new)

# 4. Change the title "Muhim ogohlantirishlar" to "Top O'quvchilar"
content = content.replace('<h3 className="text-xl font-bold text-white mb-6">Muhim ogohlantirishlar</h3>',
    '<h3 className="text-xl font-bold text-white mb-6">Top O\'quvchilar</h3>')

# 5. Remove +12.5% O'tgan oyga nisbatan
content = re.sub(
    r'<div className="flex items-center gap-2 text-sm text-emerald-400">\s*<span className="bg-emerald-500/10 px-2 py-1 rounded-full">\+12\.5%</span>\s*<span className="text-slate-500">O\'tgan oyga nisbatan</span>\s*</div>',
    '',
    content
)

with open('src/app/admin/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Admin dashboard frontend updated")
