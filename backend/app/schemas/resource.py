"""
Resource and ResourceRequest Pydantic schemas.
Handles validation for resource management and request system.
"""

from pydantic import BaseModel, Field, HttpUrl
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum


class ResourceType(str, Enum):
    """Resource type enumeration."""
    PDF = "pdf"
    VIDEO = "video"
    LINK = "link"
    NOTES = "notes"


class RequestStatus(str, Enum):
    """Resource request status enumeration."""
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"


# Resource Schemas

class ResourceCreate(BaseModel):
    """Schema for creating a new resource."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: ResourceType
    url: Optional[str] = None  # For video/link types
    content: Optional[str] = None  # For notes type
    class_id: UUID
    
    class Config:
        from_attributes = True


class ResourceUpdate(BaseModel):
    """Schema for updating a resource."""
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    url: Optional[str] = None
    content: Optional[str] = None
    
    class Config:
        from_attributes = True


class TeacherInfo(BaseModel):
    """Basic teacher information."""
    id: UUID
    first_name: str
    last_name: str
    email: str
    
    class Config:
        from_attributes = True


class ResourceResponse(BaseModel):
    """Schema for resource response."""
    id: UUID
    title: str
    description: Optional[str]
    type: ResourceType
    file_path: Optional[str]
    url: Optional[str]
    content: Optional[str]
    teacher_id: UUID
    class_id: UUID
    created_at: datetime
    updated_at: datetime
    teacher: Optional[TeacherInfo] = None
    
    class Config:
        from_attributes = True


# Resource Request Schemas

class ResourceRequestCreate(BaseModel):
    """Schema for creating a resource request."""
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    type: ResourceType
    class_id: UUID
    
    class Config:
        from_attributes = True


class ResourceRequestAction(BaseModel):
    """Schema for teacher action on resource request."""
    teacher_response: Optional[str] = None
    
    class Config:
        from_attributes = True


class StudentInfo(BaseModel):
    """Basic student information."""
    id: UUID
    first_name: str
    last_name: str
    email: str
    
    class Config:
        from_attributes = True


class ResourceRequestResponse(BaseModel):
    """Schema for resource request response."""
    id: UUID
    title: str
    description: Optional[str]
    type: ResourceType
    student_id: UUID
    class_id: UUID
    status: RequestStatus
    teacher_response: Optional[str]
    approved_resource_id: Optional[UUID]
    created_at: datetime
    updated_at: datetime
    student: Optional[StudentInfo] = None
    
    class Config:
        from_attributes = True
