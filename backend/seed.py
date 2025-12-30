"""
Seed script for MASTERY.AI database.
Populates the database with realistic sample data for demo purposes.
"""

from sqlalchemy.orm import Session
from app.database import SessionLocal, engine, Base
from app.models.user import User, Institution, UserRole
from app.models.class_model import Class, Enrollment
from app.models.project import (
    Project, Rubric, RubricCriterion, CriterionType, 
    ProjectAssignment, ProjectSubmission, SubmissionType
)
from app.models.engagement import (
    EngagementEvent, EngagementIndex, AttendanceRecord,
    EventType, AttendanceStatus
)
from app.models.assignment import (
    Concept, ConceptPrerequisite, StudentMastery, DifficultyLevel,
    Assignment, AssignmentQuestion, StudentAssignment, StudentResponse,
    AssignmentType, QuestionType, QuestionDifficulty, AssignmentStatus
)
from app.utils.security import hash_password
from datetime import datetime, timedelta
import uuid
import random

def seed_data():
    db = SessionLocal()
    try:
        print("Seeding MASTERY.AI database...")
        
        # 1. Create Institution
        institution = Institution(
            id=uuid.uuid4(),
            name="St. Patrick's Academy of Excellence",
            address="123 Education Lane, Academic City"
        )
        db.add(institution)
        db.flush()
        
        # 2. Create Users
        password_hash = hash_password("MasteryDemo#2025")
        
        admin = User(
            email="admin@mastery.ai",
            password_hash=password_hash,
            first_name="Arthur",
            last_name="Admin",
            role=UserRole.ADMIN,
            institution_id=institution.id
        )
        
        teacher = User(
            email="teacher@mastery.ai",
            password_hash=password_hash,
            first_name="Theresa",
            last_name="Teacher",
            role=UserRole.TEACHER,
            institution_id=institution.id
        )
        
        student1 = User(
            email="student@mastery.ai",
            password_hash=password_hash,
            first_name="Samuel",
            last_name="Student",
            role=UserRole.STUDENT,
            institution_id=institution.id
        )
        
        student2 = User(
            email="sarah@mastery.ai",
            password_hash=password_hash,
            first_name="Sarah",
            last_name="Miller",
            role=UserRole.STUDENT,
            institution_id=institution.id
        )

        student3 = User(
            email="alex@mastery.ai",
            password_hash=password_hash,
            first_name="Alex",
            last_name="Thompson",
            role=UserRole.STUDENT,
            institution_id=institution.id
        )
        
        db.add_all([admin, teacher, student1, student2, student3])
        db.flush()
        
        # 3. Create Class
        math_class = Class(
            name="Class 10-A Mathematics",
            subject="Mathematics",
            teacher_id=teacher.id,
            institution_id=institution.id,
            academic_year="2025-2026"
        )
        db.add(math_class)
        db.flush()
        
        # 4. Enroll Students
        for s in [student1, student2, student3]:
            enrollment = Enrollment(
                student_id=s.id,
                class_id=math_class.id
            )
            db.add(enrollment)
        db.flush()
        
        # 5. Create Concepts
        algebra = Concept(name="Algebra", subject="Mathematics", difficulty_level=DifficultyLevel.BEGINNER)
        geometry = Concept(name="Geometry", subject="Mathematics", difficulty_level=DifficultyLevel.BEGINNER)
        calculus = Concept(name="Calculus", subject="Mathematics", difficulty_level=DifficultyLevel.INTERMEDIATE, parent_concept_id=None)
        db.add_all([algebra, geometry, calculus])
        db.flush()
        
        # Prerequisites
        calculus_prereq = ConceptPrerequisite(concept_id=calculus.id, prerequisite_id=algebra.id)
        db.add(calculus_prereq)
        db.flush()
        
        # 6. Create PBL Project
        pbl_project = Project(
            title="Smart City Bridge Design",
            description="Design a sustainable bridge using algebraic and geometric principles.",
            class_id=math_class.id,
            teacher_id=teacher.id,
            start_date=datetime.utcnow(),
            end_date=datetime.utcnow() + timedelta(days=30),
            is_group_project=True,
            max_group_size=3
        )
        db.add(pbl_project)
        db.flush()
        
        # Rubric
        rubric = Rubric(project_id=pbl_project.id, name="Bridge Design Rubric")
        db.add(rubric)
        db.flush()
        
        criteria = [
            RubricCriterion(rubric_id=rubric.id, criterion_name="Structural Integrity", criterion_type=CriterionType.TECHNICAL, max_score=10),
            RubricCriterion(rubric_id=rubric.id, criterion_name="Collaboration", criterion_type=CriterionType.COLLABORATION, max_score=10),
            RubricCriterion(rubric_id=rubric.id, criterion_name="Innovation", criterion_type=CriterionType.CREATIVITY, max_score=10)
        ]
        db.add_all(criteria)
        db.flush()
        
        # 7. Seed Engagement Events
        event_types = list(EventType)
        for s in [student1, student2, student3]:
            for _ in range(20):
                event = EngagementEvent(
                    student_id=s.id,
                    class_id=math_class.id,
                    event_type=random.choice(event_types),
                    engagement_value=random.uniform(1.0, 5.0),
                    timestamp=datetime.utcnow() - timedelta(days=random.randint(0, 30))
                )
                db.add(event)
                
            # Random attendance
            for i in range(10):
                att = AttendanceRecord(
                    student_id=s.id,
                    class_id=math_class.id,
                    date=(datetime.utcnow() - timedelta(days=i)).date(),
                    status=random.choice([AttendanceStatus.PRESENT, AttendanceStatus.PRESENT, AttendanceStatus.LATE, AttendanceStatus.ABSENT])
                )
                db.add(att)
        
        # 8. Seed Mastery
        for s in [student1, student2, student3]:
            for c in [algebra, geometry]:
                mastery = StudentMastery(
                    student_id=s.id,
                    concept_id=c.id,
                    mastery_level=random.uniform(40, 95),
                    attempts=random.randint(5, 20),
                    last_practiced=datetime.utcnow() - timedelta(days=random.randint(0, 5))
                )
                db.add(mastery)
        
        db.commit()
        print("Seeding complete!")
        print(f"Teacher: teacher@mastery.ai / MasteryDemo#2025")
        print(f"Student: student@mastery.ai / MasteryDemo#2025")
        print(f"Admin: admin@mastery.ai / MasteryDemo#2025")

    except Exception as e:
        db.rollback()
        print(f"Error seeding data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed_data()
