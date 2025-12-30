"""
Authentication service for user registration, login, and token management.
"""

from datetime import datetime, timedelta
from typing import Optional, Tuple, Any
import uuid
from sqlalchemy.orm import Session
from sqlalchemy import or_
from fastapi import HTTPException, status
from app.models.user import User, RefreshToken
from app.schemas.user import UserCreate, LoginRequest
from app.utils.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.config import get_settings

settings = get_settings()


class AuthService:
    """Authentication service for user management and token operations."""
    
    @staticmethod
    def register_user(db: Session, user_data: UserCreate) -> User:
        """
        Register a new user.
        
        Args:
            db: Database session
            user_data: User registration data
            
        Returns:
            Created user
            
        Raises:
            HTTPException: If email already exists
        """
        # Check if email already exists
        existing_user = db.query(User).filter(User.email == user_data.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        
        # Create new user
        user = User(
            email=user_data.email,
            password_hash=hash_password(user_data.password),
            first_name=user_data.first_name,
            last_name=user_data.last_name,
            role=user_data.role,
            institution_id=user_data.institution_id
        )
        
        db.add(user)
        db.commit()
        db.refresh(user)
        
        db.refresh(user)
        
        return user
    
    @staticmethod
    def update_user_profile(db: Session, user: User, user_data: Any) -> User:
        """
        Update user profile.
        
        Args:
            db: Database session
            user: User to update
            user_data: New user data (UserUpdate schema)
            
        Returns:
            Updated user
        """
        update_data = user_data.model_dump(exclude_unset=True)
        
        for key, value in update_data.items():
            setattr(user, key, value)
            
        db.commit()
        db.refresh(user)
        return user
    
    @staticmethod
    def authenticate_user(db: Session, login_data: LoginRequest) -> Optional[User]:
        """
        Authenticate a user with URN/Email and password.
        
        Args:
            db: Database session
            login_data: Login credentials (URN and password)
            
        Returns:
            User if authentication successful, None otherwise
        """
        # Allow login with either URN or Email
        user = db.query(User).filter(
            or_(
                User.urn == login_data.urn,
                User.email == login_data.urn
            )
        ).first()
        
        if not user:
            return None
        
        if not verify_password(login_data.password, user.password_hash):
            return None
        
        if not user.is_active:
            return None
        
        return user
    
    @staticmethod
    def create_tokens(user: User) -> Tuple[str, str]:
        """
        Create access and refresh tokens for a user.
        
        Args:
            user: User to create tokens for
            
        Returns:
            Tuple of (access_token, refresh_token)
        """
        # Create access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        
        # Create refresh token
        refresh_token = create_refresh_token(
            data={"sub": str(user.id)}
        )
        
        return access_token, refresh_token
    
    @staticmethod
    def save_refresh_token(db: Session, user_id: Any, token: str) -> RefreshToken:
        """
        Save refresh token to database.
        
        Args:
            db: Database session
            user_id: User UUID (object or string)
            token: Refresh token
            
        Returns:
            Created RefreshToken record
        """
        expires_at = datetime.utcnow() + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        
        # Ensure UUID objects
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        
        refresh_token_record = RefreshToken(
            id=uuid.uuid4(),
            user_id=user_id,
            token=token,
            expires_at=expires_at
        )
        
        db.add(refresh_token_record)
        db.commit()
        db.refresh(refresh_token_record)
        
        return refresh_token_record
    
    @staticmethod
    def refresh_access_token(db: Session, refresh_token: str) -> Optional[str]:
        """
        Refresh access token using refresh token.
        
        Args:
            db: Database session
            refresh_token: Refresh token
            
        Returns:
            New access token if successful, None otherwise
        """
        # Decode refresh token
        payload = decode_token(refresh_token)
        if not payload or payload.get("type") != "refresh":
            return None
        
        # Check if token exists in database
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()
        
        if not token_record:
            return None
        
        # Check if token is expired
        if token_record.expires_at < datetime.utcnow():
            db.delete(token_record)
            db.commit()
            return None
        
        # Get user
        user = db.query(User).filter(User.id == token_record.user_id).first()
        if not user or not user.is_active:
            return None
        
        # Create new access token
        access_token = create_access_token(
            data={"sub": str(user.id), "email": user.email, "role": user.role.value}
        )
        
        return access_token
    
    @staticmethod
    def logout(db: Session, refresh_token: str) -> bool:
        """
        Logout user by invalidating refresh token.
        
        Args:
            db: Database session
            refresh_token: Refresh token to invalidate
            
        Returns:
            True if successful, False otherwise
        """
        token_record = db.query(RefreshToken).filter(
            RefreshToken.token == refresh_token
        ).first()
        
        if token_record:
            db.delete(token_record)
            db.commit()
            return True
        
        return False
    
    @staticmethod
    def cleanup_expired_tokens(db: Session) -> int:
        """
        Clean up expired refresh tokens.
        
        Args:
            db: Database session
            
        Returns:
            Number of tokens deleted
        """
        deleted = db.query(RefreshToken).filter(
            RefreshToken.expires_at < datetime.utcnow()
        ).delete()
        
        db.commit()
        return deleted
