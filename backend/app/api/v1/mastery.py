"""
Mastery and Adaptive Assignment API endpoints.
"""

from fastapi import APIRouter, Depends, status, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.mastery import (
    AssignmentResponse, SubmissionCreate, SubmissionResponse, ConceptMasteryResponse
)
from app.services.mastery_service import MasteryService

router = APIRouter(prefix="/mastery", tags=["Mastery & Adaptive Learning"])

@router.get("/assignments/{assignment_id}/solve", response_model=AssignmentResponse)
def get_assignment_for_solving(
    assignment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.STUDENT]))
):
    """Get assignment details for solving."""
    assignment = MasteryService.get_assignment_for_solving(db, current_user.id, assignment_id)
    if not assignment:
        raise HTTPException(status_code=404, detail="Assignment not found or access denied")
    return assignment

@router.post("/assignments/adaptive", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
def create_adaptive_assignment(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.STUDENT]))
):
    """Generate a new adaptive practice assignment for the student."""
    return MasteryService.create_adaptive_assignment(db, current_user.id, class_id)

@router.get("/assignments", response_model=List[AssignmentResponse])
def get_my_assignments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all assignments for the current user."""
    return MasteryService.get_student_assignments(db, current_user.id)

@router.post("/submissions", response_model=SubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_assignment(
    submission_data: SubmissionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.STUDENT]))
):
    """Submit answers for an assignment and update mastery."""
    submission = MasteryService.submit_assignment(db, current_user.id, submission_data)
    if not submission:
        raise HTTPException(status_code=404, detail="Assignment not found")
    return submission

@router.get("/profile", response_model=List[ConceptMasteryResponse])
def get_mastery_profile(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get the current student's concept mastery profile."""
    return MasteryService.get_mastery_profile(db, current_user.id)
