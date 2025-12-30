"""
Thought Proof API endpoints for keystroke recording and verification.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from pydantic import BaseModel
from datetime import datetime
import uuid

from app.database import get_db
from app.dependencies import get_current_user
from app.models.user import User
from app.models.thought_proof import ThoughtProof
from app.services.thought_proof_service import ThoughtProofService
from app.config import get_settings

router = APIRouter(prefix="/thought-proof", tags=["Thought Proof"])
settings = get_settings()


# Schemas
class KeystrokeEventSchema(BaseModel):
    timestamp: str
    type: str  # 'insert', 'delete', 'paste', 'cursor_move'
    content: str | None = None
    position: int | None = None
    length: int | None = None
    line: int | None = None
    column: int | None = None


class RecordBatchRequest(BaseModel):
    events: List[KeystrokeEventSchema]


class ThoughtProofResponse(BaseModel):
    id: str
    student_assignment_id: str
    started_at: datetime
    finalized_at: datetime | None
    total_duration_seconds: int
    events_count: int
    narration_text: str | None
    replay_hash: str | None
    verified: bool
    verified_at: datetime | None
    
    class Config:
        from_attributes = True


@router.post("/start/{student_assignment_id}", response_model=ThoughtProofResponse)
def start_recording(
    student_assignment_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Start a new proof of thought recording session.
    """
    # TODO: Verify student owns this assignment
    
    proof = ThoughtProofService.start_recording(db, student_assignment_id)
    
    return ThoughtProofResponse(
        id=str(proof.id),
        student_assignment_id=str(proof.student_assignment_id),
        started_at=proof.started_at,
        finalized_at=proof.finalized_at,
        total_duration_seconds=proof.total_duration_seconds,
        events_count=proof.events_count,
        narration_text=proof.narration_text,
        replay_hash=proof.replay_hash,
        verified=proof.verified,
        verified_at=proof.verified_at
    )


@router.post("/record/{thought_proof_id}")
def record_keystroke_batch(
    thought_proof_id: uuid.UUID,
    batch: RecordBatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Record a batch of keystroke events.
    """
    events_data = [event.model_dump() for event in batch.events]
    count = ThoughtProofService.record_keystroke_batch(db, thought_proof_id, events_data)
    
    return {"recorded": count, "message": f"Recorded {count} events"}


@router.post("/finalize/{thought_proof_id}", response_model=ThoughtProofResponse)
def finalize_proof(
    thought_proof_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Finalize the proof: generate replay data and cryptographic signature.
    """
    # Use a simple key for now (in production, use proper key management)
    private_key = settings.SECRET_KEY
    
    proof = ThoughtProofService.finalize_proof(db, thought_proof_id, private_key)
    
    return ThoughtProofResponse(
        id=str(proof.id),
        student_assignment_id=str(proof.student_assignment_id),
        started_at=proof.started_at,
        finalized_at=proof.finalized_at,
        total_duration_seconds=proof.total_duration_seconds,
        events_count=proof.events_count,
        narration_text=proof.narration_text,
        replay_hash=proof.replay_hash,
        verified=proof.verified,
        verified_at=proof.verified_at
    )


@router.post("/generate-narration/{thought_proof_id}")
async def generate_narration(
    thought_proof_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Generate AI narration of the student's thought process.
    """
    from app.ai.gemini_service import GeminiService
    
    gemini = GeminiService()
    narration = await ThoughtProofService.generate_narration(db, thought_proof_id, gemini)
    
    return {"narration": narration}


@router.get("/replay/{thought_proof_id}")
def get_replay_data(
    thought_proof_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get replay data for visualization.
    """
    replay_data = ThoughtProofService.get_replay_data(db, thought_proof_id)
    
    return replay_data


@router.get("/verify/{thought_proof_id}")
def verify_proof(
    thought_proof_id: uuid.UUID,
    db: Session = Depends(get_db)
):
    """
    Verify the cryptographic signature of a proof (public endpoint).
    """
    public_key = settings.SECRET_KEY  # Same key for HMAC
    is_valid = ThoughtProofService.verify_proof(db, thought_proof_id, public_key)
    
    proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
    
    return {
        "valid": is_valid,
        "verified_at": proof.verified_at if proof else None,
        "replay_hash": proof.replay_hash if proof else None
    }


@router.get("/{thought_proof_id}", response_model=ThoughtProofResponse)
def get_thought_proof(
    thought_proof_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Get thought proof details.
    """
    proof = db.query(ThoughtProof).filter(ThoughtProof.id == thought_proof_id).first()
    
    if not proof:
        raise HTTPException(status_code=404, detail="Thought proof not found")
    
    return ThoughtProofResponse(
        id=str(proof.id),
        student_assignment_id=str(proof.student_assignment_id),
        started_at=proof.started_at,
        finalized_at=proof.finalized_at,
        total_duration_seconds=proof.total_duration_seconds,
        events_count=proof.events_count,
        narration_text=proof.narration_text,
        replay_hash=proof.replay_hash,
        verified=proof.verified,
        verified_at=proof.verified_at
    )
