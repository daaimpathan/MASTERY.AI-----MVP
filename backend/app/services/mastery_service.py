"""
Mastery service for managing adaptive assignments and student learning progress.
"""

from typing import List
from sqlalchemy.orm import Session
from app.models.assignment import (
    Assignment, 
    AssignmentQuestion, 
    StudentAssignment,
    StudentResponse,
    StudentMastery,
    Concept,
    AssignmentStatus,
    QuestionDifficulty
)
from app.schemas.mastery import AssignmentCreate, SubmissionCreate
from app.ai.assignment_generator import generate_adaptive_assignment
from uuid import UUID
from datetime import datetime

class MasteryService:
    @staticmethod
    def create_adaptive_assignment(db: Session, student_id: UUID, class_id: UUID) -> Assignment:
        """
        Create a personalized adaptive assignment for a student.
        In this demo, we use the student_id as teacher_id for self-assigned practice.
        """
        # Generate the assignment using the AI generator
        result = generate_adaptive_assignment(
            db=db,
            student_id=str(student_id),
            class_id=str(class_id),
            teacher_id=str(student_id), # Mock teacher as student for self-practice
            num_questions=5
        )
        
        # The generator already committed the assignment to the DB
        assignment_id = result['assignment_id']
        db_assignment = db.query(Assignment).filter(Assignment.id == assignment_id).first()
        
        return db_assignment

    @staticmethod
    def get_student_assignments(db: Session, student_id: UUID) -> List[Assignment]:
        # Get assignments assigned to this student via StudentAssignment join
        return db.query(Assignment).join(StudentAssignment).filter(StudentAssignment.student_id == student_id).all()

    @staticmethod
    def get_assignment_for_solving(db: Session, student_id: UUID, assignment_id: UUID) -> Assignment:
        """
        Verify student has access to this assignment and return it.
        """
        sa = db.query(StudentAssignment).filter(
            StudentAssignment.assignment_id == assignment_id,
            StudentAssignment.student_id == student_id
        ).first()
        
        if not sa:
            return None
        
        # Return the assignment with questions loaded
        # Questions should be loaded due to relationship
        return sa.assignment

    @staticmethod
    def submit_assignment(db: Session, student_id: UUID, submission_data: SubmissionCreate) -> StudentAssignment:
        # 1. Fetch student assignment record
        sa = db.query(StudentAssignment).filter(
            StudentAssignment.assignment_id == submission_data.assignment_id,
            StudentAssignment.student_id == student_id
        ).first()
        
        if not sa:
            return None
            
        # 2. Auto-grading
        correct_count = 0
        total_questions = len(submission_data.answers)
        
        # 3. Save individual responses and grade
        for q_id, ans in submission_data.answers.items():
            question = db.query(AssignmentQuestion).filter(AssignmentQuestion.id == UUID(q_id)).first()
            is_correct = False
            if question and question.correct_answer == ans:
                is_correct = True
                correct_count += 1
                
            db_resp = StudentResponse(
                student_assignment_id=sa.id,
                question_id=UUID(q_id),
                response_text=str(ans),
                is_correct=is_correct,
                points_earned=1.0 if is_correct else 0.0,
                time_spent_seconds=30 # Simplified
            )
            db.add(db_resp)
            
        score = (correct_count / total_questions * 100) if total_questions > 0 else 0
        
        # 4. Update status and mastery (simplified boost)
        sa.status = AssignmentStatus.SUBMITTED
        sa.submitted_at = datetime.utcnow()
        
        # Mocking a mastery boost for the first concept covered if correct count > 0
        if correct_count > 0:
            from app.models.assignment import StudentMastery
            # Simplified: just update any existing mastery record for this student
            mastery = db.query(StudentMastery).filter(StudentMastery.student_id == student_id).first()
            if mastery:
                mastery.mastery_level = min(100, float(mastery.mastery_level) + (correct_count * 2.5))
                mastery.last_practiced = datetime.utcnow()
                mastery.attempts += 1
        
        db.commit()
        db.refresh(sa)
        
        # Attach transient fields for Pydantic serialization
        sa.score = score
        sa.mastery_gain = (correct_count * 2.5) if correct_count > 0 else 0.0
        
        return sa

    @staticmethod
    def get_mastery_profile(db: Session, student_id: UUID) -> List[StudentMastery]:
        return db.query(StudentMastery).filter(StudentMastery.student_id == student_id).all()

    @staticmethod
    def get_pending_submissions(db: Session, teacher_id: UUID) -> List[StudentAssignment]:
        """Get all standard assignments that need grading for this teacher."""
        return db.query(StudentAssignment).join(Assignment).filter(
            Assignment.teacher_id == teacher_id,
            Assignment.assignment_type != "adaptive", # Only manual grading for non-adaptive usually
            StudentAssignment.status == AssignmentStatus.SUBMITTED
        ).all()

    @staticmethod
    def grade_submission(db: Session, submission_id: UUID, points_earned: float, feedback: str, mastery_boost: float = 0.0) -> StudentAssignment:
        """Manual grading by teacher."""
        sa = db.query(StudentAssignment).filter(StudentAssignment.id == submission_id).first()
        if not sa:
            return None

        # Update assignment status
        sa.status = AssignmentStatus.GRADED
        
        # Simplified: We treat the whole assignment score here, 
        # but normally we'd grade individual questions.
        # For this demo, let's assume points_earned is the final score percentage (0-100)
        
        # Update Mastery if boost is provided
        if mastery_boost > 0 and sa.is_adaptive == False:
            # Find relevant concepts - for standard assignments, we might need to know which concept it targeted.
            # For simplicity, let's boost the student's lowest mastery concept for now or generic boost.
            # Real implementation would link Assignment -> Concept
            mastery_record = db.query(StudentMastery).filter(
                StudentMastery.student_id == sa.student_id
            ).first() # Just grab one for demo
            
            if mastery_record:
                new_level = float(mastery_record.mastery_level) + mastery_boost
                mastery_record.mastery_level = min(100.0, new_level)
                mastery_record.last_practiced = datetime.utcnow()
        
        db.commit()
        db.refresh(sa)
        return sa
