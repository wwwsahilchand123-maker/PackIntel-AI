import hashlib
import logging
import uuid
from typing import Optional

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.session import AppSession

logger = logging.getLogger(__name__)


def _hash_ip(ip: str) -> str:
    return hashlib.sha256(ip.encode()).hexdigest()[:64]


async def get_or_create_session(
    db: AsyncSession,
    ip: Optional[str] = None,
    mode: str = "demo",
) -> AppSession:
    """
    Create a new session for every request.
    Sessions are lightweight — one per recommendation call.
    """
    session = AppSession(
        id=str(uuid.uuid4()),
        ip_hash=_hash_ip(ip) if ip else None,
        mode=mode,
        total_queries=0,
    )
    db.add(session)
    await db.flush()
    logger.debug(f"Created session: {session.id}")
    return session


async def increment_session_queries(
    db: AsyncSession,
    session_id: str,
) -> None:
    await db.execute(
        update(AppSession)
        .where(AppSession.id == session_id)
        .values(total_queries=AppSession.total_queries + 1)
    )
