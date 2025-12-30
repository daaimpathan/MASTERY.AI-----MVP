from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
from pydantic import BaseModel

from app.database import get_db
from app.models.user import User
from app.models.focus_session import FocusSession, SessionStatus
from app.dependencies import get_current_user
from app.services.ai_service import AIService

router = APIRouter(
    prefix="/focus",
    tags=["Focus"],
    responses={404: {"description": "Not found"}},
)
ai_service = AIService()

# Schemas
class FocusSessionStart(BaseModel):
    pass # No input needed for now

class FocusQuestionsRequest(BaseModel):
    topic: str

class FocusSessionEnd(BaseModel):
    session_id: str
    distractions: int

class FocusSessionResponse(BaseModel):
    session_id: str
    status: str
    energy_earned: int = 0
    message: str

@router.post("/start", response_model=FocusSessionResponse)
def start_session(
    input: FocusSessionStart,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if there is already an active session?
    # For now, let's just create a new one.
    
    new_session = FocusSession(
        user_id=current_user.id,
        status=SessionStatus.IN_PROGRESS
    )
    db.add(new_session)
    db.commit()
    db.refresh(new_session)
    
    return {
        "session_id": str(new_session.id),
        "status": "started",
        "energy_earned": 0,
        "message": "Focus session started. Good luck."
    }

@router.post("/end", response_model=FocusSessionResponse)
def end_session(
    input: FocusSessionEnd,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    session_uuid = uuid.UUID(input.session_id)
    session = db.query(FocusSession).filter(FocusSession.id == session_uuid, FocusSession.user_id == current_user.id).first()
    
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
        
    if session.status != SessionStatus.IN_PROGRESS:
        raise HTTPException(status_code=400, detail="Session already completed")
    
    now = datetime.now(timezone.utc)
    # Ensure start_time is timezone aware if not already
    start_time = session.start_time
    if start_time.tzinfo is None:
        start_time = start_time.replace(tzinfo=timezone.utc)
        
    duration = (now - start_time).total_seconds()
    minutes = int(duration // 60)
    
    # --- Scoring Logic ---
    # Rule 1: Minimum 30 minutes to earn ANY points
    if minutes < 30:
        earned_energy = 0
        cognitive_points = 0
        message = f"Session too short ({minutes} mins). Focus for at least 30 mins to score."
    else:
        # Rule 2: 1 Hour = 500 Cognitive Points
        # Formula: (Minutes / 60) * 500
        # Dark Energy remains 1 per minute for now (or maybe scale it too? keeping it simple for now)
        
        cognitive_points = int((minutes / 60) * 500)
        earned_energy = max(0, minutes - input.distractions) # Punishment for distractions on currency
        
        message = f"Session Result: {minutes} mins. +{cognitive_points} Cognitive Score. +{earned_energy} Dark Energy."

    # Update Session
    session.end_time = now
    session.duration_minutes = minutes
    session.distractions_count = input.distractions
    session.energy_earned = earned_energy
    session.status = SessionStatus.COMPLETED
    
    # Update User Balance
    current_user.dark_energy = (current_user.dark_energy or 0) + earned_energy
    current_user.cognitive_score = (current_user.cognitive_score or 0) + cognitive_points
    
    db.commit()
    
    return {
        "session_id": str(session.id),
        "status": "completed",
        "energy_earned": earned_energy,
        "message": message
    }

@router.post("/questions")
async def generate_focus_questions(
    input: FocusQuestionsRequest,
    current_user: User = Depends(get_current_user)
):
    """Generates 3 AI questions based on the focus topic."""
    result = await ai_service.generate_focus_assignment(input.topic)
    return result
