"""
Notification model.
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class NotificationType(str, enum.Enum):
    """Notification type enumeration."""
    ASSIGNMENT = "assignment"
    SYSTEM = "system"
    GRADE = "grade"
    REMINDER = "reminder"
    RESOURCE = "resource"

class Notification(Base):
    """User notification model."""
    __tablename__ = "notifications"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    recipient_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(SQLEnum(NotificationType), default=NotificationType.SYSTEM)
    reference_id = Column(Uuid, nullable=True) # ID of related entity (e.g. assignment_id)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    recipient = relationship("User", back_populates="notifications", foreign_keys=[recipient_id])
