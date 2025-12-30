"""
Resource and ResourceRequest database models.
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Enum as SQLEnum, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class ResourceType(str, enum.Enum):
    """Resource type enumeration."""
    PDF = "pdf"
    VIDEO = "video"
    LINK = "link"
    NOTES = "notes"


class RequestStatus(str, enum.Enum):
    """Resource request status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


class Resource(Base):
    """Educational resource model."""
    __tablename__ = "resources"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(ResourceType), nullable=False, index=True)
    file_path = Column(String(500), nullable=True)  # For uploaded files (PDFs, etc.)
    url = Column(String(500), nullable=True)  # For video links, external links
    content = Column(Text, nullable=True)  # For notes/text content
    teacher_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    teacher = relationship("User", foreign_keys=[teacher_id])
    class_obj = relationship("Class", back_populates="resources")


class ResourceRequest(Base):
    """Student resource request model."""
    __tablename__ = "resource_requests"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    type = Column(SQLEnum(ResourceType), nullable=False, index=True)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False, index=True)
    status = Column(SQLEnum(RequestStatus), nullable=False, default=RequestStatus.PENDING, index=True)
    teacher_response = Column(Text, nullable=True)  # Optional feedback from teacher
    approved_resource_id = Column(Uuid, ForeignKey("resources.id"), nullable=True)  # Link to created resource if approved
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    class_obj = relationship("Class", foreign_keys=[class_id])
    approved_resource = relationship("Resource", foreign_keys=[approved_resource_id])
