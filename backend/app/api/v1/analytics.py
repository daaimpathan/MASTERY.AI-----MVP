from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies import get_current_user, require_role
from app.models.user import User, UserRole
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/teacher/dashboard")
def get_teacher_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
):
    return AnalyticsService.get_teacher_dashboard_stats(db, current_user.id)

@router.get("/student/dashboard")
def get_student_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role([UserRole.STUDENT]))
):
    return AnalyticsService.get_student_dashboard_stats(db, current_user.id)
