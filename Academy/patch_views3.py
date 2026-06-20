import re

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update api_groups POST logic to save start_time and end_time
groups_old = """        group = Group.objects.create(
            name=data.get('name'),
            course=course,
            room=room,
            schedule_days=data.get('schedule_days', ''),
            start_date=data.get('start_date') or date.today(),
            max_seats=int(data.get('max_seats', 15)),
            teacher=teacher,
            status=data.get('status', 'active')
        )
        return JsonResponse({"message": "Guruh qo'shildi", "id": group.id})"""

groups_new = """        st = data.get('start_time')
        et = data.get('end_time')
        group = Group.objects.create(
            name=data.get('name'),
            course=course,
            room=room,
            schedule_days=data.get('schedule_days', ''),
            start_time=st if st else None,
            end_time=et if et else None,
            start_date=data.get('start_date') or date.today(),
            max_seats=int(data.get('max_seats', 15)),
            teacher=teacher,
            status=data.get('status', 'active')
        )
        return JsonResponse({"message": "Guruh qo'shildi", "id": group.id})"""

if groups_old in content:
    content = content.replace(groups_old, groups_new)

# 2. Update api_groups PUT logic to save start_time and end_time (Wait, does api_groups have PUT? No, maybe api_group_detail has it)
# Let's check api_group_detail if it exists.
# Wait, let's just use re to replace it if it exists
group_put_old = """    elif request.method == "PUT":
        data = json.loads(request.body)
        group.name = data.get('name', group.name)
        
        course_id = data.get('course_id')
        if course_id:
            group.course = Course.objects.filter(id=course_id).first()
            
        teacher_id = data.get('teacher_id')
        if teacher_id:
            group.teacher = CustomUser.objects.filter(id=teacher_id, role='teacher').first()
            
        room_id = data.get('room_id')
        if room_id:
            group.room = Room.objects.filter(id=room_id).first()
            
        group.schedule_days = data.get('schedule_days', group.schedule_days)
        
        from django.utils.dateparse import parse_date
        sd = data.get('start_date')
        if sd: group.start_date = parse_date(sd)
        
        group.max_seats = int(data.get('max_seats', group.max_seats))
        group.status = data.get('status', group.status)
        group.save()
        return JsonResponse({"message": "Guruh yangilandi"})"""

group_put_new = """    elif request.method == "PUT":
        data = json.loads(request.body)
        group.name = data.get('name', group.name)
        
        course_id = data.get('course_id')
        if course_id:
            group.course = Course.objects.filter(id=course_id).first()
            
        teacher_id = data.get('teacher_id')
        if teacher_id:
            group.teacher = CustomUser.objects.filter(id=teacher_id, role='teacher').first()
            
        room_id = data.get('room_id')
        if room_id:
            group.room = Room.objects.filter(id=room_id).first()
            
        group.schedule_days = data.get('schedule_days', group.schedule_days)
        st = data.get('start_time')
        if st is not None: group.start_time = st if st else None
        et = data.get('end_time')
        if et is not None: group.end_time = et if et else None
        
        from django.utils.dateparse import parse_date
        sd = data.get('start_date')
        if sd: group.start_date = parse_date(sd)
        
        group.max_seats = int(data.get('max_seats', group.max_seats))
        group.status = data.get('status', group.status)
        group.save()
        return JsonResponse({"message": "Guruh yangilandi"})"""

if group_put_old in content:
    content = content.replace(group_put_old, group_put_new)


# 3. Update api_student_dashboard to return schedule string
student_dash_old = '"group_name": ", ".join([g.name for g in student_groups]) if student_groups else "Guruhsiz",'
student_dash_new = """        "group_name": ", ".join([g.name for g in student_groups]) if student_groups else "Guruhsiz",
        "schedule": " | ".join([f"{g.schedule_days} {g.start_time.strftime('%H:%M') if g.start_time else ''}-{g.end_time.strftime('%H:%M') if g.end_time else ''}" for g in student_groups if g.schedule_days]) if student_groups else "Belgilanmagan",
"""

if student_dash_old in content and '"schedule":' not in content:
    content = content.replace(student_dash_old, student_dash_new)


# 4. Add Teacher Test DELETE and Teacher Attendance CLEAR
teacher_apis = """
@csrf_exempt
@require_http_methods(["DELETE"])
def api_teacher_test_detail(request, test_id):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    test = get_object_or_404(Test, id=test_id, teacher=request.user)
    test.delete()
    return JsonResponse({"message": "Test o'chirildi"})

@csrf_exempt
@require_http_methods(["DELETE", "POST"])
def api_teacher_attendance_clear_old(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    from datetime import timedelta
    from django.utils import timezone
    cutoff = timezone.now().date() - timedelta(days=30)
    deleted_count, _ = Attendance.objects.filter(group__teacher=request.user, date__lte=cutoff).delete()
    return JsonResponse({"message": f"{deleted_count} ta eski davomat o'chirildi"})
"""

if "api_teacher_test_detail" not in content:
    content += teacher_apis


with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("views.py updated successfully")
