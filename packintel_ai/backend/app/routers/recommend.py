import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.schemas.recommendation import RecommendRequest, RecommendResponse
from app.services.recommendation_service import process_recommendation
from app.services.query_log_service import get_query_log

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/recommend", tags=["recommendation"])


def _get_client_ip(request: Request) -> Optional[str]:
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else None


@router.post("", response_model=RecommendResponse)
async def create_recommendation(
    payload: RecommendRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Run the full AI packaging material recommendation pipeline.

    Accepts food properties, runs Hybrid RAG + scoring engine,
    and returns ranked materials with explanations.
    """
    # Resolve demo mode: request can override env setting only toward demo
    force_demo = payload.demo_mode if payload.demo_mode is not None else settings.DEMO_MODE

    food_properties = {
        "food_category": payload.food_category.value if payload.food_category else None,
        "moisture_sensitivity": payload.moisture_sensitivity,
        "oxygen_sensitivity": payload.oxygen_sensitivity,
        "temperature_min": payload.temperature_min,
        "temperature_max": payload.temperature_max,
        "humidity_min": payload.humidity_min,
        "humidity_max": payload.humidity_max,
        "shelf_life_days": payload.shelf_life_days,
        "sustainability_preference": payload.sustainability_preference.value,
        "special_requirements": payload.special_requirements,
    }

    try:
        result = await process_recommendation(
            db=db,
            food_commodity=payload.food_commodity,
            food_properties=food_properties,
            request_ip=_get_client_ip(request),
            force_demo=force_demo,
        )
        return result

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        logger.error(f"Recommendation endpoint error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail="Recommendation processing failed. Please try again.",
        )


@router.get("/{query_id}")
async def get_recommendation(
    query_id: str,
    db: AsyncSession = Depends(get_db),
):
    """Retrieve a previously saved recommendation by query ID."""
    import json

    log = await get_query_log(db, query_id)
    if not log:
        raise HTTPException(
            status_code=404,
            detail=f"Recommendation '{query_id}' not found.",
        )

    if log.response_json:
        return json.loads(log.response_json)

    raise HTTPException(status_code=404, detail="Response data not available.")
