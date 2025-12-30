from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID
from enum import Enum

class TopicStatus(str, Enum):
    PENDING = "PENDING"
    COMPLETED = "COMPLETED"

class SyllabusTopicBase(BaseModel):
    title: str
    status: Optional[TopicStatus] = TopicStatus.PENDING

class SyllabusTopicCreate(SyllabusTopicBase):
    pass

class SyllabusTopicUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[TopicStatus] = None

class SyllabusTopicResponse(SyllabusTopicBase):
    id: UUID
    class_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
