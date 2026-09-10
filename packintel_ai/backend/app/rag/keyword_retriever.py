import json
import logging
import re
from pathlib import Path
from typing import List, Dict, Any, Optional

logger = logging.getLogger(__name__)

KB_DIR = Path(__file__).parent.parent / "knowledge_base"


def _load_corpus() -> List[Dict[str, Any]]:
    """Load all knowledge base documents into a flat corpus for BM25."""
    corpus = []

    # Load materials
    materials_path = KB_DIR / "materials_data.json"
    with open(materials_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    for mat in data["materials"]:
        # Main document
        corpus.append({
            "doc_id": f"material_{mat['id']}_main",
            "material_id": mat["id"],
            "material_name": mat["name"],
            "source": f"Knowledge Base: {mat['full_name']}",
            "source_type": "material_main",
            "content": (
                f"{mat['full_name']} ({mat['abbreviation']}). "
                f"{mat['description']} "
                f"Key properties: {', '.join(mat.get('key_properties', []))}. "
                f"Applications: {', '.join(mat.get('applications', []))}."
            ),
            "payload": {
                "material_id": mat["id"],
                "material_name": mat["name"],
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
            },
        })

        # Regulatory document
        if mat.get("regulatory"):
            corpus.append({
                "doc_id": f"material_{mat['id']}_regulatory",
                "material_id": mat["id"],
                "material_name": mat["name"],
                "source": f"Regulatory: {mat['full_name']}",
                "source_type": "material_regulatory",
                "content": mat["regulatory"],
                "payload": {
                    "material_id": mat["id"],
                    "material_name": mat["name"],
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
                },
            })

        # Sustainability document
        if mat.get("sustainability_notes"):
            corpus.append({
                "doc_id": f"material_{mat['id']}_sustainability",
                "material_id": mat["id"],
                "material_name": mat["name"],
                "source": f"Sustainability: {mat['full_name']}",
                "source_type": "material_sustainability",
                "content": mat["sustainability_notes"],
                "payload": {
                    "material_id": mat["id"],
                    "material_name": mat["name"],
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
                },
            })

        # Not suitable for document
        if mat.get("not_suitable_for"):
            corpus.append({
                "doc_id": f"material_{mat['id']}_limitations",
                "material_id": mat["id"],
                "material_name": mat["name"],
                "source": f"Limitations: {mat['full_name']}",
                "source_type": "material_limitations",
                "content": (
                    f"{mat['name']} is NOT suitable for: "
                    f"{', '.join(mat['not_suitable_for'])}."
                ),
                "payload": {
                    "material_id": mat["id"],
                    "material_name": mat["name"],
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
                },
            })

    # Load food profiles
    food_path = KB_DIR / "food_profiles.json"
    with open(food_path, "r", encoding="utf-8") as f:
        food_data = json.load(f)

    for profile in food_data["food_profiles"]:
        corpus.append({
            "doc_id": f"food_profile_{profile['id']}",
            "material_id": None,
            "material_name": None,
            "source": f"Food Profile: {profile['commodity']}",
            "source_type": "food_profile",
            "content": (
                f"{profile['commodity']} ({profile['category']}). "
                f"Moisture sensitivity: {profile['moisture_sensitivity']}/10. "
                f"Oxygen sensitivity: {profile['oxygen_sensitivity']}/10. "
                f"Temperature: {profile['temperature_min']}°C to {profile['temperature_max']}°C. "
                f"Shelf life: {profile['shelf_life_days']} days. "
                f"Special requirements: {profile.get('special_requirements', 'None')}."
            ),
            "payload": {
                "commodity": profile["commodity"],
                "category": profile["category"],
                "moisture_sensitivity": profile["moisture_sensitivity"],
                "oxygen_sensitivity": profile["oxygen_sensitivity"],
            },
        })

    return corpus


def _tokenize(text: str) -> List[str]:
    """Simple tokenizer: lowercase, split on non-alphanumeric."""
    text = text.lower()
    tokens = re.findall(r'\b[a-z][a-z0-9]*\b', text)
    stopwords = {
        'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
        'for', 'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were',
        'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will',
        'would', 'could', 'should', 'may', 'might', 'can', 'its', 'it',
        'this', 'that', 'these', 'those', 'as', 'not', 'also', 'such',
    }
    return [t for t in tokens if t not in stopwords and len(t) > 1]


class BM25Retriever:
    """BM25 keyword retriever over the materials knowledge base."""

    def __init__(self):
        self.corpus: List[Dict[str, Any]] = []
        self.bm25 = None
        self._initialized = False

    def initialize(self):
        if self._initialized:
            return
        try:
            from rank_bm25 import BM25Okapi
            self.corpus = _load_corpus()
            tokenized = [_tokenize(doc["content"]) for doc in self.corpus]
            self.bm25 = BM25Okapi(tokenized)
            self._initialized = True
            logger.info(f"BM25 index built with {len(self.corpus)} documents.")
        except ImportError:
            logger.warning("rank-bm25 not installed. BM25 retrieval disabled.")
            self.corpus = _load_corpus()
            self._initialized = True
        except Exception as e:
            logger.error(f"BM25 initialization failed: {e}")
            self.corpus = _load_corpus()
            self._initialized = True

    def retrieve(
        self,
        query: str,
        top_k: int = 20,
        material_filter: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Retrieve top-k documents by BM25 score."""
        if not self._initialized:
            self.initialize()

        if not self.corpus:
            return []

        results = []

        if self.bm25 is not None:
            tokens = _tokenize(query)
            if not tokens:
                return []
            scores = self.bm25.get_scores(tokens)

            scored = [
                (float(scores[i]), self.corpus[i])
                for i in range(len(self.corpus))
            ]
            scored.sort(key=lambda x: x[0], reverse=True)

            for score, doc in scored[:top_k]:
                if score <= 0:
                    continue
                if material_filter and doc.get("material_id") != material_filter:
                    continue
                results.append({
                    "doc_id": doc["doc_id"],
                    "score": score,
                    "content": doc["content"],
                    "source": doc["source"],
                    "source_type": doc["source_type"],
                    "material_id": doc.get("material_id"),
                    "material_name": doc.get("material_name"),
                    "payload": doc.get("payload", {}),
                })
        else:
            # Fallback: simple keyword matching
            query_tokens = set(_tokenize(query))
            for doc in self.corpus:
                doc_tokens = set(_tokenize(doc["content"]))
                overlap = len(query_tokens & doc_tokens)
                if overlap > 0:
                    results.append({
                        "doc_id": doc["doc_id"],
                        "score": float(overlap),
                        "content": doc["content"],
                        "source": doc["source"],
                        "source_type": doc["source_type"],
                        "material_id": doc.get("material_id"),
                        "material_name": doc.get("material_name"),
                        "payload": doc.get("payload", {}),
                    })
            results.sort(key=lambda x: x["score"], reverse=True)
            results = results[:top_k]

        return results

    def get_all_material_docs(self) -> List[Dict[str, Any]]:
        """Return all material corpus documents (for scoring engine)."""
        if not self._initialized:
            self.initialize()
        return [
            doc for doc in self.corpus
            if doc.get("source_type") == "material_main"
        ]


_bm25_retriever: Optional[BM25Retriever] = None


def get_bm25_retriever() -> BM25Retriever:
    global _bm25_retriever
    if _bm25_retriever is None:
        _bm25_retriever = BM25Retriever()
        _bm25_retriever.initialize()
    return _bm25_retriever
