import pytest
from app.rag.keyword_retriever import BM25Retriever, _tokenize
from app.rag.hybrid_retriever import reciprocal_rank_fusion, HybridRetriever
from app.rag.scorer import (
    _moisture_score,
    _oxygen_score,
    _temperature_score,
    _shelf_life_score,
    _sustainability_score,
    score_all_materials,
    get_score_label,
)
from app.rag.explainer import generate_explanation, build_evidence_chunks
from app.rag.pipeline import get_rag_pipeline


# ─── Tokenizer ────────────────────────────────────────────────────────────────

def test_tokenize_basic():
    tokens = _tokenize("Moisture barrier packaging food")
    assert "moisture" in tokens
    assert "barrier" in tokens
    assert "packaging" in tokens


def test_tokenize_removes_stopwords():
    tokens = _tokenize("the food is in the packaging")
    assert "the" not in tokens
    assert "is" not in tokens
    assert "in" not in tokens


def test_tokenize_empty():
    tokens = _tokenize("")
    assert tokens == []


# ─── BM25 Retriever ───────────────────────────────────────────────────────────

def test_bm25_retriever_initializes():
    retriever = BM25Retriever()
    retriever.initialize()
    assert retriever._initialized is True
    assert len(retriever.corpus) > 0


def test_bm25_retriever_returns_results():
    retriever = BM25Retriever()
    retriever.initialize()
    results = retriever.retrieve("moisture barrier packaging", top_k=5)
    assert len(results) > 0
    assert "doc_id" in results[0]
    assert "score" in results[0]
    assert "content" in results[0]


def test_bm25_retriever_material_filter():
    retriever = BM25Retriever()
    retriever.initialize()
    results = retriever.retrieve("packaging", top_k=20, material_filter="pet")
    for r in results:
        assert r.get("material_id") == "pet"


def test_bm25_retriever_glass_query():
    retriever = BM25Retriever()
    retriever.initialize()
    results = retriever.retrieve("glass absolute barrier chemically inert", top_k=5)
    material_names = [r.get("material_name", "") for r in results]
    assert any("Glass" in name for name in material_names if name)


def test_bm25_retriever_empty_query():
    retriever = BM25Retriever()
    retriever.initialize()
    results = retriever.retrieve("", top_k=5)
    assert isinstance(results, list)


# ─── RRF Fusion ───────────────────────────────────────────────────────────────

def test_rrf_empty_input():
    result = reciprocal_rank_fusion([])
    assert result == []


def test_rrf_single_list():
    docs = [
        {"doc_id": "a", "content": "doc a", "score": 1.0},
        {"doc_id": "b", "content": "doc b", "score": 0.5},
    ]
    result = reciprocal_rank_fusion([docs])
    assert len(result) == 2
    assert result[0]["doc_id"] == "a"


def test_rrf_two_lists_deduplication():
    list1 = [
        {"doc_id": "a", "content": "a", "score": 1.0},
        {"doc_id": "b", "content": "b", "score": 0.8},
    ]
    list2 = [
        {"doc_id": "b", "content": "b", "score": 0.9},
        {"doc_id": "c", "content": "c", "score": 0.7},
    ]
    result = reciprocal_rank_fusion([list1, list2])
    doc_ids = [r["doc_id"] for r in result]
    assert len(doc_ids) == len(set(doc_ids))  # No duplicates
    assert len(result) == 3


def test_rrf_promotes_consensus():
    """Document appearing in both lists should rank higher."""
    list1 = [
        {"doc_id": "unique_a", "score": 1.0, "content": "a"},
        {"doc_id": "shared", "score": 0.9, "content": "s"},
    ]
    list2 = [
        {"doc_id": "unique_b", "score": 1.0, "content": "b"},
        {"doc_id": "shared", "score": 0.8, "content": "s"},
    ]
    result = reciprocal_rank_fusion([list1, list2])
    top_id = result[0]["doc_id"]
    assert top_id == "shared"


def test_rrf_with_weights():
    list1 = [{"doc_id": "a", "score": 1.0, "content": "a"}]
    list2 = [{"doc_id": "b", "score": 1.0, "content": "b"}]
    result = reciprocal_rank_fusion([list1, list2], weights=[2.0, 1.0])
    assert result[0]["doc_id"] == "a"


# ─── Scoring Functions ────────────────────────────────────────────────────────

def test_moisture_score_absolute_barrier():
    score = _moisture_score(0.0, 10.0)
    assert score == 100.0


def test_moisture_score_high_sensitivity_good_barrier():
    score = _moisture_score(0.5, 9.0)
    assert score >= 50.0


def test_moisture_score_poor_match():
    score = _moisture_score(50.0, 9.0)
    assert score < 30.0


def test_moisture_score_low_sensitivity():
    score = _moisture_score(20.0, 1.0)
    assert score >= 60.0


def test_oxygen_score_absolute_barrier():
    score = _oxygen_score(0.0, 10.0)
    assert score == 100.0


def test_oxygen_score_high_sensitivity_poor_barrier():
    score = _oxygen_score(300.0, 9.0)
    assert score == 0.0


def test_temperature_score_full_coverage():
    score, penalties = _temperature_score(-50, 150, 2, 25)
    assert score >= 70.0
    assert len(penalties) == 0


def test_temperature_score_no_coverage():
    score, penalties = _temperature_score(50, 100, -20, 25)
    assert score <= 30.0
    assert len(penalties) > 0


def test_temperature_score_max_exceeded():
    score, penalties = _temperature_score(-40, 70, 20, 150)
    assert score <= 60.0
    assert len(penalties) > 0


def test_shelf_life_score_exceeds():
    score = _shelf_life_score(730, 14)
    assert score == 100.0


def test_shelf_life_score_meets():
    score = _shelf_life_score(365, 365)
    assert 70.0 <= score <= 80.0


def test_shelf_life_score_insufficient():
    score = _shelf_life_score(7, 365)
    assert score < 10.0


def test_sustainability_score_high_preference():
    score = _sustainability_score(92.0, "high")
    assert score == 100.0  # Capped at 100


def test_sustainability_score_no_preference():
    score = _sustainability_score(50.0, "none")
    assert score == 25.0


def test_get_score_label():
    assert get_score_label(95) == "Excellent Match"
    assert get_score_label(80) == "Good Match"
    assert get_score_label(65) == "Acceptable"
    assert get_score_label(45) == "Suboptimal"
    assert get_score_label(20) == "Not Recommended"


# ─── Full Scoring Engine ──────────────────────────────────────────────────────

def test_score_all_materials_returns_10():
    food_props = {
        "moisture_sensitivity": 7,
        "oxygen_sensitivity": 6,
        "temperature_min": 2,
        "temperature_max": 8,
        "shelf_life_days": 14,
        "sustainability_preference": "medium",
    }
    results = score_all_materials(food_props, [])
    assert len(results) == 10


def test_score_all_materials_ranked():
    food_props = {
        "moisture_sensitivity": 5,
        "oxygen_sensitivity": 5,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 30,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    scores = [r["final_score"] for r in results]
    assert scores == sorted(scores, reverse=True)


def test_score_all_materials_ranks_sequential():
    food_props = {
        "moisture_sensitivity": 5,
        "oxygen_sensitivity": 5,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 30,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    for i, r in enumerate(results):
        assert r["rank"] == i + 1


def test_score_all_materials_high_oxygen_sensitivity():
    """High oxygen sensitivity should favor Glass or Aluminum."""
    food_props = {
        "moisture_sensitivity": 3,
        "oxygen_sensitivity": 10,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 730,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    top_material = results[0]["material"]["name"]
    assert top_material in ["Glass", "Aluminum", "Multilayer"]


def test_score_all_materials_high_sustainability():
    """High sustainability preference should favor PHA or PLA."""
    food_props = {
        "moisture_sensitivity": 4,
        "oxygen_sensitivity": 4,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 30,
        "sustainability_preference": "high",
    }
    results = score_all_materials(food_props, [])
    top3_names = [r["material"]["name"] for r in results[:3]]
    eco_materials = {"PHA", "PLA", "Paperboard"}
    assert any(name in eco_materials for name in top3_names)


def test_pla_penalty_high_temperature():
    """PLA should be penalized for high-temperature products."""
    food_props = {
        "moisture_sensitivity": 5,
        "oxygen_sensitivity": 5,
        "temperature_min": 80,
        "temperature_max": 120,
        "shelf_life_days": 30,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    pla_result = next(r for r in results if r["material"]["id"] == "pla")
    assert pla_result["final_score"] <= 25.0


def test_score_breakdown_has_all_fields():
    food_props = {
        "moisture_sensitivity": 5,
        "oxygen_sensitivity": 5,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 30,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    for r in results:
        sb = r["score_breakdown"]
        assert "moisture_score" in sb
        assert "oxygen_score" in sb
        assert "temperature_score" in sb
        assert "shelf_life_score" in sb
        assert "sustainability_score" in sb
        assert "rag_relevance_score" in sb
        assert "final_score" in sb
        assert "weights_used" in sb
        assert "penalties_applied" in sb


# ─── Explainer ────────────────────────────────────────────────────────────────

def test_generate_explanation_returns_blocks():
    food_props = {
        "moisture_sensitivity": 7,
        "oxygen_sensitivity": 6,
        "temperature_min": 2,
        "temperature_max": 8,
        "shelf_life_days": 14,
        "sustainability_preference": "medium",
    }
    results = score_all_materials(food_props, [])
    top = results[0]
    blocks = generate_explanation(
        food_commodity="Fresh Tomatoes",
        food_properties=food_props,
        top_material=top["material"],
        score_breakdown=top["score_breakdown"],
        rag_results=[],
    )
    assert len(blocks) >= 3
    block_types = [b["type"] for b in blocks]
    assert "primary" in block_types


def test_generate_explanation_has_required_fields():
    food_props = {
        "moisture_sensitivity": 5,
        "oxygen_sensitivity": 5,
        "temperature_min": 15,
        "temperature_max": 25,
        "shelf_life_days": 30,
        "sustainability_preference": "none",
    }
    results = score_all_materials(food_props, [])
    top = results[0]
    blocks = generate_explanation(
        "Potato Chips", food_props, top["material"], top["score_breakdown"], []
    )
    for block in blocks:
        assert "type" in block
        assert "heading" in block
        assert "content" in block
        assert "confidence" in block
        assert 0.0 <= block["confidence"] <= 1.0


def test_build_evidence_chunks():
    rag_results = [
        {
            "doc_id": "material_pet_main",
            "material_id": "pet",
            "material_name": "PET",
            "source": "KB: PET",
            "content": "PET is a widely used packaging material with good barrier properties.",
            "rrf_score": 0.9,
        },
        {
            "doc_id": "material_glass_main",
            "material_id": "glass",
            "material_name": "Glass",
            "source": "KB: Glass",
            "content": "Glass provides absolute barrier properties.",
            "rrf_score": 0.7,
        },
    ]
    evidence = build_evidence_chunks(rag_results, "pet", max_evidence=3)
    assert len(evidence) >= 1
    assert evidence[0]["material_referenced"] == "PET"


# ─── Full Pipeline ────────────────────────────────────────────────────────────

def test_pipeline_runs_demo_mode():
    pipeline = get_rag_pipeline()
    result = pipeline.run(
        food_commodity="Fresh Tomatoes",
        food_properties={
            "moisture_sensitivity": 7,
            "oxygen_sensitivity": 6,
            "temperature_min": 2,
            "temperature_max": 8,
            "shelf_life_days": 14,
            "sustainability_preference": "medium",
        },
        session_id="test-session-001",
        query_id="test-query-001",
    )

    assert "recommendation" in result
    assert "alternatives" in result
    assert "all_materials_ranked" in result
    assert "processing_time_ms" in result
    assert len(result["alternatives"]) == 4
    assert len(result["all_materials_ranked"]) == 10
    assert result["recommendation"]["compatibility_score"] > 0


def test_pipeline_recommendation_has_explanation():
    pipeline = get_rag_pipeline()
    result = pipeline.run(
        food_commodity="Ground Coffee",
        food_properties={
            "moisture_sensitivity": 9,
            "oxygen_sensitivity": 10,
            "temperature_min": 15,
            "temperature_max": 25,
            "shelf_life_days": 365,
            "sustainability_preference": "none",
        },
        session_id="test-session-002",
        query_id="test-query-002",
    )

    rec = result["recommendation"]
    assert len(rec["explanation"]) >= 3
    assert len(rec["evidence"]) >= 0
    assert rec["confidence"] > 0


def test_pipeline_high_oxygen_sensitivity():
    """Ground coffee / olive oil with very high oxygen sensitivity."""
    pipeline = get_rag_pipeline()
    result = pipeline.run(
        food_commodity="Olive Oil",
        food_properties={
            "moisture_sensitivity": 3,
            "oxygen_sensitivity": 10,
            "temperature_min": 15,
            "temperature_max": 25,
            "shelf_life_days": 730,
            "sustainability_preference": "none",
        },
        session_id="test-session-003",
        query_id="test-query-003",
    )
    top_name = result["recommendation"]["material"]["name"]
    assert top_name in ["Glass", "Aluminum", "Multilayer"]


def test_pipeline_returns_all_10_materials():
    pipeline = get_rag_pipeline()
    result = pipeline.run(
        food_commodity="Breakfast Cereal",
        food_properties={
            "moisture_sensitivity": 9,
            "oxygen_sensitivity": 4,
            "temperature_min": 15,
            "temperature_max": 25,
            "shelf_life_days": 365,
            "sustainability_preference": "medium",
        },
        session_id="test-session-004",
        query_id="test-query-004",
    )
    assert len(result["all_materials_ranked"]) == 10
