from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    # Next.js React Main Pages (static export: page.html, not page/index.html)
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login.html'), name='login'),

    # API endpoints
    path('api/login/', views.api_login, name='api_login'),
    path('api/users/', views.api_users, name='api_users'),
    path('api/users/<int:user_id>/delete/', views.api_user_delete, name='api_user_delete'),
    path('api/groups/', views.api_groups, name='api_groups'),
    path('api/courses/', views.api_courses, name='api_courses'),
    path('api/rooms/', views.api_rooms, name='api_rooms'),
    path('api/admissions/', views.api_admissions, name='api_admissions'),
    path('api/students/', views.api_students, name='api_students'),

    path('api/me/', views.api_me, name='api_me'),
    path('api/account/settings/', views.api_account_settings, name='api_account_settings'),
    path('api/students/me/dashboard/', views.api_student_dashboard, name='api_student_dashboard'),
    path('api/students/me/grades/', views.api_student_grades, name='api_student_grades'),
    path('api/students/me/attendance/', views.api_student_attendance, name='api_student_attendance'),
    path('api/students/me/coins/', views.api_student_coins, name='api_student_coins'),
    path('api/students/me/tests/', views.api_student_tests, name='api_student_tests'),
    path('api/teacher/dashboard/stats/', views.api_teacher_dashboard, name='api_teacher_dashboard_stats'),
    path('api/teacher/batch_grading/', views.api_batch_grading, name='api_batch_grading'),
    path('api/teacher/batch_attendance/', views.api_batch_attendance, name='api_batch_attendance'),
    path('api/teacher/coins/', views.api_teacher_coins, name='api_teacher_coins'),
    path('api/teacher/groups/', views.api_teacher_groups, name='api_teacher_groups'),
    path('api/teacher/history/grades/', views.api_teacher_history_grades, name='api_teacher_history_grades'),
    path('api/teacher/history/attendance/', views.api_teacher_history_attendance, name='api_teacher_history_attendance'),
    path('api/teacher/history/coins/', views.api_teacher_history_coins, name='api_teacher_history_coins'),
    path('api/teacher/tests/', views.api_teacher_tests, name='api_teacher_tests'),
    path('api/admin/dashboard/stats/', views.api_admin_dashboard, name='api_admin_dashboard'),
    path('api/finance/', views.api_finance, name='api_finance'),
    path('api/students/me/tests/<int:test_id>/', views.api_student_test_detail, name='api_student_test_detail'),
    path('api/students/me/tests/<int:test_id>/submit/', views.api_student_test_submit, name='api_student_test_submit'),

    # Delete APIs
    path('api/grades/<int:grade_id>/delete/', views.api_grade_delete, name='api_grade_delete'),
    path('api/attendance/<int:attendance_id>/delete/', views.api_attendance_delete, name='api_attendance_delete'),
    path('api/coins/<int:transaction_id>/delete/', views.api_coin_delete, name='api_coin_delete'),
    path('api/admin/grades/<int:grade_id>/delete/', views.api_admin_grade_delete, name='api_admin_grade_delete'),
    path('api/admin/attendance/<int:attendance_id>/delete/', views.api_admin_attendance_delete, name='api_admin_attendance_delete'),
    path('api/admin/coins/<int:transaction_id>/delete/', views.api_admin_coin_delete, name='api_admin_coin_delete'),
    path('api/admin/students/<int:student_id>/coins/delete-all/', views.api_students_coins_delete_all, name='api_students_coins_delete_all'),
    path('api/admin/students/<int:student_id>/attendance/delete-all/', views.api_students_attendance_delete_all, name='api_students_attendance_delete_all'),
    path('api/admin/students/<int:student_id>/grades/delete-all/', views.api_students_grades_delete_all, name='api_students_grades_delete_all'),

    # Enrollment APIs
    path('api/student/groups/enroll/', views.api_student_enroll_group, name='api_student_enroll_group'),
    path('api/student/groups/<int:group_id>/unenroll/', views.api_student_unenroll_group, name='api_student_unenroll_group'),

    # STUDENT NEXT.JS PAGES
    path('student/dashboard/', TemplateView.as_view(template_name='student/dashboard.html'), name='student_dashboard'),
    path('student/grades/', TemplateView.as_view(template_name='student/grades.html'), name='student_grades'),
    path('student/attendance/', TemplateView.as_view(template_name='student/attendance.html'), name='student_attendance'),
    path('student/coins/', TemplateView.as_view(template_name='student/coins.html'), name='student_coins'),
    path('student/tests/', TemplateView.as_view(template_name='student/tests.html'), name='student_tests'),
    path('student/settings/', TemplateView.as_view(template_name='student/settings.html'), name='student_settings'),

    # TEACHER NEXT.JS PAGES
    path('teacher/dashboard/', TemplateView.as_view(template_name='teacher/dashboard.html'), name='teacher_dashboard'),
    path('teacher/groups/', TemplateView.as_view(template_name='teacher/groups.html'), name='teacher_groups'),
    path('teacher/grading/', TemplateView.as_view(template_name='teacher/grading.html'), name='teacher_grading'),
    path('teacher/attendance/', TemplateView.as_view(template_name='teacher/attendance.html'), name='teacher_attendance_next'),
    path('teacher/coins/', TemplateView.as_view(template_name='teacher/coins.html'), name='teacher_coins_next'),
    path('teacher/messages/', TemplateView.as_view(template_name='teacher/messages.html'), name='teacher_messages_next'),
    path('teacher/tests/', TemplateView.as_view(template_name='teacher/tests.html'), name='teacher_tests'),

    # ADMIN NEXT.JS PAGES
    path('admin/dashboard/', TemplateView.as_view(template_name='admin/dashboard.html'), name='admin_dashboard'),
    path('admin/users/', TemplateView.as_view(template_name='admin/users.html'), name='admin_users'),
    path('admin/groups/', TemplateView.as_view(template_name='admin/groups.html'), name='admin_groups'),
    path('admin/admissions/', TemplateView.as_view(template_name='admin/admissions.html'), name='admin_admissions'),
    path('admin/finance/', TemplateView.as_view(template_name='admin/finance.html'), name='admin_finance'),
    path('admin/settings/', TemplateView.as_view(template_name='admin/settings.html'), name='admin_settings'),
]
