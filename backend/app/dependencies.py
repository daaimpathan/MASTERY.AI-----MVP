"""
Dependency injection functions for FastAPI.
Provides common dependencies like database sessions and current user.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
import uuid
from app.database import get_db
from app.models.user import User, UserRole
from app.utils.security import decode_token

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer credentials
        db: Database session
        
    Returns:
        Current user
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    token = credentials.credentials
    payload = decode_token(token)
    
    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check token type
    if payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token type",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id_uuid = uuid.UUID(user_id) if isinstance(user_id, str) else user_id
    
    user = db.query(User).filter(User.id == user_id_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )
    
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.
    
    Args:
        current_user: Current user from token
        
    Returns:
        Current active user
        
    Raises:
        HTTPException: If user is inactive
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Inactive user"
        )
    return current_user


def require_role(required_roles: list[UserRole] | UserRole):
    """
    Dependency factory for role-based access control.
    Supports both a list of roles or a single role.
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        # Normalize to list
        roles_list = required_roles if isinstance(required_roles, list) else [required_roles]
        
        # Create a set of allowed role values
        allowed_roles = {str(r.value) if hasattr(r, 'value') else str(r) for r in roles_list}
        user_role = str(current_user.role.value) if hasattr(current_user.role, 'value') else str(current_user.role)
        
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required roles: {list(allowed_roles)}"
            )
        return current_user
    
    return role_checker


# Convenience dependencies for specific roles
async def get_current_admin(
    current_user: User = Depends(require_role([UserRole.ADMIN]))
) -> User:
    """Get current admin user."""
    return current_user


async def get_current_teacher(
    current_user: User = Depends(require_role([UserRole.TEACHER, UserRole.ADMIN]))
) -> User:
    """Get current teacher or admin user."""
    return current_user


async def get_current_student(
    current_user: User = Depends(require_role([UserRole.STUDENT]))
) -> User:
    """Get current student user."""
    return current_user
