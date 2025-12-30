"""
Engagement tracking related database models.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Numeric, Date, Enum as SQLEnum, UniqueConstraint, Index, JSON, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class EventType(str, enum.Enum):
    """Engagement event types."""
    ATTENDANCE = "attendance"
    ASSIGNMENT_SUBMISSION = "assignment_submission"
    QUIZ_PARTICIPATION = "quiz_participation"
    INTERACTION = "interaction"
    LOGIN = "login"
    RESOURCE_ACCESS = "resource_access"
    DISCUSSION_POST = "discussion_post"


class EngagementEvent(Base):
    """Individual engagement event."""
    __tablename__ = "engagement_events"
    __table_args__ = (
        Index('idx_student_class', 'student_id', 'class_id'),
        Index('idx_timestamp', 'timestamp'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False)
    event_type = Column(SQLEnum(EventType), nullable=False)
    event_subtype = Column(String(50), nullable=True)
    event_data = Column(JSON, nullable=True)  # Flexible JSON data for event-specific info
    engagement_value = Column(Numeric(5, 2), nullable=True)  # Pre-calculated engagement contribution
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("User", back_populates="engagement_events", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="engagement_events")


class EngagementIndex(Base):
    """Calculated engagement index for a student in a class."""
    __tablename__ = "engagement_index"
    __table_args__ = (
        UniqueConstraint('student_id', 'class_id', 'period_start', 'period_end', name='uq_engagement_period'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    index_score = Column(Numeric(5, 2), nullable=False)  # 0-100
    contributing_factors = Column(JSON, nullable=True)  # Detailed breakdown of factors
    calculated_at = Column(DateTime(timezone=True), server_default=func.now())
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    
    # Relationships
    student = relationship("User", back_populates="engagement_indices", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="engagement_indices")


class AttendanceStatus(str, enum.Enum):
    """Attendance status enumeration."""
    PRESENT = "present"
    ABSENT = "absent"
    LATE = "late"
    EXCUSED = "excused"


class AttendanceRecord(Base):
    """Daily attendance record for a student."""
    __tablename__ = "attendance_records"
    __table_args__ = (
        UniqueConstraint('student_id', 'class_id', 'date', name='uq_attendance_date'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)
    status = Column(SQLEnum(AttendanceStatus), nullable=False)
    recorded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("User", back_populates="attendance_records", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="attendance_records")
