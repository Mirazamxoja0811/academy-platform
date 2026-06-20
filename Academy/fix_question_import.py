with open('main/views.py', 'r', encoding='utf-8') as f:
    content = f.read()

if 'Question' not in content.split('\n')[10]:  # Or somewhere at the top
    # The models are imported on line 12: from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, TestSubmission, AdmissionRequest, Course, Room, Payment
    old_import = "from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, TestSubmission, AdmissionRequest, Course, Room, Payment"
    new_import = "from .models import CustomUser, Student, Group, CoinTransaction, Grade, Attendance, Message, Test, Question, TestSubmission, AdmissionRequest, Course, Room, Payment"
    content = content.replace(old_import, new_import)

    with open('main/views.py', 'w', encoding='utf-8') as f:
        f.write(content)

print("Added Question to imports")
