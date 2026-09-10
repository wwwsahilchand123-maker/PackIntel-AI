import pytest


@pytest.mark.asyncio
async def test_compare_two_materials(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "glass"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert "comparison_id" in data
    assert "materials" in data
    assert len(data["materials"]) == 2
    assert "comparison_matrix" in data
    assert "radar_data" in data
    assert "winner_by_property" in data
    assert "overall_ranking" in data


@pytest.mark.asyncio
async def test_compare_five_materials(client):
    response = await client.post(
        "/api/v1/compare",
        json={
            "material_ids": ["pet", "hdpe", "glass", "aluminum", "pla"],
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["materials"]) == 5


@pytest.mark.asyncio
async def test_compare_invalid_material(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "invalid_material_xyz"]},
    )
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_compare_single_material_rejected(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet"]},
    )
    assert response.status_code == 422


@pytest.mark.asyncio
async def test_compare_too_many_materials(client):
    response = await client.post(
        "/api/v1/compare",
        json={
            "material_ids": ["pet", "hdpe", "ldpe", "pp", "glass", "aluminum"],
        },
    )
    assert response.status_code in [400, 422]


@pytest.mark.asyncio
async def test_compare_matrix_structure(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "glass", "aluminum"]},
    )
    data = response.json()
    matrix = data["comparison_matrix"]
    assert "properties" in matrix
    assert "data" in matrix
    assert isinstance(matrix["properties"], list)
    assert isinstance(matrix["data"], dict)


@pytest.mark.asyncio
async def test_compare_radar_data(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "glass"]},
    )
    data = response.json()
    radar = data["radar_data"]
    assert len(radar) > 0
    for point in radar:
        assert "property" in point
        assert "values" in point
        assert "raw_values" in point
        assert "unit" in point


@pytest.mark.asyncio
async def test_compare_winner_by_property(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "glass", "aluminum"]},
    )
    data = response.json()
    winners = data["winner_by_property"]
    assert isinstance(winners, dict)
    assert len(winners) > 0


@pytest.mark.asyncio
async def test_compare_overall_ranking(client):
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["pet", "hdpe", "pp"]},
    )
    data = response.json()
    ranking = data["overall_ranking"]
    assert len(ranking) == 3
    for i, item in enumerate(ranking):
        assert item["rank"] == i + 1
        assert "material_name" in item
        assert "overall_score" in item
        assert 0 <= item["overall_score"] <= 100


@pytest.mark.asyncio
async def test_compare_case_insensitive(client):
    """Test that material IDs are case-insensitive."""
    response = await client.post(
        "/api/v1/compare",
        json={"material_ids": ["PET", "GLASS"]},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data["materials"]) == 2
