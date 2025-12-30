from app.database import SessionLocal
from app.models.class_model import Class

db = SessionLocal()
classes = db.query(Class).all()
print(f"Total Classes: {len(classes)}")
for c in classes:
    print(f"Class: {c.name} | ID: {c.id} (Type: {type(c.id)})")
db.close()
