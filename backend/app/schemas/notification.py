from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.notification import NotificationType

class NotificationBase(BaseModel):
    title: str
    message: str
    type: NotificationType = NotificationType.SYSTEM
    reference_id: Optional[UUID] = None

class NotificationCreate(NotificationBase):
    recipient_id: UUID

class NotificationResponse(NotificationBase):
    id: UUID
    recipient_id: UUID
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
