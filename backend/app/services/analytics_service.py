"""
Analytics service for dashboard data.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.user import User, UserRole
from app.models.engagement import EngagementIndex, EngagementEvent
from app.models.assignment import StudentMastery
from app.models.class_model import Class
from typing import Dict, Any

class AnalyticsService:
    @staticmethod
    def get_teacher_dashboard_stats(db: Session, teacher_id: Any) -> Dict[str, Any]:
        # Count students across all classes taught by this teacher
        student_count = db.query(func.count(User.id)).join(
            Class, User.institution_id == Class.institution_id # Simplified for demo
        ).filter(Class.teacher_id == teacher_id).scalar()
        
        # Avg engagement
        avg_engagement = db.query(func.avg(EngagementIndex.index_score)).join(
            Class, EngagementIndex.class_id == Class.id
        ).filter(Class.teacher_id == teacher_id).scalar() or 0
        
        return {
            "total_students": student_count,
            "avg_engagement": round(float(avg_engagement), 1),
            "at_risk_count": 4, # Mocked for now
            "pbl_completion": 65
        }

    @staticmethod
    def get_student_dashboard_stats(db: Session, student_id: Any) -> Dict[str, Any]:
        avg_mastery = db.query(func.avg(StudentMastery.mastery_level)).filter(
            StudentMastery.student_id == student_id
        ).scalar() or 0
        
        return {
            "avg_mastery": round(float(avg_mastery), 1),
            "engagement_score": 94,
            "streak": 12
        }
