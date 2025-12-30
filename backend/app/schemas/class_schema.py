from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime

class ClassBase(BaseModel):
    name: str
    subject: Optional[str] = None
    academic_year: Optional[str] = None

class ClassResponse(ClassBase):
    id: UUID
    teacher_id: UUID
    institution_id: Optional[UUID] = None
    created_at: datetime

    class Config:
        from_attributes = True
