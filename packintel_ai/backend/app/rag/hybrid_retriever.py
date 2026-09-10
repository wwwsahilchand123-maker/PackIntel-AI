import logging
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

RRF_K = 60  # Standard RRF constant


def reciprocal_rank_fusion(
    result_lists: List[List[Dict[str, Any]]],
    weights: Optional[List[float]] = None,
) -> List[Dict[str, Any]]:
    """
    Combine multiple ranked result lists using Reciprocal Rank Fusion.

    RRF score = sum_over_lists( weight_i / (rank_i + k) )

    Args:
        result_lists: List of ranked result lists. Each result must have 'doc_id'.
        weights: Optional per-list weights (default: equal weights).

    Returns:
        Unified ranked list sorted by RRF score descending.
    """
    if not result_lists:
        return []

    if weights is None:
        weights = [1.0] * len(result_lists)

    if len(weights) != len(result_lists):
        weights = [1.0] * len(result_lists)

    # Map: doc_id -> merged document + RRF score
    fused: Dict[str, Dict[str, Any]] = {}

    for list_idx, result_list in enumerate(result_lists):
        weight = weights[list_idx]
        for rank, doc in enumerate(result_list, start=1):
            doc_id = doc.get("doc_id", "")
            if not doc_id:
                continue

            rrf_contribution = weight / (rank + RRF_K)

            if doc_id not in fused:
                fused[doc_id] = {
                    **doc,
                    "rrf_score": 0.0,
                    "source_ranks": {},
                }

            fused[doc_id]["rrf_score"] += rrf_contribution
            fused[doc_id]["source_ranks"][f"list_{list_idx}"] = rank

    # Sort by RRF score descending
    merged = sorted(fused.values(), key=lambda x: x["rrf_score"], reverse=True)
    return merged


class HybridRetriever:
    """
    Combines vector search (semantic) and BM25 (keyword) using RRF fusion.
    Operates in demo mode when Qdrant is unavailable.
    """

    def __init__(self):
        from app.rag.keyword_retriever import get_bm25_retriever
        from app.rag.vector_store import get_vector_store
        self.bm25 = get_bm25_retriever()
        self.vector_store = get_vector_store()

    def retrieve(
        self,
        query: str,
        food_properties: Optional[Dict[str, Any]] = None,
        top_k: int = 15,
        vector_weight: float = 0.6,
        keyword_weight: float = 0.4,
    ) -> List[Dict[str, Any]]:
        """
        Run hybrid retrieval: vector + BM25, fused via RRF.

        Returns top_k deduplicated, ranked results.
        """
        query_text = self._build_query_text(query, food_properties)

        # BM25 retrieval (always available)
        bm25_results = self.bm25.retrieve(query_text, top_k=20)
        logger.debug(f"BM25 returned {len(bm25_results)} results.")

        # Vector retrieval (Qdrant, if available)
        vector_results = self._vector_search(query_text, top_k=20)
        logger.debug(f"Vector search returned {len(vector_results)} results.")

        # Fuse results
        if vector_results:
            fused = reciprocal_rank_fusion(
                [vector_results, bm25_results],
                weights=[vector_weight, keyword_weight],
            )
        else:
            # Only BM25 available — use directly with normalized scores
            fused = self._normalize_bm25_only(bm25_results)

        # Apply metadata filters
        if food_properties:
            fused = self._apply_metadata_filters(fused, food_properties)

        return fused[:top_k]

    def retrieve_for_material(
        self,
        material_id: str,
        query: str,
        top_k: int = 5,
    ) -> List[Dict[str, Any]]:
        """Retrieve documents specifically for one material."""
        results = self.bm25.retrieve(query, top_k=20, material_filter=material_id)
        return results[:top_k]

    def _build_query_text(
        self,
        food_commodity: str,
        food_properties: Optional[Dict[str, Any]],
    ) -> str:
        """Construct enriched query text from food properties."""
        parts = [food_commodity]

        if not food_properties:
            return food_commodity

        moisture = food_properties.get("moisture_sensitivity", 0)
        oxygen = food_properties.get("oxygen_sensitivity", 0)
        shelf_life = food_properties.get("shelf_life_days", 0)
        temp_min = food_properties.get("temperature_min", 20)
        temp_max = food_properties.get("temperature_max", 25)
        sustainability = food_properties.get("sustainability_preference", "none")

        # Moisture
        if moisture >= 8:
            parts.append("extreme moisture barrier packaging high MVTR protection")
        elif moisture >= 5:
            parts.append("moderate moisture barrier packaging")
        else:
            parts.append("low moisture sensitivity packaging")

        # Oxygen
        if oxygen >= 8:
            parts.append("high oxygen barrier packaging OTR sensitive oxidation prevention")
        elif oxygen >= 5:
            parts.append("moderate oxygen barrier packaging")
        else:
            parts.append("low oxygen sensitivity packaging")

        # Temperature
        if temp_min < -10:
            parts.append("freezer packaging frozen food cold chain low temperature")
        elif temp_max > 100:
            parts.append("high temperature packaging sterilization retort hot fill")
        elif temp_min < 10:
            parts.append("refrigerated cold storage packaging")
        else:
            parts.append("ambient temperature packaging")

        # Shelf life
        if shelf_life >= 365:
            parts.append("long shelf life extended preservation packaging")
        elif shelf_life >= 90:
            parts.append("medium shelf life packaging")
        else:
            parts.append("short shelf life fresh packaging")

        # Sustainability
        if sustainability in ("high", "medium"):
            parts.append("sustainable packaging eco-friendly biodegradable recyclable compostable")

        return " ".join(parts)

    def _vector_search(
        self,
        query_text: str,
        top_k: int = 20,
    ) -> List[Dict[str, Any]]:
        """Perform vector search via Qdrant."""
        if not self.vector_store.available:
            return []

        try:
            from app.rag.embedder import embed_single
            from app.rag.vector_store import MATERIALS_COLLECTION

            query_vector = embed_single(query_text)
            raw_results = self.vector_store.search(
                collection_name=MATERIALS_COLLECTION,
                query_vector=query_vector,
                top_k=top_k,
            )

            results = []
            for r in raw_results:
                payload = r.get("payload", {})
                results.append({
                    "doc_id": payload.get("doc_id", str(r["id"])),
                    "score": r["score"],
                    "content": payload.get("embedding_text", payload.get("description", "")),
                    "source": f"Vector Search: {payload.get('material_name', 'Unknown')}",
                    "source_type": "vector_search",
                    "material_id": payload.get("material_id"),
                    "material_name": payload.get("material_name"),
                    "payload": payload,
                })
            return results

        except Exception as e:
            logger.error(f"Vector search failed: {e}")
            return []

    def _normalize_bm25_only(
        self,
        bm25_results: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        """When only BM25 is available, normalize scores to [0,1] range."""
        if not bm25_results:
            return []

        max_score = max(r["score"] for r in bm25_results) or 1.0
        for r in bm25_results:
            r["rrf_score"] = r["score"] / max_score

        return sorted(bm25_results, key=lambda x: x["rrf_score"], reverse=True)

    def _apply_metadata_filters(
        self,
        results: List[Dict[str, Any]],
        food_properties: Dict[str, Any],
    ) -> List[Dict[str, Any]]:
        """
        Apply hard constraint filters based on food properties.
        Documents that fail hard constraints are penalized, not removed
        (so we still have materials to rank).
        """
        temp_min = food_properties.get("temperature_min", 20)
        temp_max = food_properties.get("temperature_max", 25)
        shelf_life = food_properties.get("shelf_life_days", 14)

        filtered = []
        for doc in results:
            payload = doc.get("payload", {})
            material_id = doc.get("material_id")

            if material_id is None:
                # Food profile documents — include without penalty
                filtered.append(doc)
                continue

            mat_temp_min = payload.get("temp_min_c", -100)
            mat_temp_max = payload.get("temp_max_c", 300)
            mat_shelf = payload.get("shelf_life_days", 0)
            food_safe = payload.get("food_safe", True)

            penalty = 0.0

            # Hard filter: food safety
            if not food_safe:
                continue  # Remove entirely

            # Temperature compatibility
            if temp_min < mat_temp_min:
                penalty += 0.3  # Required temp lower than material can handle
            if temp_max > mat_temp_max:
                penalty += 0.4  # Required temp higher than material can handle

            # Shelf life adequacy
            if mat_shelf < shelf_life * 0.7:
                penalty += 0.2  # Material shelf life significantly below requirement

            doc = dict(doc)
            rrf = doc.get("rrf_score", doc.get("score", 0.0))
            doc["rrf_score"] = max(0.0, rrf * (1.0 - penalty))
            doc["metadata_penalty"] = penalty
            filtered.append(doc)

        return sorted(filtered, key=lambda x: x.get("rrf_score", 0), reverse=True)


_hybrid_retriever: Optional[HybridRetriever] = None


def get_hybrid_retriever() -> HybridRetriever:
    global _hybrid_retriever
    if _hybrid_retriever is None:
        _hybrid_retriever = HybridRetriever()
    return _hybrid_retriever
