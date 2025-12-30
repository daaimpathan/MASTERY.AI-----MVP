from app.database import SessionLocal
from app.models.class_model import Class
from app.models.user import User

db = SessionLocal()

print("--- USERS ---")
users = db.query(User).all()
for u in users:
    print(f"User: {u.email} | Role: {u.role} | ID: {u.id}")

print("\n--- CLASSES ---")
classes = db.query(Class).all()
for c in classes:
    print(f"Class: {c.name} | Teacher ID: {c.teacher_id} | ID: {c.id}")

db.close()
