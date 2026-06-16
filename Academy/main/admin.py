from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    CustomUser, Group, Student, Grade, Attendance, 
    CoinTransaction, Message, Test, Question, TestSubmission, AdmissionRequest
)

@admin.register(CustomUser)
class CustomUserAdmin(UserAdmin):
    list_display = ['username', 'email', 'first_name', 'last_name', 'role', 'is_staff']
    list_filter = ['role', 'is_staff', 'is_active']
    search_fields = ['username', 'first_name', 'last_name', 'email']
    
    fieldsets = UserAdmin.fieldsets + (
        ('Qo\'shimcha ma\'lumotlar', {'fields': ('role', 'phone', 'avatar', 'date_of_birth')}),
    )
    
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Qo\'shimcha ma\'lumotlar', {'fields': ('role', 'phone', 'date_of_birth')}),
    )


@admin.register(Group)
class GroupAdmin(admin.ModelAdmin):
    list_display = ['name', 'teacher', 'start_date', 'end_date', 'created_at']
    list_filter = ['teacher', 'start_date']
    search_fields = ['name', 'description']
    date_hierarchy = 'created_at'


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ['student_id', 'user', 'group', 'total_coins', 'enrollment_date']
    list_filter = ['group', 'enrollment_date']
    search_fields = ['student_id', 'user__first_name', 'user__last_name']
    readonly_fields = ['total_coins']


@admin.register(Grade)
class GradeAdmin(admin.ModelAdmin):
    list_display = ['student', 'subject', 'grade', 'teacher', 'date']
    list_filter = ['subject', 'teacher', 'date']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'subject']
    date_hierarchy = 'date'


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ['student', 'group', 'date', 'status', 'teacher']
    list_filter = ['status', 'group', 'date']
    search_fields = ['student__user__first_name', 'student__user__last_name']
    date_hierarchy = 'date'


@admin.register(CoinTransaction)
class CoinTransactionAdmin(admin.ModelAdmin):
    list_display = ['student', 'amount', 'reason', 'given_by', 'date']
    list_filter = ['given_by', 'date']
    search_fields = ['student__user__first_name', 'student__user__last_name', 'reason']
    date_hierarchy = 'date'
    readonly_fields = ['date']


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['title', 'sender', 'group', 'message_type', 'date', 'is_active']
    list_filter = ['message_type', 'sender', 'group', 'is_active']
    search_fields = ['title', 'content']
    date_hierarchy = 'date'


class QuestionInline(admin.TabularInline):
    model = Question
    extra = 1


@admin.register(Test)
class TestAdmin(admin.ModelAdmin):
    list_display = ['title', 'group', 'teacher', 'duration', 'total_marks', 'is_active', 'created_at']
    list_filter = ['group', 'teacher', 'is_active']
    search_fields = ['title', 'description']
    date_hierarchy = 'created_at'
    inlines = [QuestionInline]


@admin.register(TestSubmission)
class TestSubmissionAdmin(admin.ModelAdmin):
    list_display = ['student', 'test', 'score', 'is_completed', 'submitted_at']
    list_filter = ['test', 'is_completed', 'submitted_at']
    search_fields = ['student__user__first_name', 'student__user__last_name']
    date_hierarchy = 'submitted_at'
    readonly_fields = ['score', 'submitted_at']


@admin.register(AdmissionRequest)
class AdmissionRequestAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'phone', 'course_name', 'level', 'status', 'created_at']
    list_filter = ['status', 'level', 'course_name', 'created_at']
    search_fields = ['full_name', 'phone', 'email', 'course_name']
    readonly_fields = ['created_at', 'updated_at', 'processed_at']

