import uuid
from datetime import datetime
from sqlalchemy import String, Float, Integer, DateTime, Text, Boolean, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Material(Base):
    __tablename__ = "materials"

    id: Mapped[str] = mapped_column(
        String(36), primary_key=True, default=lambda: str(uuid.uuid4())
    )
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    abbreviation: Mapped[str] = mapped_column(String(20), nullable=True)
    category: Mapped[str] = mapped_column(
        SAEnum("plastic", "glass", "metal", "bio", "paper", "composite", name="material_category"),
        nullable=False,
    )
    moisture_barrier: Mapped[float] = mapped_column(Float, nullable=False)
    oxygen_barrier: Mapped[float] = mapped_column(Float, nullable=False)
    temp_min_c: Mapped[float] = mapped_column(Float, nullable=False)
    temp_max_c: Mapped[float] = mapped_column(Float, nullable=False)
    shelf_life_days: Mapped[int] = mapped_column(Integer, nullable=False)
    eco_score: Mapped[float] = mapped_column(Float, nullable=False)
    recyclable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    compostable: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    food_safe: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    cost_tier: Mapped[str] = mapped_column(
        SAEnum("low", "medium", "high", "premium", name="cost_tier"), nullable=False
    )
    description: Mapped[str] = mapped_column(Text, nullable=True)
    properties_json: Mapped[str] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
