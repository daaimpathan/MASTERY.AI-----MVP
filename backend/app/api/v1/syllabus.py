from typing import List
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.syllabus import SyllabusTopic
from app.models.class_model import Class
from app.schemas.syllabus import SyllabusTopicCreate, SyllabusTopicUpdate, SyllabusTopicResponse
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter()

@router.get("/classes/{class_id}/topics", response_model=List[SyllabusTopicResponse])
async def get_class_topics(
    class_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all syllabus topics for a specific class."""
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
        
    topics = db.query(SyllabusTopic).filter(SyllabusTopic.class_id == class_id).order_by(SyllabusTopic.created_at).all()
    return topics

@router.post("/classes/{class_id}/topics", response_model=SyllabusTopicResponse)
async def create_topic(
    class_id: UUID,
    topic: SyllabusTopicCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new syllabus topic (Teachers only)."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can create syllabus topics")
        
    # Verify class exists
    class_obj = db.query(Class).filter(Class.id == class_id).first()
    if not class_obj:
        raise HTTPException(status_code=404, detail="Class not found")
        
    # Verify teacher owns this class
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only add topics to your own classes")
        
    new_topic = SyllabusTopic(
        class_id=class_id,
        title=topic.title,
        status=topic.status
    )
    
    db.add(new_topic)
    db.commit()
    db.refresh(new_topic)
    return new_topic

@router.patch("/topics/{topic_id}", response_model=SyllabusTopicResponse)
async def update_topic(
    topic_id: UUID,
    topic_update: SyllabusTopicUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update a syllabus topic (Teachers only)."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can update syllabus topics")
        
    topic = db.query(SyllabusTopic).filter(SyllabusTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    # Verify teacher owns the class this topic belongs to
    class_obj = db.query(Class).filter(Class.id == topic.class_id).first()
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update topics in your own classes")
        
    if topic_update.title is not None:
        topic.title = topic_update.title
    if topic_update.status is not None:
        topic.status = topic_update.status
        
    db.commit()
    db.refresh(topic)
    return topic

@router.delete("/topics/{topic_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_topic(
    topic_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete a syllabus topic (Teachers only)."""
    if current_user.role != "teacher":
        raise HTTPException(status_code=403, detail="Only teachers can delete syllabus topics")
        
    topic = db.query(SyllabusTopic).filter(SyllabusTopic.id == topic_id).first()
    if not topic:
        raise HTTPException(status_code=404, detail="Topic not found")
        
    # Verify teacher owns the class this topic belongs to
    class_obj = db.query(Class).filter(Class.id == topic.class_id).first()
    if class_obj.teacher_id != current_user.id:
        raise HTTPException(status_code=403, detail="You can only delete topics in your own classes")
        
    db.delete(topic)
    db.commit()
    return None
