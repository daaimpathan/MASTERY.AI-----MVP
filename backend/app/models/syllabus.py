"""
Syllabus related database models.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Enum, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class TopicStatus(str, enum.Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"

class SyllabusTopic(Base):
    """Syllabus Topic model."""
    __tablename__ = "syllabus_topics"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    status = Column(Enum(TopicStatus), default=TopicStatus.PENDING, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    class_obj = relationship("Class", back_populates="syllabus_topics")
