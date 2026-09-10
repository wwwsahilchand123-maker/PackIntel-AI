import json
import logging
import uuid
from pathlib import Path
from typing import List

from fastapi import APIRouter, HTTPException
from app.schemas.compare import CompareRequest, CompareResponse

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent.parent / "knowledge_base"

router = APIRouter(prefix="/api/v1/compare", tags=["compare"])


def _load_materials() -> List[dict]:
    path = KB_DIR / "materials_data.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["materials"]


def _normalize(value: float, min_val: float, max_val: float) -> float:
    """Normalize a value to 0-100 range."""
    if max_val == min_val:
        return 50.0
    return round(((value - min_val) / (max_val - min_val)) * 100, 2)


PROPERTY_DEFINITIONS = {
    "moisture_barrier": {
        "label": "Moisture Barrier",
        "higher_is_better": False,
        "unit": "g/m²/day (lower=better)",
    },
    "oxygen_barrier": {
        "label": "Oxygen Barrier",
        "higher_is_better": False,
        "unit": "cc/m²/day (lower=better)",
    },
    "shelf_life_days": {
        "label": "Shelf Life Capacity",
        "higher_is_better": True,
        "unit": "days",
    },
    "eco_score": {
        "label": "Eco / Sustainability Score",
        "higher_is_better": True,
        "unit": "/100",
    },
    "temp_max_c": {
        "label": "Max Temperature",
        "higher_is_better": True,
        "unit": "°C",
    },
    "temp_min_c": {
        "label": "Min Temperature",
        "higher_is_better": False,
        "unit": "°C (lower=better)",
    },
}


@router.post("")
async def compare_materials(payload: CompareRequest):
    """
    Compare 2-5 packaging materials side by side.
    Returns property matrix, radar data, and winner per property.
    """
    all_materials = _load_materials()
    mat_map = {m["id"]: m for m in all_materials}

    # Resolve requested materials
    selected = []
    for mid in payload.material_ids:
        mat = mat_map.get(mid.lower())
        if not mat:
            # Try by name
            mat = next(
                (m for m in all_materials if m["name"].lower() == mid.lower()),
                None,
            )
        if not mat:
            raise HTTPException(
                status_code=404,
                detail=f"Material '{mid}' not found.",
            )
        selected.append(mat)

    if len(selected) < 2:
        raise HTTPException(
            status_code=422,
            detail="At least 2 valid materials are required for comparison.",
        )

    # Build property matrix
    properties = list(PROPERTY_DEFINITIONS.keys())
    comparison_data: dict = {}
    winner_by_property: dict = {}

    for prop, prop_def in PROPERTY_DEFINITIONS.items():
        values = {m["name"]: m.get(prop, 0) for m in selected}
        comparison_data[prop] = values
        comparison_data[prop_def["label"]] = values

        # Find winner
        if prop_def["higher_is_better"]:
            winner = max(values, key=lambda k: values[k])
        else:
            winner = min(values, key=lambda k: values[k])
        winner_by_property[prop_def["label"]] = winner

    # Build radar data (normalize to 0-100 for chart)
    radar_data = []
    for prop, prop_def in PROPERTY_DEFINITIONS.items():
        raw_values = {m["name"]: m.get(prop, 0) for m in selected}
        all_vals = list(raw_values.values())
        min_v, max_v = min(all_vals), max(all_vals)

        normalized = {}
        for mat_name, val in raw_values.items():
            norm = _normalize(val, min_v, max_v)
            # For "lower is better" properties, invert so higher = better on radar
            if not prop_def["higher_is_better"]:
                norm = 100.0 - norm
            normalized[mat_name] = norm

        radar_data.append({
            "property": prop_def["label"],
            "values": normalized,
            "raw_values": raw_values,
            "unit": prop_def["unit"],
        })

    # Overall score for comparison context
    def _overall_score(mat: dict) -> float:
        scores = []
        # Moisture (lower is better → invert)
        m_max = 500.0
        scores.append(max(0, (1 - mat["moisture_barrier"] / m_max) * 100))
        # Oxygen (lower is better → invert)
        o_max = 500.0
        scores.append(max(0, (1 - mat["oxygen_barrier"] / o_max) * 100))
        # Shelf life
        scores.append(min(100, mat["shelf_life_days"] / 18.25))
        # Eco
        scores.append(mat["eco_score"])
        return round(sum(scores) / len(scores), 2)

    overall_ranking = sorted(
        [
            {
                "rank": 0,
                "material_name": m["name"],
                "overall_score": _overall_score(m),
            }
            for m in selected
        ],
        key=lambda x: x["overall_score"],
        reverse=True,
    )
    for i, r in enumerate(overall_ranking):
        r["rank"] = i + 1

    return {
        "comparison_id": str(uuid.uuid4()),
        "materials": [
            {
                "id": m["id"],
                "name": m["name"],
                "abbreviation": m.get("abbreviation", m["name"]),
                "category": m["category"],
                "moisture_barrier": m["moisture_barrier"],
                "oxygen_barrier": m["oxygen_barrier"],
                "temp_min_c": m["temp_min_c"],
                "temp_max_c": m["temp_max_c"],
                "shelf_life_days": m["shelf_life_days"],
                "eco_score": m["eco_score"],
                "recyclable": m["recyclable"],
                "compostable": m["compostable"],
                "food_safe": m["food_safe"],
                "cost_tier": m["cost_tier"],
                "description": m.get("description", ""),
                "key_properties": m.get("key_properties", []),
            }
            for m in selected
        ],
        "comparison_matrix": {
            "properties": [PROPERTY_DEFINITIONS[p]["label"] for p in properties],
            "data": comparison_data,
        },
        "radar_data": radar_data,
        "winner_by_property": winner_by_property,
        "overall_ranking": overall_ranking,
    }
