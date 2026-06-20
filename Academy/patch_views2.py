import re

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix api_teacher_groups: remove description
content = content.replace('"description": g.description,', '')

# Fix api_admin_dashboard
# It currently has:
#    recent_requests = AdmissionRequest.objects.filter(status='new').order_by('-created_at')[:5]
#    recent_alerts = []
#    for r in recent_requests:
#        recent_alerts.append({
#            "id": r.id,
#            "title": "Yangi qabul so'rovi",
#            "description": f"{r.full_name} ({r.course_name})"
#        })
#
#    return JsonResponse({
#        "total_users": total_users,
#        "total_students": total_students,
#        "total_teachers": total_teachers,
#        "total_groups": total_groups,
#        "total_revenue": total_revenue,
#        "recent_alerts": recent_alerts
#    })

admin_dash_old = """    recent_requests = AdmissionRequest.objects.filter(status='new').order_by('-created_at')[:5]
    recent_alerts = []
    for r in recent_requests:
        recent_alerts.append({
            "id": r.id,
            "title": "Yangi qabul so'rovi",
            "description": f"{r.full_name} ({r.course_name})"
        })

    return JsonResponse({
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_groups": total_groups,
        "total_revenue": total_revenue,
        "recent_alerts": recent_alerts
    })"""

admin_dash_new = """    from django.db.models.functions import TruncMonth
    from django.utils import timezone
    current_year = timezone.now().year
    monthly_payments = Payment.objects.filter(payment_date__year=current_year).annotate(month=TruncMonth('payment_date')).values('month').annotate(total=Sum('amount')).order_by('month')
    
    chart_data = []
    month_names = ["Yan", "Fev", "Mar", "Apr", "May", "Iyun", "Iyul", "Avg", "Sen", "Okt", "Noy", "Dek"]
    for mp in monthly_payments:
        if mp['month']:
            chart_data.append({
                "name": month_names[mp['month'].month - 1],
                "total": float(mp['total'] or 0)
            })

    top_students_qs = Student.objects.all().order_by('-total_coins', 'id')[:3]
    top_students = []
    for s in top_students_qs:
        top_students.append({
            "id": s.id,
            "name": s.user.get_full_name() or s.user.username,
            "coins": s.total_coins
        })

    return JsonResponse({
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_groups": total_groups,
        "total_revenue": total_revenue,
        "chart_data": chart_data,
        "top_students": top_students
    })"""

if admin_dash_old in content:
    content = content.replace(admin_dash_old, admin_dash_new)
else:
    print("WARNING: admin_dash_old not found!")

# Add StudentMessage APIs
student_apis = """
@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_student_messages_api(request):
    if not request.user.is_authenticated or _user_role(request.user) != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    try:
        student = request.user.student_profile
    except:
        return JsonResponse({"detail": "Student profile not found"}, status=404)

    if request.method == "GET":
        msgs = StudentMessage.objects.filter(student=student).order_by('-created_at')[:50]
        data = []
        for m in msgs:
            data.append({
                "id": m.id,
                "teacher_name": m.teacher.get_full_name() or m.teacher.username,
                "content": m.content,
                "is_read": m.is_read,
                "created_at": m.created_at.strftime('%Y-%m-%d %H:%M')
            })
        
        # also get teachers list for the dropdown
        teachers = []
        for g in student.groups.all():
            if g.teacher and g.teacher not in [t['user'] for t in teachers]:
                teachers.append({
                    "id": g.teacher.id,
                    "name": g.teacher.get_full_name() or g.teacher.username,
                    "user": g.teacher
                })
        
        teachers_data = [{"id": t["id"], "name": t["name"]} for t in teachers]

        return JsonResponse({"messages": data, "teachers": teachers_data})
        
    elif request.method == "POST":
        data = json.loads(request.body)
        teacher_id = data.get('teacher_id')
        content = data.get('content')
        
        if not teacher_id or not content:
            return JsonResponse({"error": "Barcha maydonlarni to'ldiring"}, status=400)
            
        teacher = get_object_or_404(CustomUser, id=teacher_id, role='teacher')
        
        StudentMessage.objects.create(
            student=student,
            teacher=teacher,
            content=content
        )
        return JsonResponse({"message": "Xabar yuborildi"})
"""

if "api_student_messages_api" not in content:
    content += student_apis

# wait, I need to make sure StudentMessage is imported in views.py!
if "StudentMessage" not in content[:1000]:
    content = content.replace("Payment", "Payment, StudentMessage", 1)


with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("views.py patched successfully")
