"""
Resource service layer.
Handles business logic for resource management and request system.
"""

from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status, UploadFile
from typing import List, Optional
from uuid import UUID
import os
import shutil
import uuid as uuid_lib

from app.models.resource import Resource, ResourceRequest, ResourceType, RequestStatus
from app.models.user import User, UserRole
from app.models.class_model import Class, Enrollment
from app.models.notification import Notification, NotificationType
from app.schemas.resource import (
    ResourceCreate, ResourceUpdate, ResourceResponse,
    ResourceRequestCreate, ResourceRequestAction, ResourceRequestResponse
)


class ResourceService:
    """Service class for resource management."""
    
    @staticmethod
    def get_user_classes(db: Session, user: User) -> List[UUID]:
        """
        Get list of class IDs that the user has access to.
        Teachers: classes they teach
        Students: classes they're enrolled in
        """
        is_teacher = user.role == UserRole.TEACHER or str(user.role) == "teacher"
        is_student = user.role == UserRole.STUDENT or str(user.role) == "student"
        
        if is_teacher:
            classes = db.query(Class).filter(Class.teacher_id == user.id).all()
            return [c.id for c in classes]
        elif is_student:
            enrollments = db.query(Enrollment).filter(Enrollment.student_id == user.id).all()
            return [e.class_id for e in enrollments]
        return []
    
    @staticmethod
    def create_resource(
        db: Session,
        resource_data: ResourceCreate,
        teacher: User,
        file_path: Optional[str] = None
    ) -> Resource:
        """Create a new resource."""
        # Verify teacher has access to the class
        class_obj = db.query(Class).filter(Class.id == resource_data.class_id).first()
        if not class_obj:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Class not found"
            )
        
        if class_obj.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to add resources to this class"
            )
        
        # File upload is now handled in the router
        print(f"[SERVICE] Creating resource: {resource_data.title}, Path: {file_path}, URL: {resource_data.url}")
        
        
        # Create resource
        resource = Resource(
            title=resource_data.title,
            description=resource_data.description,
            type=resource_data.type,
            file_path=file_path,
            url=resource_data.url,
            content=resource_data.content,
            teacher_id=teacher.id,
            class_id=resource_data.class_id
        )
        
        db.add(resource)
        db.commit()
        db.refresh(resource)
        
        return resource
    
    @staticmethod
    def get_resources(db: Session, user: User) -> List[Resource]:
        """Get all resources accessible to the user."""
        class_ids = ResourceService.get_user_classes(db, user)
        
        if not class_ids:
            return []
        
        resources = db.query(Resource).filter(
            Resource.class_id.in_(class_ids)
        ).order_by(Resource.created_at.desc()).all()
        
        return resources
    
    @staticmethod
    def get_resource(db: Session, resource_id: UUID, user: User) -> Resource:
        """Get a single resource by ID."""
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # Verify user has access to this resource's class
        class_ids = ResourceService.get_user_classes(db, user)
        if resource.class_id not in class_ids:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have access to this resource"
            )
        
        return resource
    
    @staticmethod
    def update_resource(
        db: Session,
        resource_id: UUID,
        resource_data: ResourceUpdate,
        teacher: User
    ) -> Resource:
        """Update an existing resource."""
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        
        if not resource:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        # Verify teacher owns this resource
        if resource.teacher_id != teacher.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this resource"
            )
        
        # Update fields
        update_data = resource_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(resource, field, value)
        
        db.commit()
        db.refresh(resource)
        
        return resource
    
    @staticmethod
    def delete_resource(db: Session, resource_id: UUID, teacher: User) -> None:
        """Delete a resource."""
        print(f"[DELETE] Attempting to delete resource {resource_id} by teacher {teacher.id}")
        resource = db.query(Resource).filter(Resource.id == resource_id).first()
        
        if not resource:
            print(f"[DELETE] Resource {resource_id} not found")
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource not found"
            )
        
        print(f"[DELETE] Resource found. Owner: {resource.teacher_id}, Requester: {teacher.id}")
        
        # Verify teacher owns this resource or is admin
        if resource.teacher_id != teacher.id and teacher.role != UserRole.ADMIN:
            print(f"[DELETE] Permission denied. Resource owner: {resource.teacher_id}, Requester: {teacher.id}, Role: {teacher.role}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"You don't have permission to delete this resource. This resource was created by a different teacher."
            )
        
        try:
            # Delete associated file if exists
            if resource.file_path:
                file_path = resource.file_path.lstrip('/')
                if os.path.exists(file_path):
                    print(f"[DELETE] Deleting file: {file_path}")
                    try:
                        os.remove(file_path)
                    except Exception as fe:
                        print(f"[DELETE] Warning: Failed to delete file {file_path}: {fe}")

            # Clear references in resource_requests to avoid IntegrityError (ForeignKey constraint)
            db.query(ResourceRequest).filter(ResourceRequest.approved_resource_id == resource_id).update({"approved_resource_id": None})
            db.flush()
            
            print(f"[DELETE] Deleting resource {resource_id} from database")
            db.delete(resource)
            db.commit()
            print(f"[DELETE] Resource {resource_id} deleted successfully")
        except Exception as e:
            import traceback
            error_trace = traceback.format_exc()
            print(f"[DELETE] CRITICAL ERROR:\n{error_trace}")
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Resource Delete Failed: {str(e)}"
            )
    
    @staticmethod
    def create_request(
        db: Session,
        request_data: ResourceRequestCreate,
        student: User
    ) -> ResourceRequest:
        """Create a new resource request."""
        # Verify student is enrolled in the class
        enrollment = db.query(Enrollment).filter(
            Enrollment.student_id == student.id,
            Enrollment.class_id == request_data.class_id
        ).first()

        
        class_obj = db.query(Class).filter(Class.id == request_data.class_id).first()
        
        if not enrollment:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not enrolled in this class"
            )
        
        # Create request
        request = ResourceRequest(
            title=request_data.title,
            description=request_data.description,
            type=request_data.type,
            student_id=student.id,
            class_id=request_data.class_id,
            status=RequestStatus.PENDING
        )
        
        db.add(request)
        db.flush() # Generate ID
        
        # Notify Teacher (Safely)
        try:
            if class_obj and class_obj.teacher_id:
                print(f"Creating notification for teacher {class_obj.teacher_id}")
                notification = Notification(
                    recipient_id=class_obj.teacher_id,
                    title="New Resource Request",
                    message=f"Student {student.first_name} requested a resource: {request.title}",
                    type=NotificationType.SYSTEM,
                    reference_id=request.id
                )
                db.add(notification)
        except Exception as e:
            print(f"Failed to create notification: {e}")
            # Do not rollback the request, just ignore notification failure
            pass
        
        db.commit()
        db.refresh(request)
        
        return request
    
    @staticmethod
    def get_requests(db: Session, user: User) -> List[ResourceRequest]:
        """Get resource requests based on user role."""
        is_teacher = user.role == UserRole.TEACHER or str(user.role) == "teacher"
        is_student = user.role == UserRole.STUDENT or str(user.role) == "student"

        if is_student:
            # Students see only their own requests
            requests = db.query(ResourceRequest).filter(
                ResourceRequest.student_id == user.id
            ).order_by(ResourceRequest.created_at.desc()).all()
        elif is_teacher:
            # Teachers see all requests for their classes
            class_ids = ResourceService.get_user_classes(db, user)
            requests = db.query(ResourceRequest).filter(
                ResourceRequest.class_id.in_(class_ids)
            ).order_by(ResourceRequest.created_at.desc()).all()
        else:
            requests = []
        
        return requests
    
    @staticmethod
    def approve_request(
        db: Session,
        request_id: UUID,
        teacher: User,
        action_data: ResourceRequestAction
    ) -> ResourceRequest:
        """Approve a resource request and create the resource."""
        request = db.query(ResourceRequest).filter(ResourceRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        # Verify teacher has access to this class
        is_teacher = str(teacher.role) == "teacher" or teacher.role == UserRole.TEACHER
        
        if not is_teacher:
            print(f"DEBUG: User {teacher.id} is not a teacher (role: {teacher.role})")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can approve requests"
            )

        class_obj = db.query(Class).filter(Class.id == request.class_id).first()
        
        # Check if teacher owns the class (robust ID comparison)
        is_owner = str(class_obj.teacher_id) == str(teacher.id) if class_obj else False
        
        if not class_obj or not is_owner:
            print(f"DEBUG: Permission denied for teacher {teacher.id} on class {request.class_id}. Owner: {class_obj.teacher_id if class_obj else 'None'}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to approve this request"
            )
        
        # Create resource from request
        resource = Resource(
            title=request.title,
            description=request.description,
            type=request.type,
            teacher_id=teacher.id,
            class_id=request.class_id
        )
        
        db.add(resource)
        db.flush()  # Get resource ID
        
        # Update request
        request.status = RequestStatus.APPROVED
        request.teacher_response = action_data.teacher_response
        request.approved_resource_id = resource.id
        
        db.commit()
        db.refresh(request)
        
        return request
    
    @staticmethod
    def reject_request(
        db: Session,
        request_id: UUID,
        teacher: User,
        action_data: ResourceRequestAction
    ) -> ResourceRequest:
        """Reject a resource request."""
        request = db.query(ResourceRequest).filter(ResourceRequest.id == request_id).first()
        
        if not request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Request not found"
            )
        
        # Verify teacher has access to this class
        is_teacher = str(teacher.role) == "teacher" or teacher.role == UserRole.TEACHER
        
        if not is_teacher:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only teachers can reject requests"
            )

        class_obj = db.query(Class).filter(Class.id == request.class_id).first()
        
        # Check if teacher owns the class (robust ID comparison)
        is_owner = str(class_obj.teacher_id) == str(teacher.id) if class_obj else False
        
        if not class_obj or not is_owner:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to reject this request"
            )
        
        # Update request
        request.status = RequestStatus.REJECTED
        request.teacher_response = action_data.teacher_response
        
        db.commit()
        db.refresh(request)
        
        return request
