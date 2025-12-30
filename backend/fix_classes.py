from app.database import SessionLocal, engine, Base
from app.models.class_model import Class
from app.models.user import User, Institution
import sys
import os
import uuid

# Add current directory to path
sys.path.append(os.getcwd())

def fix_classes():
    print("Initializing database connection...")
    try:
        # Create tables if they don't exist
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        print("Connected to database.")
    except Exception as e:
        print(f"Failed to connect/init DB: {e}")
        return

    try:
        print("Checking for classes...", flush=True)
        # Get teacher
        print("Querying teacher...", flush=True)
        teacher = db.query(User).filter(User.email == "teacher@mastery.ai").first()
        if not teacher:
            print("Teacher not found! Run fix_teacher.py first.", flush=True)
            return
        print(f"Teacher found: {teacher.id} (Type: {type(teacher.id)})", flush=True)

        # Get institution
        print("Querying institution...", flush=True)
        inst = db.query(Institution).first()
        if not inst:
            print("Institution not found! Run fix_teacher.py first.", flush=True)
            return
        print(f"Institution found: {inst.id}", flush=True)

        # Check for existing class
        existing_class = db.query(Class).first()
        
        if existing_class:
            print(f"Class found: {existing_class.name}", flush=True)
            print(f"UUID: {str(existing_class.id)}", flush=True)
        else:
            print("No classes found. Creating 'Class 10 A'...", flush=True)
            new_id = uuid.uuid4()
            print(f"New UUID: {new_id}", flush=True)
            
            new_class = Class(
                id=new_id,
                name="Class 10 A",
                subject="General",
                teacher_id=teacher.id,
                institution_id=inst.id,
                academic_year="2025-2026"
            )
            print("Adding to DB...", flush=True)
            db.add(new_class)
            print("Committing...", flush=True)
            db.commit()
            print(f"Class created successfully.", flush=True)
            print(f"UUID: {str(new_class.id)}", flush=True)

    except Exception as e:
        import traceback
        with open("fix_error.log", "w") as f:
            f.write(f"Error: {e}\n")
            f.write(traceback.format_exc())
        print(f"Error logged to fix_error.log", flush=True)
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_classes()
