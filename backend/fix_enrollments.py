from app.database import SessionLocal
from app.models.class_model import Enrollment, Class
from app.models.user import User
import uuid

db = SessionLocal()

try:
    print("Fixing Enrollments...")
    
    # Get Student
    student = db.query(User).filter(User.email == "student@mastery.ai").first()
    if not student:
        print("Student not found! Run fix_user.py first.")
        exit()
    
    # Get Class
    cls = db.query(Class).first()
    if not cls:
        print("Class not found! Run fix_classes.py first.")
        exit()
        
    # Check if already enrolled
    existing = db.query(Enrollment).filter(
        Enrollment.student_id == student.id,
        Enrollment.class_id == cls.id
    ).first()
    
    if existing:
        print(f"Student {student.email} is already enrolled in {cls.name}.")
    else:
        print(f"Enrolling {student.email} in {cls.name}...")
        enrollment = Enrollment(
            id=uuid.uuid4(),
            student_id=student.id,
            class_id=cls.id
        )
        db.add(enrollment)
        db.commit()
        print("Enrollment successful!")

except Exception as e:
    print(f"Error: {e}")
    db.rollback()
finally:
    db.close()
