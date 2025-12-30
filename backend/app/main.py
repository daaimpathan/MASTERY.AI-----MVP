"""
Main FastAPI application.
MASTERY.AI - Adaptive Mastery & Engagement Platform
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import get_settings
from app.database import engine, Base
import app.models # Register all models in Base.metadata
from app.api.v1 import auth, analytics, projects, engagement, mastery, quiz, assignments, resources, syllabus, notifications, classes, attendance, chat, thought_proof
from app.routers import daily_challenge, focus

settings = get_settings()


# Create database tables
Base.metadata.create_all(bind=engine)

# Initialize FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="""
    MASTERY.AI - Adaptive Mastery & Engagement Platform
    
    A production-ready EdTech platform that:
    - Manages Project-Based Learning (PBL)
    - Tracks student engagement with explainable AI
    - Provides adaptive homework based on mastery levels
    
    ## Features
    
    * **PBL Management**: Create, assign, and evaluate multidisciplinary projects
    * **Engagement Tracking**: Real-time engagement index with contributing factors
    * **Adaptive Learning**: Personalized assignments based on concept mastery
    * **Role-Based Access**: Admin, Teacher, and Student roles with proper permissions
    
    ## Authentication
    
    All endpoints (except /auth/register and /auth/login) require JWT authentication.
    Include the access token in the Authorization header: `Bearer <token>`
    """,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins during development
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],  # Explicitly list all methods
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# --- DEBUGGING: Global Exception Handler ---
from fastapi import Request
from fastapi.responses import JSONResponse
import traceback

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    error_msg = f"{type(exc).__name__}: {str(exc)}"
    print(f"GLOBAL ERROR: {error_msg}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": error_msg, "trace": traceback.format_exc()},
    )
# -------------------------------------------

# Include routers
app.include_router(auth.router, prefix="/api/v1")
app.include_router(analytics.router, prefix="/api/v1")
app.include_router(projects.router, prefix="/api/v1")
app.include_router(engagement.router, prefix="/api/v1")
app.include_router(mastery.router, prefix="/api/v1")
app.include_router(quiz.router, prefix="/api/v1")
app.include_router(assignments.router, prefix="/api/v1")
app.include_router(resources.router, prefix="/api/v1")
app.include_router(syllabus.router, prefix="/api/v1")
app.include_router(notifications.router, prefix="/api/v1")
app.include_router(classes.router, prefix="/api/v1")
# ... existing code ...
app.include_router(attendance.router, prefix="/api/v1")
app.include_router(chat.router, prefix="/api/v1")
app.include_router(thought_proof.router, prefix="/api/v1")
app.include_router(daily_challenge.router, prefix="/api/v1")
app.include_router(focus.router, prefix="/api/v1")

@app.on_event("startup")
async def startup_event():
    print("--------------------------------------------------")
    print("MASTERY.AI SERVER RESTARTED - CHECKING CONFIG...")
    from app.config import get_settings
    settings = get_settings()
    if settings.GEMINI_API_KEY:
        print(f"API KEY LOADED: {settings.GEMINI_API_KEY[:5]}... (Length: {len(settings.GEMINI_API_KEY)})")
    else:
        print("!!! WARNING: GEMINI_API_KEY IS MISSING !!!")
    print("--------------------------------------------------")

from fastapi.staticfiles import StaticFiles
import os

# Create uploads directory if it doesn't exist
os.makedirs("uploads/profiles", exist_ok=True)
os.makedirs("uploads/resources", exist_ok=True)

# Mount static files
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Health check endpoint
@app.get("/health", tags=["Health"])
def health_check():
    """
    Health check endpoint.
    Returns the status of the application.
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.APP_VERSION
    }


@app.get("/", tags=["Root"])
def root():
    """
    Root endpoint.
    Provides basic information about the API.
    """
    return {
        "message": "Welcome to MASTERY.AI - Adaptive Mastery & Engagement Platform",
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
