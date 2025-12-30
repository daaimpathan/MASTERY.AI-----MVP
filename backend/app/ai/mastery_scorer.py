"""
Mastery Scorer - AI/ML Component
Tracks and updates concept-level mastery using Bayesian-inspired approach.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_
from app.models.assignment import StudentMastery, Concept, ConceptPrerequisite, QuestionDifficulty
from app.config import get_settings

settings = get_settings()


def update_mastery_score(
    db: Session,
    student_id: str,
    concept_id: str,
    is_correct: bool,
    difficulty: str,
    time_spent_seconds: int
) -> Dict[str, Any]:
    """
    Update student mastery for a concept based on performance.
    
    Uses a modified Bayesian approach:
    - Correct answers increase mastery
    - Incorrect answers decrease mastery
    - Difficulty and time spent influence the update magnitude
    - Mastery decays over time if not practiced
    
    Args:
        db: Database session
        student_id: Student UUID
        concept_id: Concept UUID
        is_correct: Whether the answer was correct
        difficulty: Question difficulty ('easy', 'medium', 'hard')
        time_spent_seconds: Time spent on the question
        
    Returns:
        {
            'previous_mastery': float,
            'new_mastery': float,
            'change': float,
            'performance_score': float
        }
    """
    # Get or create mastery record
    mastery = db.query(StudentMastery).filter(
        and_(
            StudentMastery.student_id == student_id,
            StudentMastery.concept_id == concept_id
        )
    ).first()
    
    if not mastery:
        mastery = StudentMastery(
            student_id=student_id,
            concept_id=concept_id,
            mastery_level=0.0,
            attempts=0
        )
        db.add(mastery)
    
    current_mastery = float(mastery.mastery_level)
    
    # Calculate performance score (0-1)
    if is_correct:
        # Correct answer: higher difficulty = more mastery gain
        difficulty_multiplier = {
            QuestionDifficulty.EASY.value: 0.5,
            QuestionDifficulty.MEDIUM.value: 1.0,
            QuestionDifficulty.HARD.value: 1.5
        }.get(difficulty, 1.0)
        performance_score = 0.7 + (0.3 * difficulty_multiplier)
    else:
        # Incorrect answer: higher difficulty = less mastery loss
        difficulty_multiplier = {
            QuestionDifficulty.EASY.value: 1.5,
            QuestionDifficulty.MEDIUM.value: 1.0,
            QuestionDifficulty.HARD.value: 0.5
        }.get(difficulty, 1.0)
        performance_score = 0.3 - (0.2 * difficulty_multiplier)
    
    # Get expected time for this concept/difficulty
    expected_time = _get_expected_time(db, concept_id, difficulty)
    
    # Time factor (optimal time = good, too fast or too slow = concerning)
    if expected_time > 0:
        time_ratio = time_spent_seconds / expected_time
        time_factor = 1.0 if 0.5 <= time_ratio <= 1.5 else 0.8
    else:
        time_factor = 1.0
    
    # Learning rate (decreases as mastery increases - harder to improve at high mastery)
    learning_rate = 0.3 * (1 - current_mastery / 100)
    
    # Calculate mastery change
    mastery_change = (performance_score - current_mastery / 100) * learning_rate * time_factor * 100
    
    # Update mastery (bounded 0-100)
    new_mastery = max(0, min(100, current_mastery + mastery_change))
    
    # Apply temporal decay for concepts not practiced recently
    if mastery.last_practiced:
        days_since_practice = (datetime.utcnow() - mastery.last_practiced).days
        if days_since_practice > settings.MASTERY_DECAY_GRACE_PERIOD_DAYS:
            decay_days = days_since_practice - settings.MASTERY_DECAY_GRACE_PERIOD_DAYS
            decay_factor = (1 - settings.MASTERY_DECAY_RATE) ** decay_days
            new_mastery *= decay_factor
    
    # Update database
    mastery.mastery_level = new_mastery
    mastery.attempts += 1
    mastery.last_practiced = datetime.utcnow()
    db.commit()
    db.refresh(mastery)
    
    return {
        'previous_mastery': round(current_mastery, 2),
        'new_mastery': round(new_mastery, 2),
        'change': round(mastery_change, 2),
        'performance_score': round(performance_score, 2),
        'attempts': mastery.attempts
    }


def get_mastery_gaps(
    db: Session,
    student_id: str,
    threshold: float = None,
    limit: int = 10
) -> List[Dict[str, Any]]:
    """
    Identify concepts where student has low mastery.
    Returns prioritized list of concepts to practice.
    
    Args:
        db: Database session
        student_id: Student UUID
        threshold: Mastery threshold (default from config)
        limit: Maximum number of gaps to return
        
    Returns:
        List of gaps with priority scores
    """
    if threshold is None:
        threshold = settings.MASTERY_THRESHOLD
    
    # Get all mastery records for student
    mastery_records = db.query(StudentMastery).filter(
        StudentMastery.student_id == student_id
    ).all()
    
    # Create mastery map
    mastery_map = {str(m.concept_id): float(m.mastery_level) for m in mastery_records}
    
    gaps = []
    
    for concept_id, mastery_level in mastery_map.items():
        if mastery_level < threshold:
            # Get concept details
            concept = db.query(Concept).filter(Concept.id == concept_id).first()
            if not concept:
                continue
            
            # Check prerequisites
            prerequisites = db.query(ConceptPrerequisite).filter(
                ConceptPrerequisite.concept_id == concept_id
            ).all()
            
            prereq_mastery_levels = [
                mastery_map.get(str(p.prerequisite_id), 0)
                for p in prerequisites
            ]
            
            avg_prereq_mastery = (
                sum(prereq_mastery_levels) / len(prereq_mastery_levels)
                if prereq_mastery_levels else 100
            )
            
            # Priority: lower mastery + prerequisites met = higher priority
            priority = (threshold - mastery_level) * (avg_prereq_mastery / 100)
            
            gaps.append({
                'concept_id': concept_id,
                'concept_name': concept.name,
                'subject': concept.subject,
                'mastery_level': round(mastery_level, 2),
                'priority': round(priority, 2),
                'prerequisites_ready': avg_prereq_mastery >= threshold,
                'avg_prerequisite_mastery': round(avg_prereq_mastery, 2)
            })
    
    # Sort by priority (descending)
    gaps.sort(key=lambda x: x['priority'], reverse=True)
    
    return gaps[:limit]


def get_student_mastery_graph(
    db: Session,
    student_id: str,
    subject: Optional[str] = None
) -> Dict[str, Any]:
    """
    Get complete mastery graph for a student.
    
    Args:
        db: Database session
        student_id: Student UUID
        subject: Optional subject filter
        
    Returns:
        Mastery graph with nodes and edges
    """
    # Get all mastery records
    query = db.query(StudentMastery, Concept).join(
        Concept, StudentMastery.concept_id == Concept.id
    ).filter(StudentMastery.student_id == student_id)
    
    if subject:
        query = query.filter(Concept.subject == subject)
    
    records = query.all()
    
    # Build nodes
    nodes = []
    for mastery, concept in records:
        nodes.append({
            'id': str(concept.id),
            'name': concept.name,
            'subject': concept.subject,
            'difficulty_level': concept.difficulty_level.value if concept.difficulty_level else None,
            'mastery_level': round(float(mastery.mastery_level), 2),
            'attempts': mastery.attempts,
            'last_practiced': mastery.last_practiced.isoformat() if mastery.last_practiced else None
        })
    
    # Build edges (prerequisites)
    edges = []
    concept_ids = [str(concept.id) for _, concept in records]
    
    prerequisites = db.query(ConceptPrerequisite).filter(
        ConceptPrerequisite.concept_id.in_(concept_ids)
    ).all()
    
    for prereq in prerequisites:
        edges.append({
            'from': str(prereq.prerequisite_id),
            'to': str(prereq.concept_id)
        })
    
    # Calculate overall statistics
    mastery_levels = [float(m.mastery_level) for m, _ in records]
    
    return {
        'nodes': nodes,
        'edges': edges,
        'statistics': {
            'total_concepts': len(nodes),
            'average_mastery': round(sum(mastery_levels) / len(mastery_levels), 2) if mastery_levels else 0,
            'mastered_concepts': sum(1 for m in mastery_levels if m >= settings.MASTERY_THRESHOLD),
            'struggling_concepts': sum(1 for m in mastery_levels if m < 50)
        }
    }


def _get_expected_time(db: Session, concept_id: str, difficulty: str) -> int:
    """
    Get expected time for a concept/difficulty combination.
    
    In production, this would use historical data.
    For now, use heuristic values.
    """
    base_times = {
        QuestionDifficulty.EASY.value: 60,      # 1 minute
        QuestionDifficulty.MEDIUM.value: 180,   # 3 minutes
        QuestionDifficulty.HARD.value: 300      # 5 minutes
    }
    
    return base_times.get(difficulty, 180)


def calculate_mastery_decay(
    db: Session,
    student_id: str,
    concept_id: str
) -> float:
    """
    Calculate mastery decay for a concept based on time since last practice.
    
    Args:
        db: Database session
        student_id: Student UUID
        concept_id: Concept UUID
        
    Returns:
        Decayed mastery level
    """
    mastery = db.query(StudentMastery).filter(
        and_(
            StudentMastery.student_id == student_id,
            StudentMastery.concept_id == concept_id
        )
    ).first()
    
    if not mastery or not mastery.last_practiced:
        return 0.0
    
    current_mastery = float(mastery.mastery_level)
    days_since_practice = (datetime.utcnow() - mastery.last_practiced).days
    
    if days_since_practice <= settings.MASTERY_DECAY_GRACE_PERIOD_DAYS:
        return current_mastery
    
    decay_days = days_since_practice - settings.MASTERY_DECAY_GRACE_PERIOD_DAYS
    decay_factor = (1 - settings.MASTERY_DECAY_RATE) ** decay_days
    
    return current_mastery * decay_factor
