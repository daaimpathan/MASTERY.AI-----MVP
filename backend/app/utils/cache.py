"""
Redis cache utilities for caching frequently accessed data.
"""

import redis
import json
from typing import Optional, Any
from app.config import get_settings

settings = get_settings()

# Redis client
redis_client = redis.from_url(
    settings.REDIS_URL,
    decode_responses=True,
    encoding="utf-8"
)


def get_cache(key: str) -> Optional[Any]:
    """
    Get a value from cache.
    
    Args:
        key: Cache key
        
    Returns:
        Cached value or None if not found
    """
    try:
        value = redis_client.get(key)
        if value:
            return json.loads(value)
        return None
    except Exception as e:
        print(f"Cache get error: {e}")
        return None


def set_cache(key: str, value: Any, ttl: Optional[int] = None) -> bool:
    """
    Set a value in cache.
    
    Args:
        key: Cache key
        value: Value to cache (must be JSON serializable)
        ttl: Time to live in seconds (optional)
        
    Returns:
        True if successful, False otherwise
    """
    try:
        serialized = json.dumps(value)
        if ttl:
            redis_client.setex(key, ttl, serialized)
        else:
            redis_client.set(key, serialized)
        return True
    except Exception as e:
        print(f"Cache set error: {e}")
        return False


def delete_cache(key: str) -> bool:
    """
    Delete a value from cache.
    
    Args:
        key: Cache key
        
    Returns:
        True if successful, False otherwise
    """
    try:
        redis_client.delete(key)
        return True
    except Exception as e:
        print(f"Cache delete error: {e}")
        return False


def delete_pattern(pattern: str) -> bool:
    """
    Delete all keys matching a pattern.
    
    Args:
        pattern: Key pattern (e.g., "engagement:*")
        
    Returns:
        True if successful, False otherwise
    """
    try:
        keys = redis_client.keys(pattern)
        if keys:
            redis_client.delete(*keys)
        return True
    except Exception as e:
        print(f"Cache delete pattern error: {e}")
        return False


def cache_engagement_index(student_id: str, class_id: str, data: dict) -> bool:
    """
    Cache engagement index data.
    
    Args:
        student_id: Student UUID
        class_id: Class UUID
        data: Engagement index data
        
    Returns:
        True if successful
    """
    key = f"engagement:{student_id}:{class_id}"
    return set_cache(key, data, ttl=settings.ENGAGEMENT_CACHE_TTL_SECONDS)


def get_cached_engagement_index(student_id: str, class_id: str) -> Optional[dict]:
    """
    Get cached engagement index data.
    
    Args:
        student_id: Student UUID
        class_id: Class UUID
        
    Returns:
        Cached engagement data or None
    """
    key = f"engagement:{student_id}:{class_id}"
    return get_cache(key)


def invalidate_engagement_cache(student_id: str, class_id: Optional[str] = None) -> bool:
    """
    Invalidate engagement cache for a student.
    
    Args:
        student_id: Student UUID
        class_id: Optional class UUID (if None, invalidates all classes)
        
    Returns:
        True if successful
    """
    if class_id:
        key = f"engagement:{student_id}:{class_id}"
        return delete_cache(key)
    else:
        pattern = f"engagement:{student_id}:*"
        return delete_pattern(pattern)
