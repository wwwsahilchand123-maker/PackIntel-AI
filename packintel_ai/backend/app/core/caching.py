import asyncio
import logging
from functools import wraps
from typing import Any, Callable, Dict, Optional
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

class SimpleCache:
    """In-memory cache with TTL support."""

    def __init__(self, ttl_seconds: int = 3600):
        self.cache: Dict[str, tuple[Any, datetime]] = {}
        self.ttl_seconds = ttl_seconds

    def get(self, key: str) -> Optional[Any]:
        if key not in self.cache:
            return None
        value, expires_at = self.cache[key]
        if datetime.utcnow() > expires_at:
            del self.cache[key]
            return None
        return value

    def set(self, key: str, value: Any) -> None:
        expires_at = datetime.utcnow() + timedelta(seconds=self.ttl_seconds)
        self.cache[key] = (value, expires_at)

    def clear(self) -> None:
        self.cache.clear()


# Global caches
materials_cache = SimpleCache(ttl_seconds=3600)  # 1 hour
food_profiles_cache = SimpleCache(ttl_seconds=3600)


def cached(cache: SimpleCache, ttl: int = 3600):
    """Decorator for caching function results."""
    def decorator(func: Callable) -> Callable:
        @wraps(func)
        async def wrapper(*args, **kwargs) -> Any:
            # Create cache key from function name and arguments
            cache_key = f"{func.__name__}:{str(args)}:{str(kwargs)}"

            # Try to get from cache
            cached_result = cache.get(cache_key)
            if cached_result is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_result

            # Execute function
            result = await func(*args, **kwargs)

            # Store in cache
            cache.set(cache_key, result)
            logger.debug(f"Cache miss, stored: {cache_key}")

            return result
        return wrapper
    return decorator
