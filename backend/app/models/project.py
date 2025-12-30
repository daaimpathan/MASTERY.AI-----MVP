"""
Project-Based Learning (PBL) related database models.
Includes Project, Rubric, Submission, and Evaluation models.
"""

from sqlalchemy import Column, String, Text, DateTime, ForeignKey, Boolean, Integer, Numeric, Enum as SQLEnum, UniqueConstraint, Uuid
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import uuid
import enum
from datetime import datetime
from app.database import Base


class Project(Base):
    """Project model for PBL."""
    __tablename__ = "projects"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    subject = Column(String(255), nullable=True)
    class_id = Column(Uuid, ForeignKey("classes.id"), nullable=True)
    teacher_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    start_date = Column(DateTime(timezone=True), nullable=True)
    end_date = Column(DateTime(timezone=True), nullable=True)
    is_group_project = Column(Boolean, default=False)
    max_group_size = Column(Integer, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    @property
    def is_active(self):
        """Computed property for project status."""
        if not self.end_date:
            return True
        try:
            from datetime import datetime
            # Handle both naive and aware datetimes
            if hasattr(self.end_date, 'tzinfo') and self.end_date.tzinfo:
                return datetime.now(self.end_date.tzinfo) < self.end_date
            return datetime.now() < self.end_date
        except (AttributeError, TypeError):
            # Fallback to True if there's any issue
            return True

    # Relationships
    class_obj = relationship("Class", back_populates="projects")
    teacher = relationship("User", back_populates="created_projects", foreign_keys=[teacher_id])
    assignments = relationship("ProjectAssignment", back_populates="project", cascade="all, delete-orphan")
    groups = relationship("ProjectGroup", back_populates="project", cascade="all, delete-orphan")
    rubric = relationship("Rubric", back_populates="project", uselist=False, cascade="all, delete-orphan")


class ProjectGroup(Base):
    """Project group for group projects."""
    __tablename__ = "project_groups"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id = Column(Uuid, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="groups")
    members = relationship("ProjectAssignment", back_populates="group")


class ProjectAssignment(Base):
    """Assignment of a project to a student."""
    __tablename__ = "project_assignments"
    __table_args__ = (
        UniqueConstraint('project_id', 'student_id', name='uq_project_student'),
    )
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id = Column(Uuid, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    student_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    group_id = Column(Uuid, ForeignKey("project_groups.id"), nullable=True)
    assigned_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="assignments")
    student = relationship("User", back_populates="project_assignments", foreign_keys=[student_id])
    group = relationship("ProjectGroup", back_populates="members")
    submissions = relationship("ProjectSubmission", back_populates="assignment", cascade="all, delete-orphan")


class CriterionType(str, enum.Enum):
    """Rubric criterion types."""
    COMMUNICATION = "communication"
    COLLABORATION = "collaboration"
    PROBLEM_SOLVING = "problem_solving"
    CREATIVITY = "creativity"
    TECHNICAL = "technical"
    OTHER = "other"


class Rubric(Base):
    """Rubric for project evaluation."""
    __tablename__ = "rubrics"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    project_id = Column(Uuid, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    project = relationship("Project", back_populates="rubric")
    criteria = relationship("RubricCriterion", back_populates="rubric", cascade="all, delete-orphan")
    evaluations = relationship("ProjectEvaluation", back_populates="rubric")


class RubricCriterion(Base):
    """Individual criterion in a rubric."""
    __tablename__ = "rubric_criteria"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    rubric_id = Column(Uuid, ForeignKey("rubrics.id", ondelete="CASCADE"), nullable=False)
    criterion_name = Column(String(255), nullable=False)
    criterion_type = Column(SQLEnum(CriterionType), nullable=False)
    max_score = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    weight = Column(Numeric(3, 2), default=1.0)
    
    # Relationships
    rubric = relationship("Rubric", back_populates="criteria")
    scores = relationship("EvaluationScore", back_populates="criterion")


class SubmissionStatus(str, enum.Enum):
    """Submission status enumeration."""
    DRAFT = "draft"
    SUBMITTED = "submitted"
    GRADED = "graded"


class SubmissionType(str, enum.Enum):
    """Submission type enumeration."""
    INDIVIDUAL = "individual"
    GROUP = "group"


class ProjectSubmission(Base):
    """Project submission by student/group."""
    __tablename__ = "project_submissions"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    project_assignment_id = Column(Uuid, ForeignKey("project_assignments.id"), nullable=False)
    submission_type = Column(SQLEnum(SubmissionType), nullable=False)
    submitted_at = Column(DateTime(timezone=True), server_default=func.now())
    status = Column(SQLEnum(SubmissionStatus), default=SubmissionStatus.SUBMITTED)
    
    # Relationships
    assignment = relationship("ProjectAssignment", back_populates="submissions")
    evidence = relationship("SubmissionEvidence", back_populates="submission", cascade="all, delete-orphan")
    evaluations = relationship("ProjectEvaluation", back_populates="submission", cascade="all, delete-orphan")


class EvidenceType(str, enum.Enum):
    """Evidence type enumeration."""
    FILE = "file"
    LINK = "link"
    NOTE = "note"


class SubmissionEvidence(Base):
    """Evidence attached to a submission."""
    __tablename__ = "submission_evidence"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    submission_id = Column(Uuid, ForeignKey("project_submissions.id", ondelete="CASCADE"), nullable=False)
    evidence_type = Column(SQLEnum(EvidenceType), nullable=False)
    content = Column(Text, nullable=False)
    file_path = Column(String(500), nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    submission = relationship("ProjectSubmission", back_populates="evidence")


class EvaluatorType(str, enum.Enum):
    """Evaluator type enumeration."""
    TEACHER = "teacher"
    PEER = "peer"
    SELF = "self"


class ProjectEvaluation(Base):
    """Evaluation of a project submission."""
    __tablename__ = "project_evaluations"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    submission_id = Column(Uuid, ForeignKey("project_submissions.id"), nullable=False)
    evaluator_id = Column(Uuid, ForeignKey("users.id"), nullable=False)
    evaluator_type = Column(SQLEnum(EvaluatorType), nullable=False)
    rubric_id = Column(Uuid, ForeignKey("rubrics.id"), nullable=False)
    total_score = Column(Numeric(5, 2), nullable=True)
    feedback = Column(Text, nullable=True)
    evaluated_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    submission = relationship("ProjectSubmission", back_populates="evaluations")
    evaluator = relationship("User", back_populates="evaluations_given", foreign_keys=[evaluator_id])
    rubric = relationship("Rubric", back_populates="evaluations")
    scores = relationship("EvaluationScore", back_populates="evaluation", cascade="all, delete-orphan")


class EvaluationScore(Base):
    """Individual criterion score in an evaluation."""
    __tablename__ = "evaluation_scores"
    
    id = Column(Uuid, primary_key=True, default=uuid.uuid4)
    evaluation_id = Column(Uuid, ForeignKey("project_evaluations.id", ondelete="CASCADE"), nullable=False)
    criterion_id = Column(Uuid, ForeignKey("rubric_criteria.id"), nullable=False)
    score = Column(Integer, nullable=False)
    comments = Column(Text, nullable=True)
    
    # Relationships
    evaluation = relationship("ProjectEvaluation", back_populates="scores")
    criterion = relationship("RubricCriterion", back_populates="scores")
