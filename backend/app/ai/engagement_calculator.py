"""
Engagement Index Calculator - AI/ML Component
Calculates real-time, explainable engagement scores for students.
"""

from datetime import datetime, timedelta
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from app.models.engagement import EngagementEvent, AttendanceRecord, AttendanceStatus, EventType
from app.models.assignment import StudentAssignment, AssignmentStatus
from app.config import get_settings

settings = get_settings()

# Engagement weights configuration
ENGAGEMENT_WEIGHTS = {
    'attendance': 0.25,           # 25% weight
    'assignment_submission': 0.20, # 20% weight
    'quiz_participation': 0.15,    # 15% weight
    'interaction_frequency': 0.15, # 15% weight
    'timeliness': 0.15,           # 15% weight (early vs late submissions)
    'resource_engagement': 0.10    # 10% weight (accessing materials)
}


def calculate_engagement_index(
    db: Session,
    student_id: str,
    class_id: str,
    period_days: int = None
) -> Dict[str, Any]:
    """
    Calculate engagement index with explainability.
    
    This function implements a weighted multi-factor scoring system that:
    1. Analyzes multiple engagement signals (attendance, submissions, interactions)
    2. Normalizes each factor to 0-100 scale
    3. Applies configurable weights
    4. Provides detailed breakdown for transparency
    
    Args:
        db: Database session
        student_id: Student UUID
        class_id: Class UUID
        period_days: Number of days to analyze (default from config)
        
    Returns:
        {
            'index_score': float (0-100),
            'contributing_factors': {
                'attendance': {'score': float, 'details': dict},
                'assignment_submission': {'score': float, 'details': dict},
                ...
            },
            'trend': 'improving' | 'declining' | 'stable',
            'risk_level': 'low' | 'medium' | 'high'
        }
    """
    if period_days is None:
        period_days = settings.ENGAGEMENT_CALCULATION_PERIOD_DAYS
    
    period_start = datetime.utcnow() - timedelta(days=period_days)
    
    # 1. Calculate Attendance Score (0-100)
    attendance_data = _calculate_attendance_score(db, student_id, class_id, period_start)
    attendance_score = attendance_data['score']
    
    # 2. Calculate Assignment Submission Score (0-100)
    assignment_data = _calculate_assignment_submission_score(db, student_id, class_id, period_start)
    submission_score = assignment_data['score']
    
    # 3. Calculate Quiz Participation Score (0-100)
    quiz_data = _calculate_quiz_participation_score(db, student_id, class_id, period_start)
    quiz_score = quiz_data['score']
    
    # 4. Calculate Interaction Frequency Score (0-100)
    interaction_data = _calculate_interaction_score(db, student_id, class_id, period_start)
    interaction_score = interaction_data['score']
    
    # 5. Calculate Timeliness Score (0-100)
    timeliness_data = _calculate_timeliness_score(db, student_id, class_id, period_start)
    timeliness_score = timeliness_data['score']
    
    # 6. Calculate Resource Engagement Score (0-100)
    resource_data = _calculate_resource_engagement_score(db, student_id, class_id, period_start)
    resource_score = resource_data['score']
    
    # Calculate weighted index
    index_score = (
        attendance_score * ENGAGEMENT_WEIGHTS['attendance'] +
        submission_score * ENGAGEMENT_WEIGHTS['assignment_submission'] +
        quiz_score * ENGAGEMENT_WEIGHTS['quiz_participation'] +
        interaction_score * ENGAGEMENT_WEIGHTS['interaction_frequency'] +
        timeliness_score * ENGAGEMENT_WEIGHTS['timeliness'] +
        resource_score * ENGAGEMENT_WEIGHTS['resource_engagement']
    )
    
    # Determine trend (compare with previous period)
    trend = _determine_trend(db, student_id, class_id, index_score, period_days)
    
    # Determine risk level
    risk_level = 'low' if index_score >= 70 else 'medium' if index_score >= 50 else 'high'
    
    return {
        'index_score': round(index_score, 2),
        'contributing_factors': {
            'attendance': {
                'score': round(attendance_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['attendance'],
                'contribution': round(attendance_score * ENGAGEMENT_WEIGHTS['attendance'], 2),
                'details': attendance_data['details']
            },
            'assignment_submission': {
                'score': round(submission_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['assignment_submission'],
                'contribution': round(submission_score * ENGAGEMENT_WEIGHTS['assignment_submission'], 2),
                'details': assignment_data['details']
            },
            'quiz_participation': {
                'score': round(quiz_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['quiz_participation'],
                'contribution': round(quiz_score * ENGAGEMENT_WEIGHTS['quiz_participation'], 2),
                'details': quiz_data['details']
            },
            'interaction_frequency': {
                'score': round(interaction_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['interaction_frequency'],
                'contribution': round(interaction_score * ENGAGEMENT_WEIGHTS['interaction_frequency'], 2),
                'details': interaction_data['details']
            },
            'timeliness': {
                'score': round(timeliness_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['timeliness'],
                'contribution': round(timeliness_score * ENGAGEMENT_WEIGHTS['timeliness'], 2),
                'details': timeliness_data['details']
            },
            'resource_engagement': {
                'score': round(resource_score, 2),
                'weight': ENGAGEMENT_WEIGHTS['resource_engagement'],
                'contribution': round(resource_score * ENGAGEMENT_WEIGHTS['resource_engagement'], 2),
                'details': resource_data['details']
            }
        },
        'trend': trend,
        'risk_level': risk_level,
        'period_days': period_days,
        'calculated_at': datetime.utcnow().isoformat()
    }


def _calculate_attendance_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate attendance score (0-100)."""
    # Get attendance records
    records = db.query(AttendanceRecord).filter(
        and_(
            AttendanceRecord.student_id == student_id,
            AttendanceRecord.class_id == class_id,
            AttendanceRecord.date >= period_start.date()
        )
    ).all()
    
    if not records:
        return {'score': 50.0, 'details': {'total': 0, 'present': 0, 'absent': 0, 'late': 0, 'rate': 0}}
    
    total = len(records)
    present = sum(1 for r in records if r.status == AttendanceStatus.PRESENT)
    late = sum(1 for r in records if r.status == AttendanceStatus.LATE)
    absent = sum(1 for r in records if r.status == AttendanceStatus.ABSENT)
    
    # Calculate score: present = 100%, late = 50%, absent = 0%
    score = ((present * 1.0 + late * 0.5) / total) * 100 if total > 0 else 50.0
    
    return {
        'score': score,
        'details': {
            'total': total,
            'present': present,
            'absent': absent,
            'late': late,
            'rate': round((present / total) * 100, 1) if total > 0 else 0
        }
    }


def _calculate_assignment_submission_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate assignment submission score (0-100)."""
    # Get assignments assigned in this period
    assignments = db.query(StudentAssignment).join(
        StudentAssignment.assignment
    ).filter(
        and_(
            StudentAssignment.student_id == student_id,
            StudentAssignment.assignment.has(class_id=class_id),
            StudentAssignment.assigned_at >= period_start
        )
    ).all()
    
    if not assignments:
        return {'score': 50.0, 'details': {'total': 0, 'submitted': 0, 'rate': 0}}
    
    total = len(assignments)
    submitted = sum(1 for a in assignments if a.status in [AssignmentStatus.SUBMITTED, AssignmentStatus.GRADED])
    
    score = (submitted / total) * 100 if total > 0 else 50.0
    
    return {
        'score': score,
        'details': {
            'total': total,
            'submitted': submitted,
            'pending': total - submitted,
            'rate': round((submitted / total) * 100, 1) if total > 0 else 0
        }
    }


def _calculate_quiz_participation_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate quiz participation score (0-100)."""
    # Count quiz participation events
    quiz_events = db.query(func.count(EngagementEvent.id)).filter(
        and_(
            EngagementEvent.student_id == student_id,
            EngagementEvent.class_id == class_id,
            EngagementEvent.event_type == EventType.QUIZ_PARTICIPATION,
            EngagementEvent.timestamp >= period_start
        )
    ).scalar()
    
    # Normalize: assume 1 quiz per week is good engagement
    weeks = (datetime.utcnow() - period_start).days / 7
    expected_quizzes = max(1, weeks)
    
    score = min(100, (quiz_events / expected_quizzes) * 100)
    
    return {
        'score': score,
        'details': {
            'participated': quiz_events,
            'expected': int(expected_quizzes),
            'rate': round((quiz_events / expected_quizzes) * 100, 1) if expected_quizzes > 0 else 0
        }
    }


def _calculate_interaction_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate interaction frequency score (0-100)."""
    # Count interaction events
    interactions = db.query(func.count(EngagementEvent.id)).filter(
        and_(
            EngagementEvent.student_id == student_id,
            EngagementEvent.class_id == class_id,
            EngagementEvent.event_type == EventType.INTERACTION,
            EngagementEvent.timestamp >= period_start
        )
    ).scalar()
    
    # Get class average for normalization
    class_avg = db.query(func.avg(func.count(EngagementEvent.id))).filter(
        and_(
            EngagementEvent.class_id == class_id,
            EngagementEvent.event_type == EventType.INTERACTION,
            EngagementEvent.timestamp >= period_start
        )
    ).group_by(EngagementEvent.student_id).scalar()
    
    if class_avg and class_avg > 0:
        score = min(100, (interactions / class_avg) * 100)
    else:
        # Fallback: 1 interaction per day is 100%
        days = (datetime.utcnow() - period_start).days
        score = min(100, (interactions / max(1, days)) * 100)
    
    return {
        'score': score,
        'details': {
            'count': interactions,
            'class_average': round(class_avg, 1) if class_avg else 0
        }
    }


def _calculate_timeliness_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate timeliness score based on on-time submissions (0-100)."""
    # Get assignments with due dates
    assignments = db.query(StudentAssignment).join(
        StudentAssignment.assignment
    ).filter(
        and_(
            StudentAssignment.student_id == student_id,
            StudentAssignment.assignment.has(class_id=class_id),
            StudentAssignment.assigned_at >= period_start,
            StudentAssignment.submitted_at.isnot(None)
        )
    ).all()
    
    if not assignments:
        return {'score': 50.0, 'details': {'total': 0, 'on_time': 0, 'late': 0, 'rate': 0}}
    
    total = len(assignments)
    on_time = sum(
        1 for a in assignments
        if a.assignment.due_date and a.submitted_at <= a.assignment.due_date
    )
    
    score = (on_time / total) * 100 if total > 0 else 50.0
    
    return {
        'score': score,
        'details': {
            'total': total,
            'on_time': on_time,
            'late': total - on_time,
            'rate': round((on_time / total) * 100, 1) if total > 0 else 0
        }
    }


def _calculate_resource_engagement_score(
    db: Session,
    student_id: str,
    class_id: str,
    period_start: datetime
) -> Dict[str, Any]:
    """Calculate resource engagement score (0-100)."""
    # Count resource access events
    accesses = db.query(func.count(EngagementEvent.id)).filter(
        and_(
            EngagementEvent.student_id == student_id,
            EngagementEvent.class_id == class_id,
            EngagementEvent.event_type == EventType.RESOURCE_ACCESS,
            EngagementEvent.timestamp >= period_start
        )
    ).scalar()
    
    # Normalize: 1 access per day = 100%
    days = max(1, (datetime.utcnow() - period_start).days)
    score = min(100, (accesses / days) * 100)
    
    return {
        'score': score,
        'details': {
            'accesses': accesses,
            'days': days,
            'avg_per_day': round(accesses / days, 2) if days > 0 else 0
        }
    }


def _determine_trend(
    db: Session,
    student_id: str,
    class_id: str,
    current_score: float,
    period_days: int
) -> str:
    """Determine engagement trend by comparing with previous period."""
    from app.models.engagement import EngagementIndex
    
    # Get most recent previous index
    previous = db.query(EngagementIndex).filter(
        and_(
            EngagementIndex.student_id == student_id,
            EngagementIndex.class_id == class_id
        )
    ).order_by(EngagementIndex.calculated_at.desc()).first()
    
    if not previous:
        return 'stable'
    
    previous_score = float(previous.index_score)
    diff = current_score - previous_score
    
    if diff > 5:
        return 'improving'
    elif diff < -5:
        return 'declining'
    else:
        return 'stable'
