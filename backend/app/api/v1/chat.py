from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Optional
from app.services.ai_service import ai_service
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Chat"])

class ChatMessage(BaseModel):
    role: str
    text: str

class ChatRequest(BaseModel):
    message: str
    history: List[ChatMessage] = []

from app.database import get_db
from sqlalchemy.orm import Session
from app.models.assignment import StudentAssignment, AssignmentStatus, StudentMastery

# ... existing code ...

@router.post("/chat/tutor")
async def chat_tutor(
    request: ChatRequest, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Chat with the AI tutor.
    """
    try:
        # Fetch Context
        context = {
            "first_name": current_user.first_name,
            "pending_assignments": [],
            "recent_low_mastery_topics": []
        }
        
        # 1. Get Pending Assignments
        try:
            pending = db.query(StudentAssignment).filter(
                StudentAssignment.student_id == current_user.id,
                StudentAssignment.status != AssignmentStatus.COMPLETED,
                StudentAssignment.status != AssignmentStatus.GRADED
            ).join(StudentAssignment.assignment).limit(3).all()
            
            context["pending_assignments"] = [sa.assignment.title for sa in pending if sa.assignment]
            
            # 2. Get Weak Areas (Mastery < 50)
            weak_masteries = db.query(StudentMastery).filter(
                StudentMastery.student_id == current_user.id,
                StudentMastery.mastery_level < 50.0
            ).limit(3).all()
            
            # Note: In real app, we'd join with Concept/Topic table to get names. 
            # For now assuming we can get a name or ID.
            # context["recent_low_mastery_topics"] = [m.topic_id for m in weak_masteries] 
        except Exception as db_e:
            print(f"Chat Context Warning: Failed to fetch context from DB: {db_e}")
            # Continue without context 

        # Convert Pydantic models to dicts for the service
        history_dicts = [{"role": msg.role, "text": msg.text} for msg in request.history]
        
        response = await ai_service.chat_with_tutor(request.message, history_dicts, context)
        return {"response": response}
    except Exception as e:
        print(f"Chat Error: {e}") # Debug log
        raise HTTPException(status_code=500, detail=str(e))
