import uuid
from datetime import datetime
from sqlalchemy import String, Integer, DateTime, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class AppSession(Base):
    __tablename__ = "sessions"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    ip_hash: Mapped[str] = mapped_column(String(64), nullable=True)
    mode: Mapped[str] = mapped_column(
        SAEnum("demo", "full", name="session_mode"), default="demo", nullable=False
    )
    total_queries: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    query_logs: Mapped[list["QueryLog"]] = relationship(  # noqa: F821
        "QueryLog", back_populates="session", cascade="all, delete-orphan"
    )
    documents: Mapped[list["Document"]] = relationship(  # noqa: F821
        "Document", back_populates="session", cascade="all, delete-orphan"
    )
