# Technical Integrations Summary

### 1. Firebase Realtime Database
**Purpose:** Real-time data synchronization  
**Usage:**
- Live polling system
- Real-time notification delivery
- Instant engagement updates  
**Code Location:** `frontend/src/lib/firebase.ts`

---

### 2. Google Sheets API
**Purpose:** Automated Attendance Logging  
**Usage:**
- Synchronizing marked attendance from the platform to external Google Sheets.
- Maintaining a permanent audit log of student daily presence.
- Enabling schools to use spreadsheet-based reporting for compliance.  
**Code Location:** `backend/app/services/sheets_service.py`

---

### 3. Google Calendar API
**Purpose:** Project Deadline & Event Management  
**Usage:**
- Automatically creating calendar events when a new Project (PBL) is assigned.
- Setting deadline reminders for students and teachers.
- Synchronizing multidisciplinary project schedules with personal calendars.  
**Code Location:** `backend/app/services/google_service.py` and `backend/app/services/pbl_service.py`

---

### 4. Google Drive API
**Purpose:** Cloud Storage for Learning Resources  
**Usage:**
- Uploading student evidence (PDFs/Images) for project submissions.
- Storing teacher-uploaded course materials and syllabus documents.
- Managing permissions for shared educational resources.  
**Code Location:** `backend/app/services/google_service.py`
