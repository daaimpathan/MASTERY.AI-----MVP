from app.database import SessionLocal
from app.models.user import User
from app.utils.security import verify_password
import sys
import os

# Add current directory to path so we can import app
sys.path.append(os.getcwd())

def check_user():
    print("Checking database for student@mastery.ai...")
    try:
        db = SessionLocal()
    except Exception as e:
        print(f"Failed to connect to DB: {e}")
        return

    try:
        user = db.query(User).filter(User.email == "student@mastery.ai").first()
        if user:
            print(f"User found: {user.email}")
            print(f"URN: {user.urn}")
            print(f"Is Active: {user.is_active}")
            print(f"Role: {user.role}")
            print(f"Institution ID: {user.institution_id}")
            # Check password
            try:
                is_valid = verify_password("password123", user.password_hash)
                print(f"Password 'password123' valid: {is_valid}")
            except Exception as e:
                print(f"Error checking password: {e}")
        else:
            print("User 'student@mastery.ai' not found.")
            
        # Also check if any user has URN 'student@mastery.ai' just in case
        user_urn = db.query(User).filter(User.urn == "student@mastery.ai").first()
        if user_urn:
             print(f"User with URN 'student@mastery.ai' found: {user_urn.email}")
        else:
             print("No user with URN 'student@mastery.ai' found.")

    except Exception as e:
        print(f"Error querying DB: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_user()
