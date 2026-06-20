CODE = """

@csrf_exempt
@require_http_methods(["POST"])
def api_user_delete(request, user_id):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    user = get_object_or_404(CustomUser, id=user_id)
    if user.id == request.user.id:
        return JsonResponse({"detail": "O'zingizni o'chira olmaysiz"}, status=400)
        
    user.delete()
    return JsonResponse({"message": "Foydalanuvchi o'chirildi"})

@csrf_exempt
@require_http_methods(["GET"])
def api_admin_dashboard(request):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    total_users = CustomUser.objects.count()
    total_students = Student.objects.count()
    total_teachers = CustomUser.objects.filter(role='teacher').count()
    total_groups = Group.objects.count()
    
    return JsonResponse({
        "total_users": total_users,
        "total_students": total_students,
        "total_teachers": total_teachers,
        "total_groups": total_groups
    })
"""

with open('main/views.py', 'a', encoding='utf-8') as f:
    f.write('\\n' + CODE + '\\n')

with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Add imports at the top
if "from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, TestSubmission, AdmissionRequest, Course, Room, Payment" not in content:
    content = content.replace(
        "from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, TestSubmission, AdmissionRequest, Course, Room",
        "from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, TestSubmission, AdmissionRequest, Course, Room, Payment"
    )

with open('main/views.py', 'w', encoding='utf-8') as f:
    f.write(content)

print("Fixed missing APIs")
