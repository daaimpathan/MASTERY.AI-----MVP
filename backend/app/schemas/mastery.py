"""
Pydantic schemas for Mastery and Adaptive Assignments.
"""

from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models import AssignmentType, AssignmentStatus, DifficultyLevel, QuestionDifficulty

class ConceptMasteryResponse(BaseModel):
    id: UUID
    student_id: UUID
    concept_id: UUID
    mastery_score: float
    last_evaluated: datetime

    class Config:
        from_attributes = True

class StudentResponseDetail(BaseModel):
    id: UUID
    question_id: UUID
    is_correct: bool
    points_earned: float
    
    class Config:
        from_attributes = True

class QuestionBase(BaseModel):
    question_text: str
    difficulty: QuestionDifficulty
    question_type: str = "mcq" # Default to match enum if needed, or make optional
    options: Optional[Dict[str, str]] = None
    points: int = 1
    concept_id: Optional[UUID] = None
    metadata: Optional[Dict[str, Any]] = None

class QuestionResponse(QuestionBase):
    id: UUID
    class Config:
        from_attributes = True

class AssignmentBase(BaseModel):
    title: str
    assignment_type: AssignmentType
    due_date: Optional[datetime] = None

class AssignmentCreate(AssignmentBase):
    teacher_id: UUID
    class_id: UUID
    concept_ids: List[UUID]
    difficulty_target: QuestionDifficulty = QuestionDifficulty.MEDIUM
    num_questions: int = 10

class AssignmentResponse(AssignmentBase):
    id: UUID
    status: AssignmentStatus
    created_at: datetime
    questions: List[QuestionResponse]

    class Config:
        from_attributes = True

class SubmissionBase(BaseModel):
    answers: Dict[str, Any]

class SubmissionCreate(SubmissionBase):
    assignment_id: UUID

class SubmissionResponse(SubmissionBase):
    id: UUID
    student_id: UUID
    score: float
    mastery_gain: float # Simplified for demo
    submitted_at: datetime
    responses: List[StudentResponseDetail] = []

    class Config:
        from_attributes = True

class GradeSubmissionRequest(BaseModel):
    grade: float
    feedback: str
    mastery_boost: float = 0.0
