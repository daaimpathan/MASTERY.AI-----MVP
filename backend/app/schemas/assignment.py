from pydantic import BaseModel
from typing import Optional, List
from uuid import UUID
from datetime import datetime
from app.models.assignment import AssignmentType, AssignmentStatus

class AssignmentBase(BaseModel):
    title: str
    description: Optional[str] = None
    assignment_type: AssignmentType
    due_date: Optional[datetime] = None
    class_id: UUID

class AssignmentCreate(AssignmentBase):
    pass

class AssignmentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    assignment_type: Optional[AssignmentType] = None
    due_date: Optional[datetime] = None
    status: Optional[AssignmentStatus] = None

class AssignmentResponse(AssignmentBase):
    id: UUID
    teacher_id: UUID
    created_at: datetime
    
    class Config:
        from_attributes = True

class GradeSubmissionRequest(BaseModel):
    grade: float
    feedback: Optional[str] = None
    mastery_boost: float = 0.0
