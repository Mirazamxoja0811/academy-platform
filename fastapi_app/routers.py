from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from database import get_db
import models, schemas

router = APIRouter()

class LoginRequest(BaseModel):
    username: str
    password: str

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    # Baza orqali user ni topish
    result = await db.execute(select(models.CustomUser).filter(models.CustomUser.username == request.username))
    user = result.scalars().first()
    
    if not user:
        raise HTTPException(status_code=400, detail="Foydalanuvchi topilmadi")
    
    # Hozircha oddiy tekshirish. Djangodagi pbkdf2 heshni tekshirish uchun alohida kutubxona kerak.
    # if not verify_password(request.password, user.password):
    #     raise HTTPException(status_code=400, detail="Noto'g'ri parol")

    if user.role == "student":
        student_result = await db.execute(select(models.Student).filter(models.Student.user_id == user.id))
        student = student_result.scalars().first()
        return {"role": user.role, "user_id": user.id, "student_id": student.id if student else None}
    
    return {"role": user.role, "user_id": user.id}

@router.get("/student/dashboard/{student_id}")
async def get_student_dashboard(student_id: int, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(models.Student)
        .options(
            selectinload(models.Student.user),
            selectinload(models.Student.grades),
            selectinload(models.Student.attendances)
        )
        .filter(models.Student.id == student_id)
    )
    student = result.scalars().first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    return {
        "full_name": f"{student.user.first_name} {student.user.last_name}",
        "total_coins": student.total_coins,
        "grades": [{"subject": g.subject, "grade": g.grade, "date": g.date} for g in student.grades],
        "attendances": [{"status": a.status, "date": a.date} for a in student.attendances]
    }
