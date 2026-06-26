from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Date, DateTime, Text, Float
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class CustomUser(Base):
    __tablename__ = 'main_customuser'
    
    id = Column(Integer, primary_key=True, index=True)
    password = Column(String(128))
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_superuser = Column(Boolean, default=False)
    username = Column(String(150), unique=True, index=True)
    first_name = Column(String(150))
    last_name = Column(String(150))
    email = Column(String(254), nullable=True)
    is_staff = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    date_joined = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    role = Column(String(20), default='student')
    phone = Column(String(20), nullable=True)
    avatar = Column(String(100), nullable=True)
    date_of_birth = Column(Date, nullable=True)
    telegram_id = Column(String(100), nullable=True, unique=True)
    
    student_profile = relationship("Student", back_populates="user", uselist=False)


class Group(Base):
    __tablename__ = 'main_group'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100))
    description = Column(Text, nullable=True)
    teacher_id = Column(Integer, ForeignKey('main_customuser.id'), nullable=True)
    start_date = Column(Date)
    end_date = Column(Date, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    students = relationship("Student", back_populates="group")


class Student(Base):
    __tablename__ = 'main_student'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('main_customuser.id'), unique=True)
    group_id = Column(Integer, ForeignKey('main_group.id'), nullable=True)
    total_coins = Column(Integer, default=0)
    student_id = Column(String(20), unique=True)
    enrollment_date = Column(Date)
    
    user = relationship("CustomUser", back_populates="student_profile")
    group = relationship("Group", back_populates="students")
    grades = relationship("Grade", back_populates="student")
    coin_transactions = relationship("CoinTransaction", back_populates="student")
    attendances = relationship("Attendance", back_populates="student")


class Grade(Base):
    __tablename__ = 'main_grade'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('main_student.id'))
    subject = Column(String(100))
    grade = Column(Integer)
    teacher_id = Column(Integer, ForeignKey('main_customuser.id'), nullable=True)
    date = Column(Date)
    comment = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    student = relationship("Student", back_populates="grades")


class CoinTransaction(Base):
    __tablename__ = 'main_cointransaction'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('main_student.id'))
    amount = Column(Integer)
    reason = Column(String(255))
    given_by_id = Column(Integer, ForeignKey('main_customuser.id'), nullable=True)
    date = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    student = relationship("Student", back_populates="coin_transactions")


class Attendance(Base):
    __tablename__ = 'main_attendance'
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey('main_student.id'))
    group_id = Column(Integer, ForeignKey('main_group.id'))
    date = Column(Date)
    status = Column(String(10), default='present')
    teacher_id = Column(Integer, ForeignKey('main_customuser.id'), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    
    student = relationship("Student", back_populates="attendances")
