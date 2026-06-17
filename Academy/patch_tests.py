views_path = r"d:\SWT programming\Academy\main\views.py"

new_code = """
@csrf_exempt
@require_http_methods(["GET"])
def api_student_tests(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    if not student.group:
        return JsonResponse([], safe=False)
    tests = Test.objects.filter(group=student.group, is_active=True).values('id', 'title', 'description', 'duration', 'total_marks', 'deadline', 'teacher__first_name', 'teacher__last_name')
    return JsonResponse(list(tests), safe=False)
"""

with open(views_path, "a", encoding="utf-8") as f:
    f.write(new_code)

print("Tests patched")
