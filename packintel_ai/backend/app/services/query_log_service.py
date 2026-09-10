import json
import logging
import uuid
from typing import Optional, Dict, Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.models.query_log import QueryLog

logger = logging.getLogger(__name__)


async def save_query_log(
    db: AsyncSession,
    session_id: str,
    food_commodity: str,
    food_properties: Dict[str, Any],
    response: Dict[str, Any],
    rag_mode: str = "demo",
    processing_ms: int = 0,
) -> QueryLog:
    """Persist a query and its result to SQLite."""
    recommendation = response.get("recommendation", {})
    material = recommendation.get("material", {})

    log = QueryLog(
        id=response.get("query_id") or str(uuid.uuid4()),
        session_id=session_id,
        food_commodity=food_commodity,
        food_category=food_properties.get("food_category"),
        moisture_sensitivity=food_properties.get("moisture_sensitivity", 5.0),
        oxygen_sensitivity=food_properties.get("oxygen_sensitivity", 5.0),
        temperature_min=food_properties.get("temperature_min", 20.0),
        temperature_max=food_properties.get("temperature_max", 25.0),
        humidity_min=food_properties.get("humidity_min"),
        humidity_max=food_properties.get("humidity_max"),
        shelf_life_days=food_properties.get("shelf_life_days", 14),
        sustainability_preference=food_properties.get(
            "sustainability_preference", "none"
        ),
        special_requirements=food_properties.get("special_requirements"),
        top_material=material.get("name"),
        top_score=recommendation.get("compatibility_score"),
        response_json=json.dumps(response),
        rag_mode=rag_mode,
        processing_ms=processing_ms,
    )
    db.add(log)
    await db.commit()
    logger.debug(f"Saved query log: {log.id} → top: {log.top_material}")
    return log


async def get_query_log(
    db: AsyncSession,
    query_id: str,
) -> Optional[QueryLog]:
    from sqlalchemy import select

    result = await db.execute(
        select(QueryLog).where(QueryLog.id == query_id)
    )
    return result.scalar_one_or_none()
