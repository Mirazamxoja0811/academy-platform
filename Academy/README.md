# 🎓 Mentor Academy - O'quv Markazi Platformasi

## 📝 Loyiha haqida

**Mentor Academy** - bu o'quv markazlar uchun ishlab chiqilgan professional web platforma. Admin, O'qituvchi va O'quvchi rollari uchun alohida dashboardlar mavjud.

### ✨ Asosiy funksiyalar:

#### 👨‍💼 Admin
- Foydalanuvchilarni boshqarish (CRUD)
- Guruhlarni boshqarish
- Umumiy statistika
- Barcha o'qituvchi va o'quvchi funksiyalariga kirish

#### 👨‍🏫 O'qituvchi
- Davomat qo'yish
- Baho qo'yish
- Coins (mukofot) berish
- Xabar va yangiliklar yuborish
- Test yaratish (multiple choice)
- Guruh ichida top 3 o'quvchilarni ko'rish

#### 👨‍🎓 O'quvchi
- Baholarni ko'rish (o'rtacha bilan)
- Coins tarixini ko'rish
- Davomat kalendari
- Shaxsiy statistika
- Xabar va yangiliklarni ko'rish
- Test topshirish
- Guruh ichida o'z pozitsiyasini ko'rish

---

## 🚀 O'rnatish

### 1. Virtual environment yaratish
```bash
python -m venv .venv
```

### 2. Virtual environmentni aktivlashtirish
```bash
# Windows
.venv\Scripts\activate

# Mac/Linux
source .venv/bin/activate
```

### 3. Dependencies o'rnatish
```bash
pip install -r requirements.txt
```

### 4. Database sozlash
```bash
cd Academy
python manage.py makemigrations
python manage.py migrate
```

### 5. Superuser yaratish
```bash
python manage.py createsuperuser
```

### 6. Serverni ishga tushirish
```bash
python manage.py runserver
```

Yoki Windows uchun:
```bash
# Papkaga o'ting
cd "c:\Users\miraz\OneDrive\Desktop\SWT programming"

# start_server.bat ni ishga tushiring
start_server.bat
```

Server **http://127.0.0.1:8000/** da ishga tushadi.

---

## 🔐 Login ma'lumotlari

### Admin
- URL: http://127.0.0.1:8000/login/
- Role: `admin`

### O'qituvchi
- URL: http://127.0.0.1:8000/login/
- Role: `teacher`

### O'quvchi
- URL: http://127.0.0.1:8000/login/
- Role: `student`

---

## 📁 Loyiha strukturasi

```
Academy/
├── main/                      # Asosiy app
│   ├── models.py             # 10 ta model (CustomUser, Group, Student, va boshqalar)
│   ├── views.py              # Barcha view funksiyalar
│   ├── forms.py              # Formalar
│   ├── decorators.py         # Role-based decorators
│   └── urls.py               # URL routing
├── templates/                 # HTML templates
│   ├── base.html             # Base template (dark/light mode bilan)
│   ├── auth/                 # Login/Register
│   ├── admin_dashboard/      # Admin dashboardi
│   ├── teacher/              # O'qituvchi dashboardi
│   └── student/              # O'quvchi dashboardi
├── static/                    # CSS, JS, Images (Bootstrap 5 CDN)
└── media/                     # User uploads (avatarlar)
```

---

## 🗄️ Database Schema

### 10 ta Model:

1. **CustomUser** - extends Django User (role field bilan)
2. **Group** - Guruhlar
3. **Student** - O'quvchilar (User bilan one-to-one)
4. **Grade** - Baholar
5. **Attendance** - Davomat
6. **CoinTransaction** - Coins tarixi
7. **Message** - Xabar/Yangiliklar
8. **Test** - Testlar
9. **Question** - Savol (Test bilan ForeignKey)
10. **TestSubmission** - Test topshirish (javoblar JSONField da)

---

## 🎨 Design

- **Frontend**: Django Templates + Bootstrap 5.3.2
- **Dark/Light Mode**: GitHub-style (localStorage bilan persist)
- **Responsive**: Mobile-friendly
- **Icons**: Bootstrap Icons 1.11.1
- **Fonts**: Google Fonts (Inter)

---

## 🔒 Security

- ✅ Role-based access control (decorators)
- ✅ CSRF protection
- ✅ Password hashing
- ✅ SQL injection protection (Django ORM)
- ✅ XSS protection (template escaping)

---

## 📊 Features Detail

### Coins System
O'quvchilar baholar, davomat, yaxshi ishlari uchun coins oladilar. Har bir transaction tarixda saqlanadi.

### Leaderboard
Har bir guruhda eng ko'p coinslarga ega top 3 o'quvchi ko'rsatiladi.

### Test System
- Multiple choice savollar
- Vaqt cheklovi
- Auto-grading
- Bir marta topshirish
- Natija darhol chiqadi

### Messaging
- O'qituvchi guruhga yoki barcha guruhlarga xabar yuboradi
- 3 xil turi: Yangilik / E'lon / Ogohlantirish
- O'quvchilar faqat o'z guruhiga tegishli xabarlarni ko'radi

---

## 🚢 Production ga tayyorlash

### 1. settings.py o'zgartirish
```python
DEBUG = False
ALLOWED_HOSTS = ['your-domain.com']
SECRET_KEY = 'your-secret-key'  # Env variabledan olish
```

### 2. Static files to'plash
```bash
python manage.py collectstatic
```

### 3. Database
SQLite dan PostgreSQL ga o'tish tavsiya etiladi.

### 4. HTTPS
SSL sertifikat o'rnatish.

### 5. Gunicorn
```bash
pip install gunicorn
gunicorn Academy.wsgi:application
```

---

## 🛠️ Texnologiyalar

- **Backend**: Django 6.0.3, Python 3.x
- **Frontend**: Bootstrap 5, Vanilla JavaScript
- **Database**: SQLite (dev), PostgreSQL (prod ready)
- **Auth**: Django built-in authentication

---

## 📈 Kelajakda qo'shilishi mumkin

- Real-time bildirishnomalar (Django Channels)
- Ota-ona dashboardi
- Chart.js bilan grafiklar
- Achievement/Badge system
- File upload testlar uchun
- Email notifications
- Mobile app (React Native)
- To'lov tizimi integratsiyasi

---

## 🐛 Bug Report

Agar muammo topsangiz:
1. Error xabarini screenshot qiling
2. Qaysi rolda (admin/teacher/student)
3. Qaysi sahifada xatolik chiqdi

---

## 📞 Qo'llab-quvvatlash

Muammolar yoki savollar bo'lsa GitHub Issues orqali yozing.

---

## ✅ Tayyor funksiyalar

- [x] Authentication (Login/Register/Logout)
- [x] Dark/Light Mode
- [x] Admin Dashboard (User/Group CRUD)
- [x] Teacher Dashboard (Attendance/Grading/Coins)
- [x] Student Dashboard (View only)
- [x] Messaging System
- [x] Test System (Create/Take)
- [x] Leaderboard (Top 3)
- [x] Statistics Dashboard
- [x] Role-based permissions

---

**Version**: 1.0.0  
**Status**: ✅ Production Ready  
**Last Updated**: March 2026

---

🎓 **Mentor Academy** - O'quvchilaringizni professional boshqaring!
