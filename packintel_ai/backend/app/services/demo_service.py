"""
Demo service: returns realistic pre-computed responses
without requiring Qdrant or any external API.
All results are derived from the real scoring engine.
"""
import logging
import time
import uuid

from app.rag.pipeline import get_rag_pipeline

logger = logging.getLogger(__name__)


def build_demo_response(
    food_commodity: str,
    food_properties: dict,
    session_id: str,
    query_id: str,
) -> dict:
    """
    Run the real scoring engine in demo mode.
    The pipeline already handles Qdrant unavailability gracefully —
    it falls back to BM25-only retrieval which always works.
    """
    start = time.time()

    pipeline = get_rag_pipeline()
    result = pipeline.run(
        food_commodity=food_commodity,
        food_properties=food_properties,
        session_id=session_id,
        query_id=query_id,
    )

    elapsed = int((time.time() - start) * 1000)
    result["processing_time_ms"] = elapsed
    result["mode"] = "demo"

    logger.info(
        f"Demo response built in {elapsed}ms. "
        f"Top: {result['recommendation']['material']['name']} "
        f"({result['recommendation']['compatibility_score']})"
    )
    return result
