from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db  # re-export for convenience
from app.core.config import settings


async def get_database() -> AsyncGenerator[AsyncSession, None]:
    async for session in get_db():
        yield session


def get_settings():
    return settings
