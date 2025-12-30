from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.services.mastery_service import MasteryService
from app.schemas.assignment import AssignmentCreate, AssignmentResponse, GradeSubmissionRequest
from app.models.assignment import Assignment, AssignmentStatus, StudentAssignment
from app.models.class_model import Enrollment
from app.models.notification import Notification, NotificationType
from datetime import datetime

# ... imports ...

router = APIRouter(prefix="/assignments", tags=["Assignments & Grading"])

from pydantic import BaseModel

class AIGenerateRequest(BaseModel):
    title: str

@router.post("/ai-generate")
async def generate_assignment_ai(
    request: AIGenerateRequest,
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Generate assignment description using AI."""
    from app.services.ai_service import ai_service
    return {"content": await ai_service.generate_assignment_content(request.title)}

@router.post("/", response_model=AssignmentResponse)
def create_assignment(
    assignment_data: AssignmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """
    Create a new assignment.
    """
    new_assignment = Assignment(
        title=assignment_data.title,
        description=assignment_data.description,
        assignment_type=assignment_data.assignment_type,
        due_date=assignment_data.due_date,
        class_id=assignment_data.class_id,
        teacher_id=current_user.id
    )
    
    db.add(new_assignment)
    db.commit()
    db.refresh(new_assignment)
    
    enrollments = db.query(Enrollment).filter(Enrollment.class_id == assignment_data.class_id).all()
    
    for enrollment in enrollments:
        # Create StudentAssignment
        sa = StudentAssignment(
            assignment_id=new_assignment.id,
            student_id=enrollment.student_id,
            status=AssignmentStatus.ASSIGNED
        )
        db.add(sa)
        
        # Create Notification
        notification = Notification(
            recipient_id=enrollment.student_id,
            title="New Assignment",
            message=f"You have a new assignment: {new_assignment.title}",
            type=NotificationType.ASSIGNMENT,
            reference_id=new_assignment.id
        )
        db.add(notification)
        
    db.commit()
    
    return new_assignment

@router.get("/pending", response_model=None)
def get_pending_submissions(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """
    Get all submissions waiting for grading for this teacher.
    """
    submissions = MasteryService.get_pending_submissions(db, current_user.id)
    
    # Simple manual serialization for demo to avoid circular schema dependencies
    # In real app, allow Pydantic to handle this with properly nested schemas
    return [
        {
            "id": s.id,
            "student_name": f"{s.student.first_name} {s.student.last_name}",
            "assignment_title": s.assignment.title,
            "submitted_at": s.submitted_at,
            "assignment_id": s.assignment_id,
            "student_id": s.student_id
        }
        for s in submissions
    ]

@router.get("/submissions/{submission_id}", response_model=None)
def get_submission_details(
    submission_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """
    Get full details of a submission for grading.
    """
    # Quick direct query for demo purposes - should be in Service layer
    from app.models.assignment import StudentAssignment, StudentResponse
    sa = db.query(StudentAssignment).filter(StudentAssignment.id == submission_id).first()
    
    if not sa:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    responses = db.query(StudentResponse).filter(StudentResponse.student_assignment_id == submission_id).all()
    
    return {
        "id": sa.id,
        "student_name": f"{sa.student.first_name} {sa.student.last_name}",
        "assignment_title": sa.assignment.title,
        "submitted_at": sa.submitted_at,
        "responses": [
            {
                "question_id": r.question_id,
                "question_text": r.question.question_text,
                "response_text": r.response_text,
                "correct_answer": r.question.correct_answer,
                "is_correct": r.is_correct
            }
            for r in responses
        ]
    }

@router.post("/submissions/{submission_id}/grade", status_code=status.HTTP_200_OK)
def grade_submission(
    submission_id: UUID,
    grade_request: GradeSubmissionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """
    Submit a manual grade and optional mastery boost.
    """
    result = MasteryService.grade_submission(
        db, 
        submission_id, 
        grade_request.grade, 
        grade_request.feedback, 
        grade_request.mastery_boost
    )
    
    if not result:
        raise HTTPException(status_code=404, detail="Submission not found")
        
    return {"message": "Grade recorded successfully", "status": "graded"}
