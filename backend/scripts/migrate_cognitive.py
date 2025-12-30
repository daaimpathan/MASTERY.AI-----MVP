from app.database import engine
from sqlalchemy import text

def migrate():
    print("Running migration for Cognitive Score...")
    with engine.connect() as conn:
        # Check for cognitive_score column in users
        try:
            conn.execute(text("SELECT cognitive_score FROM users LIMIT 1"))
            print("cognitive_score column already exists.")
        except Exception:
            print("Adding cognitive_score column to users table...")
            try:
                conn.execute(text("ALTER TABLE users ADD COLUMN cognitive_score INTEGER DEFAULT 0"))
                conn.commit()
                print("Column added successfully.")
            except Exception as e:
                print(f"Error adding column: {e}")

if __name__ == "__main__":
    migrate()
