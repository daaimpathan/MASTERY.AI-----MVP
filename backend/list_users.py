from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
import sys
sys.path.append(os.getcwd())
from app.models.user import User, UserRole
from app.config import get_settings

settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
db = SessionLocal()

def list_users():
    users = db.query(User).all()
    print(f"{'URN':<15} | {'Role':<10} | {'Email':<25} | {'Name'}")
    print("-" * 70)
    for u in users:
        print(f"{u.urn or 'N/A':<15} | {str(u.role):<10} | {u.email or 'N/A':<25} | {u.first_name} {u.last_name}")

if __name__ == "__main__":
    list_users()
