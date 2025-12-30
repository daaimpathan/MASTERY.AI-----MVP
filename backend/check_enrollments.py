from app.database import SessionLocal
from app.models.class_model import Enrollment, Class
from app.models.user import User

db = SessionLocal()

print("--- ENROLLMENTS ---")
enrollments = db.query(Enrollment).all()
if not enrollments:
    print("No enrollments found.")
else:
    for e in enrollments:
        s = db.query(User).get(e.student_id)
        c = db.query(Class).get(e.class_id)
        print(f"Student: {s.email if s else 'Unknown'} -> Class: {c.name if c else 'Unknown'}")

# Check Student ID
student = db.query(User).filter(User.email == "student@mastery.ai").first()
if student:
    print(f"\nStudent 'student@mastery.ai' ID: {student.id}")
else:
    print("\nStudent 'student@mastery.ai' NOT FOUND.")

# Check Class ID
cls = db.query(Class).first()
if cls:
    print(f"Class '{cls.name}' ID: {cls.id}")
else:
    print("No classes found.")

db.close()
