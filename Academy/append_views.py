import os

CODE = """
@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def api_course_detail(request, course_id):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    
    course = get_object_or_404(Course, id=course_id)
    
    if request.method == "DELETE":
        course.delete()
        return JsonResponse({"message": "Kurs o'chirildi"})
        
    elif request.method == "PUT":
        data = json.loads(request.body)
        course.name = data.get('name', course.name)
        course.price_per_month = data.get('price_per_month', course.price_per_month)
        course.save()
        return JsonResponse({"message": "Kurs yangilandi"})

@csrf_exempt
@require_http_methods(["PUT", "DELETE"])
def api_group_detail(request, group_id):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    
    group = get_object_or_404(Group, id=group_id)
    
    if request.method == "DELETE":
        group.delete()
        return JsonResponse({"message": "Guruh o'chirildi"})
        
    elif request.method == "PUT":
        data = json.loads(request.body)
        group.name = data.get('name', group.name)
        if 'course_id' in data:
            course = Course.objects.filter(id=data.get('course_id')).first()
            if course: group.course = course
        if 'teacher_id' in data:
            teacher = CustomUser.objects.filter(id=data.get('teacher_id')).first()
            if teacher: group.teacher = teacher
        if 'max_seats' in data:
            group.max_seats = int(data.get('max_seats', group.max_seats))
        group.save()
        return JsonResponse({"message": "Guruh yangilandi"})

@csrf_exempt
@require_http_methods(["POST"])
def api_admissions_action(request, request_id):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    admission = get_object_or_404(AdmissionRequest, id=request_id)
    data = json.loads(request.body)
    action = data.get('action')
    
    if action == 'approve':
        if admission.status == 'approved':
            return JsonResponse({"detail": "Allaqachon qabul qilingan"}, status=400)
            
        first_name = admission.full_name.split(' ')[0] if admission.full_name else 'Student'
        last_name = ' '.join(admission.full_name.split(' ')[1:]) if len(admission.full_name.split(' ')) > 1 else ''
        username = _generate_unique_username_from_name(admission.full_name)
        password = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        user = CustomUser.objects.create_user(
            username=username,
            email=admission.email or '',
            password=password,
            first_name=first_name,
            last_name=last_name,
            phone=admission.phone,
            role='student',
        )

        Student.objects.create(
            user=user,
            group=admission.assigned_group,
            student_id=_generate_unique_student_id(),
        )

        admission.status = 'approved'
        admission.created_user = user
        admission.processed_by = request.user
        admission.processed_at = timezone.now()
        admission.save()
        
        return JsonResponse({
            "message": "Qabul qilindi", 
            "username": username,
            "password": password
        })
        
    elif action == 'reject':
        admission.status = 'rejected'
        admission.processed_by = request.user
        admission.processed_at = timezone.now()
        admission.save()
        return JsonResponse({"message": "Bekor qilindi"})
        
    return JsonResponse({"detail": "Noto'g'ri amal"}, status=400)
"""

with open("main/views.py", "a", encoding="utf-8") as f:
    f.write("\n" + CODE + "\n")
print("Done")
