import pytest


@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "version" in data
    assert "demo_mode" in data


@pytest.mark.asyncio
async def test_health_detailed(client):
    response = await client.get("/api/v1/health/detailed")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert "services" in data


@pytest.mark.asyncio
async def test_root(client):
    response = await client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert "PackIntel AI" in data["app"]


@pytest.mark.asyncio
async def test_docs_available(client):
    response = await client.get("/api/docs")
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_openapi_schema(client):
    response = await client.get("/api/openapi.json")
    assert response.status_code == 200
    schema = response.json()
    assert schema["info"]["title"] == "PackIntel AI"
