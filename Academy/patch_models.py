with open('main/models.py', 'a', encoding='utf-8') as f:
    f.write('''
class StudentMessage(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='sent_messages')
    teacher = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='received_student_messages', limit_choices_to={'role': 'teacher'})
    content = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} -> {self.teacher.get_full_name()}"
''')
print("Added StudentMessage model")
