import json
import logging
import hashlib
from pathlib import Path
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent
MATERIALS_FILE = KB_DIR / "materials_data.json"
FOOD_PROFILES_FILE = KB_DIR / "food_profiles.json"


def _str_to_int_id(s: str) -> int:
    """Convert string ID to stable integer for Qdrant."""
    return int(hashlib.md5(s.encode()).hexdigest()[:8], 16)


def _load_json(path: Path) -> dict:
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def seed_materials(vector_store, force: bool = False) -> int:
    """Seed materials into Qdrant. Returns count of seeded items."""
    from app.rag.vector_store import MATERIALS_COLLECTION
    from app.rag.embedder import embed_texts

    if not vector_store.available:
        logger.info("Qdrant not available — skipping material seeding.")
        return 0

    vector_store.create_collection_if_not_exists(MATERIALS_COLLECTION)

    data = _load_json(MATERIALS_FILE)
    materials = data["materials"]

    points = []
    texts_to_embed = []
    material_ids = []

    for mat in materials:
        doc_id = f"material_{mat['id']}"
        embedding_text = mat.get("embedding_text", mat["description"])
        texts_to_embed.append(embedding_text)
        material_ids.append(doc_id)

    logger.info(f"Embedding {len(texts_to_embed)} material documents...")
    vectors = embed_texts(texts_to_embed)

    for i, mat in enumerate(materials):
        doc_id = material_ids[i]
        points.append({
            "id": _str_to_int_id(doc_id),
            "vector": vectors[i],
            "payload": {
                "doc_id": doc_id,
                "material_id": mat["id"],
                "material_name": mat["name"],
                "full_name": mat["full_name"],
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
                "description": mat["description"],
                "embedding_text": mat.get("embedding_text", ""),
                "source_type": "curated_knowledge_base",
            },
        })

    vector_store.upsert_points(MATERIALS_COLLECTION, points)
    logger.info(f"Seeded {len(points)} materials into Qdrant.")
    return len(points)


def seed_food_profiles(vector_store, force: bool = False) -> int:
    """Seed food profiles into Qdrant. Returns count of seeded items."""
    from app.rag.vector_store import FOOD_PROFILES_COLLECTION
    from app.rag.embedder import embed_texts

    if not vector_store.available:
        logger.info("Qdrant not available — skipping food profile seeding.")
        return 0

    vector_store.create_collection_if_not_exists(FOOD_PROFILES_COLLECTION)

    data = _load_json(FOOD_PROFILES_FILE)
    profiles = data["food_profiles"]

    texts_to_embed = [p.get("embedding_text", p["commodity"]) for p in profiles]
    logger.info(f"Embedding {len(texts_to_embed)} food profile documents...")
    vectors = embed_texts(texts_to_embed)

    points = []
    for i, profile in enumerate(profiles):
        doc_id = f"food_profile_{profile['id']}"
        points.append({
            "id": _str_to_int_id(doc_id),
            "vector": vectors[i],
            "payload": {
                "doc_id": doc_id,
                "profile_id": profile["id"],
                "commodity": profile["commodity"],
                "category": profile["category"],
                "moisture_sensitivity": profile["moisture_sensitivity"],
                "oxygen_sensitivity": profile["oxygen_sensitivity"],
                "temperature_min": profile["temperature_min"],
                "temperature_max": profile["temperature_max"],
                "shelf_life_days": profile["shelf_life_days"],
                "source_type": "food_profile",
            },
        })

    vector_store.upsert_points(FOOD_PROFILES_COLLECTION, points)
    logger.info(f"Seeded {len(points)} food profiles into Qdrant.")
    return len(points)


async def run_seeding(force: bool = False):
    """Run the full KB seeding pipeline."""
    from app.rag.vector_store import get_vector_store
    vs = get_vector_store()

    if not vs.available:
        logger.info("Vector store unavailable. KB seeding skipped (demo mode).")
        return

    mat_count = seed_materials(vs, force=force)
    profile_count = seed_food_profiles(vs, force=force)
    logger.info(f"KB seeding complete: {mat_count} materials, {profile_count} food profiles.")
