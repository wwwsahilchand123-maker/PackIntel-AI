from fastapi import APIRouter
from app.core.config import settings

router = APIRouter(tags=["health"])


@router.get("/health")
async def health_check():
    return {
        "status": "ok",
        "version": settings.APP_VERSION,
        "demo_mode": settings.DEMO_MODE,
        "environment": settings.APP_ENV,
    }


@router.get("/api/v1/health/detailed")
async def health_detailed():
    return {
        "status": "ok",
        "services": {
            "database": "connected",
            "qdrant": "skipped" if settings.DEMO_MODE else "pending",
            "embedder": "skipped" if settings.DEMO_MODE else "pending",
            "llm": "not_configured" if not settings.OPENAI_API_KEY else "configured",
        },
        "demo_mode": settings.DEMO_MODE,
        "version": settings.APP_VERSION,
    }
