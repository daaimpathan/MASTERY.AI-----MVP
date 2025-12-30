from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
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
