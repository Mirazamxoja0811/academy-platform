from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

class CustomUser(AbstractUser):
    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    ]
    
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='student')
    phone = models.CharField(max_length=20, blank=True, null=True)
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True)
    date_of_birth = models.DateField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.role})"
    
    class Meta:
        verbose_name = 'User'
        verbose_name_plural = 'Users'


class Group(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='teaching_groups', limit_choices_to={'role': 'teacher'})
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='students')
    total_coins = models.IntegerField(default=0)
    student_id = models.CharField(max_length=20, unique=True)
    enrollment_date = models.DateField(default=timezone.now)
    
    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"
    
    def update_coins(self):
        total = self.coin_transactions.aggregate(models.Sum('amount'))['amount__sum'] or 0
        self.total_coins = total
        self.save()
    
    class Meta:
        ordering = ['-total_coins']


class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    subject = models.CharField(max_length=100)
    grade = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(100)])
    teacher = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'})
    date = models.DateField(default=timezone.now)
    comment = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.subject}: {self.grade}"
    
    class Meta:
        ordering = ['-created_at']


class Attendance(models.Model):
    STATUS_CHOICES = [
        ('present', 'Keldi'),
        ('absent', 'Kelmadi'),
        ('late', 'Kech qoldi'),
    ]
    
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='attendances')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField(default=timezone.now)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='present')
    teacher = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'teacher'})
    note = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.date} - {self.get_status_display()}"
    
    class Meta:
        ordering = ['-date']
        unique_together = ['student', 'date']


class CoinTransaction(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='coin_transactions')
    amount = models.IntegerField()
    reason = models.CharField(max_length=255)
    given_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role__in': ['teacher', 'admin']})
    date = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.amount} coins - {self.reason}"
    
    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        self.student.update_coins()
    
    class Meta:
        ordering = ['-date']


class Message(models.Model):
    MESSAGE_TYPE_CHOICES = [
        ('news', 'Yangilik'),
        ('announcement', "E'lon"),
        ('alert', 'Ogohlantirish'),
    ]
    
    title = models.CharField(max_length=255)
    content = models.TextField()
    sender = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='sent_messages', limit_choices_to={'role__in': ['teacher', 'admin']})
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True, related_name='messages', help_text="Bo'sh qoldirsa barcha guruhlarga boradi")
    message_type = models.CharField(max_length=15, choices=MESSAGE_TYPE_CHOICES, default='news')
    date = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.title} - {self.sender.get_full_name()}"
    
    class Meta:
        ordering = ['-date']


class Test(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='created_tests', limit_choices_to={'role': 'teacher'})
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='tests')
    duration = models.IntegerField(help_text="Daqiqada", default=30)
    total_marks = models.IntegerField(default=100)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    deadline = models.DateTimeField(blank=True, null=True)
    
    def __str__(self):
        return f"{self.title} - {self.group.name}"
    
    def calculate_total_marks(self):
        return self.questions.aggregate(models.Sum('marks'))['marks__sum'] or 0
    
    class Meta:
        ordering = ['-created_at']


class Question(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='questions')
    question_text = models.TextField()
    option_a = models.CharField(max_length=255)
    option_b = models.CharField(max_length=255)
    option_c = models.CharField(max_length=255)
    option_d = models.CharField(max_length=255)
    correct_answer = models.CharField(max_length=1, choices=[('a', 'A'), ('b', 'B'), ('c', 'C'), ('d', 'D')])
    marks = models.IntegerField(default=1)
    order = models.IntegerField(default=0)
    
    def __str__(self):
        return f"{self.test.title} - Q{self.order}"
    
    class Meta:
        ordering = ['order']


class TestSubmission(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_submissions')
    answers = models.JSONField(default=dict, help_text="{'question_id': 'selected_answer'}")
    score = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    time_taken = models.IntegerField(null=True, blank=True, help_text="Daqiqada")
    
    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.test.title} - {self.score}/{self.test.total_marks}"
    
    def calculate_score(self):
        score = 0
        for question in self.test.questions.all():
            student_answer = self.answers.get(str(question.id))
            if student_answer == question.correct_answer:
                score += question.marks
        self.score = score
        self.save()
        return score
    
    class Meta:
        ordering = ['-submitted_at']
        unique_together = ['test', 'student']


class AdmissionRequest(models.Model):
    STATUS_CHOICES = [
        ('new', 'Yangi'),
        ('in_review', "Ko'rib chiqilmoqda"),
        ('approved', 'Qabul qilindi'),
        ('rejected', 'Rad etildi'),
    ]

    LEVEL_CHOICES = [
        ('beginner', 'Boshlang\'ich'),
        ('intermediate', "O'rta"),
        ('advanced', 'Yuqori'),
    ]

    full_name = models.CharField(max_length=200)
    phone = models.CharField(max_length=30)
    email = models.EmailField(blank=True, null=True)
    course_name = models.CharField(max_length=120)
    level = models.CharField(max_length=20, choices=LEVEL_CHOICES, default='beginner')
    preferred_time = models.CharField(max_length=100, blank=True)
    message = models.TextField(blank=True)
    source = models.CharField(max_length=100, blank=True)

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    assigned_group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True, related_name='admission_requests')
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='processed_admission_requests', limit_choices_to={'role': 'admin'})
    processed_at = models.DateTimeField(null=True, blank=True)
    created_user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_from_admission_requests')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.full_name} - {self.course_name} ({self.get_status_display()})"

    class Meta:
        ordering = ['-created_at']

