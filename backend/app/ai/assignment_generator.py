"""
Adaptive Assignment Generator - AI/ML Component
Generates personalized assignments based on mastery gaps and learning patterns.
"""

from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, not_
import random
from app.models.assignment import (
    Assignment, AssignmentQuestion, StudentAssignment, StudentResponse,
    AssignmentType, QuestionDifficulty, QuestionType
)
from app.ai.mastery_scorer import get_mastery_gaps
from app.config import get_settings

settings = get_settings()


def generate_adaptive_assignment(
    db: Session,
    student_id: str,
    class_id: str,
    teacher_id: str,
    target_concepts: Optional[List[str]] = None,
    num_questions: int = 10
) -> Dict[str, Any]:
    """
    Generate a personalized assignment for a student.
    
    Strategy:
    1. Identify mastery gaps
    2. Select concepts to practice (prioritize gaps + prerequisites)
    3. Generate questions with adaptive difficulty
    4. Balance easy/medium/hard based on current mastery
    
    Args:
        db: Database session
        student_id: Student UUID
        class_id: Class UUID
        teacher_id: Teacher UUID (for assignment creation)
        target_concepts: Optional list of concept IDs to focus on
        num_questions: Number of questions to generate
        
    Returns:
        {
            'assignment_id': UUID,
            'num_questions': int,
            'concepts_covered': List[str],
            'difficulty_breakdown': dict,
            'personalization_reason': str
        }
    """
    # Get mastery gaps
    gaps = get_mastery_gaps(db, student_id, limit=10)
    
    # If target concepts specified, filter gaps
    if target_concepts:
        gaps = [g for g in gaps if g['concept_id'] in target_concepts]
    
    # Select top concepts to practice
    concepts_to_practice = []
    for gap in gaps[:5]:  # Top 5 priority gaps
        if gap['prerequisites_ready']:
            concepts_to_practice.append(gap)
    
    # If no gaps or all prerequisites not ready, practice recent concepts
    if not concepts_to_practice:
        recent_concepts = _get_recently_practiced_concepts(db, student_id, class_id, limit=3)
        from app.models.assignment import StudentMastery
        
        for concept_id in recent_concepts:
            mastery = db.query(StudentMastery).filter(
                and_(
                    StudentMastery.student_id == student_id,
                    StudentMastery.concept_id == concept_id
                )
            ).first()
            
            concepts_to_practice.append({
                'concept_id': str(concept_id),
                'mastery_level': float(mastery.mastery_level) if mastery else 0
            })
    
    if not concepts_to_practice:
        raise ValueError("No concepts available for practice")
    
    # Create assignment
    assignment = Assignment(
        title=f"Adaptive Practice - {datetime.now().strftime('%Y-%m-%d %H:%M')}",
        description="Personalized assignment generated based on your learning progress",
        class_id=class_id,
        teacher_id=teacher_id,
        assignment_type=AssignmentType.ADAPTIVE,
        due_date=None  # Adaptive assignments are typically self-paced
    )
    db.add(assignment)
    db.flush()  # Get assignment ID
    
    # Generate questions
    questions = []
    questions_per_concept = max(2, num_questions // len(concepts_to_practice))
    
    for concept_data in concepts_to_practice:
        concept_id = concept_data['concept_id']
        mastery = concept_data.get('mastery_level', 0)
        
        # Determine difficulty distribution based on mastery
        if mastery < 40:
            # Low mastery: mostly easy, some medium
            difficulty_distribution = {
                QuestionDifficulty.EASY: 0.7,
                QuestionDifficulty.MEDIUM: 0.3,
                QuestionDifficulty.HARD: 0.0
            }
        elif mastery < 70:
            # Medium mastery: balanced
            difficulty_distribution = {
                QuestionDifficulty.EASY: 0.3,
                QuestionDifficulty.MEDIUM: 0.5,
                QuestionDifficulty.HARD: 0.2
            }
        else:
            # High mastery: challenge with harder questions
            difficulty_distribution = {
                QuestionDifficulty.EASY: 0.1,
                QuestionDifficulty.MEDIUM: 0.4,
                QuestionDifficulty.HARD: 0.5
            }
        
        # Select questions from question bank
        concept_questions = []
        for difficulty, ratio in difficulty_distribution.items():
            count = round(questions_per_concept * ratio)
            if count > 0:
                selected = _select_questions_from_bank(
                    db=db,
                    concept_id=concept_id,
                    difficulty=difficulty,
                    count=count,
                    student_id=student_id
                )
                concept_questions.extend(selected)
        
        questions.extend(concept_questions)
    
    # Shuffle questions
    random.shuffle(questions)
    
    # Limit to requested number
    questions = questions[:num_questions]
    
    # Add questions to assignment
    for idx, question_data in enumerate(questions):
        question = AssignmentQuestion(
            assignment_id=assignment.id,
            concept_id=question_data['concept_id'],
            question_text=question_data['question_text'],
            question_type=question_data['question_type'],
            difficulty=question_data['difficulty'],
            correct_answer=question_data.get('correct_answer'),
            options=question_data.get('options'),
            points=question_data.get('points', 1),
            order_index=idx
        )
        db.add(question)
    
    # Assign to student
    student_assignment = StudentAssignment(
        assignment_id=assignment.id,
        student_id=student_id,
        is_adaptive=True
    )
    db.add(student_assignment)
    
    db.commit()
    db.refresh(assignment)
    
    # Calculate difficulty breakdown
    difficulty_breakdown = {
        'easy': sum(1 for q in questions if q['difficulty'] == QuestionDifficulty.EASY),
        'medium': sum(1 for q in questions if q['difficulty'] == QuestionDifficulty.MEDIUM),
        'hard': sum(1 for q in questions if q['difficulty'] == QuestionDifficulty.HARD)
    }
    
    return {
        'assignment_id': str(assignment.id),
        'num_questions': len(questions),
        'concepts_covered': [c['concept_id'] for c in concepts_to_practice],
        'difficulty_breakdown': difficulty_breakdown,
        'personalization_reason': 'Generated based on mastery gaps and learning patterns',
        'mastery_levels': {c['concept_id']: c.get('mastery_level', 0) for c in concepts_to_practice}
    }


def _select_questions_from_bank(
    db: Session,
    concept_id: str,
    difficulty: QuestionDifficulty,
    count: int,
    student_id: str
) -> List[Dict[str, Any]]:
    # Sample question bank
    question_bank = [
        # Algebra - Easy
        {
            "category": "Algebra",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "What is the value of x in the equation 2x + 5 = 15?",
            "options": {"A": "5", "B": "10", "C": "15", "D": "20"},
            "correct_answer": "A"
        },
        {
            "category": "Algebra",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Simplify: 3(x + 2) - 4",
            "options": {"A": "3x + 2", "B": "3x - 2", "C": "3x + 6", "D": "3x - 6"},
            "correct_answer": "A"
        },
        # Algebra - Medium
        {
            "category": "Algebra",
            "difficulty": QuestionDifficulty.MEDIUM,
            "question_text": "Solve for x: x^2 - 5x + 6 = 0",
            "options": {"A": "x=2, 3", "B": "x=-2, -3", "C": "x=1, 6", "D": "x=-1, -6"},
            "correct_answer": "A"
        },
        # Geometry - Easy
        {
            "category": "Geometry",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "What is the area of a rectangle with length 8 and width 5?",
            "options": {"A": "40", "B": "13", "C": "26", "D": "20"},
            "correct_answer": "A"
        },
        # Calculus - Hard
        {
            "category": "Calculus",
            "difficulty": QuestionDifficulty.HARD,
            "question_text": "Calculate the derivative of f(x) = x^2 * sin(x)",
            "options": {
                "A": "2x*sin(x) + x^2*cos(x)",
                "B": "2x*cos(x)",
                "C": "x^2*cos(x) - 2x*sin(x)",
                "D": "sin(x) + cos(x)"
            },
            "correct_answer": "A"
        },
        # Science - 6th Standard
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which of the following is NOT a characteristic of living things?",
            "options": {"A": "Growth", "B": "Respiration", "C": "Movement", "D": "Shining"},
            "correct_answer": "D"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which state of matter has a fixed volume but no fixed shape?",
            "options": {"A": "Solid", "B": "Liquid", "C": "Gas", "D": "Plasma"},
            "correct_answer": "B"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Plants prepare their food using which of the following?",
            "options": {"A": "Oxygen", "B": "Nitrogen", "C": "Carbon dioxide", "D": "Hydrogen"},
            "correct_answer": "C"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which part of the plant absorbs water from the soil?",
            "options": {"A": "Stem", "B": "Leaf", "C": "Flower", "D": "Root"},
            "correct_answer": "D"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.MEDIUM,
            "question_text": "Which process causes cooling when sweat dries from our body?",
            "options": {"A": "Condensation", "B": "Freezing", "C": "Evaporation", "D": "Melting"},
            "correct_answer": "C"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which of the following is a decomposer?",
            "options": {"A": "Cow", "B": "Lion", "C": "Mushroom", "D": "Grass"},
            "correct_answer": "C"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Why do fish die when taken out of water?",
            "options": {"A": "No sunlight", "B": "No food", "C": "Cannot breathe air", "D": "Water is cold"},
            "correct_answer": "C"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which organ helps in pumping blood in the human body?",
            "options": {"A": "Brain", "B": "Lungs", "C": "Heart", "D": "Kidney"},
            "correct_answer": "C"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.EASY,
            "question_text": "Which of the following is a renewable resource?",
            "options": {"A": "Coal", "B": "Petroleum", "C": "Natural gas", "D": "Wind"},
            "correct_answer": "D"
        },
        {
            "category": "Science",
            "difficulty": QuestionDifficulty.MEDIUM,
            "question_text": "Which type of soil holds the most water?",
            "options": {"A": "Sandy soil", "B": "Clayey soil", "C": "Loamy soil", "D": "Rocky soil"},
            "correct_answer": "B"
        }
    ]

    # Filter by difficulty (simplified logic for demo)
    matching_questions = [q for q in question_bank if q["difficulty"] == difficulty]
    
    # If no matches, fallback to generic
    if not matching_questions:
        matching_questions = question_bank

    selected = random.sample(matching_questions, min(count, len(matching_questions)))
    
    # Make them concept-specific for the return
    results = []
    for q in selected:
        results.append({
            'concept_id': concept_id,
            'question_text': q['question_text'],
            'question_type': QuestionType.MCQ,
            'difficulty': difficulty,
            'correct_answer': q['correct_answer'],
            'options': q['options'],
            'points': 1 if difficulty == QuestionDifficulty.EASY else 2 if difficulty == QuestionDifficulty.MEDIUM else 3
        })
    
    # If we still need more questions than selected, add placeholders
    while len(results) < count:
        results.append({
            'concept_id': concept_id,
            'question_text': f"Placeholder {difficulty.value} question for concept {concept_id[:8]}",
            'question_type': QuestionType.MCQ,
            'difficulty': difficulty,
            'correct_answer': 'A',
            'options': {"A": "Correct Answer", "B": "Option B", "C": "Option C", "D": "Option D"},
            'points': 1
        })

    return results


def _get_recently_practiced_concepts(
    db: Session,
    student_id: str,
    class_id: str,
    limit: int = 3
) -> List[str]:
    """
    Get recently practiced concepts for a student.
    
    Args:
        db: Database session
        student_id: Student UUID
        class_id: Class UUID
        limit: Number of concepts to return
        
    Returns:
        List of concept IDs
    """
    from app.models.assignment import StudentMastery
    
    # Get recently practiced concepts
    recent = db.query(StudentMastery.concept_id).filter(
        StudentMastery.student_id == student_id
    ).order_by(StudentMastery.last_practiced.desc()).limit(limit).all()
    
    return [str(r[0]) for r in recent]


def _get_recent_question_ids(
    db: Session,
    student_id: str,
    days: int = 30
) -> List[str]:
    """
    Get IDs of questions recently answered by student.
    
    Args:
        db: Database session
        student_id: Student UUID
        days: Number of days to look back
        
    Returns:
        List of question IDs
    """
    cutoff_date = datetime.utcnow() - timedelta(days=days)
    
    from datetime import timedelta
    
    recent_responses = db.query(StudentResponse.question_id).join(
        StudentAssignment
    ).filter(
        and_(
            StudentAssignment.student_id == student_id,
            StudentResponse.answered_at >= cutoff_date
        )
    ).all()
    
    return [str(r[0]) for r in recent_responses]


def get_next_recommended_difficulty(
    db: Session,
    student_id: str,
    concept_id: str
) -> QuestionDifficulty:
    """
    Recommend next question difficulty based on recent performance.
    
    Args:
        db: Database session
        student_id: Student UUID
        concept_id: Concept UUID
        
    Returns:
        Recommended difficulty level
    """
    from app.models.assignment import StudentMastery
    
    # Get mastery level
    mastery = db.query(StudentMastery).filter(
        and_(
            StudentMastery.student_id == student_id,
            StudentMastery.concept_id == concept_id
        )
    ).first()
    
    if not mastery:
        return QuestionDifficulty.EASY
    
    mastery_level = float(mastery.mastery_level)
    
    # Recommend based on mastery
    if mastery_level < 40:
        return QuestionDifficulty.EASY
    elif mastery_level < 70:
        return QuestionDifficulty.MEDIUM
    else:
        return QuestionDifficulty.HARD
