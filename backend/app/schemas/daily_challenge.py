from pydantic import BaseModel
from datetime import date, datetime
import uuid

class DailyChallengeBase(BaseModel):
    score: int
    game_type: str

class DailyChallengeCreate(DailyChallengeBase):
    pass

class DailyChallengeResponse(DailyChallengeBase):
    id: uuid.UUID
    student_id: uuid.UUID
    date: date
    completed_at: datetime
    
    class Config:
        from_attributes = True

class GameStatus(BaseModel):
    can_play: bool
    last_played_date: date | None
    next_play_at: datetime | None
    total_points: int
    assigned_game_type: str | None
