from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
import models, schemas

async def get_students(db: AsyncSession, skip: int = 0, limit: int = 100):
    result = await db.execute(
        select(models.Student)
        .options(selectinload(models.Student.user))
        .offset(skip)
        .limit(limit)
    )
    return result.scalars().all()

async def get_student_by_id(db: AsyncSession, student_id: int):
    result = await db.execute(
        select(models.Student)
        .options(selectinload(models.Student.user))
        .filter(models.Student.id == student_id)
    )
    return result.scalars().first()
