import logging
import time
from typing import Dict, Any, List, Optional

from app.rag.hybrid_retriever import get_hybrid_retriever
from app.rag.scorer import score_all_materials
from app.rag.explainer import generate_explanation, build_evidence_chunks

logger = logging.getLogger(__name__)


def _material_to_schema(mat: Dict[str, Any]) -> Dict[str, Any]:
    """Convert raw material dict to API schema format."""
    return {
        "id": mat["id"],
        "name": mat["name"],
        "abbreviation": mat.get("abbreviation", mat["name"]),
        "category": mat["category"],
        "moisture_barrier": mat["moisture_barrier"],
        "oxygen_barrier": mat["oxygen_barrier"],
        "temp_min_c": mat["temp_min_c"],
        "temp_max_c": mat["temp_max_c"],
        "shelf_life_days": mat["shelf_life_days"],
        "eco_score": mat["eco_score"],
        "recyclable": mat["recyclable"],
        "compostable": mat["compostable"],
        "food_safe": mat["food_safe"],
        "cost_tier": mat["cost_tier"],
        "description": mat.get("description"),
        "key_properties": mat.get("key_properties"),
    }


class RAGPipeline:
    """
    Full Hybrid RAG pipeline orchestrator.
    Coordinates retrieval → scoring → explanation → response building.
    """

    def __init__(self):
        self.retriever = get_hybrid_retriever()

    def run(
        self,
        food_commodity: str,
        food_properties: Dict[str, Any],
        session_id: str,
        query_id: str,
    ) -> Dict[str, Any]:
        """
        Execute full RAG pipeline.

        Args:
            food_commodity: Name of the food product.
            food_properties: Dict with all food property values.
            session_id: Current session UUID.
            query_id: Current query UUID.

        Returns:
            Complete recommendation response dict.
        """
        start_time = time.time()
        logger.info(f"RAG pipeline starting for: {food_commodity}")

        # Step 1: Hybrid retrieval
        rag_results = self.retriever.retrieve(
            query=food_commodity,
            food_properties=food_properties,
            top_k=15,
        )
        logger.info(f"Retrieval returned {len(rag_results)} results.")

        # Step 2: Score all materials
        scored = score_all_materials(food_properties, rag_results)
        logger.info(f"Scored {len(scored)} materials. Top: {scored[0]['material']['name']}")

        # Step 3: Build recommendation
        top = scored[0]
        top_material = top["material"]
        top_breakdown = top["score_breakdown"]

        # Step 4: Generate explanation
        explanation = generate_explanation(
            food_commodity=food_commodity,
            food_properties=food_properties,
            top_material=top_material,
            score_breakdown=top_breakdown,
            rag_results=rag_results,
        )

        # Step 5: Build evidence
        evidence = build_evidence_chunks(
            rag_results=rag_results,
            top_material_id=top_material["id"],
            max_evidence=5,
        )

        # Step 6: Build alternatives (ranks 2-5)
        alternatives = []
        for item in scored[1:5]:
            alternatives.append({
                "rank": item["rank"],
                "material": _material_to_schema(item["material"]),
                "compatibility_score": round(item["final_score"], 2),
                "score_label": item["score_label"],
                "score_breakdown": item["score_breakdown"],
            })

        # Step 7: All materials ranked
        all_ranked = []
        for item in scored:
            all_ranked.append({
                "rank": item["rank"],
                "material": _material_to_schema(item["material"]),
                "compatibility_score": round(item["final_score"], 2),
                "score_label": item["score_label"],
                "score_breakdown": item["score_breakdown"],
            })

        elapsed_ms = int((time.time() - start_time) * 1000)
        logger.info(f"RAG pipeline completed in {elapsed_ms}ms.")

        return {
            "session_id": session_id,
            "query_id": query_id,
            "food_commodity": food_commodity,
            "recommendation": {
                "material": _material_to_schema(top_material),
                "compatibility_score": round(top["final_score"], 2),
                "score_label": top["score_label"],
                "score_breakdown": top_breakdown,
                "explanation": explanation,
                "evidence": evidence,
                "confidence": round(top["final_score"] / 100, 2),
            },
            "alternatives": alternatives,
            "all_materials_ranked": all_ranked,
            "processing_time_ms": elapsed_ms,
            "mode": "hybrid" if self.retriever.vector_store.available else "demo",
        }


_pipeline: Optional[RAGPipeline] = None


def get_rag_pipeline() -> RAGPipeline:
    global _pipeline
    if _pipeline is None:
        _pipeline = RAGPipeline()
    return _pipeline
