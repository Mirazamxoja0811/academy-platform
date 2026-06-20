import os

views_path = r"d:\SWT programming\Academy\main\views.py"
urls_path = r"d:\SWT programming\Academy\main\urls.py"

new_views_code = """

# ================= NEW APIS =================

@csrf_exempt
@require_http_methods(["GET"])
def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated"}, status=401)
    
    user = request.user
    role = "admin" if user.is_superuser else user.role
    
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": user.get_full_name() or user.username,
        "role": role,
    })

@csrf_exempt
@require_http_methods(["GET"])
def api_student_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    student = request.user.student_profile
    avg_grade = _get_student_grade_average(student)
    attendance_rate = _get_student_attendance_percentage(student)
    
    # rank logic
    position = 0
    total_students = 0
    if student.group:
        students_in_group = list(Student.objects.filter(group=student.group))
        students_in_group.sort(key=lambda s: _get_student_grade_average(s), reverse=True)
        try:
            position = students_in_group.index(student) + 1
        except ValueError:
            position = 0
        total_students = len(students_in_group)
        
    return JsonResponse({
        "average_grade": avg_grade,
        "attendance_rate": attendance_rate,
        "total_coins": student.total_coins,
        "rank": position,
        "total_students": total_students,
        "group_name": student.group.name if student.group else "Guruhsiz"
    })

@csrf_exempt
@require_http_methods(["GET"])
def api_student_grades(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    grades = student.grades.all().values('subject', 'grade', 'date', 'teacher__first_name', 'teacher__last_name', 'comment')
    return JsonResponse(list(grades), safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def api_student_attendance(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    attendances = student.attendances.all().values('date', 'status', 'group__name', 'note')
    return JsonResponse(list(attendances), safe=False)

@csrf_exempt
@require_http_methods(["GET"])
def api_student_coins(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    txs = student.coin_transactions.all().values('amount', 'reason', 'date', 'given_by__first_name')
    return JsonResponse({"balance": student.total_coins, "transactions": list(txs)})

@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    teacher = request.user
    groups_count = teacher.teaching_groups.count()
    total_students = Student.objects.filter(group__teacher=teacher).count()
    coins_given = CoinTransaction.objects.filter(given_by=teacher).aggregate(Sum('amount'))['amount__sum'] or 0
    
    # Top 3 passive students (lowest avg grade in teacher's groups)
    students = list(Student.objects.filter(group__teacher=teacher))
    students.sort(key=lambda s: _get_student_grade_average(s))
    passive_students = [{"id": s.id, "name": s.user.get_full_name(), "avg": _get_student_grade_average(s)} for s in students[:3]]
    
    return JsonResponse({
        "groups_count": groups_count,
        "total_students": total_students,
        "coins_given": coins_given,
        "passive_students": passive_students
    })

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_finance(request):
    from .models import Payment
    if request.method == "GET":
        payments = Payment.objects.all().values('id', 'student__user__first_name', 'student__user__last_name', 'amount', 'payment_method', 'payment_date')
        return JsonResponse(list(payments), safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        student_id = data.get('student_id')
        amount = data.get('amount')
        method = data.get('payment_method')
        student = Student.objects.get(id=student_id)
        Payment.objects.create(student=student, amount=amount, payment_method=method, processed_by=request.user if request.user.is_authenticated else None)
        return JsonResponse({"message": "To'lov saqlandi"})

@csrf_exempt
@require_http_methods(["POST"])
def api_batch_grading(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    data = json.loads(request.body)
    grades = data.get('grades', [])
    for g in grades:
        student = Student.objects.get(id=g['student_id'])
        Grade.objects.create(student=student, subject=g['subject'], grade=g['grade'], teacher=request.user)
    return JsonResponse({"message": "Baholar saqlandi"})

"""

with open(views_path, "a", encoding="utf-8") as f:
    f.write(new_views_code)

new_urls_code = """
    path('api/me/', views.api_me, name='api_me'),
    path('api/students/me/dashboard/', views.api_student_dashboard, name='api_student_dashboard'),
    path('api/students/me/grades/', views.api_student_grades, name='api_student_grades'),
    path('api/students/me/attendance/', views.api_student_attendance, name='api_student_attendance'),
    path('api/students/me/coins/', views.api_student_coins, name='api_student_coins'),
    path('api/teacher/dashboard/stats/', views.api_teacher_dashboard, name='api_teacher_dashboard_stats'),
    path('api/teacher/batch_grading/', views.api_batch_grading, name='api_batch_grading'),
    path('api/finance/', views.api_finance, name='api_finance'),
"""

with open(urls_path, "r", encoding="utf-8") as f:
    urls_content = f.read()

urls_content = urls_content.replace(
    "path('api/students/', views.api_students, name='api_students'),",
    "path('api/students/', views.api_students, name='api_students'),\n" + new_urls_code
)

with open(urls_path, "w", encoding="utf-8") as f:
    f.write(urls_content)

print("Backend patched successfully")
