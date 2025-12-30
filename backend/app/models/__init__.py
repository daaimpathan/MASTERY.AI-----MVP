"""
Models package initialization.
Imports all models for easy access and Alembic auto-generation.
"""

from app.database import Base
from app.models.user import User, Institution, RefreshToken, UserRole
from app.models.class_model import Class, Enrollment
from app.models.project import (
    Project, ProjectGroup, ProjectAssignment, Rubric, RubricCriterion,
    ProjectSubmission, SubmissionEvidence, ProjectEvaluation, EvaluationScore,
    CriterionType, SubmissionStatus, SubmissionType, EvidenceType, EvaluatorType
)
from app.models.engagement import (
    EngagementEvent, EngagementIndex, AttendanceRecord,
    EventType, AttendanceStatus
)
from app.models.assignment import (
    Concept, ConceptPrerequisite, StudentMastery, Assignment, AssignmentQuestion,
    StudentAssignment, StudentResponse, AdaptiveRecommendation,
    DifficultyLevel, AssignmentType, QuestionType, QuestionDifficulty,
    AssignmentStatus, RecommendationType
)
from app.models.resource import (
    Resource, ResourceRequest, ResourceType, RequestStatus
)
from app.models.notification import Notification, NotificationType
from app.models.syllabus import SyllabusTopic, TopicStatus
from app.models.thought_proof import ThoughtProof, KeystrokeEvent
from app.models.daily_challenge import DailyChallenge
from app.models.focus_session import FocusSession, SessionStatus

__all__ = [
    # Base
    "Base",
    
    # User models
    "User", "Institution", "RefreshToken", "UserRole",
    
    # Class models
    "Class", "Enrollment",
    
    # Project models
    "Project", "ProjectGroup", "ProjectAssignment", "Rubric", "RubricCriterion",
    "ProjectSubmission", "SubmissionEvidence", "ProjectEvaluation", "EvaluationScore",
    "CriterionType", "SubmissionStatus", "SubmissionType", "EvidenceType", "EvaluatorType",
    
    # Engagement models
    "EngagementEvent", "EngagementIndex", "AttendanceRecord",
    "EventType", "AttendanceStatus",
    
    # Assignment models
    "Concept", "ConceptPrerequisite", "StudentMastery", "Assignment", "AssignmentQuestion",
    "StudentAssignment", "StudentResponse", "AdaptiveRecommendation",
    "DifficultyLevel", "AssignmentType", "QuestionType", "QuestionDifficulty",
    "AssignmentStatus", "RecommendationType",
    
    # Resource models
    "Resource", "ResourceRequest", "ResourceType", "RequestStatus",
    
    # Notification models
    "Notification", "NotificationType",
    
    # Syllabus models
    "SyllabusTopic", "TopicStatus",
    
    # Thought Proof models
    "ThoughtProof", "KeystrokeEvent",
    
    # Daily Challenge models
    "DailyChallenge",
    
    # Focus Session models
    "FocusSession", "SessionStatus"
]
