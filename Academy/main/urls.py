from django.urls import path
from django.views.generic import TemplateView
from . import views

urlpatterns = [
    # Next.js React Main Pages
    path('', TemplateView.as_view(template_name='index.html'), name='home'),
    path('login/', TemplateView.as_view(template_name='login/index.html'), name='login'),
    
    # API endpoints
    path('api/login/', views.api_login, name='api_login'),
    path('api/users/', views.api_users, name='api_users'),
    path('api/groups/', views.api_groups, name='api_groups'),
    path('api/admissions/', views.api_admissions, name='api_admissions'),
    path('api/students/', views.api_students, name='api_students'),
    
    # ---------------------------------------------------------
    # STUDENT NEXT.JS PAGES
    # ---------------------------------------------------------
    path('student/dashboard/', TemplateView.as_view(template_name='student/dashboard/index.html'), name='student_dashboard'),
    path('student/grades/', TemplateView.as_view(template_name='student/grades/index.html'), name='student_grades'),
    path('student/attendance/', TemplateView.as_view(template_name='student/attendance/index.html'), name='student_attendance'),
    path('student/coins/', TemplateView.as_view(template_name='student/coins/index.html'), name='student_coins'),
    path('student/tests/', TemplateView.as_view(template_name='student/tests/index.html'), name='student_tests'),
    path('student/settings/', TemplateView.as_view(template_name='student/settings/index.html'), name='student_settings'),

    # ---------------------------------------------------------
    # TEACHER NEXT.JS PAGES
    # ---------------------------------------------------------
    path('teacher/dashboard/', TemplateView.as_view(template_name='teacher/dashboard/index.html'), name='teacher_dashboard'),
    path('teacher/groups/', TemplateView.as_view(template_name='teacher/groups/index.html'), name='teacher_groups'),
    path('teacher/grading/', TemplateView.as_view(template_name='teacher/grading/index.html'), name='teacher_grading'),
    path('teacher/attendance/', TemplateView.as_view(template_name='teacher/attendance/index.html'), name='teacher_attendance_next'),
    path('teacher/coins/', TemplateView.as_view(template_name='teacher/coins/index.html'), name='teacher_coins_next'),
    path('teacher/messages/', TemplateView.as_view(template_name='teacher/messages/index.html'), name='teacher_messages_next'),

    # ---------------------------------------------------------
    # ADMIN NEXT.JS PAGES
    # ---------------------------------------------------------
    path('admin/dashboard/', TemplateView.as_view(template_name='admin/dashboard/index.html'), name='admin_dashboard'),
    path('admin/users/', TemplateView.as_view(template_name='admin/users/index.html'), name='admin_users'),
    path('admin/groups/', TemplateView.as_view(template_name='admin/groups/index.html'), name='admin_groups'),
    path('admin/admissions/', TemplateView.as_view(template_name='admin/admissions/index.html'), name='admin_admissions'),
    path('admin/finance/', TemplateView.as_view(template_name='admin/finance/index.html'), name='admin_finance'),
    path('admin/settings/', TemplateView.as_view(template_name='admin/settings/index.html'), name='admin_settings'),
]