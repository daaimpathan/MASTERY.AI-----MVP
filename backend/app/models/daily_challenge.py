from sqlalchemy import Column, Integer, DateTime, ForeignKey, Date, Uuid, String
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base

class DailyChallenge(Base):
    """
    Model to track daily game participation and scores.
    """
    __tablename__ = "daily_challenges"

    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(Date, nullable=False, index=True)  # Stores just the date to enforce one-per-day
    game_type = Column(String(50), nullable=False, default="neural_pattern")
    score = Column(Integer, default=0)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationships
    student = relationship("User", back_populates="daily_challenges")
