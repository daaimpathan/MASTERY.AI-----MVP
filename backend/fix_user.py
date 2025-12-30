from app.database import SessionLocal, engine, Base
from app.models.user import User, UserRole, Institution
from app.utils.security import hash_password
import sys
import os
import uuid

# Add current directory to path
sys.path.append(os.getcwd())

def fix_user():
    print("Initializing database connection...")
    try:
        # Create tables if they don't exist (for SQLite especially)
        Base.metadata.create_all(bind=engine)
        
        db = SessionLocal()
        print("Connected to database.")
    except Exception as e:
        print(f"Failed to connect/init DB: {e}")
        return

    try:
        print("Checking for student@mastery.ai...")
        user = db.query(User).filter(User.email == "student@mastery.ai").first()
        
        target_password = "password123"
        hashed_pw = hash_password(target_password)
        
        if user:
            print(f"User found: {user.email}")
            print("Updating password and ensuring active status...")
            user.password_hash = hashed_pw
            user.is_active = True
            if not user.urn:
                user.urn = "2025URN001" # Set a default URN
            if not user.first_name:
                user.first_name = "Student"
            if not user.last_name:
                user.last_name = "User"
            if not user.role:
                user.role = UserRole.STUDENT
                
            db.commit()
            print("User updated successfully.")
        else:
            print("User not found. Creating new user...")
            
            # Ensure institution exists
            inst = db.query(Institution).first()
            if not inst:
                print("Creating default institution...")
                inst = Institution(name="Default Academy")
                db.add(inst)
                db.commit()
                db.refresh(inst)
            
            new_user = User(
                email="student@mastery.ai",
                urn="2025URN001",
                password_hash=hashed_pw,
                first_name="Student",
                last_name="User",
                role=UserRole.STUDENT,
                institution_id=inst.id,
                is_active=True
            )
            db.add(new_user)
            db.commit()
            print("User created successfully.")

    except Exception as e:
        print(f"Error executing fix: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_user()
