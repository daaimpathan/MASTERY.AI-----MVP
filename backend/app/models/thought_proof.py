"""
Proof of Thought models for anti-plagiarism verification.
Tracks keystroke events and generates cryptographically signed proof of work.
"""

from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Integer, Boolean, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
from app.database import Base


class ThoughtProof(Base):
    """Main proof of thought record linked to assignment submission."""
    __tablename__ = "thought_proofs"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_assignment_id = Column(Uuid, ForeignKey("student_assignments.id", ondelete="CASCADE"), nullable=False, unique=True)
    
    # Recording session metadata
    started_at = Column(DateTime(timezone=True), nullable=False)
    finalized_at = Column(DateTime(timezone=True), nullable=True)
    total_duration_seconds = Column(Integer, default=0)  # Active typing time
    
    # Replay data (compressed JSON)
    events_json = Column(Text, nullable=True)  # Compressed keystroke events
    events_count = Column(Integer, default=0)
    
    # AI-generated narration
    narration_text = Column(Text, nullable=True)
    narration_generated_at = Column(DateTime(timezone=True), nullable=True)
    
    # Cryptographic verification
    replay_hash = Column(String(64), nullable=True)  # SHA-256 hash
    signature = Column(String(512), nullable=True)  # Cryptographic signature
    verified = Column(Boolean, default=False)
    verified_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student_assignment = relationship("StudentAssignment", back_populates="thought_proof")
    keystroke_events = relationship("KeystrokeEvent", back_populates="thought_proof", cascade="all, delete-orphan", order_by="KeystrokeEvent.timestamp")


class KeystrokeEvent(Base):
    """Individual keystroke/edit event during assignment work."""
    __tablename__ = "keystroke_events"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    thought_proof_id = Column(Uuid, ForeignKey("thought_proofs.id", ondelete="CASCADE"), nullable=False, index=True)
    
    # Event data
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    event_type = Column(String(20), nullable=False)  # 'insert', 'delete', 'paste', 'cursor_move'
    
    # Text content
    content = Column(Text, nullable=True)  # Text inserted/deleted
    position = Column(Integer, nullable=True)  # Cursor position
    length = Column(Integer, nullable=True)  # Length of change
    
    # Context
    line_number = Column(Integer, nullable=True)
    column_number = Column(Integer, nullable=True)
    
    # Relationships
    thought_proof = relationship("ThoughtProof", back_populates="keystroke_events")
