import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.core.logging import setup_logging
from app.routers import health, recommend, simulate, materials, compare, knowledge_base

setup_logging()
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("PackIntel AI starting up...")
    await init_db()
    logger.info(f"Mode: {'DEMO' if settings.DEMO_MODE else 'FULL'}")

    # Seed knowledge base into Qdrant
    try:
        from app.knowledge_base.seed_kb import run_seeding
        await run_seeding()
    except Exception as e:
        logger.warning(f"KB seeding skipped: {e}")

    logger.info("PackIntel AI ready.")
    yield
    logger.info("PackIntel AI shutting down...")


app = FastAPI(
    title=settings.APP_TITLE,
    description=settings.APP_DESCRIPTION,
    version=settings.APP_VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router)
app.include_router(recommend.router)
app.include_router(simulate.router)
app.include_router(materials.router)
app.include_router(compare.router)
app.include_router(knowledge_base.router)


@app.get("/")
async def root():
    return {
        "app": settings.APP_TITLE,
        "version": settings.APP_VERSION,
        "docs": "/api/docs",
        "health": "/health",
    }
