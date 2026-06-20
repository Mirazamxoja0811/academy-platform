import re

with open('src/app/admin/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace hardcoded total revenue:
content = re.sub(
    r'\{ title: "Umumiy Tushum", value: "[^"]+", icon: Banknote, color: "from-orange-500 to-red-500" \},',
    r'{ title: "Umumiy Tushum", value: `${(stats.total_revenue || 0).toLocaleString()} UZS`, icon: Banknote, color: "from-orange-500 to-red-500" },',
    content
)

content = content.replace(
    'total_groups: 0,',
    'total_groups: 0,\n    total_revenue: 0,\n    recent_alerts: [] as Array<{id: number, title: string, description: string}>,'
)

alerts_old = """          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4 p-4 rounded-2xl border border-slate-800 bg-slate-950/50 hover:bg-slate-800/50 transition-colors cursor-pointer">
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500 h-fit">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-white font-medium">To'lov kechikmoqda</h4>
                  <p className="text-sm text-slate-400 mt-1">Azizbek Rustamov 2 oydan beri to'lov qilmadi</p>
                </div>
              </div>
            ))}
          </div>"""

alerts_new = """          <div className="space-y-4">
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

content = content.replace(alerts_old, alerts_new)

with open('src/app/admin/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("dashboard page updated successfully")
