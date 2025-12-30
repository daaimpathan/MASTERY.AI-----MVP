"""
Class and enrollment related database models.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class Class(Base):
    """Class/Course model."""
    __tablename__ = "classes"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    teacher_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    institution_id = Column(Uuid, ForeignKey("institutions.id"), nullable=True)
    academic_year = Column(String(20), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    teacher = relationship("User", back_populates="taught_classes", foreign_keys=[teacher_id])
    institution = relationship("Institution", back_populates="classes")
    enrollments = relationship("Enrollment", back_populates="class_obj", cascade="all, delete-orphan")
    projects = relationship("Project", back_populates="class_obj")
    assignments = relationship("Assignment", back_populates="class_obj")
    engagement_events = relationship("EngagementEvent", back_populates="class_obj")
    engagement_indices = relationship("EngagementIndex", back_populates="class_obj")
    attendance_records = relationship("AttendanceRecord", back_populates="class_obj")
    resources = relationship("Resource", back_populates="class_obj")
    syllabus_topics = relationship("SyllabusTopic", back_populates="class_obj", cascade="all, delete-orphan")


class Enrollment(Base):
    """Student enrollment in a class."""
    __tablename__ = "enrollments"
    __table_args__ = (
        UniqueConstraint('student_id', 'class_id', name='uq_student_class'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    enrolled_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("User", back_populates="enrollments", foreign_keys=[student_id])
    class_obj = relationship("Class", back_populates="enrollments")
