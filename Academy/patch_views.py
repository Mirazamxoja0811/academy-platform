import re

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix group__teacher -> groups__teacher
content = content.replace('group__teacher', 'groups__teacher')

# Fix student.group and ...
# in api_batch_grading:
# if student.group and student.group.teacher_id != request.user.id:
content = re.sub(
    r'if student\.group and student\.group\.teacher_id != request\.user\.id:',
    r'if not student.groups.filter(teacher=request.user).exists():',
    content
)

# in api_batch_attendance:
# group = Group.objects.get(id=data.get('group_id'))
# if group.teacher_id != request.user.id:
# This is correct since it checks the Group model.

# in api_teacher_history_attendance:
# "group_name": a.group.name if a.group else "",
# This is fine if Attendance has a foreign key to Group!
# Let's check Attendance model in models.py

with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("views.py patched")
