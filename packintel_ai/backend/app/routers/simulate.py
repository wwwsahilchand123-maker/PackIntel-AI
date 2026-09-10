import logging
import time
import uuid

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.config import settings
from app.schemas.recommendation import RecommendRequest
from app.rag.pipeline import get_rag_pipeline

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/v1/simulate", tags=["simulator"])


@router.post("")
async def simulate(
    payload: RecommendRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """
    Run a simulation with given conditions.
    Returns ranked materials without saving to DB.
    """
    start = time.time()

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
        pipeline = get_rag_pipeline()
        result = pipeline.run(
            food_commodity=payload.food_commodity,
            food_properties=food_properties,
            session_id=str(uuid.uuid4()),
            query_id=str(uuid.uuid4()),
        )
        result["simulation_id"] = str(uuid.uuid4())
        result["processing_time_ms"] = int((time.time() - start) * 1000)
        return result

    except Exception as e:
        logger.error(f"Simulation error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Simulation failed.")


@router.post("/compare")
async def simulate_compare(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Compare before/after simulation results."""
    body = await request.json()
    before_props = body.get("before")
    after_props = body.get("after")

    if not before_props or not after_props:
        raise HTTPException(
            status_code=422,
            detail="Both 'before' and 'after' properties are required.",
        )

    pipeline = get_rag_pipeline()

    try:
        before_result = pipeline.run(
            food_commodity=before_props.get("food_commodity", "Food Product"),
            food_properties=before_props,
            session_id=str(uuid.uuid4()),
            query_id=str(uuid.uuid4()),
        )
        after_result = pipeline.run(
            food_commodity=after_props.get("food_commodity", "Food Product"),
            food_properties=after_props,
            session_id=str(uuid.uuid4()),
            query_id=str(uuid.uuid4()),
        )

        before_top = before_result["recommendation"]["material"]["name"]
        after_top = after_result["recommendation"]["material"]["name"]
        score_change = (
            after_result["recommendation"]["compatibility_score"]
            - before_result["recommendation"]["compatibility_score"]
        )
        changed = before_top != after_top

        summary = (
            f"Changing conditions shifted the top recommendation "
            f"from {before_top} to {after_top} "
            f"({'improved' if score_change > 0 else 'reduced'} score by {abs(score_change):.1f} points)."
            if changed
            else f"The top recommendation remains {before_top} "
            f"(score {'increased' if score_change > 0 else 'decreased'} by {abs(score_change):.1f} points)."
        )

        return {
            "before_results": before_result,
            "after_results": after_result,
            "changes_summary": {
                "previous_top_material": before_top,
                "new_top_material": after_top,
                "score_change": round(score_change, 2),
                "changed": changed,
                "summary": summary,
            },
        }

    except Exception as e:
        logger.error(f"Simulate compare error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail="Simulation comparison failed.")
