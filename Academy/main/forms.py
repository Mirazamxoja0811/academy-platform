from django import forms
from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, Question, AdmissionRequest, Payment, Course, Room, Expense

class CustomUserCreationForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_of_birth']

class CustomUserEditForm(forms.ModelForm):
    password = forms.CharField(required=False, widget=forms.PasswordInput)
    password_confirm = forms.CharField(required=False, widget=forms.PasswordInput)
    
    class Meta:
        model = CustomUser
        fields = ['username', 'email', 'first_name', 'last_name', 'phone', 'role', 'date_of_birth', 'is_active']
    
    def clean(self):
        cleaned_data = super().clean()
        password = cleaned_data.get('password')
        password_confirm = cleaned_data.get('password_confirm')
        
        if password or password_confirm:
            if password != password_confirm:
                raise forms.ValidationError('Parollar mos kelmadi!')
        
        return cleaned_data
    
    def save(self, commit=True):
        user = super().save(commit=False)
        password = self.cleaned_data.get('password')
        if password:
            user.set_password(password)
        if commit:
            user.save()
        return user

class StudentForm(forms.ModelForm):
    class Meta:
        model = Student
        fields = ['groups', 'student_id', 'balance']

class GroupForm(forms.ModelForm):
    class Meta:
        model = Group
        fields = ['name', 'course', 'teacher', 'room', 'start_date', 'end_date', 'max_seats', 'status', 'schedule_days', 'start_time', 'end_time']

class CoinTransactionForm(forms.ModelForm):
    class Meta:
        model = CoinTransaction
        fields = ['student', 'amount', 'reason']

class GradeForm(forms.ModelForm):
    class Meta:
        model = Grade
        fields = ['student', 'group', 'subject', 'grade', 'comment', 'date']

class AttendanceForm(forms.ModelForm):
    class Meta:
        model = Attendance
        fields = ['student', 'group', 'date', 'status', 'note']

class MessageForm(forms.ModelForm):
    class Meta:
        model = Message
        fields = ['title', 'content', 'group', 'message_type']

class AccountSettingsForm(forms.ModelForm):
    class Meta:
        model = CustomUser
        fields = ['username', 'first_name', 'last_name', 'email', 'phone', 'date_of_birth', 'avatar']

class AdmissionRequestForm(forms.ModelForm):
    class Meta:
        model = AdmissionRequest
        fields = ['full_name', 'phone', 'email', 'course_name', 'level', 'preferred_time', 'message', 'source']
