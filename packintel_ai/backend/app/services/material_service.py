import json
import logging
from pathlib import Path
from typing import List, Optional

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent.parent / "knowledge_base"


def _load_materials_data() -> List[dict]:
    path = KB_DIR / "materials_data.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)["materials"]


def _load_food_profiles_data() -> dict:
    path = KB_DIR / "food_profiles.json"
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def _material_to_schema(mat: dict) -> dict:
    return {
        "id": mat["id"],
        "name": mat["name"],
        "abbreviation": mat["abbreviation"],
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


def get_all_materials(
    category: Optional[str] = None,
    sort_by: str = "name",
    order: str = "asc",
) -> dict:
    materials = _load_materials_data()

    if category:
        materials = [m for m in materials if m["category"] == category]

    valid_sort_fields = {
        "name", "eco_score", "moisture_barrier", "oxygen_barrier",
        "shelf_life_days", "cost_tier",
    }
    if sort_by not in valid_sort_fields:
        sort_by = "name"

    reverse = order.lower() == "desc"
    materials = sorted(materials, key=lambda m: m.get(sort_by, ""), reverse=reverse)

    return {
        "materials": [_material_to_schema(m) for m in materials],
        "total": len(materials),
    }


def get_material_by_id(material_id: str) -> Optional[dict]:
    materials = _load_materials_data()
    for mat in materials:
        if mat["id"] == material_id or mat["name"].lower() == material_id.lower():
            result = _material_to_schema(mat)
            result["applications"] = mat.get("applications", [])
            result["not_suitable_for"] = mat.get("not_suitable_for", [])
            result["regulatory"] = mat.get("regulatory", "")
            result["sustainability_notes"] = mat.get("sustainability_notes", "")
            return result
    return None


def get_food_profiles(search: Optional[str] = None) -> dict:
    data = _load_food_profiles_data()
    profiles = data["food_profiles"]
    categories = data["categories"]

    if search:
        search_lower = search.lower()
        profiles = [
            p for p in profiles
            if search_lower in p["commodity"].lower()
            or search_lower in p["category"].lower()
            or search_lower in p.get("embedding_text", "").lower()
        ]

    return {
        "categories": categories,
        "profiles": profiles,
        "total": len(profiles),
    }


def get_food_profile_by_id(profile_id: str) -> Optional[dict]:
    data = _load_food_profiles_data()
    for profile in data["food_profiles"]:
        if profile["id"] == profile_id:
            return profile
    return None
