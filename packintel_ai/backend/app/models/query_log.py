import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Text, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base


class QueryLog(Base):
    __tablename__ = "query_logs"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    session_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    food_commodity: Mapped[str] = mapped_column(String(255), nullable=False)
    food_category: Mapped[str] = mapped_column(String(100), nullable=True)
    moisture_sensitivity: Mapped[float] = mapped_column(Float, nullable=False)
    oxygen_sensitivity: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_min: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_max: Mapped[float] = mapped_column(Float, nullable=False)
    humidity_min: Mapped[float] = mapped_column(Float, nullable=True)
    humidity_max: Mapped[float] = mapped_column(Float, nullable=True)
    shelf_life_days: Mapped[int] = mapped_column(Integer, nullable=False)
    sustainability_preference: Mapped[str] = mapped_column(
        SAEnum("none", "low", "medium", "high", name="sustainability_pref"),
        default="none",
        nullable=False,
    )
    special_requirements: Mapped[str] = mapped_column(Text, nullable=True)
    top_material: Mapped[str] = mapped_column(String(100), nullable=True)
    top_score: Mapped[float] = mapped_column(Float, nullable=True)
    response_json: Mapped[str] = mapped_column(Text, nullable=True)
    rag_mode: Mapped[str] = mapped_column(
        SAEnum("hybrid", "demo", name="rag_mode"), default="demo", nullable=False
    )
    processing_ms: Mapped[int] = mapped_column(Integer, nullable=True)

    session: Mapped["AppSession"] = relationship("AppSession", back_populates="query_logs")  # noqa: F821
