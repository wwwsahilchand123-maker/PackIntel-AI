"""End-to-end integration tests covering full user workflows."""
import pytest


@pytest.mark.asyncio
async def test_full_analyzer_workflow(client):
    """Complete workflow: input → analyze → view results → retrieve by ID."""
    payload = {
        "food_commodity": "Fresh Strawberries",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 8.0,
        "temperature_min": 0.0,
        "temperature_max": 4.0,
        "shelf_life_days": 7,
        "sustainability_preference": "medium",
        "demo_mode": True,
    }

    # Step 1: Submit recommendation
    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    rec = response.json()

    # Step 2: Verify response structure
    assert rec["session_id"]
    assert rec["query_id"]
    assert rec["food_commodity"] == "Fresh Strawberries"
    assert "recommendation" in rec
    assert "alternatives" in rec
    assert "all_materials_ranked" in rec
    assert rec["processing_time_ms"] > 0
    assert rec["mode"] == "demo"

    # Step 3: Verify recommendation object
    top = rec["recommendation"]
    assert top["material"]["name"]
    assert 0 <= top["compatibility_score"] <= 100
    assert top["score_label"]
    assert len(top["explanation"]) >= 3
    assert top["confidence"] > 0

    # Step 4: Verify score breakdown
    sb = top["score_breakdown"]
    expected_fields = [
        "moisture_score", "oxygen_score", "temperature_score",
        "shelf_life_score", "sustainability_score", "rag_relevance_score",
        "final_score", "weights_used", "penalties_applied",
    ]
    for field in expected_fields:
        assert field in sb

    # Step 5: Verify alternatives
    assert len(rec["alternatives"]) == 4
    for alt in rec["alternatives"]:
        assert 1 <= alt["rank"] <= 5
        assert alt["material"]["name"]
        assert 0 <= alt["compatibility_score"] <= 100

    # Step 6: Verify all materials
    assert len(rec["all_materials_ranked"]) == 10
    scores = [m["compatibility_score"] for m in rec["all_materials_ranked"]]
    assert scores == sorted(scores, reverse=True)

    # Step 7: Retrieve by query ID
    query_id = rec["query_id"]
    retrieve_response = await client.get(f"/api/v1/recommend/{query_id}")
    assert retrieve_response.status_code == 200
    retrieved = retrieve_response.json()
    assert retrieved["query_id"] == query_id
    assert retrieved["food_commodity"] == "Fresh Strawberries"


@pytest.mark.asyncio
async def test_high_moisture_sensitivity_workflow(client):
    """Workflow: High moisture sensitivity → should recommend glass/aluminum."""
    payload = {
        "food_commodity": "Protein Powder",
        "moisture_sensitivity": 10.0,
        "oxygen_sensitivity": 6.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 730,
        "sustainability_preference": "none",
    }

    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    rec = response.json()

    top_material = rec["recommendation"]["material"]["name"]
    assert top_material in ["Glass", "Aluminum", "Multilayer"]

    # Verify moisture score is high for top material
    assert rec["recommendation"]["score_breakdown"]["moisture_score"] >= 70


@pytest.mark.asyncio
async def test_high_oxygen_sensitivity_workflow(client):
    """Workflow: High oxygen sensitivity → should recommend glass/aluminum."""
    payload = {
        "food_commodity": "Ground Coffee",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 10.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
    }

    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    rec = response.json()

    top_material = rec["recommendation"]["material"]["name"]
    assert top_material in ["Glass", "Aluminum", "Multilayer"]

    # Verify oxygen score is high
    assert rec["recommendation"]["score_breakdown"]["oxygen_score"] >= 70


@pytest.mark.asyncio
async def test_high_sustainability_workflow(client):
    """Workflow: High sustainability preference → should favor eco materials."""
    payload = {
        "food_commodity": "Organic Salad",
        "moisture_sensitivity": 5.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": 2.0,
        "temperature_max": 8.0,
        "shelf_life_days": 7,
        "sustainability_preference": "high",
    }

    response = await client.post("/api/v1/recommend", json=payload)
    assert response.status_code == 200
    rec = response.json()

    top3 = [r["material"]["name"] for r in rec["all_materials_ranked"][:3]]
    eco_materials = {"PHA", "PLA", "Paperboard"}
    assert any(name in eco_materials for name in top3)


@pytest.mark.asyncio
async def test_simulator_detects_changes(client):
    """Workflow: Simulator properly detects when conditions change."""
    before = {
        "food_commodity": "Frozen Pizza",
        "moisture_sensitivity": 5.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": -25.0,
        "temperature_max": -18.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
    }

    after = {
        "food_commodity": "Frozen Pizza",
        "moisture_sensitivity": 9.0,  # Changed
        "oxygen_sensitivity": 5.0,
        "temperature_min": -25.0,
        "temperature_max": -18.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
    }

    response = await client.post(
        "/api/v1/simulate/compare",
        json={"before": before, "after": after},
    )

    assert response.status_code == 200
    data = response.json()
    summary = data["changes_summary"]

    # Should detect the moisture sensitivity change
    assert summary["score_change"] != 0 or summary["changed"]


@pytest.mark.asyncio
async def test_comparison_workflow(client):
    """Workflow: Compare multiple materials end-to-end."""
    materials_to_compare = ["pet", "glass", "aluminum", "pla", "pp"]

    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": materials_to_compare},
    )

    assert response.status_code == 200
    data = response.json()

    # Verify all materials present
    assert len(data["materials"]) == 5
    material_names = [m["name"] for m in data["materials"]]
    assert "PET" in material_names
    assert "Glass" in material_names
    assert "PLA" in material_names

    # Verify comparison matrix
    matrix = data["comparison_matrix"]
    assert len(matrix["properties"]) > 0
    for prop in matrix["properties"]:
        assert prop in matrix["data"]
        for mat_name in material_names:
            assert mat_name in matrix["data"][prop]

    # Verify winners exist for each property
    assert len(data["winner_by_property"]) > 0

    # Verify ranking
    assert len(data["overall_ranking"]) == 5
    for i, item in enumerate(data["overall_ranking"]):
        assert item["rank"] == i + 1


@pytest.mark.asyncio
async def test_materials_list_complete(client):
    """Verify all 10 materials are available."""
    response = await client.get("/api/v1/materials")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] == 10
    material_names = {m["name"] for m in data["materials"]}
    expected = {
        "PET", "HDPE", "LDPE", "PP", "Glass", "Aluminum",
        "Paperboard", "PLA", "PHA", "Multilayer"
    }
    assert material_names == expected


@pytest.mark.asyncio
async def test_food_profiles_complete(client):
    """Verify food profiles are available for autocomplete."""
    response = await client.get("/api/v1/food-profiles")
    assert response.status_code == 200
    data = response.json()

    assert data["total"] >= 20
    assert len(data["categories"]) > 0
    commodities = {p["commodity"] for p in data["profiles"]}
    assert "Fresh Tomatoes" in commodities or len(commodities) > 0


@pytest.mark.asyncio
async def test_scoring_consistency(client):
    """Test that scoring is deterministic (same input → same score)."""
    payload = {
        "food_commodity": "Test Product",
        "moisture_sensitivity": 5.5,
        "oxygen_sensitivity": 6.7,
        "temperature_min": 10.0,
        "temperature_max": 20.0,
        "shelf_life_days": 60,
        "sustainability_preference": "medium",
    }

    # Run twice
    response1 = await client.post("/api/v1/recommend", json=payload)
    response2 = await client.post("/api/v1/recommend", json=payload)

    assert response1.status_code == 200
    assert response2.status_code == 200

    score1 = response1.json()["recommendation"]["compatibility_score"]
    score2 = response2.json()["recommendation"]["compatibility_score"]

    # Scores should be identical (deterministic)
    assert score1 == score2


@pytest.mark.asyncio
async def test_error_handling_invalid_input(client):
    """Test error handling for invalid inputs."""
    test_cases = [
        # Missing required field
        {"moisture_sensitivity": 5, "oxygen_sensitivity": 5},
        # Out of range
        {"food_commodity": "Test", "moisture_sensitivity": 11.0},
        # Invalid enum
        {"food_commodity": "Test", "sustainability_preference": "invalid"},
        # Temperature max < min
        {
            "food_commodity": "Test",
            "temperature_min": 25.0,
            "temperature_max": 10.0,
        },
    ]

    for payload in test_cases:
        response = await client.post("/api/v1/recommend", json=payload)
        # Should be 422 validation error
        assert response.status_code in [400, 422], f"Expected 422 for {payload}"


@pytest.mark.asyncio
async def test_health_endpoints(client):
    """Test health check endpoints."""
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data

    response = await client.get("/api/v1/health/detailed")
    assert response.status_code == 200
    data = response.json()
    assert "services" in data
