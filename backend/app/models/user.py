"""
User and authentication related database models.
Includes User, Institution, and RefreshToken models.
"""

from sqlalchemy import Column, String, Boolean, DateTime, ForeignKey, Enum as SQLEnum, Uuid, Integer
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class UserRole(str, enum.Enum):
    """User role enumeration."""
    ADMIN = "admin"
    TEACHER = "teacher"
    STUDENT = "student"


class Institution(Base):
    """Institution/School model."""
    __tablename__ = "institutions"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    address = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    users = relationship("User", back_populates="institution")
    classes = relationship("Class", back_populates="institution")


class User(Base):
    """User model for all user types (admin, teacher, student)."""
    __tablename__ = "users"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=True, index=True)  # Made nullable for URN-only users
    urn = Column(String(100), unique=True, nullable=True, index=True)  # University Registration Number
    password_hash = Column(String(255), nullable=False)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, index=True)
    institution_id = Column(Uuid, ForeignKey("institutions.id"), nullable=True)
    is_active = Column(Boolean, default=True)
    profile_image = Column(String(500), nullable=True)
    dark_energy = Column(Integer, default=0) # Focus currency
    cognitive_score = Column(Integer, default=0) # Academic Focus Score
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    institution = relationship("Institution", back_populates="users")
    refresh_tokens = relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    
    # Teacher relationships
    taught_classes = relationship("Class", back_populates="teacher", foreign_keys="Class.teacher_id")
    created_projects = relationship("Project", back_populates="teacher", foreign_keys="Project.teacher_id")
    created_assignments = relationship("Assignment", back_populates="teacher", foreign_keys="Assignment.teacher_id")
    
    # Student relationships
    enrollments = relationship("Enrollment", back_populates="student", foreign_keys="Enrollment.student_id")
    project_assignments = relationship("ProjectAssignment", back_populates="student", foreign_keys="ProjectAssignment.student_id")
    engagement_events = relationship("EngagementEvent", back_populates="student", foreign_keys="EngagementEvent.student_id")
    engagement_indices = relationship("EngagementIndex", back_populates="student", foreign_keys="EngagementIndex.student_id")
    attendance_records = relationship("AttendanceRecord", back_populates="student", foreign_keys="AttendanceRecord.student_id")
    mastery_records = relationship("StudentMastery", back_populates="student", foreign_keys="StudentMastery.student_id")
    student_assignments = relationship("StudentAssignment", back_populates="student", foreign_keys="StudentAssignment.student_id")
    adaptive_recommendations = relationship("AdaptiveRecommendation", back_populates="student", foreign_keys="AdaptiveRecommendation.student_id")
    
    # Evaluation relationships
    evaluations_given = relationship("ProjectEvaluation", back_populates="evaluator", foreign_keys="ProjectEvaluation.evaluator_id")
    
    # Notifications
    notifications = relationship("Notification", back_populates="recipient", cascade="all, delete-orphan")
    
    # Gamification
    daily_challenges = relationship("DailyChallenge", back_populates="student", cascade="all, delete-orphan")
    
    @property
    def full_name(self) -> str:
        """Get user's full name."""
        return f"{self.first_name} {self.last_name}"


class RefreshToken(Base):
    """Refresh token model for JWT authentication."""
    __tablename__ = "refresh_tokens"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token = Column(String(500), unique=True, nullable=False, index=True)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="refresh_tokens")
