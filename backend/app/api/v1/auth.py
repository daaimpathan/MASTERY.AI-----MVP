"""
Authentication API endpoints.
Handles user registration, login, token refresh, and logout.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
import uuid
import shutil
import os
from typing import Optional
from fastapi import UploadFile, File, Form
from app.schemas.user import UserUpdate
from app.database import get_db
from app.schemas.user import (
    RegisterRequest,
    LoginRequest,
    LoginResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserResponse
)
# from app.services.auth_service import AuthService
from app.dependencies import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(
    user_data: RegisterRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user.
    """
    from app.services.auth_service import AuthService
    user = AuthService.register_user(db, user_data)
    return user


@router.post("/login", response_model=LoginResponse)
def login(
    login_data: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Login with URN and password.
    
    Returns access token and refresh token.
    
    - **urn**: User's University Registration Number
    - **password**: User's password
    """
    # Authenticate user
    from app.services.auth_service import AuthService
    user = AuthService.authenticate_user(db, login_data)
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect URN or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Create tokens
    access_token, refresh_token = AuthService.create_tokens(user)
    
    # Save refresh token
    AuthService.save_refresh_token(db, user.id, refresh_token)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/google", response_model=LoginResponse)
def login_google(
    payload: dict,
    db: Session = Depends(get_db)
):
    """
    Login with Google.
    
    Accepts an ID token from Google (or a 'demo_token' for testing).
    """
    token = payload.get("token")
    
    # --- SIMULATED GOOGLE VERIFICATION ---
    # For a real app, you would verify the token with google.oauth2.id_token.verify_oauth2_token
    # Since we don't have a Client ID yet, we simulate a successful Google verification.
    
    email = "demo.teacher@university.edu" # Default demo email
    first_name = "Google"
    last_name = "User"
    google_id = "123456789"
    
    if token != "demo-token-123":
        # REAL IMPLEMENTATION PLACEHOLDER:
        # try:
        #     id_info = id_token.verify_oauth2_token(token, requests.Request(), "YOUR_GOOGLE_CLIENT_ID")
        #     email = id_info['email']
        #     google_id = id_info['sub']
        # except ValueError:
        #     raise HTTPException(status_code=401, detail="Invalid Google Token")
        pass

    # Upsert User (Find existing or Create new)
    from app.services.auth_service import AuthService
    
    # Check if user exists by email (assuming URN might be mapped or generated)
    # For this demo, we'll try to find a user or pick the first one
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        # Fallback to the first available user for demo stability if demo email missing
        user = db.query(User).first()
            
    if not user:
         raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="No user account found linked to this Google account.",
        )
    
    # Create tokens
    access_token, refresh_token = AuthService.create_tokens(user)
    AuthService.save_refresh_token(db, user.id, refresh_token)
    
    return LoginResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=user
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    """
    from app.services.auth_service import AuthService
    access_token = AuthService.refresh_access_token(db, token_data.refresh_token)
    
    if not access_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer"
    )


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(
    token_data: RefreshTokenRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Logout by invalidating refresh token.
    
    Requires authentication.
    
    - **refresh_token**: Refresh token to invalidate
    """
    from app.services.auth_service import AuthService
    AuthService.logout(db, token_data.refresh_token)
    return None


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """
    Get current authenticated user information.
    
    Requires authentication.
    """
    return current_user


from fastapi import UploadFile, File, Form
from typing import Optional
import shutil
import os
from app.schemas.user import UserUpdate

@router.put("/me", response_model=UserResponse)
async def update_user_profile(
    first_name: Optional[str] = Form(None),
    last_name: Optional[str] = Form(None),
    profile_image: Optional[UploadFile] = File(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update current user profile and upload image.
    """
    try:
        update_data = {}
        if first_name:
            update_data["first_name"] = first_name
        if last_name:
            update_data["last_name"] = last_name
            
        if profile_image:
            # Create directory if it doesn't exist (handled in main.py but good safety)
            os.makedirs("uploads/profiles", exist_ok=True)
            
            # Generate safe filename
            file_extension = os.path.splitext(profile_image.filename)[1]
            filename = f"user_{current_user.id}_{uuid.uuid4()}{file_extension}"
            file_path = f"uploads/profiles/{filename}"
            
            # Save file
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(profile_image.file, buffer)
                
            # Store relative path or URL
            # Assuming we serve from /uploads
            update_data["profile_image"] = f"/uploads/profiles/{filename}"

        if not update_data:
            return current_user

        user_update = UserUpdate(**update_data)
        from app.services.auth_service import AuthService
        updated_user = AuthService.update_user_profile(db, current_user, user_update)
        return updated_user
    except Exception as e:
        print(f"Error updating profile: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Profile update failed: {str(e)}")
