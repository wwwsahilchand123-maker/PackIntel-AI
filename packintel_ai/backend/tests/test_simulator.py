import pytest


@pytest.mark.asyncio
async def test_simulate_endpoint(client):
    payload = {
        "food_commodity": "Fresh Tomatoes",
        "moisture_sensitivity": 7.0,
        "oxygen_sensitivity": 6.0,
        "temperature_min": 2.0,
        "temperature_max": 8.0,
        "shelf_life_days": 14,
        "sustainability_preference": "medium",
    }
    response = await client.post("/api/v1/simulate", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "recommendation" in data
    assert "simulation_id" in data
    assert "processing_time_ms" in data


@pytest.mark.asyncio
async def test_simulate_compare_basic(client):
    before = {
        "food_commodity": "Ground Coffee",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 10.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 365,
        "sustainability_preference": "none",
    }
    after = {
        "food_commodity": "Ground Coffee",
        "moisture_sensitivity": 9.0,
        "oxygen_sensitivity": 10.0,
        "temperature_min": 15.0,
        "temperature_max": 25.0,
        "shelf_life_days": 730,  # Changed
        "sustainability_preference": "none",
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


@pytest.mark.asyncio
async def test_simulate_compare_structure(client):
    before = {
        "food_commodity": "Fresh Produce",
        "moisture_sensitivity": 5.0,
        "oxygen_sensitivity": 5.0,
        "temperature_min": 2.0,
        "temperature_max": 8.0,
        "shelf_life_days": 14,
        "sustainability_preference": "none",
    }
    after = {
        "food_commodity": "Fresh Produce",
        "moisture_sensitivity": 8.0,  # Increased
        "oxygen_sensitivity": 8.0,    # Increased
        "temperature_min": 2.0,
        "temperature_max": 8.0,
        "shelf_life_days": 30,        # Increased
        "sustainability_preference": "high",  # Changed
    }
    response = await client.post(
        "/api/v1/simulate/compare",
        json={"before": before, "after": after},
    )
    data = response.json()
    summary = data["changes_summary"]
    assert "previous_top_material" in summary
    assert "new_top_material" in summary
    assert "score_change" in summary
    assert "changed" in summary
    assert "summary" in summary


@pytest.mark.asyncio
async def test_simulate_compare_missing_before(client):
    response = await client.post(
        "/api/v1/simulate/compare",
        json={"after": {"food_commodity": "Test"}},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_simulate_compare_no_conditions(client):
    response = await client.post(
        "/api/v1/simulate/compare",
        json={"before": {}, "after": {}},
    )
    assert response.status_code in [400, 422]
