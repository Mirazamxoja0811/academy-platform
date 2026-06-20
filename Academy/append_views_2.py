import os

CODE = """
@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_finance(request):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    if request.method == "GET":
        payments = Payment.objects.all().order_by('-payment_date')[:50]
        data = []
        for p in payments:
            data.append({
                'id': p.id,
                'student_name': p.student.user.get_full_name(),
                'amount': str(p.amount),
                'method': p.payment_method,
                'date': p.payment_date.strftime('%Y-%m-%d %H:%M'),
                'processed_by': p.processed_by.get_full_name() if p.processed_by else 'Admin'
            })
        return JsonResponse(data, safe=False)
        
    elif request.method == "POST":
        data = json.loads(request.body)
        student_id = data.get('student_id')
        amount = data.get('amount')
        method = data.get('method', 'cash')
        
        student = get_object_or_404(Student, id=student_id)
        Payment.objects.create(
            student=student,
            amount=amount,
            payment_method=method,
            processed_by=request.user
        )
        return JsonResponse({"message": "To'lov qabul qilindi"})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_system_settings(request):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    SETTINGS_FILE = os.path.join(settings.BASE_DIR, 'system_settings.json')
    
    if request.method == "GET":
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r', encoding='utf-8') as f:
                return JsonResponse(json.load(f))
        return JsonResponse({
            "academy_name": "Mirazam Academy",
            "phone": "+998 90 123 45 67",
            "address": "Toshkent shahar",
            "currency": "UZS"
        })
        
    elif request.method == "POST":
        data = json.loads(request.body)
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return JsonResponse({"message": "Tizim sozlamalari saqlandi"})
"""

with open('main/views.py', 'a', encoding='utf-8') as f:
    f.write('\\n' + CODE + '\\n')
print("Appended")
