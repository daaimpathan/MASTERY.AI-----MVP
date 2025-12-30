from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import uuid
from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User, UserRole
from app.models.class_model import Class, Enrollment
from app.schemas.class_schema import ClassResponse

router = APIRouter(prefix="/classes", tags=["Class Management"])

@router.get("/", response_model=List[ClassResponse])
def list_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all classes for the current teacher."""
    classes = []
    
    print(f"Listing classes for user: {current_user.id}, Role: {current_user.role}", flush=True)
    
    # Check role - handle both Enum and string comparison just in case
    is_teacher = current_user.role == UserRole.TEACHER or str(current_user.role) == "teacher"
    is_admin = current_user.role == UserRole.ADMIN or str(current_user.role) == "admin"
    
    is_student = current_user.role == UserRole.STUDENT or str(current_user.role) == "student"

    if is_teacher:
        classes = db.query(Class).filter(Class.teacher_id == current_user.id).all()
        print(f"Found {len(classes)} classes in DB for teacher", flush=True)
    elif is_admin:
        classes = db.query(Class).all()
        print(f"Found {len(classes)} classes in DB for admin", flush=True)
    elif is_student:
        # Fetch classes student is enrolled in
        enrollments = db.query(Enrollment).filter(Enrollment.student_id == current_user.id).all()
        class_ids = [e.class_id for e in enrollments]
        classes = db.query(Class).filter(Class.id.in_(class_ids)).all()
    else:
        print(f"User is neither teacher nor admin. Role: {current_user.role}", flush=True)
        pass
    
    if not classes:
        print("No classes found. Returning empty list.", flush=True)
        pass
        
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
    current_user: User = Depends(get_current_user)
):
    """Create a new class."""
    
    # Allow creating class if teacher or admin
    # Allow creating class if teacher or admin
    is_teacher = str(current_user.role).lower() == "teacher" or str(current_user.role) == "UserRole.TEACHER"
    is_admin = str(current_user.role).lower() == "admin" or str(current_user.role) == "UserRole.ADMIN"
    
    if not is_teacher and not is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only teachers and admins can create classes"
        )
        
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
    current_user: User = Depends(get_current_user)
):
    """Enroll a student in a class."""
    
    # Check permissions
    is_teacher = str(current_user.role).lower() == "teacher" or str(current_user.role) == "UserRole.TEACHER"
    is_admin = str(current_user.role).lower() == "admin" or str(current_user.role) == "UserRole.ADMIN"

    if not is_teacher and not is_admin:
         raise HTTPException(status_code=403, detail="Not authorized")

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
