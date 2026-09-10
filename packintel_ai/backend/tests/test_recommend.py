import pytest


VALID_PAYLOAD = {
    "food_commodity": "Fresh Tomatoes",
    "food_category": "fresh_produce",
    "moisture_sensitivity": 7.0,
    "oxygen_sensitivity": 6.0,
    "temperature_min": 2.0,
    "temperature_max": 8.0,
    "humidity_min": 85.0,
    "humidity_max": 95.0,
    "shelf_life_days": 14,
    "sustainability_preference": "medium",
    "special_requirements": "Ethylene sensitive",
    "demo_mode": True,
}


# ─── Input Validation ─────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommend_valid_payload(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "alternatives" in data
    assert "all_materials_ranked" in data


@pytest.mark.asyncio
async def test_recommend_missing_food_commodity(client):
    payload = {**VALID_PAYLOAD}
    del payload["food_commodity"]
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_food_commodity_too_short(client):
    payload = {**VALID_PAYLOAD, "food_commodity": "A"}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_moisture_out_of_range(client):
    payload = {**VALID_PAYLOAD, "moisture_sensitivity": 11.0}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_oxygen_out_of_range(client):
    payload = {**VALID_PAYLOAD, "oxygen_sensitivity": -1.0}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_temp_max_less_than_min(client):
    payload = {**VALID_PAYLOAD, "temperature_min": 30.0, "temperature_max": 10.0}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_shelf_life_zero(client):
    payload = {**VALID_PAYLOAD, "shelf_life_days": 0}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_shelf_life_too_large(client):
    payload = {**VALID_PAYLOAD, "shelf_life_days": 9999}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_special_requirements_too_long(client):
    payload = {**VALID_PAYLOAD, "special_requirements": "x" * 1001}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_invalid_sustainability(client):
    payload = {**VALID_PAYLOAD, "sustainability_preference": "extreme"}
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_recommend_optional_fields_absent(client):
    """Request without optional fields should still work."""
    payload = {
        "food_commodity": "Breakfast Cereal",
        "moisture_sensitivity": 8.0,
        "oxygen_sensitivity": 4.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200


# ─── Response Structure ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommend_response_has_session_id(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert "session_id" in data
    assert len(data["session_id"]) == 36  # UUID format


@pytest.mark.asyncio
async def test_recommend_response_has_query_id(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert "query_id" in data
    assert len(data["query_id"]) == 36


@pytest.mark.asyncio
async def test_recommend_response_food_commodity_matches(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert data["food_commodity"] == "Fresh Tomatoes"


@pytest.mark.asyncio
async def test_recommend_response_mode_is_demo(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert data["mode"] == "demo"


@pytest.mark.asyncio
async def test_recommend_response_processing_time_present(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert "processing_time_ms" in data
    assert data["processing_time_ms"] >= 0


# ─── Recommendation Object ────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_recommendation_has_material(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    assert "material" in rec
    mat = rec["material"]
    assert "name" in mat
    assert "category" in mat
    assert "eco_score" in mat


@pytest.mark.asyncio
async def test_recommendation_score_in_range(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    assert 0 <= rec["compatibility_score"] <= 100


@pytest.mark.asyncio
async def test_recommendation_has_score_label(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    valid_labels = [
        "Excellent Match", "Good Match", "Acceptable",
        "Suboptimal", "Not Recommended",
    ]
    assert rec["score_label"] in valid_labels


@pytest.mark.asyncio
async def test_recommendation_has_score_breakdown(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    sb = rec["score_breakdown"]
    required = [
        "moisture_score", "oxygen_score", "temperature_score",
        "shelf_life_score", "sustainability_score", "rag_relevance_score",
        "final_score", "weights_used", "penalties_applied",
    ]
    for field in required:
        assert field in sb, f"Missing score_breakdown field: {field}"


@pytest.mark.asyncio
async def test_recommendation_score_breakdown_values_in_range(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    sb = response.json()["recommendation"]["score_breakdown"]
    for field in [
        "moisture_score", "oxygen_score", "temperature_score",
        "shelf_life_score", "sustainability_score", "rag_relevance_score",
    ]:
        assert 0 <= sb[field] <= 100, f"{field} out of range: {sb[field]}"


@pytest.mark.asyncio
async def test_recommendation_has_explanation(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    assert "explanation" in rec
    assert len(rec["explanation"]) >= 3
    for block in rec["explanation"]:
        assert "type" in block
        assert "heading" in block
        assert "content" in block
        assert "confidence" in block


@pytest.mark.asyncio
async def test_recommendation_has_evidence(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    assert "evidence" in rec
    assert isinstance(rec["evidence"], list)


@pytest.mark.asyncio
async def test_recommendation_confidence_in_range(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    rec = response.json()["recommendation"]
    assert 0.0 <= rec["confidence"] <= 1.0


# ─── Alternatives ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_alternatives_count(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert len(data["alternatives"]) == 4


@pytest.mark.asyncio
async def test_alternatives_are_ranked(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    alts = response.json()["alternatives"]
    scores = [a["compatibility_score"] for a in alts]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_alternatives_ranks_sequential(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    alts = response.json()["alternatives"]
    for i, alt in enumerate(alts):
        assert alt["rank"] == i + 2  # Ranks 2,3,4,5


@pytest.mark.asyncio
async def test_all_materials_ranked_count(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    assert len(data["all_materials_ranked"]) == 10


@pytest.mark.asyncio
async def test_all_materials_ranked_descending(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    ranked = response.json()["all_materials_ranked"]
    scores = [r["compatibility_score"] for r in ranked]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_top_recommendation_is_rank_1(client):
    response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    data = response.json()
    top_name = data["recommendation"]["material"]["name"]
    rank1_name = data["all_materials_ranked"][0]["material"]["name"]
    assert top_name == rank1_name


# ─── Domain Logic Tests ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_high_oxygen_sensitivity_favors_glass_or_aluminum(client):
    """Olive oil: extreme oxygen sensitivity."""
    payload = {
        "food_commodity": "Olive Oil",
        "moisture_sensitivity": 3.0,
        "oxygen_sensitivity": 10.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 730,
        "sustainability_preference": "none",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/recommend", json=payload)
    top_name = response.json()["recommendation"]["material"]["name"]
    assert top_name in ["Glass", "Aluminum", "Multilayer"]


@pytest.mark.asyncio
async def test_high_sustainability_preference_favors_bio(client):
    """Sustainable product: favor PHA/PLA/Paperboard."""
    payload = {
        "food_commodity": "Organic Salad",
        "moisture_sensitivity": 5.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": 2.0,
        "temperature_max": 8.0,
        "shelf_life_days": 7,
        "sustainability_preference": "high",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/recommend", json=payload)
    top3 = [
        r["material"]["name"]
        for r in response.json()["all_materials_ranked"][:3]
    ]
    eco_materials = {"PHA", "PLA", "Paperboard"}
    assert any(n in eco_materials for n in top3)


@pytest.mark.asyncio
async def test_frozen_food_excludes_pla(client):
    """Frozen pizza: PLA should be penalized."""
    payload = {
        "food_commodity": "Frozen Pizza",
        "moisture_sensitivity": 6.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": -25.0,
        "temperature_max": -18.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/recommend", json=payload)
    ranked = response.json()["all_materials_ranked"]
    pla_result = next(r for r in ranked if r["material"]["name"] == "PLA")
    assert pla_result["rank"] >= 7  # PLA should be near bottom


@pytest.mark.asyncio
async def test_dry_goods_favors_moisture_barrier(client):
    """Protein powder: extreme moisture sensitivity."""
    payload = {
        "food_commodity": "Whey Protein Powder",
        "moisture_sensitivity": 10.0,
        "oxygen_sensitivity": 6.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 730,
        "sustainability_preference": "none",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/recommend", json=payload)
    top_name = response.json()["recommendation"]["material"]["name"]
    # Glass, Aluminum, or Multilayer should dominate for extreme moisture
    assert top_name in ["Glass", "Aluminum", "Multilayer", "HDPE"]


# ─── Retrieval by ID ──────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_recommendation_by_id(client):
    """Save a recommendation then retrieve it by ID."""
    post_response = await client.post("/api/v1/recommend", json=VALID_PAYLOAD)
    assert post_response.status_code == 200
    query_id = post_response.json()["query_id"]

    get_response = await client.get(f"/api/v1/recommend/{query_id}")
    assert get_response.status_code == 200
    data = get_response.json()
    assert data["query_id"] == query_id


@pytest.mark.asyncio
async def test_get_recommendation_not_found(client):
    response = await client.get("/api/v1/recommend/nonexistent-query-id")
    assert response.status_code == 404


# ─── Simulator ────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_simulate_endpoint(client):
    payload = {
        "food_commodity": "Breakfast Cereal",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 4.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
        "demo_mode": True,
    }
    response = await client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "simulation_id" in data


@pytest.mark.asyncio
async def test_simulate_compare_endpoint(client):
    before = {
        "food_commodity": "Fresh Tomatoes",
        "moisture_sensitivity": 5.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": 10.0,
        "temperature_max": 20.0,
        "shelf_life_days": 14,
        "sustainability_preference": "none",
    }
    after = {
        "food_commodity": "Fresh Tomatoes",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 9.0,
        "temperature_min": 10.0,
        "temperature_max": 20.0,
        "shelf_life_days": 365,
        "sustainability_preference": "high",
    }
    response = await client.post(
        "/api/v1/simulate/compare",
        json={"before": before, "after": after},
    )
    assert response.status_code == 200
    data = response.json()
    assert "before_results" in data
    assert "after_results" in data
    assert "changes_summary" in data


# ─── Compare ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_compare_two_materials(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "glass"], "demo_mode": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert "comparison_id" in data
    assert "radar_data" in data
    assert "winner_by_property" in data
    assert len(data["materials"]) == 2


@pytest.mark.asyncio
async def test_compare_five_materials(client):
    response = await client.post(
        "/api/v1/compare",
        json={
            "material_ids": ["pet", "glass", "aluminum", "pla", "pha"],
            "demo_mode": True,
        },
    )
    assert response.status_code == 200
    assert len(response.json()["materials"]) == 5


@pytest.mark.asyncio
async def test_compare_invalid_material(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "nonexistent_material"]},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_compare_single_material_rejected(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet"]},
    )
    assert response.status_code == 422
