import os

CODE = """
def api_users(request):
    if request.method == "GET":
        users = []
        role_filter = request.GET.get('role', '')
        qs = CustomUser.objects.all().order_by('first_name', 'last_name')
        if role_filter:
            qs = qs.filter(role=role_filter)
        for user in qs:
            group_ids = []
            if _user_role(user) == 'student' and hasattr(user, 'student_profile'):
                group_ids = list(user.student_profile.groups.values_list('id', flat=True))
            elif _user_role(user) == 'teacher':
                group_ids = list(Group.objects.filter(teacher=user).values_list('id', flat=True))
            
            users.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'role': _user_role(user),
                'phone': user.phone or '',
                'date_of_birth': user.date_of_birth.strftime('%Y-%m-%d') if user.date_of_birth else '',
                'group_ids': group_ids
            })
        return JsonResponse(users, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        group_ids = data.get('group_ids', [])
        role = data.get('role', 'student')
        user_id = data.get('id', None)

        if role == 'student' and not group_ids:
            return JsonResponse({"error": "O'quvchi kamida bitta guruh tanlashi kerak"}, status=400)

        if user_id:
            user = get_object_or_404(CustomUser, id=user_id)
            user.first_name = data.get('first_name', user.first_name)
            user.last_name = data.get('last_name', user.last_name)
            user.username = data.get('username', user.username)
            user.phone = data.get('phone', user.phone)
            
            if data.get('password'):
                user.set_password(data.get('password'))
            
            if data.get('date_of_birth'):
                user.date_of_birth = data.get('date_of_birth')
                
            user.save()
            
            if role == 'student' and hasattr(user, 'student_profile'):
                groups_qs = Group.objects.filter(id__in=group_ids)
                user.student_profile.groups.set(groups_qs)
            elif role == 'teacher':
                Group.objects.filter(teacher=user).update(teacher=None)
                Group.objects.filter(id__in=group_ids).update(teacher=user)
                
            return JsonResponse({"message": "Foydalanuvchi yangilandi"})

        if role == 'student':
            for gid in group_ids:
                sg = Group.objects.filter(id=gid).first()
                if sg and sg.students.count() >= sg.max_seats:
                    return JsonResponse({"error": f"Guruh to'lgan: {sg.name}"}, status=400)

        user = CustomUser.objects.create_user(
            username=data.get('username'),
            password=data.get('password', '1234'),
            first_name=data.get('first_name', ''),
            last_name=data.get('last_name', ''),
            role=role,
            phone=data.get('phone', '')
        )
        dob = data.get('date_of_birth')
        if dob:
            user.date_of_birth = dob
            user.save()

        if user.role == 'student':
            student = Student.objects.create(user=user, student_id=f"STU{user.id:04d}")
            if group_ids:
                groups_qs = Group.objects.filter(id__in=group_ids)
                student.groups.set(groups_qs)
        elif user.role == 'teacher' and group_ids:
            Group.objects.filter(id__in=group_ids).update(teacher=user)

        return JsonResponse({"message": "Foydalanuvchi qo'shildi", "id": user.id})
"""

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

import ast

class ApiUsersReplacer(ast.NodeVisitor):
    def __init__(self):
        self.start_line = None
        self.end_line = None

    def visit_FunctionDef(self, node):
        if node.name == 'api_users':
            self.start_line = node.lineno
            self.end_line = node.end_lineno
        self.generic_visit(node)

replacer = ApiUsersReplacer()
tree = ast.parse(content)
replacer.visit(tree)

if replacer.start_line:
    lines = content.split('\\n')
    new_content = '\\n'.join(lines[:replacer.start_line - 1]) + '\\n' + CODE + '\\n' + '\\n'.join(lines[replacer.end_line:])
    with open('main/views.py', 'w', encoding='utf-8') as f:
        f.write(new_content)
    print("Replaced successfully")
else:
    print("Could not find api_users")
