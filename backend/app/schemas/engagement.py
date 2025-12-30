"""
Pydantic schemas for Engagement tracking.
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime
from app.models.engagement import EventType, AttendanceStatus

class EngagementEventBase(BaseModel):
    event_type: EventType
    engagement_value: float = 1.0
    description: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None

class EngagementEventCreate(EngagementEventBase):
    student_id: UUID
    class_id: UUID

class EngagementEventResponse(EngagementEventBase):
    id: UUID
    student_id: UUID
    class_id: UUID
    timestamp: datetime

    class Config:
        from_attributes = True

class AttendanceRecordBase(BaseModel):
    status: AttendanceStatus
    note: Optional[str] = None

class AttendanceRecordCreate(AttendanceRecordBase):
    student_id: UUID
    class_id: UUID
    date: datetime

class AttendanceRecordResponse(AttendanceRecordBase):
    id: UUID
    student_id: UUID
    class_id: UUID
    date: datetime

    class Config:
        from_attributes = True

class EngagementIndexResponse(BaseModel):
    student_id: UUID
    class_id: UUID
    index_score: float
    contributing_factors: Dict[str, Any]
    trend: str
    risk_level: str
    last_updated: datetime

    class Config:
        from_attributes = True
