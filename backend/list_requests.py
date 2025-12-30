from app.database import SessionLocal
from app.models.resource import ResourceRequest
from app.models.user import User

db = SessionLocal()
requests = db.query(ResourceRequest).all()

print(f"Total Requests: {len(requests)}")
for r in requests:
    print(f"ID: {r.id}, Title: {r.title}, Status: {r.status}, ClassID: {r.class_id}")

db.close()
