import pytest


@pytest.mark.asyncio
async def test_list_materials(client):
    response = await client.get("/api/v1/materials")
    assert response.status_code == 200
    data = response.json()
    assert "materials" in data
    assert "total" in data
    assert data["total"] == 10
    names = [m["name"] for m in data["materials"]]
    assert "PET" in names
    assert "Glass" in names
    assert "PLA" in names


@pytest.mark.asyncio
async def test_list_materials_filter_by_category(client):
    response = await client.get("/api/v1/materials?category=plastic")
    assert response.status_code == 200
    data = response.json()
    for mat in data["materials"]:
        assert mat["category"] == "plastic"


@pytest.mark.asyncio
async def test_list_materials_sort(client):
    response = await client.get("/api/v1/materials?sort_by=eco_score&order=desc")
    assert response.status_code == 200
    data = response.json()
    scores = [m["eco_score"] for m in data["materials"]]
    assert scores == sorted(scores, reverse=True)


@pytest.mark.asyncio
async def test_get_material_by_id(client):
    response = await client.get("/api/v1/materials/pet")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "PET"
    assert data["category"] == "plastic"
    assert "applications" in data
    assert "regulatory" in data


@pytest.mark.asyncio
async def test_get_material_not_found(client):
    response = await client.get("/api/v1/materials/nonexistent_material")
    assert response.status_code == 404


@pytest.mark.asyncio
async def test_all_materials_have_required_fields(client):
    response = await client.get("/api/v1/materials")
    data = response.json()
    required_fields = [
        "id", "name", "category", "moisture_barrier", "oxygen_barrier",
        "temp_min_c", "temp_max_c", "shelf_life_days", "eco_score",
        "recyclable", "compostable", "food_safe", "cost_tier",
    ]
    for mat in data["materials"]:
        for field in required_fields:
            assert field in mat, f"Missing field '{field}' in material {mat.get('name')}"


@pytest.mark.asyncio
async def test_food_profiles(client):
    response = await client.get("/api/v1/food-profiles")
    assert response.status_code == 200
    data = response.json()
    assert "profiles" in data
    assert "categories" in data
    assert data["total"] >= 20


@pytest.mark.asyncio
async def test_food_profiles_search(client):
    response = await client.get("/api/v1/food-profiles?q=tomato")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    commodities = [p["commodity"].lower() for p in data["profiles"]]
    assert any("tomato" in c for c in commodities)


@pytest.mark.asyncio
async def test_food_profiles_search_no_results(client):
    response = await client.get("/api/v1/food-profiles?q=zzznoresult999")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 0
