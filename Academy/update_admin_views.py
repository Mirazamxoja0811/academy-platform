import re

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix api_admin_dashboard
# Find:
#     return JsonResponse({
#         "total_users": total_users,
#         "total_students": total_students,
#         "total_teachers": total_teachers,
#         "total_groups": total_groups
#     })
dashboard_old = """    return JsonResponse({
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_groups": total_groups
    })"""

dashboard_new = """    from django.db.models import Sum
    total_revenue = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    
    recent_requests = AdmissionRequest.objects.filter(status='new').order_by('-created_at')[:5]
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
content = content.replace(dashboard_old, dashboard_new)

# Fix api_finance POST
# Find: student = get_object_or_404(Student, id=student_id)
# Replace: student = get_object_or_404(Student, user__id=student_id)
content = content.replace(
    "student = get_object_or_404(Student, id=student_id)",
    "student = get_object_or_404(Student, user__id=student_id)"
)

with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("views.py updated successfully")
