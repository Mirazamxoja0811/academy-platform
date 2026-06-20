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


class Course(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price_per_month = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name


class Room(models.Model):
    name = models.CharField(max_length=50)
    capacity = models.IntegerField(default=20)
    
    def __str__(self):
        return self.name


class Group(models.Model):
    STATUS_CHOICES = [
        ('active', 'Faol'),
        ('completed', 'Tugallangan'),
        ('archived', 'Arxivlangan'),
    ]

    name = models.CharField(max_length=100)
    course = models.ForeignKey(Course, on_delete=models.SET_NULL, null=True, related_name='groups')
    teacher = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='teaching_groups', limit_choices_to={'role': 'teacher'})
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True)
    
    schedule_days = models.CharField(max_length=100, blank=True, help_text="Masalan: Du-Chor-Jum")
    start_time = models.TimeField(null=True, blank=True)
    end_time = models.TimeField(null=True, blank=True)
    
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    max_seats = models.IntegerField(default=15)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']


class Student(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='student_profile')
    groups = models.ManyToManyField(Group, blank=True, related_name='students')
    total_coins = models.IntegerField(default=0)
    student_id = models.CharField(max_length=20, unique=True)
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="O'quvchining joriy balansi")
    enrollment_date = models.DateField(default=timezone.now)

    def __str__(self):
        return f"{self.user.get_full_name()} - {self.student_id}"

    def get_all_groups(self):
        return list(self.groups.all())

    def update_coins(self):
        total = self.coin_transactions.aggregate(models.Sum('amount'))['amount__sum'] or 0
        self.total_coins = total
        self.save()

    class Meta:
        ordering = ['-total_coins']


class Teacher(models.Model):
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='teacher_profile')
    salary_percentage = models.IntegerField(default=50, help_text="O'qituvchining ulushi (%)")
    balance = models.DecimalField(max_digits=12, decimal_places=2, default=0, help_text="O'qituvchining joriy balansi")

    def __str__(self):
        return self.user.get_full_name()


class Payment(models.Model):
    PAYMENT_METHOD_CHOICES = [
        ('cash', 'Naqd pul'),
        ('card', 'Plastik karta'),
        ('transfer', "Pul o'tkazmasi"),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHOD_CHOICES, default='cash')
    description = models.TextField(blank=True)
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'admin'})
    payment_date = models.DateTimeField(default=timezone.now)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.user.get_full_name()} - {self.amount} ({self.get_payment_method_display()})"

    class Meta:
        ordering = ['-payment_date']


class Expense(models.Model):
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    reason = models.CharField(max_length=255)
    expense_date = models.DateField(default=timezone.now)
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, limit_choices_to={'role': 'admin'})
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.amount} - {self.reason}"


class Grade(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='grades')
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='grades', null=True)
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
        ('excused', 'Sababli'),
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
    group = models.ForeignKey(Group, on_delete=models.CASCADE, null=True, blank=True, related_name='messages')
    message_type = models.CharField(max_length=15, choices=MESSAGE_TYPE_CHOICES, default='news')
    date = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
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
    
    class Meta:
        ordering = ['order']


class TestSubmission(models.Model):
    test = models.ForeignKey(Test, on_delete=models.CASCADE, related_name='submissions')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='test_submissions')
    answers = models.JSONField(default=dict)
    score = models.IntegerField(default=0)
    submitted_at = models.DateTimeField(auto_now_add=True)
    is_completed = models.BooleanField(default=False)
    time_taken = models.IntegerField(null=True, blank=True)
    
    def calculate_score(self):
        score = 0
        for question in self.test.questions.all():
            if self.answers.get(str(question.id)) == question.correct_answer:
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
    assigned_group = models.ForeignKey(Group, on_delete=models.SET_NULL, null=True, blank=True)
    processed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, limit_choices_to={'role': 'admin'})
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']
