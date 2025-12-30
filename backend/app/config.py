"""
Configuration management for MASTERY.AI application.
Loads environment variables and provides application settings.
"""

from pydantic_settings import BaseSettings
from typing import List
from functools import lru_cache


class Settings(BaseSettings):
    """Application settings loaded from environment variables."""
    
    # Database Configuration
    DATABASE_URL: str
    DATABASE_TEST_URL: str = ""
    
    # Redis Configuration
    REDIS_URL: str
    
    # JWT Configuration
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    
    # Application Configuration
    APP_NAME: str = "MASTERY.AI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:5173,http://localhost:5174"
    
    # File Upload Configuration
    MAX_UPLOAD_SIZE: int = 10485760  # 10MB
    UPLOAD_DIR: str = "./uploads"
    
    # Pagination
    DEFAULT_PAGE_SIZE: int = 20
    MAX_PAGE_SIZE: int = 100
    
    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 100
    
    # Engagement Index Configuration
    ENGAGEMENT_CALCULATION_PERIOD_DAYS: int = 30
    ENGAGEMENT_CACHE_TTL_SECONDS: int = 3600
    
    # AI Configuration
    GEMINI_API_KEY: str = ""
    
    # Mastery Configuration
    MASTERY_THRESHOLD: int = 70
    MASTERY_DECAY_RATE: float = 0.02
    MASTERY_DECAY_GRACE_PERIOD_DAYS: int = 7
    
    @property
    def allowed_origins_list(self) -> List[str]:
        """Parse ALLOWED_ORIGINS string into list."""
        return [origin.strip() for origin in self.ALLOWED_ORIGINS.split(",")]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


@lru_cache()
def get_settings() -> Settings:
    """
    Get cached settings instance.
    Uses lru_cache to ensure settings are loaded only once.
    """
    return Settings()
