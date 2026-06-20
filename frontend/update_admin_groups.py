import re

with open('src/app/admin/groups/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add inputs for start_time and end_time next to schedule_days
inputs_old = """                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Kunlar</label>
                      <input type="text" placeholder="Du-Chor-Jum" value={formData.schedule_days} onChange={e => setFormData({...formData, schedule_days: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Boshlanish sanasi</label>
                      <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                    </div>
                  </div>"""

inputs_new = """                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Kunlar</label>
                      <input type="text" placeholder="Du-Chor-Jum" value={formData.schedule_days} onChange={e => setFormData({...formData, schedule_days: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Boshlanish vaqti</label>
                      <input type="time" value={formData.start_time || ''} onChange={e => setFormData({...formData, start_time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-2">Tugash vaqti</label>
                      <input type="time" value={formData.end_time || ''} onChange={e => setFormData({...formData, end_time: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Boshlanish sanasi</label>
                    <input type="date" required value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-emerald-500/50 outline-none" />
                  </div>"""

if inputs_old in content:
    content = content.replace(inputs_old, inputs_new)

with open('src/app/admin/groups/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("admin/groups updated")
