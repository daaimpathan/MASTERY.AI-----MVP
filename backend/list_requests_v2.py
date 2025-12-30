from app.database import SessionLocal
from app.models.resource import ResourceRequest
from app.models.class_model import Class
from app.models.user import User

db = SessionLocal()
requests = db.query(ResourceRequest).all()

print(f"Total Requests: {len(requests)}")
for r in requests:
    class_obj = db.query(Class).filter(Class.id == r.class_id).first()
    teacher_email = "None"
    if class_obj:
        teacher = db.query(User).filter(User.id == class_obj.teacher_id).first()
        if teacher:
            teacher_email = teacher.email
    
    print(f"ID: {r.id}")
    print(f"  Title: {r.title}")
    print(f"  Status: {r.status}")
    print(f"  Teacher: {teacher_email}")
    print("-" * 20)

db.close()
