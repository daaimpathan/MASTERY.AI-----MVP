"""
Authentication and user related Pydantic schemas.
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime
from uuid import UUID
from app.models.user import UserRole


# ============= User Schemas =============

class UserBase(BaseModel):
    """Base user schema."""
    email: EmailStr
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: UserRole


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str = Field(..., min_length=8, max_length=100)
    institution_id: Optional[UUID] = None


class UserUpdate(BaseModel):
    """Schema for updating a user."""
    email: Optional[EmailStr] = None
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    is_active: Optional[bool] = None
    institution_id: Optional[UUID] = None
    profile_image: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    institution_id: Optional[UUID]
    is_active: bool
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: datetime


class UserWithToken(BaseModel):
    """Schema for user with authentication tokens."""
    user: UserResponse
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# ============= Authentication Schemas =============

class LoginRequest(BaseModel):
    """Schema for login request."""
    urn: str  # Changed from email to URN
    password: str


class LoginResponse(BaseModel):
    """Schema for login response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class RefreshTokenRequest(BaseModel):
    """Schema for refresh token request."""
    refresh_token: str


class TokenResponse(BaseModel):
    """Schema for token response."""
    access_token: str
    token_type: str = "bearer"


class RegisterRequest(UserCreate):
    """Schema for user registration."""
    pass


# ============= Institution Schemas =============

class InstitutionBase(BaseModel):
    """Base institution schema."""
    name: str = Field(..., min_length=1, max_length=255)
    address: Optional[str] = None


class InstitutionCreate(InstitutionBase):
    """Schema for creating an institution."""
    pass


class InstitutionResponse(InstitutionBase):
    """Schema for institution response."""
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    created_at: datetime
