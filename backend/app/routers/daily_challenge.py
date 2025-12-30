from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date, datetime, timedelta
from app.database import get_db
from app.models.user import User, UserRole
from app.models.daily_challenge import DailyChallenge
from app.schemas.daily_challenge import DailyChallengeCreate, DailyChallengeResponse, GameStatus
from app.dependencies import get_current_user
import uuid

router = APIRouter(
    prefix="/daily-challenge",
    tags=["daily-challenge"]
)

@router.get("/status", response_model=GameStatus)
def get_game_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Check if the student can play the daily game today.
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can play.")

    today = date.today()
    
    # Check if played today
    todays_challenge = db.query(DailyChallenge).filter(
        DailyChallenge.student_id == current_user.id,
        DailyChallenge.date == today
    ).first()
    
    # Calculate total points
    total_points = db.query(func.sum(DailyChallenge.score)).filter(
        DailyChallenge.student_id == current_user.id
    ).scalar() or 0
    
    can_play = todays_challenge is None
    
    # Calculate next play time (midnight tomorrow)
    next_play_at = None
    if not can_play:
        tomorrow = datetime.now().date() + timedelta(days=1)
        next_play_at = datetime.combine(tomorrow, datetime.min.time())

    # Deterministic Randomization for Game Selection
    # List of available games (managed by frontend registry)
    AVAILABLE_GAMES = [
        "neural_pattern", 
        "quantum_math", 
        "lexical_voids", 
        "astro_focus",
        "cosmic_sequence",
        "nebula_navigator",
        "gravity_well",
        "stellar_synthesis",
        "void_echoes",
        "photon_stream",
        "orbital_resonance",
        "dark_matter_miner"
    ]
    
    # Create a seed using user ID and today's date
    seed_str = f"{current_user.id}_{today.isoformat()}"
    # Simple hash to get an index
    game_index = hash(seed_str) % len(AVAILABLE_GAMES)
    assigned_game_type = AVAILABLE_GAMES[game_index]

    return GameStatus(
        can_play=can_play,
        last_played_date=todays_challenge.date if todays_challenge else None,
        next_play_at=next_play_at,
        total_points=total_points,
        assigned_game_type=assigned_game_type
    )

@router.post("/complete", response_model=DailyChallengeResponse)
def complete_challenge(
    challenge: DailyChallengeCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Submit a score for the daily challenge.
    """
    if current_user.role != UserRole.STUDENT:
        raise HTTPException(status_code=403, detail="Only students can play.")
        
    today = date.today()
    
    # Verify not already played
    existing = db.query(DailyChallenge).filter(
        DailyChallenge.student_id == current_user.id,
        DailyChallenge.date == today
    ).first()
    
    if existing:
        raise HTTPException(status_code=400, detail="Daily challenge already completed for today.")
    
    new_challenge = DailyChallenge(
        student_id=current_user.id,
        date=today,
        score=challenge.score,
        game_type=challenge.game_type
    )
    
    db.add(new_challenge)
    db.commit()
    db.refresh(new_challenge)
    
    return new_challenge
