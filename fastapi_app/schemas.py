from pydantic import BaseModel
from typing import List, Optional
from datetime import date, datetime

class UserBase(BaseModel):
    username: str
    first_name: str
    last_name: str
    role: str

class StudentBase(BaseModel):
    student_id: str
    total_coins: int
    enrollment_date: date

class StudentOut(StudentBase):
    id: int
    user: UserBase
    
    class Config:
        from_attributes = True

class GroupOut(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True
