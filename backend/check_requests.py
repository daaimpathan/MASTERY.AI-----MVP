from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys

# Add the current directory to path so we can import app
sys.path.append(os.getcwd())

from app.models.user import User, UserRole
from app.models.class_model import Class, Enrollment
from app.models.resource import ResourceRequest
from app.config import get_settings

settings = get_settings()
DATABASE_URL = settings.DATABASE_URL
print(f"Using DATABASE_URL: {DATABASE_URL}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def check_db():
    print("--- TEACHERS ---")
    teachers = db.query(User).filter(User.role == UserRole.TEACHER).all()
    for t in teachers:
        print(f"Teacher: {t.first_name} {t.last_name} ({t.email}) ID: {t.id}")
        classes = db.query(Class).filter(Class.teacher_id == t.id).all()
        for c in classes:
            print(f"  - Class: {c.name} ID: {c.id}")
            
    print("\n--- REQUESTS ---")
    requests = db.query(ResourceRequest).all()
    if not requests:
        print("No requests found.")
    for r in requests:
        print(f"Request: {r.title} ClassID: {r.class_id} StudentID: {r.student_id}")
        class_obj = db.query(Class).filter(Class.id == r.class_id).first()
        if class_obj:
            print(f"  - For Class: {class_obj.name}, TeacherID: {class_obj.teacher_id}")
            teacher_obj = db.query(User).filter(User.id == class_obj.teacher_id).first()
            if teacher_obj:
                print(f"  - Teacher Email: {teacher_obj.email}")
        else:
            print(f"  - Class NOT FOUND for id {r.class_id}")

if __name__ == "__main__":
    check_db()
