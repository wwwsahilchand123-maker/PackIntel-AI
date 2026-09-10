import json
import logging
from pathlib import Path
from typing import List, Dict, Any, Tuple

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent.parent / "knowledge_base"

# Scoring weights (must sum to 1.0)
WEIGHTS = {
    "moisture": 0.20,
    "oxygen": 0.20,
    "temperature": 0.15,
    "shelf_life": 0.20,
    "sustainability": 0.15,
    "rag_relevance": 0.10,
}

# Sustainability preference multipliers
SUSTAINABILITY_MULTIPLIERS = {
    "none": 0.5,
    "low": 0.75,
    "medium": 1.0,
    "high": 1.5,
}

SCORE_LABELS = [
    (90, "Excellent Match"),
    (75, "Good Match"),
    (60, "Acceptable"),
    (40, "Suboptimal"),
    (0, "Not Recommended"),
]


def get_score_label(score: float) -> str:
    for threshold, label in SCORE_LABELS:
        if score >= threshold:
            return label
    return "Not Recommended"


def _load_materials() -> List[Dict[str, Any]]:
    path = KB_DIR / "materials_data.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["materials"]


def _moisture_score(
    material_mvtr: float,
    food_sensitivity: float,
) -> float:
    """
    Score moisture barrier compatibility (0-100).

    MVTR = Moisture Vapour Transmission Rate (g/m²/day)
    Lower MVTR = better barrier.
    Higher food_sensitivity = stricter requirement.
    """
    if food_sensitivity >= 8:
        threshold = 1.0
    elif food_sensitivity >= 5:
        threshold = 5.0
    elif food_sensitivity >= 3:
        threshold = 20.0
    else:
        threshold = 100.0

    if material_mvtr <= 0.0:
        return 100.0  # Absolute barrier (glass, aluminum)

    ratio = material_mvtr / threshold
    score = max(0.0, 100.0 * (1.0 - min(ratio, 1.0)))

    # Bonus for very low MVTR relative to threshold
    if material_mvtr <= threshold * 0.1:
        score = min(100.0, score + 10.0)

    return round(score, 2)


def _oxygen_score(
    material_otr: float,
    food_sensitivity: float,
) -> float:
    """
    Score oxygen barrier compatibility (0-100).

    OTR = Oxygen Transmission Rate (cc/m²/day)
    Lower OTR = better barrier.
    """
    if food_sensitivity >= 9:
        threshold = 1.0
    elif food_sensitivity >= 7:
        threshold = 10.0
    elif food_sensitivity >= 5:
        threshold = 50.0
    elif food_sensitivity >= 3:
        threshold = 150.0
    else:
        threshold = 500.0

    if material_otr <= 0.0:
        return 100.0  # Absolute barrier

    ratio = material_otr / threshold
    score = max(0.0, 100.0 * (1.0 - min(ratio, 1.0)))

    if material_otr <= threshold * 0.1:
        score = min(100.0, score + 10.0)

    return round(score, 2)


def _temperature_score(
    mat_temp_min: float,
    mat_temp_max: float,
    required_temp_min: float,
    required_temp_max: float,
) -> Tuple[float, List[str]]:
    """
    Score temperature compatibility (0-100).
    Returns (score, list_of_penalties).
    """
    penalties = []

    # Check if material covers required temperature range
    covers_min = mat_temp_min <= required_temp_min
    covers_max = mat_temp_max >= required_temp_max

    if covers_min and covers_max:
        # Full coverage — score based on how much margin we have
        min_margin = required_temp_min - mat_temp_min
        max_margin = mat_temp_max - required_temp_max
        margin_score = min(100.0, 70.0 + (min_margin + max_margin) / 10.0)
        return round(margin_score, 2), []

    if not covers_min and not covers_max:
        penalties.append(
            f"Material temperature range [{mat_temp_min}°C, {mat_temp_max}°C] "
            f"does not cover required range [{required_temp_min}°C, {required_temp_max}°C]."
        )
        return 10.0, penalties

    if not covers_min:
        gap = mat_temp_min - required_temp_min
        score = max(10.0, 60.0 - gap * 2)
        penalties.append(
            f"Material minimum temperature {mat_temp_min}°C exceeds "
            f"required minimum {required_temp_min}°C by {gap}°C."
        )
        return round(score, 2), penalties

    if not covers_max:
        gap = required_temp_max - mat_temp_max
        score = max(10.0, 60.0 - gap * 2)
        penalties.append(
            f"Material maximum temperature {mat_temp_max}°C is below "
            f"required maximum {required_temp_max}°C by {gap}°C."
        )
        return round(score, 2), penalties

    return 50.0, penalties


def _shelf_life_score(
    material_capacity_days: int,
    required_days: int,
) -> float:
    """
    Score shelf life support (0-100).
    """
    if required_days <= 0:
        return 100.0

    ratio = material_capacity_days / required_days

    if ratio >= 2.0:
        return 100.0
    elif ratio >= 1.5:
        return 95.0
    elif ratio >= 1.2:
        return 90.0
    elif ratio >= 1.0:
        return 75.0 + (ratio - 1.0) * 60.0
    else:
        # Insufficient shelf life capacity — penalize
        return round(ratio * 70.0, 2)


def _sustainability_score(
    material_eco_score: float,
    sustainability_preference: str,
    compostable: bool = False,
) -> float:
    """
    Score sustainability compatibility (0-100).
    """
    multiplier = SUSTAINABILITY_MULTIPLIERS.get(sustainability_preference, 1.0)
    raw = material_eco_score * multiplier
    if sustainability_preference == "high":
        if compostable:
            raw = min(100.0, raw + 15.0)
        elif material_eco_score < 50:
            raw = material_eco_score * 0.75
    return round(min(100.0, raw), 2)


def _rag_relevance_score(
    material_id: str,
    rag_results: List[Dict[str, Any]],
) -> float:
    """
    Score RAG relevance (0-100) based on RRF scores from retrieval.
    """
    if not rag_results:
        return 50.0  # Neutral score when no RAG results

    # Find all results mentioning this material
    material_scores = [
        r.get("rrf_score", r.get("score", 0.0))
        for r in rag_results
        if r.get("material_id") == material_id
    ]

    if not material_scores:
        return 30.0  # Low relevance if not found in retrieval

    max_rrf = max(material_scores)
    global_max = max(
        (r.get("rrf_score", r.get("score", 0.0)) for r in rag_results),
        default=1.0,
    )
    if global_max == 0:
        return 50.0

    normalized = (max_rrf / global_max) * 100.0
    return round(min(100.0, normalized), 2)


def _apply_hard_penalties(
    material: Dict[str, Any],
    food_properties: Dict[str, Any],
    score: float,
    penalties: List[str],
) -> Tuple[float, List[str]]:
    """
    Apply hard penalty rules that cap or zero out the score.
    """
    temp_min = food_properties.get("temperature_min", 20)
    temp_max = food_properties.get("temperature_max", 25)
    mat_temp_min = material.get("temp_min_c", -100)
    mat_temp_max = material.get("temp_max_c", 300)

    # Hard incompatibility: temperature range completely outside
    if temp_max > mat_temp_max + 20 or temp_min < mat_temp_min - 20:
        penalties.append(
            f"HARD INCOMPATIBILITY: Material cannot withstand required temperature range."
        )
        score = min(score, 20.0)

    # LDPE not suitable for products requiring long shelf life (>1 year)
    if (
        material.get("id") == "ldpe"
        and food_properties.get("shelf_life_days", 0) > 365
    ):
        penalties.append("LDPE is not suitable for shelf life requirements exceeding 1 year.")
        score = min(score, 35.0)

    # PLA not suitable for hot products
    if material.get("id") == "pla" and temp_max > 50:
        penalties.append(
            f"PLA cannot withstand temperatures above 55°C. "
            f"Required maximum is {temp_max}°C."
        )
        score = min(score, 25.0)

    # Paperboard not suitable for high moisture without coating note
    moisture_sens = food_properties.get("moisture_sensitivity", 0)
    if material.get("id") == "paperboard" and moisture_sens >= 8:
        penalties.append(
            "Uncoated Paperboard is not recommended for high moisture-sensitive products "
            "(moisture_sensitivity ≥ 8). Barrier coating required."
        )
        score = min(score, 45.0)

    return round(score, 2), penalties


def compute_adaptive_weights(food_properties: Dict[str, Any]) -> Dict[str, float]:
    m_sens = float(food_properties.get("moisture_sensitivity") if food_properties.get("moisture_sensitivity") is not None else 5.0)
    o_sens = float(food_properties.get("oxygen_sensitivity") if food_properties.get("oxygen_sensitivity") is not None else 5.0)
    sust_pref = food_properties.get("sustainability_preference", "medium")

    base = {
        "moisture": max(0.05, 0.20 + (m_sens - 5.0) * 0.02),
        "oxygen": max(0.05, 0.20 + (o_sens - 5.0) * 0.02),
        "temperature": 0.15,
        "shelf_life": 0.20,
        "sustainability": 0.15,
        "rag_relevance": 0.10,
    }

    if sust_pref == "high":
        base["sustainability"] = 0.28
    elif sust_pref == "low":
        base["sustainability"] = 0.10
    elif sust_pref == "none":
        base["sustainability"] = 0.05

    total = sum(base.values())
    return {k: round(v / total, 4) for k, v in base.items()}


def score_all_materials(
    food_properties: Dict[str, Any],
    rag_results: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """
    Score all 10 packaging materials against food properties.
    Returns list of scored materials sorted by final_score descending.
    """
    materials = _load_materials()
    sustainability_pref = food_properties.get("sustainability_preference", "none")
    weights = compute_adaptive_weights(food_properties)

    scored_materials = []

    for mat in materials:
        penalties: List[str] = []

        # Dimension scores
        m_score = _moisture_score(
            mat["moisture_barrier"],
            food_properties.get("moisture_sensitivity", 5),
        )
        o_score = _oxygen_score(
            mat["oxygen_barrier"],
            food_properties.get("oxygen_sensitivity", 5),
        )
        t_score, t_penalties = _temperature_score(
            mat["temp_min_c"],
            mat["temp_max_c"],
            food_properties.get("temperature_min", 20),
            food_properties.get("temperature_max", 25),
        )
        penalties.extend(t_penalties)

        s_score = _shelf_life_score(
            mat["shelf_life_days"],
            food_properties.get("shelf_life_days", 14),
        )
        e_score = _sustainability_score(
            mat["eco_score"],
            sustainability_pref,
            compostable=mat.get("compostable", False),
        )
        r_score = _rag_relevance_score(mat["id"], rag_results)

        # Weighted score
        weighted = (
            m_score * weights["moisture"]
            + o_score * weights["oxygen"]
            + t_score * weights["temperature"]
            + s_score * weights["shelf_life"]
            + e_score * weights["sustainability"]
            + r_score * weights["rag_relevance"]
        )

        # Hard penalty pass
        final_score, penalties = _apply_hard_penalties(
            mat, food_properties, weighted, penalties
        )

        scored_materials.append({
            "material": mat,
            "score_breakdown": {
                "moisture_score": m_score,
                "oxygen_score": o_score,
                "temperature_score": t_score,
                "shelf_life_score": s_score,
                "sustainability_score": e_score,
                "rag_relevance_score": r_score,
                "penalties_applied": penalties,
                "final_score": final_score,
                "weights_used": weights,
            },
            "final_score": final_score,
            "score_label": get_score_label(final_score),
        })

    # Sort descending by final score
    scored_materials.sort(key=lambda x: x["final_score"], reverse=True)

    # Assign ranks
    for i, item in enumerate(scored_materials):
        item["rank"] = i + 1

    return scored_materials
