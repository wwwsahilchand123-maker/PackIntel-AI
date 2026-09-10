import logging
import time
import uuid
from typing import Dict, Any, Optional

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.services.session_service import get_or_create_session, increment_session_queries
from app.services.query_log_service import save_query_log
from app.services.demo_service import build_demo_response
from app.rag.pipeline import get_rag_pipeline

logger = logging.getLogger(__name__)


async def process_recommendation(
    db: AsyncSession,
    food_commodity: str,
    food_properties: Dict[str, Any],
    request_ip: Optional[str] = None,
    force_demo: bool = False,
) -> Dict[str, Any]:
    """
    Main recommendation service.
    Orchestrates session, RAG pipeline, scoring, and logging.
    """
    start = time.time()

    # Determine mode
    use_demo = force_demo or settings.DEMO_MODE
    mode = "demo" if use_demo else "hybrid"

    # Create session
    session = await get_or_create_session(db, ip=request_ip, mode=mode)
    query_id = str(uuid.uuid4())

    try:
        if use_demo:
            response = build_demo_response(
                food_commodity=food_commodity,
                food_properties=food_properties,
                session_id=session.id,
                query_id=query_id,
            )
        else:
            pipeline = get_rag_pipeline()
            response = pipeline.run(
                food_commodity=food_commodity,
                food_properties=food_properties,
                session_id=session.id,
                query_id=query_id,
            )

        processing_ms = int((time.time() - start) * 1000)
        response["processing_time_ms"] = processing_ms
        response["session_id"] = session.id
        response["query_id"] = query_id

        # Log to database
        await save_query_log(
            db=db,
            session_id=session.id,
            food_commodity=food_commodity,
            food_properties=food_properties,
            response=response,
            rag_mode=mode,
            processing_ms=processing_ms,
        )

        # Increment session query count
        await increment_session_queries(db, session.id)

        return response

    except Exception as e:
        logger.error(f"Recommendation failed: {e}", exc_info=True)
        raise
