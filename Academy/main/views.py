import os
from django.conf import settings
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout
from django.contrib.auth.decorators import login_required
from django.contrib import messages
from django.http import JsonResponse
from django.views.decorators.http import require_http_methods
import json
from datetime import date
from django.utils import timezone
from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, Question, TestSubmission, AdmissionRequest, Course, Room, Payment, StudentMessage
from .decorators import admin_required, teacher_required, student_required
from .forms import CustomUserCreationForm, CustomUserEditForm, GroupForm, StudentForm, AccountSettingsForm, AdmissionRequestForm
from django.db.models import Count, Sum, Avg, Q
from django.views.decorators.csrf import csrf_exempt
import random
import string

@csrf_exempt
@require_http_methods(["POST"])
def api_login(request):
    try:
        data = json.loads(request.body)
        username = data.get('username')
        password = data.get('password')

        user = authenticate(request, username=username, password=password)

        if user is not None:
            login(request, user)
            
            # Agar superuser bo'lsa uni admin deb hisoblaymiz
            role = "admin" if user.is_superuser else user.role
            
            # Student ID ni qaytarish (agar student bo'lsa)
            student_id = None
            if role == 'student' and hasattr(user, 'student_profile'):
                student_id = user.student_profile.id

            return JsonResponse({
                "message": "Muvaffaqiyatli kirdingiz",
                "role": role,
                "student_id": student_id
            }, status=200)
        else:
            return JsonResponse({"detail": "Login yoki parol noto'g'ri"}, status=401)
    except Exception as e:
        return JsonResponse({"detail": str(e)}, status=400)

def _user_display_name(user):
    name = user.get_full_name().strip()
    return name if name else user.username


def _user_role(user):
    return "admin" if user.is_superuser else user.role


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_users(request):
    if request.method == "GET":
        users = []
        role_filter = request.GET.get('role', '')
        qs = CustomUser.objects.all().order_by('first_name', 'last_name')
        if role_filter:
            qs = qs.filter(role=role_filter)
        for user in qs:
            users.append({
                'id': user.id,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'username': user.username,
                'role': _user_role(user),
                'phone': user.phone or '',
            })
        return JsonResponse(users, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        group_ids = data.get('group_ids', [])
        role = data.get('role', 'student')

        if role == 'student' and not group_ids:
            return JsonResponse({"error": "O'quvchi kamida bitta guruh tanlashi kerak"}, status=400)

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

@csrf_exempt
@require_http_methods(["POST"])
def api_user_delete(request, user_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    user = get_object_or_404(CustomUser, id=user_id)

    if user.is_superuser:
        return JsonResponse({"error": "Superuser o'chirib bo'lmadi"}, status=400)

    user.delete()
    return JsonResponse({"message": "Foydalanuvchi o'chirildi"})


@csrf_exempt
@require_http_methods(["GET"])
def api_students(request):
    qs = Student.objects.select_related('user').prefetch_related('groups').all()
    if request.user.is_authenticated and request.user.role == 'teacher':
        qs = qs.filter(groups__teacher=request.user).distinct()
    data = []
    for s in qs:
        data.append({
            "id": s.id,
            "full_name": _user_display_name(s.user),
            "group_ids": [g.id for g in s.groups.all()],
            "group_name": ", ".join([g.name for g in s.groups.all()]) if s.groups.exists() else "Guruhsiz",
            "student_id": s.student_id,
            "total_coins": s.total_coins,
        })
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_groups(request):
    if request.method == "GET":
        qs = Group.objects.all().prefetch_related('students__user')
        if request.user.is_authenticated and request.user.role == 'teacher':
            qs = qs.filter(teacher=request.user)
        groups = []
        for g in qs:
            students = [
                {"id": s.id, "name": s.user.get_full_name(), "student_id": s.student_id}
                for s in g.students.all()
            ]
            groups.append({
                'id': g.id,
                'name': g.name,
                'course': g.course.name if g.course else "Biriktirilmagan",
                'room': g.room.name if g.room else "Biriktirilmagan",
                'schedule_days': g.schedule_days,
                'start_time': g.start_time.strftime('%H:%M') if g.start_time else None,
                'end_time': g.end_time.strftime('%H:%M') if g.end_time else None,
                'status': g.get_status_display(),
                'start_date': g.start_date.isoformat() if g.start_date else None,
                'student_count': g.students.count(),
                'max_seats': g.max_seats,
                'teacher_name': g.teacher.get_full_name() if g.teacher else "Biriktirilmagan",
                'teacher_id': g.teacher.id if g.teacher else None,
                'students': students,
            })
        return JsonResponse(groups, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        from datetime import date
        teacher_id = data.get('teacher_id')
        teacher = CustomUser.objects.filter(id=teacher_id, role='teacher').first() if teacher_id else None
        
        course_id = data.get('course_id')
        course = Course.objects.filter(id=course_id).first() if course_id else None
        
        room_id = data.get('room_id')
        room = Room.objects.filter(id=room_id).first() if room_id else None

        st = data.get('start_time')
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
        return JsonResponse({"message": "Guruh qo'shildi", "id": group.id})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_admissions(request):
    if request.method == "GET":
        admissions = AdmissionRequest.objects.all().values('id', 'full_name', 'phone', 'course_name', 'status', 'message', 'created_at')
        return JsonResponse(list(admissions), safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        admission = AdmissionRequest.objects.create(
            full_name=data.get('full_name'),
            phone=data.get('phone', ''),
            course_name=data.get('course_name', ''),
            message=data.get('message', '')
        )
        return JsonResponse({"message": "Qabul qo'shildi", "id": admission.id})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_courses(request):
    if request.method == "GET":
        qs = Course.objects.all()
        data = [{"id": c.id, "name": c.name, "price_per_month": c.price_per_month} for c in qs]
        return JsonResponse(data, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        c = Course.objects.create(name=data.get('name'), price_per_month=data.get('price_per_month', 0))
        return JsonResponse({"message": "Kurs qo'shildi", "id": c.id})

@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_rooms(request):
    if request.method == "GET":
        qs = Room.objects.all()
        data = [{"id": r.id, "name": r.name, "capacity": r.capacity} for r in qs]
        return JsonResponse(data, safe=False)
    elif request.method == "POST":
        data = json.loads(request.body)
        r = Room.objects.create(name=data.get('name'), capacity=data.get('capacity', 20))
        return JsonResponse({"message": "Xona qo'shildi", "id": r.id})



def _get_student_grade_average(student):
    return round(student.grades.aggregate(avg=Avg('grade'))['avg'] or 0, 2)


def _get_student_attendance_percentage(student):
    attendances = student.attendances.all()
    total_attendance = attendances.count()
    if total_attendance == 0:
        return 0

    attended_days = attendances.filter(status__in=['present', 'late']).count()
    return round((attended_days / total_attendance) * 100, 1)


def _get_student_rank(student):
    if not student.group:
        return None, 0

    group_students = list(
        Student.objects.filter(group=student.group).select_related('user').order_by('-total_coins', 'student_id')
    )
    for position, group_student in enumerate(group_students, start=1):
        if group_student.pk == student.pk:
            return position, len(group_students)

    return None, len(group_students)


def _get_student_dashboard_stats(student):
    grades = student.grades.all()
    attendances = student.attendances.all()

    if grades:
        avg_grade = _get_student_grade_average(student)
        highest_grade = max(grade.grade for grade in grades)
    else:
        avg_grade = highest_grade = 0

    total_days = attendances.count()
    if total_days > 0:
        present_days = attendances.filter(status='present').count()
        late_days = attendances.filter(status='late').count()
        absent_days = attendances.filter(status='absent').count()
        attendance_rate = _get_student_attendance_percentage(student)
    else:
        present_days = late_days = absent_days = attendance_rate = 0

    return {
        'avg_grade': avg_grade,
        'highest_grade': highest_grade,
        'total_days': total_days,
        'present_days': present_days,
        'late_days': late_days,
        'absent_days': absent_days,
        'attendance_rate': attendance_rate,
    }


@login_required
def profile_view(request):
    student = getattr(request.user, 'student_profile', None)
    dashboard_stats = _get_student_dashboard_stats(student) if student else None
    student_position, total_students = _get_student_rank(student) if student else (None, 0)

    return render(request, 'account/profile.html', {
        'student': student,
        'dashboard_stats': dashboard_stats,
        'student_position': student_position,
        'total_students': total_students,
    })


@login_required
def account_settings_view(request):
    if request.method == 'POST':
        form = AccountSettingsForm(request.POST, request.FILES, instance=request.user)
        if form.is_valid():
            form.save()
            messages.success(request, 'Sozlamalar saqlandi!')
            return redirect('account_settings')
    else:
        form = AccountSettingsForm(instance=request.user)

    return render(request, 'account/settings.html', {'form': form})


def _generate_unique_student_id():
    student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
    while Student.objects.filter(student_id=student_id).exists():
        student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
    return student_id


def _generate_unique_username_from_name(full_name):
    cleaned = ''.join(ch for ch in full_name.lower() if ch.isalnum() or ch == ' ')
    base = ''.join(cleaned.split())[:12] or 'student'
    username = base
    suffix = 1
    while CustomUser.objects.filter(username=username).exists():
        username = f"{base}{suffix}"
        suffix += 1
    return username

def home(request):
    if request.user.is_authenticated:
        return redirect('dashboard')

    if request.method == 'POST':
        post_data = request.POST.copy()
        if not post_data.get('course_name'):
            post_data['course_name'] = 'General English'
        if not post_data.get('level'):
            post_data['level'] = 'beginner'
        form = AdmissionRequestForm(post_data)
        if form.is_valid():
            admission_request = form.save(commit=False)
            admission_request.source = request.GET.get('source', 'website')
            admission_request.save()
            messages.success(request, "So'rovingiz yuborildi! Tez orada admin siz bilan bog'lanadi.")
            return redirect('home')
    else:
        form = AdmissionRequestForm()

    context = {
        'admission_form': form,
        'courses': [
            {
                'title': 'Ingliz tili',
                'duration': '6 oy',
                'price': '700 000 so\'m / oy',
                'content': 'Grammar, speaking, listening, writing, vocabulary',
                'result': 'CEFR bo\'yicha kamida B2 daraja',
            },
            {
                'title': 'Arab tili',
                'duration': '6 oy',
                'price': '750 000 so\'m / oy',
                'content': 'Qiroat, nahv-sarf asoslari, muloqot, matn bilan ishlash',
                'result': 'Asosiy matnlarni erkin o\'qish va tushunish',
            },
            {
                'title': 'Matematika',
                'duration': '5 oy',
                'price': '650 000 so\'m / oy',
                'content': 'Maktab + kirish imtihoni masalalari',
                'result': 'Imtihonlarga puxta tayyorgarlik',
            },
            {
                'title': 'Biologiya',
                'duration': '4 oy',
                'price': '680 000 so\'m / oy',
                'content': 'Nazariya + test yechish + sxema va jadval asosida tushuntirish',
                'result': 'Fan bo\'yicha barqaror yuqori natija',
            },
            {
                'title': 'Tarix',
                'duration': '4 oy',
                'price': '620 000 so\'m / oy',
                'content': 'Mualliflik konspektlari, test strategiyasi, xronologik tahlil',
                'result': 'Kirish imtihonlarida yuqori ball',
            },
            {
                'title': 'IT yo\'nalishlari',
                'duration': '4-8 oy',
                'price': '850 000 so\'m / oy dan',
                'content': 'Python, Frontend, algoritm, amaliy mini-loyihalar',
                'result': 'Portfolio va real project tajribasi',
            },
        ],
        'stats': {
            'active_students': '1 500+',
            'experience_years': '5+',
            'teachers': '20+',
            'certificates': '1 200+',
        },
        'teachers': [
            {'name': 'Aziza Karimova', 'bio': 'IELTS 8.0, 7+ yil tajriba, speaking coach.'},
            {'name': 'Bekzod Tursunov', 'bio': 'CEFR specialist, zamonaviy dars metodikasi bo\'yicha mentor.'},
            {'name': 'Nodira Usmonova', 'bio': 'Akademik writing va grammar bo\'yicha kuchli tajriba.'},
        ],
        'testimonials': [
            {'name': 'Madinabonu A.', 'text': '3 oyda speaking darajam sezilarli oshdi. Darslar juda tushunarli.'},
            {'name': 'Jahongir T.', 'text': 'IELTS uchun berilgan strategiyalar imtihonda juda qo\'l keldi.'},
            {'name': 'Shaxzod M.', 'text': 'Tartibli tizim va nazorat sabab darsni tashlab qo\'ymasdan davom etdim.'},
        ],
        'schedules': [
            'Ertalabgi - 9:00-10:30 / 10:30-12:00',
            'Kechgi - 14:30-16:00 / 16:00-17:30 / 17:30-19:00',
        ],
        'faqs': [
            {
                'q': 'Qaysi darajadan boshlash mumkin?',
                'a': 'Boshlang\'ichdan advancedgacha guruhlar mavjud. Diagnostika asosida mos guruh tavsiya qilinadi.'
            },
            {
                'q': 'Darslar qanday formatda bo\'ladi?',
                'a': 'Asosan offline, ammo ayrim kurslarda online qo\'shimcha darslar ham beriladi.'
            },
            {
                'q': 'Qabul jarayoni qanday?',
                'a': 'Saytdagi forma orqali so\'rov yuborasiz, mutaxassislar siz bilan bog\'lanib darajani aniqlaydi.'
            },
        ],
        'latest_news': Message.objects.filter(
            sender__role='admin',
            message_type__in=['news', 'announcement'],
            is_active=True
        ).select_related('sender').order_by('-date')[:3],
    }
    return render(request, 'home.html', context)

def login_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        
        if user is not None:
            login(request, user)
            messages.success(request, f'Xush kelibsiz, {user.get_full_name()}!')
            return redirect('dashboard')
        else:
            messages.error(request, 'Foydalanuvchi nomi yoki parol xato!')
    
    return render(request, 'auth/login.html')

def register_view(request):
    if request.user.is_authenticated:
        return redirect('dashboard')
    
    if request.method == 'POST':
        username = request.POST.get('username')
        email = request.POST.get('email')
        first_name = request.POST.get('first_name')
        last_name = request.POST.get('last_name')
        phone = request.POST.get('phone')
        password1 = request.POST.get('password1')
        password2 = request.POST.get('password2')
        role = request.POST.get('role', 'student')
        
        if password1 != password2:
            messages.error(request, 'Parollar mos kelmadi!')
            return render(request, 'auth/register.html')
        
        if CustomUser.objects.filter(username=username).exists():
            messages.error(request, 'Bu foydalanuvchi nomi band!')
            return render(request, 'auth/register.html')
        
        if CustomUser.objects.filter(email=email).exists():
            messages.error(request, 'Bu email allaqachon ro\'yxatdan o\'tgan!')
            return render(request, 'auth/register.html')
        
        user = CustomUser.objects.create_user(
            username=username,
            email=email,
            password=password1,
            first_name=first_name,
            last_name=last_name,
            phone=phone,
            role=role if role in ['student', 'teacher'] else 'student'
        )
        
        if user.role == 'student':
            student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
            while Student.objects.filter(student_id=student_id).exists():
                student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
            
            Student.objects.create(
                user=user,
                student_id=student_id
            )
        
        login(request, user)
        messages.success(request, 'Ro\'yxatdan muvaffaqiyatli o\'tdingiz!')
        return redirect('dashboard')
    
    return render(request, 'auth/register.html')

def logout_view(request):
    logout(request)
    messages.info(request, 'Tizimdan chiqdingiz.')
    return redirect('login')

@login_required
def dashboard(request):
    if request.user.role == 'admin':
        return redirect('admin_dashboard')
    elif request.user.role == 'teacher':
        return redirect('teacher_dashboard')
    elif request.user.role == 'student':
        return redirect('student_dashboard')
    return render(request, 'dashboard.html')

# Admin Views
@admin_required
def admin_dashboard(request):
    top_students = Student.objects.select_related('user').order_by('-total_coins')[:3]
    context = {
        'total_users': CustomUser.objects.count(),
        'total_students': Student.objects.count(),
        'total_teachers': CustomUser.objects.filter(role='teacher').count(),
        'total_groups': Group.objects.count(),
        'total_coins': Student.objects.aggregate(Sum('total_coins'))['total_coins__sum'] or 0,
        'total_messages': Message.objects.count(),
        'total_tests': Test.objects.count(),
        'top_students': top_students,
    }
    return render(request, 'admin_dashboard/dashboard.html', context)

@admin_required
def admin_students_statistics(request):
    """Barcha o'quvchilar statistikasi"""
    students = Student.objects.select_related('user', 'group').all()
    
    students_data = []
    for student in students:
        grades = student.grades.all()
        attendances = student.attendances.all()
        
        # Baholar
        if grades:
            avg_grade = sum(g.grade for g in grades) / len(grades)
        else:
            avg_grade = 0
        
        # Davomat
        total_days = attendances.count()
        if total_days > 0:
            present_days = attendances.filter(status='present').count()
            attendance_rate = round((present_days / total_days) * 100, 1)
        else:
            attendance_rate = 0
        
        students_data.append({
            'student': student,
            'avg_grade': round(avg_grade, 2),
            'total_grades': grades.count(),
            'total_coins': student.total_coins,
            'attendance_rate': attendance_rate,
            'total_attendance': total_days,
        })
    
    context = {
        'students_data': students_data,
    }
    return render(request, 'admin_dashboard/students_statistics.html', context)

@admin_required
def admin_message_create(request):
    """Admin xabar yuborish"""
    from .forms import MessageForm
    import logging
    logger = logging.getLogger(__name__)
    
    all_groups = Group.objects.all()
    
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            content_summary = ' '.join(message.content.split())
            if len(content_summary) > 60:
                content_summary = content_summary[:57].rstrip() + '...'
            message_type_label = dict(Message.MESSAGE_TYPE_CHOICES).get(
                form.cleaned_data['message_type'],
                'Xabar'
            )
            message.title = f'{message_type_label}: {content_summary}' if content_summary else message_type_label
            message.save()
            messages.success(request, 'Xabar yuborildi!')
            
            # Telegram notification yuborish - TO'LIQ MATN BILAN
            try:
                from telegram_bot.utils import notify_new_message
                if message.group:
                    notify_new_message(
                        group_id=message.group.id,
                        message_title=message.title,
                        message_content=message.content  # TO'LIQ MATN!
                    )
            except Exception as e:
                logger.error(f"Failed to send Telegram notification: {e}")
            
            return redirect('admin_dashboard')
    else:
        form = MessageForm()
        form.fields['group'].queryset = all_groups
    
    return render(request, 'admin_dashboard/message_form.html', {'form': form})

@admin_required
def admin_coins_reset(request):
    all_groups = Group.objects.all()
    
    if request.method == 'POST':
        group_id = request.POST.get('group')
        
        if group_id:
            # Reset coins for specific group
            group = Group.objects.get(id=group_id)
            students = Student.objects.filter(group=group)
            
            # Delete all coin transactions for these students
            for student in students:
                student.coin_transactions.all().delete()
                student.total_coins = 0
                student.save()
            
            messages.success(request, f'{group.name} guruhidagi barcha o\'quvchilarning coinslari tozalandi!')
        else:
            # Reset coins for all students
            students = Student.objects.all()
            
            for student in students:
                student.coin_transactions.all().delete()
                student.total_coins = 0
                student.save()
            
            messages.success(request, 'Barcha o\'quvchilarning coinslari tozalandi!')
        
        return redirect('admin_dashboard')
    
    context = {
        'groups': all_groups,
    }
    return render(request, 'admin_dashboard/coins_reset.html', context)

@admin_required
def admin_users_list(request):
    users = CustomUser.objects.all().order_by('-date_joined')
    selected_role = request.GET.get('role', '')
    role_choices = CustomUser.ROLE_CHOICES
    
    if selected_role:
        users = users.filter(role=selected_role)
    
    context = {
        'users': users,
        'role_choices': role_choices,
        'selected_role': selected_role
    }
    return render(request, 'admin_dashboard/users_list.html', context)


@admin_required
def admin_admission_requests(request):
    status_filter = request.GET.get('status', '')
    requests_qs = AdmissionRequest.objects.select_related('assigned_group', 'processed_by').all()

    if status_filter:
        requests_qs = requests_qs.filter(status=status_filter)

    context = {
        'requests': requests_qs,
        'status_filter': status_filter,
        'status_choices': AdmissionRequest.STATUS_CHOICES,
    }
    return render(request, 'admin_dashboard/admission_requests.html', context)


@admin_required
def admin_admission_request_approve(request, request_id):
    admission = get_object_or_404(AdmissionRequest, id=request_id)

    if admission.status == 'approved':
        messages.info(request, "Bu so'rov allaqachon qabul qilingan.")
        return redirect('admin_admission_requests')

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

    messages.success(
        request,
        f"So'rov qabul qilindi. Login: {username} | Vaqtinchalik parol: {password}"
    )
    return redirect('admin_admission_requests')


@admin_required
def admin_admission_request_reject(request, request_id):
    admission = get_object_or_404(AdmissionRequest, id=request_id)
    admission.status = 'rejected'
    admission.processed_by = request.user
    admission.processed_at = timezone.now()
    admission.save()
    messages.warning(request, "So'rov rad etildi.")
    return redirect('admin_admission_requests')

@admin_required
def admin_user_create(request):
    if request.method == 'POST':
        form = CustomUserCreationForm(request.POST)
        if form.is_valid():
            user = form.save()
            if user.role == 'student':
                student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
                while Student.objects.filter(student_id=student_id).exists():
                    student_id = 'STD' + ''.join(random.choices(string.digits, k=6))
                
                group = form.cleaned_data.get('group')
                Student.objects.create(
                    user=user, 
                    student_id=student_id,
                    group=group
                )
            messages.success(request, f'{user.get_full_name()} muvaffaqiyatli yaratildi!')
            return redirect('admin_users_list')
    else:
        form = CustomUserCreationForm()
    return render(request, 'admin_dashboard/user_form.html', {'form': form, 'action': 'Yaratish'})

@admin_required
def admin_user_detail(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    selected_role = request.GET.get('role', '')
    student = None
    if user.role == 'student':
        try:
            student = Student.objects.get(user=user)
        except:
            pass
    
    context = {
        'user_obj': user,
        'student': student,
        'selected_role': selected_role,
    }
    return render(request, 'admin_dashboard/user_detail.html', context)

@admin_required
def admin_user_edit(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    if request.method == 'POST':
        form = CustomUserEditForm(request.POST, instance=user)
        if form.is_valid():
            password = form.cleaned_data.get('password')
            form.save()
            if password:
                messages.success(request, f'{user.get_full_name()} tahrirlandi! Parol yangilandi.')
            else:
                messages.success(request, f'{user.get_full_name()} tahrirlandi!')
            return redirect('admin_users_list')
    else:
        form = CustomUserEditForm(instance=user)
    return render(request, 'admin_dashboard/user_form.html', {'form': form, 'action': 'Tahrirlash', 'user_obj': user})

@admin_required
def admin_user_delete(request, user_id):
    user = CustomUser.objects.get(id=user_id)
    if request.method == 'POST':
        user.delete()
        messages.success(request, 'Foydalanuvchi o\'chirildi!')
        return redirect('admin_users_list')
    return render(request, 'admin_dashboard/user_confirm_delete.html', {'user_obj': user})

@admin_required
def admin_groups_list(request):
    groups = Group.objects.all().order_by('-created_at')
    context = {'groups': groups}
    return render(request, 'admin_dashboard/groups_list.html', context)

@admin_required
def admin_group_create(request):
    if request.method == 'POST':
        form = GroupForm(request.POST)
        if form.is_valid():
            group = form.save()
            messages.success(request, f'{group.name} guruhi yaratildi!')
            return redirect('admin_groups_list')
    else:
        form = GroupForm()
    return render(request, 'admin_dashboard/group_form.html', {'form': form, 'action': 'Yaratish'})

@admin_required
def admin_group_edit(request, group_id):
    group = Group.objects.get(id=group_id)
    if request.method == 'POST':
        form = GroupForm(request.POST, instance=group)
        if form.is_valid():
            form.save()
            messages.success(request, f'{group.name} tahrirlandi!')
            return redirect('admin_groups_list')
    else:
        form = GroupForm(instance=group)
    return render(request, 'admin_dashboard/group_form.html', {'form': form, 'action': 'Tahrirlash', 'group': group})

@admin_required
def admin_group_delete(request, group_id):
    group = Group.objects.get(id=group_id)
    if request.method == 'POST':
        group.delete()
        messages.success(request, 'Guruh o\'chirildi!')
        return redirect('admin_groups_list')
    return render(request, 'admin_dashboard/group_confirm_delete.html', {'group': group})

# Teacher Views
@teacher_required
def teacher_dashboard(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    total_given_coins = CoinTransaction.objects.filter(given_by=request.user, amount__gt=0).aggregate(total=Sum('amount'))['total'] or 0
    context = {
        'groups': teacher_groups,
        'total_groups': teacher_groups.count(),
        'total_students': Student.objects.filter(group__in=teacher_groups).count(),
        'total_given_coins': total_given_coins,
    }
    return render(request, 'teacher/dashboard.html', context)


@teacher_required
def teacher_group_detail(request, group_id):
    group = get_object_or_404(Group, id=group_id, teacher=request.user)
    students = Student.objects.filter(group=group).select_related('user').order_by('-total_coins', 'student_id')
    context = {
        'group': group,
        'students': students,
    }
    return render(request, 'teacher/group_detail.html', context)

@teacher_required
def teacher_students_analytics(request):
    """O'quvchilarni baholari bo'yicha tahlil qilish"""
    teacher_groups = Group.objects.filter(teacher=request.user)
    students = Student.objects.filter(group__in=teacher_groups).select_related('user', 'group')
    
    students_data = []
    for student in students:
        grades = student.grades.all()
        if grades:
            avg_grade = sum(g.grade for g in grades) / len(grades)
            
            # Baho kategoriyasi
            if avg_grade >= 86:
                category = 'excellent'  # 5 (A'lo)
                category_name = "A'lo (5)"
                badge_class = 'success'
            elif avg_grade >= 71:
                category = 'good'  # 4 (Yaxshi)
                category_name = 'Yaxshi (4)'
                badge_class = 'primary'
            elif avg_grade >= 56:
                category = 'satisfactory'  # 3 (Qoniqarli)
                category_name = 'Qoniqarli (3)'
                badge_class = 'warning'
            else:
                category = 'poor'  # 2 (Qoniqarsiz)
                category_name = 'Qoniqarsiz (2)'
                badge_class = 'danger'
            
            students_data.append({
                'student': student,
                'avg_grade': round(avg_grade, 2),
                'category': category,
                'category_name': category_name,
                'badge_class': badge_class,
                'total_grades': grades.count(),
            })
    
    # Kategoriyalar bo'yicha guruplash
    excellent_students = [s for s in students_data if s['category'] == 'excellent']
    good_students = [s for s in students_data if s['category'] == 'good']
    satisfactory_students = [s for s in students_data if s['category'] == 'satisfactory']
    poor_students = [s for s in students_data if s['category'] == 'poor']
    
    context = {
        'students_data': students_data,
        'excellent_students': excellent_students,
        'good_students': good_students,
        'satisfactory_students': satisfactory_students,
        'poor_students': poor_students,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/students_analytics.html', context)

@teacher_required
def teacher_attendance_list(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    attendances = Attendance.objects.filter(group__in=teacher_groups).order_by('-date')[:50]
    context = {
        'attendances': attendances,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/attendance_list.html', context)

@teacher_required
def teacher_attendance_create(request):
    from .forms import AttendanceForm
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    if request.method == 'POST':
        form = AttendanceForm(request.POST)
        if form.is_valid():
            attendance = form.save(commit=False)
            attendance.teacher = request.user
            attendance.save()
            messages.success(request, 'Davomat saqlandi!')
            return redirect('teacher_attendance_list')
    else:
        form = AttendanceForm()
        form.fields['group'].queryset = teacher_groups
        form.fields['student'].queryset = Student.objects.filter(group__in=teacher_groups)
    
    return render(request, 'teacher/attendance_form.html', {'form': form})

@teacher_required
def teacher_attendance_quick(request):
    """Tez davomat - rangli tugmalar bilan"""
    teacher_groups = Group.objects.filter(teacher=request.user)
    context = {
        'groups': teacher_groups,
        'today': date.today().strftime('%Y-%m-%d'),
    }
    return render(request, 'teacher/attendance_quick.html', context)

@teacher_required
def teacher_attendance_quick_students(request, group_id):
    """Guruh o'quvchilarini olish (AJAX)"""
    try:
        group = get_object_or_404(Group, id=group_id, teacher=request.user)
        students = Student.objects.filter(group=group).select_related('user')
        
        students_data = [
            {
                'id': student.id,
                'name': student.user.get_full_name(),
                'student_id': student.student_id,
            }
            for student in students
        ]
        
        return JsonResponse({'success': True, 'students': students_data})
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)

@teacher_required
@require_http_methods(["POST"])
def teacher_attendance_quick_save(request):
    """Tez davomatni saqlash (AJAX)"""
    try:
        data = json.loads(request.body)
        group_id = data.get('group_id')
        date_str = data.get('date')
        attendances = data.get('attendances', [])
        
        if not group_id or not date_str:
            return JsonResponse({'success': False, 'error': 'Ma\'lumotlar to\'liq emas'}, status=400)
        
        group = get_object_or_404(Group, id=group_id, teacher=request.user)
        
        # Eski davomatlarni o'chirish (bir xil sana uchun)
        Attendance.objects.filter(group=group, date=date_str).delete()
        
        # Yangi davomatlarni saqlash
        for att_data in attendances:
            student = get_object_or_404(Student, id=att_data['id'])
            Attendance.objects.create(
                student=student,
                group=group,
                teacher=request.user,
                date=date_str,
                status=att_data['status']
            )
        
        return JsonResponse({
            'success': True, 
            'message': f'{len(attendances)} ta davomat saqlandi'
        })
    except Exception as e:
        return JsonResponse({'success': False, 'error': str(e)}, status=400)


@teacher_required
def teacher_grading_list(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    grades = Grade.objects.filter(teacher=request.user).order_by('-date')[:50]
    context = {
        'grades': grades,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/grading_list.html', context)

@teacher_required
def teacher_grading_create(request):
    from .forms import GradeForm
    teacher_groups = Group.objects.filter(teacher=request.user)

    if request.method == 'POST':
        form = GradeForm(request.POST)
        if form.is_valid():
            grade = form.save(commit=False)
            grade.teacher = request.user
            grade.subject = grade.student.group.name if grade.student.group else "Umumiy"
            grade.save()
            messages.success(request, 'Baho qo\'yildi!')
            return redirect('teacher_grading_list')
    else:
        form = GradeForm()
        form.fields['student'].queryset = Student.objects.filter(group__in=teacher_groups)

    return render(request, 'teacher/grading_form.html', {'form': form})

@teacher_required
def teacher_coins_list(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    transactions = CoinTransaction.objects.filter(given_by=request.user).order_by('-date')[:50]
    context = {
        'transactions': transactions,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/coins_list.html', context)

@teacher_required
def teacher_coins_give(request):
    from .forms import CoinTransactionForm
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    if request.method == 'POST':
        form = CoinTransactionForm(request.POST)
        if form.is_valid():
            transaction = form.save(commit=False)
            transaction.given_by = request.user
            transaction.save()
            messages.success(request, f'{transaction.amount} coins berildi!')
            
            # Telegram notification yuborish
            try:
                from telegram_bot.utils import notify_new_coins
                notify_new_coins(
                    student_id=transaction.student.id,
                    amount=transaction.amount,
                    reason=transaction.reason
                )
            except Exception as e:
                logger.error(f"Failed to send Telegram notification: {e}")
            
            return redirect('teacher_coins_list')
    else:
        form = CoinTransactionForm()
        form.fields['student'].queryset = Student.objects.filter(group__in=teacher_groups)
    
    return render(request, 'teacher/coins_form.html', {'form': form})

@teacher_required
def teacher_coins_reset(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    if request.method == 'POST':
        group_id = request.POST.get('group')
        
        if group_id:
            # Reset coins for specific group
            group = Group.objects.get(id=group_id, teacher=request.user)
            students = Student.objects.filter(group=group)
            
            # Delete all coin transactions for these students
            for student in students:
                student.coin_transactions.all().delete()
                student.total_coins = 0
                student.save()
            
            messages.success(request, f'{group.name} guruhidagi barcha o\'quvchilarning coinslari tozalandi!')
        else:
            # Reset coins for all students in teacher's groups
            students = Student.objects.filter(group__in=teacher_groups)
            
            for student in students:
                student.coin_transactions.all().delete()
                student.total_coins = 0
                student.save()
            
            messages.success(request, 'Barcha guruhlaringiz o\'quvchilarining coinslari tozalandi!')
        
        return redirect('teacher_coins_list')
    
    context = {
        'groups': teacher_groups,
    }
    return render(request, 'teacher/coins_reset.html', context)

@teacher_required
def teacher_top_students(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    # Top students by coins in each group
    top_students_by_group = {}
    for group in teacher_groups:
        top_students_by_group[group] = Student.objects.filter(group=group).order_by('-total_coins')[:3]
    
    context = {
        'top_students_by_group': top_students_by_group,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/top_students.html', context)

@teacher_required
def teacher_messages_list(request):
    messages_list = Message.objects.filter(sender=request.user).order_by('-date')
    context = {'messages_list': messages_list}
    return render(request, 'teacher/messages_list.html', context)

@teacher_required
def teacher_message_create(request):
    from .forms import MessageForm
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    if request.method == 'POST':
        form = MessageForm(request.POST)
        if form.is_valid():
            message = form.save(commit=False)
            message.sender = request.user
            content_summary = ' '.join(message.content.split())
            if len(content_summary) > 60:
                content_summary = content_summary[:57].rstrip() + '...'
            message_type_label = dict(Message.MESSAGE_TYPE_CHOICES).get(
                form.cleaned_data['message_type'],
                'Xabar'
            )
            message.title = f'{message_type_label}: {content_summary}' if content_summary else message_type_label
            message.save()
            messages.success(request, 'Xabar yuborildi!')
            
            # Telegram notification yuborish - TO'LIQ MATN BILAN
            try:
                from telegram_bot.utils import notify_new_message
                if message.group:
                    notify_new_message(
                        group_id=message.group.id,
                        message_title=message.title,
                        message_content=message.content  # TO'LIQ MATN!
                    )
            except Exception as e:
                logger.error(f"Failed to send Telegram notification: {e}")
            
            return redirect('teacher_messages_list')
    else:
        form = MessageForm()
        form.fields['group'].queryset = teacher_groups
    
    return render(request, 'teacher/message_form.html', {'form': form})

@teacher_required
def teacher_message_delete(request, message_id):
    """Xabarni o'chirish"""
    message = get_object_or_404(Message, id=message_id, sender=request.user)
    
    if request.method == 'POST':
        message.delete()
        messages.success(request, 'Xabar o\'chirildi!')
        return redirect('teacher_messages_list')
    
    return render(request, 'teacher/message_confirm_delete.html', {'message_obj': message})

@teacher_required
def teacher_attendance_delete(request, attendance_id):
    """Davomatni o'chirish"""
    teacher_groups = Group.objects.filter(teacher=request.user)
    attendance = get_object_or_404(Attendance, id=attendance_id, group__in=teacher_groups)
    
    if request.method == 'POST':
        attendance.delete()
        messages.success(request, 'Davomat o\'chirildi!')
        return redirect('teacher_attendance_list')
    
    return render(request, 'teacher/attendance_confirm_delete.html', {'attendance': attendance})

@teacher_required
def teacher_grade_delete(request, grade_id):
    """Bahoni o'chirish"""
    grade = get_object_or_404(Grade, id=grade_id, teacher=request.user)
    
    if request.method == 'POST':
        grade.delete()
        messages.success(request, 'Baho o\'chirildi!')
        return redirect('teacher_grading_list')
    
    return render(request, 'teacher/grade_confirm_delete.html', {'grade': grade})


@teacher_required
def teacher_tests_list(request):
    teacher_groups = Group.objects.filter(teacher=request.user)
    tests = Test.objects.filter(teacher=request.user).order_by('-created_at')
    context = {
        'tests': tests,
        'groups': teacher_groups,
    }
    return render(request, 'teacher/tests_list.html', context)

@teacher_required
def teacher_test_create(request):
    from .forms import TestForm, QuestionForm
    from django.forms import formset_factory
    
    QuestionFormSet = formset_factory(QuestionForm, extra=5)
    teacher_groups = Group.objects.filter(teacher=request.user)
    
    if request.method == 'POST':
        test_form = TestForm(request.POST)
        question_formset = QuestionFormSet(request.POST, prefix='questions')
        
        if test_form.is_valid() and question_formset.is_valid():
            test = test_form.save(commit=False)
            test.teacher = request.user
            test.save()
            
            # Save questions
            order = 1
            for question_form in question_formset:
                if question_form.cleaned_data and question_form.cleaned_data.get('question_text'):
                    question = question_form.save(commit=False)
                    question.test = test
                    question.order = order
                    question.save()
                    order += 1
            
            # Calculate total marks
            test.total_marks = test.calculate_total_marks()
            test.save()
            
            messages.success(request, 'Test yaratildi!')
            return redirect('teacher_tests_list')
    else:
        test_form = TestForm()
        test_form.fields['group'].queryset = teacher_groups
        question_formset = QuestionFormSet(prefix='questions')
    
    return render(request, 'teacher/test_form.html', {
        'test_form': test_form,
        'question_formset': question_formset,
    })

# Student Views
@student_required
def student_dashboard(request):
    try:
        student = request.user.student_profile
        dashboard_stats = _get_student_dashboard_stats(student)
        student_position, total_students = _get_student_rank(student)
        context = {
            'student': student,
            'total_coins': student.total_coins,
            'student_position': student_position,
            'total_students': total_students,
            'dashboard_stats': dashboard_stats,
            'recent_grades': student.grades.order_by('-date', '-created_at')[:3],
            'recent_attendance': student.attendances.order_by('-date', '-created_at')[:3],
        }
    except:
        context = {}
    return render(request, 'student/dashboard.html', context)

@student_required
def student_grades_view(request):
    try:
        student = request.user.student_profile
        grades = student.grades.all().order_by('-date')
        avg_grade = _get_student_grade_average(student)
        
        context = {
            'student': student,
            'grades': grades,
            'avg_grade': avg_grade,
        }
    except:
        context = {}
    return render(request, 'student/grades_view.html', context)

@student_required
def student_coins_view(request):
    try:
        student = request.user.student_profile
        transactions = student.coin_transactions.all().order_by('-date')
        
        context = {
            'student': student,
            'total_coins': student.total_coins,
            'transactions': transactions,
        }
    except:
        context = {}
    return render(request, 'student/coins_view.html', context)

@student_required
def student_attendance_view(request):
    try:
        student = request.user.student_profile
        attendances = student.attendances.all().order_by('-date')
        attendance_percentage = _get_student_attendance_percentage(student)
        
        context = {
            'student': student,
            'attendances': attendances,
            'attendance_percentage': attendance_percentage,
        }
    except:
        context = {}
    return render(request, 'student/attendance_view.html', context)

@student_required
def student_statistics(request):
    try:
        student = request.user.student_profile
        grades = student.grades.all()
        attendances = student.attendances.all()
        
        # Grade statistics
        if grades:
            avg_grade = _get_student_grade_average(student)
            highest_grade = max(g.grade for g in grades)
            lowest_grade = min(g.grade for g in grades)
        else:
            avg_grade = highest_grade = lowest_grade = 0
        
        # Attendance statistics
        total_days = attendances.count()
        if total_days > 0:
            present_days = attendances.filter(status='present').count()
            late_days = attendances.filter(status='late').count()
            absent_days = attendances.filter(status='absent').count()
            attendance_rate = _get_student_attendance_percentage(student)
        else:
            present_days = late_days = absent_days = attendance_rate = 0
        
        context = {
            'student': student,
            'avg_grade': round(avg_grade, 2),
            'highest_grade': highest_grade,
            'lowest_grade': lowest_grade,
            'total_days': total_days,
            'present_days': present_days,
            'late_days': late_days,
            'absent_days': absent_days,
            'attendance_rate': attendance_rate,
        }
    except:
        context = {}
    return render(request, 'student/statistics.html', context)

@student_required
def student_leaderboard(request):
    try:
        student = request.user.student_profile
        if student.group:
            # Top 3 students in the same group
            top_students = Student.objects.filter(group=student.group).order_by('-total_coins')[:3]
            
            # Current student position
            all_students = list(Student.objects.filter(group=student.group).order_by('-total_coins'))
            student_position = all_students.index(student) + 1 if student in all_students else None
            
            context = {
                'student': student,
                'top_students': top_students,
                'student_position': student_position,
                'total_students': len(all_students),
            }
        else:
            context = {'student': student}
    except:
        context = {}
    return render(request, 'student/leaderboard.html', context)

@student_required
def student_messages_view(request):
    try:
        student = request.user.student_profile
        # Messages for student's group or all groups (group=None)
        if student.group:
            messages_list = Message.objects.filter(
                Q(group=student.group) | Q(group=None),
                is_active=True
            ).order_by('-date')
        else:
            messages_list = Message.objects.filter(group=None, is_active=True).order_by('-date')
        
        context = {
            'student': student,
            'messages_list': messages_list,
        }
    except:
        context = {}
    return render(request, 'student/messages_view.html', context)

@student_required
def student_tests_list(request):
    try:
        student = request.user.student_profile
        if student.group:
            # Available tests for student's group
            tests = Test.objects.filter(group=student.group, is_active=True).order_by('-created_at')
            
            # Check which tests are already submitted
            for test in tests:
                try:
                    submission = TestSubmission.objects.get(test=test, student=student)
                    test.submitted = True
                    test.score = submission.score
                except TestSubmission.DoesNotExist:
                    test.submitted = False
            
            context = {
                'student': student,
                'tests': tests,
            }
        else:
            context = {'student': student}
    except:
        context = {}
    return render(request, 'student/tests_list.html', context)

@student_required
def student_test_take(request, test_id):
    try:
        student = request.user.student_profile
        test = Test.objects.get(id=test_id, group=student.group, is_active=True)
        
        # Check if already submitted
        if TestSubmission.objects.filter(test=test, student=student).exists():
            messages.warning(request, 'Bu testni allaqachon topshirgansiz!')
            return redirect('student_tests_list')
        
        questions = test.questions.all().order_by('order')
        
        if request.method == 'POST':
            # Save submission
            answers = {}
            for question in questions:
                answer = request.POST.get(f'question_{question.id}')
                if answer:
                    answers[str(question.id)] = answer
            
            submission = TestSubmission.objects.create(
                test=test,
                student=student,
                answers=answers,
                is_completed=True
            )
            submission.calculate_score()
            
            messages.success(request, f'Test topshirildi! Ball: {submission.score}/{test.total_marks}')
            return redirect('student_tests_list')
        
        context = {
            'student': student,
            'test': test,
            'questions': questions,
        }
    except Test.DoesNotExist:
        messages.error(request, 'Test topilmadi!')
        return redirect('student_tests_list')
    except:
        context = {}
    
    return render(request, 'student/test_take.html', context)





# ================= NEW APIS =================

@csrf_exempt
@require_http_methods(["GET"])
def api_me(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated"}, status=401)

    user = request.user
    return JsonResponse({
        "id": user.id,
        "username": user.username,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "full_name": _user_display_name(user),
        "role": _user_role(user),
        "avatar": user.avatar.url if user.avatar else None,
        "phone": user.phone,
        "email": user.email,
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_account_settings(request):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authenticated"}, status=401)

    user = request.user
    
    # Check if request is JSON or Multipart
    if request.content_type == 'application/json':
        data = json.loads(request.body)
        user.first_name = data.get('first_name', user.first_name)
        user.last_name = data.get('last_name', user.last_name)
        user.phone = data.get('phone', user.phone)
        user.email = data.get('email', user.email)
    else:
        user.first_name = request.POST.get('first_name', user.first_name)
        user.last_name = request.POST.get('last_name', user.last_name)
        user.phone = request.POST.get('phone', user.phone)
        user.email = request.POST.get('email', user.email)
        if 'avatar' in request.FILES:
            user.avatar = request.FILES['avatar']

    user.save()

    return JsonResponse({
        "message": "Sozlamalar saqlandi",
        "id": user.id,
        "first_name": user.first_name,
        "last_name": user.last_name,
        "phone": user.phone,
        "email": user.email,
        "avatar": user.avatar.url if user.avatar else None
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_student_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    try:
        student = request.user.student_profile
    except Exception:
        return JsonResponse({
            "full_name": _user_display_name(request.user),
            "average_grade": 0,
            "attendance_rate": 0,
            "total_coins": 0,
            "rank": 0,
            "total_students": 0,
            "group_name": "Guruhsiz",
            "grades": [],
            "attendances": [],
        })
    avg_grade = _get_student_grade_average(student)
    attendance_rate = _get_student_attendance_percentage(student)

    position = 0
    total_students = 0
    student_groups = list(student.groups.all())
    
    if student_groups:
        main_group = student_groups[0]
        students_in_group = list(Student.objects.filter(groups=main_group).distinct())
        students_in_group.sort(key=lambda s: _get_student_grade_average(s), reverse=True)
        try:
            position = students_in_group.index(student) + 1
        except ValueError:
            position = 0
        total_students = len(students_in_group)

    recent_grades = list(
        student.grades.all().order_by('-date')[:3].values('subject', 'grade', 'date')
    )
    recent_attendances = list(
        student.attendances.all().order_by('-date')[:3].values('date', 'status', 'group__name')
    )

    return JsonResponse({
        "full_name": _user_display_name(request.user),
        "average_grade": avg_grade,
        "attendance_rate": attendance_rate,
        "total_coins": student.total_coins,
        "rank": position,
        "total_students": total_students,
                "group_name": ", ".join([g.name for g in student_groups]) if student_groups else "Guruhsiz",
        "schedule": " | ".join([f"{g.schedule_days} {g.start_time.strftime('%H:%M') if g.start_time else ''}-{g.end_time.strftime('%H:%M') if g.end_time else ''}" for g in student_groups if g.schedule_days]) if student_groups else "Belgilanmagan",

        "grades": recent_grades,
        "attendances": recent_attendances,
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_student_grades(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    grades = student.grades.all().order_by('-date').values(
        'id', 'subject', 'grade', 'date', 'teacher__first_name', 'teacher__last_name', 'comment'
    )
    return JsonResponse(list(grades), safe=False)


@csrf_exempt
@require_http_methods(["GET"])
def api_student_attendance(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    attendances = student.attendances.all().order_by('-date').values('date', 'status', 'group__name', 'note')
    return JsonResponse(list(attendances), safe=False)


@csrf_exempt
@require_http_methods(["GET"])
def api_student_coins(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    txs = student.coin_transactions.all().order_by('-date').values('amount', 'reason', 'date', 'given_by__first_name')
    return JsonResponse({"balance": student.total_coins, "transactions": list(txs)})


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_dashboard(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    teacher = request.user
    groups = teacher.teaching_groups.all()
    groups_count = groups.count()
    total_students = Student.objects.filter(groups__teacher=teacher).distinct().count()
    coins_given = CoinTransaction.objects.filter(given_by=teacher).aggregate(Sum('amount'))['amount__sum'] or 0

    groups_data = [
        {"id": g.id, "name": g.name, "student_count": g.students.count()}
        for g in groups
    ]

    students = list(Student.objects.filter(groups__teacher=teacher).select_related('user'))
    students.sort(key=lambda s: _get_student_grade_average(s))
    passive_students = [
        {
            "id": s.id,
            "name": _user_display_name(s.user),
            "avg": _get_student_grade_average(s),
        }
        for s in students[:3]
        if _get_student_grade_average(s) > 0
    ]

    active_students_list = sorted(students, key=lambda s: (_get_student_grade_average(s), s.total_coins), reverse=True)
    active_students = [
        {
            "id": s.id,
            "name": _user_display_name(s.user),
            "avg": _get_student_grade_average(s),
            "coins": s.total_coins,
        }
        for s in active_students_list[:3]
        if _get_student_grade_average(s) > 0 or s.total_coins > 0
    ]

    return JsonResponse({
        "total_groups": groups_count,
        "total_students": total_students,
        "total_given_coins": coins_given,
        "groups": groups_data,
        "passive_students": passive_students,
        "active_students": active_students,
    })


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_finance(request):
    from .models import Payment
    if request.method == "GET":
        payments = []
        for p in Payment.objects.select_related('student__user').all():
            payments.append({
                'id': p.id,
                'student_id': p.student_id,
                'student__user__first_name': p.student.user.first_name,
                'student__user__last_name': p.student.user.last_name,
                'amount': str(p.amount),
                'payment_method': p.payment_method,
                'description': p.description,
                'payment_date': p.payment_date.isoformat(),
            })
        return JsonResponse(payments, safe=False)
    elif request.method == "POST":
        if not request.user.is_authenticated or _user_role(request.user) != 'admin':
            return JsonResponse({"detail": "Not authorized"}, status=403)
        data = json.loads(request.body)
        student = Student.objects.get(id=data.get('student_id'))
        Payment.objects.create(
            student=student,
            amount=data.get('amount'),
            payment_method=data.get('payment_method', 'cash'),
            description=data.get('description', ''),
            processed_by=request.user,
        )
        return JsonResponse({"message": "To'lov saqlandi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_batch_grading(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    data = json.loads(request.body)
    grades = data.get('grades', [])
    subject = data.get('subject', 'Umumiy')
    saved = 0
    from telegram_bot.utils import notify_new_grade
    from datetime import datetime
    
    teacher_name = request.user.get_full_name() or request.user.username
    date_time = datetime.now().strftime('%d.%m.%Y %H:%M')
    
    for g in grades:
        if g.get('grade') is None:
            continue
        student = Student.objects.get(id=g['student_id'])
        group = student.groups.filter(teacher=request.user).first()
        if not group:
            continue
        
        subj = g.get('subject')
        if not subj:
            subj = group.course.name if group.course else group.name
            
        Grade.objects.create(
            student=student,
            subject=subj,
            grade=g['grade'],
            teacher=request.user,
            date=date.today(),
        )
        saved += 1
        # Send telegram notification
        notify_new_grade(
            student_id=student.id,
            subject=subj,
            grade=g['grade'],
            teacher_name=teacher_name,
            date_time=date_time
        )
        
    return JsonResponse({"message": f"{saved} ta baho saqlandi", "saved": saved})


@csrf_exempt
@require_http_methods(["POST"])
def api_batch_attendance(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    data = json.loads(request.body)
    group = Group.objects.get(id=data.get('group_id'))
    if group.teacher_id != request.user.id:
        return JsonResponse({"detail": "Not authorized"}, status=403)

    attendance_date = data.get('date') or date.today().isoformat()
    records = data.get('records', [])
    saved = 0
    
    from telegram_bot.utils import notify_attendance
    teacher_name = request.user.get_full_name() or request.user.username
    
    # Try to parse attendance_date format from YYYY-MM-DD to DD.MM.YYYY
    try:
        from datetime import datetime
        d_obj = datetime.strptime(attendance_date, "%Y-%m-%d")
        formatted_date = d_obj.strftime("%d.%m.%Y")
    except:
        formatted_date = attendance_date
        
    for record in records:
        if 'status' not in record:
            continue
        student = Student.objects.get(id=record['student_id'])
        Attendance.objects.update_or_create(
            student=student,
            date=attendance_date,
            defaults={
                'group': group,
                'status': record['status'],
                'note': record.get('note', ''),
                'teacher': request.user,
            },
        )
        saved += 1
        
        time_range = ""
        if group.start_time and group.end_time:
            time_range = f"{group.start_time.strftime('%H:%M')} - {group.end_time.strftime('%H:%M')}"
            
        notify_attendance(
            student_id=student.id,
            subject=group.course.name if group.course else group.name,
            teacher_name=teacher_name,
            date_str=formatted_date,
            status=record['status'],
            time_range=time_range
        )
            
    return JsonResponse({"message": f"{saved} ta davomat saqlandi", "saved": saved})


@csrf_exempt
@require_http_methods(["POST"])
def api_teacher_coins(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    data = json.loads(request.body)
    student = Student.objects.get(id=data.get('student_id'))
    if not student.groups.filter(teacher=request.user).exists():
        return JsonResponse({"detail": "Not authorized"}, status=403)
    amount = int(data.get('amount', 0))
    reason = data.get('reason', '').strip()
    if not amount or not reason:
        return JsonResponse({"detail": "Miqdor va sabab kerak"}, status=400)
    CoinTransaction.objects.create(
        student=student,
        amount=amount,
        reason=reason,
        given_by=request.user,
    )
    return JsonResponse({"message": "Coin berildi", "balance": student.total_coins})


@csrf_exempt
@require_http_methods(["GET"])
def api_student_tests(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    student_groups = student.groups.all()
    if not student_groups.exists():
        return JsonResponse([], safe=False)

    tests = Test.objects.filter(group__in=student_groups, is_active=True).order_by('-created_at')
    result = []
    for test in tests:
        submission = TestSubmission.objects.filter(test=test, student=student).first()
        result.append({
            'id': test.id,
            'title': test.title,
            'description': test.description,
            'duration': test.duration,
            'total_marks': test.total_marks,
            'deadline': test.deadline.isoformat() if test.deadline else None,
            'teacher__first_name': test.teacher.first_name,
            'teacher__last_name': test.teacher.last_name,
            'is_submitted': submission is not None,
            'score': submission.score if submission else None,
        })
    return JsonResponse(result, safe=False)


@csrf_exempt
@require_http_methods(["GET"])
def api_student_test_detail(request, test_id):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    try:
        test = Test.objects.get(id=test_id, group__in=student.groups.all(), is_active=True)
    except Test.DoesNotExist:
        return JsonResponse({"detail": "Test not found"}, status=404)
    if TestSubmission.objects.filter(test=test, student=student).exists():
        return JsonResponse({"detail": "Test allaqachon topshirilgan"}, status=400)

    questions = []
    for q in test.questions.all().order_by('order'):
        questions.append({
            'id': q.id,
            'question_text': q.question_text,
            'option_a': q.option_a,
            'option_b': q.option_b,
            'option_c': q.option_c,
            'option_d': q.option_d,
            'marks': q.marks,
            'order': q.order,
        })
    return JsonResponse({
        'id': test.id,
        'title': test.title,
        'description': test.description,
        'duration': test.duration,
        'total_marks': test.total_marks,
        'questions': questions,
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_student_test_submit(request, test_id):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    student = request.user.student_profile
    try:
        test = Test.objects.get(id=test_id, group__in=student.groups.all(), is_active=True)
    except Test.DoesNotExist:
        return JsonResponse({"detail": "Test not found"}, status=404)
    if TestSubmission.objects.filter(test=test, student=student).exists():
        return JsonResponse({"detail": "Test allaqachon topshirilgan"}, status=400)

    data = json.loads(request.body)
    answers = data.get('answers', {})
    submission = TestSubmission.objects.create(
        test=test,
        student=student,
        answers=answers,
        is_completed=True,
    )
    score = submission.calculate_score()
    return JsonResponse({
        "message": "Test topshirildi",
        "score": score,
        "total_marks": test.total_marks,
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_admin_dashboard(request):
    if not request.user.is_authenticated or _user_role(request.user) != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    from .models import Payment
    users = CustomUser.objects.all()
    students = Student.objects.select_related('user', 'group')
    teachers = users.filter(role='teacher')
    groups = Group.objects.all()

    top_coins = [
        {
            "name": _user_display_name(s.user),
            "group": s.group.name if s.group else "Guruhsiz",
            "coins": s.total_coins,
        }
        for s in students.order_by('-total_coins')[:3]
    ]

    ranked = sorted(
        [(s, _get_student_grade_average(s)) for s in students if _get_student_grade_average(s) > 0],
        key=lambda x: x[1],
        reverse=True,
    )
    top_grades = [
        {
            "name": _user_display_name(s.user),
            "group": s.group.name if s.group else "Guruhsiz",
            "average_grade": avg,
        }
        for s, avg in ranked[:3]
    ]

    recent_admissions = list(
        AdmissionRequest.objects.filter(status='new').order_by('-created_at')[:5].values(
            'full_name', 'course_name', 'status', 'message', 'created_at'
        )
    )

    total_revenue = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0

    return JsonResponse({
        "full_name": _user_display_name(request.user),
        "total_users": users.count(),
        "total_students": students.count(),
        "total_teachers": teachers.count(),
        "total_groups": groups.count(),
        "total_coins": students.aggregate(Sum('total_coins'))['total_coins__sum'] or 0,
        "new_admissions": AdmissionRequest.objects.filter(status='new').count(),
        "total_revenue": str(total_revenue),
        "top_students_coins": top_coins,
        "top_students_grades": top_grades,
        "recent_requests": [
            {
                "name": a['full_name'],
                "course": a['course_name'],
                "status": a['status'],
                "message": a.get('message', ''),
            }
            for a in recent_admissions
        ],
    })


@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_groups(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    groups = []
    for g in request.user.teaching_groups.all().order_by('-start_date'):
        students = []
        for s in g.students.select_related('user').order_by('user__first_name'):
            students.append({
                "id": s.id,
                "full_name": _user_display_name(s.user),
                "student_id": s.student_id,
                "total_coins": s.total_coins,
                "average_grade": _get_student_grade_average(s),
            })
        groups.append({
            "id": g.id,
            "name": g.name,
            
            "start_date": g.start_date.isoformat() if g.start_date else None,
            "student_count": len(students),
            "students": students,
        })
    return JsonResponse(groups, safe=False)


@csrf_exempt
@require_http_methods(["GET", "POST"])
def api_teacher_tests(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    if request.method == "GET":
        tests = Test.objects.filter(teacher=request.user).select_related('group').order_by('-created_at')
        result = []
        for test in tests:
            result.append({
                "id": test.id,
                "title": test.title,
                "description": test.description,
                "group_id": test.group_id,
                "group_name": test.group.name,
                "duration": test.duration,
                "total_marks": test.total_marks,
                "question_count": test.questions.count(),
                "is_active": test.is_active,
                "deadline": test.deadline.isoformat() if test.deadline else None,
                "created_at": test.created_at.isoformat(),
            })
        return JsonResponse(result, safe=False)

    data = json.loads(request.body)
    group = Group.objects.get(id=data.get('group_id'))
    if group.teacher_id != request.user.id:
        return JsonResponse({"detail": "Not authorized"}, status=403)

    questions_data = data.get('questions', [])
    if not questions_data:
        return JsonResponse({"detail": "Kamida 1 ta savol kerak"}, status=400)

    from django.utils.dateparse import parse_datetime
    deadline = data.get('deadline')
    parsed_deadline = parse_datetime(deadline) if deadline else None

    test = Test.objects.create(
        title=data.get('title', 'Test'),
        description=data.get('description', ''),
        teacher=request.user,
        group=group,
        duration=int(data.get('duration', 30)),
        deadline=parsed_deadline,
        is_active=True,
    )

    total_marks = 0
    for i, q in enumerate(questions_data, start=1):
        marks = int(q.get('marks', 1))
        Question.objects.create(
            test=test,
            question_text=q.get('question_text', ''),
            option_a=q.get('option_a', ''),
            option_b=q.get('option_b', ''),
            option_c=q.get('option_c', ''),
            option_d=q.get('option_d', ''),
            correct_answer=q.get('correct_answer', 'a'),
            marks=marks,
            order=i,
        )
        total_marks += marks

    test.total_marks = total_marks
    test.save()

    return JsonResponse({
        "message": "Test yaratildi",
        "id": test.id,
        "question_count": len(questions_data),
        "total_marks": total_marks,
    })


# ================= DELETE APIS =================

@csrf_exempt
@require_http_methods(["POST"])
def api_grade_delete(request, grade_id):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    grade = get_object_or_404(Grade, id=grade_id)
    if grade.teacher.id != request.user.id:
        return JsonResponse({"detail": "Not authorized"}, status=403)

    grade.delete()
    return JsonResponse({"message": "Baho o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_attendance_delete(request, attendance_id):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    attendance = get_object_or_404(Attendance, id=attendance_id)
    if attendance.teacher.id != request.user.id:
        return JsonResponse({"detail": "Not authorized"}, status=403)

    attendance.delete()
    return JsonResponse({"message": "Davomat o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_coin_delete(request, transaction_id):
    if not request.user.is_authenticated:
        return JsonResponse({"detail": "Not authorized"}, status=403)

    transaction = get_object_or_404(CoinTransaction, id=transaction_id)

    if request.user.role == 'teacher' and transaction.given_by.id != request.user.id:
        return JsonResponse({"detail": "Not authorized"}, status=403)
    elif request.user.role != 'admin' and request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    transaction.delete()
    return JsonResponse({"message": "Coin o'chirildi", "balance": transaction.student.total_coins})


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_grade_delete(request, grade_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    grade = get_object_or_404(Grade, id=grade_id)
    grade.delete()
    return JsonResponse({"message": "Baho o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_attendance_delete(request, attendance_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    attendance = get_object_or_404(Attendance, id=attendance_id)
    attendance.delete()
    return JsonResponse({"message": "Davomat o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_admin_coin_delete(request, transaction_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    transaction = get_object_or_404(CoinTransaction, id=transaction_id)
    transaction.delete()
    return JsonResponse({"message": "Coin o'chirildi", "balance": transaction.student.total_coins})


@csrf_exempt
@require_http_methods(["POST"])
def api_students_coins_delete_all(request, student_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    student = get_object_or_404(Student, user__id=student_id)
    student.coin_transactions.all().delete()
    student.total_coins = 0
    student.save()
    return JsonResponse({"message": "Barcha coinlar o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_students_attendance_delete_all(request, student_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    student = get_object_or_404(Student, user__id=student_id)
    student.attendances.all().delete()
    return JsonResponse({"message": "Barcha davomatlar o'chirildi"})


@csrf_exempt
@require_http_methods(["POST"])
def api_students_grades_delete_all(request, student_id):
    if not request.user.is_authenticated or request.user.role != 'admin':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    student = get_object_or_404(Student, user__id=student_id)
    student.grades.all().delete()
    return JsonResponse({"message": "Barcha baholar o'chirildi"})


# ================= ENROLLMENT APIS =================

@csrf_exempt
@require_http_methods(["POST"])
def api_student_enroll_group(request):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    student = request.user.student_profile
    data = json.loads(request.body)
    group_id = data.get('group_id')

    group = get_object_or_404(Group, id=group_id)

    if group.students.count() >= group.max_seats:
        return JsonResponse({"error": "Guruh to'lgan"}, status=400)

    if student.group_id == group_id or student.additional_groups.filter(id=group_id).exists():
        return JsonResponse({"error": "Siz allaqachon bu guruhda qayd etilgansiz"}, status=400)

    student.additional_groups.add(group)
    return JsonResponse({
        "message": "Guruhga qo'shildi",
        "groups": [g.name for g in student.get_all_groups()]
    })


@csrf_exempt
@require_http_methods(["POST"])
def api_student_unenroll_group(request, group_id):
    if not request.user.is_authenticated or request.user.role != 'student':
        return JsonResponse({"detail": "Not authorized"}, status=403)

    student = request.user.student_profile
    group = get_object_or_404(Group, id=group_id)

    if student.group_id == group_id:
        return JsonResponse({"error": "Asosiy guruhdan chiqib bo'lmadi"}, status=400)

    student.additional_groups.remove(group)
    return JsonResponse({
        "message": "Guruhdan chiqildi",
        "groups": [g.name for g in student.get_all_groups()]
    })

@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_history_coins(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    coins = CoinTransaction.objects.filter(given_by=request.user).select_related('student__user').order_by('-date', '-id')[:50]
    data = []
    for c in coins:
        data.append({
            "id": c.id,
            "student_name": _user_display_name(c.student.user),
            "group_name": ", ".join([grp.name for grp in c.student.groups.all()]) if c.student.groups.exists() else "Guruhsiz",
            "amount": c.amount,
            "reason": c.reason,
            "date": c.date.isoformat() if hasattr(c.date, 'isoformat') else c.date
        })
    return JsonResponse(data, safe=False)


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
        
        group.schedule_days = data.get('schedule_days', group.schedule_days)
        st = data.get('start_time')
        if st is not None: group.start_time = st if st else None
        et = data.get('end_time')
        if et is not None: group.end_time = et if et else None
        
        from django.utils.dateparse import parse_date
        sd = data.get('start_date')
        if sd: group.start_date = parse_date(sd)
        
        if 'status' in data:
            group.status = data.get('status')
            
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


@csrf_exempt
@require_http_methods(["GET", "POST"])
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

        username = data.get('username')
        if CustomUser.objects.filter(username=username).exists():
            return JsonResponse({"error": "Ushbu username allaqachon band. Iltimos boshqasini tanlang."}, status=400)

        user = CustomUser.objects.create_user(
            username=username,
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
        
        student = get_object_or_404(Student, user__id=student_id)
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
            "academy_name": "Mentor Academy",
            "phone": "+998 90 123 45 67",
            "address": "Toshkent shahar",
            "currency": "UZS"
        })
        
    elif request.method == "POST":
        data = json.loads(request.body)
        with open(SETTINGS_FILE, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return JsonResponse({"message": "Tizim sozlamalari saqlandi"})


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
    
    from django.db.models import Sum
    total_revenue = Payment.objects.aggregate(Sum('amount'))['amount__sum'] or 0
    
    from django.db.models.functions import TruncMonth
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
    })

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

@csrf_exempt
@require_http_methods(["GET", "DELETE"])
def api_teacher_test_detail(request, test_id):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    test = get_object_or_404(Test, id=test_id, teacher=request.user)
    
    if request.method == "GET":
        submissions = TestSubmission.objects.filter(test=test).select_related('student__user')
        subs_data = []
        for s in submissions:
            subs_data.append({
                "student_name": s.student.user.get_full_name() or s.student.user.username,
                "score": s.score,
                "submitted_at": s.submitted_at.strftime('%Y-%m-%d %H:%M')
            })
        return JsonResponse({
            "id": test.id,
            "title": test.title,
            "total_marks": test.total_marks,
            "submissions": subs_data
        })
        
    elif request.method == "DELETE":
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

@csrf_exempt
@require_http_methods(["GET"])
def api_teacher_messages_api(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
        
    messages = StudentMessage.objects.filter(teacher=request.user).order_by('-created_at')
    msg_list = [{
        "id": m.id,
        "student_name": m.student.user.get_full_name() or m.student.user.username,
        "content": m.content,
        "created_at": m.created_at.strftime("%Y-%m-%d %H:%M")
    } for m in messages]
    
    return JsonResponse({"messages": msg_list})

@csrf_exempt
@require_http_methods(["DELETE"])
def api_teacher_test_delete(request, test_id):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    try:
        test = Test.objects.get(id=test_id, teacher=request.user)
        test.delete()
        return JsonResponse({"message": "Test o'chirildi"})
    except Test.DoesNotExist:
        return JsonResponse({"detail": "Not found"}, status=404)

@csrf_exempt
@require_http_methods(["POST"])
def api_teacher_announcement(request):
    if not request.user.is_authenticated or request.user.role != 'teacher':
        return JsonResponse({"detail": "Not authorized"}, status=403)
    data = json.loads(request.body)
    group_id = data.get('group_id')
    message = data.get('message')
    
    if not group_id or not message:
        return JsonResponse({"detail": "Missing data"}, status=400)
        
    try:
        group = Group.objects.get(id=group_id, teacher=request.user)
        
        from telegram_bot.models import TelegramUser
        from telegram_bot.utils import send_message_sync
        
        # Get all students in this group
        students = group.students.all()
        sent_count = 0
        teacher_name = request.user.get_full_name() or request.user.username
        
        for student in students:
            try:
                tg_user = TelegramUser.objects.get(user=student.user)
                text = f"📢 <b>Ustozdan E'lon</b>\n\n<b>Guruh:</b> {group.name}\n<b>Ustoz:</b> {teacher_name}\n\n💬 {message}"
                send_message_sync(tg_user.telegram_id, text)
                sent_count += 1
            except Exception as e:
                pass
                
        return JsonResponse({"message": "E'lon yuborildi", "sent": sent_count})
    except Group.DoesNotExist:
        return JsonResponse({"detail": "Guruh topilmadi"}, status=404)
