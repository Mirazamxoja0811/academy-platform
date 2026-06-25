import os
import shutil
import glob

SRC = os.path.abspath('../frontend/out')
DST = os.path.abspath('main/templates')

print(f"Source: {SRC}")
print(f"Destination: {DST}")

os.makedirs(DST, exist_ok=True)

pages = [
    ('index.html', 'index.html'),
    ('login.html', 'login.html'),
    ('student/dashboard.html', 'student/dashboard.html'),
    ('student/grades.html', 'student/grades.html'),
    ('student/attendance.html', 'student/attendance.html'),
    ('student/coins.html', 'student/coins.html'),
    ('student/tests.html', 'student/tests.html'),
    ('student/messages.html', 'student/messages.html'),
    ('student/settings.html', 'student/settings.html'),
    ('teacher/dashboard.html', 'teacher/dashboard.html'),
    ('teacher/groups.html', 'teacher/groups.html'),
    ('teacher/grading.html', 'teacher/grading.html'),
    ('teacher/attendance.html', 'teacher/attendance.html'),
    ('teacher/coins.html', 'teacher/coins.html'),
    ('teacher/messages.html', 'teacher/messages.html'),
    ('teacher/tests.html', 'teacher/tests.html'),
    ('admin/dashboard.html', 'admin/dashboard.html'),
    ('admin/users.html', 'admin/users.html'),
    ('admin/courses.html', 'admin/courses.html'),
    ('admin/groups.html', 'admin/groups.html'),
    ('admin/admissions.html', 'admin/admissions.html'),
    ('admin/finance.html', 'admin/finance.html'),
    ('admin/settings.html', 'admin/settings.html'),
]

for src_rel, dst_rel in pages:
    src_path = os.path.join(SRC, src_rel.replace('/', os.sep))
    dst_path = os.path.join(DST, dst_rel.replace('/', os.sep))
    if os.path.exists(src_path):
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        shutil.copy2(src_path, dst_path)
        print(f"Copied: {dst_rel}")
    else:
        print(f"MISSING: {src_path}")

# Copy static _next folder
next_src = os.path.join(SRC, '_next')
next_dst = os.path.join('main', 'static', '_next')
if os.path.exists(next_src):
    if os.path.exists(next_dst):
        shutil.rmtree(next_dst, ignore_errors=True)
    shutil.copytree(next_src, next_dst, dirs_exist_ok=True)
    print(f"Copied _next static assets")

print("Done!")
