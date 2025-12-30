from app.database import engine, Base
from app.models.user import User
from app.models.focus_session import FocusSession
from sqlalchemy import text

def migrate():
    print("Running migration for Focus Event Horizon...")
    with engine.connect() as conn:
        # Check if focus_sessions table exists
        result = conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='focus_sessions'"))
        if not result.fetchone():
            print("Creating focus_sessions table...")
            FocusSession.__table__.create(engine)
        else:
            print("focus_sessions table already exists.")

        # Check for dark_energy column in users
        try:
            conn.execute(text("SELECT dark_energy FROM users LIMIT 1"))
            print("dark_energy column already exists.")
        except Exception:
            print("Adding dark_energy column to users table...")
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN dark_energy INTEGER DEFAULT 0"))
                conn.commit()
                print("Column added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    migrate()
