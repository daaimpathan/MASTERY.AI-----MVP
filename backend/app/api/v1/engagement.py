"""
Engagement tracking API endpoints.
"""

from fastapi import APIRouter, Depends, status, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.schemas.engagement import (
    EngagementEventCreate, EngagementEventResponse,
    AttendanceRecordCreate, AttendanceRecordResponse,
    EngagementIndexResponse
)
from app.services.engagement_service import EngagementService

router = APIRouter(prefix="/engagement", tags=["Engagement Tracking"])

@router.post("/events", response_model=EngagementEventResponse, status_code=status.HTTP_201_CREATED)
def log_engagement_event(
    event_data: EngagementEventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Log an engagement event (participation, help request, etc)."""
    return EngagementService.log_event(db, event_data)

@router.get("/class/{class_id}", response_model=List[EngagementIndexResponse])
def get_class_engagement_indices(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Get engagement indices for all students in a class."""
    return EngagementService.get_class_engagement(db, class_id)

@router.post("/attendance", response_model=AttendanceRecordResponse, status_code=status.HTTP_201_CREATED)
def record_attendance(
    attendance_data: AttendanceRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Record student attendance."""
    return EngagementService.record_attendance(db, attendance_data)

@router.get("/student/{student_id}", response_model=List[EngagementIndexResponse])
def get_student_engagement(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get student engagement index across their classes."""
    # Logic to filter by student
    from app.models.engagement import EngagementIndex
    return db.query(EngagementIndex).filter(EngagementIndex.student_id == student_id).all()

@router.get("/attendance-trend/{class_id}")
def get_attendance_trend(
    class_id: UUID,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Get attendance trend data for a class over the specified number of days."""
    return EngagementService.get_attendance_trend(db, class_id, days)

@router.get("/attention-trend/{class_id}")
def get_attention_trend(
    class_id: UUID,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Get attention level trend data for a class over the specified number of days."""
    return EngagementService.get_attention_trend(db, class_id, days)

@router.get("/participation-trend/{class_id}")
def get_participation_trend(
    class_id: UUID,
    days: int = 30,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Get participation trend data for a class over the specified number of days."""
    return EngagementService.get_participation_trend(db, class_id, days)
@router.post("/analyze-cctv")
async def analyze_cctv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    """Analyze a CCTV frame for engagement."""
    content = await file.read()
    return EngagementService.analyze_cctv(db, content)
