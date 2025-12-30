"""
Pydantic schemas for PBL (Project-Based Learning) models.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional, Dict, Any, Union
from uuid import UUID
from datetime import datetime
from app.models.project import CriterionType, SubmissionStatus, SubmissionType, EvaluatorType

# --- Rubric Schemas ---

class RubricCriterionBase(BaseModel):
    criterion_name: str
    criterion_type: CriterionType
    description: Optional[str] = None
    max_score: float = 10.0
    weight: float = 1.0

class RubricCriterionCreate(RubricCriterionBase):
    pass

class RubricCriterionResponse(RubricCriterionBase):
    id: UUID
    rubric_id: UUID

    class Config:
        from_attributes = True

class RubricBase(BaseModel):
    name: str
    description: Optional[str] = None

class RubricCreate(RubricBase):
    criteria: List[RubricCriterionCreate]

class RubricResponse(RubricBase):
    id: UUID
    project_id: UUID
    criteria: List[RubricCriterionResponse]

    class Config:
        from_attributes = True

# --- Project Schemas ---

class ProjectBase(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_group_project: bool = False
    max_group_size: int = 1

class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = None
    subject: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_group_project: bool = False
    max_group_size: int = 1
    class_id: Optional[str] = None
    rubric: Optional[RubricCreate] = None

class ProjectUpdate(ProjectBase):
    title: Optional[str] = None
    is_active: Optional[bool] = None

class ProjectResponse(ProjectBase):
    id: UUID
    class_id: Any = None
    teacher_id: UUID
    is_active: bool = True
    created_at: datetime
    rubric: Optional[RubricResponse] = None

    class Config:
        from_attributes = True

# --- Submission Schemas ---

class SubmissionEvidenceBase(BaseModel):
    evidence_type: SubmissionType
    content_url: Optional[str] = None
    content_text: Optional[str] = None

class SubmissionEvidenceCreate(SubmissionEvidenceBase):
    pass

class SubmissionEvidenceResponse(SubmissionEvidenceBase):
    id: UUID
    submission_id: UUID
    uploaded_at: datetime

    class Config:
        from_attributes = True

class ProjectSubmissionBase(BaseModel):
    comment: Optional[str] = None

class ProjectSubmissionCreate(ProjectSubmissionBase):
    assignment_id: UUID
    evidence: List[SubmissionEvidenceCreate]

class ProjectSubmissionResponse(ProjectSubmissionBase):
    id: UUID
    assignment_id: UUID
    status: SubmissionStatus
    submitted_at: datetime
    evidence: List[SubmissionEvidenceResponse]

    class Config:
        from_attributes = True

# --- Evaluation Schemas ---

class EvaluationScoreBase(BaseModel):
    criterion_id: UUID
    score: float
    feedback: Optional[str] = None

class EvaluationScoreCreate(EvaluationScoreBase):
    pass

class EvaluationScoreResponse(EvaluationScoreBase):
    id: UUID
    evaluation_id: UUID

    class Config:
        from_attributes = True

class ProjectEvaluationBase(BaseModel):
    evaluator_type: EvaluatorType
    overall_feedback: Optional[str] = None

class ProjectEvaluationCreate(ProjectEvaluationBase):
    submission_id: UUID
    scores: List[EvaluationScoreCreate]

class ProjectEvaluationResponse(ProjectEvaluationBase):
    id: UUID
    submission_id: UUID
    evaluator_id: UUID
    evaluated_at: datetime
    scores: List[EvaluationScoreResponse]

    class Config:
        from_attributes = True
