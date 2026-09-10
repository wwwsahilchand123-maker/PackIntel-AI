import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)


def _get_barrier_description(score: float, barrier_type: str) -> str:
    if score >= 90:
        return f"excellent {barrier_type} barrier"
    elif score >= 75:
        return f"good {barrier_type} barrier"
    elif score >= 60:
        return f"adequate {barrier_type} barrier"
    elif score >= 40:
        return f"limited {barrier_type} barrier"
    else:
        return f"poor {barrier_type} barrier"


def _sustainability_description(eco_score: float, preference: str) -> str:
    if eco_score >= 80:
        quality = "highly sustainable"
    elif eco_score >= 60:
        quality = "moderately sustainable"
    elif eco_score >= 40:
        quality = "standard"
    else:
        quality = "limited sustainability"

    if preference == "high":
        return f"{quality} (eco-score: {eco_score}/100) — aligns with your high sustainability preference"
    elif preference == "medium":
        return f"{quality} (eco-score: {eco_score}/100) — meets your sustainability preference"
    else:
        return f"{quality} (eco-score: {eco_score}/100)"


def generate_explanation(
    food_commodity: str,
    food_properties: Dict[str, Any],
    top_material: Dict[str, Any],
    score_breakdown: Dict[str, Any],
    rag_results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Generate structured explanation blocks for the top recommendation.
    Works in demo mode without LLM.
    """
    mat = top_material
    sb = score_breakdown
    sustainability_pref = food_properties.get("sustainability_preference", "none")

    explanation_blocks = []

    # Block 1: Primary recommendation rationale
    moisture_desc = _get_barrier_description(sb["moisture_score"], "moisture")
    oxygen_desc = _get_barrier_description(sb["oxygen_score"], "oxygen")
    temp_min = food_properties.get("temperature_min", 20)
    temp_max = food_properties.get("temperature_max", 25)
    shelf_life = food_properties.get("shelf_life_days", 14)

    primary_content = (
        f"{mat['name']} ({mat.get('full_name', mat['name'])}) is recommended for packaging "
        f"{food_commodity} with a compatibility score of {sb['final_score']:.1f}/100. "
        f"It provides {moisture_desc} (MVTR: {mat['moisture_barrier']} g/m²/day) "
        f"and {oxygen_desc} (OTR: {mat['oxygen_barrier']} cc/m²/day), "
        f"which aligns with the moisture sensitivity of {food_properties.get('moisture_sensitivity', 5)}/10 "
        f"and oxygen sensitivity of {food_properties.get('oxygen_sensitivity', 5)}/10 "
        f"required for {food_commodity}."
    )

    explanation_blocks.append({
        "type": "primary",
        "heading": "Why This Material Was Selected",
        "content": primary_content,
        "confidence": round(sb["final_score"] / 100, 2),
    })

    # Block 2: Barrier performance detail
    barrier_content = (
        f"Moisture Barrier Score: {sb['moisture_score']:.1f}/100 — "
        f"The material's MVTR of {mat['moisture_barrier']} g/m²/day "
    )
    moisture_sens = food_properties.get("moisture_sensitivity", 5)
    if moisture_sens >= 8:
        barrier_content += f"meets the strict moisture control requirements for highly moisture-sensitive products. "
    elif moisture_sens >= 5:
        barrier_content += f"is adequate for moderately moisture-sensitive products. "
    else:
        barrier_content += f"exceeds the moisture protection requirements for this product. "

    oxygen_sens = food_properties.get("oxygen_sensitivity", 5)
    barrier_content += (
        f"Oxygen Barrier Score: {sb['oxygen_score']:.1f}/100 — "
        f"The material's OTR of {mat['oxygen_barrier']} cc/m²/day "
    )
    if oxygen_sens >= 8:
        barrier_content += "provides strong protection against oxidation, critical for this product's quality."
    elif oxygen_sens >= 5:
        barrier_content += "offers sufficient oxygen protection for this product."
    else:
        barrier_content += "more than meets the oxygen barrier requirement for this low-sensitivity product."

    explanation_blocks.append({
        "type": "detail",
        "heading": "Barrier Performance Analysis",
        "content": barrier_content,
        "confidence": round((sb["moisture_score"] + sb["oxygen_score"]) / 200, 2),
    })

    # Block 3: Temperature and shelf life
    temp_min_mat = mat.get("temp_min_c", -40)
    temp_max_mat = mat.get("temp_max_c", 200)
    shelf_life_mat = mat.get("shelf_life_days", 365)

    temp_content = (
        f"Temperature Compatibility Score: {sb['temperature_score']:.1f}/100 — "
        f"{mat['name']} operates safely between {temp_min_mat}°C and {temp_max_mat}°C, "
        f"{'fully covering' if temp_min_mat <= temp_min and temp_max_mat >= temp_max else 'partially covering'} "
        f"the required storage range of {temp_min}°C to {temp_max}°C. "
        f"Shelf Life Score: {sb['shelf_life_score']:.1f}/100 — "
        f"This material can support up to {shelf_life_mat} days of product preservation, "
        f"{'comfortably exceeding' if shelf_life_mat >= shelf_life * 1.5 else 'meeting' if shelf_life_mat >= shelf_life else 'partially meeting'} "
        f"the required {shelf_life} days."
    )

    if sb["penalties_applied"]:
        temp_content += f" Note: {'; '.join(sb['penalties_applied'][:2])}"

    explanation_blocks.append({
        "type": "detail",
        "heading": "Temperature & Shelf Life Compatibility",
        "content": temp_content,
        "confidence": round((sb["temperature_score"] + sb["shelf_life_score"]) / 200, 2),
    })

    # Block 4: Sustainability
    eco_score = mat.get("eco_score", 50)
    recyclable = mat.get("recyclable", False)
    compostable = mat.get("compostable", False)
    sustainability_desc = _sustainability_description(eco_score, sustainability_pref)

    eco_content = (
        f"Sustainability Score: {sb['sustainability_score']:.1f}/100 — "
        f"{mat['name']} is {sustainability_desc}. "
    )
    if recyclable:
        eco_content += "This material is recyclable in standard collection streams. "
    if compostable:
        eco_content += "It is also compostable, providing end-of-life biodegradability. "
    if not recyclable and not compostable:
        eco_content += (
            "Note: This material has limited end-of-life recyclability. "
            "Consider sustainability trade-offs against performance benefits. "
        )

    sus_block_type = "caveat" if sustainability_pref == "high" and eco_score < 50 else "detail"
    explanation_blocks.append({
        "type": sus_block_type,
        "heading": "Sustainability Assessment",
        "content": eco_content,
        "confidence": round(sb["sustainability_score"] / 100, 2),
    })

    # Block 5: Regulatory (if material has regulatory info)
    regulatory = mat.get("regulatory", "")
    if regulatory:
        explanation_blocks.append({
            "type": "regulation",
            "heading": "Regulatory Compliance",
            "content": regulatory,
            "confidence": 0.95,
        })

    # Block 6: Penalties / caveats
    if sb["penalties_applied"]:
        caveat_content = "The following limitations were identified: " + " | ".join(
            sb["penalties_applied"]
        )
        explanation_blocks.append({
            "type": "caveat",
            "heading": "Important Caveats",
            "content": caveat_content,
            "confidence": 0.9,
        })

    return explanation_blocks


def build_evidence_chunks(
    rag_results: List[Dict[str, Any]],
    top_material_id: str,
    max_evidence: int = 5,
) -> List[Dict[str, Any]]:
    """
    Extract supporting evidence chunks from RAG results.
    Prioritizes chunks related to the top material.
    """
    evidence = []
    seen_ids = set()

    # First: chunks about the top material
    for r in rag_results:
        if r.get("material_id") == top_material_id and len(evidence) < max_evidence:
            doc_id = r.get("doc_id", "")
            if doc_id in seen_ids:
                continue
            seen_ids.add(doc_id)
            evidence.append({
                "chunk_id": doc_id,
                "source": r.get("source", "Knowledge Base"),
                "content": r.get("content", "")[:500],
                "relevance_score": round(r.get("rrf_score", r.get("score", 0.0)), 4),
                "material_referenced": r.get("material_name", top_material_id),
            })

    # Then: other relevant chunks
    for r in rag_results:
        if len(evidence) >= max_evidence:
            break
        doc_id = r.get("doc_id", "")
        if doc_id in seen_ids:
            continue
        seen_ids.add(doc_id)
        content = r.get("content", "")
        if len(content) < 20:
            continue
        evidence.append({
            "chunk_id": doc_id,
            "source": r.get("source", "Knowledge Base"),
            "content": content[:500],
            "relevance_score": round(r.get("rrf_score", r.get("score", 0.0)), 4),
            "material_referenced": r.get("material_name"),
        })

    return evidence
