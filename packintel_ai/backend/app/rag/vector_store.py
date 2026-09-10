import logging
from typing import List, Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

MATERIALS_COLLECTION = "packintel_materials"
DOCUMENTS_COLLECTION = "packintel_documents"
FOOD_PROFILES_COLLECTION = "packintel_food_profiles"

VECTOR_SIZE = 384


class VectorStore:
    """Qdrant vector store wrapper with graceful demo mode fallback."""

    def __init__(self):
        self.client = None
        self.available = False
        self._connect()

    def _connect(self):
        if settings.DEMO_MODE:
            logger.info("Demo mode: Qdrant connection skipped.")
            return
        try:
            from qdrant_client import QdrantClient
            from qdrant_client.http.exceptions import UnexpectedResponse
            self.client = QdrantClient(
                host=settings.QDRANT_HOST,
                port=settings.QDRANT_PORT,
                api_key=settings.QDRANT_API_KEY or None,
                timeout=5,
            )
            self.client.get_collections()
            self.available = True
            logger.info("Qdrant connected successfully.")
        except Exception as e:
            logger.warning(f"Qdrant unavailable: {e}. Falling back to demo mode.")
            self.client = None
            self.available = False

    def create_collection_if_not_exists(self, collection_name: str):
        if not self.available:
            return
        try:
            from qdrant_client.models import Distance, VectorParams
            existing = [c.name for c in self.client.get_collections().collections]
            if collection_name not in existing:
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=VECTOR_SIZE, distance=Distance.COSINE),
                )
                logger.info(f"Created Qdrant collection: {collection_name}")
        except Exception as e:
            logger.error(f"Failed to create collection {collection_name}: {e}")

    def upsert_points(
        self,
        collection_name: str,
        points: List[Dict[str, Any]],
    ):
        if not self.available:
            return
        try:
            from qdrant_client.models import PointStruct
            qdrant_points = [
                PointStruct(
                    id=p["id"],
                    vector=p["vector"],
                    payload=p.get("payload", {}),
                )
                for p in points
            ]
            self.client.upsert(collection_name=collection_name, points=qdrant_points)
            logger.info(f"Upserted {len(qdrant_points)} points into {collection_name}")
        except Exception as e:
            logger.error(f"Failed to upsert points: {e}")

    def search(
        self,
        collection_name: str,
        query_vector: List[float],
        top_k: int = 10,
        filters: Optional[Dict] = None,
    ) -> List[Dict[str, Any]]:
        if not self.available:
            return []
        try:
            from qdrant_client.models import Filter, FieldCondition, MatchValue
            qdrant_filter = None
            if filters:
                conditions = [
                    FieldCondition(key=k, match=MatchValue(value=v))
                    for k, v in filters.items()
                ]
                qdrant_filter = Filter(must=conditions)

            results = self.client.search(
                collection_name=collection_name,
                query_vector=query_vector,
                limit=top_k,
                query_filter=qdrant_filter,
                with_payload=True,
            )
            return [
                {
                    "id": r.id,
                    "score": r.score,
                    "payload": r.payload or {},
                }
                for r in results
            ]
        except Exception as e:
            logger.error(f"Qdrant search failed: {e}")
            return []

    def delete_points(self, collection_name: str, ids: List[str]):
        if not self.available:
            return
        try:
            from qdrant_client.models import PointIdsList
            self.client.delete(
                collection_name=collection_name,
                points_selector=PointIdsList(points=ids),
            )
        except Exception as e:
            logger.error(f"Failed to delete points: {e}")

    def get_collection_info(self, collection_name: str) -> Optional[Dict]:
        if not self.available:
            return None
        try:
            info = self.client.get_collection(collection_name)
            return {
                "name": collection_name,
                "points_count": info.points_count,
                "status": str(info.status),
            }
        except Exception:
            return None


_vector_store: Optional[VectorStore] = None


def get_vector_store() -> VectorStore:
    global _vector_store
    if _vector_store is None:
        _vector_store = VectorStore()
    return _vector_store
