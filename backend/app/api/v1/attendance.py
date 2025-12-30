from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Optional
from app.services.sheets_service import sheets_service
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(tags=["Attendance"])

class AttendanceRecord(BaseModel):
    studentId: str
    studentName: Optional[str] = None
    status: str
    markedAt: Optional[str] = None

class SyncRequest(BaseModel):
    date: str
    sheet_id: str
    records: List[AttendanceRecord]

@router.post("/attendance/sync")
async def sync_attendance(request: SyncRequest, current_user: User = Depends(get_current_user)):
    """
    Sync attendance records to Google Sheets.
    """
    if current_user.role != "teacher" and current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only teachers can sync attendance")

    try:
        sheets_service.sync_attendance(request.sheet_id, request.date, [r.dict() for r in request.records])
        return {"message": "Attendance synced successfully"}
    except Exception as e:
        # Check for specific "File not found" which usually means missing credentials.json
        if "credentials.json" in str(e):
             raise HTTPException(
                status_code=500, 
                detail="Server Configuration Error: Google Credentials not found. Please contact administrator to add 'credentials.json' to backend."
            )
        raise HTTPException(status_code=500, detail=str(e))
