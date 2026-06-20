import re

with open('src/app/student/dashboard/page.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add schedule to interface
content = content.replace('group_name?: string;', 'group_name?: string;\n  schedule?: string;')

# Update the display
display_old = """          {data.group_name && (
            <div className="mt-6 flex gap-4 flex-wrap">
              <span className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 font-medium text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" /> {data.group_name}
              </span>
              <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Guruh reytingi: {data.rank} / {data.total_students}
              </span>
            </div>
          )}"""

display_new = """          {data.group_name && (
            <div className="mt-6 flex flex-col sm:flex-row gap-4 flex-wrap">
              <span className="px-4 py-2 bg-slate-800/50 rounded-xl border border-slate-700/50 font-medium text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-400" /> {data.group_name}
              </span>
              {data.schedule && (
                <span className="px-4 py-2 bg-purple-500/10 rounded-xl border border-purple-500/20 font-medium text-purple-300 flex items-center gap-2">
                  <CalendarDays className="w-5 h-5 text-purple-400" /> {data.schedule}
                </span>
              )}
              <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-xl border border-yellow-500/20 font-bold flex items-center gap-2">
                <Trophy className="w-5 h-5" /> Guruh reytingi: {data.rank} / {data.total_students}
              </span>
            </div>
          )}"""

if display_old in content:
    content = content.replace(display_old, display_new)

with open('src/app/student/dashboard/page.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("student/dashboard updated")
