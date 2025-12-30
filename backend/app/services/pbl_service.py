from datetime import datetime
from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from app.models.project import (
    Project, Rubric, RubricCriterion, ProjectAssignment, 
    ProjectSubmission, SubmissionEvidence, SubmissionStatus,
    EvaluatorType, ProjectEvaluation
)
from app.models.class_model import Enrollment
from app.models.notification import Notification, NotificationType
from app.schemas.project import ProjectCreate, ProjectSubmissionCreate

class PBLService:
    @staticmethod
    def get_projects(db: Session, class_id: Optional[UUID] = None) -> List[Project]:
        query = db.query(Project)
        if class_id:
            query = query.filter(Project.class_id == class_id)
        return query.all()

    @staticmethod
    def get_project_by_id(db: Session, project_id: UUID) -> Optional[Project]:
        return db.query(Project).filter(Project.id == project_id).first()

    @staticmethod
    def create_project(db: Session, project_data: ProjectCreate, teacher_id: UUID) -> Project:
        from uuid import UUID as UUIDType
        
        # Convert class_id string to UUID if needed
        class_uuid = None
        if project_data.class_id:
            if isinstance(project_data.class_id, str):
                class_uuid = UUIDType(project_data.class_id)
            else:
                class_uuid = project_data.class_id
        
        db_project = Project(
            title=project_data.title,
            description=project_data.description,
            subject=project_data.subject,
            start_date=project_data.start_date,
            end_date=project_data.end_date,
            is_group_project=project_data.is_group_project,
            max_group_size=project_data.max_group_size,
            class_id=class_uuid,
            teacher_id=teacher_id
        )
        try:
            db.add(db_project)
            db.flush()
        except Exception as e:
            print(f"Error creating project: {e}")
            db.rollback()
            raise e

        if project_data.rubric:
            db_rubric = Rubric(
                name=project_data.rubric.name,
                description=project_data.rubric.description,
                project_id=db_project.id
            )
            db.add(db_rubric)
            db.flush()

            for criterion in project_data.rubric.criteria:
                db_criterion = RubricCriterion(
                    rubric_id=db_rubric.id,
                    criterion_name=criterion.criterion_name,
                    criterion_type=criterion.criterion_type,
                    description=criterion.description,
                    max_score=criterion.max_score,
                    weight=criterion.weight
                )
                db.add(db_criterion)
        
        # Assign project to students and notify them
        if project_data.class_id:
            from uuid import UUID as UUIDType
            class_uuid = project_data.class_id if isinstance(project_data.class_id, UUIDType) else UUIDType(project_data.class_id)
            enrollments = db.query(Enrollment).filter(Enrollment.class_id == class_uuid).all()
            for enrollment in enrollments:
                # Create ProjectAssignment
                assignment = ProjectAssignment(
                    project_id=db_project.id,
                    student_id=enrollment.student_id
                )
                db.add(assignment)
                
                # Create Notification
                notification = Notification(
                    recipient_id=enrollment.student_id,
                    title="New Project Assigned",
                    message=f"You have been assigned a new project: {db_project.title}",
                    type=NotificationType.ASSIGNMENT,
                    reference_id=db_project.id
                )
                db.add(notification)
        
        
        # Create Google Calendar Event
        try:
            from app.services.google_service import google_service
            if project_data.start_date and project_data.end_date:
                print(f"[CALENDAR] Creating event for project: {db_project.title}")
                google_service.create_calendar_event(
                    summary=f"Project Due: {db_project.title}",
                    description=db_project.description or "Project Deadline",
                    start_time=project_data.start_date, # Assuming these are datetime objects
                    end_time=project_data.end_date 
                )
        except Exception as e:
            print(f"[CALENDAR] Failed to create calendar event: {e}")
            # Continue without failing the project creation
        
        db.commit()
        db.refresh(db_project)
        return db_project

    @staticmethod
    def get_submissions(db: Session, project_id: UUID) -> List[ProjectSubmission]:
        return db.query(ProjectSubmission).join(ProjectAssignment).filter(
            ProjectAssignment.project_id == project_id
        ).all()

    @staticmethod
    def create_submission(db: Session, submission_data: ProjectSubmissionCreate) -> ProjectSubmission:
        db_submission = ProjectSubmission(
            assignment_id=submission_data.assignment_id,
            comment=submission_data.comment,
            status=SubmissionStatus.SUBMITTED,
            submitted_at=datetime.utcnow()
        )
        db.add(db_submission)
        db.flush()

        for evidence in submission_data.evidence:
            db_evidence = SubmissionEvidence(
                submission_id=db_submission.id,
                evidence_type=evidence.evidence_type,
                content_url=str(evidence.content_url) if evidence.content_url else None,
                content_text=evidence.content_text
            )
            db.add(db_evidence)
        
        db.commit()
        db.refresh(db_submission)
        return db_submission

    @staticmethod
    def evaluate_submission(
        db: Session, 
        submission_id: UUID, 
        evaluator_id: UUID, 
        evaluator_type: EvaluatorType,
        rubric_id: UUID,
        total_score: float,
        overall_feedback: Optional[str] = None,
        scores: List[dict] = []
    ) -> ProjectEvaluation:
        from app.models.project import ProjectEvaluation, EvaluationScore, ProjectSubmission, SubmissionStatus
        
        # Create evaluation
        db_evaluation = ProjectEvaluation(
            submission_id=submission_id,
            evaluator_id=evaluator_id,
            evaluator_type=evaluator_type,
            rubric_id=rubric_id,
            total_score=total_score,
            feedback=overall_feedback
        )
        db.add(db_evaluation)
        db.flush()
        
        # Add individual criterion scores
        for score_data in scores:
            db_score = EvaluationScore(
                evaluation_id=db_evaluation.id,
                criterion_id=score_data['criterion_id'],
                score=score_data['score'],
                comments=score_data.get('comments')
            )
            db.add(db_score)
            
        # Update submission status
        submission = db.query(ProjectSubmission).filter(ProjectSubmission.id == submission_id).first()
        if submission:
            submission.status = SubmissionStatus.GRADED
            
        db.commit()
        db.refresh(db_evaluation)
        return db_evaluation

    @staticmethod
    def get_submission_by_id(db: Session, submission_id: UUID) -> Optional[ProjectSubmission]:
        return db.query(ProjectSubmission).filter(ProjectSubmission.id == submission_id).first()

    @staticmethod
    def delete_project(db: Session, project_id: UUID) -> bool:
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            return False
        db.delete(project)
        db.commit()
        return True
