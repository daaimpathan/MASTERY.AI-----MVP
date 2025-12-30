from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.database import get_db
from app.dependencies import get_current_user, get_current_teacher, get_current_admin
from app.models.user import User, UserRole
from app.models.class_model import Class, Enrollment
from app.schemas.class_schema import ClassResponse

router = APIRouter(prefix="/classes", tags=["Class Management"])

@router.get("/", response_model=List[ClassResponse])
def list_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all classes for the current teacher or student."""
    classes = []
    
    # Use centralized logic for role verification
    from app.dependencies import require_role
    
    # Handle roles manually here because we want different behavior based on role
    # but use the same string conversion logic as require_role
    user_role = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)
    user_role = user_role.lower()
    
    if user_role == "teacher":
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
    elif user_role == "admin":
        classes = db.query(Class).all()
    elif user_role == "student":
        # Fetch classes student is enrolled in
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
        class_ids = [e.class_id for e in enrollments]
        classes = db.query(Class).filter(Class.id.in_(class_ids)).all()
        
    return classes

from pydantic import BaseModel

class ClassCreate(BaseModel):
    name: str
    subject: str = "General"
    academic_year: str = "2025-2026"
    institution_id: str = None  # Optional

@router.post("/", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):
    print(f"Creating class: {class_data.name} by user {current_user.id}")
    
    new_class = Class(
        id=uuid.uuid4(),
        name=class_data.name,
        subject=class_data.subject,
        teacher_id=current_user.id,
        institution_id=current_user.institution_id, # Default to user's institution
        academic_year=class_data.academic_year
    )
    
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    
    return new_class

class EnrollmentRequest(BaseModel):
    class_id: str
    student_email: str

@router.post("/{class_id}/enroll", status_code=status.HTTP_201_CREATED)
def enroll_student(
    class_id: str,
    enrollment_data: EnrollmentRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_teacher)
):

    # Find student
    student = db.query(User).filter(User.email == enrollment_data.student_email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
        
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.class_id == uuid.UUID(class_id)
    ).first()
    
    if existing:
        return {"message": "Already enrolled"}
        
    # Create enrollment
    enrollment = Enrollment(
        student_id=student.id,
        class_id=uuid.UUID(class_id)
    )
    db.add(enrollment)
    db.commit()
    
    return {"message": "Enrolled successfully", "student": student.email}
