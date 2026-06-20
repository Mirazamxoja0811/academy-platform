import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Academy.settings')
django.setup()

from main.models import CustomUser, Group

print("Teachers:")
for t in CustomUser.objects.filter(role='teacher'):
    groups = Group.objects.filter(teacher=t)
    print(f"- {t.username} (ID: {t.id}): {groups.count()} groups")

print("\nGroups:")
for g in Group.objects.all():
    print(f"- {g.name}: Teacher={g.teacher.username if g.teacher else 'None'}")
