"""
Adaptive learning and mastery tracking database models.
Includes Concept, StudentMastery, Assignment, and AdaptiveRecommendation models.
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Integer, Numeric, Boolean, Enum as SQLEnum, UniqueConstraint, JSON, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from app.database import Base


class DifficultyLevel(str, enum.Enum):
    """Difficulty level enumeration."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Concept(Base):
    """Learning concept/topic model."""
    __tablename__ = "concepts"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    subject = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    difficulty_level = Column(SQLEnum(DifficultyLevel), nullable=True)
    parent_concept_id = Column(Uuid, ForeignKey("concepts.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    parent_concept = relationship("Concept", remote_side=[id], backref="sub_concepts")
    prerequisites = relationship(
        "ConceptPrerequisite",
        foreign_keys="ConceptPrerequisite.concept_id",
        back_populates="concept"
    )
    required_for = relationship(
        "ConceptPrerequisite",
        foreign_keys="ConceptPrerequisite.prerequisite_id",
        back_populates="prerequisite"
    )
    mastery_records = relationship("StudentMastery", back_populates="concept")
    questions = relationship("AssignmentQuestion", back_populates="concept")
    recommendations = relationship("AdaptiveRecommendation", back_populates="concept")


class ConceptPrerequisite(Base):
    """Prerequisite relationships between concepts."""
    __tablename__ = "concept_prerequisites"
    __table_args__ = (
        UniqueConstraint('concept_id', 'prerequisite_id', name='uq_concept_prerequisite'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    concept_id = Column(Uuid, ForeignKey("concepts.id"), nullable=False)
    prerequisite_id = Column(Uuid, ForeignKey("concepts.id"), nullable=False)
    
    # Relationships
    concept = relationship("Concept", foreign_keys=[concept_id], back_populates="prerequisites")
    prerequisite = relationship("Concept", foreign_keys=[prerequisite_id], back_populates="required_for")


class StudentMastery(Base):
    """Student's mastery level for a concept."""
    __tablename__ = "student_mastery"
    __table_args__ = (
        UniqueConstraint('student_id', 'concept_id', name='uq_student_concept'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    concept_id = Column(Uuid, ForeignKey("concepts.id"), nullable=False, index=True)
    mastery_level = Column(Numeric(5, 2), nullable=False, default=0.0)  # 0-100
    attempts = Column(Integer, default=0)
    last_practiced = Column(DateTime(timezone=True), nullable=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    student = relationship("User", back_populates="mastery_records", foreign_keys=[student_id])
    concept = relationship("Concept", back_populates="mastery_records")


class AssignmentType(str, enum.Enum):
    """Assignment type enumeration."""
    ADAPTIVE = "adaptive"
    STANDARD = "standard"
    QUIZ = "quiz"
    PRACTICE = "practice"


class Assignment(Base):
    """Assignment model."""
    __tablename__ = "assignments"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=False)
    teacher_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    assignment_type = Column(SQLEnum(AssignmentType), nullable=False)
    due_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    class_obj = relationship("Class", back_populates="assignments")
    teacher = relationship("User", back_populates="created_assignments", foreign_keys=[teacher_id])
    questions = relationship("AssignmentQuestion", back_populates="assignment", cascade="all, delete-orphan")
    student_assignments = relationship("StudentAssignment", back_populates="assignment", cascade="all, delete-orphan")


class QuestionType(str, enum.Enum):
    """Question type enumeration."""
    MCQ = "mcq"
    SHORT_ANSWER = "short_answer"
    ESSAY = "essay"
    CODING = "coding"


class QuestionDifficulty(str, enum.Enum):
    """Question difficulty enumeration."""
    EASY = "easy"
    MEDIUM = "medium"
    HARD = "hard"


class AssignmentQuestion(Base):
    """Individual question in an assignment."""
    __tablename__ = "assignment_questions"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    assignment_id = Column(Uuid, ForeignKey("assignments.id", ondelete="CASCADE"), nullable=False)
    concept_id = Column(Uuid, ForeignKey("concepts.id"), nullable=True)
    question_text = Column(Text, nullable=False)
    question_type = Column(SQLEnum(QuestionType), nullable=False)
    difficulty = Column(SQLEnum(QuestionDifficulty), nullable=False)
    correct_answer = Column(Text, nullable=True)
    options = Column(JSON, nullable=True)  # For MCQ options
    points = Column(Integer, default=1)
    order_index = Column(Integer, nullable=True)
    
    # Relationships
    assignment = relationship("Assignment", back_populates="questions")
    concept = relationship("Concept", back_populates="questions")
    responses = relationship("StudentResponse", back_populates="question")


class AssignmentStatus(str, enum.Enum):
    """Assignment status enumeration."""
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    SUBMITTED = "submitted"
    GRADED = "graded"


class StudentAssignment(Base):
    """Assignment assigned to a student."""
    __tablename__ = "student_assignments"
    __table_args__ = (
        UniqueConstraint('assignment_id', 'student_id', name='uq_assignment_student'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    assignment_id = Column(Uuid, ForeignKey("assignments.id"), nullable=False, index=True)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    is_adaptive = Column(Boolean, default=False)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    started_at = Column(DateTime(timezone=True), nullable=True)
    submitted_at = Column(DateTime(timezone=True), nullable=True)
    status = Column(SQLEnum(AssignmentStatus), default=AssignmentStatus.ASSIGNED)
    
    # Relationships
    assignment = relationship("Assignment", back_populates="student_assignments")
    student = relationship("User", back_populates="student_assignments", foreign_keys=[student_id])
    responses = relationship("StudentResponse", back_populates="student_assignment", cascade="all, delete-orphan")
    thought_proof = relationship("ThoughtProof", back_populates="student_assignment", uselist=False, cascade="all, delete-orphan")


class StudentResponse(Base):
    """Student's response to a question."""
    __tablename__ = "student_responses"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_assignment_id = Column(Uuid, ForeignKey("student_assignments.id"), nullable=False)
    question_id = Column(Uuid, ForeignKey("assignment_questions.id"), nullable=False)
    response_text = Column(Text, nullable=True)
    is_correct = Column(Boolean, nullable=True)
    points_earned = Column(Numeric(5, 2), nullable=True)
    time_spent_seconds = Column(Integer, nullable=True)
    answered_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student_assignment = relationship("StudentAssignment", back_populates="responses")
    question = relationship("AssignmentQuestion", back_populates="responses")


class RecommendationType(str, enum.Enum):
    """Recommendation type enumeration."""
    PRACTICE = "practice"
    REVIEW = "review"
    ADVANCE = "advance"
    REMEDIAL = "remedial"


class AdaptiveRecommendation(Base):
    """Adaptive learning recommendation for a student."""
    __tablename__ = "adaptive_recommendations"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False, index=True)
    concept_id = Column(Uuid, ForeignKey("concepts.id"), nullable=False)
    recommendation_type = Column(SQLEnum(RecommendationType), nullable=False)
    priority = Column(Integer, default=0)
    reason = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    completed = Column(Boolean, default=False)
    
    # Relationships
    student = relationship("User", back_populates="adaptive_recommendations", foreign_keys=[student_id])
    concept = relationship("Concept", back_populates="recommendations")
