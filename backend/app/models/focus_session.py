from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Uuid, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base

class SessionStatus(str, enum.Enum):
    COMPLETED = "completed"
    ABORTED = "aborted"
    IN_PROGRESS = "in_progress"

class FocusSession(Base):
    """Tracks a student's deep work session."""
    __tablename__ = "focus_sessions"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    user_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    start_time = Column(DateTime(timezone=True), server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    
    duration_minutes = Column(Integer, default=0)
    distractions_count = Column(Integer, default=0)
    energy_earned = Column(Integer, default=0)
    
    status = Column(SQLEnum(SessionStatus), default=SessionStatus.IN_PROGRESS)
    
    user = relationship("User", backref="focus_sessions")
